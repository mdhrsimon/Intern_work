import type { AccountRole } from "./account";

export interface ClassChannel {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  createdAt?: string;
  staffCount?: number;
  studentCount?: number;
}

export interface ClassMember {
  accountId: string;
  fullName: string;
  email: string;
  role: AccountRole;
  roleInClass: "Staff" | "Student";
  assignedAt?: string;
}

export interface ClassWithMembers extends ClassChannel {
  staff: ClassMember[];
  students: ClassMember[];
}

export interface CreateClassRequest {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateClassRequest {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface AssignMemberRequest {
  accountId: string;
  roleInClass: "Staff" | "Student";
}

export interface PaginatedClasses {
  items: ClassChannel[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PolicyCheckRequest {
  userId?: string;
  classId: number;
  action?: "ManageClass" | "ViewClass";
}

export interface PolicyCheckResult {
  isAllowed: boolean;
  reason: string;
  userRole: string;
  roleInClass?: string | null;
  className: string;
}