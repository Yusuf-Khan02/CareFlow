import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("💊 Seeding Pharmacy Formulary, Batches, and Inventory Ledgers...");

  const formularyData = [
    {
      sku: "MED-AMOX-500",
      name: "Amoxicillin Trihydrate",
      brandName: "Amoxil",
      category: "Antibiotics",
      dosageForm: "Capsule",
      strength: "500mg",
      unitPrice: 12.5,
      costPrice: 6.0,
      currentStock: 450,
      minStockLevel: 100,
      prescriptionRequired: true,
      storageConditions: "Store below 25°C in a dry place",
      manufacturer: "GlaxoSmithKline Pharmaceuticals",
      batches: [
        {
          batchNumber: "AMX-2026-B01",
          quantityReceived: 300,
          quantityRemaining: 200,
          expiryDate: "2027-08-30",
          purchaseDate: "2026-02-10",
          supplierName: "MedHealth Wholesale Distribution",
          costPerUnit: 6.0,
        },
        {
          batchNumber: "AMX-2026-B02",
          quantityReceived: 250,
          quantityRemaining: 250,
          expiryDate: "2027-12-15",
          purchaseDate: "2026-05-18",
          supplierName: "MedHealth Wholesale Distribution",
          costPerUnit: 6.0,
        },
      ],
    },
    {
      sku: "MED-PARA-650",
      name: "Paracetamol (Acetaminophen)",
      brandName: "Calpol Extra",
      category: "Analgesics & Antipyretics",
      dosageForm: "Tablet",
      strength: "650mg",
      unitPrice: 5.0,
      costPrice: 1.8,
      currentStock: 800,
      minStockLevel: 150,
      prescriptionRequired: false,
      storageConditions: "Store protected from moisture and light",
      manufacturer: "Apex Healthcare Ltd",
      batches: [
        {
          batchNumber: "PAR-2026-A10",
          quantityReceived: 1000,
          quantityRemaining: 800,
          expiryDate: "2028-03-20",
          purchaseDate: "2026-01-15",
          supplierName: "Apex Direct Supply",
          costPerUnit: 1.8,
        },
      ],
    },
    {
      sku: "MED-PANTO-40",
      name: "Pantoprazole Sodium",
      brandName: "Pan-40",
      category: "Gastrointestinal (PPI)",
      dosageForm: "Tablet",
      strength: "40mg",
      unitPrice: 9.5,
      costPrice: 4.0,
      currentStock: 320,
      minStockLevel: 80,
      prescriptionRequired: true,
      storageConditions: "Store in a cool dry place",
      manufacturer: "Alkem Laboratories",
      batches: [
        {
          batchNumber: "PNT-2026-C04",
          quantityReceived: 400,
          quantityRemaining: 320,
          expiryDate: "2027-06-10",
          purchaseDate: "2026-03-05",
          supplierName: "PharmaCare Global",
          costPerUnit: 4.0,
        },
      ],
    },
    {
      sku: "MED-CETIR-10",
      name: "Cetirizine Hydrochloride",
      brandName: "Zyrtec",
      category: "Antihistamines",
      dosageForm: "Tablet",
      strength: "10mg",
      unitPrice: 6.0,
      costPrice: 2.2,
      currentStock: 260,
      minStockLevel: 60,
      prescriptionRequired: false,
      storageConditions: "Store below 30°C",
      manufacturer: "UCB Pharma",
      batches: [
        {
          batchNumber: "CET-2026-Z02",
          quantityReceived: 300,
          quantityRemaining: 260,
          expiryDate: "2027-10-25",
          purchaseDate: "2026-04-12",
          supplierName: "PharmaCare Global",
          costPerUnit: 2.2,
        },
      ],
    },
    {
      sku: "MED-METF-500",
      name: "Metformin Hydrochloride",
      brandName: "Glucophage",
      category: "Antidiabetics",
      dosageForm: "Tablet",
      strength: "500mg",
      unitPrice: 8.0,
      costPrice: 3.1,
      currentStock: 550,
      minStockLevel: 100,
      prescriptionRequired: true,
      storageConditions: "Store at 20°C to 25°C",
      manufacturer: "Merck Healthcare",
      batches: [
        {
          batchNumber: "MET-2026-M09",
          quantityReceived: 600,
          quantityRemaining: 550,
          expiryDate: "2028-01-30",
          purchaseDate: "2026-02-22",
          supplierName: "MedHealth Wholesale Distribution",
          costPerUnit: 3.1,
        },
      ],
    },
    {
      sku: "MED-AZITH-500",
      name: "Azithromycin Monohydrate",
      brandName: "Zithromax",
      category: "Antibiotics",
      dosageForm: "Tablet",
      strength: "500mg",
      unitPrice: 18.0,
      costPrice: 8.5,
      currentStock: 180,
      minStockLevel: 50,
      prescriptionRequired: true,
      storageConditions: "Store below 25°C",
      manufacturer: "Pfizer Inc.",
      batches: [
        {
          batchNumber: "AZM-2026-P03",
          quantityReceived: 200,
          quantityRemaining: 180,
          expiryDate: "2027-04-15",
          purchaseDate: "2026-03-30",
          supplierName: "MedHealth Wholesale Distribution",
          costPerUnit: 8.5,
        },
      ],
    },
    {
      sku: "MED-ATORV-20",
      name: "Atorvastatin Calcium",
      brandName: "Lipitor",
      category: "Cardiovascular",
      dosageForm: "Tablet",
      strength: "20mg",
      unitPrice: 15.0,
      costPrice: 6.2,
      currentStock: 35, // Below minStockLevel (75) -> Low Stock alert
      minStockLevel: 75,
      prescriptionRequired: true,
      storageConditions: "Store at controlled room temperature",
      manufacturer: "Viatris Specialty",
      batches: [
        {
          batchNumber: "ATV-2025-L99",
          quantityReceived: 100,
          quantityRemaining: 35,
          expiryDate: "2026-11-20",
          purchaseDate: "2025-10-15",
          supplierName: "PharmaCare Global",
          costPerUnit: 6.2,
        },
      ],
    },
    {
      sku: "MED-SALBU-100",
      name: "Salbutamol Sulfate Inhaler",
      brandName: "Ventolin Evohaler",
      category: "Respiratory",
      dosageForm: "Inhaler",
      strength: "100mcg",
      unitPrice: 22.0,
      costPrice: 11.0,
      currentStock: 15, // Critical low stock (threshold 40)
      minStockLevel: 40,
      prescriptionRequired: true,
      storageConditions: "Do not puncture or incinerate",
      manufacturer: "GlaxoSmithKline Respiratory",
      batches: [
        {
          batchNumber: "SLB-2026-V01",
          quantityReceived: 50,
          quantityRemaining: 15,
          expiryDate: "2027-02-10",
          purchaseDate: "2026-01-20",
          supplierName: "MedHealth Wholesale Distribution",
          costPerUnit: 11.0,
        },
      ],
    },
    {
      sku: "MED-INSUL-GLAR",
      name: "Insulin Glargine",
      brandName: "Lantus SoloStar",
      category: "Antidiabetics",
      dosageForm: "Injection",
      strength: "100IU/mL",
      unitPrice: 48.0,
      costPrice: 28.0,
      currentStock: 0, // OUT OF STOCK alert
      minStockLevel: 25,
      prescriptionRequired: true,
      storageConditions: "Refrigerate 2°C to 8°C. Do not freeze",
      manufacturer: "Sanofi-Aventis",
      batches: [],
    },
  ];

  for (const item of formularyData) {
    const { batches, ...medDetails } = item;
    const medicine = await prisma.medicine.upsert({
      where: { sku: medDetails.sku },
      update: {
        currentStock: medDetails.currentStock,
        minStockLevel: medDetails.minStockLevel,
      },
      create: medDetails,
    });

    for (const b of batches) {
      const createdBatch = await prisma.inventoryBatch.upsert({
        where: { id: `seed-${b.batchNumber}` },
        update: {},
        create: {
          id: `seed-${b.batchNumber}`,
          medicineId: medicine.id,
          batchNumber: b.batchNumber,
          quantityReceived: b.quantityReceived,
          quantityRemaining: b.quantityRemaining,
          expiryDate: b.expiryDate,
          purchaseDate: b.purchaseDate,
          supplierName: b.supplierName,
          costPerUnit: b.costPerUnit,
          status: "Active",
        },
      });

      // Seed movement entry
      await prisma.inventoryMovement.create({
        data: {
          medicineId: medicine.id,
          batchId: createdBatch.id,
          type: "RECEIPT",
          quantity: b.quantityReceived,
          reference: `PO-${b.batchNumber}`,
          performedBy: "Sunil Joshi (Lead Pharmacist)",
          notes: "Initial inventory warehouse stocking",
        },
      });
    }
  }

  console.log("✅ Pharmacy Formulary, active stock batches, and movement ledger seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Pharmacy seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
