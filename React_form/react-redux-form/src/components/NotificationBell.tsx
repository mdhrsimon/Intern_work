import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  UserCheck,
  UserPlus,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../api/notificationApi";
import { useAuthSession } from "../lib/useAuthSession";
import { Skeleton } from "./ui/skeleton";
import { formatRelativeTime } from "../utils/notificationHelpers";
import { useNotificationToast } from "../context/NotificationToastContext";
import type { NotificationItem } from "../types/notification";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { role } = useAuthSession();
  const { showNotificationToast } = useNotificationToast();

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });

  const {
    data: notificationsData,
    isLoading: isLoadingList,
  } = useGetNotificationsQuery(
    { page: 1, pageSize: 10, unreadOnly: false },
    { skip: !open }
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const unreadCount = unreadData?.unreadCount ?? 0;
  const items = notificationsData?.items ?? [];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "AssignmentPosted":
      case "AssignmentUpdated":
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case "AssignmentSubmitted":
      case "AssignmentResubmitted":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "AssignmentReturned":
        return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
      case "DueDateReminder":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "ClassEnrollmentAdded":
      case "ClassEnrollmentRemoved":
        return <UserCheck className="h-4 w-4 text-indigo-600" />;
      case "UserRegistered":
      case "UserStatusChanged":
        return <UserPlus className="h-4 w-4 text-teal-600" />;
      case "ClassDeleted":
        return <Trash2 className="h-4 w-4 text-rose-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-600" />;
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markAsRead(item.id).unwrap();
      } catch {
        // Silently continue navigation
      }
    }

    setOpen(false);

    if (item.type === "ClassDeleted") {
      showNotificationToast({
        ...item,
        id: -1,
        title: "Target Unavailable",
        message: "This class was deleted and is no longer available.",
      });
      return;
    }

    if (role === "Admin") {
      if (item.type === "UserRegistered" || item.type === "UserStatusChanged") {
        navigate("/admin?tab=accounts");
      } else if (item.classId) {
        navigate(`/admin?classId=${item.classId}`);
      } else {
        navigate("/admin");
      }
    } else if (role === "Staff") {
      if (item.classId) {
        navigate(
          `/staff?classId=${item.classId}${
            item.assignmentId ? `&assignmentId=${item.assignmentId}` : ""
          }`
        );
      } else {
        navigate("/staff");
      }
    } else {
      if (item.classId) {
        navigate(
          `/student?classId=${item.classId}${
            item.assignmentId ? `&assignmentId=${item.assignmentId}` : ""
          }`
        );
      } else {
        navigate("/student");
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    try {
      await markAllAsRead().unwrap();
    } catch {
      // Handled silently
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        id="notification-bell-btn"
        data-testid="notification-bell"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
        title="Notifications"
      >
        <Bell className="h-4.5 w-4.5 text-slate-700" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow-xs ring-2 ring-white animate-in zoom-in-50 duration-150"
            aria-hidden="true"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Notifications Dropdown"
          className="absolute right-0 top-full mt-2 z-50 w-[360px] sm:w-[400px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {isLoadingList ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="font-medium text-slate-800 text-sm">You&apos;re all caught up</p>
                <p className="text-xs text-slate-500 mt-1">
                  No new notifications right now.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none cursor-pointer ${
                    !item.isRead ? "bg-blue-50/40" : "bg-white"
                  }`}
                >
                  <div className="mt-0.5 rounded-lg bg-slate-100 p-2 shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-semibold truncate ${
                          !item.isRead ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {!item.isRead && (
                    <span
                      className="mt-1.5 h-2 w-2 rounded-full bg-blue-600 shrink-0"
                      aria-label="Unread"
                    />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <span>View all notifications</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
