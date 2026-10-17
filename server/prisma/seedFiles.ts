import fs from "fs";
import path from "path";
import crypto from "crypto";
import prisma from "../src/config/db.js";

const STORAGE_DIR = path.resolve(process.cwd(), "storage", "private");

async function seedMedicalFiles() {
  console.log("Seeding realistic synthetic medical files and private storage records...");

  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  // Get users and patients
  const admin = await prisma.user.findFirst({ where: { role: "Admin" } });
  const doctor = await prisma.user.findFirst({ where: { role: "Doctor" } });
  const patients = await prisma.patient.findMany({ take: 5 });

  const patientCentral = patients[0];
  const patientWest = await prisma.patient.findFirst({ where: { organizationId: "org-careflow-west" } });

  const uploaderId = doctor?.id || admin?.id || "admin";

  const demoFiles = [
    {
      originalName: "Chest_XRay_PA_View.png",
      category: "Radiology",
      mimeType: "image/png",
      patientId: patientCentral?.id,
      organizationId: "org-careflow-central",
      description: "Digital Chest Radiograph (PA View). Clear lung fields, normal cardiothoracic ratio, no acute infiltrates.",
      content: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      ),
    },
    {
      originalName: "Echocardiogram_Doppler_Report.pdf",
      category: "ClinicalNote",
      mimeType: "application/pdf",
      patientId: patientCentral?.id,
      organizationId: "org-careflow-central",
      description: "Transthoracic 2D Echo with Color Doppler. Normal LV systolic function (LVEF 60%), mild concentric LVH.",
      content: Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n180\n%%EOF"),
    },
    {
      originalName: "Inpatient_Discharge_Summary_Cardio.pdf",
      category: "DischargeSummary",
      mimeType: "application/pdf",
      patientId: patients[1]?.id || patientCentral?.id,
      organizationId: "org-careflow-central",
      description: "Official Inpatient Discharge Summary. Post-NSTEMI stabilization, dual antiplatelet therapy regimen counseling.",
      content: Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n180\n%%EOF"),
    },
    {
      originalName: "Automated_Hematology_CBC_Analysis.pdf",
      category: "LabResult",
      mimeType: "application/pdf",
      patientId: patients[2]?.id || patientCentral?.id,
      organizationId: "org-careflow-central",
      description: "Pathology investigation report: Complete Blood Count, Differential Leukocyte Count, Platelet Indices.",
      content: Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n180\n%%EOF"),
    },
    {
      originalName: "West_Pavilion_Intake_Assessment.pdf",
      category: "ClinicalNote",
      mimeType: "application/pdf",
      patientId: patientWest?.id,
      organizationId: "org-careflow-west",
      description: "CareFlow West Metro Outpatient Clinic Intake & Primary Care baseline health appraisal.",
      content: Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n180\n%%EOF"),
    },
  ];

  for (const item of demoFiles) {
    const ext = path.extname(item.originalName);
    const storageKey = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(STORAGE_DIR, storageKey);

    fs.writeFileSync(filePath, item.content);
    const checksum = crypto.createHash("sha256").update(item.content).digest("hex");

    await prisma.medicalFile.create({
      data: {
        originalName: item.originalName,
        storageKey,
        mimeType: item.mimeType,
        sizeBytes: item.content.length,
        category: item.category,
        checksum,
        description: item.description,
        patientId: item.patientId || null,
        uploadedById: uploaderId,
        organizationId: item.organizationId,
      },
    });

    console.log(`Created file record: ${item.originalName} (${item.organizationId})`);
  }

  console.log("✅ Synthetic medical files seeded successfully in private storage!");
  process.exit(0);
}

seedMedicalFiles().catch((err) => {
  console.error(err);
  process.exit(1);
});
