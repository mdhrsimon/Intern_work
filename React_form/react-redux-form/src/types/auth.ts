export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string; // "User" | "Staff" | "Admin"
  expiresAt: string;
}

export interface AuthUser {
  email: string;
  role: string;
  token: string;
}