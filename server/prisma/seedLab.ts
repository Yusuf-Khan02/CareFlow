import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Seeding Diagnostic Laboratory Orders & Verified Results...");

  const patients = await prisma.patient.findMany({ take: 6 });
  const doctors = await prisma.doctor.findMany({ take: 6 });

  if (patients.length === 0 || doctors.length === 0) {
    console.log("⚠️ No patients or doctors found to seed lab orders.");
    return;
  }

  // 1. Order 1 - Completed CBC (STAT)
  await prisma.labOrder.upsert({
    where: { orderNumber: "LAB-2026-0001" },
    update: {},
    create: {
      orderNumber: "LAB-2026-0001",
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      testCategory: "Hematology",
      testName: "Complete Blood Count (CBC)",
      priority: "STAT",
      status: "Completed",
      clinicalNotes: "Patient presenting with acute fever, rule out active bacterial infection or leukocytosis.",
      orderedAt: new Date(Date.now() - 3600000 * 5),
      collectedAt: new Date(Date.now() - 3600000 * 4),
      completedAt: new Date(Date.now() - 3600000 * 2),
      results: {
        create: [
          {
            parameterName: "Hemoglobin",
            measuredValue: "14.2",
            unit: "g/dL",
            referenceRange: "13.5 - 17.5",
            status: "Normal",
            verifiedBy: "Vikram Sen, Senior Lab Technologist",
          },
          {
            parameterName: "White Blood Cells (WBC)",
            measuredValue: "13.4",
            unit: "x10^3/uL",
            referenceRange: "4.5 - 11.0",
            status: "High",
            technicianNotes: "Mild neutrophilia noted on peripheral smear examination",
            verifiedBy: "Vikram Sen, Senior Lab Technologist",
          },
          {
            parameterName: "Platelet Count",
            measuredValue: "275",
            unit: "x10^3/uL",
            referenceRange: "150 - 450",
            status: "Normal",
            verifiedBy: "Vikram Sen, Senior Lab Technologist",
          },
          {
            parameterName: "Hematocrit (HCT)",
            measuredValue: "43.5",
            unit: "%",
            referenceRange: "41.0 - 50.0",
            status: "Normal",
            verifiedBy: "Vikram Sen, Senior Lab Technologist",
          },
        ],
      },
    },
  });

  // 2. Order 2 - Completed CMP (Urgent)
  await prisma.labOrder.upsert({
    where: { orderNumber: "LAB-2026-0002" },
    update: {},
    create: {
      orderNumber: "LAB-2026-0002",
      patientId: patients[1].id,
      doctorId: doctors[1].id,
      testCategory: "Biochemistry",
      testName: "Comprehensive Metabolic Panel (CMP)",
      priority: "Urgent",
      status: "Completed",
      clinicalNotes: "Pre-operative evaluation and baseline kidney/electrolyte screen.",
      orderedAt: new Date(Date.now() - 3600000 * 8),
      collectedAt: new Date(Date.now() - 3600000 * 7),
      completedAt: new Date(Date.now() - 3600000 * 5),
      results: {
        create: [
          {
            parameterName: "Fasting Blood Glucose",
            measuredValue: "108",
            unit: "mg/dL",
            referenceRange: "70 - 99",
            status: "High",
            verifiedBy: "Vikram Sen, Senior Lab Technologist",
          },
          {
            parameterName: "Serum Creatinine",
            measuredValue: "0.85",
            unit: "mg/dL",
            referenceRange: "0.7 - 1.3",
            status: "Normal",
            verifiedBy: "Vikram Sen, Senior Lab Technologist",
          },
          {
            parameterName: "Blood Urea Nitrogen (BUN)",
            measuredValue: "14",
            unit: "mg/dL",
            referenceRange: "7 - 20",
            status: "Normal",
            verifiedBy: "Vikram Sen, Senior Lab Technologist",
          },
          {
            parameterName: "Serum Sodium (Na+)",
            measuredValue: "139",
            unit: "mEq/L",
            referenceRange: "135 - 145",
            status: "Normal",
            verifiedBy: "Vikram Sen, Senior Lab Technologist",
          },
          {
            parameterName: "Serum Potassium (K+)",
            measuredValue: "4.1",
            unit: "mEq/L",
            referenceRange: "3.5 - 5.0",
            status: "Normal",
            verifiedBy: "Vikram Sen, Senior Lab Technologist",
          },
        ],
      },
    },
  });

  // 3. Order 3 - Critical Cardiac Panel (STAT)
  if (patients.length >= 3 && doctors.length >= 3) {
    await prisma.labOrder.upsert({
      where: { orderNumber: "LAB-2026-0003" },
      update: {},
      create: {
        orderNumber: "LAB-2026-0003",
        patientId: patients[2].id,
        doctorId: doctors[2].id,
        testCategory: "Cardiology",
        testName: "Cardiac Troponin-I & CK-MB",
        priority: "STAT",
        status: "Completed",
        clinicalNotes: "Acute substernal chest pressure radiating to left arm. Immediate rule-out MI.",
        orderedAt: new Date(Date.now() - 3600000 * 2),
        collectedAt: new Date(Date.now() - 3600000 * 1.5),
        completedAt: new Date(Date.now() - 3600000 * 0.5),
        results: {
          create: [
            {
              parameterName: "Troponin-I High-Sensitivity",
              measuredValue: "0.19",
              unit: "ng/mL",
              referenceRange: "< 0.04",
              status: "Critical",
              technicianNotes: "CRITICAL VALUE telephoned and verified with On-Duty Cardiologist",
              verifiedBy: "Vikram Sen, Senior Lab Technologist",
            },
            {
              parameterName: "CK-MB",
              measuredValue: "9.2",
              unit: "ng/mL",
              referenceRange: "0.0 - 5.0",
              status: "High",
              verifiedBy: "Vikram Sen, Senior Lab Technologist",
            },
          ],
        },
      },
    });
  }

  // 4. Order 4 - In-Analysis (Sample Collected)
  if (patients.length >= 4 && doctors.length >= 4) {
    await prisma.labOrder.upsert({
      where: { orderNumber: "LAB-2026-0004" },
      update: {},
      create: {
        orderNumber: "LAB-2026-0004",
        patientId: patients[3].id,
        doctorId: doctors[3].id,
        testCategory: "Biochemistry",
        testName: "Liver Function Tests (LFT)",
        priority: "Urgent",
        status: "In-Analysis",
        clinicalNotes: "Elevated liver enzymes on previous ultrasound, monitoring therapy.",
        orderedAt: new Date(Date.now() - 3600000 * 3),
        collectedAt: new Date(Date.now() - 3600000 * 1),
      },
    });
  }

  // 5. Order 5 - Sample Collected
  if (patients.length >= 5 && doctors.length >= 5) {
    await prisma.labOrder.upsert({
      where: { orderNumber: "LAB-2026-0005" },
      update: {},
      create: {
        orderNumber: "LAB-2026-0005",
        patientId: patients[4].id,
        doctorId: doctors[4].id,
        testCategory: "Endocrinology",
        testName: "Thyroid Stimulating Hormone (TSH & FT4)",
        priority: "Routine",
        status: "Sample Collected",
        clinicalNotes: "Annual routine endocrine screening.",
        orderedAt: new Date(Date.now() - 3600000 * 4),
        collectedAt: new Date(Date.now() - 3600000 * 0.5),
      },
    });
  }

  // 6. Order 6 - Newly Requested
  if (patients.length >= 1 && doctors.length >= 1) {
    await prisma.labOrder.upsert({
      where: { orderNumber: "LAB-2026-0006" },
      update: {},
      create: {
        orderNumber: "LAB-2026-0006",
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        testCategory: "Biochemistry",
        testName: "Lipid Profile Panel",
        priority: "Routine",
        status: "Requested",
        clinicalNotes: "Fasting lipid profile for hypertension management.",
        orderedAt: new Date(Date.now() - 1800000),
      },
    });
  }

  console.log("✅ Diagnostic Laboratory orders and verified results successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Lab seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
