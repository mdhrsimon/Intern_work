import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthSession } from "../lib/useAuthSession";
import { useGetMyClassesQuery } from "../api/classApi";
import { Navbar } from "../components/Navbar";
import { StudentAssignmentsView } from "../components/student/StudentAssignmentsView";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  FileText,
  UserCheck,
  ArrowRight,
  Layers,
  BookOpen,
  Hash,
  RefreshCw,
} from "lucide-react";

const StudentDashboard = () => {
  const { email, fullName } = useAuthSession();
  const { data: myClasses, isLoading: isLoadingClasses, refetch } = useGetMyClassesQuery();

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const activeClassId = selectedClassId ?? (myClasses && myClasses.length > 0 ? myClasses[0].id : null);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner (Solid Emerald, clean & simple) */}
        <div className="rounded-2xl border border-emerald-800 bg-emerald-900 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-700">
                <GraduationCap className="h-3.5 w-3.5" />
                Student Portal &amp; Course Work
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome, {fullName || "Student"}
              </h1>
              <p className="text-emerald-200/90 text-sm sm:text-base max-w-2xl">
                View your enrolled class channels, view assigned coursework, submit assignments, and track grades &amp; feedback.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/form">
                <Button className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold shadow-md">
                  <FileText className="h-4 w-4 mr-2" />
                  Fill Student Details
                </Button>
              </Link>
              <Link to="/my-submission">
                <Button variant="outline" className="border-emerald-300 text-emerald-100 hover:bg-emerald-800/40">
                  <UserCheck className="h-4 w-4 mr-2" />
                  My Submission
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* My Enrolled Classes & Coursework Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" />
                My Enrolled Classes &amp; Assignments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Class channels you are officially enrolled in. Select a class to view its assignments.
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
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600 mb-2" />
              Loading your classes...
            </div>
          ) : !myClasses || myClasses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Layers className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No Enrolled Classes Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You are not currently enrolled in any class channels. Your administrator will assign your courses.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Class List Selector */}
              <div className="lg:col-span-4 space-y-2.5">
                {myClasses.map((cls) => {
                  const isSelected = cls.id === activeClassId;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600"
                          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          <Hash className="h-3 w-3" />
                          ID: {cls.id}
                        </span>
                        {cls.code && (
                          <span className="text-[11px] font-mono text-slate-500 font-medium">
                            {cls.code}
                          </span>
                        )}
                      </div>

                      <h4 className="mt-2 text-sm font-bold text-slate-900">{cls.name}</h4>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1 text-blue-700 font-medium">
                          <BookOpen className="h-3.5 w-3.5" />
                          {cls.staffCount || 0} Instructor(s)
                        </span>
                        <span className="font-semibold text-emerald-700 text-[11px]">Enrolled</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Assignments View for Selected Class */}
              <div className="lg:col-span-8">
                {activeClassId ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <StudentAssignmentsView classId={activeClassId} />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Feature Cards Grid */}
        
        
      </main>
    </div>
  );
};

export default StudentDashboard;