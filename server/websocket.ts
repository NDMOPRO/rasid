import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse as parseCookie } from "cookie";
import jwt from "jsonwebtoken";

interface WSClient {
  ws: WebSocket;
  userId: number;
  userName: string;
  role: string;
}

let wss: WebSocketServer | null = null;
const clients = new Map<string, WSClient>();

export function initWebSocket(server: HttpServer) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: any) => {
    // Try to authenticate from cookie
    let userId = 0;
    let userName = "anonymous";
    let role = "user";

    try {
      const cookies = parseCookie(req.headers.cookie || "");
      const token = cookies["session"];
      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        userId = decoded.id || decoded.userId || 0;
        userName = decoded.name || decoded.username || "user";
        role = decoded.role || "user";
      }
    } catch (e) {
      // Allow anonymous connections but they won't receive user-specific notifications
    }

    const clientId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    clients.set(clientId, { ws, userId, userName, role });

    // Send welcome message
    ws.send(JSON.stringify({
      type: "connected",
      data: { clientId, userId, message: "متصل بنظام التنبيهات الفورية" },
    }));

    // Handle ping/pong for keepalive
    ws.on("pong", () => {
      // Client is alive
    });

    ws.on("message", (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (e) {
        // Ignore invalid messages
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
    });

    ws.on("error", () => {
      clients.delete(clientId);
    });
  });

  // Keepalive interval
  const keepAlive = setInterval(() => {
    if (wss) {
      wss.clients.forEach((ws: WebSocket) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }
  }, 30000);

  wss.on("close", () => {
    clearInterval(keepAlive);
  });

  console.log("[WebSocket] Notification server initialized on /ws");
  return wss;
}

// Broadcast to all connected clients
export function broadcastNotification(notification: {
  type: string;
  title: string;
  message: string;
  data?: any;
  targetRoles?: string[];
  targetUserIds?: number[];
}) {
  if (!wss) return;

  const payload = JSON.stringify({
    type: "notification",
    data: {
      id: Date.now(),
      notificationType: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      timestamp: new Date().toISOString(),
    },
  });

  clients.forEach((client) => {
    if (client.ws.readyState !== WebSocket.OPEN) return;

    // Filter by target roles if specified
    if (notification.targetRoles && notification.targetRoles.length > 0) {
      if (!notification.targetRoles.includes(client.role)) return;
    }

    // Filter by target user IDs if specified
    if (notification.targetUserIds && notification.targetUserIds.length > 0) {
      if (!notification.targetUserIds.includes(client.userId)) return;
    }

    client.ws.send(payload);
  });
}

// Notify on scan completion
export function notifyScanComplete(data: {
  siteId: number;
  domain: string;
  complianceStatus: string;
  overallScore: number;
  scanId: number;
}) {
  broadcastNotification({
    type: "scan_complete",
    title: "اكتمل الفحص",
    message: `تم فحص ${data.domain} - الحالة: ${getStatusArabic(data.complianceStatus)} (${data.overallScore}%)`,
    data,
  });
}

// Notify on compliance status change
export function notifyComplianceChange(data: {
  siteId: number;
  domain: string;
  previousStatus: string;
  newStatus: string;
  previousScore: number;
  newScore: number;
}) {
  broadcastNotification({
    type: "compliance_change",
    title: "تغيّر حالة الامتثال",
    message: `${data.domain}: تغيّرت من ${getStatusArabic(data.previousStatus)} إلى ${getStatusArabic(data.newStatus)}`,
    data,
  });
}

// Notify on case escalation
export function notifyCaseEscalation(data: {
  caseId: number;
  caseNumber: string;
  previousStage: string;
  newStage: string;
  hoursOverdue: number;
}) {
  broadcastNotification({
    type: "case_escalation",
    title: "تصعيد حالة",
    message: `الحالة ${data.caseNumber} تم تصعيدها بعد تأخر ${Math.round(data.hoursOverdue)} ساعة`,
    data,
    targetRoles: ["admin", "root"],
  });
}

// Notify on scheduled scan completion
export function notifyScheduledScanComplete(data: {
  scheduleName: string;
  totalSites: number;
  completedSites: number;
  failedSites: number;
  duration: string;
}) {
  broadcastNotification({
    type: "scheduled_scan_complete",
    title: "اكتمل الفحص الدوري",
    message: `${data.scheduleName}: ${data.completedSites}/${data.totalSites} موقع (${data.duration})`,
    data,
    targetRoles: ["admin", "root", "smart_monitor_manager"],
  });
}

// Get connected clients count
export function getConnectedClientsCount(): number {
  return clients.size;
}

function getStatusArabic(status: string): string {
  const map: Record<string, string> = {
    compliant: "ممتثل",
    partially_compliant: "ممتثل جزئياً",
    non_compliant: "غير ممتثل",
    no_policy: "غير ممتثل",
    not_working: "لا يعمل",
  };
  return map[status] || status;
}
