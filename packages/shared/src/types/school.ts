/**
 * School domain types
 */

export interface School {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  tenantId: string;
  status: SchoolStatus;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export enum SchoolStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export enum SubscriptionTier {
  FREE = "FREE",
  BASIC = "BASIC",
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
}

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
