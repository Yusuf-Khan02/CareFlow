import prisma from "../../config/db.js";
import { NotFoundError } from "../../utils/errors.js";
import type { z } from "zod";
import type {
  createConsultationSchema,
  updateConsultationSchema,
  getConsultationsQuerySchema,
  createPrescriptionSchema,
  getPrescriptionsQuerySchema,
} from "./encounterValidation.js";

type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
type GetConsultationsQuery = z.infer<typeof getConsultationsQuerySchema>;
type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
type GetPrescriptionsQuery = z.infer<typeof getPrescriptionsQuerySchema>;

const formatConsultation = (c: any) => ({
  id: c.id,
  patientId: c.patientId,
  patientName: c.patient?.name || "Patient",
  patientMrn: c.patient?.mrn || "N/A",
  patientGender: c.patient?.gender || "",
  patientAge: c.patient?.age || 0,
  patientPhone: c.patient?.phone || "",
  patientBloodGroup: c.patient?.bloodGroup || "",
  allergies: c.patient?.allergies || "None known",
  latestVitals: c.patient?.vitals?.[0] || null,
  doctorId: c.doctorId,
  doctorName: c.doctor?.name || "Physician",
  doctorSpecialty: c.doctor?.specialty || "",
  doctorRoom: c.doctor?.room || "Consultation Suite",
  appointmentId: c.appointmentId || null,
  date: c.date,
  chiefComplaint: c.chiefComplaint,
  diagnosis: c.diagnosis,
  treatment: c.treatment,
  clinicalNotes: c.clinicalNotes,
  prescriptions: (c.prescriptions || []).map((rx: any) => ({
    id: rx.id,
    medicationName: rx.medicationName,
    dosage: rx.dosage,
    route: rx.route,
    frequency: rx.frequency,
    duration: rx.duration,
    instructions: rx.instructions,
    status: rx.status,
    createdAt: rx.createdAt,
  })),
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

export const encounterService = {
  /**
   * List clinical consultation encounters.
   */
  async listConsultations(query: GetConsultationsQuery) {
    const where: any = {};

    if (query.patientId) {
      where.patientId = query.patientId;
    }
    if (query.doctorId) {
      where.doctorId = query.doctorId;
    }
    if (query.appointmentId) {
      where.appointmentId = query.appointmentId;
    }
    if (query.date) {
      where.date = query.date;
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { chiefComplaint: { contains: q } },
        { diagnosis: { contains: q } },
        { treatment: { contains: q } },
        { patient: { name: { contains: q } } },
        { patient: { mrn: { contains: q } } },
        { doctor: { name: { contains: q } } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const [total, consultations] = await Promise.all([
      prisma.consultation.count({ where }),
      prisma.consultation.findMany({
        where,
        include: {
          patient: {
            include: {
              vitals: { orderBy: { recordedAt: "desc" }, take: 1 },
            },
          },
          doctor: true,
          prescriptions: true,
        },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    return {
      consultations: consultations.map(formatConsultation),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * Retrieve single consultation with prescriptions and patient context.
   */
  async getConsultationById(id: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            vitals: { orderBy: { recordedAt: "desc" }, take: 1 },
          },
        },
        doctor: true,
        prescriptions: true,
      },
    });

    if (!consultation) {
      throw new NotFoundError(`Consultation #${id} not found.`);
    }

    return formatConsultation(consultation);
  },

  /**
   * Record and complete a consultation encounter, link prescriptions, and close queue tokens.
   */
  async createConsultation(input: CreateConsultationInput) {
    // 1. Verify Patient & Doctor
    const patient = await prisma.patient.findUnique({ where: { id: input.patientId } });
    if (!patient) {
      throw new NotFoundError(`Patient with ID #${input.patientId} does not exist.`);
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: input.doctorId } });
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID #${input.doctorId} does not exist.`);
    }

    const todayDate = input.date || new Date().toISOString().split("T")[0];

    // 2. Execute Transaction: Save Encounter, Save Prescriptions, Close Appointment & Queue
    const result = await prisma.$transaction(async (tx) => {
      // Create Consultation
      const newConsultation = await tx.consultation.create({
        data: {
          patientId: input.patientId,
          doctorId: input.doctorId,
          appointmentId: input.appointmentId || null,
          date: todayDate,
          chiefComplaint: input.chiefComplaint,
          diagnosis: input.diagnosis,
          treatment: input.treatment,
          clinicalNotes: input.clinicalNotes || null,
        },
      });

      // Create Prescriptions if provided
      if (input.prescriptions && input.prescriptions.length > 0) {
        for (const rx of input.prescriptions) {
          await tx.prescription.create({
            data: {
              consultationId: newConsultation.id,
              patientId: input.patientId,
              doctorId: input.doctorId,
              medicationName: rx.medicationName,
              dosage: rx.dosage,
              route: rx.route || "Oral",
              frequency: rx.frequency,
              duration: rx.duration,
              instructions: rx.instructions || null,
              status: "Active",
            },
          });
        }
      }

      // If linked to an appointment, mark appointment as Completed
      if (input.appointmentId) {
        await tx.appointment.updateMany({
          where: { id: input.appointmentId },
          data: { status: "Completed" },
        });
      }

      // Complete any active queue token for this patient & doctor
      await tx.queueToken.updateMany({
        where: {
          patientId: input.patientId,
          status: { in: ["Waiting", "Called", "In-Consultation"] },
        },
        data: {
          status: "Completed",
          completedAt: new Date(),
        },
      });

      return newConsultation;
    });

    return this.getConsultationById(result.id);
  },

  /**
   * Update clinical encounter notes.
   */
  async updateConsultation(id: string, input: UpdateConsultationInput) {
    const existing = await prisma.consultation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Consultation #${id} not found.`);
    }

    await prisma.consultation.update({
      where: { id },
      data: {
        chiefComplaint: input.chiefComplaint,
        diagnosis: input.diagnosis,
        treatment: input.treatment,
        clinicalNotes: input.clinicalNotes !== undefined ? input.clinicalNotes : undefined,
      },
    });

    return this.getConsultationById(id);
  },

  /**
   * List prescriptions with filters.
   */
  async listPrescriptions(query: GetPrescriptionsQuery) {
    const where: any = {};

    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.consultationId) where.consultationId = query.consultationId;
    if (query.status && query.status !== "all") where.status = query.status;

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { medicationName: { contains: q } },
        { instructions: { contains: q } },
        { patient: { name: { contains: q } } },
        { doctor: { name: { contains: q } } },
      ];
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        consultation: true,
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return prescriptions.map((p) => ({
      id: p.id,
      consultationId: p.consultationId,
      patientId: p.patientId,
      patientName: p.patient?.name,
      patientMrn: p.patient?.mrn,
      doctorId: p.doctorId,
      doctorName: p.doctor?.name,
      medicationName: p.medicationName,
      dosage: p.dosage,
      route: p.route,
      frequency: p.frequency,
      duration: p.duration,
      instructions: p.instructions,
      status: p.status,
      date: p.consultation?.date || new Date(p.createdAt).toISOString().split("T")[0],
      createdAt: p.createdAt,
    }));
  },

  /**
   * Create standalone or encounter-linked prescription.
   */
  async createPrescription(input: CreatePrescriptionInput) {
    const patient = await prisma.patient.findUnique({ where: { id: input.patientId } });
    if (!patient) throw new NotFoundError(`Patient #${input.patientId} not found.`);

    const doctor = await prisma.doctor.findUnique({ where: { id: input.doctorId } });
    if (!doctor) throw new NotFoundError(`Doctor #${input.doctorId} not found.`);

    const rx = await prisma.prescription.create({
      data: {
        patientId: input.patientId,
        doctorId: input.doctorId,
        consultationId: input.consultationId || null,
        medicationName: input.medicationName,
        dosage: input.dosage,
        route: input.route || "Oral",
        frequency: input.frequency,
        duration: input.duration,
        instructions: input.instructions || null,
        status: "Active",
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return rx;
  },

  /**
   * Cancel a prescription.
   */
  async cancelPrescription(id: string) {
    const rx = await prisma.prescription.findUnique({ where: { id } });
    if (!rx) throw new NotFoundError(`Prescription #${id} not found.`);

    const updated = await prisma.prescription.update({
      where: { id },
      data: { status: "Cancelled" },
    });

    return updated;
  },
};
