/**
 * Ad Impression domain types
 */

export interface AdImpression {
  id: string;
  adId: string;
  userId: string;
  tenantId: string;
  studentId?: string;
  impressionType: AdImpressionType;
  createdAt: Date;
  updatedAt: Date;
}

export enum AdImpressionType {
  VIEW = "VIEW",
  CLICK = "CLICK",
}
