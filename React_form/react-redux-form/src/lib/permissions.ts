import { loadAuth } from "./authStorage";

export type Role = "Admin" | "Staff" | "Student" | null;

export const DASHBOARD_PATH = {
  Admin: "/admin",
  Staff: "/staff",
  Student: "/student",
} as const;

export function getRole(): Role {
  const auth = loadAuth();
  if (!auth?.role) return null;
  return parseRole(auth.role);
}

export function isLoggedIn() {
  return !!loadAuth()?.email && !!getRole();
}

export function canAccessList(role: Role = getRole()) {
  return role === "Staff" || role === "Admin";
}

export function canEdit(role: Role = getRole()) {
  return role === "Staff" || role === "Admin";
}

export function canDelete(role: Role = getRole()) {
  return role === "Admin";
}

export function homePathForRole(role: Role = getRole()) {
  if (role === "Admin") return DASHBOARD_PATH.Admin;
  if (role === "Staff") return DASHBOARD_PATH.Staff;
  if (role === "Student") return DASHBOARD_PATH.Student;
  return "/";
}

export function parseRole(value: string | undefined | null): Role {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized.toLowerCase() === "admin") return "Admin";
  if (normalized.toLowerCase() === "staff" || normalized.toLowerCase() === "teacher") return "Staff";
  if (normalized.toLowerCase() === "student" || normalized.toLowerCase() === "user") return "Student";
  return null;
}