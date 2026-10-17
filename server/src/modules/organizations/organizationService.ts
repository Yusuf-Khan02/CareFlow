import prisma from "../../config/db.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";

export interface CreateOrganizationInput {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  licenseNumber?: string;
}

export const organizationService = {
  /**
   * List all registered hospital organizations / tenants
   */
  async listOrganizations() {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            patients: true,
            auditLogs: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return orgs.map((org) => ({
      id: org.id,
      name: org.name,
      code: org.code,
      address: org.address,
      phone: org.phone,
      email: org.email,
      status: org.status,
      taxId: org.taxId,
      licenseNumber: org.licenseNumber,
      createdAt: org.createdAt,
      stats: {
        usersCount: org._count.users,
        departmentsCount: org._count.departments,
        patientsCount: org._count.patients,
        auditLogsCount: org._count.auditLogs,
      },
    }));
  },

  /**
   * Get single organization details by ID or Code
   */
  async getOrganizationById(idOrCode: string) {
    const org = await prisma.organization.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
            suite: true,
          },
        },
        _count: {
          select: {
            users: true,
            patients: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundError(`Hospital organization '${idOrCode}' not found`);
    }

    return {
      ...org,
      stats: {
        usersCount: org._count.users,
        patientsCount: org._count.patients,
        departmentsCount: org.departments.length,
        auditLogsCount: org._count.auditLogs,
      },
    };
  },

  /**
   * Register a new hospital organization / tenant
   */
  async createOrganization(data: CreateOrganizationInput) {
    const existing = await prisma.organization.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictError(`Organization with code '${data.code}' already exists`);
    }

    const org = await prisma.organization.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        taxId: data.taxId || null,
        licenseNumber: data.licenseNumber || null,
        status: "Active",
      },
    });

    return org;
  },

  /**
   * Update an existing hospital organization
   */
  async updateOrganization(id: string, data: Partial<CreateOrganizationInput>) {
    const org = await prisma.organization.findUnique({
      where: { id },
    });

    if (!org) {
      throw new NotFoundError(`Hospital organization '${id}' not found`);
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        name: data.name ?? org.name,
        address: data.address ?? org.address,
        phone: data.phone ?? org.phone,
        email: data.email ?? org.email,
        taxId: data.taxId ?? org.taxId,
        licenseNumber: data.licenseNumber ?? org.licenseNumber,
      },
    });

    return updated;
  },
};

export default organizationService;
