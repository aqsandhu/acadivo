/**
 * School Admin domain types
 */

export interface SchoolAdmin {
  userId: string;
  tenantId: string;
  department?: string;
  permissions?: unknown[]; // JSON array of allowed action strings
  joiningDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
