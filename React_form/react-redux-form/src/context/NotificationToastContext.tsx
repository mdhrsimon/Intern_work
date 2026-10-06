import React, { createContext, useContext, useState, useCallback } from "react";
import { X, Bell, BookOpen, CheckCircle, Clock, UserPlus, UserCheck } from "lucide-react";
import type { NotificationItem } from "../types/notification";

interface ToastItem {
  id: string;
  notification: NotificationItem;
  onClick?: () => void;
}

interface NotificationToastContextType {
  showNotificationToast: (notification: NotificationItem, onClick?: () => void) => void;
  dismissToast: (id: string) => void;
}

const NotificationToastContext = createContext<NotificationToastContextType | undefined>(undefined);

export const NotificationToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showNotificationToast = useCallback(
    (notification: NotificationItem, onClick?: () => void) => {
      const id = `${notification.id}-${Date.now()}`;
      const newToast: ToastItem = { id, notification, onClick };

      setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep at most 4 toasts visible

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        dismissToast(id);
      }, 6000);
    },
    [dismissToast]
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "AssignmentPosted":
      case "AssignmentUpdated":
        return <BookOpen className="h-5 w-5 text-blue-500 shrink-0" />;
      case "AssignmentSubmitted":
      case "AssignmentResubmitted":
        return <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "AssignmentReturned":
        return <CheckCircle className="h-5 w-5 text-purple-500 shrink-0" />;
      case "DueDateReminder":
        return <Clock className="h-5 w-5 text-amber-500 shrink-0" />;
      case "ClassEnrollmentAdded":
      case "ClassEnrollmentRemoved":
        return <UserCheck className="h-5 w-5 text-indigo-500 shrink-0" />;
      case "UserRegistered":
      case "UserStatusChanged":
        return <UserPlus className="h-5 w-5 text-teal-500 shrink-0" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <NotificationToastContext.Provider value={{ showNotificationToast, dismissToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none sm:bottom-6 sm:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl transition-all animate-in slide-in-from-bottom-5 duration-200"
          >
            <div className="mt-0.5 rounded-lg bg-slate-50 p-1.5 ring-1 ring-slate-100">
              {getIcon(toast.notification.type)}
            </div>
            <div
              className={`flex-1 min-w-0 ${toast.onClick ? "cursor-pointer" : ""}`}
              onClick={() => {
                if (toast.onClick) {
                  toast.onClick();
                  dismissToast(toast.id);
                }
              }}
            >
              <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                {toast.notification.title}
              </h4>
              <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                {toast.notification.message}
              </p>
              <span className="mt-1 block text-[10px] text-slate-400">Just now</span>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationToastContext.Provider>
  );
};

export const useNotificationToast = () => {
  const context = useContext(NotificationToastContext);
  if (!context) {
    throw new Error("useNotificationToast must be used within a NotificationToastProvider");
  }
  return context;
};
