import type { Request, Response, NextFunction } from "express";
import { queueService } from "./queueService.js";
import { broadcastQueueUpdate } from "../../realtime/socketService.js";

/**
 * GET /api/v1/queue
 * List queue tokens and operational waiting-time metrics.
 */
export const getQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await queueService.listQueue(req.query as any);
    res.json({
      success: true,
      data: result.tokens,
      metrics: result.metrics,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/queue
 * Issue a queue token for an arriving patient or walk-in.
 */
export const createToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = await queueService.createToken(req.body);
    const orgId = req.organizationId || "org-careflow-central";
    broadcastQueueUpdate(orgId, "token_created", token);

    res.status(201).json({
      success: true,
      message: `Token ${token.tokenNumber} issued successfully`,
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/queue/call-next
 * Atomically call the next highest-priority waiting patient.
 */
export const callNext = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { doctorId, departmentId } = req.body || {};
    const token = await queueService.callNext(
      doctorId ? Number(doctorId) : undefined,
      departmentId
    );

    const orgId = req.organizationId || "org-careflow-central";
    broadcastQueueUpdate(orgId, "token_called", token);

    res.json({
      success: true,
      message: `Calling patient ${token.patientName} (Token: ${token.tokenNumber})`,
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/queue/:id/call
 * Directly call a specific patient token.
 */
export const callToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { doctorId } = req.body || {};
    const token = await queueService.callToken(
      id,
      doctorId ? Number(doctorId) : undefined
    );

    const orgId = req.organizationId || "org-careflow-central";
    broadcastQueueUpdate(orgId, "token_called", token);

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} called`,
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/queue/:id/start
 * Mark token as in-consultation.
 */
export const startConsultation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const token = await queueService.startConsultation(id);

    const orgId = req.organizationId || "org-careflow-central";
    broadcastQueueUpdate(orgId, "token_called", token);

    res.json({
      success: true,
      message: `Consultation in progress for token ${token.tokenNumber}`,
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/queue/:id/complete
 * Mark token encounter as completed.
 */
export const completeToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const token = await queueService.completeToken(id);

    const orgId = req.organizationId || "org-careflow-central";
    broadcastQueueUpdate(orgId, "token_completed", token);

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} completed`,
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/queue/:id/skip
 * Skip a waiting or called patient (e.g. no-show).
 */
export const skipToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const token = await queueService.skipToken(id);

    const orgId = req.organizationId || "org-careflow-central";
    broadcastQueueUpdate(orgId, "token_skipped", token);

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} skipped`,
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/queue/:id/recall
 * Return a skipped patient back to the waiting line.
 */
export const returnToWaiting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const token = await queueService.returnToWaiting(id);

    const orgId = req.organizationId || "org-careflow-central";
    broadcastQueueUpdate(orgId, "token_recalled", token);

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} returned to waiting line`,
      data: token,
    });
  } catch (error) {
    next(error);
  }
};
