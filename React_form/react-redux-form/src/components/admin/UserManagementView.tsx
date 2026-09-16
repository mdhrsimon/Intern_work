import React, { useState } from "react";
import {
  useGetAccountsQuery,
  useChangeRoleMutation,
  useToggleActiveMutation,
  useDeleteAccountMutation,
} from "../../api/accountApi";
import { useAuthSession } from "../../lib/useAuthSession";
import type { AccountUser, AccountRole } from "../../types/account";
import { ViewUserModal } from "./ViewUserModal";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Shield,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from "lucide-react";

export const UserManagementView: React.FC = () => {
  const { email: currentAdminEmail } = useAuthSession();

  // Filter & pagination states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AccountRole | "">("");
  const [activeFilter, setActiveFilter] = useState<boolean | "">("");

  // Queries & Mutations
  const { data, isLoading, isFetching, refetch } = useGetAccountsQuery({
    page,
    pageSize,
    search,
    role: roleFilter,
    active: activeFilter,
  });

  const [changeRole, { isLoading: isChangingRole }] = useChangeRoleMutation();
  const [toggleActive, { isLoading: isTogglingActive }] = useToggleActiveMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<AccountUser | null>(null);
  const [editingUser, setEditingUser] = useState<AccountUser | null>(null);

  // Confirmation state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: "danger" | "warning" | "primary";
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => { },
  });

  const users = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  // Handlers for confirmation dialogs
  const handleInitiateRoleChange = (user: AccountUser, newRole: AccountRole) => {
    if (user.role === newRole) return;

    setConfirmConfig({
      isOpen: true,
      title: "Confirm Role Change",
      description: `Are you sure you want to change the role of "${user.fullName || user.email}" from ${user.role} to ${newRole}? Note: Class assignments will remain unaffected and must be managed in the Class Assignment module.`,
      confirmText: `Change to ${newRole}`,
      variant: "warning",
      action: async () => {
        await changeRole({ id: user.id, role: newRole }).unwrap();
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleInitiateToggleActive = (user: AccountUser) => {
    const isSelf = user.email.toLowerCase() === currentAdminEmail?.toLowerCase();
    if (isSelf && user.isActive) {
      alert("You cannot deactivate your own administrative session.");
      return;
    }

    const nextStatus = !user.isActive;

    if (!nextStatus) {
      // Deactivation confirmation
      setConfirmConfig({
        isOpen: true,
        title: "Deactivate User Account",
        description: `Are you sure you want to deactivate "${user.fullName || user.email}"? The user will be immediately blocked from signing in to the system.`,
        confirmText: "Deactivate Account",
        variant: "warning",
        action: async () => {
          await toggleActive({ id: user.id, isActive: false }).unwrap();
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        },
      });
    } else {
      // Immediate activation
      toggleActive({ id: user.id, isActive: true });
    }
  };

  const handleInitiateDelete = (user: AccountUser) => {
    const isSelf = user.email.toLowerCase() === currentAdminEmail?.toLowerCase();
    if (isSelf) {
      alert("You cannot delete your own administrative account.");
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: "Permanently Delete User",
      description: `Are you sure you want to permanently delete user "${user.fullName || user.email}"? This action cannot be undone and will remove all login credentials and class memberships.`,
      confirmText: "Delete Permanently",
      variant: "danger",
      action: async () => {
        await deleteAccount(user.id).unwrap();
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const getRoleBadge = (role: AccountRole) => {
    switch (role) {
      case "Admin":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-600/20">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        );
      case "Staff":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <BookOpen className="h-3 w-3" />
            Teacher
          </span>
        );
      case "Student":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <GraduationCap className="h-3 w-3" />
            Student
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters, Add User */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as AccountRole | "");
                setPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Teacher</option>
              <option value="Student">Student</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={activeFilter === "" ? "" : activeFilter ? "true" : "false"}
            onChange={(e) => {
              const val = e.target.value;
              setActiveFilter(val === "" ? "" : val === "true");
              setPage(1);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-slate-500 hover:text-slate-700"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Create User Button */}
        <div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-purple-600 mb-2" />
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrentAdmin =
                    user.email.toLowerCase() === currentAdminEmail?.toLowerCase();

                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors hover:bg-slate-50/60 ${!user.isActive ? "bg-slate-50/40 opacity-75" : ""
                        }`}
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                            {user.fullName
                              ? user.fullName.charAt(0).toUpperCase()
                              : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">
                                {user.fullName || "Unnamed User"}
                              </span>
                              {isCurrentAdmin && (
                                <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 ring-1 ring-purple-300">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role)}
                          {!isCurrentAdmin && (
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleInitiateRoleChange(user, e.target.value as AccountRole)
                              }
                              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:border-slate-300 focus:outline-none"
                              title="Change user role"
                            >
                              <option value="Student">Student</option>
                              <option value="Staff">Teacher</option>
                              <option value="Admin">Admin</option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleInitiateToggleActive(user)}
                          disabled={isCurrentAdmin && user.isActive}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${user.isActive
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-200"
                            } ${isCurrentAdmin ? "cursor-default" : "cursor-pointer"}`}
                          title={
                            isCurrentAdmin
                              ? "Cannot deactivate current session"
                              : user.isActive
                                ? "Click to deactivate"
                                : "Click to activate"
                          }
                        >
                          {user.isActive ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-slate-500" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View User */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingUser(user)}
                            className="h-8 gap-1 border-slate-200 px-2.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                            title="View full profile & assigned classes"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Button>

                          {/* Edit User */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            className="h-8 gap-1 border-slate-200 px-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                            title="Edit user details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>

                          {/* Delete User */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInitiateDelete(user)}
                            disabled={isCurrentAdmin}
                            className={`h-8 gap-1 border-slate-200 px-2 text-xs ${isCurrentAdmin
                                ? "opacity-40 cursor-not-allowed text-slate-400"
                                : "text-red-600 hover:bg-red-50 hover:border-red-200"
                              }`}
                            title={
                              isCurrentAdmin
                                ? "Self-deletion is prohibited"
                                : "Delete user permanently"
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-600">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {users.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(page * pageSize, totalCount)}
            </span>{" "}
            of <span className="font-semibold text-slate-900">{totalCount}</span> users
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <ViewUserModal
        user={viewingUser}
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
      />

      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
      />

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        isLoading={isChangingRole || isTogglingActive || isDeleting}
      />
    </div>
  );
};
