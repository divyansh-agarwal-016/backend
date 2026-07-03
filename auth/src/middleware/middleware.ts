import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_TOKEN) {
  throw new Error("Missing JWT_ACCESS_SECRET");
}

export default function middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Access token missing",
    });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid authorization header",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_TOKEN!) as JwtPayload;

    req.userId = decoded.userId;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
}