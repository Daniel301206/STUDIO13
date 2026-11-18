import { Router } from "express";
import adminAuthController from "../controllers/adminAuthController.js";
import limitLoginAttempts from "../middleware/limitLoginAttempts.js";
import limitPasswordResetRequests, { limitPasswordResetSubmit } from "../middleware/limitPasswordReset.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión como administrador
 *     description: Verifica las credenciales administrativas configuradas en el entorno y devuelve un token Bearer válido por ocho horas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Credenciales correctas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       400:
 *         description: Faltan credenciales.
 *       401:
 *         description: Correo o contraseña incorrectos.
 *       500:
 *         description: La autenticación no está configurada o se produjo un error interno.
 */
router.post("/login", limitLoginAttempts, adminAuthController.login);

/**
 * @swagger
 * /api/auth/password:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cambiar la contraseña del administrador
 *     description: Verifica la contraseña actual y guarda una nueva. Requiere un token Bearer administrativo válido.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Debe tener entre 12 y 72 bytes.
 *     responses:
 *       200:
 *         description: Contraseña actualizada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos o contraseña actual incorrecta.
 *       401:
 *         description: Sesión administrativa no válida.
 *       404:
 *         description: La cuenta administrativa no existe.
 *       500:
 *         description: Error interno al actualizar la contraseña.
 */
router.post("/password", requireAdmin, adminAuthController.changePassword);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Autenticación]
 *     summary: Solicitar un enlace de recuperación de contraseña
 *     description: Responde siempre con el mismo mensaje para no revelar si el correo está registrado. Limitado a 3 solicitudes cada 15 minutos por dirección IP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Mensaje genérico de recuperación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Correo con formato inválido.
 *       429:
 *         description: Demasiadas solicitudes.
 */
router.post(
  "/forgot-password",
  limitPasswordResetRequests,
  adminAuthController.requestPasswordReset,
);

/**
 * @swagger
 * /api/auth/reset-password/validate:
 *   get:
 *     tags: [Autenticación]
 *     summary: Validar un enlace de recuperación
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado del enlace.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/reset-password/validate", adminAuthController.validatePasswordResetToken);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Autenticación]
 *     summary: Restablecer la contraseña con un enlace válido
 *     description: Consume el token y actualiza la contraseña de forma atómica. Invalida las sesiones anteriores de la cuenta.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword, confirmPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Debe tener entre 12 y 72 bytes.
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Debe coincidir con newPassword.
 *     responses:
 *       200:
 *         description: Contraseña actualizada.
 *       400:
 *         description: Token inválido, vencido, reutilizado o contraseña fuera de la política.
 *       429:
 *         description: Demasiadas solicitudes.
 */
router.post("/reset-password", limitPasswordResetSubmit, adminAuthController.resetPassword);

export default router;
