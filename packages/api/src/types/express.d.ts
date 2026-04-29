/**
 * @file src/types/express.d.ts
 * @description Global type augmentation for Express Request to include `user` property.
 */

import { TokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & {
        userId: string;
        role: string;
        tenantId: string | null;
        uniqueId: string;
      };
      /** Resolved tenantId from user context or headers (set by tenantGuard) */
      resolvedTenantId?: string;
    }
  }
}

export {};
