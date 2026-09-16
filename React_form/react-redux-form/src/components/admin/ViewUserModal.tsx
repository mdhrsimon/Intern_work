import React from "react";
import type { AccountUser } from "../../types/account";
import { Button } from "@/components/ui/button";
import {
  Shield,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  XCircle,
  FolderTree,
  X,
  Info,
} from "lucide-react";

interface ViewUserModalProps {
  user: AccountUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-600/20">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        );
      case "Staff":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <BookOpen className="h-3 w-3" />
            Teacher
          </span>
        );
      case "Student":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <GraduationCap className="h-3 w-3" />
            Student
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shadow-sm font-bold text-lg">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user.fullName || "Unnamed User"}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-6 overflow-y-auto pr-1">
          {/* Account Profile Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200/70">
            <div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Assigned Role
              </span>
              <div className="mt-1">{getRoleBadge(user.role)}</div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Account Status
              </span>
              <div className="mt-1">
                {user.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-300">
                    <XCircle className="h-3 w-3" /> Inactive
                  </span>
                )}
              </div>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">User ID: {user.id}</span>
            </div>
          </div>

          {/* Assigned Classes (Read-Only) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FolderTree className="h-4 w-4 text-purple-600" />
                Assigned Classes / Channels
              </h4>
              <span className="text-xs font-semibold rounded-full bg-purple-100 text-purple-700 px-2 py-0.5">
                {user.assignedClasses?.length || 0} Assigned
              </span>
            </div>

            {user.assignedClasses && user.assignedClasses.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {user.assignedClasses.map((ac) => (
                  <div
                    key={ac.classId}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:border-purple-200 hover:bg-purple-50/20 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{ac.className}</span>
                        {ac.code && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                            {ac.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Role in class: <span className="font-semibold text-slate-700">{ac.roleInClass}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      ID: {ac.classId}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center bg-slate-50/50">
                <p className="text-xs text-slate-500">No classes assigned to this user yet.</p>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-blue-50/60 p-2.5 border border-blue-100 text-blue-800 text-xs">
              <Info className="h-4 w-4 flex-shrink-0 text-blue-600 mt-0.5" />
              <span>
                To assign or modify class memberships for this user, visit the dedicated <strong>Class Assignments</strong> module.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <Button onClick={onClose} className="bg-slate-900 text-white hover:bg-slate-800">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
