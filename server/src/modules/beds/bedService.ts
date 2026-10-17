import prisma from "../../config/db.js";
import { NotFoundError, BadRequestError } from "../../utils/errors.js";
import type { z } from "zod";
import type {
  admitPatientSchema,
  transferBedSchema,
  dischargePatientSchema,
  getBedsQuerySchema,
  getAdmissionsQuerySchema,
} from "./bedValidation.js";

type AdmitPatientInput = z.infer<typeof admitPatientSchema>;
type TransferBedInput = z.infer<typeof transferBedSchema>;
type DischargePatientInput = z.infer<typeof dischargePatientSchema>;
type GetBedsQuery = z.infer<typeof getBedsQuerySchema>;
type GetAdmissionsQuery = z.infer<typeof getAdmissionsQuerySchema>;

export const bedService = {
  /**
   * Get Wards overview with aggregated occupancy metrics.
   */
  async getWardsSummary() {
    const wards = await prisma.ward.findMany({
      include: {
        rooms: true,
        beds: {
          include: {
            currentAdmission: {
              include: {
                patient: true,
                doctor: true,
              },
            },
          },
        },
      },
      orderBy: { code: "asc" },
    });

    let totalHospitalBeds = 0;
    let totalOccupied = 0;
    let totalAvailable = 0;
    let totalCleaning = 0;
    let totalMaintenance = 0;
    let totalReserved = 0;

    const formattedWards = wards.map((w) => {
      const beds = w.beds || [];
      const total = beds.length;
      const occupied = beds.filter((b) => b.status === "Occupied").length;
      const available = beds.filter((b) => b.status === "Available").length;
      const cleaning = beds.filter((b) => b.status === "Cleaning").length;
      const maintenance = beds.filter((b) => b.status === "Maintenance").length;
      const reserved = beds.filter((b) => b.status === "Reserved").length;

      totalHospitalBeds += total;
      totalOccupied += occupied;
      totalAvailable += available;
      totalCleaning += cleaning;
      totalMaintenance += maintenance;
      totalReserved += reserved;

      const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

      return {
        id: w.id,
        name: w.name,
        code: w.code,
        floor: w.floor,
        gender: w.gender,
        dailyRate: w.dailyRate,
        description: w.description,
        totalBeds: total,
        occupiedBeds: occupied,
        availableBeds: available,
        cleaningBeds: cleaning,
        maintenanceBeds: maintenance,
        reservedBeds: reserved,
        occupancyRate,
        roomsCount: (w.rooms || []).length,
      };
    });

    const overallOccupancyRate =
      totalHospitalBeds > 0
        ? Math.round((totalOccupied / totalHospitalBeds) * 100)
        : 0;

    return {
      wards: formattedWards,
      metrics: {
        totalHospitalBeds,
        totalOccupied,
        totalAvailable,
        totalCleaning,
        totalMaintenance,
        totalReserved,
        overallOccupancyRate,
      },
    };
  },

  /**
   * List beds with ward & room details and current patient info.
   */
  async getBeds(query: GetBedsQuery) {
    const where: any = {};

    if (query.wardId && query.wardId !== "all") {
      where.wardId = query.wardId;
    }

    if (query.status && query.status !== "all") {
      where.status = query.status;
    }

    const beds = await prisma.bed.findMany({
      where,
      include: {
        ward: true,
        room: true,
        currentAdmission: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
      orderBy: [{ ward: { code: "asc" } }, { bedNumber: "asc" }],
    });

    let filtered = beds;
    if (query.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      filtered = beds.filter((b) => {
        const bedNum = b.bedNumber.toLowerCase();
        const roomNum = b.room?.roomNumber.toLowerCase() || "";
        const wardName = b.ward?.name.toLowerCase() || "";
        const patientName = b.currentAdmission?.patient?.name.toLowerCase() || "";
        const mrn = b.currentAdmission?.patient?.mrn.toLowerCase() || "";
        return (
          bedNum.includes(q) ||
          roomNum.includes(q) ||
          wardName.includes(q) ||
          patientName.includes(q) ||
          mrn.includes(q)
        );
      });
    }

    return filtered.map((b) => ({
      id: b.id,
      bedNumber: b.bedNumber,
      bedType: b.bedType,
      status: b.status,
      wardId: b.wardId,
      wardName: b.ward?.name,
      wardCode: b.ward?.code,
      floor: b.ward?.floor,
      dailyRate: b.room?.dailyRate || b.ward?.dailyRate || 150.0,
      roomId: b.roomId,
      roomNumber: b.room?.roomNumber,
      roomType: b.room?.roomType,
      amenities: b.room?.amenities,
      currentAdmission: b.currentAdmission
        ? {
            id: b.currentAdmission.id,
            admissionNumber: b.currentAdmission.admissionNumber,
            patientId: b.currentAdmission.patientId,
            patientName: b.currentAdmission.patient?.name,
            patientMrn: b.currentAdmission.patient?.mrn,
            patientAge: b.currentAdmission.patient?.age,
            patientGender: b.currentAdmission.patient?.gender,
            patientBloodGroup: b.currentAdmission.patient?.bloodGroup,
            doctorId: b.currentAdmission.doctorId,
            doctorName: b.currentAdmission.doctor?.name,
            doctorSpecialty: b.currentAdmission.doctor?.specialty,
            admittedAt: b.currentAdmission.admittedAt,
            admissionType: b.currentAdmission.admissionType,
            diagnosis: b.currentAdmission.diagnosis,
            condition: b.currentAdmission.condition,
            daysAdmitted: Math.max(
              1,
              Math.ceil(
                (Date.now() - new Date(b.currentAdmission.admittedAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            ),
          }
        : null,
    }));
  },

  /**
   * Fast list of available beds for admission/transfer selectors.
   */
  async getAvailableBeds(wardId?: string) {
    const where: any = { status: "Available" };
    if (wardId && wardId !== "all") {
      where.wardId = wardId;
    }

    const beds = await prisma.bed.findMany({
      where,
      include: {
        ward: true,
        room: true,
      },
      orderBy: [{ ward: { code: "asc" } }, { bedNumber: "asc" }],
    });

    return beds.map((b) => ({
      id: b.id,
      bedNumber: b.bedNumber,
      bedType: b.bedType,
      wardId: b.wardId,
      wardName: b.ward?.name,
      wardCode: b.ward?.code,
      roomNumber: b.room?.roomNumber,
      dailyRate: b.room?.dailyRate || b.ward?.dailyRate,
      label: `${b.ward?.code} - ${b.bedNumber} (${b.room?.roomNumber}, ${b.bedType})`,
    }));
  },

  /**
   * Admit patient into an available bed.
   */
  async admitPatient(data: AdmitPatientInput) {
    // 1. Verify Patient
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });
    if (!patient) throw new NotFoundError("Patient not found");

    // 2. Verify Doctor
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
    });
    if (!doctor) throw new NotFoundError("Admitting doctor not found");

    // 3. Verify Bed is Available
    const bed = await prisma.bed.findUnique({
      where: { id: data.bedId },
      include: { ward: true, room: true },
    });
    if (!bed) throw new NotFoundError("Target bed not found");
    if (bed.status !== "Available") {
      throw new BadRequestError(
        `Bed ${bed.bedNumber} is currently not available for admission (Current status: ${bed.status}).`
      );
    }

    // 4. Generate Admission Number (e.g. ADM-2026-0005)
    const count = await prisma.admission.count();
    const year = new Date().getFullYear();
    const admissionNumber = `ADM-${year}-${String(count + 1).padStart(4, "0")}`;

    // 5. Execute Atomic Transaction
    const result = await prisma.$transaction(async (tx) => {
      const admission = await tx.admission.create({
        data: {
          admissionNumber,
          patientId: data.patientId,
          doctorId: data.doctorId,
          wardId: bed.wardId,
          bedId: bed.id,
          admissionType: data.admissionType,
          diagnosis: data.diagnosis,
          condition: data.condition,
          notes: data.notes,
          status: "Admitted",
          admittedAt: new Date(),
        },
        include: {
          patient: true,
          doctor: true,
          ward: true,
          bed: {
            include: { room: true },
          },
        },
      });

      // Update Bed to Occupied
      await tx.bed.update({
        where: { id: bed.id },
        data: {
          status: "Occupied",
          currentAdmissionId: admission.id,
        },
      });

      // Update Patient Status
      await tx.patient.update({
        where: { id: patient.id },
        data: {
          status: "Admitted",
          admissionDate: new Date().toISOString().split("T")[0],
          doctorAssignedId: data.doctorId,
        },
      });

      return admission;
    });

    return result;
  },

  /**
   * Transfer patient from current bed to a new available bed.
   */
  async transferPatient(admissionId: string, data: TransferBedInput) {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { bed: true, ward: true, patient: true },
    });

    if (!admission) throw new NotFoundError("Admission record not found");
    if (admission.status !== "Admitted") {
      throw new BadRequestError(`Cannot transfer a patient with status '${admission.status}'`);
    }

    const sourceBedId = admission.bedId;

    // Check target bed
    const targetBed = await prisma.bed.findUnique({
      where: { id: data.toBedId },
      include: { ward: true, room: true },
    });
    if (!targetBed) throw new NotFoundError("Destination bed not found");
    if (targetBed.status !== "Available") {
      throw new BadRequestError(
        `Destination bed ${targetBed.bedNumber} is not available (Current status: ${targetBed.status}).`
      );
    }
    if (targetBed.id === sourceBedId) {
      throw new BadRequestError("Destination bed is the same as the current bed.");
    }

    // Execute Atomic Transfer
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Transfer Log
      await tx.bedTransfer.create({
        data: {
          admissionId: admission.id,
          fromBedId: sourceBedId,
          toBedId: targetBed.id,
          reason: data.reason,
          transferredBy: data.transferredBy,
        },
      });

      // 2. Mark source bed as Cleaning (needs sanitization)
      await tx.bed.update({
        where: { id: sourceBedId },
        data: {
          status: "Cleaning",
          currentAdmissionId: null,
        },
      });

      // 3. Mark target bed as Occupied
      await tx.bed.update({
        where: { id: targetBed.id },
        data: {
          status: "Occupied",
          currentAdmissionId: admission.id,
        },
      });

      // 4. Update Admission record
      const updatedAdm = await tx.admission.update({
        where: { id: admission.id },
        data: {
          bedId: targetBed.id,
          wardId: targetBed.wardId,
        },
        include: {
          patient: true,
          doctor: true,
          ward: true,
          bed: {
            include: { room: true },
          },
        },
      });

      return updatedAdm;
    });

    return result;
  },

  /**
   * Discharge patient from hospital, freeing bed into 'Cleaning' state.
   */
  async dischargePatient(admissionId: string, data: DischargePatientInput) {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { bed: true, patient: true },
    });

    if (!admission) throw new NotFoundError("Admission record not found");
    if (admission.status !== "Admitted") {
      throw new BadRequestError(`Cannot discharge admission with status '${admission.status}'`);
    }

    const bedId = admission.bedId;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Admission to Discharged
      const updatedAdm = await tx.admission.update({
        where: { id: admission.id },
        data: {
          status: "Discharged",
          dischargedAt: new Date(),
          dischargeReason: data.dischargeReason,
          dischargeSummary: data.dischargeSummary,
        },
        include: {
          patient: true,
          doctor: true,
          ward: true,
          bed: {
            include: { room: true },
          },
        },
      });

      // 2. Update Bed to Cleaning (Sanitization protocol before next patient)
      await tx.bed.update({
        where: { id: bedId },
        data: {
          status: "Cleaning",
          currentAdmissionId: null,
        },
      });

      // 3. Update Patient Status
      await tx.patient.update({
        where: { id: admission.patientId },
        data: {
          status: "Discharged",
        },
      });

      return updatedAdm;
    });

    return result;
  },

  /**
   * Update bed status directly (e.g. from 'Cleaning' to 'Available', or 'Maintenance').
   */
  async updateBedStatus(bedId: string, status: string) {
    const bed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed) throw new NotFoundError("Bed not found");

    if (bed.status === "Occupied" && status === "Available") {
      throw new BadRequestError("Cannot mark an occupied bed as available. Please discharge or transfer the patient first.");
    }

    const updated = await prisma.bed.update({
      where: { id: bedId },
      data: {
        status,
        ...(status === "Available" ? { currentAdmissionId: null } : {}),
      },
      include: {
        ward: true,
        room: true,
      },
    });

    return updated;
  },

  /**
   * List active admissions with patient stay duration and clinical condition.
   */
  async getAdmissions(query: GetAdmissionsQuery) {
    const where: any = {};

    if (query.status && query.status !== "all") {
      where.status = query.status;
    }

    if (query.wardId && query.wardId !== "all") {
      where.wardId = query.wardId;
    }

    const admissions = await prisma.admission.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        ward: true,
        bed: {
          include: { room: true },
        },
        transfers: {
          include: {
            fromBed: true,
            toBed: true,
          },
          orderBy: { transferredAt: "desc" },
        },
      },
      orderBy: { admittedAt: "desc" },
    });

    let filtered = admissions;
    if (query.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      filtered = admissions.filter((a) => {
        const patientName = a.patient?.name.toLowerCase() || "";
        const mrn = a.patient?.mrn.toLowerCase() || "";
        const doctorName = a.doctor?.name.toLowerCase() || "";
        const admNum = a.admissionNumber.toLowerCase();
        const diag = a.diagnosis.toLowerCase();
        return (
          patientName.includes(q) ||
          mrn.includes(q) ||
          doctorName.includes(q) ||
          admNum.includes(q) ||
          diag.includes(q)
        );
      });
    }

    return filtered.map((a) => {
      const daysAdmitted = Math.max(
        1,
        Math.ceil(
          ((a.dischargedAt ? new Date(a.dischargedAt).getTime() : Date.now()) -
            new Date(a.admittedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );

      return {
        id: a.id,
        admissionNumber: a.admissionNumber,
        status: a.status,
        admissionType: a.admissionType,
        diagnosis: a.diagnosis,
        condition: a.condition,
        notes: a.notes,
        admittedAt: a.admittedAt,
        dischargedAt: a.dischargedAt,
        dischargeReason: a.dischargeReason,
        dischargeSummary: a.dischargeSummary,
        daysAdmitted,
        patientId: a.patientId,
        patientName: a.patient?.name,
        patientMrn: a.patient?.mrn,
        patientAge: a.patient?.age,
        patientGender: a.patient?.gender,
        patientPhone: a.patient?.phone,
        patientBloodGroup: a.patient?.bloodGroup,
        doctorId: a.doctorId,
        doctorName: a.doctor?.name,
        doctorSpecialty: a.doctor?.specialty,
        wardId: a.wardId,
        wardName: a.ward?.name,
        wardCode: a.ward?.code,
        bedId: a.bedId,
        bedNumber: a.bed?.bedNumber,
        roomNumber: a.bed?.room?.roomNumber,
        dailyRate: a.bed?.room?.dailyRate || a.ward?.dailyRate || 150.0,
        transfers: a.transfers,
      };
    });
  },

  /**
   * Get single admission with full medical stay history and transfers.
   */
  async getAdmissionById(id: string) {
    const admission = await prisma.admission.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        ward: true,
        bed: {
          include: { room: true },
        },
        transfers: {
          include: {
            fromBed: true,
            toBed: true,
          },
          orderBy: { transferredAt: "desc" },
        },
      },
    });

    if (!admission) throw new NotFoundError("Admission record not found");
    return admission;
  },
};
