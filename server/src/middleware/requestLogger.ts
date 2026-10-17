import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

/**
 * Middleware that intercepts all incoming HTTP requests and measures processing latency.
 * Emits a structured log on response completion.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();

  res.on("finish", () => {
    const duration = Math.round(performance.now() - start);
    // Exclude noisy health check pings in production if desired, or log all
    logger.http(req.method, req.originalUrl, res.statusCode, duration);
  });

  next();
};

export default requestLogger;
