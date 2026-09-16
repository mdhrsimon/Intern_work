import React, { useState } from "react";
import {
  useGetStudentDetailsQuery,
} from "../../api/userApi";
import type { User } from "../../types/user";
import {
  GraduationCap,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const EducationBadge: React.FC<{ degree: string; institute: string; yearPassed: string }> = ({
  degree,
  institute,
  yearPassed,
}) => (
  <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
    <BookOpen className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
    <div className="text-xs">
      <p className="font-semibold text-slate-800">{degree}</p>
      <p className="text-slate-500">{institute}</p>
      <p className="text-slate-400">Year: {yearPassed}</p>
    </div>
  </div>
);

const StudentRow: React.FC<{ student: User }> = ({ student }) => {
  const [expanded, setExpanded] = useState(false);
  const hasEducation = student.education && student.education.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Main info row */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
        {/* Avatar */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
          {student.fullName ? student.fullName.charAt(0).toUpperCase() : "?"}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="font-semibold text-slate-900 truncate">{student.fullName || "—"}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {student.email || "—"}
            </span>
            {student.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {student.phone}
              </span>
            )}
            {student.gender && (
              <span className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {student.gender}
              </span>
            )}
            {student.dateOfBirth && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {student.dateOfBirth}
              </span>
            )}
          </div>
          {student.address && (
            <p className="text-xs text-slate-400 flex items-start gap-1 mt-0.5">
              <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span className="truncate">{student.address}</span>
            </p>
          )}
        </div>

        {/* Education count + expand toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              hasEducation
                ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <BookOpen className="h-3 w-3" />
            {hasEducation ? `${student.education.length} Education` : "No Education"}
            {student.education.length > 1 ? " Records" : student.education.length === 1 ? " Record" : ""}
          </span>

          {hasEducation && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Details
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Education expandable */}
      {expanded && hasEducation && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Education History
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {student.education.map((edu, i) => (
              <EducationBadge
                key={i}
                degree={edu.degree}
                institute={edu.institute}
                yearPassed={edu.yearPassed}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const StudentDetailsView: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useGetStudentDetailsQuery({
    page,
    pageSize: PAGE_SIZE,
  });

  const students = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            Student Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Students who have submitted their registration form
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
            {totalCount} {totalCount === 1 ? "Student" : "Students"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-slate-500 hover:text-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
          <p className="text-sm">Loading student records...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">No student details yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Students appear here only after they log in and submit the registration form.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student, i) => (
            <StudentRow key={student.id ?? `s-${i}`} student={student} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-600 shadow-sm">
          <span>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {students.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(page * PAGE_SIZE, totalCount)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">{totalCount}</span> students
          </span>
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
              {page} / {totalPages}
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
    </div>
  );
};
