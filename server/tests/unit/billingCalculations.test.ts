import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Hospital Billing, Line Item Math & Payment Allocation", () => {
  interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
  }

  const computeInvoiceTotals = (items: InvoiceItem[], discountInput = 0, taxRateInput = 0) => {
    const lineItems = items.map((item) => {
      const amount = Math.round(item.quantity * item.unitPrice * 100) / 100;
      return { ...item, amount };
    });

    const subtotal = Math.round(lineItems.reduce((acc, curr) => acc + curr.amount, 0) * 100) / 100;
    const discount = Math.min(subtotal, Math.max(0, discountInput));
    const taxableBase = Math.max(0, subtotal - discount);
    const taxRate = Math.max(0, taxRateInput);
    const taxAmount = Math.round(((taxableBase * taxRate) / 100) * 100) / 100;
    const totalAmount = Math.round((taxableBase + taxAmount) * 100) / 100;

    return {
      lineItems,
      subtotal,
      discount,
      taxableBase,
      taxRate,
      taxAmount,
      totalAmount,
    };
  };

  it("should compute exact line item sums and rounded decimals", () => {
    const items: InvoiceItem[] = [
      { description: "General Consultation", quantity: 1, unitPrice: 150.0 },
      { description: "Complete Blood Count (CBC)", quantity: 2, unitPrice: 45.5 },
      { description: "Amoxicillin 500mg (10 tabs)", quantity: 3, unitPrice: 12.33 },
    ];

    const result = computeInvoiceTotals(items, 0, 0);

    assert.equal(result.lineItems[0].amount, 150.0);
    assert.equal(result.lineItems[1].amount, 91.0);
    assert.equal(result.lineItems[2].amount, 36.99); // 3 * 12.33 = 36.99
    assert.equal(result.subtotal, 277.99);
    assert.equal(result.totalAmount, 277.99);
  });

  it("should apply discounts before applying sales/healthcare tax", () => {
    const items: InvoiceItem[] = [
      { description: "Inpatient Bed Day (General Ward)", quantity: 3, unitPrice: 200.0 }, // 600
      { description: "Specialist Follow-up", quantity: 1, unitPrice: 100.0 }, // 100
    ]; // Subtotal = 700

    // Discount: $100 -> Taxable Base = $600. Tax: 5% -> Tax Amount = $30. Total = $630
    const result = computeInvoiceTotals(items, 100, 5);

    assert.equal(result.subtotal, 700.0);
    assert.equal(result.discount, 100.0);
    assert.equal(result.taxableBase, 600.0);
    assert.equal(result.taxAmount, 30.0);
    assert.equal(result.totalAmount, 630.0);
  });

  it("should cap discounts so total cannot become negative", () => {
    const items: InvoiceItem[] = [
      { description: "Triage Nursing Assessment", quantity: 1, unitPrice: 50.0 },
    ];

    const result = computeInvoiceTotals(items, 200, 5); // Attempt $200 discount on $50 bill

    assert.equal(result.subtotal, 50.0);
    assert.equal(result.discount, 50.0, "Discount must not exceed subtotal");
    assert.equal(result.taxableBase, 0.0);
    assert.equal(result.taxAmount, 0.0);
    assert.equal(result.totalAmount, 0.0);
  });

  it("should calculate payment settlements and update invoice status correctly", () => {
    const totalAmount = 500.0;

    const applyPayment = (currentPaid: number, newPayment: number) => {
      const remainingBalance = Math.max(0, Math.round((totalAmount - currentPaid) * 100) / 100);
      if (newPayment > remainingBalance) {
        throw new Error(`Payment ($${newPayment}) cannot exceed remaining balance ($${remainingBalance})`);
      }

      const totalPaid = Math.round((currentPaid + newPayment) * 100) / 100;
      const balanceDue = Math.max(0, Math.round((totalAmount - totalPaid) * 100) / 100);

      let status = "Issued";
      if (balanceDue === 0) {
        status = "Paid";
      } else if (totalPaid > 0) {
        status = "Partially Paid";
      }

      return { totalPaid, balanceDue, status };
    };

    // Initial state
    assert.deepEqual(applyPayment(0, 0), {
      totalPaid: 0,
      balanceDue: 500,
      status: "Issued",
    });

    // Partial settlement ($200 paid)
    const step1 = applyPayment(0, 200);
    assert.equal(step1.totalPaid, 200.0);
    assert.equal(step1.balanceDue, 300.0);
    assert.equal(step1.status, "Partially Paid");

    // Second partial settlement ($150 paid)
    const step2 = applyPayment(step1.totalPaid, 150);
    assert.equal(step2.totalPaid, 350.0);
    assert.equal(step2.balanceDue, 150.0);
    assert.equal(step2.status, "Partially Paid");

    // Final settlement ($150 paid)
    const step3 = applyPayment(step2.totalPaid, 150);
    assert.equal(step3.totalPaid, 500.0);
    assert.equal(step3.balanceDue, 0.0);
    assert.equal(step3.status, "Paid");

    // Overpayment rejection
    assert.throws(() => {
      applyPayment(step2.totalPaid, 200); // Only 150 balance remaining
    }, /cannot exceed remaining balance/);
  });
});
