import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Check,
  BookOpen,
  CheckCircle2,
  Clock,
  UserCheck,
  UserPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../api/notificationApi";
import { useAuthSession } from "../lib/useAuthSession";
import { formatRelativeTime } from "../utils/notificationHelpers";
import { useNotificationToast } from "../context/NotificationToastContext";
import type { NotificationItem } from "../types/notification";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { role } = useAuthSession();
  const { showNotificationToast } = useNotificationToast();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.unreadCount ?? 0;

  const {
    data: notificationsData,
    isLoading,
    isFetching,
  } = useGetNotificationsQuery({
    page: currentPage,
    pageSize,
    unreadOnly: activeTab === "unread",
  });

  const [markAsRead, { isLoading: isMarkingSingle }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const items = notificationsData?.items ?? [];
  const totalPages = notificationsData?.totalPages ?? 1;

  const getRoleHeaderStyle = () => {
    switch (role) {
      case "Admin":
        return {
          banner: "bg-purple-900 border-purple-800 text-white",
          tag: "bg-purple-800 text-purple-200 border-purple-700",
          accentBtn: "bg-white text-purple-950 hover:bg-purple-50",
        };
      case "Staff":
        return {
          banner: "bg-blue-900 border-blue-800 text-white",
          tag: "bg-blue-800 text-blue-200 border-blue-700",
          accentBtn: "bg-white text-blue-950 hover:bg-blue-50",
        };
      default:
        return {
          banner: "bg-emerald-900 border-emerald-800 text-white",
          tag: "bg-emerald-800 text-emerald-200 border-emerald-700",
          accentBtn: "bg-white text-emerald-950 hover:bg-emerald-50",
        };
    }
  };

  const styles = getRoleHeaderStyle();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "AssignmentPosted":
      case "AssignmentUpdated":
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case "AssignmentSubmitted":
      case "AssignmentResubmitted":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case "AssignmentReturned":
        return <CheckCircle2 className="h-5 w-5 text-purple-600" />;
      case "DueDateReminder":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "ClassEnrollmentAdded":
      case "ClassEnrollmentRemoved":
        return <UserCheck className="h-5 w-5 text-indigo-600" />;
      case "UserRegistered":
      case "UserStatusChanged":
        return <UserPlus className="h-5 w-5 text-teal-600" />;
      case "ClassDeleted":
        return <Trash2 className="h-5 w-5 text-rose-600" />;
      default:
        return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markAsRead(item.id).unwrap();
      } catch {
        // Silently continue
      }
    }

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

  const handleMarkAsReadClick = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch {
      // Handled silently
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Banner */}
        <div className={`rounded-2xl border p-6 sm:p-8 shadow-md ${styles.banner}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${styles.tag}`}
              >
                <Bell className="h-3.5 w-3.5" />
                Notification Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Your Notifications
              </h1>
              <p className="text-slate-200 text-sm max-w-xl">
                Stay updated on class assignments, grades, enrollments, and system updates.
              </p>
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className={`font-semibold shadow-xs gap-2 shrink-0 ${styles.accentBtn}`}
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              All Notifications
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("unread");
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "unread"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    activeTab === "unread"
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden sm:inline">
            Showing page {currentPage} of {totalPages}
          </span>
        </div>

        {/* List of Notifications */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
          {isLoading || isFetching ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3.5 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                {activeTab === "unread"
                  ? "You're all caught up"
                  : "No notifications found"}
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                {activeTab === "unread"
                  ? "You have marked all notifications as read."
                  : "You don't have any notifications right now."}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleItemClick(item);
                  }
                }}
                className={`group flex items-start justify-between gap-4 p-4 sm:p-5 transition-colors cursor-pointer hover:bg-slate-50/80 focus:bg-slate-50/80 focus:outline-none ${
                  !item.isRead ? "bg-blue-50/30" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="mt-0.5 rounded-xl bg-slate-100 p-2.5 shrink-0 ring-1 ring-slate-200/50">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          !item.isRead ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.isRead && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={(e) => handleMarkAsReadClick(e, item.id)}
                      disabled={isMarkingSingle}
                      className="text-xs gap-1 border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-300"
                      aria-label="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Mark read</span>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isFetching}
              className="gap-1 border-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-xs font-medium text-slate-600">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isFetching}
              className="gap-1 border-slate-200"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
