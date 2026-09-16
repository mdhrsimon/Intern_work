import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../api/authApi";
import { setCredentials } from "../redux/authSlice";
import { parseRole, homePathForRole } from "../lib/permissions";
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
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  UserPlus,
} from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [register, { isLoading }] = useRegisterMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationError("Email is required.");
      return;
    }
    if (!password || password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    try {
      const authData = await register({
        email: trimmedEmail,
        password,
        fullName: fullName.trim() || undefined,
        role: "Student",
      }).unwrap();

      const parsedUserRole = parseRole(authData.role) ?? "Student";

      dispatch(
        setCredentials({
          email: authData.email,
          fullName: authData.fullName,
          role: parsedUserRole,
        })
      );

      navigate(homePathForRole(parsedUserRole), { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string; errors?: string[] } };
      const serverMsg =
        errorObj?.data?.message ||
        (errorObj?.data?.errors && errorObj.data.errors.join(", ")) ||
        "Registration failed. Please check your information.";
      setValidationError(serverMsg);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40">
      {/* Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Edu Portal
            </span>
          </Link>

          <Link to="/">
            <Button variant="ghost" size="sm" className="font-medium">
              Back to Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Register Area */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-2xl">
          <Card className="overflow-hidden border border-slate-200/90 shadow-xl bg-white/95 backdrop-blur">
            <CardHeader className="space-y-3 pb-6 text-center border-b border-slate-100 bg-slate-50/50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600">
                <UserPlus className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Create Student Account
              </CardTitle>
              <CardDescription className="text-sm sm:text-base max-w-md mx-auto text-slate-500">
                Register with your details to access the student portal.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {validationError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/90 p-4 text-sm text-red-800 animate-in fade-in-50">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Registration Issue</p>
                    <p className="text-red-700 mt-0.5">{validationError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <Input
                      id="fullName"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 pl-11 bg-white border-slate-200"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    Email Address <span className="text-red-500">*</span>
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
                      className="h-11 pl-11 bg-white border-slate-200"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        className="h-11 pl-11 pr-10 bg-white border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        className="h-11 pl-11 bg-white border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 mt-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Create Account</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    to="/"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;