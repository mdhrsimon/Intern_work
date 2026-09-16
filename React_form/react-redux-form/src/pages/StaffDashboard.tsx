import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthSession } from "../lib/useAuthSession";
import { useGetMyClassesQuery, useGetClassByIdQuery } from "../api/classApi";
import { Navbar } from "../components/Navbar";
import { TeacherAssignmentsView } from "../components/teacher/TeacherAssignmentsView";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  FilePlus,
  GraduationCap,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Hash,
  RefreshCw,
} from "lucide-react";

const StaffDashboard = () => {
  const { fullName } = useAuthSession();
  const { data: myClasses, isLoading: isLoadingClasses, refetch } = useGetMyClassesQuery();

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"assignments" | "students">("assignments");

  const activeClassId = selectedClassId ?? (myClasses && myClasses.length > 0 ? myClasses[0].id : null);

  const {
    data: classDetails,
    isLoading: isLoadingDetails,
    error: classError,
  } = useGetClassByIdQuery(activeClassId ?? 0, {
    skip: !activeClassId,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner (Solid Blue, clean & simple) */}
        <div className="rounded-2xl border border-blue-800 bg-blue-900 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-800 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-700">
                <BookOpen className="h-3.5 w-3.5" />
                Teacher Portal &amp; Assigned Channels
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome, {fullName || "Teacher"}
              </h1>
              <p className="text-blue-200/90 text-sm sm:text-base max-w-2xl">
                Access your assigned class channels, manage assignments, review submissions, and view students in your courses under policy authorization.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/students">
                <Button className="bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-md">
                  <Users className="h-4 w-4 mr-2" />
                  View Student Records
                </Button>
              </Link>
              <Link to="/form">
                <Button variant="outline" className="border-blue-300 text-blue-100 hover:bg-blue-800/40">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Enroll Student
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Assigned Classes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                My Assigned Classes &amp; Channels
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Backend Policy Authorization allows you to view and manage only classes assigned to you.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs border-slate-200 text-slate-700"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Refresh
            </Button>
          </div>

          {isLoadingClasses ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
              Loading your assigned classes...
            </div>
          ) : !myClasses || myClasses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Layers className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No Classes Assigned</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                An administrator has not assigned you to any class channels yet. Contact your administrator to receive class assignments.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Class Buttons List */}
              <div className="lg:col-span-4 space-y-2.5">
                {myClasses.map((cls) => {
                  const isSelected = cls.id === activeClassId;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-600"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
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

                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {cls.studentCount || 0} Enrolled Students
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Class Details, Assignments & Roster */}
              <div className="lg:col-span-8">
                {classError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-base">
                      <ShieldAlert className="h-5 w-5 text-red-600" />
                      Policy Authorization Forbidden (403)
                    </div>
                    <p className="text-xs text-red-800">
                      Access Denied by ASP.NET Core Authorization Policy. You do not hold Teacher privileges for this requested class.
                    </p>
                  </div>
                ) : isLoadingDetails ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
                    Loading class details...
                  </div>
                ) : classDetails ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                            Channel ID: {classDetails.id}
                          </span>
                          {classDetails.code && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                              {classDetails.code}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">
                          {classDetails.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {classDetails.description || "Class channel information"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>Policy: Allowed</span>
                      </div>
                    </div>

                    {/* Section Switcher Tabs */}
                    <div className="flex items-center border-b border-slate-200 gap-6">
                      <button
                        onClick={() => setActiveTab("assignments")}
                        className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                          activeTab === "assignments"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                        Course Assignments
                      </button>

                      <button
                        onClick={() => setActiveTab("students")}
                        className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                          activeTab === "students"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <GraduationCap className="h-4 w-4" />
                        Enrolled Students ({classDetails.students.length})
                      </button>
                    </div>

                    {/* Tab Contents */}
                    {activeTab === "assignments" ? (
                      <TeacherAssignmentsView classId={classDetails.id} />
                    ) : (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-emerald-600" />
                          Students Enrolled in this Class ({classDetails.students.length})
                        </h4>

                        {classDetails.students.length === 0 ? (
                          <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                            No students currently enrolled in this class.
                          </p>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {classDetails.students.map((student) => (
                              <div
                                key={student.accountId}
                                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 bg-slate-50/50"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                                  {student.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-900">
                                    {student.fullName}
                                  </p>
                                  <p className="text-[11px] text-slate-500">{student.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;