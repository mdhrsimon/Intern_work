import { loadAuth } from "./authStorage";

export type Role = "User" | "Staff" | "Admin" | null;

export function getRole(): Role {
  const auth = loadAuth();
  if (!auth?.role) return null;
  if (
    auth.role === "Admin" ||
    auth.role === "Staff" ||
    auth.role === "User"
  ) {
    return auth.role;
  }
  return null;
}

export function isLoggedIn() {
  return !!loadAuth()?.token;
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
  if (role === "Staff" || role === "Admin") return "/";
  if (role === "User") return "/my-submission";
  return "/login";
}