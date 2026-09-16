import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLogoutMutation, authApi } from "../api/authApi";
import { userApi } from "../api/userApi";
import { logOut } from "../redux/authSlice";
import { useAuthSession } from "../lib/useAuthSession";
import { Button } from "./ui/button";
import {
  GraduationCap,
  LogOut,
  UserCheck,
  Shield,
  BookOpen,
  User as UserIcon,
  FileText,
  Users,
  LayoutDashboard,
} from "lucide-react";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { role, email, fullName } = useAuthSession();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Handled silently
    } finally {
      dispatch(logOut());
      dispatch(authApi.util.resetApiState());
      dispatch(userApi.util.resetApiState());
      navigate("/", { replace: true });
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case "Admin":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-600/20">
            <Shield className="h-3.5 w-3.5" />
            Admin
          </span>
        );
      case "Staff":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <BookOpen className="h-3.5 w-3.5" />
            Teacher
          </span>
        );
      case "Student":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <GraduationCap className="h-3.5 w-3.5" />
            Student
          </span>
        );
    }
  };

  const navLinks = () => {
    if (role === "Admin") {
      return [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "Student Form", path: "/form", icon: FileText },
        { name: "Student Details", path: "/students", icon: Users },
      ];
    }
    if (role === "Staff") {
      return [
        { name: "Dashboard", path: "/staff", icon: LayoutDashboard },
        { name: "Student Form", path: "/form", icon: FileText },
        { name: "Student Records", path: "/students", icon: Users },
      ];
    }
    return [
      { name: "Dashboard", path: "/student", icon: LayoutDashboard },
      { name: "Registration Form", path: "/form", icon: FileText },
      { name: "My Submission", path: "/my-submission", icon: UserCheck },
    ];
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to={
              role === "Admin"
                ? "/admin"
                : role === "Staff"
                ? "/staff"
                : "/student"
            }
            className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg">EduPortal</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks().map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/70 py-1 pl-3 pr-1.5 text-sm">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-800">
                {fullName || email || "User"}
              </span>
            </div>
            {getRoleBadge()}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-1.5 border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
