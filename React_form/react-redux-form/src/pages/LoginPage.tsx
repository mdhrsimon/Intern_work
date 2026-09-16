import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../api/authApi";
import { setCredentials } from "../redux/authSlice";
import { parseRole, homePathForRole, isLoggedIn, getRole } from "../lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      const role = getRole();
      navigate(homePathForRole(role), { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationError("Email is required.");
      return;
    }
    if (!password) {
      setValidationError("Password is required.");
      return;
    }

    try {
      const authData = await login({
        email: trimmedEmail,
        password,
      }).unwrap();

      const role = parseRole(authData.role);

      if (!role) {
        setValidationError("This account has no recognized role in the system.");
        return;
      }

      dispatch(
        setCredentials({
          email: authData.email,
          fullName: authData.fullName,
          role,
        })
      );

      // Check if there was a redirected path
      const fromPath = (location.state as { from?: { pathname?: string } })?.from
        ?.pathname;
      const destination =
        fromPath && fromPath !== "/" && fromPath !== "/login" && fromPath !== "/register"
          ? fromPath
          : homePathForRole(role);

      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      setValidationError(
        errorObj?.data?.message || "Invalid email or password. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40">
      {/* Top Banner / Navigation Bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Edu Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-slate-500">
              Need an account?
            </span>
            <Link to="/register">
              <Button variant="outline" size="sm" className="font-medium">
                Register 
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Area - Large centered frame covering roughly half the screen on desktop */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-2xl">
          <Card className="overflow-hidden border border-slate-200/90 shadow-xl bg-white/95 backdrop-blur">
            {/* Header with Title */}
            <CardHeader className="space-y-3 pb-6 text-center border-b border-slate-100 bg-slate-50/50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Sign In to Your Account
              </CardTitle>
              <CardDescription className="text-sm sm:text-base max-w-md mx-auto text-slate-500">
                Enter your email address and password to sign in.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Error Alert */}
              {validationError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/90 p-4 text-sm text-red-800 animate-in fade-in-50">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Authentication Failed</p>
                    <p className="text-red-700 mt-0.5">{validationError}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="h-12 pl-11 text-base bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="h-12 pl-11 pr-11 text-base bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Sign in to Portal</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Registration Link */}
              <div className="border-t border-slate-100 pt-5 text-center">
                <p className="text-sm text-slate-600">
                  Don't have an account yet?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 transition-colors"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-4 text-center text-xs text-slate-500">
        Student Management System &bull; Secure Authentication Portal
      </footer>
    </div>
  );
};

export default LoginPage;