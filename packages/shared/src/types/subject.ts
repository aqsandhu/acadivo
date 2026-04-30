/**
 * Subject domain types
 */

export interface Subject {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  creditHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
