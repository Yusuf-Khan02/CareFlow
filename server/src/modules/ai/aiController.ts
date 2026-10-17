import type { Request, Response, NextFunction } from "express";
import { aiService } from "./aiService.js";
import { BadRequestError } from "../../utils/errors.js";

export const aiController = {
  /**
   * POST /api/v1/ai/summarize-encounter
   * Synthesize structured clinical documentation from SOAP notes
   */
  async summarizeEncounter(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body) {
        throw new BadRequestError("Payload required for clinical encounter summarization");
      }

      const summary = await aiService.summarizeEncounter(req.body);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/ai/operational-assistant
   * Query the live operational copilot
   */
  async operationalAssistant(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body || {};
      const organizationId = req.organizationId || "org-careflow-central";

      const result = await aiService.queryOperationalAssistant(query || "", organizationId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/ai/evaluate-lab
   * Evaluate laboratory parameters
   */
  async evaluateLabTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const { testName, results } = req.body || {};
      const evaluation = await aiService.evaluateLabTrends(testName || "Laboratory Panel", results || []);
      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default aiController;
