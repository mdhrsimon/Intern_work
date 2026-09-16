import type { AuthUser } from "../types/auth";

const KEY = "reactform_auth";

export function saveAuth(user: AuthUser) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    })
  );
}

export function loadAuth(): AuthUser | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email || !parsed?.role) return null;
    return {
      email: parsed.email,
      fullName: parsed.fullName,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

