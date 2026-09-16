import React, { useState } from "react";
import { useCreateAccountMutation } from "../../api/accountApi";
import type { AccountRole } from "../../types/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  X,
  AlertCircle,
  KeyRound,
  Copy,
  CheckCheck,
  Eye,
  EyeOff,
} from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreatedCredentials {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createAccount, { isLoading }] = useCreateAccountMutation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("Student");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Credentials dialog state — shown after successful creation
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async (text: string, type: "email" | "password") => {
    await navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleDone = () => {
    setCredentials(null);
    setShowPassword(false);
    setCopiedEmail(false);
    setCopiedPassword(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      await createAccount({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      }).unwrap();

      // Show credentials dialog — password held only in local state, never stored on server
      setCredentials({
        fullName: fullName.trim() || email.trim(),
        email: email.trim(),
        password,
        role,
      });

      // Reset form fields
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("Student");
    } catch (err: any) {
      setErrorMsg(
        err?.data?.message || err?.data?.errors?.[0] || "Failed to create user."
      );
    }
  };

  // ── Credentials dialog (shown after successful creation) ──────────────────
  if (credentials) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Account Created</h3>
              <p className="text-xs text-slate-500">Share these credentials with the user</p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Save these now.</strong> The password cannot be retrieved again — it is stored as a secure hash.
            </span>
          </div>

          {/* Account info */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Full Name</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{credentials.fullName}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                credentials.role === "Admin"
                  ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                  : credentials.role === "Staff"
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              }`}>
                {credentials.role === "Staff" ? "Teacher" : credentials.role}
              </span>
            </div>

            {/* Email */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Email / Username
              </p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-slate-900 break-all">{credentials.email}</code>
                <button
                  onClick={() => handleCopy(credentials.email, "email")}
                  className="flex-shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                  title="Copy email"
                >
                  {copiedEmail ? <CheckCheck className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Temporary Password
              </p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-slate-900 break-all">
                  {showPassword ? credentials.password : "•".repeat(credentials.password.length)}
                </code>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setShowPassword((v) => !v)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    title={showPassword ? "Hide password" : "Reveal password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleCopy(credentials.password, "password")}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    title="Copy password"
                  >
                    {copiedPassword ? <CheckCheck className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleDone}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Create User Form ───────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create New User</h3>
              <p className="text-xs text-slate-500">Add an administrator, teacher, or student</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="e.g. John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
              Email / Username
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="user@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
              Temporary Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-semibold text-slate-700">
              System Role
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as AccountRole)}
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="Student">Student</option>
                <option value="Staff">Teacher</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-200 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
            >
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
