import { Prisma } from "@prisma/client";
import prisma from "../../config/db.js";
import { NotFoundError } from "../../utils/errors.js";
import type { z } from "zod";
import type {
  createDoctorSchema,
  updateDoctorSchema,
  getDoctorsQuerySchema,
} from "./doctorValidation.js";

type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
type GetDoctorsQuery = z.infer<typeof getDoctorsQuerySchema>;

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Format a Prisma Doctor record to match frontend Doctor interface.
 */
export const formatDoctorRecord = (doc: any) => {
  // Sort schedules according to standard day ordering
  const dayOrder: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  const sortedSchedule = (doc.schedules || [])
    .slice()
    .sort((a: any, b: any) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99))
    .map((s: any) => ({
      day: s.day,
      shifts: s.shifts,
      isAvailable: s.isAvailable,
      slotsRemaining: s.slotsRemaining,
    }));

  return {
    id: doc.id,
    name: doc.name,
    title: doc.title,
    qualification: doc.qualification,
    specialty: doc.specialty,
    departmentId: doc.departmentId,
    department: doc.department?.name || "General Medicine",
    experienceYears: doc.experienceYears,
    room: doc.room,
    email: doc.email,
    phone: doc.phone,
    status: doc.status,
    rating: doc.rating,
    consultationFee: doc.consultationFee,
    bio: doc.bio || "",
    schedule:
      sortedSchedule.length > 0
        ? sortedSchedule
        : DEFAULT_DAYS.map((day) => ({
            day,
            shifts: "09:00 AM - 01:00 PM",
            isAvailable: day !== "Saturday",
            slotsRemaining: day === "Saturday" ? 0 : 6,
          })),
    assignedPatientsCount: doc._count?.assignedPatients ?? doc.assignedPatients?.length ?? 0,
  };
};

/**
 * Resolve departmentId from name or fallback.
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
      description: "Internal & Preventive Medicine",
    },
  });
  return newDept.id;
}

export const doctorService = {
  /**
   * List all doctors/staff with optional filters.
   */
  async listDoctors(query: GetDoctorsQuery) {
    const where: Prisma.DoctorWhereInput = {};

    if (query.search) {
      const q = query.search;
      where.OR = [
        { name: { contains: q } },
        { specialty: { contains: q } },
        { qualification: { contains: q } },
        { title: { contains: q } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.specialty) {
      where.specialty = { contains: query.specialty };
    }

    if (query.department) {
      where.OR = [
        ...(where.OR || []),
        { department: { name: { contains: query.department } } },
        { departmentId: query.department },
      ];
    }

    const records = await prisma.doctor.findMany({
      where,
      orderBy: [{ rating: "desc" }, { name: "asc" }],
      include: {
        department: true,
        schedules: true,
        _count: {
          select: {
            assignedPatients: true,
            appointments: true,
          },
        },
      },
    });

    return records.map(formatDoctorRecord);
  },

  /**
   * Get single doctor by ID with complete weekly rota and assigned patients.
   */
  async getDoctorById(id: number) {
    const doc = await prisma.doctor.findUnique({
      where: { id },
      include: {
        department: true,
        schedules: true,
        assignedPatients: {
          select: {
            id: true,
            mrn: true,
            name: true,
            status: true,
            age: true,
            gender: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    if (!doc) {
      throw new NotFoundError(`Doctor/physician with ID #${id} not found.`);
    }

    return formatDoctorRecord(doc);
  },

  /**
   * Create doctor profile with weekly schedules.
   */
  async createDoctor(input: CreateDoctorInput) {
    const departmentId = await resolveDepartmentId(input.departmentId || input.department);

    const created = await prisma.$transaction(async (tx) => {
      const newDoc = await tx.doctor.create({
        data: {
          name: input.name,
          title: input.title,
          qualification: input.qualification,
          specialty: input.specialty,
          departmentId,
          room: input.room,
          email: input.email,
          phone: input.phone,
          status: input.status || "On Duty",
          rating: input.rating ?? 5.0,
          consultationFee: input.consultationFee ?? 500,
          experienceYears: input.experienceYears ?? 5,
          bio: input.bio || null,
        },
      });

      // Create weekly schedules
      const schedulesToCreate =
        input.schedule && input.schedule.length > 0
          ? input.schedule
          : DEFAULT_DAYS.map((day) => ({
              day,
              shifts: "09:00 AM - 01:00 PM",
              isAvailable: day !== "Saturday",
              slotsRemaining: day === "Saturday" ? 0 : 6,
            }));

      for (const s of schedulesToCreate) {
        await tx.doctorSchedule.create({
          data: {
            doctorId: newDoc.id,
            day: s.day,
            shifts: s.shifts,
            isAvailable: s.isAvailable,
            slotsRemaining: s.slotsRemaining,
          },
        });
      }

      return newDoc;
    });

    return this.getDoctorById(created.id);
  },

  /**
   * Update doctor profile and schedules.
   */
  async updateDoctor(id: number, input: UpdateDoctorInput) {
    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Doctor with ID #${id} not found.`);
    }

    let departmentId = existing.departmentId;
    if (input.departmentId || input.department) {
      departmentId = await resolveDepartmentId(input.departmentId || input.department);
    }

    await prisma.$transaction(async (tx) => {
      await tx.doctor.update({
        where: { id },
        data: {
          name: input.name,
          title: input.title,
          qualification: input.qualification,
          specialty: input.specialty,
          departmentId,
          room: input.room,
          email: input.email,
          phone: input.phone,
          status: input.status,
          rating: input.rating,
          consultationFee: input.consultationFee,
          experienceYears: input.experienceYears,
          bio: input.bio !== undefined ? input.bio : undefined,
        },
      });

      if (input.schedule && input.schedule.length > 0) {
        await tx.doctorSchedule.deleteMany({ where: { doctorId: id } });
        for (const s of input.schedule) {
          await tx.doctorSchedule.create({
            data: {
              doctorId: id,
              day: s.day,
              shifts: s.shifts,
              isAvailable: s.isAvailable,
              slotsRemaining: s.slotsRemaining,
            },
          });
        }
      }
    });

    return this.getDoctorById(id);
  },

  /**
   * Get doctor's weekly rota schedule and slot availability.
   */
  async getDoctorSchedule(doctorId: number) {
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

    const formatted = formatDoctorRecord(doctor);
    return {
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: formatted.department,
      schedule: formatted.schedule,
    };
  },

  /**
   * Update doctor's weekly rota schedule.
   */
  async updateDoctorSchedule(doctorId: number, schedules: any[]) {
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID #${doctorId} not found.`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.doctorSchedule.deleteMany({ where: { doctorId } });
      for (const s of schedules) {
        await tx.doctorSchedule.create({
          data: {
            doctorId,
            day: s.day,
            shifts: s.shifts,
            isAvailable: s.isAvailable !== undefined ? s.isAvailable : true,
            slotsRemaining: s.slotsRemaining ?? 6,
          },
        });
      }
    });

    return this.getDoctorSchedule(doctorId);
  },
};
