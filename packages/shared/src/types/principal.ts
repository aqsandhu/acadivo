/**
 * Principal domain types
 */

export interface Principal {
  userId: string;
  tenantId: string;
  qualifications?: string;
  experience?: number;
  joiningDate?: Date;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}
