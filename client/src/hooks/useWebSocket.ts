import { useEffect, useRef, useState, useCallback } from "react";

export interface WSNotification {
  id: number;
  notificationType: string;
  title: string;
  message: string;
  data: any;
  timestamp: string;
  read?: boolean;
}

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<WSNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnected(true);
        console.log("[WS] Connected to notification server");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "notification") {
            const notif: WSNotification = { ...msg.data, read: false };
            setNotifications((prev) => [notif, ...prev].slice(0, 50));
            setUnreadCount((prev) => prev + 1);
          }
        } catch (e) {
          // Ignore invalid messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 5 seconds
        reconnectTimer.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      // Connection failed, retry
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [connect]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const markRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    connected,
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    clearAll,
  };
}
