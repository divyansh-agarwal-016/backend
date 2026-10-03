import z from "zod";

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

export const IdScehma = z.object({
  id: z.string(),
});

export const querySchema = z.object({
  limit: z.enum(["10", "50", "100"]),
});

export type createSchemaType = z.infer<typeof createScehma>;
export type updateScehmaType = z.infer<typeof updateScehma>;
export type IdScehmaType = z.infer<typeof IdScehma>;
export type queryScehmaType = z.infer<typeof querySchema>;