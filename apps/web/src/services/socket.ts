import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (!socket) {
    const tokens = localStorage.getItem("acadivo-tokens");
    if (!tokens) return null;
    const { accessToken } = JSON.parse(tokens);
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if notification sounds are enabled in localStorage.
 * Returns true by default if no setting is stored.
 */
export function isNotificationSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem("acadivo-notification-sounds");
    return raw ? JSON.parse(raw) : true;
  } catch {
    return true;
  }
}

/**
 * Play a notification sound if sounds are enabled.
 * Falls back silently on autoplay errors or missing audio file.
 */
export function playSocketNotificationSound() {
  if (!isNotificationSoundEnabled()) return;
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
