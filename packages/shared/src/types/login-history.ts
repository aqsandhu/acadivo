/**
 * Login History domain types
 */

export interface LoginHistory {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  location?: string;
  status: LoginStatus;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum LoginStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}
