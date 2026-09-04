import type { AuthUser } from "../types/auth";

const KEY = "reactform_auth";

export function saveAuth(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function loadAuth(): AuthUser | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function getToken(): string | null {
  return loadAuth()?.token ?? null;
}