import { Prisma } from "@prisma/client";
import prisma from "../../config/db.js";
import { NotFoundError } from "../../utils/errors.js";
import type { z } from "zod";
import type {
  createPatientSchema,
  updatePatientSchema,
  getPatientsQuerySchema,
} from "./patientValidation.js";

type CreatePatientInput = z.infer<typeof createPatientSchema>;
type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
type GetPatientsQuery = z.infer<typeof getPatientsQuerySchema>;

/**
 * Format a Prisma patient record into the CareFlow frontend Patient interface.
 */
export const formatPatientRecord = (patient: any) => {
  const latestVital = patient.vitals && patient.vitals.length > 0 ? patient.vitals[0] : null;

  let parsedAllergies: string[] = ["None known"];
  if (patient.allergies) {
    if (Array.isArray(patient.allergies)) {
      parsedAllergies = patient.allergies;
    } else if (typeof patient.allergies === "string") {
      parsedAllergies = patient.allergies
        .split(",")
        .map((a: string) => a.trim())
        .filter(Boolean);
    }
  }

  return {
    id: patient.id,
    mrn: patient.mrn,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email || "",
    address: patient.address || "",
    departmentId: patient.departmentId,
    department: patient.department?.name || "General Physician",
    status: patient.status,
    bloodGroup: patient.bloodGroup,
    emergencyContact: {
      name: patient.emergencyName || "Next of Kin",
      relation: patient.emergencyRelation || "Family",
      phone: patient.emergencyPhone || patient.phone,
    },
    allergies: parsedAllergies.length > 0 ? parsedAllergies : ["None known"],
    vitals: {
      bloodPressure: latestVital?.bloodPressure || "120/80 mmHg",
      heartRate: latestVital?.heartRate ?? 72,
      temperature: latestVital?.temperature || "98.6 °F",
      spO2: latestVital?.spO2 ?? 98,
      recordedAt: latestVital
        ? new Date(latestVital.recordedAt).toLocaleString()
        : "Initial admission",
    },
    admissionDate: patient.admissionDate || new Date(patient.createdAt).toISOString().split("T")[0],
    doctorAssignedId: patient.doctorAssignedId,
    doctorAssigned: patient.doctorAssigned?.name || "Dr. Sarah Jenkins",
    appointments: (patient.appointments || []).map((apt: any) => ({
      id: apt.id,
      doctorName: apt.doctor?.name || "Assigned Physician",
      department: apt.department?.name || patient.department?.name || "General Physician",
      date: apt.date,
      time: apt.time,
      type: apt.type || "Consultation",
      status: apt.status || "Scheduled",
    })),
    visits: (patient.consultations || []).map((vis: any) => ({
      id: vis.id,
      date: vis.date,
      doctorName: vis.doctor?.name || "Assigned Physician",
      department: patient.department?.name || "General Physician",
      chiefComplaint: vis.chiefComplaint,
      diagnosis: vis.diagnosis,
      treatment: vis.treatment,
      notes: vis.clinicalNotes || "",
    })),
  };
};

/**
 * Resolve departmentId from department name or fallback.
 */
async function resolveDepartmentId(deptNameOrId?: string): Promise<string> {
  if (deptNameOrId) {
    const existingById = await prisma.department.findUnique({
      where: { id: deptNameOrId },
    });
    if (existingById) return existingById.id;

    const existingByName = await prisma.department.findFirst({
      where: { name: { equals: deptNameOrId } },
    });
    if (existingByName) return existingByName.id;
  }

  const defaultDept = await prisma.department.findFirst();
  if (defaultDept) return defaultDept.id;

  const newDept = await prisma.department.create({
    data: {
      name: "General Physician",
      code: "GENP",
      description: "General & Internal Medicine",
    },
  });
  return newDept.id;
}

/**
 * Generate next unique MRN (e.g. CF-2026-007).
 */
async function generateNextMRN(): Promise<string> {
  const count = await prisma.patient.count();
  const nextNum = count + 1;
  const candidate = `CF-2026-${String(nextNum).padStart(3, "0")}`;

  const exists = await prisma.patient.findUnique({ where: { mrn: candidate } });
  if (!exists) return candidate;

  return `CF-2026-${Date.now().toString().slice(-4)}`;
}

export const patientService = {
  /**
   * List patients with optional filtering, search, and pagination.
   */
  async listPatients(query: GetPatientsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {};

    if (query.search) {
      const q = query.search;
      where.OR = [
        { name: { contains: q } },
        { mrn: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.organizationId && query.organizationId !== "all") {
      where.organizationId = query.organizationId;
    }

    if (query.department) {
      where.OR = [
        ...(where.OR || []),
        { department: { name: { contains: query.department } } },
        { departmentId: query.department },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
        include: {
          department: true,
          doctorAssigned: true,
          vitals: {
            orderBy: { recordedAt: "desc" },
            take: 1,
          },
          appointments: {
            include: { doctor: true, department: true },
            orderBy: { createdAt: "desc" },
          },
          consultations: {
            include: { doctor: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
    ]);

    const formatted = records.map(formatPatientRecord);

    return {
      patients: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  /**
   * Get single patient by ID with full vitals and clinical history.
   */
  async getPatientById(id: number) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        department: true,
        doctorAssigned: true,
        vitals: {
          orderBy: { recordedAt: "desc" },
        },
        appointments: {
          include: { doctor: true, department: true },
          orderBy: { createdAt: "desc" },
        },
        consultations: {
          include: { doctor: true, prescriptions: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patient) {
      throw new NotFoundError(`Patient record with ID #${id} was not found.`);
    }

    return formatPatientRecord(patient);
  },

  /**
   * Create a new patient with optional vitals and department mapping.
   */
  async createPatient(input: CreatePatientInput) {
    const departmentId = await resolveDepartmentId(input.departmentId || input.department);
    const mrn = await generateNextMRN();

    let emergencyName = input.emergencyName;
    let emergencyRelation = input.emergencyRelation;
    let emergencyPhone = input.emergencyPhone;

    if (input.emergencyContact) {
      emergencyName = input.emergencyContact.name;
      emergencyRelation = input.emergencyContact.relation;
      emergencyPhone = input.emergencyContact.phone;
    }

    let allergiesStr = "None known";
    if (input.allergies) {
      allergiesStr = Array.isArray(input.allergies)
        ? input.allergies.join(", ")
        : input.allergies;
    }

    // Resolve doctor if name given
    let doctorAssignedId = input.doctorAssignedId;
    if (!doctorAssignedId && input.doctorAssigned) {
      const doc = await prisma.doctor.findFirst({
        where: { name: { contains: input.doctorAssigned } },
      });
      if (doc) doctorAssignedId = doc.id;
    }

    const created = await prisma.$transaction(async (tx) => {
      const newPatient = await tx.patient.create({
        data: {
          mrn,
          name: input.name,
          age: input.age,
          gender: input.gender,
          phone: input.phone,
          email: input.email || null,
          address: input.address || null,
          departmentId,
          status: input.status || "Active",
          bloodGroup: input.bloodGroup || "O+",
          emergencyName,
          emergencyRelation,
          emergencyPhone,
          allergies: allergiesStr,
          doctorAssignedId,
          admissionDate: input.admissionDate || new Date().toISOString().split("T")[0],
        },
        include: {
          department: true,
          doctorAssigned: true,
        },
      });

      if (input.vitals) {
        await tx.patientVital.create({
          data: {
            patientId: newPatient.id,
            bloodPressure: input.vitals.bloodPressure,
            heartRate: input.vitals.heartRate,
            temperature: input.vitals.temperature,
            spO2: input.vitals.spO2,
          },
        });
      } else {
        await tx.patientVital.create({
          data: {
            patientId: newPatient.id,
            bloodPressure: "120/80 mmHg",
            heartRate: 72,
            temperature: "98.6 °F",
            spO2: 98,
          },
        });
      }

      return newPatient;
    });

    return this.getPatientById(created.id);
  },

  /**
   * Update patient details.
   */
  async updatePatient(id: number, input: UpdatePatientInput) {
    const existing = await prisma.patient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Patient record with ID #${id} not found.`);
    }

    let departmentId = existing.departmentId;
    if (input.departmentId || input.department) {
      departmentId = await resolveDepartmentId(input.departmentId || input.department);
    }

    let emergencyName = input.emergencyName;
    let emergencyRelation = input.emergencyRelation;
    let emergencyPhone = input.emergencyPhone;

    if (input.emergencyContact) {
      emergencyName = input.emergencyContact.name;
      emergencyRelation = input.emergencyContact.relation;
      emergencyPhone = input.emergencyContact.phone;
    }

    let allergiesStr: string | undefined = undefined;
    if (input.allergies !== undefined) {
      allergiesStr = Array.isArray(input.allergies)
        ? input.allergies.join(", ")
        : input.allergies;
    }

    let doctorAssignedId = input.doctorAssignedId !== undefined ? input.doctorAssignedId : existing.doctorAssignedId;
    if (input.doctorAssigned) {
      const doc = await prisma.doctor.findFirst({
        where: { name: { contains: input.doctorAssigned } },
      });
      if (doc) doctorAssignedId = doc.id;
    }

    await prisma.$transaction(async (tx) => {
      await tx.patient.update({
        where: { id },
        data: {
          name: input.name,
          age: input.age,
          gender: input.gender,
          phone: input.phone,
          email: input.email !== undefined ? input.email : undefined,
          address: input.address !== undefined ? input.address : undefined,
          departmentId,
          status: input.status,
          bloodGroup: input.bloodGroup,
          emergencyName,
          emergencyRelation,
          emergencyPhone,
          allergies: allergiesStr,
          doctorAssignedId,
          admissionDate: input.admissionDate,
        },
      });

      if (input.vitals) {
        await tx.patientVital.create({
          data: {
            patientId: id,
            bloodPressure: input.vitals.bloodPressure,
            heartRate: input.vitals.heartRate,
            temperature: input.vitals.temperature,
            spO2: input.vitals.spO2,
          },
        });
      }
    });

    return this.getPatientById(id);
  },

  /**
   * Delete patient record.
   */
  async deletePatient(id: number) {
    const existing = await prisma.patient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Patient record with ID #${id} not found.`);
    }

    await prisma.patient.delete({ where: { id } });
    return { success: true, message: `Patient #${id} (${existing.name}) deleted successfully.` };
  },
};
