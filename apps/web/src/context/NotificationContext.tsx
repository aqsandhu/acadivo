"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Notification } from "@/types";
import { mockApi } from "@/services/apiClient";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refresh: () => Promise<void>;
  isLoading: boolean;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await mockApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refresh,
      isLoading,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refresh, isLoading]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
