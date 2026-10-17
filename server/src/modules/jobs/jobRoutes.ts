import { Router, Request, Response, NextFunction } from "express";
import jobQueue from "../../jobs/jobQueue.js";
import { authenticate, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = Router();

/**
 * GET /api/v1/jobs
 * List all background jobs and metrics summary
 */
router.get(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, name } = req.query;
      const organizationId = req.organizationId || (req.query.organizationId as string);

      const jobs = jobQueue.listJobs({
        status: status as any,
        name: name as string,
        organizationId: organizationId === "all" ? undefined : organizationId,
      });

      const metrics = jobQueue.getMetrics(organizationId === "all" ? undefined : organizationId);

      res.json({
        success: true,
        data: jobs,
        metrics,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/jobs/report
 * Trigger an asynchronous report compilation job
 */
router.post(
  "/report",
  authenticate,
  authorizeRoles("Admin", "Hospital Admin", "Doctor"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportType, title } = req.body || {};
      const organizationId = req.organizationId || "org-careflow-central";

      const job = await jobQueue.add(
        "report-generation",
        {
          reportType: reportType || "MONTHLY_EXECUTIVE_SUMMARY",
          title: title || "Executive Operations & Financial Audit",
          requestedBy: req.user?.name || "Hospital Admin",
        },
        {
          organizationId,
          maxAttempts: 3,
        }
      );

      res.status(202).json({
        success: true,
        message: "Report compilation job enqueued",
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/jobs/notification
 * Trigger an asynchronous staff broadcast / urgent alert job
 */
router.post(
  "/notification",
  authenticate,
  authorizeRoles("Admin", "Hospital Admin", "Doctor"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, type, targetRole } = req.body || {};
      const organizationId = req.organizationId || "org-careflow-central";

      const job = await jobQueue.add(
        "notification-delivery",
        {
          title: title || "Urgent Clinical Notice",
          description: description || "Immediate patient triage required in Emergency Ward.",
          type: type || "urgent",
          targetRole,
        },
        {
          organizationId,
          maxAttempts: 3,
        }
      );

      res.status(202).json({
        success: true,
        message: "Notification broadcast job enqueued",
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/jobs/simulate-failure
 * Trigger a deliberate failing job to demonstrate retries & Dead-Letter Queue (DLQ)
 */
router.post(
  "/simulate-failure",
  authenticate,
  authorizeRoles("Admin", "Hospital Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errorMessage } = req.body || {};
      const organizationId = req.organizationId || "org-careflow-central";

      const job = await jobQueue.add(
        "dlq-simulation-test",
        {
          errorMessage: errorMessage || "External Payment Settlement Gateway Timeout (504)",
        },
        {
          organizationId,
          maxAttempts: 3,
          backoffMs: 800,
        }
      );

      res.status(202).json({
        success: true,
        message: "DLQ test job enqueued (will fail 3 times and move to Dead-Letter Queue)",
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/jobs/:id/retry
 * Manually retry a Dead-Letter Queue (DLQ) job
 */
router.post(
  "/:id/retry",
  authenticate,
  authorizeRoles("Admin", "Hospital Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const job = jobQueue.retryJob(id);

      if (!job) {
        res.status(404).json({
          success: false,
          message: `Job ${id} not found or cannot be retried`,
        });
        return;
      }

      res.json({
        success: true,
        message: `Job ${id} re-enqueued for execution`,
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/v1/jobs/clear
 * Clear completed jobs
 */
router.delete(
  "/clear",
  authenticate,
  authorizeRoles("Admin", "Hospital Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cleared = jobQueue.clearCompleted();
      res.json({
        success: true,
        message: `Cleared ${cleared} completed jobs`,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
