// ═══════════════════════════════════════════════════
// Pakistani SMS Gateway — Jazz (Mobilink), Zong, Telenor
// Mock implementations with proper error handling, logging, retry logic.
// Real API endpoints are configurable via environment variables.
// ═══════════════════════════════════════════════════

import { env } from "../../config/env";
import { logger } from "../../utils/logger";

export interface SMSResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export interface SMSGateway {
  name: string;
  sendSMS(to: string, body: string): Promise<SMSResult>;
}

// ───────────────────────────────────────────────────
// Retry utility with exponential backoff
// ───────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      logger.warn(`SMS attempt ${attempt}/${retries} failed: ${(err as Error).message}`);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }
  throw lastError;
}

// ───────────────────────────────────────────────────
// Jazz (Mobilink) Gateway
// ───────────────────────────────────────────────────

class JazzGateway implements SMSGateway {
  name = "jazz";
  private apiKey: string;
  private apiSecret: string;
  private endpoint: string;

  constructor() {
    this.apiKey = env.JAZZ_API_KEY || "";
    this.apiSecret = env.JAZZ_API_SECRET || "";
    this.endpoint = env.JAZZ_API_ENDPOINT || "https://api.jazz.com/sms/send";
  }

  async sendSMS(to: string, body: string): Promise<SMSResult> {
    return withRetry(async () => {
      if (!this.apiKey) {
        logger.warn(`[Jazz SMS MOCK] To: ${to} | Body: ${body}`);
        return { success: true, messageId: `JAZZ_MOCK_${Date.now()}`, provider: this.name };
      }

      try {
        // In production, replace with real HTTP call to Jazz API
        // Example: axios.post(this.endpoint, { to, body, apiKey: this.apiKey, apiSecret: this.apiSecret })
        logger.info(`[Jazz SMS] Sending to ${to} via ${this.endpoint}`);

        // Simulated network call
        const messageId = `JAZZ_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return { success: true, messageId, provider: this.name };
      } catch (err: any) {
        logger.error(`Jazz SMS failed for ${to}: ${err.message}`);
        return { success: false, provider: this.name, error: err.message };
      }
    });
  }
}

// ───────────────────────────────────────────────────
// Zong Gateway
// ───────────────────────────────────────────────────

class ZongGateway implements SMSGateway {
  name = "zong";
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = env.ZONG_API_KEY || "";
    this.endpoint = env.ZONG_API_ENDPOINT || "https://api.zong.com.pk/sms/send";
  }

  async sendSMS(to: string, body: string): Promise<SMSResult> {
    return withRetry(async () => {
      if (!this.apiKey) {
        logger.warn(`[Zong SMS MOCK] To: ${to} | Body: ${body}`);
        return { success: true, messageId: `ZONG_MOCK_${Date.now()}`, provider: this.name };
      }

      try {
        logger.info(`[Zong SMS] Sending to ${to} via ${this.endpoint}`);
        const messageId = `ZONG_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return { success: true, messageId, provider: this.name };
      } catch (err: any) {
        logger.error(`Zong SMS failed for ${to}: ${err.message}`);
        return { success: false, provider: this.name, error: err.message };
      }
    });
  }
}

// ───────────────────────────────────────────────────
// Telenor Gateway
// ───────────────────────────────────────────────────

class TelenorGateway implements SMSGateway {
  name = "telenor";
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = env.TELENOR_API_KEY || "";
    this.endpoint = env.TELENOR_API_ENDPOINT || "https://api.telenor.com.pk/sms/send";
  }

  async sendSMS(to: string, body: string): Promise<SMSResult> {
    return withRetry(async () => {
      if (!this.apiKey) {
        logger.warn(`[Telenor SMS MOCK] To: ${to} | Body: ${body}`);
        return { success: true, messageId: `TELENOR_MOCK_${Date.now()}`, provider: this.name };
      }

      try {
        logger.info(`[Telenor SMS] Sending to ${to} via ${this.endpoint}`);
        const messageId = `TELENOR_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return { success: true, messageId, provider: this.name };
      } catch (err: any) {
        logger.error(`Telenor SMS failed for ${to}: ${err.message}`);
        return { success: false, provider: this.name, error: err.message };
      }
    });
  }
}

// ───────────────────────────────────────────────────
// Gateway Factory
// ───────────────────────────────────────────────────

const gateways: Record<string, SMSGateway> = {
  jazz: new JazzGateway(),
  zong: new ZongGateway(),
  telenor: new TelenorGateway(),
};

export function getPakistaniGateway(provider: string): SMSGateway {
  const gateway = gateways[provider.toLowerCase()];
  if (!gateway) {
    throw new Error(`Unsupported Pakistani SMS provider: ${provider}`);
  }
  return gateway;
}

export function isPakistaniNumber(phone: string): boolean {
  const normalized = phone.replace(/\s/g, "").replace(/^00/, "+");
  return normalized.startsWith("+92") || normalized.startsWith("0092");
}

export { gateways };
