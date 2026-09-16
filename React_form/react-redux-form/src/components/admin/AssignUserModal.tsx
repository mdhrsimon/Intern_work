import React, { useState } from "react";
import { useAssignMemberMutation } from "../../api/classApi";
import { useGetAccountsQuery } from "../../api/accountApi";
import type { ClassChannel } from "../../types/class";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  BookOpen,
  GraduationCap,
  X,
  AlertCircle,
  Search,
} from "lucide-react";

interface AssignUserModalProps {
  classChannel: ClassChannel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignUserModal: React.FC<AssignUserModalProps> = ({
  classChannel,
  isOpen,
  onClose,
}) => {
  const [assignMember, { isLoading }] = useAssignMemberMutation();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [roleInClass, setRoleInClass] = useState<"Staff" | "Student">("Student");
  const [userSearch, setUserSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch active users list for assignment
  const { data: accountsData } = useGetAccountsQuery({
    pageSize: 50,
    active: true,
  });

  const availableUsers = accountsData?.items || [];
  const filteredUsers = availableUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (!isOpen || !classChannel) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedUserId) {
      setErrorMsg("Please select a user to assign.");
      return;
    }

    try {
      await assignMember({
        classId: classChannel.id,
        body: {
          accountId: selectedUserId,
          roleInClass,
        },
      }).unwrap();

      setSelectedUserId("");
      setUserSearch("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to assign user to class channel.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900"></h3>
              <p className="text-xs text-slate-500">
                Class: <span className="font-semibold text-purple-700">{classChannel.name}</span> (ID: {classChannel.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Search & Select User */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Select Active User
            </Label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-md border border-slate-300 py-1.5 pl-8 pr-3 text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="max-h-40 overflow-y-auto rounded-md border border-slate-200 divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No matching active users found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserId === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        if (user.role === "Staff") setRoleInClass("Staff");
                        else setRoleInClass("Student");
                      }}
                      className={`flex cursor-pointer items-center justify-between p-2.5 text-xs transition-colors ${
                        isSelected
                          ? "bg-purple-50 text-purple-900 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <p>{user.fullName || "Unnamed User"}</p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                        {user.role}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Role In Class */}
          <div className="space-y-1.5">
            <Label htmlFor="roleInClass" className="text-xs font-semibold text-slate-700">
              Assigned Role In This Class
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRoleInClass("Staff")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
                  roleInClass === "Staff"
                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleInClass("Student")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
                  roleInClass === "Student"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Student</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-200 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedUserId}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
            >
              {isLoading ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
