/**
 * Cross-tenant validation middleware
 * Prevents users from accessing data outside their tenant
 */

import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { AuthenticatedSocket } from "../types/socket";
import { logger } from "../utils/logger";

interface TenantScopedData {
  tenantId?: string;
  receiverId?: string;
  groupId?: string;
}

export function crossTenantValidationMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
): void {
  const authSocket = socket as AuthenticatedSocket;
  const userTenantId = authSocket.user?.tenantId;

  if (!userTenantId) {
    logger.warn(`Socket ${socket.id} has no tenant assignment`);
    return next(new Error("Tenant validation failed: no tenant assigned"));
  }

  // Wrap event handlers to validate tenant scoping
  const originalOn = socket.on.bind(socket);

  socket.on = function(event: string, handler: (...args: any[]) => void): any {
    const wrappedHandler = (...args: any[]) => {
      const data = args[0] as TenantScopedData | undefined;

      if (data && typeof data === "object") {
        // If data includes a tenantId, validate it matches user's tenant
        if (data.tenantId && data.tenantId !== userTenantId) {
          logger.warn(
            `Cross-tenant access blocked: user ${authSocket.user.userId} (tenant ${userTenantId}) ` +
            `attempted to access tenant ${data.tenantId} via event ${event}`
          );
          socket.emit("error", {
            code: "CROSS_TENANT_ACCESS",
            message: "Cross-tenant access is not permitted",
          });
          return;
        }
      }

      return handler.apply(this, args);
    };
    return originalOn(event, wrappedHandler);
  };

  next();
}

/**
 * Validate that a target user is in the same tenant
 */
export async function validateSameTenant(
  socket: AuthenticatedSocket,
  targetTenantId?: string
): Promise<boolean> {
  const userTenantId = socket.user?.tenantId;
  if (!targetTenantId || targetTenantId === userTenantId) {
    return true;
  }
  logger.warn(
    `Cross-tenant validation failed for user ${socket.user.userId}: ` +
    `${userTenantId} !== ${targetTenantId}`
  );
  return false;
}
