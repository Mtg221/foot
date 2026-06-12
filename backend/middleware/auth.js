import jwt from "jsonwebtoken";

export function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès non autorisé" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    req.admin = true;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}
