import type { NextFunction, Request, Response } from "express";
import z from "zod";

export function validateRequest(
    schema: z.ZodType,
    source: "body" | "query" | "params",
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req[source]);
  
      if (!result.success) {
        return res.status(400).json({
          error: "Validation Failed",
          details: result.error.issues,
        });
      }
  
      res.locals[source] = result.data;
  
      next();
    };
  }
  