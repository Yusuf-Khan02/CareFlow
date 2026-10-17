import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CareFlow SQL Database Seed...");

  // 1. Create Demo Organization
  const org = await prisma.organization.upsert({
    where: { code: "CAREFLOW-MAIN" },
    update: {},
    create: {
      name: "CareFlow Metropolitan General Hospital",
      code: "CAREFLOW-MAIN",
      address: "Medical Center Boulevard, Metro City",
      phone: "+91 800-CARE-FLOW",
      email: "contact@careflow.demo",
    },
  });

  console.log(`✅ Organization created: ${org.name}`);

  // 2. Create Demo Role Users (Hashed with bcrypt: "CareFlow@2026")
  const defaultPasswordHash = await bcrypt.hash("CareFlow@2026", 10);

  const demoUsers = [
    { email: "admin@careflow.demo", name: "Dr. Alexander Davis", role: "Admin" },
    { email: "dr.sharma@careflow.demo", name: "Dr. Rahul Sharma", role: "Doctor" },
    { email: "nurse.patel@careflow.demo", name: "Sister Priya Patel", role: "Nurse" },
    { email: "reception@careflow.demo", name: "Ananya Roy", role: "Receptionist" },
    { email: "lab@careflow.demo", name: "Vikram Sen", role: "LabTech" },
    { email: "pharmacy@careflow.demo", name: "Sunil Joshi", role: "Pharmacist" },
    { email: "patient@careflow.demo", name: "Rahul Sharma", role: "Patient" },
  ];

  const createdUsers: Record<string, string> = {};

  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash: defaultPasswordHash,
        role: u.role,
        name: u.name,
        status: "Active",
      },
      create: {
        email: u.email,
        passwordHash: defaultPasswordHash,
        name: u.name,
        role: u.role,
        status: "Active",
        organizationId: org.id,
      },
    });
    createdUsers[u.email] = user.id;
  }

  console.log("✅ 7 Demo Role Users seeded with secure bcrypt hashing (Password: CareFlow@2026).");

  // 3. Create Hospital Departments
  const deptData = [
    { name: "Cardiology", code: "CARD", description: "Heart & Vascular Care", suite: "Suite 101-105" },
    { name: "Neurology", code: "NEUR", description: "Brain & Nervous System", suite: "Suite 201-205" },
    { name: "Gastro", code: "GAST", description: "Digestive & Liver Health", suite: "Suite 106-110" },
    { name: "Orthology", code: "ORTH", description: "Bone & Joint Specialists", suite: "Suite 301-305" },
    { name: "General Physician", code: "GENP", description: "Internal & Preventive Medicine", suite: "Suite 102-104" },
    { name: "Pediatrics", code: "PEDI", description: "Child & Infant Healthcare", suite: "Child Wellness Wing" },
  ];

  const createdDepts: Record<string, string> = {};

  for (const d of deptData) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: {
        name: d.name,
        code: d.code,
        description: d.description,
        suite: d.suite,
        organizationId: org.id,
      },
    });
    createdDepts[d.name] = dept.id;
  }

  console.log("✅ 6 Hospital Departments created.");

  // 4. Create Doctors & Weekly Rota
  const doctorsData = [
    {
      name: "Dr. Rahul Sharma",
      title: "Senior Consultant Cardiologist",
      qualification: "MBBS, MD (Medicine), DM (Cardiology), FACC",
      specialty: "Interventional Cardiology",
      deptName: "Cardiology",
      room: "Consultation Suite 101",
      email: "dr.sharma@careflow.demo",
      phone: "+91 98111 00001",
      status: "On Duty",
      rating: 4.9,
      consultationFee: 800,
      experienceYears: 16,
      bio: "Specializing in coronary interventions, hypertension management, and preventative cardiology with over 16 years of academic and clinical excellence.",
    },
    {
      name: "Dr. Ananya Sen",
      title: "Lead Neuro Physician",
      qualification: "MBBS, MD (General Medicine), DM (Neurology)",
      specialty: "Neuro-vascular & Migraine Care",
      deptName: "Neurology",
      room: "Consultation Suite 204",
      email: "dr.sen@careflow.demo",
      phone: "+91 98111 00002",
      status: "In Consultation",
      rating: 4.8,
      consultationFee: 850,
      experienceYears: 12,
      bio: "Expertise in complex migraine syndromes, neuro-muscular conditions, stroke rehabilitation protocols, and diagnostic EEG interpretation.",
    },
    {
      name: "Dr. Vikram Patel",
      title: "Senior Gastroenterologist",
      qualification: "MBBS, MD, DNB (Gastroenterology)",
      specialty: "Hepatobiliary & Pancreatic Medicine",
      deptName: "Gastro",
      room: "Consultation Suite 108",
      email: "dr.patel@careflow.demo",
      phone: "+91 98111 00003",
      status: "On Duty",
      rating: 4.9,
      consultationFee: 750,
      experienceYears: 18,
      bio: "Pioneer in therapeutic endoscopy, pancreatitis management, liver disease therapies, and clinical gastroenterological research.",
    },
    {
      name: "Dr. Kabir Malhotra",
      title: "Consultant Orthopedic Surgeon",
      qualification: "MBBS, MS (Orthopedics), MCh (Ortho, UK)",
      specialty: "Sports Injuries & Joint Arthroscopy",
      deptName: "Orthology",
      room: "Consultation Suite 305",
      email: "dr.malhotra@careflow.demo",
      phone: "+91 98111 00004",
      status: "On Duty",
      rating: 4.7,
      consultationFee: 700,
      experienceYears: 14,
      bio: "Focusing on minimally invasive joint arthroscopy, ACL reconstruction, trauma surgery, and complex sports injury physical rehab programs.",
    },
    {
      name: "Dr. Sarah Jenkins",
      title: "Chief of Internal Medicine",
      qualification: "MBBS, MD (Internal Medicine), MRCP (London)",
      specialty: "Adult Multi-System & Preventive Health",
      deptName: "General Physician",
      room: "Consultation Suite 102",
      email: "dr.jenkins@careflow.demo",
      phone: "+91 98111 00005",
      status: "On Duty",
      rating: 5.0,
      consultationFee: 650,
      experienceYears: 20,
      bio: "Senior clinician overseeing outpatient internal medicine, adult diagnostic assessments, chronic metabolic care, and clinical operations quality.",
    },
    {
      name: "Dr. Neha Kulkarni",
      title: "Consultant Pediatrician",
      qualification: "MBBS, DCH, DNB (Pediatrics)",
      specialty: "Neonatal & Child Development",
      deptName: "Pediatrics",
      room: "Child Wellness Wing 201",
      email: "dr.kulkarni@careflow.demo",
      phone: "+91 98111 00006",
      status: "On Leave",
      rating: 4.9,
      consultationFee: 600,
      experienceYears: 10,
      bio: "Dedicated pediatric specialist addressing infant wellness, immunization protocols, developmental milestones, and childhood respiratory health.",
    },
  ];

  const createdDoctors: Record<string, number> = {};

  for (const doc of doctorsData) {
    const departmentId = createdDepts[doc.deptName];
    const createdDoc = await prisma.doctor.upsert({
      where: { email: doc.email },
      update: {
        userId: createdUsers[doc.email] || undefined,
      },
      create: {
        userId: createdUsers[doc.email] || null,
        name: doc.name,
        title: doc.title,
        qualification: doc.qualification,
        specialty: doc.specialty,
        departmentId: departmentId,
        room: doc.room,
        email: doc.email,
        phone: doc.phone,
        status: doc.status,
        rating: doc.rating,
        consultationFee: doc.consultationFee,
        experienceYears: doc.experienceYears,
        bio: doc.bio,
      },
    });

    createdDoctors[doc.name] = createdDoc.id;

    // Add schedules
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (const day of days) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: createdDoc.id,
          day: day,
          shifts: "09:00 AM - 01:00 PM",
          isAvailable: day !== "Saturday" || doc.name.includes("Jenkins"),
          slotsRemaining: day === "Saturday" ? 0 : 5,
        },
      });
    }
  }

  console.log("✅ 6 Physicians and schedules created.");

  // 5. Create Synthetic Patients with Vitals & Medical Records
  const patientsData = [
    {
      mrn: "CF-2026-001",
      name: "Rahul Sharma",
      age: 42,
      gender: "Male",
      phone: "+91 98765 43210",
      email: "rahul.sharma@demo.org",
      address: "Block B-14, Green Park, New Delhi",
      deptName: "Cardiology",
      status: "Active",
      bloodGroup: "O+",
      emergencyName: "Sunita Sharma",
      emergencyRelation: "Spouse",
      emergencyPhone: "+91 98765 43299",
      allergies: "Penicillin, Sulfa Drugs",
      doctorName: "Dr. Rahul Sharma",
      bp: "128/82 mmHg",
      hr: 76,
      temp: "98.6 °F",
      spO2: 98,
    },
    {
      mrn: "CF-2026-002",
      name: "Aisha Khan",
      age: 31,
      gender: "Female",
      phone: "+91 98765 43211",
      email: "aisha.khan@demo.org",
      address: "72 Maple Avenue, Bandra West, Mumbai",
      deptName: "Neurology",
      status: "Active",
      bloodGroup: "A+",
      emergencyName: "Zafar Khan",
      emergencyRelation: "Brother",
      emergencyPhone: "+91 98765 43288",
      allergies: "None known",
      doctorName: "Dr. Ananya Sen",
      bp: "115/75 mmHg",
      hr: 72,
      temp: "98.4 °F",
      spO2: 99,
    },
    {
      mrn: "CF-2026-003",
      name: "Arjun Mehta",
      age: 56,
      gender: "Male",
      phone: "+91 98765 43212",
      email: "arjun.mehta@demo.org",
      address: "Flat 402, Royal Palms, Pune",
      deptName: "Gastro",
      status: "Critical",
      bloodGroup: "B+",
      emergencyName: "Meera Mehta",
      emergencyRelation: "Daughter",
      emergencyPhone: "+91 98765 43277",
      allergies: "Aspirin, Ibuprofen",
      doctorName: "Dr. Vikram Patel",
      bp: "142/94 mmHg",
      hr: 98,
      temp: "100.8 °F",
      spO2: 94,
    },
    {
      mrn: "CF-2026-004",
      name: "Priya Singh",
      age: 28,
      gender: "Female",
      phone: "+91 98765 43213",
      email: "priya.singh@demo.org",
      address: "Sector 18, Noida, Uttar Pradesh",
      deptName: "Orthology",
      status: "Active",
      bloodGroup: "AB+",
      emergencyName: "Ramesh Singh",
      emergencyRelation: "Father",
      emergencyPhone: "+91 98765 43266",
      allergies: "Latex",
      doctorName: "Dr. Kabir Malhotra",
      bp: "118/76 mmHg",
      hr: 68,
      temp: "98.5 °F",
      spO2: 99,
    },
    {
      mrn: "CF-2026-005",
      name: "Mohammed Sameer",
      age: 64,
      gender: "Male",
      phone: "+91 98765 43214",
      email: "sameer.m@demo.org",
      address: "Old City, Charminar Lane, Hyderabad",
      deptName: "General Physician",
      status: "Discharged",
      bloodGroup: "O-",
      emergencyName: "Farhan Sameer",
      emergencyRelation: "Son",
      emergencyPhone: "+91 98765 43255",
      allergies: "None known",
      doctorName: "Dr. Sarah Jenkins",
      bp: "122/80 mmHg",
      hr: 70,
      temp: "98.2 °F",
      spO2: 98,
    },
    {
      mrn: "CF-2026-006",
      name: "Neha Verma",
      age: 37,
      gender: "Female",
      phone: "+91 98765 43215",
      email: "neha.verma@demo.org",
      address: "Koramangala 4th Block, Bengaluru",
      deptName: "Pediatrics",
      status: "Active",
      bloodGroup: "B-",
      emergencyName: "Amit Verma",
      emergencyRelation: "Spouse",
      emergencyPhone: "+91 98765 43244",
      allergies: "Peanuts, Codeine",
      doctorName: "Dr. Neha Kulkarni",
      bp: "112/72 mmHg",
      hr: 74,
      temp: "99.1 °F",
      spO2: 99,
    },
  ];

  for (const p of patientsData) {
    const departmentId = createdDepts[p.deptName];
    const doctorId = createdDoctors[p.doctorName];

    const patient = await prisma.patient.upsert({
      where: { mrn: p.mrn },
      update: {},
      create: {
        mrn: p.mrn,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        email: p.email,
        address: p.address,
        departmentId: departmentId,
        status: p.status,
        bloodGroup: p.bloodGroup,
        emergencyName: p.emergencyName,
        emergencyRelation: p.emergencyRelation,
        emergencyPhone: p.emergencyPhone,
        allergies: p.allergies,
        doctorAssignedId: doctorId,
        admissionDate: "2026-10-15",
        organizationId: org.id,
      },
    });

    // Add Vitals
    await prisma.patientVital.create({
      data: {
        patientId: patient.id,
        bloodPressure: p.bp,
        heartRate: p.hr,
        temperature: p.temp,
        spO2: p.spO2,
      },
    });

    // Add Appointment
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctorId,
        departmentId: departmentId,
        date: "2026-10-20",
        time: "10:30 AM",
        type: "Consultation",
        status: "Scheduled",
      },
    });

    // Add Queue Token
    await prisma.queueToken.create({
      data: {
        tokenNumber: `A-${100 + patient.id}`,
        patientId: patient.id,
        doctorId: doctorId,
        departmentId: departmentId,
        status: "Waiting",
        priority: p.status === "Critical" ? "Urgent" : "Normal",
      },
    });
  }

  console.log("✅ 6 Synthetic Patients, Vitals, Appointments, and Queue Tokens seeded!");
  console.log("🎉 CareFlow SQL Database is fully initialized and seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
