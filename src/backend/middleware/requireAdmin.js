import { getSigningSecret, verifyAdminToken } from "../auth/adminToken.js";
import prisma from "../config/databases.js";

const requireAdmin = async (req, res, next) => {
  const signingSecret = getSigningSecret();
  if (!signingSecret) {
    return res.status(500).json({
      error: "La autenticación administrativa no está configurada correctamente.",
    });
  }

  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  const admin = match ? verifyAdminToken(match[1], signingSecret) : null;

  if (!admin) {
    return res.status(401).json({ error: "Se requiere una sesión administrativa válida." });
  }

  try {
    const current = await prisma.adminUser.findUnique({
      where: { id: admin.id },
      select: { sessionVersion: true },
    });
    if (!current || current.sessionVersion !== admin.sessionVersion) {
      return res.status(401).json({ error: "La sesión administrativa ya no es válida." });
    }
  } catch (error) {
    console.error(`[sesión administrativa] No se pudo verificar la sesión${error?.code ? ` (${error.code})` : ""}.`);
    return res.status(503).json({ error: "No se pudo verificar la sesión administrativa." });
  }

  req.admin = admin;
  return next();
};

export default requireAdmin;
