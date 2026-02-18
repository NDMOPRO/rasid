/**
 * useWebSocket — React hook for real-time WebSocket notifications
 * Connects to the socket.io server and provides notification events
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface WsNotification {
  id?: number;
  type: string;
  title: string;
  titleAr: string;
  message?: string;
  messageAr?: string;
  severity: string;
  relatedId?: string;
  createdAt?: string;
}

export interface WsJobUpdate {
  jobId: string;
  status: string;
  lastResult?: string;
  leaksFound?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastNotification: WsNotification | null;
  lastJobUpdate: WsJobUpdate | null;
  notifications: WsNotification[];
  clearNotifications: () => void;
}

export function useWebSocket(userId?: number): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<WsNotification | null>(null);
  const [lastJobUpdate, setLastJobUpdate] = useState<WsJobUpdate | null>(null);
  const [notifications, setNotifications] = useState<WsNotification[]>([]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io({
      path: "/api/ws",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("[WS] Connected");

      // Join user room if authenticated
      if (userId) {
        socket.emit("join", userId);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("[WS] Disconnected");
    });

    socket.on("notification", (notif: WsNotification) => {
      setLastNotification(notif);
      setNotifications((prev) => [notif, ...prev].slice(0, 100));
    });

    socket.on("job_update", (update: WsJobUpdate) => {
      setLastJobUpdate(update);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return {
    isConnected,
    lastNotification,
    lastJobUpdate,
    notifications,
    clearNotifications,
  };
}
