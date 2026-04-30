/**
 * Setting domain types
 */

export interface Setting {
  id: string;
  tenantId: string;
  key: string;
  value: string;
  category: SettingCategory;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum SettingCategory {
  GENERAL = "GENERAL",
  ACADEMIC = "ACADEMIC",
  FEE = "FEE",
  COMMUNICATION = "COMMUNICATION",
  NOTIFICATION = "NOTIFICATION",
}
