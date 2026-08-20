import { z } from "zod";
export const createPostScehma = z.object({
    title: z.string().min(5, "Title cannot be empty"),
    content: z.string().min(5, "Content cannot be empty"),
    author: z.string().min(5, "Author cannot be empty")
});
export const paginationQuerySchema = z.object({
    page: z.coerce.number().min(1, "Minimum value is 1").default(1),
    limit: z.coerce.number().min(5, "Minimum Limit is 5").default(5)
});
/** Old Middleware that only handled req.body
    export function validateBody<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
        error: "Validation Failed",
        details: result.error.issues,
        });
    }

    req.body = result.data;
    next();
    };
    }
 */
export function validateRequest(schema, source) {
    return (req, res, next) => {
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
//# sourceMappingURL=postSchema.js.map