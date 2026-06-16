import jwt from "jsonwebtoken";

function userMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ message: "Token missing" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

export { userMiddleware };