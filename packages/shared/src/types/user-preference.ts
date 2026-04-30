/**
 * User Preference domain types
 */

export interface UserPreference {
  id: string;
  tenantId: string;
  userId: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
