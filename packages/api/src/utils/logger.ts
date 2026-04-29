/**
 * @file src/utils/logger.ts
 * @description Winston logger setup with console and file transports.
 */

import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  const msg = `${timestamp} [${level}]: ${message}`;
  return stack ? `${msg}\n${stack}` : msg;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: "acadivo-api" },
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        consoleFormat
      ),
    }),
    new winston.transports.File({
      filename: env.LOG_FILE,
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      filename: env.LOG_ERROR_FILE,
      level: "error",
      format: combine(timestamp(), json()),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: env.LOG_ERROR_FILE }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: env.LOG_ERROR_FILE }),
  ],
});

export default logger;
