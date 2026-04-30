/**
 * @file src/utils/sms.ts
 * @description Re-export from unified SMS service + helper functions for common SMS templates.
 * All core SMS logic lives in src/services/sms.service.ts.
 */

import axios from "axios";
import { env } from "../config/env";
import { logger } from "./logger";

export { sendSMS, sendOTPSMS, isPakistaniNumber } from "../services/sms.service";

// ── Helper SMS Templates ──

/**
 * Send a fee reminder SMS to a parent/student.
 */
export async function sendFeeReminderSMS(to: string, studentName: string, amount: number, dueDate: string): Promise<string> {
  const body = `Fee Reminder: Dear Parent, fee amount Rs.${amount.toLocaleString()} for ${studentName} is due on ${dueDate}. Please pay before the due date to avoid late charges. - Acadivo`;
  const { sendSMS } = await import("../services/sms.service");
  return sendSMS(to, body);
}

/**
 * Send an attendance alert SMS when a student is absent for multiple days.
 */
export async function sendAttendanceAlertSMS(to: string, studentName: string, days: number): Promise<string> {
  const body = `Attendance Alert: ${studentName} has been absent for ${days} consecutive day(s). Please ensure regular attendance. Contact the school for more info. - Acadivo`;
  const { sendSMS } = await import("../services/sms.service");
  return sendSMS(to, body);
}

/**
 * Send a welcome SMS to a newly registered user.
 */
export async function sendWelcomeSMS(to: string, name: string, role: string): Promise<string> {
  const body = `Welcome to Acadivo, ${name}! Your ${role} account has been created. Login at ${env.WEB_URL} to get started.`;
  const { sendSMS } = await import("../services/sms.service");
  return sendSMS(to, body);
}

/**
 * Send an SMS notification when a report is ready.
 */
export async function sendReportReadySMS(to: string, studentName: string, reportType: string): Promise<string> {
  const body = `Report Ready: The ${reportType.toLowerCase()} report for ${studentName} is now available. Login to Acadivo to view it. - Acadivo`;
  const { sendSMS } = await import("../services/sms.service");
  return sendSMS(to, body);
}

// ── Direct HTTP Fallback for Pakistani Gateways (axios-based) ──

interface GatewayConfig {
  endpoint: string;
  apiKey: string;
  apiSecret?: string;
  sender?: string;
}

/**
 * Send SMS directly via a Pakistani gateway using axios HTTP requests.
 * Used as a low-level fallback when Twilio SDK is not available.
 */
export async function sendViaPakistaniGatewayHTTP(
  to: string,
  body: string,
  gateway: "jazz" | "zong" | "telenor"
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const configs: Record<string, GatewayConfig> = {
    jazz: {
      endpoint: env.JAZZ_API_ENDPOINT || "https://api.jazz.com/sms/send",
      apiKey: env.JAZZ_API_KEY || "",
      apiSecret: env.JAZZ_API_SECRET || undefined,
      sender: "Acadivo",
    },
    zong: {
      endpoint: env.ZONG_API_ENDPOINT || "https://api.zong.com.pk/sms/send",
      apiKey: env.ZONG_API_KEY || "",
      sender: "Acadivo",
    },
    telenor: {
      endpoint: env.TELENOR_API_ENDPOINT || "https://api.telenor.com.pk/sms/send",
      apiKey: env.TELENOR_API_KEY || "",
      sender: "Acadivo",
    },
  };

  const config = configs[gateway];
  if (!config) {
    return { success: false, error: `Unknown gateway: ${gateway}` };
  }

  // If no API key configured, simulate success
  if (!config.apiKey) {
    logger.warn(`[${gateway.toUpperCase()} SMS MOCK - Axios] To: ${to} | Body: ${body}`);
    return { success: true, messageId: `${gateway.toUpperCase()}_MOCK_${Date.now()}` };
  }

  try {
    const response = await axios.post(
      config.endpoint,
      {
        to,
        body,
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
        sender: config.sender,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    logger.info(`[${gateway.toUpperCase()} SMS via axios] Sent to ${to}: ${response.status}`);
    return {
      success: true,
      messageId: `${gateway.toUpperCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
  } catch (err: any) {
    logger.error(`[${gateway.toUpperCase()} SMS axios failed] ${to}: ${err.message}`);
    return { success: false, error: err.message };
  }
}
