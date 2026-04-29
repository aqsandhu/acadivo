/**
 * Socket input validation middleware with XSS sanitization
 */

import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { logger } from "../utils/logger";

const XSS_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAG_PATTERN = /<[^>]*>/g;

function sanitizeString(value: string): string {
  return value
    .replace(XSS_PATTERN, "")
    .replace(HTML_TAG_PATTERN, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
}

export function socketInputValidationMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
): void {
  const originalOn = socket.on.bind(socket);

  socket.on = function(event: string, handler: (...args: any[]) => void): any {
    const wrappedHandler = (...args: any[]) => {
      try {
        const sanitizedArgs = args.map((arg) => {
          if (typeof arg === "object" && arg !== null) {
            return sanitizeValue(arg);
          }
          if (typeof arg === "string") {
            return sanitizeString(arg);
          }
          return arg;
        });
        return handler.apply(this, sanitizedArgs);
      } catch (error) {
        logger.error(`Input validation error on event ${event}:`, error);
        socket.emit("error", { code: "INVALID_INPUT", message: "Invalid input data" });
      }
    };
    return originalOn(event, wrappedHandler);
  };

  next();
}
