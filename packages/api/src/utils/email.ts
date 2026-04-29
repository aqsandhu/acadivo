/**
 * @file src/utils/email.ts
 * @description Nodemailer + SendGrid email helper.
 */

import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger";

// ── Nodemailer Transporter ──
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: nodemailer.SendMailOptions["attachments"];
}

/**
 * Send an email via the configured transporter.
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
    logger.info(`Email sent to ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`);
  } catch (err: any) {
    logger.error(`Email send failed: ${err.message}`);
    throw err;
  }
}

/**
 * Send a password-reset email.
 */
export async function sendPasswordResetEmail(to: string, resetToken: string, name: string): Promise<void> {
  const resetUrl = `${env.WEB_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to,
    subject: "Reset your Acadivo password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>You requested a password reset for your Acadivo account.</p>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <hr/>
        <small>Acadivo Team</small>
      </div>
    `,
    text: `Hello ${name},\n\nReset your password here: ${resetUrl}\nThis link expires in 1 hour.`,
  });
}

/**
 * Send a welcome email.
 */
export async function sendWelcomeEmail(to: string, name: string, loginUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Welcome to Acadivo!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${name}!</h2>
        <p>Your Acadivo account is ready.</p>
        <a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Log In</a>
        <hr/>
        <small>Acadivo Team</small>
      </div>
    `,
  });
}
