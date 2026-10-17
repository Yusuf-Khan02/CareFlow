import prisma from "../src/config/db.js";

export async function seedBilling() {
  console.log("💳 Seeding Hospital Invoices, Line Items & Payment Receipts...");

  const existingInvoices = await prisma.invoice.count();
  if (existingInvoices > 0) {
    console.log(`ℹ️ Invoices already seeded (${existingInvoices} invoices present). Skipping seed.`);
    return;
  }

  const patients = await prisma.patient.findMany({ take: 5 });
  if (patients.length === 0) {
    console.log("⚠️ No patients found to attach invoices.");
    return;
  }

  const p1 = patients[0];
  const p2 = patients[1] || p1;
  const p3 = patients[2] || p1;
  const p4 = patients[3] || p1;

  // Invoice 1: Partially Paid Inpatient CCU Bill
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0001",
      patientId: p1.id,
      status: "Partially Paid",
      issueDate: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 86400000 * 12).toISOString().split("T")[0],
      subtotal: 2230.0,
      discount: 130.0,
      taxRate: 0.0,
      taxAmount: 0.0,
      totalAmount: 2100.0,
      paidAmount: 1000.0,
      balanceDue: 1100.0,
      paymentTerms: "Net 15 Days",
      notes: "Inpatient coronary care treatment and diagnostics. Co-pay settled via insurance pre-authorization.",
      items: {
        create: [
          {
            itemType: "Consultation",
            description: "Senior Interventional Cardiologist Rounding",
            quantity: 1,
            unitPrice: 80.0,
            amount: 80.0,
          },
          {
            itemType: "Inpatient Bed Stay",
            description: "Cardiac Care Unit (CCU) Monitored Bed (3 Days)",
            quantity: 3,
            unitPrice: 650.0,
            amount: 1950.0,
          },
          {
            itemType: "Laboratory Test",
            description: "Troponin-I High Sensitivity Quantitative Panel",
            quantity: 1,
            unitPrice: 120.0,
            amount: 120.0,
          },
          {
            itemType: "Laboratory Test",
            description: "Complete Blood Count (CBC) with Differential",
            quantity: 1,
            unitPrice: 45.0,
            amount: 45.0,
          },
          {
            itemType: "Pharmacy Medication",
            description: "Atorvastatin Calcium 20mg Tab (30 Units)",
            quantity: 1,
            unitPrice: 35.0,
            amount: 35.0,
          },
        ],
      },
      payments: {
        create: [
          {
            receiptNumber: "REC-2026-0001",
            amount: 1000.0,
            paymentMethod: "Credit Card",
            referenceNumber: "AUTH-HDFC-99212",
            status: "Completed",
            receivedBy: "Kavita Rao (Senior Cashier)",
            notes: "Interim deposit payment at reception desk",
            paidAt: new Date(Date.now() - 86400000 * 2),
          },
        ],
      },
    },
  });

  // Invoice 2: Fully Paid Inpatient Bill
  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0002",
      patientId: p2.id,
      status: "Paid",
      issueDate: new Date(Date.now() - 86400000 * 4).toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0],
      subtotal: 570.0,
      discount: 0.0,
      taxRate: 0.0,
      taxAmount: 0.0,
      totalAmount: 570.0,
      paidAmount: 570.0,
      balanceDue: 0.0,
      paymentTerms: "Immediate",
      notes: "General medical observation and respiratory support therapy.",
      items: {
        create: [
          {
            itemType: "Inpatient Bed Stay",
            description: "General Medical Ward Semi-Private Room 201 (2 Days)",
            quantity: 2,
            unitPrice: 240.0,
            amount: 480.0,
          },
          {
            itemType: "Laboratory Test",
            description: "Lipid Profile Panel",
            quantity: 1,
            unitPrice: 65.0,
            amount: 65.0,
          },
          {
            itemType: "Pharmacy Medication",
            description: "Amoxicillin Trihydrate 500mg Caps (14 Units)",
            quantity: 1,
            unitPrice: 25.0,
            amount: 25.0,
          },
        ],
      },
      payments: {
        create: [
          {
            receiptNumber: "REC-2026-0002",
            amount: 570.0,
            paymentMethod: "UPI / Net Banking",
            referenceNumber: "UPI-ICICI-881290",
            status: "Completed",
            receivedBy: "Kavita Rao (Senior Cashier)",
            notes: "Settled via digital QR code payment",
            paidAt: new Date(Date.now() - 86400000 * 1),
          },
        ],
      },
    },
  });

  // Invoice 3: Newly Issued Bill (Pending Balance)
  const inv3 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0003",
      patientId: p3.id,
      status: "Issued",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split("T")[0],
      subtotal: 900.0,
      discount: 50.0,
      taxRate: 0.0,
      taxAmount: 0.0,
      totalAmount: 850.0,
      paidAmount: 0.0,
      balanceDue: 850.0,
      paymentTerms: "Net 15 Days",
      notes: "Emergency cardiac evaluation and continuous telemetry setup.",
      items: {
        create: [
          {
            itemType: "Consultation",
            description: "Emergency Inpatient Intake Assessment",
            quantity: 1,
            unitPrice: 150.0,
            amount: 150.0,
          },
          {
            itemType: "Inpatient Bed Stay",
            description: "CCU Bed CCU-02 Monitored Day Rate",
            quantity: 1,
            unitPrice: 650.0,
            amount: 650.0,
          },
          {
            itemType: "Nursing Procedure",
            description: "Telemetry Transmitter Lead Setup & Continuous Vitals",
            quantity: 1,
            unitPrice: 100.0,
            amount: 100.0,
          },
        ],
      },
    },
  });

  // Invoice 4: Outpatient Consultation & Lab Bill (Paid)
  const inv4 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0004",
      patientId: p4.id,
      status: "Paid",
      issueDate: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      subtotal: 145.0,
      discount: 0.0,
      taxRate: 0.0,
      taxAmount: 0.0,
      totalAmount: 145.0,
      paidAmount: 145.0,
      balanceDue: 0.0,
      paymentTerms: "Immediate",
      notes: "Outpatient clinical consultation and routine biochemical panel.",
      items: {
        create: [
          {
            itemType: "Consultation",
            description: "Outpatient General Consultation Fee",
            quantity: 1,
            unitPrice: 60.0,
            amount: 60.0,
          },
          {
            itemType: "Laboratory Test",
            description: "Liver Function Test (LFT Panel)",
            quantity: 1,
            unitPrice: 75.0,
            amount: 75.0,
          },
          {
            itemType: "Pharmacy Medication",
            description: "Paracetamol 650mg Tablets (15 Units)",
            quantity: 1,
            unitPrice: 10.0,
            amount: 10.0,
          },
        ],
      },
      payments: {
        create: [
          {
            receiptNumber: "REC-2026-0003",
            amount: 145.0,
            paymentMethod: "Cash",
            referenceNumber: "CASH-2026-0091",
            status: "Completed",
            receivedBy: "Sunil Joshi (Pharmacist)",
            notes: "Cash counter payment",
            paidAt: new Date(Date.now() - 86400000 * 1),
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded 4 invoices: ${inv1.invoiceNumber}, ${inv2.invoiceNumber}, ${inv3.invoiceNumber}, ${inv4.invoiceNumber}`);
  console.log("🎉 Hospital Billing, Line Items & Payment Receipts seeded successfully!");
}

if (process.argv[1]?.endsWith("seedBilling.ts") || process.argv[1]?.endsWith("seedBilling.js")) {
  seedBilling()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
