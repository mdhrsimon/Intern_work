import React, { useState, useEffect } from "react";
import { useUpdateClassMutation } from "../../api/classApi";
import type { ClassChannel } from "../../types/class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Layers,
  FileCode,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";

interface EditClassModalProps {
  cls: ClassChannel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({
  cls,
  isOpen,
  onClose,
}) => {
  const [updateClass, { isLoading }] = useUpdateClassMutation();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cls) {
      setName(cls.name || "");
      setCode(cls.code || "");
      setDescription(cls.description || "");
      setErrorMsg(null);
    }
  }, [cls, isOpen]);

  if (!isOpen || !cls) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Class name is required.");
      return;
    }

    try {
      await updateClass({
        id: cls.id,
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
      }).unwrap();

      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.data?.message || "Failed to update class channel."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit Class Channel</h3>
              <p className="text-xs text-slate-500">Update channel ID: {cls.id}</p>
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
            <Label htmlFor="editClassName" className="text-xs font-semibold text-slate-700">
              Class Name
            </Label>
            <Input
              id="editClassName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editClassCode" className="text-xs font-semibold text-slate-700">
              Course / Channel Code
            </Label>
            <div className="relative">
              <FileCode className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="editClassCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editClassDesc" className="text-xs font-semibold text-slate-700">
              Description
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="editClassDesc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
