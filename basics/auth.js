import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ message: "Token missing" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

export { authMiddleware, JWT_SECRET };