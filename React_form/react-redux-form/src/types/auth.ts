export type Role = "Admin" | "Staff" | "Student" | "User" | null;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  role?: string;
}

export interface AuthResponse {
  email: string;
  fullName?: string;
  role: string;
  expiresAt: string;
}

export interface AuthUser {
  email: string;
  fullName?: string;
  role: "Admin" | "Staff" | "Student";
}