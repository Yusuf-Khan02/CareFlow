import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";

/**
 * List all hospital departments with physician counts.
 */
export const getDepartments = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            doctors: true,
            patients: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description,
        suite: d.suite,
        doctorCount: d._count.doctors,
        patientCount: d._count.patients,
      })),
    });
  } catch (error) {
    next(error);
  }
};
