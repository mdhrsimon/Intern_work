import React, { useState } from "react";
import {
  useGetClassesQuery,
  useGetClassByIdQuery,
  useRemoveMemberMutation,
} from "../../api/classApi";
import type { ClassMember } from "../../types/class";
import { AssignUserModal } from "./AssignUserModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { Button } from "@/components/ui/button";
import {
  FolderTree,
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Layers,
  Hash,
  RefreshCw,
} from "lucide-react";

export const ClassAssignmentView: React.FC = () => {
  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery({
    pageSize: 50,
  });

  const classes = classesData?.items || [];
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // Set default selected class once loaded
  const currentSelectedId = selectedClassId ?? (classes.length > 0 ? classes[0].id : null);

  const {
    data: classDetails,
    isLoading: isLoadingDetails,
  } = useGetClassByIdQuery(currentSelectedId ?? 0, {
    skip: !currentSelectedId,
  });

  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

  // Modals state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => { },
  });

  const selectedClass = classes.find((c) => c.id === currentSelectedId) || null;

  const handleInitiateRemove = (member: ClassMember) => {
    if (!selectedClass) return;

    setConfirmConfig({
      isOpen: true,
      title: "Remove Class Member",
      description: `Are you sure you want to remove "${member.fullName || member.email}" (${member.roleInClass}) from "${selectedClass.name}"? They will lose access to this class channel.`,
      action: async () => {
        await removeMember({
          classId: selectedClass.id,
          accountId: member.accountId,
        }).unwrap();
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Module Overview Notice */}


      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Class Channel Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-purple-600" />
              Select Class Channel
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {classes.length} Total
            </span>
          </div>

          {isLoadingClasses ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
              <RefreshCw className="mx-auto h-5 w-5 animate-spin text-purple-600 mb-2" />
              Loading classes...
            </div>
          ) : classes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              No classes found. Create classes in the Class Management tab first.
            </div>
          ) : (
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {classes.map((cls) => {
                const isSelected = cls.id === currentSelectedId;
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${isSelected
                      ? "border-purple-600 bg-purple-50/70 shadow-sm ring-1 ring-purple-600"
                      : "border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50/70"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800">
                        <Hash className="h-3 w-3" />
                        ID: {cls.id}
                      </span>
                      {cls.code && (
                        <span className="text-[11px] font-mono text-slate-500 font-medium">
                          {cls.code}
                        </span>
                      )}
                    </div>

                    <h4 className="mt-2 text-sm font-bold text-slate-900">
                      {cls.name}
                    </h4>

                    <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-blue-700 font-medium">
                        <BookOpen className="h-3.5 w-3.5" />
                        {cls.staffCount || 0} Teacher
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {cls.studentCount || 0} Students
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Visual Tree View of Members in Selected Class */}
        <div className="lg:col-span-8">
          {selectedClass ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              {/* Header with Title & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                      <Hash className="h-3 w-3" />
                      Channel ID: {selectedClass.id}
                    </span>
                    {selectedClass.code && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                        {selectedClass.code}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {selectedClass.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedClass.description || "Class channel membership tree"}
                  </p>
                </div>

                <Button
                  onClick={() => setIsAssignOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Assign User to Class
                </Button>
              </div>

              {isLoadingDetails ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-purple-600 mb-2" />
                  Loading membership structure...
                </div>
              ) : (
                /* Tree View Structure */
                <div className="rounded-xl bg-slate-50/70 p-5 border border-slate-200/80 space-y-6">
                  {/* Root Node: Class Name */}
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-700 text-white shadow-sm">
                      <FolderTree className="h-4 w-4" />
                    </div>
                    <span>{classDetails?.name || selectedClass.name}</span>
                    <span className="text-xs font-normal text-slate-400">
                      (Channel ID: {selectedClass.id})
                    </span>
                  </div>

                  {/* Branch 1: Staff / Teachers */}
                  <div className="ml-4 pl-4 border-l-2 border-blue-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span>Staff / Teachers ({classDetails?.staff.length || 0})</span>
                    </div>

                    {classDetails?.staff && classDetails.staff.length > 0 ? (
                      <div className="space-y-2">
                        {classDetails.staff.map((staff) => (
                          <div
                            key={staff.accountId}
                            className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-3 shadow-xs hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                                {staff.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {staff.fullName}
                                </p>
                                <p className="text-xs text-slate-500">{staff.email}</p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInitiateRemove(staff)}
                              className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="Remove teacher from class"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-white/70 p-2.5 rounded-lg border border-dashed border-slate-200">
                        No teachers assigned yet.
                      </p>
                    )}
                  </div>

                  {/* Branch 2: Students */}
                  <div className="ml-4 pl-4 border-l-2 border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      <GraduationCap className="h-4 w-4 text-emerald-600" />
                      <span>Enrolled Students ({classDetails?.students.length || 0})</span>
                    </div>

                    {classDetails?.students && classDetails.students.length > 0 ? (
                      <div className="space-y-2">
                        {classDetails.students.map((student) => (
                          <div
                            key={student.accountId}
                            className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-3 shadow-xs hover:border-emerald-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                                {student.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {student.fullName}
                                </p>
                                <p className="text-xs text-slate-500">{student.email}</p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInitiateRemove(student)}
                              className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="Remove student from class"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-white/70 p-2.5 rounded-lg border border-dashed border-slate-200">
                        No students enrolled yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              Select a class from the left panel to inspect its tree hierarchy.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AssignUserModal
        classChannel={selectedClass}
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText="Remove Assignment"
        variant="danger"
        isLoading={isRemoving}
      />
    </div>
  );
};
