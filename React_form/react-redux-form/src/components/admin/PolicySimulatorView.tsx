import { useState } from "react";
import { useGetClassesQuery, useCheckPolicyMutation } from "../../api/classApi";
import { useGetAccountsQuery } from "../../api/accountApi";
import type { PolicyCheckResult } from "../../types/class";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  User,
  Layers,
  Sparkles,
  CheckCircle2,
  Terminal,
  HelpCircle,
} from "lucide-react";

export const PolicySimulatorView = () => {
  const { data: accountsData } = useGetAccountsQuery({ pageSize: 50 });
  const { data: classesData } = useGetClassesQuery({ pageSize: 50 });
  const [checkPolicy, { isLoading }] = useCheckPolicyMutation();

  const users = accountsData?.items || [];
  const classes = classesData?.items || [];

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<"ManageClass" | "ViewClass">("ManageClass");
  const [policyResult, setPolicyResult] = useState<PolicyCheckResult | null>(null);

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const handleSimulate = async () => {
    if (!selectedUserId || !selectedClassId) return;

    try {
      const res = await checkPolicy({
        userId: selectedUserId,
        classId: selectedClassId,
        action: selectedAction,
      }).unwrap();

      setPolicyResult(res);
    } catch (err: any) {
      setPolicyResult({
        isAllowed: false,
        reason: err?.data?.message || "Policy evaluation returned 403 Forbidden.",
        userRole: selectedUser?.role || "Unknown",
        className: selectedClass?.name || "Unknown",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice & Context */}
      <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-indigo-900 shadow-sm">
        <Sparkles className="h-5 w-5 flex-shrink-0 text-indigo-600 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-indigo-950">
            Policy Authorization Demonstration &amp; Simulation Console
          </p>
          <p className="text-indigo-800">
            This module tests and demonstrates backend authorization policies. Policies determine whether a user can manage or access a specific class channel based on their system role and specific class assignment.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Input Selection Form */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Terminal className="h-5 w-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">
              Policy Evaluation Parameters
            </h3>
          </div>

          {/* 1. Pick User */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              1. Select Subject (User Account)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setPolicyResult(null);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-xs focus:border-purple-500 focus:outline-none"
            >
              <option value="">-- Choose User --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || u.email} ({u.role}) — {u.email}
                </option>
              ))}
            </select>
            {selectedUser && (
              <p className="text-[11px] text-slate-500">
                System Role: <span className="font-semibold text-slate-700">{selectedUser.role}</span> | Status:{" "}
                <span className={selectedUser.isActive ? "text-emerald-600" : "text-slate-400"}>
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            )}
          </div>

          {/* 2. Pick Class */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              2. Select Resource (Class Channel)
            </label>
            <select
              value={selectedClassId ?? ""}
              onChange={(e) => {
                setSelectedClassId(e.target.value ? Number(e.target.value) : null);
                setPolicyResult(null);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-xs focus:border-purple-500 focus:outline-none"
            >
              <option value="">-- Choose Class Channel --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  ID: {c.id} — {c.name} {c.code ? `(${c.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Pick Policy Action */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              3. Requested Action / Policy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedAction("ManageClass");
                  setPolicyResult(null);
                }}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-xs font-semibold transition-all ${
                  selectedAction === "ManageClass"
                    ? "border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>ManageClass</span>
                <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                  (Edit/Manage Class Content)
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedAction("ViewClass");
                  setPolicyResult(null);
                }}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-xs font-semibold transition-all ${
                  selectedAction === "ViewClass"
                    ? "border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>ViewClass</span>
                <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                  (Read-only Class Access)
                </span>
              </button>
            </div>
          </div>

          <Button
            onClick={handleSimulate}
            disabled={isLoading || !selectedUserId || !selectedClassId}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? "Evaluating Policy..." : "Run Policy Evaluation"}
          </Button>
        </div>

        {/* Right: Policy Evaluation Output & Rule Matrix */}
        <div className="lg:col-span-6 space-y-4">
          {policyResult ? (
            <div
              className={`rounded-xl border p-6 shadow-sm animate-in fade-in duration-300 ${
                policyResult.isAllowed
                  ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
                  : "border-red-200 bg-red-50/40 text-red-950"
              }`}
            >
              <div className="flex items-center gap-3 border-b pb-4 border-slate-200/60">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-xs ${
                    policyResult.isAllowed
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {policyResult.isAllowed ? (
                    <ShieldCheck className="h-7 w-7" />
                  ) : (
                    <ShieldAlert className="h-7 w-7" />
                  )}
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      policyResult.isAllowed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {policyResult.isAllowed ? "HTTP 200 OK — ALLOWED" : "HTTP 403 FORBIDDEN — REJECTED"}
                  </span>
                  <h4 className="text-lg font-bold mt-1 text-slate-900">
                    Policy Check: {selectedAction}
                  </h4>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-lg bg-white p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
                  <p className="font-semibold text-slate-700">Evaluation Decision Detail:</p>
                  <p className="text-slate-800 text-sm leading-relaxed">{policyResult.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400">Class Channel:</span>{" "}
                    <span className="font-semibold text-slate-800">{policyResult.className}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">User Role:</span>{" "}
                    <span className="font-semibold text-slate-800">{policyResult.userRole}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Class Membership:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {policyResult.roleInClass || "None (Not Enrolled)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Action:</span>{" "}
                    <span className="font-semibold text-slate-800">{selectedAction}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
              <ShieldCheck className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Awaiting Simulation</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Select a user, class channel, and action on the left, then click &quot;Run Policy Evaluation&quot; to test enforcement.
              </p>
            </div>
          )}

          {/* Policy Rules Quick Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              Backend Policy Authorization Rules
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Admin</strong>: Unrestricted global access to all classes, assignments, and actions.
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Teacher (Staff)</strong>: Can access and manage ONLY classes they are explicitly assigned to. Accessing other classes returns <strong>403 Forbidden</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Student</strong>: Can view only classes they are enrolled in. <strong>ManageClass</strong> action is strictly Forbidden.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
