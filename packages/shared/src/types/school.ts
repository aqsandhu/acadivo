/**
 * School / Tenant domain types
 * Aligned with Prisma Tenant model
 */

export interface Tenant {
  id: string;
  name: string;
  code: string; // unique code, formerly slug
  type: TenantType;
  city: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  status: TenantStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry?: Date;
  maxTeachers: number;
  maxStudents: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Backward compatibility alias
export type School = Tenant;

export enum TenantType {
  SCHOOL = "SCHOOL",
  COLLEGE = "COLLEGE",
  UNIVERSITY = "UNIVERSITY",
}

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export enum SubscriptionPlan {
  FREE = "FREE",
  BASIC = "BASIC",
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
}

// Backward compatibility aliases
export const SchoolStatus = TenantStatus;
export type SchoolStatus = TenantStatus;
export const SubscriptionTier = SubscriptionPlan;
export type SubscriptionTier = SubscriptionPlan;

export interface SchoolSettings {
  schoolId: string;
  timezone: string;
  currency: string;
  language: string;
  academicYearStart: Date;
  academicYearEnd: Date;
  gradingSystem: string;
  attendanceMethod: "MANUAL" | "BIOMETRIC" | "QR" | "APP";
}

export interface SchoolSubscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SchoolSubscriptionStatus;
  startDate: Date;
  endDate: Date;
  amountPaid?: number;
  paymentMethod?: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum SchoolSubscriptionStatus {
  ACTIVE = "ACTIVE",
  TRIAL = "TRIAL",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}
