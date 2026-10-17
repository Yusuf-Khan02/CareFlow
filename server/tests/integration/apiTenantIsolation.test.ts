import http from "node:http";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import createApp from "../../src/app.js";

describe("API Integration & Multi-Tenant Partition Isolation", () => {
  let serverInstance: http.Server | null = null;
  let BASE_URL = process.env.TEST_API_URL || "http://127.0.0.1:5000/api/v1";
  let authToken = "";

  before(async () => {
    // If an external server is already running, use it; otherwise start an ephemeral test server
    let externalRunning = false;
    try {
      const ping = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(500) });
      if (ping.ok) externalRunning = true;
    } catch {
      externalRunning = false;
    }

    if (!externalRunning) {
      const app = createApp();
      serverInstance = http.createServer(app);
      await new Promise<void>((resolve) => {
        serverInstance!.listen(0, "127.0.0.1", () => {
          const addr = serverInstance!.address() as any;
          BASE_URL = `http://127.0.0.1:${addr.port}/api/v1`;
          resolve();
        });
      });
    }

    // Authenticate as Central Hospital Admin
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@careflow.demo",
        password: "CareFlow@2026",
      }),
    });

    assert.equal(res.status, 200, "Admin login must succeed with 200 OK");
    const json = await res.json();
    assert.ok(json.success);
    assert.ok(json.data.token);
    authToken = json.data.token;
  });

  after(async () => {
    if (serverInstance) {
      await new Promise<void>((resolve) => serverInstance!.close(() => resolve()));
    }
  });

  it("should return healthy status and database latency from /health", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const json = await res.json();

    assert.equal(json.data.status, "healthy");
    assert.ok(typeof json.data.database?.latencyMs === "number");
    assert.ok(json.data.uptimeSeconds >= 0);
  });

  it("should reject login attempts with invalid credentials (401 Unauthorized)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@careflow.demo",
        password: "WrongPassword@999",
      }),
    });

    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
  });

  it("should enforce tenant partition isolation between Central Hospital and West Metro", async () => {
    // 1. Fetch files for Central Hospital
    const centralRes = await fetch(`${BASE_URL}/files`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-organization-id": "org-careflow-central",
      },
    });
    assert.equal(centralRes.status, 200);
    const centralJson = await centralRes.json();
    const centralFiles = centralJson.data || [];

    // All central files must have organizationId === 'org-careflow-central'
    for (const f of centralFiles) {
      assert.equal(f.organizationId, "org-careflow-central");
    }

    // 2. Fetch files for West Metro Pavilion
    const westRes = await fetch(`${BASE_URL}/files`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-organization-id": "org-careflow-west",
      },
    });
    assert.equal(westRes.status, 200);
    const westJson = await westRes.json();
    const westFiles = westJson.data || [];

    // All west files must have organizationId === 'org-careflow-west'
    for (const f of westFiles) {
      assert.equal(f.organizationId, "org-careflow-west");
    }

    // Zero cross-tenant bleeding
    const centralFileIds = new Set(centralFiles.map((f: any) => f.id));
    for (const f of westFiles) {
      assert.ok(
        !centralFileIds.has(f.id),
        `West Metro file #${f.id} must NOT be visible in Central Hospital catalog`
      );
    }
  });

  it("should issue cryptographically signed download tokens and permit streaming access without bearer headers", async () => {
    // Get file list
    const filesRes = await fetch(`${BASE_URL}/files`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-organization-id": "org-careflow-central",
      },
    });
    const filesJson = await filesRes.json();
    const targetFile = filesJson.data[0];
    assert.ok(targetFile, "At least one seeded file must exist");

    // Request signed token
    const signedRes = await fetch(`${BASE_URL}/files/${targetFile.id}/signed-url`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-organization-id": "org-careflow-central",
      },
    });
    assert.equal(signedRes.status, 200);
    const signedJson = await signedRes.json();
    const token = signedJson.data.token;
    assert.ok(token);

    // Stream download directly using URL token (no Authorization header required)
    const dlRes = await fetch(`${BASE_URL}/files/download/${token}`);
    assert.equal(dlRes.status, 200);
    assert.ok(dlRes.headers.get("content-type"));
    assert.ok(Number(dlRes.headers.get("content-length")) > 0);

    // Tampered token must fail
    const badToken = token.slice(0, -6) + "BADXXX";
    const failRes = await fetch(`${BASE_URL}/files/download/${badToken}`);
    assert.ok(failRes.status >= 400, "Tampered token must be rejected");
  });

  it("should return grounded database analytics from the operational assistant", async () => {
    const res = await fetch(`${BASE_URL}/ai/operational-assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-organization-id": "org-careflow-central",
      },
      body: JSON.stringify({
        query: "What is our current bed occupancy and ICU capacity?",
      }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.success);
    assert.ok(json.data.answer.includes("occupancy"));
    assert.ok(json.data.metrics.totalBeds > 0);
  });
});
