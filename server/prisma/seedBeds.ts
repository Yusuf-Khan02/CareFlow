import prisma from "../src/config/db.js";

export async function seedBeds() {
  console.log("🏥 Seeding Inpatient Wards, Rooms, Beds & Admissions...");

  // Check if wards already exist
  const existingWards = await prisma.ward.count();
  if (existingWards > 0) {
    console.log(`ℹ️ Wards already seeded (${existingWards} wards present). Skipping seed.`);
    return;
  }

  // Find sample doctor & patient
  const doctors = await prisma.doctor.findMany({ take: 5 });
  const patients = await prisma.patient.findMany({ take: 5 });

  const doc1 = doctors[0] || null;
  const doc2 = doctors[1] || doc1;
  const pat1 = patients[0] || null;
  const pat2 = patients[1] || pat1;

  // 1. Create Wards
  const icuWard = await prisma.ward.create({
    data: {
      name: "Intensive Care Unit (ICU)",
      code: "ICU",
      floor: "3rd Floor, Critical Care Pavilion",
      gender: "Mixed",
      dailyRate: 850.0,
      description: "State-of-the-art telemetry and continuous invasive hemodynamic monitoring suite",
    },
  });

  const ccuWard = await prisma.ward.create({
    data: {
      name: "Cardiac Care Unit (CCU)",
      code: "CCU",
      floor: "3rd Floor, West Wing",
      gender: "Mixed",
      dailyRate: 650.0,
      description: "Dedicated coronary care and post-angioplasty recovery suite",
    },
  });

  const gmwWard = await prisma.ward.create({
    data: {
      name: "General Medical Ward",
      code: "GMW",
      floor: "2nd Floor, Wing A",
      gender: "Mixed",
      dailyRate: 220.0,
      description: "Inpatient medical management and step-down observational care",
    },
  });

  const surgWard = await prisma.ward.create({
    data: {
      name: "Post-Surgical Inpatient Ward",
      code: "SURG",
      floor: "4th Floor, Surgical Tower",
      gender: "Mixed",
      dailyRate: 420.0,
      description: "Post-operative orthopedic, general, and vascular surgical recovery",
    },
  });

  const pedWard = await prisma.ward.create({
    data: {
      name: "Pediatric Pavilion",
      code: "PED",
      floor: "1st Floor, Children's Pavilion",
      gender: "Pediatric",
      dailyRate: 260.0,
      description: "Child-friendly inpatient observation with parent-accompanying suites",
    },
  });

  // 2. Create Rooms & Beds
  // --- ICU Rooms & Beds ---
  const icuRoom1 = await prisma.room.create({
    data: {
      roomNumber: "ICU-Pod-A",
      wardId: icuWard.id,
      roomType: "Isolation",
      dailyRate: 900.0,
      amenities: "HEPA Filtration, Negative Pressure, Invasive Ventilator, Continuous ECG",
    },
  });

  const icuRoom2 = await prisma.room.create({
    data: {
      roomNumber: "ICU-Pod-B",
      wardId: icuWard.id,
      roomType: "General",
      dailyRate: 850.0,
      amenities: "Wall-mounted O2/Vacuum, Philips IntelliVue Multi-parameter Monitor",
    },
  });

  const bedIcu1 = await prisma.bed.create({
    data: {
      bedNumber: "ICU-01",
      roomId: icuRoom1.id,
      wardId: icuWard.id,
      bedType: "ICU/CCU Electric",
      status: "Available",
    },
  });

  const bedIcu2 = await prisma.bed.create({
    data: {
      bedNumber: "ICU-02",
      roomId: icuRoom1.id,
      wardId: icuWard.id,
      bedType: "ICU/CCU Electric",
      status: "Cleaning", // Demonstrates Housekeeping workflow
    },
  });

  const bedIcu3 = await prisma.bed.create({
    data: {
      bedNumber: "ICU-03",
      roomId: icuRoom2.id,
      wardId: icuWard.id,
      bedType: "ICU/CCU Electric",
      status: "Available",
    },
  });

  const bedIcu4 = await prisma.bed.create({
    data: {
      bedNumber: "ICU-04",
      roomId: icuRoom2.id,
      wardId: icuWard.id,
      bedType: "ICU/CCU Electric",
      status: "Available",
    },
  });

  // --- CCU Rooms & Beds ---
  const ccuRoom1 = await prisma.room.create({
    data: {
      roomNumber: "CCU-Bay-1",
      wardId: ccuWard.id,
      roomType: "Semi-Private",
      dailyRate: 650.0,
      amenities: "Telemetry Bedside Unit, Defibrillator Access, Suction Port",
    },
  });

  const bedCcu1 = await prisma.bed.create({
    data: {
      bedNumber: "CCU-01",
      roomId: ccuRoom1.id,
      wardId: ccuWard.id,
      bedType: "ICU/CCU Electric",
      status: "Available",
    },
  });

  const bedCcu2 = await prisma.bed.create({
    data: {
      bedNumber: "CCU-02",
      roomId: ccuRoom1.id,
      wardId: ccuWard.id,
      bedType: "ICU/CCU Electric",
      status: "Available",
    },
  });

  // --- GMW Rooms & Beds ---
  const gmwRoom201 = await prisma.room.create({
    data: {
      roomNumber: "GMW-201",
      wardId: gmwWard.id,
      roomType: "Semi-Private",
      dailyRate: 240.0,
      amenities: "Patient Nurse Call Button, Adjustable Backrest, Bedside Cabinet",
    },
  });

  const gmwRoom202 = await prisma.room.create({
    data: {
      roomNumber: "GMW-202",
      wardId: gmwWard.id,
      roomType: "General",
      dailyRate: 200.0,
      amenities: "Shared Attached Washroom, Privacy Curtains, Central AC",
    },
  });

  const bedGmw1 = await prisma.bed.create({
    data: {
      bedNumber: "B-201-A",
      roomId: gmwRoom201.id,
      wardId: gmwWard.id,
      bedType: "Standard",
      status: "Available",
    },
  });

  const bedGmw2 = await prisma.bed.create({
    data: {
      bedNumber: "B-201-B",
      roomId: gmwRoom201.id,
      wardId: gmwWard.id,
      bedType: "Standard",
      status: "Available",
    },
  });

  const bedGmw3 = await prisma.bed.create({
    data: {
      bedNumber: "B-202-A",
      roomId: gmwRoom202.id,
      wardId: gmwWard.id,
      bedType: "Standard",
      status: "Available",
    },
  });

  const bedGmw4 = await prisma.bed.create({
    data: {
      bedNumber: "B-202-B",
      roomId: gmwRoom202.id,
      wardId: gmwWard.id,
      bedType: "Standard",
      status: "Available",
    },
  });

  // --- SURG Rooms & Beds ---
  const surgRoom401 = await prisma.room.create({
    data: {
      roomNumber: "SURG-401",
      wardId: surgWard.id,
      roomType: "Private",
      dailyRate: 450.0,
      amenities: "Electric High-Low Bed, Recliner for Attendant, Smart Monitor, Private Bath",
    },
  });

  const bedSurg1 = await prisma.bed.create({
    data: {
      bedNumber: "SURG-01",
      roomId: surgRoom401.id,
      wardId: surgWard.id,
      bedType: "Standard",
      status: "Available",
    },
  });

  const bedSurg2 = await prisma.bed.create({
    data: {
      bedNumber: "SURG-02",
      roomId: surgRoom401.id,
      wardId: surgWard.id,
      bedType: "Standard",
      status: "Maintenance", // Demonstrates Maintenance status
    },
  });

  // --- PED Rooms & Beds ---
  const pedRoom101 = await prisma.room.create({
    data: {
      roomNumber: "PED-101",
      wardId: pedWard.id,
      roomType: "Semi-Private",
      dailyRate: 260.0,
      amenities: "Child Safety Rails, Oxygen Port, Parental Sleeping Cot",
    },
  });

  const bedPed1 = await prisma.bed.create({
    data: {
      bedNumber: "PED-01",
      roomId: pedRoom101.id,
      wardId: pedWard.id,
      bedType: "Pediatric Crib",
      status: "Available",
    },
  });

  const bedPed2 = await prisma.bed.create({
    data: {
      bedNumber: "PED-02",
      roomId: pedRoom101.id,
      wardId: pedWard.id,
      bedType: "Pediatric Crib",
      status: "Available",
    },
  });

  // 3. Seed Live Admissions if patients and doctors exist
  if (pat1 && doc1) {
    // Admit Patient 1 into CCU-01
    const adm1 = await prisma.admission.create({
      data: {
        admissionNumber: "ADM-2026-0001",
        patientId: pat1.id,
        doctorId: doc1.id,
        wardId: ccuWard.id,
        bedId: bedCcu1.id,
        admissionType: "Emergency",
        diagnosis: "Acute Coronary Syndrome - STEMI Post-PCI",
        condition: "Serious",
        notes: "Continuous telemetry active. Dual antiplatelet therapy administered.",
        admittedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        status: "Admitted",
      },
    });

    // Update Bed CCU-01 to Occupied
    await prisma.bed.update({
      where: { id: bedCcu1.id },
      data: {
        status: "Occupied",
        currentAdmissionId: adm1.id,
      },
    });

    // Update Patient Status
    await prisma.patient.update({
      where: { id: pat1.id },
      data: {
        status: "Admitted",
        admissionDate: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
      },
    });

    console.log(`✅ Seeded Admission ADM-2026-0001 for Patient ${pat1.name} in CCU-01`);
  }

  if (pat2 && doc2) {
    // Admit Patient 2 into GMW B-201-A
    const adm2 = await prisma.admission.create({
      data: {
        admissionNumber: "ADM-2026-0002",
        patientId: pat2.id,
        doctorId: doc2.id,
        wardId: gmwWard.id,
        bedId: bedGmw1.id,
        admissionType: "Elective",
        diagnosis: "Acute Community-Acquired Pneumonia with Moderate Hypoxemia",
        condition: "Stable",
        notes: "IV Ceftriaxone day 3. Supplemental nasal cannula O2 at 2 L/min.",
        admittedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        status: "Admitted",
      },
    });

    // Update Bed B-201-A to Occupied
    await prisma.bed.update({
      where: { id: bedGmw1.id },
      data: {
        status: "Occupied",
        currentAdmissionId: adm2.id,
      },
    });

    // Update Patient Status
    await prisma.patient.update({
      where: { id: pat2.id },
      data: {
        status: "Admitted",
        admissionDate: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
      },
    });

    console.log(`✅ Seeded Admission ADM-2026-0002 for Patient ${pat2.name} in B-201-A`);
  }

  console.log("🎉 Inpatient Wards, Rooms, Beds & Admissions seeded successfully!");
}

// Run if called directly
if (process.argv[1]?.endsWith("seedBeds.ts") || process.argv[1]?.endsWith("seedBeds.js")) {
  seedBeds()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
