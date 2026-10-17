import prisma from "../../config/db.js";
import { NotFoundError, BadRequestError } from "../../utils/errors.js";
import type { z } from "zod";
import type {
  createQueueTokenSchema,
  getQueueQuerySchema,
} from "./queueValidation.js";

type CreateQueueTokenInput = z.infer<typeof createQueueTokenSchema>;
type GetQueueQuery = z.infer<typeof getQueueQuerySchema>;

const getDeptPrefix = (deptName?: string): string => {
  if (!deptName) return "A";
  const lower = deptName.toLowerCase();
  if (lower.includes("cardio")) return "CA";
  if (lower.includes("neuro")) return "NE";
  if (lower.includes("ortho")) return "OR";
  if (lower.includes("pediatric")) return "PE";
  if (lower.includes("gastro")) return "GA";
  if (lower.includes("general") || lower.includes("physician")) return "GP";
  return deptName.substring(0, 2).toUpperCase();
};

const formatToken = (tok: any, indexInWaiting = -1) => {
  const waitMinutes =
    tok.status === "Waiting" && indexInWaiting >= 0
      ? (indexInWaiting + 1) * 12
      : tok.status === "In-Consultation"
      ? 0
      : 0;

  return {
    id: tok.id,
    tokenNumber: tok.tokenNumber,
    patientId: tok.patientId,
    patientName: tok.patient?.name || "Patient",
    patientMrn: tok.patient?.mrn || "N/A",
    patientGender: tok.patient?.gender || "",
    patientAge: tok.patient?.age || 0,
    patientPhone: tok.patient?.phone || "",
    doctorId: tok.doctorId,
    doctorName: tok.doctor?.name || "Available Physician",
    doctorSpecialty: tok.doctor?.specialty || "",
    doctorRoom: tok.doctor?.room || "Consultation Wing",
    departmentId: tok.departmentId,
    department: tok.department?.name || "General Clinic",
    status: tok.status,
    priority: tok.priority,
    calledAt: tok.calledAt,
    completedAt: tok.completedAt,
    createdAt: tok.createdAt,
    updatedAt: tok.updatedAt,
    estimatedWaitMinutes: waitMinutes,
  };
};

export const queueService = {
  /**
   * List live queue tokens with priority sorting and metrics.
   */
  async listQueue(query: GetQueueQuery) {
    const where: any = {};

    if (query.doctorId) {
      where.doctorId = query.doctorId;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.status && query.status !== "all" && query.status !== "All") {
      where.status = query.status;
    }

    if (query.priority && query.priority !== "all") {
      where.priority = query.priority;
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { tokenNumber: { contains: q } },
        { patient: { name: { contains: q } } },
        { patient: { mrn: { contains: q } } },
        { doctor: { name: { contains: q } } },
        { department: { name: { contains: q } } },
      ];
    }

    // Query tokens
    const tokens = await prisma.queueToken.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
      orderBy: [{ createdAt: "asc" }],
    });

    // Priority sorting: Emergency (1) -> Urgent (2) -> Normal (3), then FIFO by createdAt
    const priorityWeight: Record<string, number> = {
      Emergency: 1,
      Urgent: 2,
      Normal: 3,
    };

    const sortedTokens = tokens.slice().sort((a, b) => {
      // If one is in-consultation or called, keep them at top of their category
      const weightA = priorityWeight[a.priority] || 99;
      const weightB = priorityWeight[b.priority] || 99;
      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Calculate waiting index for waiting patients
    let waitingCounter = 0;
    const formattedList = sortedTokens.map((tok) => {
      const isWait = tok.status === "Waiting";
      const idx = isWait ? waitingCounter++ : -1;
      return formatToken(tok, idx);
    });

    // Operational Queue Metrics
    const allTokens = await prisma.queueToken.findMany({
      select: { status: true, priority: true, tokenNumber: true, doctor: { select: { name: true, room: true } } },
    });

    const totalWaiting = allTokens.filter((t) => t.status === "Waiting").length;
    const totalCalled = allTokens.filter((t) => t.status === "Called").length;
    const totalInConsult = allTokens.filter((t) => t.status === "In-Consultation").length;
    const totalCompleted = allTokens.filter((t) => t.status === "Completed").length;
    const totalSkipped = allTokens.filter((t) => t.status === "Skipped").length;

    // Currently called patient for public announce display
    const currentCalling = formattedList.find((t) => t.status === "Called") || null;

    return {
      tokens: formattedList,
      total: formattedList.length,
      metrics: {
        totalWaiting,
        totalCalled,
        totalInConsult,
        totalCompleted,
        totalSkipped,
        avgWaitMinutes: totalWaiting > 0 ? Math.round(totalWaiting * 12) : 0,
        currentCalling,
      },
    };
  },

  /**
   * Issue a new Queue Token (Check-In or Walk-In).
   */
  async createToken(input: CreateQueueTokenInput) {
    // 1. Verify Patient
    const patient = await prisma.patient.findUnique({
      where: { id: input.patientId },
    });
    if (!patient) {
      throw new NotFoundError(`Patient with ID #${input.patientId} does not exist.`);
    }

    // 2. Resolve Doctor & Department
    let doctorId = input.doctorId || null;
    let departmentId = input.departmentId;

    if (doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: { department: true },
      });
      if (!doctor) {
        throw new NotFoundError(`Doctor with ID #${doctorId} does not exist.`);
      }
      if (!departmentId) {
        departmentId = doctor.departmentId;
      }
    }

    if (!departmentId) {
      departmentId = patient.departmentId;
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new NotFoundError(`Department #${departmentId} does not exist.`);
    }

    // 3. Generate sequential token number
    const prefix =
      input.priority === "Emergency"
        ? "EM"
        : getDeptPrefix(department.name);

    const totalTodayTokens = await prisma.queueToken.count();
    const tokenNumber = `${prefix}-${100 + totalTodayTokens + 1}`;

    // 4. Create QueueToken
    const token = await prisma.queueToken.create({
      data: {
        tokenNumber,
        patientId: input.patientId,
        doctorId,
        departmentId,
        status: "Waiting",
        priority: input.priority || "Normal",
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    // 5. If linked to an appointment, mark appointment as Checked-in
    if (input.appointmentId) {
      try {
        await prisma.appointment.update({
          where: { id: input.appointmentId },
          data: { status: "Checked-in" },
        });
      } catch (err) {
        console.warn("Could not link appointment check-in:", err);
      }
    }

    return formatToken(token, 0);
  },

  /**
   * Concurrency-safe Call Next patient for a doctor or department.
   */
  async callNext(doctorId?: number, departmentId?: string): Promise<any> {
    const where: any = { status: "Waiting" };

    if (doctorId) {
      where.doctorId = doctorId;
    }
    if (departmentId) {
      where.departmentId = departmentId;
    }

    // Find candidates in Waiting status ordered by Priority & Creation time
    const candidates = await prisma.queueToken.findMany({
      where,
      orderBy: [{ createdAt: "asc" }],
      include: { patient: true, doctor: true, department: true },
    });

    if (candidates.length === 0) {
      throw new NotFoundError(
        "No waiting patients in queue for the selected physician/department."
      );
    }

    // Priority sort: Emergency -> Urgent -> Normal
    const priorityWeight: Record<string, number> = {
      Emergency: 1,
      Urgent: 2,
      Normal: 3,
    };
    candidates.sort(
      (a, b) =>
        (priorityWeight[a.priority] || 99) - (priorityWeight[b.priority] || 99)
    );

    const selected = candidates[0];

    // Concurrency protection: Atomically transition status only if still 'Waiting'
    const result = await prisma.queueToken.updateMany({
      where: {
        id: selected.id,
        status: "Waiting",
      },
      data: {
        status: "Called",
        calledAt: new Date(),
        doctorId: doctorId || selected.doctorId,
      },
    });

    if (result.count === 0) {
      // Concurrently grabbed by another staff member, retry
      return this.callNext(doctorId, departmentId);
    }

    const updated = await prisma.queueToken.findUnique({
      where: { id: selected.id },
      include: { patient: true, doctor: true, department: true },
    });

    return formatToken(updated);
  },

  /**
   * Directly call a specific patient token.
   */
  async callToken(id: string, doctorId?: number) {
    const token = await prisma.queueToken.findUnique({ where: { id } });
    if (!token) {
      throw new NotFoundError(`Queue token #${id} not found.`);
    }

    const updated = await prisma.queueToken.update({
      where: { id },
      data: {
        status: "Called",
        calledAt: new Date(),
        doctorId: doctorId || token.doctorId,
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return formatToken(updated);
  },

  /**
   * Start consultation (Doctor begins encounter).
   */
  async startConsultation(id: string) {
    const token = await prisma.queueToken.findUnique({ where: { id } });
    if (!token) {
      throw new NotFoundError(`Queue token #${id} not found.`);
    }

    const updated = await prisma.queueToken.update({
      where: { id },
      data: {
        status: "In-Consultation",
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return formatToken(updated);
  },

  /**
   * Complete token encounter.
   */
  async completeToken(id: string) {
    const token = await prisma.queueToken.findUnique({ where: { id } });
    if (!token) {
      throw new NotFoundError(`Queue token #${id} not found.`);
    }

    const updated = await prisma.queueToken.update({
      where: { id },
      data: {
        status: "Completed",
        completedAt: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return formatToken(updated);
  },

  /**
   * Skip a patient (e.g. no-show when called).
   */
  async skipToken(id: string) {
    const token = await prisma.queueToken.findUnique({ where: { id } });
    if (!token) {
      throw new NotFoundError(`Queue token #${id} not found.`);
    }

    const updated = await prisma.queueToken.update({
      where: { id },
      data: {
        status: "Skipped",
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return formatToken(updated);
  },

  /**
   * Return a skipped/called patient back into waiting line.
   */
  async returnToWaiting(id: string) {
    const token = await prisma.queueToken.findUnique({ where: { id } });
    if (!token) {
      throw new NotFoundError(`Queue token #${id} not found.`);
    }

    const updated = await prisma.queueToken.update({
      where: { id },
      data: {
        status: "Waiting",
        calledAt: null,
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return formatToken(updated);
  },
};
