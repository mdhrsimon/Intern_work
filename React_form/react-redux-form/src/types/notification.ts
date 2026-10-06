export type NotificationType =
  | "AssignmentPosted"
  | "AssignmentUpdated"
  | "AssignmentReturned"
  | "DueDateReminder"
  | "AssignmentSubmitted"
  | "AssignmentResubmitted"
  | "ClassEnrollmentAdded"
  | "ClassEnrollmentRemoved"
  | "UserRegistered"
  | "UserStatusChanged"
  | "ClassCreated"
  | "ClassDeleted";

export interface NotificationItem {
  id: number;
  recipientId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  classId: number | null;
  assignmentId: number | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface PagedNotifications {
  items: NotificationItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
