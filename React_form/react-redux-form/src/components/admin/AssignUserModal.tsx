import React, { useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useAssignMembersBulkMutation, useGetClassByIdQuery } from "../../api/classApi";
import { useGetAccountsQuery } from "../../api/accountApi";
import type { ClassChannel } from "../../types/class";
import { ROLES } from "../../constants/roles";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
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
  const [assignMembersBulk, { isLoading }] = useAssignMembersBulkMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // CHANGED: many selected users instead of one
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // CHANGED: role filter for the list (all / teachers / students)
  const [roleFilter, setRoleFilter] = useState<"all" | "teacher" | "student">("all");

  // Fetch active users list for assignment
  const { data: accountsData } = useGetAccountsQuery({
    pageSize: 50,
    active: true,
  });

  // Members already in THIS class (served from cache, the parent already fetched it)
  const { currentData: classDetails, isFetching: isLoadingMembers } =
    useGetClassByIdQuery(isOpen && classChannel ? classChannel.id : skipToken);

  const assignedIds = new Set(
    [...(classDetails?.staff ?? []), ...(classDetails?.students ?? [])].map(
      (m) => m.accountId
    )
  );

  const availableUsers = accountsData?.items || [];

  // Not an admin AND not already in this class
  const assignableUsers = availableUsers.filter(
    (u) => u.role !== ROLES.ADMIN && !assignedIds.has(u.id)
  );

  // CHANGED: counts for the filter pills (admins are already excluded above)
  const teacherTotal = assignableUsers.filter((u) => u.role === ROLES.STAFF).length;
  const studentTotal = assignableUsers.length - teacherTotal;

  const query = search.trim().toLowerCase();
  const filteredUsers = assignableUsers
    // CHANGED: role filter
    .filter((u) =>
      roleFilter === "all"
        ? true
        : roleFilter === "teacher"
        ? u.role === ROLES.STAFF
        : u.role !== ROLES.STAFF
    )
    .filter(
      (u) =>
        (u.fullName || "").toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    )
    // CHANGED: teachers first, then alphabetical by name
    .sort((a, b) => {
      const aRank = a.role === ROLES.STAFF ? 0 : 1;
      const bRank = b.role === ROLES.STAFF ? 0 : 1;
      return aRank - bRank || (a.fullName || "").localeCompare(b.fullName || "");
    });

  // Derived from assignableUsers, so users who just got assigned drop out automatically
  const selectedUsers = assignableUsers.filter((u) => selectedIds.has(u.id));
  const teacherCount = selectedUsers.filter((u) => u.role === ROLES.STAFF).length;
  const studentCount = selectedUsers.length - teacherCount;

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selectedIds.has(u.id));

  // Hooks above must stay above this early return
  if (!isOpen || !classChannel) return null;

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select / unselect everyone currently visible (respects the search filter)
  const toggleAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredUsers.forEach((u) => next.delete(u.id));
      } else {
        filteredUsers.forEach((u) => next.add(u.id));
      }
      return next;
    });
  };

  const handleModalClose = () => {
    setErrorMsg(null);
    setSearch("");
    setRoleFilter("all");
    setSelectedIds(new Set());
    onClose();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedUsers.length === 0) {
      setErrorMsg("Please select at least one user to assign.");
      return;
    }

    try {
      const result = await assignMembersBulk({
        classId: classChannel.id,
        body: { accountIds: selectedUsers.map((u) => u.id) },
      }).unwrap();

      if (result.failed.length === 0) {
        handleModalClose();
        return;
      }

      // Partial success: keep the modal open and explain what failed
      const details = result.failed.map((f) => `${f.name || f.accountId}: ${f.reason}`).join(" | ");
      setErrorMsg(`Assigned ${result.assigned}. Could not assign ${result.failed.length}: ${details}`);
      setSelectedIds(new Set());
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Failed to assign users to class channel."));
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
              <h3 className="text-lg font-bold text-slate-900">Assign Members</h3>
              <p className="text-xs text-slate-500">
                Class: <span className="font-semibold text-purple-700">{classChannel.name}</span> (ID: {classChannel.id})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
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

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {/* Search & Select Users */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Select Users (Students & Teachers)
            </Label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-300 py-1.5 pl-8 pr-3 text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* CHANGED: role filter pills with counts */}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {(
                [
                  ["all", `All (${assignableUsers.length})`],
                  ["teacher", `Teachers (${teacherTotal})`],
                  ["student", `Students (${studentTotal})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRoleFilter(key)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                    roleFilter === key
                      ? "border-purple-600 bg-purple-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Select all (only the users currently shown) */}
            {!isLoadingMembers && filteredUsers.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2 px-1 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAllFiltered}
                  className="h-3.5 w-3.5 accent-purple-600"
                />
                Select all shown ({filteredUsers.length})
              </label>
            )}

            <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200 divide-y divide-slate-100">
              {isLoadingMembers ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  Loading class members...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  {assignableUsers.length === 0
                    ? "All eligible users are already assigned to this class"
                    : "No matching enrollable users found"}
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.has(user.id);
                  return (
                    <label
                      key={user.id}
                      className={`flex cursor-pointer items-center gap-3 p-2.5 text-xs transition-colors ${
                        isSelected
                          ? "bg-purple-50 text-purple-900 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUser(user.id)}
                        className="h-3.5 w-3.5 accent-purple-600"
                      />
                      <div className="flex-1">
                        <p>{user.fullName || "Unnamed User"}</p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                        {user.role}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Summary of the selection (role in class comes from each user's account role) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Selected ({selectedUsers.length})
            </Label>
            {selectedUsers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Tick one or more users above. Teachers join as Teacher, students as Student.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {teacherCount > 0 && (
                  <div className="rounded-lg border border-blue-500 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{teacherCount} Teacher{teacherCount === 1 ? "" : "s"}</span>
                  </div>
                )}
                {studentCount > 0 && (
                  <div className="rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{studentCount} Student{studentCount === 1 ? "" : "s"}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={isLoading}
              className="border-slate-200 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedUsers.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
            >
              {isLoading
                ? "Assigning..."
                : selectedUsers.length > 0
                ? `Assign ${selectedUsers.length} user${selectedUsers.length === 1 ? "" : "s"}`
                : "Confirm Assignment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};