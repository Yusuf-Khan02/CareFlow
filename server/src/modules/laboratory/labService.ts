import prisma from "../../config/db.js";
import { NotFoundError, BadRequestError } from "../../utils/errors.js";
import type { z } from "zod";
import type {
  createLabOrderSchema,
  updateLabOrderStatusSchema,
  enterLabResultsSchema,
  getLabOrdersQuerySchema,
} from "./labValidation.js";

type CreateLabOrderInput = z.infer<typeof createLabOrderSchema>;
type UpdateLabOrderStatusInput = z.infer<typeof updateLabOrderStatusSchema>;
type EnterLabResultsInput = z.infer<typeof enterLabResultsSchema>;
type GetLabOrdersQuery = z.infer<typeof getLabOrdersQuerySchema>;

export interface LabCatalogTest {
  category: string;
  testName: string;
  turnaroundHours: number;
  sampleType: string;
  description: string;
  defaultParameters: {
    name: string;
    unit: string;
    referenceRange: string;
  }[];
}

export const LAB_CATALOG: LabCatalogTest[] = [
  {
    category: "Hematology",
    testName: "Complete Blood Count (CBC)",
    turnaroundHours: 2,
    sampleType: "Whole Blood (EDTA)",
    description: "Evaluates overall health and detects an array of disorders including anemia, infection, and leukemia.",
    defaultParameters: [
      { name: "Hemoglobin", unit: "g/dL", referenceRange: "13.5 - 17.5" },
      { name: "White Blood Cells (WBC)", unit: "x10^3/uL", referenceRange: "4.5 - 11.0" },
      { name: "Platelet Count", unit: "x10^3/uL", referenceRange: "150 - 450" },
      { name: "Hematocrit (HCT)", unit: "%", referenceRange: "41.0 - 50.0" },
      { name: "Red Blood Cells (RBC)", unit: "x10^6/uL", referenceRange: "4.5 - 5.9" },
    ],
  },
  {
    category: "Biochemistry",
    testName: "Lipid Profile Panel",
    turnaroundHours: 4,
    sampleType: "Serum (SST)",
    description: "Measures concentrations of specific lipids in blood to evaluate cardiovascular disease risk.",
    defaultParameters: [
      { name: "Total Cholesterol", unit: "mg/dL", referenceRange: "< 200" },
      { name: "HDL Cholesterol", unit: "mg/dL", referenceRange: "> 40" },
      { name: "LDL Cholesterol", unit: "mg/dL", referenceRange: "< 100" },
      { name: "Triglycerides", unit: "mg/dL", referenceRange: "< 150" },
    ],
  },
  {
    category: "Biochemistry",
    testName: "Comprehensive Metabolic Panel (CMP)",
    turnaroundHours: 4,
    sampleType: "Serum (SST)",
    description: "Provides an overall look at chemical balance and metabolism including glucose, kidney, and electrolyte health.",
    defaultParameters: [
      { name: "Fasting Blood Glucose", unit: "mg/dL", referenceRange: "70 - 99" },
      { name: "Serum Creatinine", unit: "mg/dL", referenceRange: "0.7 - 1.3" },
      { name: "Blood Urea Nitrogen (BUN)", unit: "mg/dL", referenceRange: "7 - 20" },
      { name: "Serum Sodium (Na+)", unit: "mEq/L", referenceRange: "135 - 145" },
      { name: "Serum Potassium (K+)", unit: "mEq/L", referenceRange: "3.5 - 5.0" },
      { name: "Calcium", unit: "mg/dL", referenceRange: "8.5 - 10.2" },
    ],
  },
  {
    category: "Biochemistry",
    testName: "Liver Function Tests (LFT)",
    turnaroundHours: 4,
    sampleType: "Serum (SST)",
    description: "Evaluates inflammation, damage, or disease in liver function and biliary systems.",
    defaultParameters: [
      { name: "ALT (Alanine Aminotransferase)", unit: "U/L", referenceRange: "7 - 56" },
      { name: "AST (Aspartate Aminotransferase)", unit: "U/L", referenceRange: "10 - 40" },
      { name: "Total Bilirubin", unit: "mg/dL", referenceRange: "0.2 - 1.2" },
      { name: "Alkaline Phosphatase (ALP)", unit: "U/L", referenceRange: "44 - 147" },
      { name: "Serum Albumin", unit: "g/dL", referenceRange: "3.5 - 5.0" },
    ],
  },
  {
    category: "Endocrinology",
    testName: "Thyroid Stimulating Hormone (TSH & FT4)",
    turnaroundHours: 6,
    sampleType: "Serum (SST)",
    description: "Evaluates thyroid gland function and monitors treatment for hyperthyroidism and hypothyroidism.",
    defaultParameters: [
      { name: "TSH (Ultrasensitive)", unit: "uIU/mL", referenceRange: "0.4 - 4.0" },
      { name: "Free T4", unit: "ng/dL", referenceRange: "0.8 - 1.8" },
    ],
  },
  {
    category: "Endocrinology",
    testName: "Glycated Hemoglobin (HbA1c)",
    turnaroundHours: 3,
    sampleType: "Whole Blood (EDTA)",
    description: "Measures 3-month average plasma glucose concentration for diabetes monitoring.",
    defaultParameters: [
      { name: "HbA1c Percentage", unit: "%", referenceRange: "< 5.7" },
    ],
  },
  {
    category: "Urinalysis",
    testName: "Urinalysis Routine & Microscopy",
    turnaroundHours: 2,
    sampleType: "Midstream Urine",
    description: "Checks physical, chemical, and microscopic properties of urine for infection or renal dysfunction.",
    defaultParameters: [
      { name: "Urine Color & Clarity", unit: "", referenceRange: "Pale Yellow, Clear" },
      { name: "Specific Gravity", unit: "", referenceRange: "1.005 - 1.030" },
      { name: "Urine pH", unit: "", referenceRange: "4.6 - 8.0" },
      { name: "Protein", unit: "", referenceRange: "Negative" },
      { name: "Glucose", unit: "", referenceRange: "Negative" },
      { name: "Leukocyte Esterase", unit: "", referenceRange: "Negative" },
    ],
  },
  {
    category: "Cardiology",
    testName: "Cardiac Troponin-I & CK-MB",
    turnaroundHours: 1,
    sampleType: "Plasma / Heparin",
    description: "Critical emergency diagnostic marker for myocardial injury or acute coronary syndrome.",
    defaultParameters: [
      { name: "Troponin-I High-Sensitivity", unit: "ng/mL", referenceRange: "< 0.04" },
      { name: "CK-MB", unit: "ng/mL", referenceRange: "0.0 - 5.0" },
    ],
  },
];

const formatLabOrder = (o: any) => ({
  id: o.id,
  orderNumber: o.orderNumber,
  patientId: o.patientId,
  patientName: o.patient?.name || "Patient",
  patientMrn: o.patient?.mrn || "N/A",
  patientGender: o.patient?.gender || "",
  patientAge: o.patient?.age || 0,
  patientPhone: o.patient?.phone || "",
  patientBloodGroup: o.patient?.bloodGroup || "",
  doctorId: o.doctorId,
  doctorName: o.doctor?.name || "Doctor",
  doctorSpecialty: o.doctor?.specialty || "",
  doctorRoom: o.doctor?.room || "",
  consultationId: o.consultationId,
  testCategory: o.testCategory,
  testName: o.testName,
  priority: o.priority,
  status: o.status,
  clinicalNotes: o.clinicalNotes || "",
  orderedAt: o.orderedAt,
  collectedAt: o.collectedAt,
  completedAt: o.completedAt,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
  results: (o.results || []).map((r: any) => ({
    id: r.id,
    parameterName: r.parameterName,
    measuredValue: r.measuredValue,
    unit: r.unit,
    referenceRange: r.referenceRange,
    status: r.status,
    technicianNotes: r.technicianNotes,
    verifiedBy: r.verifiedBy,
    createdAt: r.createdAt,
  })),
});

export const labService = {
  /**
   * Get diagnostic test catalogue.
   */
  getCatalog(): LabCatalogTest[] {
    return LAB_CATALOG;
  },

  /**
   * List lab orders with filtering, search and metrics.
   */
  async listOrders(query: GetLabOrdersQuery) {
    const where: any = {};

    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.consultationId) where.consultationId = query.consultationId;
    if (query.status && query.status !== "all") where.status = query.status;
    if (query.priority && query.priority !== "all") where.priority = query.priority;
    if (query.category && query.category !== "all") where.testCategory = query.category;

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { testName: { contains: q } },
        { testCategory: { contains: q } },
        { patient: { name: { contains: q } } },
        { patient: { mrn: { contains: q } } },
        { doctor: { name: { contains: q } } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const [total, orders, allCounts] = await Promise.all([
      prisma.labOrder.count({ where }),
      prisma.labOrder.findMany({
        where,
        include: {
          patient: true,
          doctor: true,
          results: true,
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.labOrder.findMany({
        select: {
          status: true,
          priority: true,
          results: {
            select: { status: true },
          },
        },
      }),
    ]);

    // Compute live metrics
    let pendingCollection = 0;
    let inAnalysis = 0;
    let completed = 0;
    let criticalCount = 0;

    for (const ord of allCounts) {
      if (ord.status === "Requested") pendingCollection++;
      else if (ord.status === "Sample Collected" || ord.status === "In-Analysis") inAnalysis++;
      else if (ord.status === "Completed") completed++;

      if (ord.results.some((r) => r.status === "Critical")) {
        criticalCount++;
      }
    }

    return {
      orders: orders.map(formatLabOrder),
      metrics: {
        totalOrders: allCounts.length,
        pendingCollection,
        inAnalysis,
        completed,
        criticalCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  /**
   * Get single lab order by ID.
   */
  async getOrderById(id: string) {
    const order = await prisma.labOrder.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            vitals: { orderBy: { recordedAt: "desc" }, take: 1 },
          },
        },
        doctor: true,
        consultation: true,
        results: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      throw new NotFoundError(`Lab order with ID '${id}' not found`);
    }

    return formatLabOrder(order);
  },

  /**
   * Create a new lab order request.
   */
  async createOrder(data: CreateLabOrderInput) {
    // Verify patient
    const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
    if (!patient) throw new NotFoundError(`Patient with ID ${data.patientId} not found`);

    // Verify doctor
    const doctor = await prisma.doctor.findUnique({ where: { id: data.doctorId } });
    if (!doctor) throw new NotFoundError(`Doctor with ID ${data.doctorId} not found`);

    // Generate unique order number LAB-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await prisma.labOrder.count();
    const orderNumber = `LAB-${year}-${String(count + 1).padStart(4, "0")}`;

    const created = await prisma.labOrder.create({
      data: {
        orderNumber,
        patientId: data.patientId,
        doctorId: data.doctorId,
        consultationId: data.consultationId || null,
        testCategory: data.testCategory,
        testName: data.testName,
        priority: data.priority,
        clinicalNotes: data.clinicalNotes || null,
        status: "Requested",
      },
      include: {
        patient: true,
        doctor: true,
        results: true,
      },
    });

    return formatLabOrder(created);
  },

  /**
   * Update lab order status (Requested -> Sample Collected -> In-Analysis -> Completed -> Cancelled)
   */
  async updateOrderStatus(id: string, input: UpdateLabOrderStatusInput) {
    const existing = await prisma.labOrder.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(`Lab order '${id}' not found`);

    const updateData: any = { status: input.status };
    if (input.status === "Sample Collected" && !existing.collectedAt) {
      updateData.collectedAt = new Date();
    }
    if (input.status === "Completed" && !existing.completedAt) {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.labOrder.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        doctor: true,
        results: true,
      },
    });

    return formatLabOrder(updated);
  },

  /**
   * Enter or update diagnostic test results.
   */
  async enterResults(id: string, input: EnterLabResultsInput) {
    const existing = await prisma.labOrder.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(`Lab order '${id}' not found`);

    return await prisma.$transaction(async (tx) => {
      // Clear previous results if any
      await tx.labResult.deleteMany({ where: { labOrderId: id } });

      // Create new results
      for (const res of input.results) {
        await tx.labResult.create({
          data: {
            labOrderId: id,
            parameterName: res.parameterName,
            measuredValue: res.measuredValue,
            unit: res.unit || "",
            referenceRange: res.referenceRange || "",
            status: res.status,
            technicianNotes: res.technicianNotes || input.technicianNotes || null,
            verifiedBy: res.verifiedBy || input.verifiedBy || "Certified Laboratory Technologist",
          },
        });
      }

      // Mark order as completed
      const updatedOrder = await tx.labOrder.update({
        where: { id },
        data: {
          status: "Completed",
          completedAt: new Date(),
        },
        include: {
          patient: true,
          doctor: true,
          results: true,
        },
      });

      return formatLabOrder(updatedOrder);
    });
  },
};
