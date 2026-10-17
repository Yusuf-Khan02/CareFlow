import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject, ZodEffects } from "zod";

type SchemaType = AnyZodObject | ZodEffects<AnyZodObject>;

interface RequestValidationSchema {
  body?: SchemaType;
  query?: SchemaType;
  params?: SchemaType;
}

/**
 * Higher-order middleware to validate incoming request body, query, and path params using Zod.
 * If validation fails, passes the ZodError to next(error) for the centralized errorHandler.
 */
export const validateRequest = (schemas: RequestValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as typeof req.query;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as typeof req.params;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
