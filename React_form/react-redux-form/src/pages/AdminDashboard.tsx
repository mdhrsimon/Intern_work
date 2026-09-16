import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthSession } from "../lib/useAuthSession";
import { Navbar } from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { UserManagementView } from "../components/admin/UserManagementView";
import { ClassManagementView } from "../components/admin/ClassManagementView";
import { ClassAssignmentView } from "../components/admin/ClassAssignmentView";
import { StudentDetailsView } from "../components/admin/StudentDetailsView";
import {
  Shield,
  Users,
  Layers,
  FolderTree,
  FilePlus,
  GraduationCap,
} from "lucide-react";

type AdminTab = "users" | "classes" | "assignments" | "students";

const AdminDashboard = () => {
  const { fullName } = useAuthSession();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome Banner (Solid Purple, clean & simple) */}
        <div className="rounded-2xl border border-purple-800 bg-purple-900 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-800 px-3 py-1 text-xs font-semibold text-purple-200 border border-purple-700">
                <Shield className="h-3.5 w-3.5" />
                Administrator Access
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome, {fullName || "Administrator"}
              </h1>
              <p className="text-purple-200 text-sm sm:text-base max-w-2xl">
                Manage user accounts, create class channels, and assign teachers &amp; students.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/students">
                <Button className="bg-white text-purple-900 hover:bg-purple-50 font-semibold shadow-sm">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Student Details
                </Button>
              </Link>
              <Link to="/form">
                <Button variant="outline" className="border-purple-300 text-purple-100 hover:bg-purple-800">
                  <FilePlus className="h-4 w-4 mr-2" />
                  New Registration
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Module Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border border-slate-200 bg-white p-1.5 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "users"
                ? "bg-purple-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveTab("classes")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "classes"
                ? "bg-purple-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Class Management</span>
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "assignments"
                ? "bg-purple-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <FolderTree className="h-4 w-4" />
            <span>Class Assignments</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "students"
                ? "bg-purple-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Student Details</span>
          </button>
        </div>

        {/* Tab Panels */}
        <div>
          {activeTab === "users" && <UserManagementView />}
          {activeTab === "classes" && <ClassManagementView />}
          {activeTab === "assignments" && <ClassAssignmentView />}
          {activeTab === "students" && <StudentDetailsView />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;