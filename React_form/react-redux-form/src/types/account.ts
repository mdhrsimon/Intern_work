export type AccountRole = "Admin" | "Staff" | "Student";

export interface AssignedClassSummary {
  classId: number;
  className: string;
  code?: string;
  roleInClass: "Staff" | "Student";
  joinedAt: string;
}

export interface AccountUser {
  id: string;
  email: string;
  fullName: string;
  role: AccountRole;
  isActive: boolean;
  createdAt?: string;
  assignedClasses?: AssignedClassSummary[];
}

export interface PaginatedAccounts {
  items: AccountUser[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CreateAccountRequest {
  email: string;
  password: string;
  fullName: string;
  role: AccountRole;
}

export interface UpdateAccountRequest {
  id: string;
  email?: string;
  fullName?: string;
  role?: AccountRole;
  isActive?: boolean;
  password?: string;
}

export interface ChangeRoleRequest {
  id: string;
  role: AccountRole;
}