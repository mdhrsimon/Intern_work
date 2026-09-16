import React, { useState } from "react";
import {
  useGetClassesQuery,
  useDeleteClassMutation,
} from "../../api/classApi";
import type { ClassChannel } from "../../types/class";
import { CreateClassModal } from "./CreateClassModal";
import { EditClassModal } from "./EditClassModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const ClassManagementView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetClassesQuery({
    page,
    pageSize,
    search,
  });

  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassChannel | null>(null);

  // Confirmation state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => {},
  });

  const classes = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  const handleInitiateDelete = (cls: ClassChannel) => {
    setConfirmConfig({
      isOpen: true,
      title: `Delete Class: ${cls.name}`,
      description: `Are you sure you want to delete "${cls.name}" (ID: ${cls.id})? All student and staff enrollments in this class will be removed. This action cannot be undone.`,
      action: async () => {
        await deleteClass(cls.id).unwrap();
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search classes by name or code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-slate-500 hover:text-slate-700"
            title="Refresh classes"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Class Channel Grid */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-purple-600 mb-2" />
          Loading class channels...
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Classes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No class channels currently match your search. Create a new class channel to get started.
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Class
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-purple-300 hover:shadow-md"
            >
              <div>
                {/* ID & Code Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-800">
                    <Hash className="h-3 w-3" />
                    ID: {cls.id}
                  </div>
                  {cls.code && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700 border border-slate-200">
                      {cls.code}
                    </span>
                  )}
                </div>

                {/* Class Title & Description */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                  {cls.name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                  {cls.description || "No description provided for this channel."}
                </p>

                {/* Member Counts */}
                <div className="mt-4 flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{cls.staffCount || 0} Teacher{cls.staffCount === 1 ? "" : "s"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{cls.studentCount || 0} Student{cls.studentCount === 1 ? "" : "s"}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Edit & Delete Actions */}
              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingClass(cls)}
                  className="h-8 gap-1 border-slate-200 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInitiateDelete(cls)}
                  className="h-8 gap-1 border-slate-200 text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{classes.length}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalCount}</span> classes
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
      )}

      {/* Modals */}
      <CreateClassModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <EditClassModal
        cls={editingClass}
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
      />

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText="Delete Class"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
