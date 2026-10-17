import { apiRequest, ApiError } from "./apiClient";
import type {
  Medicine,
  PharmacyMetrics,
  InventoryBatch,
  InventoryMovement,
  PendingPrescriptionItem,
  CreateMedicinePayload,
  ReceiveStockPayload,
  DispenseStockPayload,
} from "../types";

export interface GetMedicinesParams {
  category?: string;
  stockStatus?: "all" | "low" | "out_of_stock" | "normal";
  search?: string;
  page?: number;
  limit?: number;
}

export interface MedicinesListResponse {
  medicines: Medicine[];
  metrics: PharmacyMetrics;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const STORAGE_KEY_MEDICINES = "careflow_pharmacy_medicines";
const STORAGE_KEY_MOVEMENTS = "careflow_pharmacy_movements";

export const FORMULARY_CATEGORIES = [
  "All Categories",
  "Antibiotic",
  "Analgesic / Antipyretic",
  "Gastrointestinal",
  "Antihistamine",
  "Antidiabetic",
  "Cardiovascular",
  "Respiratory",
  "Endocrine",
];

const INITIAL_MEDICINES: Medicine[] = [
  {
    id: "med-amox-500",
    sku: "MED-ABX-001",
    name: "Amoxicillin Trihydrate",
    brandName: "Amoxil",
    category: "Antibiotic",
    dosageForm: "Capsule",
    strength: "500mg",
    unitPrice: 12.5,
    costPrice: 5.2,
    currentStock: 450,
    minStockLevel: 100,
    isLowStock: false,
    isOutOfStock: false,
    prescriptionRequired: true,
    storageConditions: "Store below 25°C in a dry place",
    manufacturer: "GlaxoSmithKline",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeBatchesCount: 2,
    earliestExpiry: "2027-06-30",
    batches: [
      {
        id: "batch-amox-1",
        batchNumber: "AMX-2024-001",
        quantityReceived: 300,
        quantityRemaining: 200,
        expiryDate: "2027-06-30",
        purchaseDate: "2024-01-10",
        supplierName: "Apex Medical Supplies Ltd.",
        costPerUnit: 5.2,
        status: "ACTIVE",
      },
      {
        id: "batch-amox-2",
        batchNumber: "AMX-2024-002",
        quantityReceived: 250,
        quantityRemaining: 250,
        expiryDate: "2027-12-31",
        purchaseDate: "2024-03-15",
        supplierName: "Apex Medical Supplies Ltd.",
        costPerUnit: 5.2,
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "med-para-650",
    sku: "MED-ANL-002",
    name: "Paracetamol (Acetaminophen)",
    brandName: "Dolo 650",
    category: "Analgesic / Antipyretic",
    dosageForm: "Tablet",
    strength: "650mg",
    unitPrice: 2.0,
    costPrice: 0.6,
    currentStock: 1200,
    minStockLevel: 300,
    isLowStock: false,
    isOutOfStock: false,
    prescriptionRequired: false,
    storageConditions: "Store at room temperature",
    manufacturer: "Micro Labs Ltd.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeBatchesCount: 1,
    earliestExpiry: "2028-02-15",
    batches: [
      {
        id: "batch-para-1",
        batchNumber: "DLO-2024-88",
        quantityReceived: 1500,
        quantityRemaining: 1200,
        expiryDate: "2028-02-15",
        purchaseDate: "2024-02-01",
        supplierName: "National Pharma Distributors",
        costPerUnit: 0.6,
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "med-panto-40",
    sku: "MED-GAS-003",
    name: "Pantoprazole Gastro-Resistant",
    brandName: "Pantocid 40",
    category: "Gastrointestinal",
    dosageForm: "Tablet",
    strength: "40mg",
    unitPrice: 8.5,
    costPrice: 3.1,
    currentStock: 45,
    minStockLevel: 100,
    isLowStock: true,
    isOutOfStock: false,
    prescriptionRequired: true,
    storageConditions: "Store protected from light and moisture",
    manufacturer: "Sun Pharma",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeBatchesCount: 1,
    earliestExpiry: "2026-11-20",
    batches: [
      {
        id: "batch-panto-1",
        batchNumber: "PNT-2023-11",
        quantityReceived: 200,
        quantityRemaining: 45,
        expiryDate: "2026-11-20",
        purchaseDate: "2023-11-05",
        supplierName: "MedHealth Logistics",
        costPerUnit: 3.1,
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "med-azith-500",
    sku: "MED-ABX-006",
    name: "Azithromycin Dihydrate",
    brandName: "Zithromax 500",
    category: "Antibiotic",
    dosageForm: "Tablet",
    strength: "500mg",
    unitPrice: 18.0,
    costPrice: 8.0,
    currentStock: 0,
    minStockLevel: 50,
    isLowStock: false,
    isOutOfStock: true,
    prescriptionRequired: true,
    storageConditions: "Store below 30°C",
    manufacturer: "Pfizer Pharmaceuticals",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeBatchesCount: 0,
    earliestExpiry: null,
    batches: [],
  },
];

function getStoredMedicines(): Medicine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEDICINES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(INITIAL_MEDICINES));
      return INITIAL_MEDICINES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MEDICINES;
  }
}

function saveStoredMedicines(data: Medicine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(data));
  } catch (err) {
    console.warn("Failed to persist medicines to local storage:", err);
  }
}

export const pharmacyService = {
  /**
   * List medications with live stock, metrics, and filtering.
   */
  async getMedicines(params: GetMedicinesParams = {}): Promise<MedicinesListResponse> {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All Categories" && params.category !== "all") {
      query.set("category", params.category);
    }
    if (params.stockStatus && params.stockStatus !== "all") {
      query.set("stockStatus", params.stockStatus);
    }
    if (params.search) {
      query.set("search", params.search);
    }
    if (params.page) {
      query.set("page", String(params.page));
    }
    if (params.limit) {
      query.set("limit", String(params.limit));
    }

    try {
      const qs = query.toString();
      const response = await apiRequest<any>(`/pharmacy/medicines${qs ? `?${qs}` : ""}`);
      const data = response.data || response;
      if (data.medicines && data.metrics) {
        return data as MedicinesListResponse;
      }
      throw new Error("Unexpected payload structure");
    } catch {
      // Mock Fallback
      let stored = getStoredMedicines();
      if (params.category && params.category !== "All Categories" && params.category !== "all") {
        stored = stored.filter((m) => m.category === params.category);
      }
      if (params.stockStatus === "low") {
        stored = stored.filter((m) => m.currentStock > 0 && m.currentStock <= m.minStockLevel);
      } else if (params.stockStatus === "out_of_stock") {
        stored = stored.filter((m) => m.currentStock === 0);
      } else if (params.stockStatus === "normal") {
        stored = stored.filter((m) => m.currentStock > m.minStockLevel);
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        stored = stored.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.brandName.toLowerCase().includes(q) ||
            m.sku.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q)
        );
      }

      const all = getStoredMedicines();
      const totalUnits = all.reduce((acc, m) => acc + m.currentStock, 0);
      const stockVal = all.reduce((acc, m) => acc + m.currentStock * m.unitPrice, 0);

      return {
        medicines: stored,
        metrics: {
          totalFormulary: all.length,
          inStockCount: all.filter((m) => m.currentStock > m.minStockLevel).length,
          lowStockCount: all.filter((m) => m.currentStock > 0 && m.currentStock <= m.minStockLevel).length,
          outOfStockCount: all.filter((m) => m.currentStock === 0).length,
          totalUnitsInStock: totalUnits,
          stockValueGross: Math.round(stockVal * 100) / 100,
        },
        pagination: {
          total: stored.length,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      };
    }
  },

  /**
   * Get medicine by ID with batch details.
   */
  async getMedicineById(id: string): Promise<Medicine> {
    try {
      const response = await apiRequest<any>(`/pharmacy/medicines/${id}`);
      return response.data || response;
    } catch (err) {
      const stored = getStoredMedicines();
      const found = stored.find((m) => m.id === id);
      if (found) return found;
      throw err;
    }
  },

  /**
   * Register a new medication in the hospital formulary.
   */
  async createMedicine(payload: CreateMedicinePayload): Promise<Medicine> {
    try {
      const response = await apiRequest<any>("/pharmacy/medicines", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const stored = getStoredMedicines();
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        sku: payload.sku,
        name: payload.name,
        brandName: payload.brandName,
        category: payload.category,
        dosageForm: payload.dosageForm,
        strength: payload.strength,
        unitPrice: payload.unitPrice,
        costPrice: payload.costPrice,
        currentStock: 0,
        minStockLevel: payload.minStockLevel ?? 50,
        isLowStock: false,
        isOutOfStock: true,
        prescriptionRequired: payload.prescriptionRequired ?? true,
        storageConditions: payload.storageConditions || "Store at room temperature",
        manufacturer: payload.manufacturer || "Generic Pharma",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activeBatchesCount: 0,
        earliestExpiry: null,
        batches: [],
      };
      saveStoredMedicines([newMed, ...stored]);
      return newMed;
    }
  },

  /**
   * Receive stock batch shipment into inventory.
   */
  async receiveStock(payload: ReceiveStockPayload): Promise<Medicine> {
    try {
      const response = await apiRequest<any>("/pharmacy/receive", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const stored = getStoredMedicines();
      const idx = stored.findIndex((m) => m.id === payload.medicineId);
      if (idx !== -1) {
        const med = stored[idx];
        const newBatch: InventoryBatch = {
          id: `batch-${Date.now()}`,
          batchNumber: payload.batchNumber,
          quantityReceived: payload.quantityReceived,
          quantityRemaining: payload.quantityReceived,
          expiryDate: payload.expiryDate,
          purchaseDate: payload.purchaseDate || new Date().toISOString().split("T")[0],
          supplierName: payload.supplierName || "Direct Distributor",
          costPerUnit: payload.costPerUnit || med.costPrice,
          status: "ACTIVE",
        };
        med.batches = [newBatch, ...(med.batches || [])];
        med.currentStock += payload.quantityReceived;
        med.isOutOfStock = false;
        med.isLowStock = med.currentStock <= med.minStockLevel;
        med.activeBatchesCount = (med.batches || []).filter((b) => b.quantityRemaining > 0).length;
        saveStoredMedicines(stored);
        return med;
      }
      throw new Error("Medicine not found in inventory");
    }
  },

  /**
   * Dispense stock using FEFO allocation.
   */
  async dispenseStock(payload: DispenseStockPayload): Promise<Medicine> {
    try {
      const response = await apiRequest<any>("/pharmacy/dispense", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const stored = getStoredMedicines();
      const idx = stored.findIndex((m) => m.id === payload.medicineId);
      if (idx !== -1) {
        const med = stored[idx];
        if (med.currentStock < payload.quantity) {
          throw new Error(`Insufficient stock. Current available: ${med.currentStock}`);
        }
        med.currentStock -= payload.quantity;
        med.isOutOfStock = med.currentStock === 0;
        med.isLowStock = med.currentStock <= med.minStockLevel && med.currentStock > 0;
        saveStoredMedicines(stored);
        return med;
      }
      throw new Error("Medicine not found in inventory");
    }
  },

  /**
   * Get medicines with low stock alerts.
   */
  async getLowStockAlerts(): Promise<Medicine[]> {
    try {
      const response = await apiRequest<any>("/pharmacy/low-stock");
      return response.data || response;
    } catch {
      const stored = getStoredMedicines();
      return stored.filter((m) => m.currentStock <= m.minStockLevel);
    }
  },

  /**
   * Get pending prescriptions awaiting dispensing.
   */
  async getPendingPrescriptions(): Promise<PendingPrescriptionItem[]> {
    try {
      const response = await apiRequest<any>("/pharmacy/prescriptions/pending");
      return response.data || response;
    } catch {
      return [
        {
          id: "rx-1",
          medicationName: "Amoxicillin Trihydrate 500mg",
          dosage: "1 capsule",
          route: "Oral",
          frequency: "TDS (Three times a day)",
          duration: "7 days",
          instructions: "Take with meals until course finished",
          status: "Active",
          patientId: 101,
          patientName: "Sarah Jenkins",
          patientMrn: "MRN-2024-00101",
          doctorId: 1,
          doctorName: "Dr. Marcus Vance",
          doctorSpecialty: "Internal Medicine",
          date: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString(),
        },
        {
          id: "rx-2",
          medicationName: "Pantoprazole Gastro-Resistant 40mg",
          dosage: "1 tablet",
          route: "Oral",
          frequency: "OD (Once a day - Morning)",
          duration: "14 days",
          instructions: "Take 30 minutes before breakfast",
          status: "Active",
          patientId: 102,
          patientName: "Michael Chang",
          patientMrn: "MRN-2024-00102",
          doctorId: 2,
          doctorName: "Dr. Emily Hayes",
          doctorSpecialty: "Cardiology",
          date: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  /**
   * Get inventory movement ledger logs.
   */
  async getMovements(limit = 50): Promise<InventoryMovement[]> {
    try {
      const response = await apiRequest<any>(`/pharmacy/movements?limit=${limit}`);
      return response.data || response;
    } catch {
      const raw = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
      if (raw) return JSON.parse(raw);
      return [
        {
          id: "mov-1",
          medicineId: "med-amox-500",
          medicineName: "Amoxicillin Trihydrate",
          medicineSku: "MED-ABX-001",
          batchNumber: "AMX-2024-001",
          type: "RECEIVE",
          quantity: 300,
          reference: "PO-2024-001",
          performedBy: "Chief Pharmacist",
          notes: "Initial inventory receiving shipment",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "mov-2",
          medicineId: "med-amox-500",
          medicineName: "Amoxicillin Trihydrate",
          medicineSku: "MED-ABX-001",
          batchNumber: "AMX-2024-001",
          type: "DISPENSE",
          quantity: -21,
          reference: "Prescription #rx-1",
          performedBy: "Staff Pharmacist",
          notes: "Dispensed to Sarah Jenkins",
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ];
    }
  },
};
