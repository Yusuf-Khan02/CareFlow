import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Pharmacy FEFO Inventory Allocation & Low-Stock Alerts", () => {
  interface Batch {
    id: string;
    batchNumber: string;
    expiryDate: string;
    quantityRemaining: number;
    status: "Active" | "Depleted" | "Expired";
  }

  const allocateFefo = (batches: Batch[], requestedQuantity: number) => {
    const totalAvailable = batches.reduce((acc, b) => acc + b.quantityRemaining, 0);
    if (requestedQuantity > totalAvailable) {
      throw new Error(`Insufficient stock. Available: ${totalAvailable}, Requested: ${requestedQuantity}`);
    }

    // Sort batches by earliest expiry date (FEFO)
    const sortedBatches = [...batches]
      .filter((b) => b.quantityRemaining > 0)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

    let remainingToDeduct = requestedQuantity;
    const allocations: Array<{ batchId: string; batchNumber: string; deducted: number; newRemaining: number }> = [];
    const updatedBatches = sortedBatches.map((b) => ({ ...b }));

    for (const batch of updatedBatches) {
      if (remainingToDeduct <= 0) break;

      const deduct = Math.min(batch.quantityRemaining, remainingToDeduct);
      batch.quantityRemaining -= deduct;
      batch.status = batch.quantityRemaining === 0 ? "Depleted" : "Active";
      remainingToDeduct -= deduct;

      allocations.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        deducted: deduct,
        newRemaining: batch.quantityRemaining,
      });
    }

    const remainingTotalStock = totalAvailable - requestedQuantity;

    return {
      allocations,
      updatedBatches,
      remainingTotalStock,
    };
  };

  it("should dispense from the earliest-expiring batch first", () => {
    const batches: Batch[] = [
      { id: "b2", batchNumber: "B-2027", expiryDate: "2027-06-30", quantityRemaining: 50, status: "Active" },
      { id: "b1", batchNumber: "B-2026-EARLY", expiryDate: "2026-11-15", quantityRemaining: 20, status: "Active" },
      { id: "b3", batchNumber: "B-2028", expiryDate: "2028-01-01", quantityRemaining: 100, status: "Active" },
    ];

    const result = allocateFefo(batches, 15);

    assert.equal(result.allocations.length, 1);
    assert.equal(result.allocations[0].batchNumber, "B-2026-EARLY", "Must draw from earliest expiring batch");
    assert.equal(result.allocations[0].deducted, 15);
    assert.equal(result.allocations[0].newRemaining, 5);
    assert.equal(result.remainingTotalStock, 155);
  });

  it("should span across multiple batches in chronological order when order exceeds first batch", () => {
    const batches: Batch[] = [
      { id: "b1", batchNumber: "B-NOV26", expiryDate: "2026-11-01", quantityRemaining: 20, status: "Active" },
      { id: "b2", batchNumber: "B-DEC26", expiryDate: "2026-12-01", quantityRemaining: 30, status: "Active" },
      { id: "b3", batchNumber: "B-JAN27", expiryDate: "2027-01-01", quantityRemaining: 50, status: "Active" },
    ];

    // Request 35 units: 20 from b1 (depleted), 15 from b2 (15 remaining)
    const result = allocateFefo(batches, 35);

    assert.equal(result.allocations.length, 2);

    assert.equal(result.allocations[0].batchNumber, "B-NOV26");
    assert.equal(result.allocations[0].deducted, 20);
    assert.equal(result.allocations[0].newRemaining, 0);

    assert.equal(result.allocations[1].batchNumber, "B-DEC26");
    assert.equal(result.allocations[1].deducted, 15);
    assert.equal(result.allocations[1].newRemaining, 15);

    assert.equal(result.remainingTotalStock, 65);
    assert.equal(result.updatedBatches[0].status, "Depleted");
    assert.equal(result.updatedBatches[1].status, "Active");
  });

  it("should reject dispensation when requested quantity exceeds total available stock", () => {
    const batches: Batch[] = [
      { id: "b1", batchNumber: "B-1", expiryDate: "2026-12-01", quantityRemaining: 10, status: "Active" },
    ];

    assert.throws(() => {
      allocateFefo(batches, 25);
    }, /Insufficient stock/);
  });

  it("should accurately trigger low-stock and out-of-stock warning flags", () => {
    const computeStockAlerts = (currentStock: number, minStockLevel: number) => ({
      isOutOfStock: currentStock === 0,
      isLowStock: currentStock > 0 && currentStock <= minStockLevel,
      isAdequate: currentStock > minStockLevel,
    });

    // Adequate stock (100 > min 20)
    assert.deepEqual(computeStockAlerts(100, 20), {
      isOutOfStock: false,
      isLowStock: false,
      isAdequate: true,
    });

    // Low stock warning (15 <= min 20)
    assert.deepEqual(computeStockAlerts(15, 20), {
      isOutOfStock: false,
      isLowStock: true,
      isAdequate: false,
    });

    // Out of stock critical (0)
    assert.deepEqual(computeStockAlerts(0, 20), {
      isOutOfStock: true,
      isLowStock: false,
      isAdequate: false,
    });
  });
});
