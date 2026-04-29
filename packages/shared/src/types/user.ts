/**
 * User domain types
 */

export enum UserRole {
  ADMIN = "ADMIN",
  PRINCIPAL = "PRINCIPAL",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  school?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
}
