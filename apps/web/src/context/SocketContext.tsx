"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  connect: () => void;
  disconnect: () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const connect = useCallback(() => {
    if (socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      setOnlineUsers([]);
    });

    newSocket.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on("connect_error", () => {
      setIsConnected(false);
    });

    setSocket(newSocket);
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
    }
  }, [socket]);

  // Auto-connect when auth token exists
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tokens = localStorage.getItem("acadivo-tokens");
    if (tokens) {
      connect();
    }
    return () => {
      socket?.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      onlineUsers,
      connect,
      disconnect,
    }),
    [socket, isConnected, onlineUsers, connect, disconnect]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
