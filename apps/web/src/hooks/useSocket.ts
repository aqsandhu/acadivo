"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("acadivo-tokens");
    if (!token) return;

    let parsedToken: string | undefined;
    try {
      const tokens = JSON.parse(token);
      parsedToken = tokens.accessToken;
    } catch {
      parsedToken = token;
    }

    socketRef.current = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
      {
        auth: { token: parsedToken },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendMessage = useCallback(
    (receiverId: string, content: string) => {
      socketRef.current?.emit("send_message", { receiverId, content });
    },
    []
  );

  const markAsRead = useCallback(
    (messageId: string) => {
      socketRef.current?.emit("mark_read", { messageId });
    },
    []
  );

  const joinRoom = useCallback(
    (roomId: string) => {
      socketRef.current?.emit("join_room", { roomId });
    },
    []
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      socketRef.current?.emit("leave_room", { roomId });
    },
    []
  );

  return {
    socket: socketRef.current,
    sendMessage,
    markAsRead,
    joinRoom,
    leaveRoom,
  };
}
