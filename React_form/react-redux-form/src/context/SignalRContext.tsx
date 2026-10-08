import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../api/notificationApi";
import { useNotificationToast } from "./NotificationToastContext";
import type { NotificationItem } from "../types/notification";
import { ROLES } from "../constants/roles";

interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
});

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showNotificationToast } = useNotificationToast();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const connectionRef = useRef<HubConnection | null>(null);
  const isStartingRef = useRef<boolean>(false);

  // Helper to navigate when a notification is clicked
  const handleNotificationClick = useCallback(
    async (item: NotificationItem) => {
      // Mark read
      if (!item.isRead) {
        try {
          await dispatch(notificationApi.endpoints.markAsRead.initiate(item.id)).unwrap();
        } catch {
          // Handled silently
        }
      }

      const role = user?.role;

      if (role === ROLES.ADMIN) {
        if (item.type === "UserRegistered" || item.type === "UserStatusChanged") {
          navigate("/admin?tab=accounts");
        } else if (item.classId) {
          navigate(`/admin?classId=${item.classId}`);
        } else {
          navigate("/admin");
        }
      } else if (role === ROLES.STAFF) {
        if (item.classId) {
          navigate(`/staff?classId=${item.classId}${item.assignmentId ? `&assignmentId=${item.assignmentId}` : ""}`);
        } else {
          navigate("/staff");
        }
      } else {
        // Student
        if (item.classId) {
          navigate(`/student?classId=${item.classId}${item.assignmentId ? `&assignmentId=${item.assignmentId}` : ""}`);
        } else {
          navigate("/student");
        }
      }
    },
    [dispatch, navigate, user?.role]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
        setConnection(null);
        setIsConnected(false);
      }
      return;
    }

    if (connectionRef.current || isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;

    const hubUrl = "http://localhost:5070/hubs/notifications";
    const hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    hubConnection.on("ReceiveNotification", (notification: NotificationItem) => {
      // 1. Prepend item to cache and increment unread count
      dispatch(
        notificationApi.util.updateQueryData(
          "getNotifications",
          { page: 1, pageSize: 20, unreadOnly: false },
          (draft) => {
            // Avoid duplicates
            if (!draft.items.some((i) => i.id === notification.id)) {
              draft.items.unshift(notification);
              draft.totalCount += 1;
              draft.unreadCount += 1;
            }
          }
        )
      );

      dispatch(
        notificationApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
          draft.unreadCount += 1;
        })
      );

      // Invalidate tags so any active subscriber queries (like the Bell popover or /notifications page) update immediately
      dispatch(
        notificationApi.util.invalidateTags([
          { type: "Notifications", id: "LIST" },
          { type: "UnreadCount", id: "COUNT" },
        ])
      );

      // 2. Show a short toast
      showNotificationToast(notification, () => handleNotificationClick(notification));
    });

    hubConnection.onreconnecting((error) => {
      setIsConnected(false);
      console.warn("SignalR: Connection lost. Reconnecting...", error);
    });

    hubConnection.onreconnected((connectionId) => {
      setIsConnected(true);
      console.info("SignalR: Reconnected with connectionId:", connectionId);
      // Refetch notifications after reconnecting
      dispatch(
        notificationApi.util.invalidateTags([
          { type: "Notifications", id: "LIST" },
          { type: "UnreadCount", id: "COUNT" },
        ])
      );
    });

    hubConnection.onclose((error) => {
      setIsConnected(false);
      console.warn("SignalR: Connection closed.", error);
    });

    hubConnection
      .start()
      .then(() => {
        setIsConnected(true);
        connectionRef.current = hubConnection;
        setConnection(hubConnection);
      })
      .catch((err) => {
        console.error("SignalR: Failed to connect to notification hub:", err);
      })
      .finally(() => {
        isStartingRef.current = false;
      });

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
        setConnection(null);
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, dispatch, showNotificationToast, handleNotificationClick]);

  return (
    <SignalRContext.Provider value={{ connection, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);
