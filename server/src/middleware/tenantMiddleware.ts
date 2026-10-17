import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      organizationId?: string;
    }
  }
}

export const tenantMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // 1. Check header
  const headerOrg =
    (req.headers["x-organization-id"] as string) ||
    (req.headers["x-tenant-id"] as string);

  // 2. Check authenticated user's organization
  const userOrg = (req as any).user?.organizationId as string | undefined;

  // 3. Check query param
  const queryOrg = req.query.organizationId as string | undefined;

  // Resolve tenant ID, default to Central Hospital if unset
  const resolvedOrgId = headerOrg || userOrg || queryOrg || "org-careflow-central";

  req.organizationId = resolvedOrgId;

  next();
};

export default tenantMiddleware;
