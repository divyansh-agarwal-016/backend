import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { check, z } from "zod";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import prisma from "../db.js";

const userRouter = Router();

const requiredBodySchema = z.object({
  name: z
    .string()
    .min(5, "Name should be at least 5 characters")
    .max(20, "Name should not be more than 20 characters"),

  email: z.email("Email is mandatory"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30)
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

type RequiredBody = z.infer<typeof requiredBodySchema>;

function validateBody<T extends z.ZodTypeAny>(schema: T) {
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

userRouter.post(
  "/sign-up",
  validateBody(requiredBodySchema),

  async (req: Request<{}, {}, RequiredBody>, res: Response) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error: unknown) {
      console.error(error);

      return res.status(500).json({
        error: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  },
);
export { userRouter };
