import bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import prisma from "../config/databases.js";
import env from "../config/env.js";
import { isMailerConfigured, sendMail } from "../config/mailer.js";
import { createAdminToken, getSigningSecret } from "../auth/adminToken.js";
import { prismaRoleToPublicRole } from "../auth/adminRoles.js";
import { clearLoginAttempts } from "../middleware/limitLoginAttempts.js";
import { isObjectBody } from "./_shared.js";

const isDatabaseConnectionError = (error) =>
  error?.name === "PrismaClientInitializationError" ||
  ["P1000", "P1001", "P1002", "P1008", "P1017"].includes(error?.code);

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const GENERIC_RESET_MESSAGE =
  "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña";

const hashResetToken = (token) => createHash("sha256").update(token).digest("hex");

const resetTokenError = (code) => {
  const messages = {
    invalid_token: "El enlace no es válido. Solicita uno nuevo.",
    expired_token: "El enlace venció. Solicita uno nuevo.",
    used_token: "El enlace ya fue utilizado. Solicita uno nuevo.",
  };
  return { code, error: messages[code] };
};


const login = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  }

  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!email || email.length > 254 || !password || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ error: "email y password deben tener un formato válido." });
  }

  try {
    const adminUser = await prisma.adminUser.findUnique({ where: { email } });
    if (!adminUser || !(await bcrypt.compare(password, adminUser.passwordHash))) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const signingSecret = getSigningSecret();
    if (!signingSecret) {
      return res.status(500).json({
        error: "La autenticación administrativa no está configurada correctamente.",
      });
    }

    const role = prismaRoleToPublicRole(adminUser.role);
    if (!role) {
      return res.status(500).json({ error: "La cuenta administrativa tiene un rol inválido." });
    }
    const admin = { id: adminUser.id, name: adminUser.name, email: adminUser.email, role };
    clearLoginAttempts(req);
    return res.status(200).json({
      token: createAdminToken({ ...admin, sessionVersion: adminUser.sessionVersion }, signingSecret),
      admin,
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error(`[iniciar sesión] PostgreSQL no disponible${error?.code ? ` (${error.code})` : ""}.`);
      return res.status(503).json({
        error: "No se pudo conectar con el servicio de autenticación. Inténtalo más tarde.",
      });
    }

    // Evitar registrar errores completos de Prisma, que podrían incluir datos de conexión.
    console.error(`[iniciar sesión] Error interno${error?.code ? ` (${error.code})` : ""}.`);
    return res.status(500).json({ error: "No se pudo iniciar sesión por un error interno." });
  }
};

const changePassword = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  }

  const currentPassword =
    typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword : "";
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Debes indicar la contraseña actual y la nueva." });
  }
  if (Buffer.byteLength(newPassword, "utf8") < 12 || Buffer.byteLength(newPassword, "utf8") > 72) {
    return res.status(400).json({ error: "La nueva contraseña debe tener entre 12 y 72 bytes." });
  }
  if (newPassword === currentPassword) {
    return res
      .status(400)
      .json({ error: "La nueva contraseña debe ser diferente a la contraseña actual." });
  }

  try {
    const adminUser = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
    if (!adminUser) {
      return res.status(404).json({ error: "La cuenta administrativa no existe." });
    }
    if (!(await bcrypt.compare(currentPassword, adminUser.passwordHash))) {
      return res.status(400).json({ error: "La contraseña actual no es correcta." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.adminUser.update({ where: { id: adminUser.id }, data: { passwordHash } });
    return res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error(`[cambiar contraseña] PostgreSQL no disponible${error?.code ? ` (${error.code})` : ""}.`);
      return res.status(503).json({
        error: "No se pudo conectar con el servicio de autenticación. Inténtalo más tarde.",
      });
    }

    console.error(`[cambiar contraseña] Error interno${error?.code ? ` (${error.code})` : ""}.`);
    return res.status(500).json({ error: "No se pudo cambiar la contraseña por un error interno." });
  }
};

const requestPasswordReset = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  }

  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Ingresa un correo electrónico válido." });
  }

  try {
    const adminUser = await prisma.adminUser.findUnique({ where: { email } });
    if (adminUser) {
      const token = randomBytes(32).toString("base64url");
      const tokenHash = hashResetToken(token);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await prisma.$transaction([
        prisma.adminPasswordResetToken.deleteMany({ where: { adminUserId: adminUser.id } }),
        prisma.adminPasswordResetToken.create({
          data: { tokenHash, adminUserId: adminUser.id, expiresAt },
        }),
      ]);

      if (!isMailerConfigured()) {
        console.error(
          "[recuperación de contraseña] SMTP no configurado: define SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASS para enviar el correo.",
        );
      } else {
        const resetUrl = `${env.ADMIN_URL}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
        try {
          await sendMail({
            to: adminUser.email,
            subject: "Restablece tu contraseña · Studio13",
            text: [
              "Recibimos una solicitud para restablecer la contraseña de tu cuenta administrativa de Studio13.",
              "",
              `Abre este enlace para crear una nueva contraseña: ${resetUrl}`,
              "",
              "El enlace vence en 30 minutos y solo puede usarse una vez.",
              "Si no solicitaste este cambio, ignora este correo.",
            ].join("\n"),
            html: `
              <div style="background:#f4f4f4;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#171717">
                <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e2e2;padding:32px">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#c8102e">Studio13 · Administración</p>
                  <h1 style="margin:0 0 16px;font-size:24px;color:#0a0a0a">Restablece tu contraseña</h1>
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4b4b4b">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta administrativa.
                  </p>
                  <p style="margin:0 0 24px">
                    <a href="${resetUrl}" style="display:inline-block;background:#c8102e;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:14px 22px">Crear nueva contraseña</a>
                  </p>
                  <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#666">
                    El enlace vence en 30 minutos y solo puede usarse una vez.
                  </p>
                  <p style="margin:0;font-size:13px;line-height:1.6;color:#666">
                    Si no solicitaste este cambio, ignora este correo.
                  </p>
                </div>
              </div>
            `,
          });
        } catch (error) {
          console.error(
            `[recuperación de contraseña] No se pudo enviar el correo${error?.code ? ` (${error.code})` : ""}.`,
          );
        }
      }
    }

    return res.status(200).json({ message: GENERIC_RESET_MESSAGE });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error(`[recuperación de contraseña] PostgreSQL no disponible${error?.code ? ` (${error.code})` : ""}.`);
      return res.status(503).json({
        error: "No se pudo procesar la solicitud. Inténtalo más tarde.",
      });
    }

    console.error(`[recuperación de contraseña] Error interno${error?.code ? ` (${error.code})` : ""}.`);
    return res.status(500).json({ error: "No se pudo procesar la solicitud por un error interno." });
  }
};

const validatePasswordResetToken = async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) {
    return res.status(200).json({ valid: false, ...resetTokenError("invalid_token") });
  }

  try {
    const record = await prisma.adminPasswordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
      select: { usedAt: true, expiresAt: true },
    });
    if (!record) {
      return res.status(200).json({ valid: false, ...resetTokenError("invalid_token") });
    }
    if (record.usedAt) {
      return res.status(200).json({ valid: false, ...resetTokenError("used_token") });
    }
    if (record.expiresAt <= new Date()) {
      return res.status(200).json({ valid: false, ...resetTokenError("expired_token") });
    }
    return res.status(200).json({ valid: true });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error(`[validar enlace] PostgreSQL no disponible${error?.code ? ` (${error.code})` : ""}.`);
      return res.status(503).json({ error: "No se pudo validar el enlace. Inténtalo más tarde." });
    }

    console.error(`[validar enlace] Error interno${error?.code ? ` (${error.code})` : ""}.`);
    return res.status(500).json({ error: "No se pudo validar el enlace por un error interno." });
  }
};

const resetPassword = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  }

  const token = typeof req.body.token === "string" ? req.body.token : "";
  const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword : "";
  const confirmPassword =
    typeof req.body.confirmPassword === "string" ? req.body.confirmPassword : "";
  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({
      error: "El enlace, la nueva contraseña y su confirmación son obligatorios.",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ code: "password_mismatch", error: "Las contraseñas no coinciden." });
  }
  if (Buffer.byteLength(newPassword, "utf8") < 12 || Buffer.byteLength(newPassword, "utf8") > 72) {
    return res.status(400).json({ error: "La nueva contraseña debe tener entre 12 y 72 bytes." });
  }

  const now = new Date();
  try {
    const result = await prisma.$transaction(async (tx) => {
      const record = await tx.adminPasswordResetToken.findUnique({
        where: { tokenHash: hashResetToken(token) },
        select: { id: true, adminUserId: true, usedAt: true, expiresAt: true },
      });
      if (!record) return { error: resetTokenError("invalid_token") };
      if (record.usedAt) return { error: resetTokenError("used_token") };
      if (record.expiresAt <= now) return { error: resetTokenError("expired_token") };

      // Consume el token y actualiza la contraseña en la misma transacción.
      const consumed = await tx.adminPasswordResetToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (consumed.count !== 1) return { error: resetTokenError("used_token") };

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await tx.adminUser.update({
        where: { id: record.adminUserId },
        data: { passwordHash, sessionVersion: { increment: 1 } },
      });
      await tx.adminPasswordResetToken.deleteMany({
        where: { adminUserId: record.adminUserId, id: { not: record.id } },
      });
      return { ok: true };
    });

    if (result.error) {
      return res.status(400).json(result.error);
    }
    return res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error(`[restablecer contraseña] PostgreSQL no disponible${error?.code ? ` (${error.code})` : ""}.`);
      return res.status(503).json({
        error: "No se pudo restablecer la contraseña. Inténtalo más tarde.",
      });
    }

    console.error(`[restablecer contraseña] Error interno${error?.code ? ` (${error.code})` : ""}.`);
    return res.status(500).json({ error: "No se pudo restablecer la contraseña por un error interno." });
  }
};

export default {
  login,
  changePassword,
  requestPasswordReset,
  validatePasswordResetToken,
  resetPassword,
};
