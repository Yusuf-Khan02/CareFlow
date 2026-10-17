import prisma from "../../config/db.js";
import { NotFoundError, BadRequestError } from "../../utils/errors.js";
import type { z } from "zod";
import type {
  createMedicineSchema,
  receiveStockSchema,
  dispenseStockSchema,
  getMedicinesQuerySchema,
} from "./pharmacyValidation.js";

type CreateMedicineInput = z.infer<typeof createMedicineSchema>;
type ReceiveStockInput = z.infer<typeof receiveStockSchema>;
type DispenseStockInput = z.infer<typeof dispenseStockSchema>;
type GetMedicinesQuery = z.infer<typeof getMedicinesQuerySchema>;

const formatMedicine = (m: any) => ({
  id: m.id,
  sku: m.sku,
  name: m.name,
  brandName: m.brandName,
  category: m.category,
  dosageForm: m.dosageForm,
  strength: m.strength,
  unitPrice: m.unitPrice,
  costPrice: m.costPrice,
  currentStock: m.currentStock,
  minStockLevel: m.minStockLevel,
  isLowStock: m.currentStock <= m.minStockLevel && m.currentStock > 0,
  isOutOfStock: m.currentStock === 0,
  prescriptionRequired: m.prescriptionRequired,
  storageConditions: m.storageConditions || "Store at room temperature",
  manufacturer: m.manufacturer || "Generic Pharma",
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
  activeBatchesCount: (m.batches || []).filter((b: any) => b.quantityRemaining > 0).length,
  earliestExpiry:
    (m.batches || [])
      .filter((b: any) => b.quantityRemaining > 0)
      .map((b: any) => b.expiryDate)
      .sort()[0] || null,
  batches: (m.batches || []).map((b: any) => ({
    id: b.id,
    batchNumber: b.batchNumber,
    quantityReceived: b.quantityReceived,
    quantityRemaining: b.quantityRemaining,
    expiryDate: b.expiryDate,
    purchaseDate: b.purchaseDate,
    supplierName: b.supplierName || "Direct Wholesale Dist.",
    costPerUnit: b.costPerUnit,
    status: b.status,
  })),
});

export const pharmacyService = {
  /**
   * List medicines with search, category & stock filters and inventory metrics.
   */
  async listMedicines(query: GetMedicinesQuery) {
    const where: any = {};

    if (query.category && query.category !== "all") {
      where.category = query.category;
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q } },
        { brandName: { contains: q } },
        { sku: { contains: q } },
        { category: { contains: q } },
        { manufacturer: { contains: q } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const [allMedicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        include: {
          batches: {
            where: { quantityRemaining: { gt: 0 } },
            orderBy: { expiryDate: "asc" },
          },
        },
        orderBy: [{ name: "asc" }],
      }),
      prisma.medicine.count({ where }),
    ]);

    // Apply stock status filter in-memory if requested
    let filtered = allMedicines;
    if (query.stockStatus === "low") {
      filtered = allMedicines.filter((m) => m.currentStock > 0 && m.currentStock <= m.minStockLevel);
    } else if (query.stockStatus === "out_of_stock") {
      filtered = allMedicines.filter((m) => m.currentStock === 0);
    } else if (query.stockStatus === "normal") {
      filtered = allMedicines.filter((m) => m.currentStock > m.minStockLevel);
    }

    // Compute Department Metrics
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalUnitsInStock = 0;
    let stockValueGross = 0;

    for (const m of allMedicines) {
      totalUnitsInStock += m.currentStock;
      stockValueGross += m.currentStock * m.unitPrice;

      if (m.currentStock === 0) outOfStockCount++;
      else if (m.currentStock <= m.minStockLevel) lowStockCount++;
      else inStockCount++;
    }

    const pagedItems = filtered.slice(skip, skip + limit);

    return {
      medicines: pagedItems.map(formatMedicine),
      metrics: {
        totalFormulary: allMedicines.length,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        totalUnitsInStock,
        stockValueGross: Math.round(stockValueGross * 100) / 100,
      },
      pagination: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      },
    };
  },

  /**
   * Get single medicine with full batch details and recent movements.
   */
  async getMedicineById(id: string) {
    const med = await prisma.medicine.findUnique({
      where: { id },
      include: {
        batches: {
          orderBy: { expiryDate: "asc" },
        },
        movements: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!med) {
      throw new NotFoundError(`Medicine with ID '${id}' not found`);
    }

    return {
      ...formatMedicine(med),
      movements: med.movements,
    };
  },

  /**
   * Create new medicine in formulary catalogue.
   */
  async createMedicine(data: CreateMedicineInput) {
    const existing = await prisma.medicine.findUnique({ where: { sku: data.sku } });
    if (existing) {
      throw new BadRequestError(`Medicine with SKU '${data.sku}' already exists.`);
    }

    const created = await prisma.medicine.create({
      data: {
        sku: data.sku.toUpperCase(),
        name: data.name,
        brandName: data.brandName,
        category: data.category,
        dosageForm: data.dosageForm,
        strength: data.strength,
        unitPrice: data.unitPrice,
        costPrice: data.costPrice,
        minStockLevel: data.minStockLevel,
        prescriptionRequired: data.prescriptionRequired,
        storageConditions: data.storageConditions || null,
        manufacturer: data.manufacturer || null,
      },
      include: {
        batches: true,
      },
    });

    return formatMedicine(created);
  },

  /**
   * Receive shipment and add inventory batch.
   */
  async receiveStock(data: ReceiveStockInput) {
    const medicine = await prisma.medicine.findUnique({ where: { id: data.medicineId } });
    if (!medicine) throw new NotFoundError(`Medicine '${data.medicineId}' not found`);

    return await prisma.$transaction(async (tx) => {
      // 1. Create batch
      const batch = await tx.inventoryBatch.create({
        data: {
          medicineId: data.medicineId,
          batchNumber: data.batchNumber.toUpperCase(),
          quantityReceived: data.quantityReceived,
          quantityRemaining: data.quantityReceived,
          expiryDate: data.expiryDate,
          purchaseDate: data.purchaseDate,
          supplierName: data.supplierName || "Pharmaceutical Wholesale Co.",
          costPerUnit: data.costPerUnit || medicine.costPrice,
          status: "Active",
        },
      });

      // 2. Increment stock in medicine
      const updatedMed = await tx.medicine.update({
        where: { id: data.medicineId },
        data: {
          currentStock: { increment: data.quantityReceived },
        },
        include: {
          batches: true,
        },
      });

      // 3. Record movement in ledger
      await tx.inventoryMovement.create({
        data: {
          medicineId: data.medicineId,
          batchId: batch.id,
          type: "RECEIPT",
          quantity: data.quantityReceived,
          reference: `Batch ${batch.batchNumber}`,
          performedBy: "Sunil Joshi (Lead Pharmacist)",
          notes: data.notes || `Stock received from ${batch.supplierName}`,
        },
      });

      return formatMedicine(updatedMed);
    });
  },

  /**
   * Dispense medication using FEFO (First Expiring, First Out).
   */
  async dispenseStock(data: DispenseStockInput) {
    const medicine = await prisma.medicine.findUnique({
      where: { id: data.medicineId },
      include: {
        batches: {
          where: { quantityRemaining: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    if (!medicine) throw new NotFoundError(`Medicine '${data.medicineId}' not found`);

    if (medicine.currentStock < data.quantity) {
      throw new BadRequestError(
        `Insufficient stock for '${medicine.name}'. Available: ${medicine.currentStock}, Requested: ${data.quantity}`
      );
    }

    return await prisma.$transaction(async (tx) => {
      let remainingToDeduct = data.quantity;
      let primaryBatchId: string | null = null;

      // FEFO batch allocation
      for (const batch of medicine.batches) {
        if (remainingToDeduct <= 0) break;

        const deductFromThisBatch = Math.min(batch.quantityRemaining, remainingToDeduct);
        const newRemaining = batch.quantityRemaining - deductFromThisBatch;
        primaryBatchId = primaryBatchId || batch.id;

        await tx.inventoryBatch.update({
          where: { id: batch.id },
          data: {
            quantityRemaining: newRemaining,
            status: newRemaining === 0 ? "Depleted" : "Active",
          },
        });

        remainingToDeduct -= deductFromThisBatch;
      }

      // Decrement total medicine stock
      const updatedMed = await tx.medicine.update({
        where: { id: data.medicineId },
        data: {
          currentStock: { decrement: data.quantity },
        },
        include: {
          batches: true,
        },
      });

      // If prescription linked, update status to Dispensed
      if (data.prescriptionId) {
        await tx.prescription.updateMany({
          where: { id: data.prescriptionId },
          data: { status: "Dispensed" },
        });
      }

      // Record movement ledger
      await tx.inventoryMovement.create({
        data: {
          medicineId: data.medicineId,
          batchId: primaryBatchId,
          prescriptionId: data.prescriptionId || null,
          type: "DISPENSE",
          quantity: -data.quantity,
          reference: data.prescriptionId ? `Prescription #${data.prescriptionId.substring(0, 8)}` : "Direct Dispensing",
          performedBy: data.performedBy || "Staff Pharmacist",
          notes: data.notes || (data.patientName ? `Dispensed to ${data.patientName}` : "Prescription fulfillment"),
        },
      });

      return formatMedicine(updatedMed);
    });
  },

  /**
   * Get low-stock alerts.
   */
  async getLowStockAlerts() {
    const medicines = await prisma.medicine.findMany({
      where: {
        currentStock: { lte: prisma.medicine.fields.minStockLevel },
      },
      include: {
        batches: {
          where: { quantityRemaining: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
        },
      },
      orderBy: { currentStock: "asc" },
    });

    return medicines.map(formatMedicine);
  },

  /**
   * Get pending prescriptions awaiting pharmacy dispensing.
   */
  async getPendingPrescriptions() {
    const prescriptions = await prisma.prescription.findMany({
      where: { status: "Active" },
      include: {
        patient: true,
        doctor: true,
        consultation: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return prescriptions.map((p) => ({
      id: p.id,
      medicationName: p.medicationName,
      dosage: p.dosage,
      route: p.route,
      frequency: p.frequency,
      duration: p.duration,
      instructions: p.instructions,
      status: p.status,
      patientId: p.patientId,
      patientName: p.patient?.name || "Patient",
      patientMrn: p.patient?.mrn || "N/A",
      doctorId: p.doctorId,
      doctorName: p.doctor?.name || "Doctor",
      doctorSpecialty: p.doctor?.specialty || "",
      date: p.consultation?.date || new Date(p.createdAt).toISOString().split("T")[0],
      createdAt: p.createdAt,
    }));
  },

  /**
   * Get recent inventory movement ledger.
   */
  async getRecentMovements(limit = 50) {
    const movements = await prisma.inventoryMovement.findMany({
      include: {
        medicine: true,
        batch: true,
        prescription: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return movements.map((m) => ({
      id: m.id,
      medicineId: m.medicineId,
      medicineName: m.medicine?.name,
      medicineSku: m.medicine?.sku,
      batchNumber: m.batch?.batchNumber || "N/A",
      type: m.type,
      quantity: m.quantity,
      reference: m.reference || "N/A",
      performedBy: m.performedBy || "Pharmacist",
      notes: m.notes || "",
      createdAt: m.createdAt,
    }));
  },
};
