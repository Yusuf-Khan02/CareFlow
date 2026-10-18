import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useTenant } from "./TenantContext";
import { useToast } from "../components/common";
import { playHospitalChime } from "../utils/audioChime";
import type { RealtimeEventItem } from "../types";

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "reconnecting";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  latency: number;
  liveEvents: RealtimeEventItem[];
  clearEvents: () => void;
  emitEvent: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const getSocketServerUrl = (): string => {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("careflow_custom_api_url");
    if (custom) {
      return custom.trim().replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
    }
  }
  return (
    import.meta.env.VITE_SOCKET_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port === "5173"
      ? "http://localhost:5000"
      : "/")
  );
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeOrganization } = useTenant();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [latency, setLatency] = useState<number>(12);
  const [liveEvents, setLiveEvents] = useState<RealtimeEventItem[]>([]);

  const isReconnectingRef = useRef(false);

  // Helper to append a live event to the sliding buffer
  const addLiveEvent = useCallback((type: "queue" | "bed" | "notification" | "job", event: string, summary: string, data?: any) => {
    setLiveEvents((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type,
        event,
        summary,
        timestamp: new Date().toLocaleTimeString(),
        data,
      },
      ...prev.slice(0, 39), // maintain last 40 events
    ]);
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem("careflow_token");
    const tenantId = activeOrganization?.id || localStorage.getItem("careflow_tenant_id") || "org-careflow-central";

    const newSocket = io(getSocketServerUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: {
        token: token || undefined,
        organizationId: tenantId,
      },
    });

    setSocket(newSocket);
    setConnectionStatus("connecting");

    newSocket.on("connect", () => {
      setConnectionStatus("connected");
      console.log(`[Socket.IO Client] Connected to ${getSocketServerUrl()} (ID: ${newSocket.id})`);

      // If this was a reconnection, resynchronize application state!
      if (isReconnectingRef.current) {
        isReconnectingRef.current = false;
        showToast("Real-time connection restored. Resynchronizing live clinic state...", "info");
        // State resynchronization
        queryClient.invalidateQueries();
      }

      // Latency measurement
      const start = Date.now();
      newSocket.emit("ping_latency", () => {
        setLatency(Date.now() - start);
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.warn(`[Socket.IO Client] Disconnected: ${reason}`);
      setConnectionStatus("disconnected");
      isReconnectingRef.current = true;
    });

    newSocket.on("connect_error", (error) => {
      console.warn(`[Socket.IO Client] Connection error: ${error.message}`);
      setConnectionStatus("reconnecting");
    });

    newSocket.on("connection_acknowledged", (data) => {
      console.log("[Socket.IO Client] Server acknowledged connection:", data);
    });

    // ------------------------------------------------------------------------
    // REAL-TIME QUEUE EVENT LISTENERS
    // ------------------------------------------------------------------------
    newSocket.on("queue:token_called", (payload) => {
      const token = payload.data || payload;
      playHospitalChime();
      addLiveEvent("queue", "queue:token_called", `Token ${token.tokenNumber || "called"} announced for ${token.patientName || "patient"}`);
      showToast(`📢 NOW CALLING: Token #${token.tokenNumber} - ${token.patientName || "Patient"}`, "info");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    });

    newSocket.on("queue:token_created", (payload) => {
      const token = payload.data || payload;
      addLiveEvent("queue", "queue:token_created", `New token #${token.tokenNumber} checked in`);
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    });

    newSocket.on("queue:token_completed", (payload) => {
      const token = payload.data || payload;
      addLiveEvent("queue", "queue:token_completed", `Token #${token.tokenNumber} consultation completed`);
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    });

    newSocket.on("queue:token_skipped", (payload) => {
      const token = payload.data || payload;
      addLiveEvent("queue", "queue:token_skipped", `Token #${token.tokenNumber} skipped / no-show`);
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    });

    // ------------------------------------------------------------------------
    // REAL-TIME INPATIENT BED & WARD LISTENERS
    // ------------------------------------------------------------------------
    newSocket.on("bed:admitted", (payload) => {
      const data = payload.data || payload;
      addLiveEvent("bed", "bed:admitted", `Patient admitted to bed ${data.bed?.bedNumber || "bed"}`);
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    });

    newSocket.on("bed:transferred", (payload) => {
      const data = payload.data || payload;
      addLiveEvent("bed", "bed:transferred", `Inpatient transferred to ${data.bed?.bedNumber || "bed"}`);
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    });

    newSocket.on("bed:discharged", () => {
      addLiveEvent("bed", "bed:discharged", "Inpatient discharged; bed marked for cleaning");
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    });

    newSocket.on("bed:status_changed", (payload) => {
      const data = payload.data || payload;
      addLiveEvent("bed", "bed:status_changed", `Bed ${data.bedNumber || ""} updated to ${data.status || ""}`);
      queryClient.invalidateQueries({ queryKey: ["beds"] });
    });

    // ------------------------------------------------------------------------
    // REAL-TIME NOTIFICATIONS
    // ------------------------------------------------------------------------
    newSocket.on("notification:new", (notif) => {
      addLiveEvent("notification", "notification:new", notif.title || "Urgent Clinical Alert", notif);
      showToast(`${notif.title}: ${notif.description}`, notif.type === "urgent" ? "error" : "warning");
    });

    // ------------------------------------------------------------------------
    // REAL-TIME BACKGROUND JOB LISTENERS
    // ------------------------------------------------------------------------
    newSocket.on("job:created", (payload) => {
      const job = payload.job || payload;
      addLiveEvent("job", "job:created", `Job enqueued: ${job.name} (#${job.id?.slice(0, 8)})`);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    });

    newSocket.on("job:progress", (payload) => {
      const job = payload.job || payload;
      addLiveEvent("job", "job:progress", `Job ${job.name} progress: ${job.progress}% (Attempt ${job.attempts})`);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    });

    newSocket.on("job:completed", (payload) => {
      const job = payload.job || payload;
      addLiveEvent("job", "job:completed", `Job ${job.name} (#${job.id?.slice(0, 8)}) completed!`);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    });

    newSocket.on("job:failed", (payload) => {
      const job = payload.job || payload;
      addLiveEvent("job", "job:failed", `Job ${job.name} failed attempt ${job.attempts}: ${job.error}`);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    });

    newSocket.on("job:dead_letter", (payload) => {
      const job = payload.job || payload;
      addLiveEvent("job", "job:dead_letter", `⚠️ JOB MOVED TO DLQ: ${job.name} (#${job.id?.slice(0, 8)})`);
      showToast(`Job ${job.name} permanently failed -> Moved to Dead-Letter Queue`, "error");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [addLiveEvent, queryClient, showToast, activeOrganization?.id]);

  // Switch tenant room when active facility changes
  useEffect(() => {
    if (socket && activeOrganization?.id) {
      socket.emit("switch_tenant", activeOrganization.id);
    }
  }, [socket, activeOrganization?.id]);

  const clearEvents = useCallback(() => {
    setLiveEvents([]);
  }, []);

  const emitEvent = useCallback(
    (event: string, data?: any) => {
      if (socket && connectionStatus === "connected") {
        socket.emit(event, data);
      }
    },
    [socket, connectionStatus]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected: connectionStatus === "connected",
        connectionStatus,
        latency,
        liveEvents,
        clearEvents,
        emitEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
