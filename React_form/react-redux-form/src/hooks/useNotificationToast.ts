import { createContext, useContext } from "react";
import type { NotificationItem } from "../types/notification";

export interface NotificationToastContextType {
  showNotificationToast: (notification: NotificationItem, onClick?: () => void) => void;
  dismissToast: (id: string) => void;
}

export const NotificationToastContext = createContext<NotificationToastContextType | undefined>(undefined);

export const useNotificationToast = () => {
  const context = useContext(NotificationToastContext);
  if (!context) {
    throw new Error("useNotificationToast must be used within a NotificationToastProvider");
  }
  return context;
};
