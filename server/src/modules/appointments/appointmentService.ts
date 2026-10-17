import prisma from "../../config/db.js";
import { NotFoundError, ConflictError, BadRequestError } from "../../utils/errors.js";
import type { z } from "zod";
import type {
  createAppointmentSchema,
  updateAppointmentSchema,
  getAppointmentsQuerySchema,
} from "./appointmentValidation.js";

type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
type GetAppointmentsQuery = z.infer<typeof getAppointmentsQuerySchema>;

const STANDARD_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

const formatAppointment = (apt: any) => ({
  id: apt.id,
  patientId: apt.patientId,
  patientName: apt.patient?.name || "Unknown Patient",
  patientMrn: apt.patient?.mrn || "N/A",
  patientPhone: apt.patient?.phone || "",
  patientGender: apt.patient?.gender || "",
  patientAge: apt.patient?.age || 0,
  doctorId: apt.doctorId,
  doctorName: apt.doctor?.name || "Assigned Physician",
  doctorSpecialty: apt.doctor?.specialty || "",
  doctorRoom: apt.doctor?.room || "",
  departmentId: apt.departmentId,
  department: apt.department?.name || "General Clinic",
  date: apt.date,
  time: apt.time,
  type: apt.type,
  status: apt.status,
  notes: apt.notes,
  createdAt: apt.createdAt,
  updatedAt: apt.updatedAt,
});

export const appointmentService = {
  /**
   * List appointments with date, doctor, department, and status filters.
   */
  async listAppointments(query: GetAppointmentsQuery) {
    const where: any = {};

    if (query.date) {
      where.date = query.date;
    } else if (query.startDate && query.endDate) {
      where.date = {
        gte: query.startDate,
        lte: query.endDate,
      };
    } else if (query.startDate) {
      where.date = { gte: query.startDate };
    } else if (query.endDate) {
      where.date = { lte: query.endDate };
    }

    if (query.doctorId) {
      where.doctorId = query.doctorId;
    }

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.status && query.status !== "all" && query.status !== "All") {
      where.status = query.status;
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { patient: { name: { contains: q } } },
        { patient: { mrn: { contains: q } } },
        { doctor: { name: { contains: q } } },
        { department: { name: { contains: q } } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        include: {
          patient: true,
          doctor: true,
          department: true,
        },
        orderBy: [{ date: "desc" }, { time: "asc" }],
        skip,
        take: limit,
      }),
    ]);

    return {
      appointments: appointments.map(formatAppointment),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * Get single appointment by UUID.
   */
  async getAppointmentById(id: string) {
    const apt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            vitals: { orderBy: { recordedAt: "desc" }, take: 1 },
          },
        },
        doctor: {
          include: {
            schedules: true,
          },
        },
        department: true,
        consultation: true,
      },
    });

    if (!apt) {
      throw new NotFoundError(`Appointment #${id} not found.`);
    }

    return formatAppointment(apt);
  },

  /**
   * Book a new appointment with double-booking prevention.
   */
  async createAppointment(input: CreateAppointmentInput) {
    // 1. Verify Patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: input.patientId },
    });
    if (!patient) {
      throw new NotFoundError(`Patient with ID #${input.patientId} does not exist.`);
    }

    // 2. Verify Doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: input.doctorId },
      include: { department: true },
    });
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID #${input.doctorId} does not exist.`);
    }

    // 3. Resolve department
    const departmentId = input.departmentId || doctor.departmentId;

    // 4. Double-Booking Prevention:
    // Check if the doctor already has an active appointment on the specified date & time slot
    const existingConflict = await prisma.appointment.findFirst({
      where: {
        doctorId: input.doctorId,
        date: input.date,
        time: input.time,
        status: { notIn: ["Cancelled"] },
      },
      include: { patient: true },
    });

    if (existingConflict) {
      throw new ConflictError(
        `Doctor ${doctor.name} already has an active booking at ${input.time} on ${input.date}. Please select another time slot.`
      );
    }

    // 5. Patient Double-Booking Prevention:
    // Check if the patient already has an active appointment at that exact slot
    const patientConflict = await prisma.appointment.findFirst({
      where: {
        patientId: input.patientId,
        date: input.date,
        time: input.time,
        status: { notIn: ["Cancelled"] },
      },
    });

    if (patientConflict) {
      throw new ConflictError(
        `Patient ${patient.name} already has an appointment booked at ${input.time} on ${input.date}.`
      );
    }

    // 6. Create Appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: input.patientId,
        doctorId: input.doctorId,
        departmentId,
        date: input.date,
        time: input.time,
        type: input.type,
        status: "Scheduled",
        notes: input.notes || null,
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return formatAppointment(newAppointment);
  },

  /**
   * Reschedule or update appointment details with double-booking prevention.
   */
  async updateAppointment(id: string, input: UpdateAppointmentInput) {
    const existing = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    });

    if (!existing) {
      throw new NotFoundError(`Appointment #${id} not found.`);
    }

    const targetDoctorId = input.doctorId ?? existing.doctorId;
    const targetDate = input.date ?? existing.date;
    const targetTime = input.time ?? existing.time;

    // If slot or doctor changed, verify no conflict exists
    if (
      targetDoctorId !== existing.doctorId ||
      targetDate !== existing.date ||
      targetTime !== existing.time
    ) {
      const conflict = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId: targetDoctorId,
          date: targetDate,
          time: targetTime,
          status: { notIn: ["Cancelled"] },
        },
      });

      if (conflict) {
        throw new ConflictError(
          `Selected physician already has a confirmed booking on ${targetDate} at ${targetTime}.`
        );
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        doctorId: input.doctorId,
        date: input.date,
        time: input.time,
        type: input.type,
        status: input.status,
        notes: input.notes !== undefined ? input.notes : undefined,
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return formatAppointment(updated);
  },

  /**
   * Update appointment status with lifecycle validation.
   */
  async updateAppointmentStatus(id: string, newStatus: string, notes?: string) {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Appointment #${id} not found.`);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: newStatus,
        notes: notes ? `${existing.notes ? existing.notes + " | " : ""}${notes}` : undefined,
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return formatAppointment(updated);
  },

  /**
   * Cancel appointment with optional cancellation reason.
   */
  async cancelAppointment(id: string, reason?: string) {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Appointment #${id} not found.`);
    }

    if (existing.status === "Cancelled") {
      throw new BadRequestError(`Appointment #${id} is already cancelled.`);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: "Cancelled",
        notes: reason
          ? `${existing.notes ? existing.notes + " | " : ""}Cancelled: ${reason}`
          : existing.notes,
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return formatAppointment(updated);
  },

  /**
   * Calculate slot availability for a doctor on a specific date.
   */
  async getDoctorAvailableSlots(doctorId: number, dateString: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        schedules: true,
        department: true,
      },
    });

    if (!doctor) {
      throw new NotFoundError(`Doctor with ID #${doctorId} not found.`);
    }

    // Determine day of week from YYYY-MM-DD
    const [year, month, day] = dateString.split("-").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[dateObj.getUTCDay()];

    // Find schedule for that day
    const daySchedule = doctor.schedules.find(
      (s) => s.day.toLowerCase() === dayName.toLowerCase()
    );

    const isDoctorWorkingDay = daySchedule ? daySchedule.isAvailable : dayName !== "Sunday";

    // Query all existing active appointments for this doctor on that date
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: dateString,
        status: { notIn: ["Cancelled"] },
      },
      select: {
        id: true,
        time: true,
        status: true,
        patient: {
          select: { name: true, mrn: true },
        },
      },
    });

    const bookedSlotMap = new Map<string, any>();
    for (const b of bookedAppointments) {
      bookedSlotMap.set(b.time, b);
    }

    const slots = STANDARD_SLOTS.map((slotTime) => {
      const booking = bookedSlotMap.get(slotTime);
      const isBooked = !!booking;
      const isAvailable = isDoctorWorkingDay && !isBooked;

      return {
        time: slotTime,
        isAvailable,
        isBooked,
        bookedStatus: booking ? booking.status : null,
      };
    });

    return {
      doctorId,
      doctorName: doctor.name,
      department: doctor.department?.name,
      date: dateString,
      day: dayName,
      isAvailableDay: isDoctorWorkingDay,
      workingHours: daySchedule?.shifts || (isDoctorWorkingDay ? "09:00 AM - 05:00 PM" : "Off Duty"),
      totalSlots: slots.length,
      availableSlotsCount: slots.filter((s) => s.isAvailable).length,
      slots,
    };
  },
};
