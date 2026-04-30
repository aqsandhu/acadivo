/**
 * @file src/middleware/auditLog.ts
 * @description Audit log middleware for tracking changes on sensitive routes.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";

export interface AuditLogOptions {
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

/**
 * Middleware factory that logs an audit entry after the response finishes.
 * Attaches metadata but does not block the response.
 */
export function auditLog(options: AuditLogOptions): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on("finish", async () => {
      try {
        const user = req.user;
        const tenantId = user?.tenantId || (req.headers["x-tenant-id"] as string) || null;

        await prisma.auditLog.create({
          data: {
            tenantId: tenantId || "system",
            userId: user?.userId || null,
            action: options.action,
            entityType: options.entityType || req.path,
            entityId: options.entityId || req.params.id || null,
            oldValues: options.oldValues || null,
            newValues: options.newValues || {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              durationMs: Date.now() - startTime,
              ip: req.ip,
              userAgent: req.headers["user-agent"],
            },
            ipAddress: req.ip || null,
          },
        });
      } catch (err: any) {
        logger.error(`Audit log failed: ${err.message}`);
      }
    });

    next();
  };
}
