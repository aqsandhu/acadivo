/**
 * API service for socket server — communicates with REST API
 * Updated with token removal support
 */

import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 5000,
  headers: {
    "x-internal-api-key": env.INTERNAL_API_KEY,
  },
});

export async function getDeviceTokens(userId: string): Promise<string[]> {
  try {
    const response = await apiClient.get(`/users/${userId}/device-tokens`);
    return response.data?.data || [];
  } catch (error) {
    logger.error(`Failed to fetch device tokens for user ${userId}:`, error);
    return [];
  }
}

export async function getDeviceTokensBulk(userIds: string[]): Promise<Record<string, string[]>> {
  try {
    const response = await apiClient.post(`/users/device-tokens/bulk`, { userIds });
    return response.data?.data || {};
  } catch (error) {
    logger.error("Failed to fetch bulk device tokens:", error);
    return {};
  }
}

export async function removeDeviceToken(userId: string, token: string): Promise<void> {
  try {
    await apiClient.delete(`/users/${userId}/device-tokens`, { data: { token } });
    logger.debug(`Removed device token for user ${userId}`);
  } catch (error) {
    logger.error(`Failed to remove device token for user ${userId}:`, error);
  }
}

export async function logAuditEvent(data: {
  userId?: string;
  tenantId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await apiClient.post("/audit", data);
  } catch (error) {
    logger.error("Failed to log audit event:", error);
  }
}
