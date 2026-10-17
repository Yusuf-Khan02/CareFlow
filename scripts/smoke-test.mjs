#!/usr/bin/env node
/**
 * CareFlow Automated Production & Deployment Smoke Test Suite
 * Usage: node scripts/smoke-test.mjs [API_BASE_URL] [FRONTEND_URL]
 * Defaults: API=http://localhost:5000, FRONTEND=http://localhost:5173
 */

const API_BASE = process.argv[2] || process.env.API_BASE_URL || "http://localhost:5000";
const FRONTEND_BASE = process.argv[3] || process.env.FRONTEND_URL || "http://localhost:5173";

console.log("==========================================================");
console.log(" 🏥 CareFlow Production Smoke Test Suite");
console.log(` Target API:      ${API_BASE}`);
console.log(` Target Frontend: ${FRONTEND_BASE}`);
console.log("==========================================================\n");

let passed = 0;
let failed = 0;

async function runCheck(name, testFn) {
  process.stdout.write(`[*] Testing: ${name}... `);
  try {
    const startTime = Date.now();
    await testFn();
    const elapsed = Date.now() - startTime;
    console.log(`\x1b[32mPASS\x1b[0m (${elapsed}ms)`);
    passed++;
  } catch (err) {
    console.log(`\x1b[31mFAIL\x1b[0m`);
    console.error(`    ↳ Error: ${err.message}`);
    failed++;
  }
}

async function main() {
  let authToken = null;

  // 1. Backend Health Check
  await runCheck("Backend Operational Health & Latency (/api/v1/health)", async () => {
    const res = await fetch(`${API_BASE}/api/v1/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const json = await res.json();
    const payload = json.data || json;
    if (payload.status !== "healthy" && payload.status !== "UP") {
      throw new Error(`Health status reported as ${payload.status}`);
    }
    if (!payload.database || payload.database.status !== "connected") {
      throw new Error(`Database is not connected: ${JSON.stringify(payload.database)}`);
    }
  });

  // 2. Multi-Tenant Facilities API
  await runCheck("Public Organization Discovery (/api/v1/organizations)", async () => {
    const res = await fetch(`${API_BASE}/api/v1/organizations`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const orgs = json.data || json;
    if (!Array.isArray(orgs) || orgs.length === 0) {
      throw new Error("No organizations found in database");
    }
  });

  // 3. User Authentication & JWT Issuance
  await runCheck("Hospital Admin Authentication (/api/v1/auth/login)", async () => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@careflow.demo",
        password: "CareFlow@2026",
      }),
    });
    if (!res.ok) throw new Error(`Login failed with HTTP ${res.status}`);
    const json = await res.json();
    authToken = json.data?.token || json.token;
    if (!authToken) throw new Error("No JWT token returned in auth payload");
  });

  // 4. Authenticated Patient Roster with Multi-Tenant Header
  await runCheck("Tenant-Scoped Patient Records (/api/v1/patients)", async () => {
    const res = await fetch(`${API_BASE}/api/v1/patients`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-organization-id": "org-careflow-central",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json.data) ? json.data : (json.data?.patients || json.patients);
    if (!Array.isArray(list)) throw new Error("Patients array not returned");
  });

  // 5. Inpatient Beds & Wards API
  await runCheck("Inpatient Bed Directory & Census (/api/v1/beds)", async () => {
    const res = await fetch(`${API_BASE}/api/v1/beds`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-organization-id": "org-careflow-central",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const beds = Array.isArray(json.data) ? json.data : (json.data?.beds || json.beds);
    if (!Array.isArray(beds)) throw new Error("Beds array not returned");
  });

  // 6. Private File Storage Vault Metrics
  await runCheck("Secure Document Storage Vault Metrics (/api/v1/files/metrics)", async () => {
    const res = await fetch(`${API_BASE}/api/v1/files/metrics`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-organization-id": "org-careflow-central",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data?.totalFiles === undefined && json.totalFiles === undefined) {
      throw new Error("File storage metrics missing totalFiles");
    }
  });

  // 7. Background Jobs Telemetry
  await runCheck("Background Jobs & Real-Time Telemetry (/api/v1/jobs)", async () => {
    const res = await fetch(`${API_BASE}/api/v1/jobs`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-organization-id": "org-careflow-central",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success && json.success !== undefined) throw new Error("Jobs API unsuccessful");
  });

  // 8. Frontend Web Server Status
  await runCheck("Frontend Web Client HTML Document", async () => {
    const res = await fetch(FRONTEND_BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const html = await res.text();
    if (!html.includes("CareFlow") && !html.includes("root")) {
      throw new Error("Frontend root document does not contain CareFlow mount target");
    }
  });

  console.log("\n==========================================================");
  console.log(` Summary: \x1b[32m${passed} Passed\x1b[0m, \x1b[${failed > 0 ? "31" : "32"}m${failed} Failed\x1b[0m`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal smoke test execution error:", err);
  process.exit(1);
});
