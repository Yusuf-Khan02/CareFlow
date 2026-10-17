import type { Patient, Doctor } from "../types";

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    mrn: "CF-2026-001",
    name: "Rahul Sharma",
    age: 42,
    gender: "Male",
    phone: "+91 98765 43210",
    email: "rahul.sharma@demo.org",
    address: "Block B-14, Green Park, New Delhi",
    department: "Cardiology",
    status: "Active",
    bloodGroup: "O+",
    emergencyContact: {
      name: "Sunita Sharma",
      relation: "Spouse",
      phone: "+91 98765 43299",
    },
    allergies: ["Penicillin", "Sulfa Drugs"],
    vitals: {
      bloodPressure: "128/82 mmHg",
      heartRate: 76,
      temperature: "98.6 °F",
      spO2: 98,
      recordedAt: "Today, 08:30 AM",
    },
    admissionDate: "2026-10-14",
    doctorAssigned: "Dr. Rahul Sharma",
    appointments: [
      {
        id: "apt-101",
        doctorName: "Dr. Rahul Sharma",
        department: "Cardiology",
        date: "2026-10-18",
        time: "10:30 AM",
        type: "Follow-up",
        status: "Scheduled",
      },
      {
        id: "apt-102",
        doctorName: "Dr. Rahul Sharma",
        department: "Cardiology",
        date: "2026-10-14",
        time: "09:00 AM",
        type: "Consultation",
        status: "Completed",
      },
    ],
    visits: [
      {
        id: "vis-1",
        date: "2026-10-14",
        doctorName: "Dr. Rahul Sharma",
        department: "Cardiology",
        chiefComplaint: "Mild chest tightness upon moderate exertion.",
        diagnosis: "Stage 1 Essential Hypertension with mild angina pectoris.",
        treatment: "Prescribed Amlodipine 5mg daily. Advised low-sodium DASH diet and ECG.",
        notes: "Patient tolerating medications well. Repeat lipid panel ordered for next visit.",
      },
    ],
  },
  {
    id: 2,
    mrn: "CF-2026-002",
    name: "Aisha Khan",
    age: 31,
    gender: "Female",
    phone: "+91 98765 43211",
    email: "aisha.khan@demo.org",
    address: "72 Maple Avenue, Bandra West, Mumbai",
    department: "Neurology",
    status: "Active",
    bloodGroup: "A+",
    emergencyContact: {
      name: "Zafar Khan",
      relation: "Brother",
      phone: "+91 98765 43288",
    },
    allergies: ["None known"],
    vitals: {
      bloodPressure: "115/75 mmHg",
      heartRate: 72,
      temperature: "98.4 °F",
      spO2: 99,
      recordedAt: "Today, 09:15 AM",
    },
    admissionDate: "2026-10-15",
    doctorAssigned: "Dr. Ananya Sen",
    appointments: [
      {
        id: "apt-201",
        doctorName: "Dr. Ananya Sen",
        department: "Neurology",
        date: "2026-10-20",
        time: "11:00 AM",
        type: "Consultation",
        status: "Scheduled",
      },
    ],
    visits: [
      {
        id: "vis-2",
        date: "2026-10-15",
        doctorName: "Dr. Ananya Sen",
        department: "Neurology",
        chiefComplaint: "Unilateral throbbing migraine accompanied by photophobia.",
        diagnosis: "Episodic Migraine without aura.",
        treatment: "Sumatriptan 50mg for acute episodes. Magnesium glycinate supplementation.",
        notes: "Advised headache diary tracking trigger factors.",
      },
    ],
  },
  {
    id: 3,
    mrn: "CF-2026-003",
    name: "Arjun Mehta",
    age: 56,
    gender: "Male",
    phone: "+91 98765 43212",
    email: "arjun.mehta@demo.org",
    address: "Flat 402, Royal Palms, Pune",
    department: "Gastro",
    status: "Critical",
    bloodGroup: "B+",
    emergencyContact: {
      name: "Meera Mehta",
      relation: "Daughter",
      phone: "+91 98765 43277",
    },
    allergies: ["Aspirin", "Ibuprofen"],
    vitals: {
      bloodPressure: "142/94 mmHg",
      heartRate: 98,
      temperature: "100.8 °F",
      spO2: 94,
      recordedAt: "Today, 07:45 AM",
    },
    admissionDate: "2026-10-16",
    doctorAssigned: "Dr. Vikram Patel",
    appointments: [
      {
        id: "apt-301",
        doctorName: "Dr. Vikram Patel",
        department: "Gastro",
        date: "2026-10-17",
        time: "02:30 PM",
        type: "Emergency",
        status: "In-Progress",
      },
    ],
    visits: [
      {
        id: "vis-3",
        date: "2026-10-16",
        doctorName: "Dr. Vikram Patel",
        department: "Gastro",
        chiefComplaint: "Severe acute epigastric pain radiating to back with vomiting.",
        diagnosis: "Acute Pancreatitis with localized inflammation.",
        treatment: "Intravenous crystalloid fluids, NPO protocol, analgesia via PCA.",
        notes: "Serum amylase and lipase levels 3x normal limit. ICU step-down monitoring.",
      },
    ],
  },
  {
    id: 4,
    mrn: "CF-2026-004",
    name: "Priya Singh",
    age: 28,
    gender: "Female",
    phone: "+91 98765 43213",
    email: "priya.singh@demo.org",
    address: "Sector 18, Noida, Uttar Pradesh",
    department: "Orthology",
    status: "Active",
    bloodGroup: "AB+",
    emergencyContact: {
      name: "Ramesh Singh",
      relation: "Father",
      phone: "+91 98765 43266",
    },
    allergies: ["Latex"],
    vitals: {
      bloodPressure: "118/76 mmHg",
      heartRate: 68,
      temperature: "98.5 °F",
      spO2: 99,
      recordedAt: "Yesterday, 04:00 PM",
    },
    admissionDate: "2026-10-12",
    doctorAssigned: "Dr. Kabir Malhotra",
    appointments: [
      {
        id: "apt-401",
        doctorName: "Dr. Kabir Malhotra",
        department: "Orthology",
        date: "2026-10-19",
        time: "03:15 PM",
        type: "Follow-up",
        status: "Scheduled",
      },
    ],
    visits: [
      {
        id: "vis-4",
        date: "2026-10-12",
        doctorName: "Dr. Kabir Malhotra",
        department: "Orthology",
        chiefComplaint: "Right knee anterior drawer instability following football injury.",
        diagnosis: "Grade II ACL sprain with lateral meniscus irritation.",
        treatment: "Knee immobilizer brace, RICE therapy, scheduled MRI scan.",
        notes: "Referred to physical rehabilitation unit.",
      },
    ],
  },
  {
    id: 5,
    mrn: "CF-2026-005",
    name: "Mohammed Sameer",
    age: 64,
    gender: "Male",
    phone: "+91 98765 43214",
    email: "sameer.m@demo.org",
    address: "Old City, Charminar Lane, Hyderabad",
    department: "General Physician",
    status: "Discharged",
    bloodGroup: "O-",
    emergencyContact: {
      name: "Farhan Sameer",
      relation: "Son",
      phone: "+91 98765 43255",
    },
    allergies: ["None known"],
    vitals: {
      bloodPressure: "122/80 mmHg",
      heartRate: 70,
      temperature: "98.2 °F",
      spO2: 98,
      recordedAt: "Yesterday, 11:30 AM",
    },
    admissionDate: "2026-10-10",
    doctorAssigned: "Dr. Sarah Jenkins",
    appointments: [
      {
        id: "apt-501",
        doctorName: "Dr. Sarah Jenkins",
        department: "General Physician",
        date: "2026-10-16",
        time: "10:00 AM",
        type: "Routine Checkup",
        status: "Completed",
      },
    ],
    visits: [
      {
        id: "vis-5",
        date: "2026-10-10",
        doctorName: "Dr. Sarah Jenkins",
        department: "General Physician",
        chiefComplaint: "Post-viral fatigue and seasonal respiratory congestion.",
        diagnosis: "Resolving Bronchitis; vital signs stable.",
        treatment: "Inhaled bronchodilator for 5 days. High oral hydration.",
        notes: "Full discharge cleared. Instructed to return if fever recurs.",
      },
    ],
  },
  {
    id: 6,
    mrn: "CF-2026-006",
    name: "Neha Verma",
    age: 37,
    gender: "Female",
    phone: "+91 98765 43215",
    email: "neha.verma@demo.org",
    address: "Koramangala 4th Block, Bengaluru",
    department: "Pediatrics",
    status: "Active",
    bloodGroup: "B-",
    emergencyContact: {
      name: "Amit Verma",
      relation: "Spouse",
      phone: "+91 98765 43244",
    },
    allergies: ["Peanuts", "Codeine"],
    vitals: {
      bloodPressure: "112/72 mmHg",
      heartRate: 74,
      temperature: "99.1 °F",
      spO2: 99,
      recordedAt: "Today, 10:00 AM",
    },
    admissionDate: "2026-10-16",
    doctorAssigned: "Dr. Neha Kulkarni",
    appointments: [
      {
        id: "apt-601",
        doctorName: "Dr. Neha Kulkarni",
        department: "Pediatrics",
        date: "2026-10-18",
        time: "04:00 PM",
        type: "Consultation",
        status: "Scheduled",
      },
    ],
    visits: [
      {
        id: "vis-6",
        date: "2026-10-16",
        doctorName: "Dr. Neha Kulkarni",
        department: "Pediatrics",
        chiefComplaint: "Accompanied child for developmental milestone evaluation & pediatric review.",
        diagnosis: "Normal developmental milestones; mild pediatric atopic dermatitis.",
        treatment: "Emollient barrier cream and mild hydrocortisone 1% topical.",
        notes: "Routine vaccination schedule verified.",
      },
    ],
  },
  {
    id: 7,
    mrn: "CF-2026-007",
    name: "Rohan Deshmukh",
    age: 49,
    gender: "Male",
    phone: "+91 98765 43216",
    email: "rohan.deshmukh@demo.org",
    address: "Shivaji Nagar, Nagpur, Maharashtra",
    department: "Cardiology",
    status: "Active",
    bloodGroup: "A-",
    emergencyContact: {
      name: "Sneha Deshmukh",
      relation: "Spouse",
      phone: "+91 98765 43233",
    },
    allergies: ["None known"],
    vitals: {
      bloodPressure: "135/88 mmHg",
      heartRate: 80,
      temperature: "98.6 °F",
      spO2: 97,
      recordedAt: "Today, 09:30 AM",
    },
    admissionDate: "2026-10-15",
    doctorAssigned: "Dr. Rahul Sharma",
    appointments: [
      {
        id: "apt-701",
        doctorName: "Dr. Rahul Sharma",
        department: "Cardiology",
        date: "2026-10-21",
        time: "09:30 AM",
        type: "Follow-up",
        status: "Scheduled",
      },
    ],
    visits: [
      {
        id: "vis-7",
        date: "2026-10-15",
        doctorName: "Dr. Rahul Sharma",
        department: "Cardiology",
        chiefComplaint: "Palpitations during evening walks.",
        diagnosis: "Sinus Tachycardia; Holter monitor placed.",
        treatment: "Metoprolol succinate 25mg daily.",
        notes: "Review Holter recording in 48 hours.",
      },
    ],
  },
  {
    id: 8,
    mrn: "CF-2026-008",
    name: "Kavita Nair",
    age: 62,
    gender: "Female",
    phone: "+91 98765 43217",
    email: "kavita.nair@demo.org",
    address: "Panampilly Nagar, Kochi, Kerala",
    department: "General Physician",
    status: "Active",
    bloodGroup: "O+",
    emergencyContact: {
      name: "Siddharth Nair",
      relation: "Son",
      phone: "+91 98765 43222",
    },
    allergies: ["Ciprofloxacin"],
    vitals: {
      bloodPressure: "130/84 mmHg",
      heartRate: 75,
      temperature: "98.7 °F",
      spO2: 98,
      recordedAt: "Today, 10:45 AM",
    },
    admissionDate: "2026-10-13",
    doctorAssigned: "Dr. Sarah Jenkins",
    appointments: [
      {
        id: "apt-801",
        doctorName: "Dr. Sarah Jenkins",
        department: "General Physician",
        date: "2026-10-19",
        time: "11:30 AM",
        type: "Routine Checkup",
        status: "Scheduled",
      },
    ],
    visits: [
      {
        id: "vis-8",
        date: "2026-10-13",
        doctorName: "Dr. Sarah Jenkins",
        department: "General Physician",
        chiefComplaint: "Routine quarterly diabetic and metabolic screening.",
        diagnosis: "Type 2 Diabetes Mellitus under fair glycemic control (HbA1c 6.8%).",
        treatment: "Continue Metformin 500mg twice daily with meals.",
        notes: "Ophthalmology fundus exam recommended next month.",
      },
    ],
  },
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: "Dr. Rahul Sharma",
    title: "Senior Consultant Cardiologist",
    qualification: "MBBS, MD (Medicine), DM (Cardiology), FACC",
    specialty: "Interventional Cardiology",
    department: "Cardiology",
    experienceYears: 16,
    room: "Consultation Suite 101",
    email: "dr.sharma@careflow.demo",
    phone: "+91 98111 00001",
    status: "On Duty",
    rating: 4.9,
    consultationFee: 800,
    bio: "Specializing in coronary interventions, hypertension management, and preventative cardiology with over 16 years of academic and clinical excellence.",
    schedule: [
      { day: "Monday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 4 },
      { day: "Tuesday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 2 },
      { day: "Wednesday", shifts: "02:00 PM - 06:00 PM", isAvailable: true, slotsRemaining: 6 },
      { day: "Thursday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 3 },
      { day: "Friday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 5 },
      { day: "Saturday", shifts: "10:00 AM - 02:00 PM", isAvailable: false, slotsRemaining: 0 },
    ],
  },
  {
    id: 2,
    name: "Dr. Ananya Sen",
    title: "Lead Neuro Physician",
    qualification: "MBBS, MD (General Medicine), DM (Neurology)",
    specialty: "Neuro-vascular & Migraine Care",
    department: "Neurology",
    experienceYears: 12,
    room: "Consultation Suite 204",
    email: "dr.sen@careflow.demo",
    phone: "+91 98111 00002",
    status: "In Consultation",
    rating: 4.8,
    consultationFee: 850,
    bio: "Expertise in complex migraine syndromes, neuro-muscular conditions, stroke rehabilitation protocols, and diagnostic EEG interpretation.",
    schedule: [
      { day: "Monday", shifts: "10:00 AM - 02:00 PM", isAvailable: true, slotsRemaining: 3 },
      { day: "Tuesday", shifts: "02:00 PM - 06:00 PM", isAvailable: true, slotsRemaining: 4 },
      { day: "Wednesday", shifts: "10:00 AM - 02:00 PM", isAvailable: true, slotsRemaining: 2 },
      { day: "Thursday", shifts: "10:00 AM - 02:00 PM", isAvailable: true, slotsRemaining: 5 },
      { day: "Friday", shifts: "02:00 PM - 06:00 PM", isAvailable: true, slotsRemaining: 1 },
      { day: "Saturday", shifts: "10:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 4 },
    ],
  },
  {
    id: 3,
    name: "Dr. Vikram Patel",
    title: "Senior Gastroenterologist",
    qualification: "MBBS, MD, DNB (Gastroenterology)",
    specialty: "Hepatobiliary & Pancreatic Medicine",
    department: "Gastro",
    experienceYears: 18,
    room: "Consultation Suite 108",
    email: "dr.patel@careflow.demo",
    phone: "+91 98111 00003",
    status: "On Duty",
    rating: 4.9,
    consultationFee: 750,
    bio: "Pioneer in therapeutic endoscopy, pancreatitis management, liver disease therapies, and clinical gastroenterological research.",
    schedule: [
      { day: "Monday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 5 },
      { day: "Tuesday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 6 },
      { day: "Wednesday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 3 },
      { day: "Thursday", shifts: "02:00 PM - 06:00 PM", isAvailable: true, slotsRemaining: 4 },
      { day: "Friday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 2 },
      { day: "Saturday", shifts: "10:00 AM - 02:00 PM", isAvailable: false, slotsRemaining: 0 },
    ],
  },
  {
    id: 4,
    name: "Dr. Kabir Malhotra",
    title: "Consultant Orthopedic Surgeon",
    qualification: "MBBS, MS (Orthopedics), MCh (Ortho, UK)",
    specialty: "Sports Injuries & Joint Arthroscopy",
    department: "Orthology",
    experienceYears: 14,
    room: "Consultation Suite 305",
    email: "dr.malhotra@careflow.demo",
    phone: "+91 98111 00004",
    status: "On Duty",
    rating: 4.7,
    consultationFee: 700,
    bio: "Focusing on minimally invasive joint arthroscopy, ACL reconstruction, trauma surgery, and complex sports injury physical rehab programs.",
    schedule: [
      { day: "Monday", shifts: "01:00 PM - 05:00 PM", isAvailable: true, slotsRemaining: 4 },
      { day: "Tuesday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 3 },
      { day: "Wednesday", shifts: "01:00 PM - 05:00 PM", isAvailable: true, slotsRemaining: 5 },
      { day: "Thursday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 2 },
      { day: "Friday", shifts: "01:00 PM - 05:00 PM", isAvailable: true, slotsRemaining: 6 },
      { day: "Saturday", shifts: "10:00 AM - 02:00 PM", isAvailable: true, slotsRemaining: 1 },
    ],
  },
  {
    id: 5,
    name: "Dr. Sarah Jenkins",
    title: "Chief of Internal Medicine",
    qualification: "MBBS, MD (Internal Medicine), MRCP (London)",
    specialty: "Adult Multi-System & Preventive Health",
    department: "General Physician",
    experienceYears: 20,
    room: "Consultation Suite 102",
    email: "dr.jenkins@careflow.demo",
    phone: "+91 98111 00005",
    status: "On Duty",
    rating: 5.0,
    consultationFee: 650,
    bio: "Senior clinician overseeing outpatient internal medicine, adult diagnostic assessments, chronic metabolic care, and clinical operations quality.",
    schedule: [
      { day: "Monday", shifts: "08:30 AM - 01:30 PM", isAvailable: true, slotsRemaining: 6 },
      { day: "Tuesday", shifts: "08:30 AM - 01:30 PM", isAvailable: true, slotsRemaining: 5 },
      { day: "Wednesday", shifts: "08:30 AM - 01:30 PM", isAvailable: true, slotsRemaining: 4 },
      { day: "Thursday", shifts: "08:30 AM - 01:30 PM", isAvailable: true, slotsRemaining: 7 },
      { day: "Friday", shifts: "08:30 AM - 01:30 PM", isAvailable: true, slotsRemaining: 3 },
      { day: "Saturday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 2 },
    ],
  },
  {
    id: 6,
    name: "Dr. Neha Kulkarni",
    title: "Consultant Pediatrician",
    qualification: "MBBS, DCH, DNB (Pediatrics)",
    specialty: "Neonatal & Child Development",
    department: "Pediatrics",
    experienceYears: 10,
    room: "Child Wellness Wing 201",
    email: "dr.kulkarni@careflow.demo",
    phone: "+91 98111 00006",
    status: "On Leave",
    rating: 4.9,
    consultationFee: 600,
    bio: "Dedicated pediatric specialist addressing infant wellness, immunization protocols, developmental milestones, and childhood respiratory health.",
    schedule: [
      { day: "Monday", shifts: "09:00 AM - 01:00 PM", isAvailable: false, slotsRemaining: 0 },
      { day: "Tuesday", shifts: "09:00 AM - 01:00 PM", isAvailable: false, slotsRemaining: 0 },
      { day: "Wednesday", shifts: "02:00 PM - 06:00 PM", isAvailable: true, slotsRemaining: 5 },
      { day: "Thursday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 6 },
      { day: "Friday", shifts: "09:00 AM - 01:00 PM", isAvailable: true, slotsRemaining: 4 },
      { day: "Saturday", shifts: "10:00 AM - 02:00 PM", isAvailable: true, slotsRemaining: 3 },
    ],
  },
];

// LocalStorage helpers to persist modifications during development session
const PATIENTS_STORAGE_KEY = "careflow_patients_data";
const DOCTORS_STORAGE_KEY = "careflow_doctors_data";

export const getStoredPatients = (): Patient[] => {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PATIENTS;
  }
};

export const saveStoredPatients = (patients: Patient[]): void => {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error("Failed to save patients to localStorage", err);
  }
};

export const getStoredDoctors = (): Doctor[] => {
  try {
    const raw = localStorage.getItem(DOCTORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(INITIAL_DOCTORS));
      return INITIAL_DOCTORS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DOCTORS;
  }
};

export const saveStoredDoctors = (doctors: Doctor[]): void => {
  try {
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
  } catch (err) {
    console.error("Failed to save doctors to localStorage", err);
  }
};

const APPOINTMENTS_STORAGE_KEY = "careflow_appointments_data";

export const INITIAL_APPOINTMENTS: any[] = [
  {
    id: "apt-2026-001",
    patientId: 1,
    patientName: "Rahul Sharma",
    patientMrn: "CF-2026-001",
    patientPhone: "+91 98765 43210",
    patientGender: "Male",
    patientAge: 42,
    doctorId: 1,
    doctorName: "Dr. Rahul Sharma",
    doctorSpecialty: "Interventional Cardiology",
    doctorRoom: "Cardio Suite 204",
    departmentId: "Cardiology",
    department: "Cardiology",
    date: "2026-10-20",
    time: "10:30 AM",
    type: "Follow-up",
    status: "Scheduled",
    notes: "Post-hypertension therapy review and ECG analysis",
    createdAt: "2026-10-15T09:00:00.000Z",
    updatedAt: "2026-10-15T09:00:00.000Z",
  },
  {
    id: "apt-2026-002",
    patientId: 2,
    patientName: "Aisha Khan",
    patientMrn: "CF-2026-002",
    patientPhone: "+91 98765 43211",
    patientGender: "Female",
    patientAge: 31,
    doctorId: 2,
    doctorName: "Dr. Ananya Sen",
    doctorSpecialty: "Cognitive Neurology & Epilepsy",
    doctorRoom: "Neuro Center 302",
    departmentId: "Neurology",
    department: "Neurology",
    date: "2026-10-20",
    time: "11:30 AM",
    type: "Consultation",
    status: "Confirmed",
    notes: "Persistent migraine episodes with visual aura",
    createdAt: "2026-10-16T11:00:00.000Z",
    updatedAt: "2026-10-16T11:00:00.000Z",
  },
  {
    id: "apt-2026-003",
    patientId: 3,
    patientName: "Vikram Malhotra",
    patientMrn: "CF-2026-003",
    patientPhone: "+91 98765 43212",
    patientGender: "Male",
    patientAge: 58,
    doctorId: 3,
    doctorName: "Dr. Vikram Patel",
    doctorSpecialty: "Hepatobiliary & Pancreatic Medicine",
    doctorRoom: "Consultation Suite 108",
    departmentId: "Gastro",
    department: "Gastro",
    date: "2026-10-20",
    time: "02:30 PM",
    type: "Routine Checkup",
    status: "Checked-in",
    notes: "Routine abdominal ultrasound follow-up",
    createdAt: "2026-10-17T08:30:00.000Z",
    updatedAt: "2026-10-17T08:30:00.000Z",
  },
  {
    id: "apt-2026-004",
    patientId: 4,
    patientName: "Priya Singh",
    patientMrn: "CF-2026-004",
    patientPhone: "+91 98765 43213",
    patientGender: "Female",
    patientAge: 26,
    doctorId: 4,
    doctorName: "Dr. Kabir Malhotra",
    doctorSpecialty: "Sports Injuries & Joint Arthroscopy",
    doctorRoom: "Consultation Suite 305",
    departmentId: "Orthology",
    department: "Orthology",
    date: "2026-10-20",
    time: "03:30 PM",
    type: "Consultation",
    status: "In-Progress",
    notes: "Right knee arthroscopy pre-op evaluation",
    createdAt: "2026-10-17T14:00:00.000Z",
    updatedAt: "2026-10-17T14:00:00.000Z",
  },
  {
    id: "apt-2026-005",
    patientId: 5,
    patientName: "Mohammed Sameer",
    patientMrn: "CF-2026-005",
    patientPhone: "+91 98765 43214",
    patientGender: "Male",
    patientAge: 64,
    doctorId: 5,
    doctorName: "Dr. Sarah Jenkins",
    doctorSpecialty: "Adult Multi-System & Preventive Health",
    doctorRoom: "Consultation Suite 102",
    departmentId: "General Physician",
    department: "General Physician",
    date: "2026-10-19",
    time: "09:30 AM",
    type: "Follow-up",
    status: "Completed",
    notes: "Annual diabetic metabolic wellness assessment",
    createdAt: "2026-10-14T10:00:00.000Z",
    updatedAt: "2026-10-19T10:15:00.000Z",
  },
  {
    id: "apt-2026-006",
    patientId: 6,
    patientName: "Neha Verma",
    patientMrn: "CF-2026-006",
    patientPhone: "+91 98765 43215",
    patientGender: "Female",
    patientAge: 37,
    doctorId: 6,
    doctorName: "Dr. Neha Kulkarni",
    doctorSpecialty: "Neonatal & Child Development",
    doctorRoom: "Child Wellness Wing 201",
    departmentId: "Pediatrics",
    department: "Pediatrics",
    date: "2026-10-21",
    time: "10:00 AM",
    type: "Consultation",
    status: "Scheduled",
    notes: "Pediatric wellness examination",
    createdAt: "2026-10-18T08:00:00.000Z",
    updatedAt: "2026-10-18T08:00:00.000Z",
  },
];

export const getStoredAppointments = (): any[] => {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
};

export const saveStoredAppointments = (appointments: any[]): void => {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (err) {
    console.error("Failed to save appointments to localStorage", err);
  }
};
