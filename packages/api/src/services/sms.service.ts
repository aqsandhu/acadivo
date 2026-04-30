// ═══════════════════════════════════════════════════
// Unified SMS Service
// Tries Twilio first (for international), falls back to Pakistani gateway for +92 numbers.
// Uses a provider pattern so more gateways can be added easily.
// ═══════════════════════════════════════════════════

import twilio from "twilio";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import {
  getPakistaniGateway,
  isPakistaniNumber,
  SMSGateway,
  SMSResult,
} from "./sms/pakistani.gateway";

// ── Twilio client (lazy init) ──
let twilioClient: twilio.Twilio | null = null;

function getTwilioClient(): twilio.Twilio | null {
  if (!twilioClient && env.TWILIO_SID && env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

// ── Unified send ──

export async function sendSMS(to: string, body: string): Promise<string> {
  const pakistani = isPakistaniNumber(to);

  // For Pakistani numbers, prefer the configured Pakistani gateway
  if (pakistani) {
    const provider = env.PAK_SMS_PROVIDER;

    if (provider === "twilio" && getTwilioClient() && env.TWILIO_PHONE_NUMBER) {
      // Admin explicitly wants Twilio even for Pakistan
      return sendViaTwilio(to, body);
    }

    // Try the configured Pakistani provider
    return sendViaPakistaniGateway(to, body, provider);
  }

  // International numbers → Twilio first
  return sendViaTwilio(to, body);
}

// ── Twilio sender ──

async function sendViaTwilio(to: string, body: string): Promise<string> {
  const client = getTwilioClient();
  if (!client || !env.TWILIO_PHONE_NUMBER) {
    logger.warn(`[Twilio SMS UNCONFIGURED] To: ${to} | Body: ${body}`);
    return "SIMULATED";
  }

  try {
    const message = await client.messages.create({
      body,
      from: env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`Twilio SMS sent to ${to}: ${message.sid}`);
    return message.sid;
  } catch (err: any) {
    logger.error(`Twilio SMS failed for ${to}: ${err.message}`);

    // Fallback to Pakistani gateway if number is Pakistani
    if (isPakistaniNumber(to)) {
      logger.info(`Falling back to Pakistani gateway for ${to}`);
      return sendViaPakistaniGateway(to, body, env.PAK_SMS_PROVIDER);
    }

    logger.warn(`[SMS FALLBACK] To: ${to} | Body: ${body}`);
    return "FALLBACK_SIMULATED";
  }
}

// ── Pakistani gateway sender ──

async function sendViaPakistaniGateway(
  to: string,
  body: string,
  provider: string
): Promise<string> {
  try {
    const gateway: SMSGateway = getPakistaniGateway(provider);
    const result: SMSResult = await gateway.sendSMS(to, body);

    if (result.success) {
      logger.info(`${gateway.name.toUpperCase()} SMS sent to ${to}: ${result.messageId}`);
      return result.messageId || `${provider.toUpperCase()}_OK`;
    } else {
      logger.error(`${gateway.name.toUpperCase()} SMS failed for ${to}: ${result.error}`);

      // Try next available Pakistani provider in chain
      const fallbackProviders = ["jazz", "zong", "telenor"].filter((p) => p !== provider);
      for (const fallback of fallbackProviders) {
        try {
          const fallbackGateway = getPakistaniGateway(fallback);
          const fallbackResult = await fallbackGateway.sendSMS(to, body);
          if (fallbackResult.success) {
            logger.info(`Fallback ${fallback.toUpperCase()} SMS sent to ${to}: ${fallbackResult.messageId}`);
            return fallbackResult.messageId || `${fallback.toUpperCase()}_OK`;
          }
        } catch (fallbackErr: any) {
          logger.warn(`Fallback ${fallback} also failed: ${fallbackErr.message}`);
        }
      }

      logger.warn(`[PAK SMS FALLBACK SIMULATED] To: ${to} | Body: ${body}`);
      return "PAK_FALLBACK_SIMULATED";
    }
  } catch (err: any) {
    logger.error(`Pakistani gateway error for ${to}: ${err.message}`);
    logger.warn(`[PAK SMS FALLBACK SIMULATED] To: ${to} | Body: ${body}`);
    return "PAK_FALLBACK_SIMULATED";
  }
}

// ── OTP wrapper ──

export async function sendOTPSMS(to: string, otp: string): Promise<string> {
  const body = `Your Acadivo verification code is: ${otp}. It will expire in 10 minutes. Do not share it with anyone.`;
  return sendSMS(to, body);
}

// ── Re-export for external use ──
export { isPakistaniNumber };
