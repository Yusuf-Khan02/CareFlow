import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aiService } from "../../src/modules/ai/aiService.js";

describe("AI HIPAA PHI De-Identification & Clinical Decision Support", () => {
  it("should redact telephone numbers formatted with hyphens, dots, or spaces", () => {
    const raw = "Patient contact callback is 555-019-8234 or alt line 123.456.7890 or 987 654 3210.";
    const cleaned = aiService.deIdentify(raw);

    assert.ok(!cleaned.includes("555-019-8234"));
    assert.ok(!cleaned.includes("123.456.7890"));
    assert.ok(!cleaned.includes("987 654 3210"));
    assert.equal(
      cleaned,
      "Patient contact callback is [PHONE_REDACTED] or alt line [PHONE_REDACTED] or [PHONE_REDACTED]."
    );
  });

  it("should redact email addresses across different domains", () => {
    const raw = "Send discharge records to patient.john@hospital.org and spouse-jane_doe@gmail.com.";
    const cleaned = aiService.deIdentify(raw);

    assert.ok(!cleaned.includes("patient.john@hospital.org"));
    assert.ok(!cleaned.includes("spouse-jane_doe@gmail.com"));
    assert.equal(
      cleaned,
      "Send discharge records to [EMAIL_REDACTED] and [EMAIL_REDACTED]."
    );
  });

  it("should redact Medical Record Numbers (MRNs)", () => {
    const raw = "Patient admitted under record CF-2026-0012 with previous chart CF-2025-089.";
    const cleaned = aiService.deIdentify(raw);

    assert.ok(!cleaned.includes("CF-2026-0012"));
    assert.ok(!cleaned.includes("CF-2025-089"));
    assert.equal(
      cleaned,
      "Patient admitted under record [MRN_REDACTED] with previous chart [MRN_REDACTED]."
    );
  });

  it("should redact physical residential street addresses", () => {
    const raw = "Home address listed as 742 Evergreen Terrace, alternate residence 104 Main Street or 15 Lincoln Ave.";
    const cleaned = aiService.deIdentify(raw);

    assert.ok(!cleaned.includes("104 Main Street"));
    assert.ok(!cleaned.includes("15 Lincoln Ave"));
    assert.ok(cleaned.includes("[ADDRESS_REDACTED]"));
  });

  it("should preserve clinical symptoms, anatomical locations, and diagnostic phrases", () => {
    const raw = "Patient presents with acute substernal chest pressure radiating to left arm and diaphoresis.";
    const cleaned = aiService.deIdentify(raw);

    assert.equal(cleaned, raw, "Pure clinical vocabulary must remain intact for diagnosis");
  });

  it("should enforce the mandatory clinical disclaimer on all synthesized outputs", async () => {
    const result = await aiService.summarizeEncounter({
      chiefComplaint: "Severe migraine and photophobia",
      clinicalNotes: "Patient reports pulsating unilateral headache for 12 hours.",
      diagnosis: "Migraine without aura",
      vitals: { bloodPressure: "120/80", heartRate: 74, spO2: 99 },
    });

    assert.ok(result.disclaimer, "Disclaimer field must exist");
    assert.match(result.disclaimer, /AI-generated clinical draft/i);
    assert.match(result.disclaimer, /licensed medical practitioner/i);
    assert.equal(result.isAiGenerated, true);
    assert.equal(result.reviewStatus, "PENDING_PHYSICIAN_VERIFICATION");
  });
});
