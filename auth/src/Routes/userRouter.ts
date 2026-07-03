import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db.js";
import middleware from "../middleware/middleware.js";

const userRouter = Router();

const JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_SECRET;
if (!JWT_ACCESS_TOKEN) {
  throw new Error("Missing JWT_ACCESS_SECRET");
}

const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_SECRET;
if (!JWT_REFRESH_TOKEN) {
  throw new Error("Missing JWT_REFRESH_SECRET");
}

const signupSchema = z.object({
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
      "Password must contain at least one special character"
    ),
});

const signinSchema = z.object({
  email: z.email("Email is mandatory"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30)
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

type SignupBody = z.infer<typeof signupSchema>;
type SigninBody = z.infer<typeof signinSchema>;

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
  "/signup",
  validateBody(signupSchema),
  async (req: Request<{}, {}, SignupBody>, res: Response) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Invalid credentials",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return res.status(201).json({
        message: "User created successfully",
      });
    } catch (error: unknown) {
      console.error(error);

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }
);

userRouter.post(
  "/signin",
  validateBody(signinSchema),
  async (req: Request<{}, {}, SigninBody>, res: Response) => {
    try {
      const { email, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          password: true,
        },
      });

      if (!existingUser) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const accessToken = jwt.sign(
        { userId: existingUser.id },
        JWT_ACCESS_TOKEN,
        {
          expiresIn: "15m",
        }
      );

      const refreshToken = jwt.sign(
        { userId: existingUser.id },
        JWT_REFRESH_TOKEN,
        {
          expiresIn: "7d",
        }
      );

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          user: {
            connect: {
              id: existingUser.id,
            },
          },
        },
      });

      return res.status(200).json({
        accessToken,
        refreshToken,
      });
    } catch (error: unknown) {
      console.error(error);

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }
);

userRouter.get(
  "/me",
  middleware,
  async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        user,
      });
    } catch (error: unknown) {
      console.error(error);

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }
);

export { userRouter };