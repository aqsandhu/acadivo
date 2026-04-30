/**
 * User domain types
 */

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
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
  language?: string;
  darkMode?: boolean;
  soundEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  school?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
}
