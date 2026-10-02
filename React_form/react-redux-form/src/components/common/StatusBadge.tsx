import React from "react";
import { CheckCircle2, Clock, Award, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status?: string | null;
  isActive?: boolean;
  type?: "assignment" | "account";
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isActive,
  type = "assignment",
  className = "",
  showIcon = true,
}) => {
  if (type === "account" || isActive !== undefined) {
    const active = isActive ?? (status?.toLowerCase() === "active");
    if (active) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 ${className}`}
        >
          {showIcon && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          Active
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200 ${className}`}
      >
        {showIcon && <XCircle className="h-3 w-3 text-slate-400" />}
        Inactive
      </span>
    );
  }

  // Assignment status
  const normalized = status?.toLowerCase() || "assigned";

  if (normalized === "returned") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 ${className}`}
      >
        {showIcon && <Award className="h-3 w-3" />}
        Returned
      </span>
    );
  }

  if (normalized === "turned in") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-800 ${className}`}
      >
        {showIcon && <CheckCircle2 className="h-3 w-3" />}
        Turned In
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 ${className}`}
    >
      {showIcon && <Clock className="h-3 w-3" />}
      Assigned
    </span>
  );
};
