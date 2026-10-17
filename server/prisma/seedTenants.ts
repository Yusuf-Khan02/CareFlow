import prisma from "../src/config/db.js";

export async function seedTenants() {
  console.log("🏥 Consolidating Multi-Tenant Organizations & System Audit Logs...");

  // 1. Primary Tenant: CareFlow Central Hospital
  const orgCentral = await prisma.organization.upsert({
    where: { code: "CF-CENTRAL" },
    update: {
      name: "CareFlow Central Hospital",
      address: "100 Hospital Way, Medical District, Metropolis",
      phone: "+1 (555) 019-2834",
      email: "contact@careflow-central.org",
      status: "Active",
      taxId: "CF-TAX-2026-991",
      licenseNumber: "HOSP-LIC-2026-A1",
    },
    create: {
      id: "org-careflow-central",
      name: "CareFlow Central Hospital",
      code: "CF-CENTRAL",
      address: "100 Hospital Way, Medical District, Metropolis",
      phone: "+1 (555) 019-2834",
      email: "contact@careflow-central.org",
      status: "Active",
      taxId: "CF-TAX-2026-991",
      licenseNumber: "HOSP-LIC-2026-A1",
    },
  });

  // 2. Secondary Tenant: CareFlow West Metro Pavilion
  const orgWest = await prisma.organization.upsert({
    where: { code: "CF-WEST" },
    update: {
      name: "CareFlow West Metro Pavilion",
      address: "450 West Health Blvd, West Suburbs",
      phone: "+1 (555) 092-4819",
      email: "info@careflow-west.org",
      status: "Active",
      taxId: "CF-TAX-2026-882",
      licenseNumber: "HOSP-LIC-2026-B4",
    },
    create: {
      id: "org-careflow-west",
      name: "CareFlow West Metro Pavilion",
      code: "CF-WEST",
      address: "450 West Health Blvd, West Suburbs",
      phone: "+1 (555) 092-4819",
      email: "info@careflow-west.org",
      status: "Active",
      taxId: "CF-TAX-2026-882",
      licenseNumber: "HOSP-LIC-2026-B4",
    },
  });

  // 3. Reassign Central Hospital records
  await prisma.user.updateMany({
    where: { NOT: { organizationId: orgWest.id } },
    data: { organizationId: orgCentral.id },
  });

  await prisma.department.updateMany({
    where: { NOT: { organizationId: orgWest.id } },
    data: { organizationId: orgCentral.id },
  });

  await prisma.patient.updateMany({
    where: { NOT: { organizationId: orgWest.id } },
    data: { organizationId: orgCentral.id },
  });

  // Clean old placeholder organization if it exists
  await prisma.organization.deleteMany({
    where: {
      code: "CAREFLOW-MAIN",
    },
  });

  // 4. Create Tenant 2 distinct Department & Patients for demonstrative isolation
  const westDept = await prisma.department.upsert({
    where: { code: "WFAM" },
    update: { organizationId: orgWest.id },
    create: {
      id: "dept-west-family",
      name: "West Family Practice Clinic",
      code: "WFAM",
      description: "Ambulatory community family medicine and pediatrics",
      suite: "Pavilion Suite 101",
      organizationId: orgWest.id,
    },
  });

  // Tenant 2 Patients
  const westPatient1 = await prisma.patient.upsert({
    where: { mrn: "CFW-2026-001" },
    update: { organizationId: orgWest.id },
    create: {
      mrn: "CFW-2026-001",
      name: "Sophia Chen",
      age: 34,
      gender: "Female",
      phone: "+1 (555) 912-3841",
      email: "sophia.chen@example.com",
      bloodGroup: "A+",
      address: "88 Maple Ave, West District",
      departmentId: westDept.id,
      status: "Active",
      organizationId: orgWest.id,
    },
  });

  const westPatient2 = await prisma.patient.upsert({
    where: { mrn: "CFW-2026-002" },
    update: { organizationId: orgWest.id },
    create: {
      mrn: "CFW-2026-002",
      name: "Marcus Brody",
      age: 48,
      gender: "Male",
      phone: "+1 (555) 843-9912",
      email: "marcus.brody@example.com",
      bloodGroup: "O+",
      address: "12 Pine Rd, West District",
      departmentId: westDept.id,
      status: "Active",
      organizationId: orgWest.id,
    },
  });

  // 5. Seed Comprehensive Audit Logs for Both Hospitals
  // Clean legacy audit logs
  await prisma.auditLog.deleteMany({});

  const adminUser = await prisma.user.findFirst({ where: { role: "Admin" } });
  const doctorUser = await prisma.user.findFirst({ where: { role: "Doctor" } });
  const nurseUser = await prisma.user.findFirst({ where: { role: "Nurse" } });

  const auditEntries = [
    {
      userId: adminUser?.id,
      organizationId: orgCentral.id,
      action: "LOGIN",
      entityName: "User",
      entityId: adminUser?.id,
      details: JSON.stringify({ message: "Administrator authenticated via JWT", method: "PASSWORD", role: "Admin" }),
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
      createdAt: new Date(Date.now() - 3600000 * 24 * 3),
    },
    {
      userId: doctorUser?.id,
      organizationId: orgCentral.id,
      action: "CREATE",
      entityName: "Consultation",
      entityId: "cons-2026-001",
      details: JSON.stringify({ chiefComplaint: "Acute retrosternal chest pain", patient: "Rahul Sharma (CF-2026-001)" }),
      ipAddress: "192.168.1.145",
      userAgent: "CareFlow-Workstation/v1.0 Windows-Desktop",
      createdAt: new Date(Date.now() - 3600000 * 24 * 2.5),
    },
    {
      userId: nurseUser?.id,
      organizationId: orgCentral.id,
      action: "ADMIT",
      entityName: "Admission",
      entityId: "ADM-2026-0001",
      details: JSON.stringify({ bed: "CCU-01", ward: "CCU", condition: "Critical", diagnosis: "NSTEMI Cardiac Infarction" }),
      ipAddress: "192.168.1.160",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: new Date(Date.now() - 3600000 * 24 * 2),
    },
    {
      userId: adminUser?.id,
      organizationId: orgCentral.id,
      action: "PAYMENT",
      entityName: "Payment",
      entityId: "REC-2026-0001",
      details: JSON.stringify({ amount: 1000.0, method: "Credit Card", invoiceNumber: "INV-2026-0001" }),
      ipAddress: "192.168.1.101",
      userAgent: "CareFlow-Cashier-Terminal-01",
      createdAt: new Date(Date.now() - 3600000 * 24 * 1.5),
    },
    {
      userId: adminUser?.id,
      organizationId: orgCentral.id,
      action: "EXPORT",
      entityName: "Invoice",
      entityId: "ALL",
      details: JSON.stringify({ format: "CSV", recordCount: 5, exportedBy: "Hospital Accounts Department" }),
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: new Date(Date.now() - 3600000 * 12),
    },
    {
      userId: adminUser?.id,
      organizationId: orgWest.id,
      action: "LOGIN",
      entityName: "User",
      entityId: adminUser?.id,
      details: JSON.stringify({ message: "Multi-tenant switch to West Pavilion", targetOrg: "CF-WEST" }),
      ipAddress: "10.0.4.52",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
      createdAt: new Date(Date.now() - 3600000 * 10),
    },
    {
      userId: adminUser?.id,
      organizationId: orgWest.id,
      action: "CREATE",
      entityName: "Patient",
      entityId: String(westPatient1.id),
      details: JSON.stringify({ mrn: "CFW-2026-001", name: "Sophia Chen", clinic: "West Family Practice" }),
      ipAddress: "10.0.4.52",
      userAgent: "West-Intake-Tablet/v2.1 iOS",
      createdAt: new Date(Date.now() - 3600000 * 8),
    },
    {
      userId: adminUser?.id,
      organizationId: orgWest.id,
      action: "CREATE",
      entityName: "Patient",
      entityId: String(westPatient2.id),
      details: JSON.stringify({ mrn: "CFW-2026-002", name: "Marcus Brody", clinic: "West Family Practice" }),
      ipAddress: "10.0.4.52",
      userAgent: "West-Intake-Tablet/v2.1 iOS",
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry });
  }

  console.log(`✅ Multi-tenancy successfully consolidated:`);
  console.log(`   - Tenant 1: ${orgCentral.name} (${orgCentral.code})`);
  console.log(`   - Tenant 2: ${orgWest.name} (${orgWest.code})`);
  console.log(`   - Seeded ${auditEntries.length} immutable audit logs across both facilities`);
}

if (process.argv[1]?.endsWith("seedTenants.ts") || process.argv[1]?.endsWith("seedTenants.js")) {
  seedTenants()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
