/**
 * Audit Log domain types
 */

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  severity: AuditSeverity;
  createdAt: Date;
}

export enum AuditAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  SUSPEND = "SUSPEND",
  ACTIVATE = "ACTIVATE",
}

export enum AuditSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface AuditFilter {
  tenantId?: string;
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: AuditSeverity;
}
