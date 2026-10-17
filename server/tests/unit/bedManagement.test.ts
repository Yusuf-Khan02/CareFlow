import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Inpatient Bed Management & Ward Occupancy Logic", () => {
  interface Bed {
    id: string;
    bedNumber: string;
    wardId: string;
    status: "Available" | "Occupied" | "Reserved" | "Maintenance" | "Cleaning";
  }

  it("should accurately calculate ward occupancy percentage and available bed counts", () => {
    const beds: Bed[] = [
      { id: "b1", bedNumber: "ICU-01", wardId: "w-icu", status: "Occupied" },
      { id: "b2", bedNumber: "ICU-02", wardId: "w-icu", status: "Occupied" },
      { id: "b3", bedNumber: "ICU-03", wardId: "w-icu", status: "Available" },
      { id: "b4", bedNumber: "ICU-04", wardId: "w-icu", status: "Cleaning" },
    ];

    const calculateOccupancy = (allBeds: Bed[]) => {
      const total = allBeds.length;
      const occupied = allBeds.filter((b) => b.status === "Occupied").length;
      const available = allBeds.filter((b) => b.status === "Available").length;
      const cleaning = allBeds.filter((b) => b.status === "Cleaning").length;
      const maintenance = allBeds.filter((b) => b.status === "Maintenance").length;
      const occupancyRate = total > 0 ? Math.round((occupied / total) * 1000) / 10 : 0;

      return { total, occupied, available, cleaning, maintenance, occupancyRate };
    };

    const stats = calculateOccupancy(beds);
    assert.equal(stats.total, 4);
    assert.equal(stats.occupied, 2);
    assert.equal(stats.available, 1);
    assert.equal(stats.cleaning, 1);
    assert.equal(stats.occupancyRate, 50.0);
  });

  it("should prevent admission to beds that are not in Available status", () => {
    const validateBedForAdmission = (bed: Bed) => {
      if (bed.status !== "Available") {
        throw new Error(
          `Cannot admit patient to Bed ${bed.bedNumber}. Current status is '${bed.status}'. Bed must be 'Available'.`
        );
      }
      return true;
    };

    assert.ok(
      validateBedForAdmission({ id: "b1", bedNumber: "GEN-01", wardId: "w1", status: "Available" })
    );

    assert.throws(() => {
      validateBedForAdmission({ id: "b2", bedNumber: "GEN-02", wardId: "w1", status: "Occupied" });
    }, /Current status is 'Occupied'/);

    assert.throws(() => {
      validateBedForAdmission({ id: "b3", bedNumber: "GEN-03", wardId: "w1", status: "Cleaning" });
    }, /Current status is 'Cleaning'/);

    assert.throws(() => {
      validateBedForAdmission({ id: "b4", bedNumber: "GEN-04", wardId: "w1", status: "Maintenance" });
    }, /Current status is 'Maintenance'/);
  });

  it("should apply terminal disinfection protocol on patient discharge and transfer", () => {
    const handleDischarge = (bed: Bed) => {
      // Terminal disinfection protocol: bed transitions to Cleaning, not Available
      return {
        ...bed,
        status: "Cleaning" as const,
      };
    };

    const handleSanitizationComplete = (bed: Bed) => {
      if (bed.status !== "Cleaning") {
        throw new Error("Only beds in 'Cleaning' status can be cleared to 'Available'");
      }
      return {
        ...bed,
        status: "Available" as const,
      };
    };

    const initialBed: Bed = { id: "b1", bedNumber: "ICU-01", wardId: "w-icu", status: "Occupied" };

    // Discharge
    const cleanedBed = handleDischarge(initialBed);
    assert.equal(cleanedBed.status, "Cleaning", "Source bed must be placed in Cleaning status after discharge");

    // Environmental services clearance
    const readyBed = handleSanitizationComplete(cleanedBed);
    assert.equal(readyBed.status, "Available", "Bed is now Available for next inpatient admission");
  });
});
