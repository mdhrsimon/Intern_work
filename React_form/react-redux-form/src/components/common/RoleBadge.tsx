import React from "react";
import { Shield, BookOpen, GraduationCap } from "lucide-react";

interface RoleBadgeProps {
  role?: string | null;
  className?: string;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  className = "",
  showIcon = true,
}) => {
  const normalized = role?.toLowerCase() || "student";

  if (normalized === "admin") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200 ${className}`}
      >
        {showIcon && <Shield className="h-3 w-3" />}
        Admin
      </span>
    );
  }

  if (normalized === "staff" || normalized === "teacher") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 ${className}`}
      >
        {showIcon && <BookOpen className="h-3 w-3" />}
        Staff
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 ${className}`}
    >
      {showIcon && <GraduationCap className="h-3 w-3" />}
      Student
    </span>
  );
};
