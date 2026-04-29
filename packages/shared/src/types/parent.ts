/**
 * Parent/Guardian domain types
 */

export interface Parent {
  id: string;
  userId: string;
  tenantId: string;
  occupation?: string;
  workplace?: string;
  relation: string;
  children: string[];
  isPrimaryContact: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentStudentLink {
  id: string;
  parentId: string;
  studentId: string;
  relation: ParentRelation;
  canPickup: boolean;
  isEmergencyContact: boolean;
}

export enum ParentRelation {
  FATHER = "FATHER",
  MOTHER = "MOTHER",
  GUARDIAN = "GUARDIAN",
  SIBLING = "SIBLING",
  OTHER = "OTHER",
}
