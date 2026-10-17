import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Queue Triage & Token Progression Logic", () => {
  const getDeptPrefix = (deptName?: string): string => {
    if (!deptName) return "A";
    const lower = deptName.toLowerCase();
    if (lower.includes("cardio")) return "CA";
    if (lower.includes("neuro")) return "NE";
    if (lower.includes("ortho")) return "OR";
    if (lower.includes("pediatric")) return "PE";
    if (lower.includes("gastro")) return "GA";
    if (lower.includes("general") || lower.includes("physician")) return "GP";
    return deptName.substring(0, 2).toUpperCase();
  };

  const priorityWeight = (p: string): number => {
    switch (p) {
      case "Emergency":
        return 3;
      case "Urgent":
        return 2;
      case "Normal":
      default:
        return 1;
    }
  };

  it("should generate correct department prefixes for hospital wards and clinics", () => {
    assert.equal(getDeptPrefix("Cardiology Department"), "CA");
    assert.equal(getDeptPrefix("Neurology Clinic"), "NE");
    assert.equal(getDeptPrefix("Orthopedics Surgery"), "OR");
    assert.equal(getDeptPrefix("Pediatric Care Unit"), "PE");
    assert.equal(getDeptPrefix("Gastroenterology"), "GA");
    assert.equal(getDeptPrefix("General Physician"), "GP");
    assert.equal(getDeptPrefix("Dermatology"), "DE");
    assert.equal(getDeptPrefix(undefined), "A");
  });

  it("should prioritize Emergency and Urgent patients ahead of Normal triage in waiting queue", () => {
    const queue = [
      { id: "tok-1", tokenNumber: "GP-001", priority: "Normal", createdAt: 100 },
      { id: "tok-2", tokenNumber: "GP-002", priority: "Normal", createdAt: 200 },
      { id: "tok-3", tokenNumber: "GP-003", priority: "Urgent", createdAt: 300 },
      { id: "tok-4", tokenNumber: "GP-004", priority: "Emergency", createdAt: 400 },
      { id: "tok-5", tokenNumber: "GP-005", priority: "Urgent", createdAt: 150 },
    ];

    const sorted = [...queue].sort((a, b) => {
      const pDiff = priorityWeight(b.priority) - priorityWeight(a.priority);
      if (pDiff !== 0) return pDiff;
      return a.createdAt - b.createdAt;
    });

    assert.equal(sorted[0].tokenNumber, "GP-004", "Emergency token should be called first");
    assert.equal(sorted[1].tokenNumber, "GP-005", "Earlier Urgent token should be called second");
    assert.equal(sorted[2].tokenNumber, "GP-003", "Later Urgent token should be called third");
    assert.equal(sorted[3].tokenNumber, "GP-001", "Earliest Normal token should be called fourth");
    assert.equal(sorted[4].tokenNumber, "GP-002", "Later Normal token should be called last");
  });

  it("should accurately estimate wait times based on position in queue", () => {
    const calculateWaitMinutes = (status: string, indexInWaiting: number): number => {
      if (status === "Waiting" && indexInWaiting >= 0) {
        return (indexInWaiting + 1) * 12;
      }
      return 0;
    };

    assert.equal(calculateWaitMinutes("Waiting", 0), 12, "Next patient waits 12 mins");
    assert.equal(calculateWaitMinutes("Waiting", 1), 24, "Second patient waits 24 mins");
    assert.equal(calculateWaitMinutes("Waiting", 4), 60, "Fifth patient waits 60 mins");
    assert.equal(calculateWaitMinutes("In-Consultation", 0), 0, "Patient currently being seen waits 0 mins");
    assert.equal(calculateWaitMinutes("Completed", -1), 0);
  });

  it("should validate legal status transitions in token lifecycle", () => {
    const validTransitions: Record<string, string[]> = {
      Waiting: ["Called", "Skipped", "Cancelled"],
      Called: ["In-Consultation", "Skipped", "Waiting"],
      "In-Consultation": ["Completed", "Skipped"],
      Skipped: ["Waiting", "Cancelled"],
      Completed: [],
      Cancelled: [],
    };

    const isValidTransition = (from: string, to: string) => {
      return (validTransitions[from] || []).includes(to);
    };

    assert.ok(isValidTransition("Waiting", "Called"));
    assert.ok(isValidTransition("Called", "In-Consultation"));
    assert.ok(isValidTransition("In-Consultation", "Completed"));
    assert.ok(isValidTransition("Waiting", "Skipped"));
    assert.ok(isValidTransition("Skipped", "Waiting"), "Can recall skipped token");

    // Illegal transitions
    assert.ok(!isValidTransition("Completed", "Waiting"), "Completed tokens cannot be reopened");
    assert.ok(!isValidTransition("Cancelled", "In-Consultation"), "Cancelled token cannot enter consultation");
    assert.ok(!isValidTransition("Waiting", "Completed"), "Must be called before completed");
  });
});
