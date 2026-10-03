import z from "zod";
import type { NextFunction, Request, Response } from "express";

export const createScehma = z.object({
  username: z
    .string()
    .min(3, "Name should be minimum of 3 Characters")
    .max(30, "Name shouldn't be more than 30 Characters"),
  score: z.number().min(1).gt(0),
});

export const updateScehma = z.object({
  score: z.number().min(1).gt(0),
});

export const idScehma = z.object({
  id: z.string(),
});

export const querySchema = z.object({
  limit: z.enum(["10", "50", "100"]),
});

export type createSchemaType = z.infer<typeof createScehma>;
export type updateScehmaType = z.infer<typeof updateScehma>;
export type idScehmaType = z.infer<typeof idScehma>;
export type queryScehmaType = z.infer<typeof querySchema>;

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
