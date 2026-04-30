/**
 * @file src/utils/email.ts
 * @description Nodemailer + SendGrid email helper with template functions.
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

// ═══════════════════════════════════════════════
// Template Email Helpers
// ═══════════════════════════════════════════════

/**
 * Send a fee reminder email to a parent.
 */
export async function sendFeeReminderEmail(to: string, name: string, studentName: string, amount: number, dueDate: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Fee Reminder - Rs.${amount.toLocaleString()} due on ${dueDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Fee Reminder</h2>
        <p>Dear ${name},</p>
        <p>This is a reminder that the fee payment for <strong>${studentName}</strong> is due soon.</p>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Amount Due</strong></td><td style="border: 1px solid #ddd; padding: 8px;">Rs.${amount.toLocaleString()}</td></tr>
          <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Due Date</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${dueDate}</td></tr>
        </table>
        <p>Please make the payment before the due date to avoid late charges.</p>
        <a href="${env.WEB_URL}/fee" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Pay Now</a>
        <hr/>
        <small>Acadivo Team</small>
      </div>
    `,
    text: `Dear ${name},\n\nFee payment for ${studentName} of Rs.${amount.toLocaleString()} is due on ${dueDate}. Please pay before the due date.\n\nAcadivo Team`,
  });
}

/**
 * Send an attendance alert email to a parent.
 */
export async function sendAttendanceAlertEmail(to: string, name: string, studentName: string, days: number): Promise<void> {
  await sendEmail({
    to,
    subject: `Attendance Alert - ${studentName} absent for ${days} day(s)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Attendance Alert</h2>
        <p>Dear ${name},</p>
        <p>We noticed that <strong>${studentName}</strong> has been absent for <strong>${days} consecutive day(s)</strong>.</p>
        <p>Regular attendance is important for academic progress. If there is a medical or personal reason, please inform the school office.</p>
        <p>Please ensure ${studentName} attends school regularly.</p>
        <a href="${env.WEB_URL}/attendance" style="display:inline-block;padding:12px 24px;background:#EF4444;color:#fff;text-decoration:none;border-radius:6px;">View Attendance</a>
        <hr/>
        <small>Acadivo Team</small>
      </div>
    `,
    text: `Dear ${name},\n\n${studentName} has been absent for ${days} consecutive day(s). Please ensure regular attendance.\n\nAcadivo Team`,
  });
}

/**
 * Send a welcome email to a newly created user with role-specific info.
 */
export async function sendWelcomeEmailToUser(to: string, name: string, role: string, loginUrl: string): Promise<void> {
  const roleMessages: Record<string, string> = {
    STUDENT: "You can now view your timetable, homework, results, and attendance.",
    PARENT: "You can now monitor your children's progress, fee records, and attendance.",
    TEACHER: "You can now manage classes, mark attendance, grade assignments, and communicate with students.",
    PRINCIPAL: "You have full administrative access to your school.",
    ADMIN: "You have administrative access to manage school operations.",
    SUPER_ADMIN: "You have platform-level access to manage all schools.",
  };

  await sendEmail({
    to,
    subject: "Welcome to Acadivo! Your account is ready",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${name}!</h2>
        <p>Your <strong>${role}</strong> account on Acadivo has been created successfully.</p>
        <p>${roleMessages[role] || "Login to explore your dashboard."}</p>
        <a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Get Started</a>
        <p style="margin-top: 16px; font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link: ${loginUrl}</p>
        <hr/>
        <small>Acadivo Team</small>
      </div>
    `,
    text: `Welcome, ${name}! Your ${role} account on Acadivo is ready. Login at: ${loginUrl}`,
  });
}

/**
 * Send a notification email when a student's report is ready.
 */
export async function sendReportReadyEmail(to: string, name: string, studentName: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Report Ready - ${studentName}'s report is now available`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Report Ready</h2>
        <p>Dear ${name},</p>
        <p>The report for <strong>${studentName}</strong> is now available on the Acadivo platform.</p>
        <p>You can view the detailed report by clicking the button below:</p>
        <a href="${env.WEB_URL}/reports" style="display:inline-block;padding:12px 24px;background:#10B981;color:#fff;text-decoration:none;border-radius:6px;">View Report</a>
        <hr/>
        <small>Acadivo Team</small>
      </div>
    `,
    text: `Dear ${name},\n\nThe report for ${studentName} is now available. Login to view it: ${env.WEB_URL}/reports\n\nAcadivo Team`,
  });
}

/**
 * Send an announcement email to a user.
 */
export async function sendAnnouncementEmail(to: string, name: string, title: string, message: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Announcement: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${title}</h2>
        <p>Dear ${name},</p>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p>${message.replace(/\n/g, "<br/>")}</p>
        </div>
        <a href="${env.WEB_URL}/announcements" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">View All Announcements</a>
        <hr/>
        <small>Acadivo Team</small>
      </div>
    `,
    text: `Dear ${name},\n\n${title}\n\n${message}\n\nAcadivo Team`,
  });
}
