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
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification as apiDeleteNotification } from "@/services/apiClient";
import { useSocket } from "@/hooks/useSocket";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function playNotificationSound() {
  try {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {
      // ignore autoplay errors
    });
  } catch {
    // ignore audio errors
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket, isConnected } = useSocket();
  const [soundEnabled, setSoundEnabled] = useLocalStorage("acadivo-notification-sounds", true);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // silently fail on refresh — polling or socket will catch up
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Real-time notifications via socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (soundEnabled) {
        playNotificationSound();
      }
    };

    const handleNotificationRead = (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    };

    const handleAllNotificationsRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleNotificationDeleted = (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:read", handleNotificationRead);
    socket.on("notification:readAll", handleAllNotificationsRead);
    socket.on("notification:deleted", handleNotificationDeleted);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:read", handleNotificationRead);
      socket.off("notification:readAll", handleAllNotificationsRead);
      socket.off("notification:deleted", handleNotificationDeleted);
    };
  }, [socket, isConnected, soundEnabled]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch {
      // revert on error
      refresh();
    }
  }, [refresh]);

  const markAllAsReadCallback = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  const deleteNotificationCallback = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiDeleteNotification(id);
    } catch {
      refresh();
    }
  }, [refresh]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead: markAllAsReadCallback,
      deleteNotification: deleteNotificationCallback,
      refresh,
      isLoading,
      soundEnabled,
      setSoundEnabled,
    }),
    [notifications, unreadCount, markAsRead, markAllAsReadCallback, deleteNotificationCallback, refresh, isLoading, soundEnabled, setSoundEnabled]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
