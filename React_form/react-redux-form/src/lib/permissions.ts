import { loadAuth } from "./authStorage";
import type { Role } from "../types/auth";
import { ROLES } from "../constants/roles";

export type { Role };

export const DASHBOARD_PATH = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.STAFF]: "/staff",
  [ROLES.STUDENT]: "/student",
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
  return role === ROLES.STAFF || role === ROLES.ADMIN;
}

export function canEdit(role: Role = getRole()) {
  return role === ROLES.STAFF || role === ROLES.ADMIN;
}

export function canDelete(role: Role = getRole()) {
  return role === ROLES.ADMIN;
}

export function homePathForRole(role: Role = getRole()) {
  if (role === ROLES.ADMIN) return DASHBOARD_PATH[ROLES.ADMIN];
  if (role === ROLES.STAFF) return DASHBOARD_PATH[ROLES.STAFF];
  if (role === ROLES.STUDENT) return DASHBOARD_PATH[ROLES.STUDENT];
  return "/";
}

export function parseRole(value: string | undefined | null): Role {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized.toLowerCase() === "admin") return ROLES.ADMIN;
  if (normalized.toLowerCase() === "staff" || normalized.toLowerCase() === "teacher") return ROLES.STAFF;
  if (normalized.toLowerCase() === "student" || normalized.toLowerCase() === "user") return ROLES.STUDENT;
  return null;
}
