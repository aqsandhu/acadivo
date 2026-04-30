/**
 * Section domain types
 */

export interface Section {
  id: string;
  tenantId: string;
  classId: string;
  name: string;
  capacity: number;
  roomNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
