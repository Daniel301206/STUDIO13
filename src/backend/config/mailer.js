import nodemailer from "nodemailer";
import env from "./env.js";

export const isMailerConfigured = () =>
  Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);

let transporter;

const getTransporter = () => {
  if (!isMailerConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendMail = async ({ to, subject, text, html }) => {
  const currentTransporter = getTransporter();
  if (!currentTransporter) {
    throw new Error("El servicio de correo no está configurado.");
  }

  return currentTransporter.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};
