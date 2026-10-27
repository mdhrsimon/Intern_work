import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useUpdateAccountMutation } from "../../api/accountApi";
import type { AccountUser } from "../../types/account";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserCheck,
  Mail,
  Lock,
  User,
  X,
  AlertCircle,
} from "lucide-react";

interface EditUserModalProps {
  user: AccountUser | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditUserFormValues {
  fullName: string;
  email: string;
  password: string;
}

const EditUserForm: React.FC<{ user: AccountUser; onClose: () => void }> = ({
  user,
  onClose,
}) => {
  const [updateAccount, { isLoading }] = useUpdateAccountMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<EditUserFormValues>({
    defaultValues: {
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
    },
  });

  const onSubmit = async (formData: EditUserFormValues) => {
    setErrorMsg(null);

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Email is required.");
      return;
    }

    if (formData.password.trim() && (formData.password.length < 8 || !/\d/.test(formData.password))) {
      setErrorMsg("New password must be at least 8 characters and contain at least one digit.");
      return;
    }

    try {
      await updateAccount({
        id: user.id,
        fullName: formData.fullName.trim(),
        email: trimmedEmail,
        password: formData.password.trim() ? formData.password : undefined,
      }).unwrap();

      onClose();
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Failed to update user."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit User Details</h3>
              <p className="text-xs text-slate-500">Update personal profile and credentials</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="editFullName" className="text-xs font-semibold text-slate-700">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="editFullName"
                type="text"
                {...register("fullName")}
                className="pl-9 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editEmail" className="text-xs font-semibold text-slate-700">
              Email / Username
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="editEmail"
                type="email"
                {...register("email")}
                className="pl-9 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editPassword" className="text-xs font-semibold text-slate-700">
              Reset Password (optional)
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="editPassword"
                type="password"
                placeholder="Leave blank to keep unchanged (min 8 chars, 1 digit)"
                {...register("password")}
                className="pl-9 text-sm"
              />
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !user) return null;
  return <EditUserForm key={user.id} user={user} onClose={onClose} />;
};
