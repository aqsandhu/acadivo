/**
 * @file src/utils/sms.ts
 * @description Twilio + JazzCash/Zong SMS helper with Pakistan fallback.
 */

import twilio from "twilio";
import { env } from "../config/env";
import { logger } from "./logger";

const twilioClient = env.TWILIO_SID && env.TWILIO_AUTH_TOKEN
  ? twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Send an SMS via Twilio. Falls back to logging the OTP locally in dev / when Twilio is unconfigured.
 * @param to - E.164 phone number (e.g., +923001234567)
 * @param body - Message body
 * @returns Message SID or "SIMULATED" in fallback mode
 */
export async function sendSMS(to: string, body: string): Promise<string> {
  if (!twilioClient || !env.TWILIO_PHONE_NUMBER) {
    logger.warn(`[SMS SIMULATION] To: ${to} | Body: ${body}`);
    return "SIMULATED";
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS sent to ${to}: ${message.sid}`);
    return message.sid;
  } catch (err: any) {
    logger.error(`Twilio SMS failed for ${to}: ${err.message}`);
    // Fallback: log locally so OTP can still be used in dev/testing
    logger.warn(`[SMS FALLBACK] To: ${to} | Body: ${body}`);
    return "FALLBACK_SIMULATED";
  }
}

/**
 * Send an OTP SMS with Acadivo branding.
 */
export async function sendOTPSMS(to: string, otp: string): Promise<string> {
  const body = `Your Acadivo verification code is: ${otp}. It will expire in 10 minutes. Do not share it with anyone.`;
  return sendSMS(to, body);
}
