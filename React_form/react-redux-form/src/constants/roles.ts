export const ROLES = {
  ADMIN: "Admin",
  STAFF: "Staff",
  STUDENT: "Student",
} as const;

export const ROLE_ADMIN = ROLES.ADMIN;
export const ROLE_STAFF = ROLES.STAFF;
export const ROLE_STUDENT = ROLES.STUDENT;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];
