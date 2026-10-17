import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import {
  getQueue,
  createToken,
  callNext,
  callToken,
  startConsultation,
  completeToken,
  skipToken,
  returnToWaiting,
} from "./queueController.js";
import {
  createQueueTokenSchema,
  callNextSchema,
  getQueueQuerySchema,
  tokenIdParamSchema,
} from "./queueValidation.js";

const router = Router();

// GET /api/v1/queue - List queue tokens & wait metrics
router.get(
  "/",
  validateRequest({ query: getQueueQuerySchema }),
  getQueue
);

// POST /api/v1/queue - Issue token (Check-in or Walk-in)
router.post(
  "/",
  validateRequest({ body: createQueueTokenSchema }),
  createToken
);

// POST /api/v1/queue/call-next - Concurrency-safe call next waiting patient
router.post(
  "/call-next",
  validateRequest({ body: callNextSchema }),
  callNext
);

// PATCH /api/v1/queue/:id/call - Directly call specific token
router.patch(
  "/:id/call",
  validateRequest({ params: tokenIdParamSchema }),
  callToken
);

// PATCH /api/v1/queue/:id/start - Start consultation
router.patch(
  "/:id/start",
  validateRequest({ params: tokenIdParamSchema }),
  startConsultation
);

// PATCH /api/v1/queue/:id/complete - Mark token complete
router.patch(
  "/:id/complete",
  validateRequest({ params: tokenIdParamSchema }),
  completeToken
);

// PATCH /api/v1/queue/:id/skip - Skip token
router.patch(
  "/:id/skip",
  validateRequest({ params: tokenIdParamSchema }),
  skipToken
);

// PATCH /api/v1/queue/:id/recall - Return skipped/called token to waiting
router.patch(
  "/:id/recall",
  validateRequest({ params: tokenIdParamSchema }),
  returnToWaiting
);

export default router;
