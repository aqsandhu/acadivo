/**
 * API service for HTTP calls to the main Acadivo API server
 * Keeps separation clean between socket and database operations
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-internal-key": env.API_INTERNAL_KEY,
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    logger.error(`API call failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} — ${error.message}`);
    return Promise.reject(error);
  }
);

export async function saveMessage(payload: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await apiClient.post("/api/v1/messages", payload);
    return data?.data || data || null;
  } catch (error) {
    logger.error("Failed to save message:", error);
    return null;
  }
}

export async function getConversation(userId1: string, userId2: string, page = 1, pageSize = 20): Promise<unknown[]> {
  try {
    const { data } = await apiClient.get(`/api/v1/messages/conversation`, {
      params: { userId1, userId2, page, pageSize },
    });
    return data?.data || [];
  } catch (error) {
    logger.error("Failed to fetch conversation:", error);
    return [];
  }
}

export async function markMessagesRead(messageIds: string[], readerId: string): Promise<boolean> {
  try {
    await apiClient.post("/api/v1/messages/read", { messageIds, readerId });
    return true;
  } catch (error) {
    logger.error("Failed to mark messages as read:", error);
    return false;
  }
}

export async function createNotification(payload: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await apiClient.post("/api/v1/notifications", payload);
    return data?.data || data || null;
  } catch (error) {
    logger.error("Failed to create notification:", error);
    return null;
  }
}

export async function getUnreadNotifications(userId: string): Promise<{ count: number; notifications: unknown[] }> {
  try {
    const { data } = await apiClient.get(`/api/v1/notifications/unread`, {
      params: { userId },
    });
    return {
      count: data?.data?.count || 0,
      notifications: data?.data?.notifications || [],
    };
  } catch (error) {
    logger.error("Failed to fetch unread notifications:", error);
    return { count: 0, notifications: [] };
  }
}

export async function markNotificationsRead(notificationIds: string[], userId: string): Promise<boolean> {
  try {
    await apiClient.post("/api/v1/notifications/read", { notificationIds, userId });
    return true;
  } catch (error) {
    logger.error("Failed to mark notifications as read:", error);
    return false;
  }
}

export async function getDeviceTokens(userId: string): Promise<string[]> {
  try {
    const { data } = await apiClient.get(`/api/v1/users/${userId}/device-tokens`);
    return data?.data?.tokens || [];
  } catch (error) {
    logger.error("Failed to fetch device tokens:", error);
    return [];
  }
}

export async function getDeviceTokensBulk(userIds: string[]): Promise<Record<string, string[]>> {
  try {
    const { data } = await apiClient.post("/api/v1/users/device-tokens", { userIds });
    return data?.data || {};
  } catch (error) {
    logger.error("Failed to fetch bulk device tokens:", error);
    return {};
  }
}

export { apiClient };
