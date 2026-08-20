import { Router, } from "express";
import prisma from "../db.js";
import { createPostScehma, paginationQuerySchema, validateRequest } from "../schemas/postSchema.js";
const postRouter = Router();
postRouter.get("/test", (req, res) => {
    res.json({
        message: "Hi There"
    });
});
postRouter.post('/posts', validateRequest(createPostScehma, "body"), async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                author
            },
        });
        return res.status(201).json({
            newPost,
            message: "Post created successfully",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Internal Server Error",
        });
    }
});
postRouter.get("/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid post ID",
            });
        }
        const post = await prisma.post.findUnique({
            where: {
                id,
            },
        });
        if (!post) {
            return res.status(404).json({
                error: "Post not found",
            });
        }
        return res.status(200).json({
            post,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Internal Server Error",
        });
    }
});
/*** Request Flow - ChatGPT
 * Client
 * ↓
 * GET /posts?page=2&limit=5
 * ↓
 * Express parses request
 * ↓
 * req.query
 * ↓
 * Zod validates/coerces req.query
 * ↓
 * Validated page + limit
 * ↓
 * Pagination logic
 * ↓
 * Prisma
 */
postRouter.get("/posts", validateRequest(paginationQuerySchema, "query"), async (req, res) => {
    try {
        const { page, limit } = res.locals.query;
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                skip,
                take: limit,
                // orderBy: { createdAt: "desc" }
                // id provides deterministic ordering when posts have the same createdAt. otherwise it was giving the same post again & again
                orderBy: [
                    {
                        createdAt: "desc",
                    },
                    {
                        id: "desc",
                    },
                ]
            }),
            prisma.post.count()
        ]);
        const totalPages = Math.ceil(total / limit);
        res.json({
            data: posts,
            pagination: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Internal Server Error",
        });
    }
});
export { postRouter };
//# sourceMappingURL=postRouter.js.map