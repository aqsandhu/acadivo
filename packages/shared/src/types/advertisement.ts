/**
 * Advertisement / Promotion domain types
 */

export interface Advertisement {
  id: string;
  tenantId?: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  placement: AdPlacement;
  targetAudience: UserRole[];
  startDate: Date;
  endDate: Date;
  priority: number;
  clickCount: number;
  impressionCount: number;
  status: AdStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AdPlacement {
  DASHBOARD = "DASHBOARD",
  LOGIN = "LOGIN",
  SIDEBAR = "SIDEBAR",
  BANNER = "BANNER",
  POPUP = "POPUP",
}

export enum AdStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  EXPIRED = "EXPIRED",
  ARCHIVED = "ARCHIVED",
}

export interface AdClick {
  id: string;
  adId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  clickedAt: Date;
}
