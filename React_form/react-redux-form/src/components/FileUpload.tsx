import axios from "axios";
import {
  FileAudio,
  FileIcon,
  FileImage,
  FileText,
  FileVideo,
  Plus,
  Trash2,
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

export type UploadedFileResult = {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
};

type FileWithProgress = {
  localId: string;
  file: File;
  progress: number;
  uploaded: boolean;
  serverId?: number;
  error?: string;
};

interface FileUploadProps {
  uploadUrl: string;
  onUploadSuccess: () => void; // Triggered when uploads finish
  onDeleteFile?: (serverId: number) => Promise<void>;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_FILES = 10;
const ALLOWED_EXTS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".txt", ".zip"];

export function FileUpload({ uploadUrl, onUploadSuccess, onDeleteFile, disabled }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploading, setUploading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    setGlobalError("");
    if (!e.target.files?.length) {
      return;
    }

    const selectedFiles = Array.from(e.target.files);
    
    // Check total files limit
    if (files.length + selectedFiles.length > MAX_FILES) {
      setGlobalError(`You can only upload up to ${MAX_FILES} files in total.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const newFiles: FileWithProgress[] = [];

    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setGlobalError(`File ${file.name} exceeds the 20MB limit.`);
        continue;
      }
      
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        setGlobalError(`File type ${ext} is not allowed.`);
        continue;
      }

      newFiles.push({
        localId: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        uploaded: false,
      });
    }

    setFiles([...files, ...newFiles]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleUpload() {
    const filesToUpload = files.filter((f) => !f.uploaded && !f.error);
    if (filesToUpload.length === 0 || uploading) {
      return;
    }

    setUploading(true);
    setGlobalError("");
    let anySuccess = false;

    const uploadPromises = filesToUpload.map(async (fileWithProgress) => {
      const formData = new FormData();
      formData.append("file", fileWithProgress.file);

      try {
        const response = await axios.post<UploadedFileResult>(uploadUrl, formData, {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setFiles((prev) =>
              prev.map((f) =>
                f.localId === fileWithProgress.localId ? { ...f, progress } : f
              )
            );
          },
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.localId === fileWithProgress.localId
              ? { ...f, uploaded: true, serverId: response.data.id, progress: 100 }
              : f
          )
        );
        anySuccess = true;
      } catch (error: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.localId === fileWithProgress.localId
              ? { ...f, error: error.response?.data?.message || "Upload failed" }
              : f
          )
        );
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);
    
    if (anySuccess) {
      onUploadSuccess();
    }
  }

  async function removeFile(localId: string) {
    const fileToRemove = files.find(f => f.localId === localId);
    
    if (fileToRemove?.uploaded && fileToRemove.serverId && onDeleteFile) {
      try {
        await onDeleteFile(fileToRemove.serverId);
      } catch (err) {
        alert("Failed to delete file from server.");
        return;
      }
    }
    
    setFiles((prev) => prev.filter((f) => f.localId !== localId));
  }

  function handleClear() {
    // Only clear unuploaded drafts for safety, uploaded files need specific deletion
    setFiles((prev) => prev.filter(f => f.uploaded));
  }

  const unuploadedCount = files.filter(f => !f.uploaded && !f.error).length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 bg-slate-50/50">
      <h2 className="text-sm font-bold text-slate-800">Attach Files</h2>
      
      {globalError && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
          <AlertCircle size={14} />
          <span>{globalError}</span>
        </div>
      )}
      
      <div className="flex gap-2">
        <FileInput
          inputRef={inputRef}
          disabled={uploading || disabled || files.length >= MAX_FILES}
          onFileSelect={handleFileSelect}
        />
        <ActionButtons
          disabled={unuploadedCount === 0 || uploading || !!disabled}
          onUpload={handleUpload}
          onClear={handleClear}
          uploading={uploading}
        />
      </div>
      
      <FileList files={files} onRemove={removeFile} disabled={uploading || disabled} />
    </div>
  );
}

type FileInputProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
};

function FileInput({ inputRef, disabled, onFileSelect }: FileInputProps) {
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileSelect}
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip"
        className="hidden"
        id="file-upload"
        disabled={!!disabled}
      />
      <label
        htmlFor="file-upload"
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold shadow-sm border transition-colors ${
          disabled 
            ? "cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200" 
            : "cursor-pointer bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
        }`}
      >
        <Plus size={16} />
        Browse Files
      </label>
    </>
  );
}

type ActionButtonsProps = {
  disabled: boolean;
  onUpload: () => void;
  onClear: () => void;
  uploading: boolean;
};

function ActionButtons({ onUpload, onClear, disabled, uploading }: ActionButtonsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onUpload}
        disabled={disabled}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors ${
          disabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        <Upload size={16} />
        {uploading ? "Uploading..." : "Upload"}
      </button>
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
          disabled ? "text-slate-400 cursor-not-allowed" : "text-slate-600 hover:bg-slate-200 hover:text-slate-800"
        }`}
      >
        <Trash2 size={16} />
        Clear Drafts
      </button>
    </>
  );
}

type FileListProps = {
  files: FileWithProgress[];
  onRemove: (id: string) => void;
  disabled?: boolean;
};

function FileList({ files, onRemove, disabled }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="space-y-2">
        {files.map((file) => (
          <FileItem
            key={file.localId}
            file={file}
            onRemove={onRemove}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

type FileItemProps = {
  file: FileWithProgress;
  onRemove: (id: string) => void;
  disabled?: boolean;
};

function FileItem({ file, onRemove, disabled }: FileItemProps) {
  const Icon = getFileIcon(file.file.type || file.file.name);

  return (
    <div className={`space-y-2 rounded-md border p-3 bg-white ${file.error ? "border-red-200" : "border-slate-200"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <Icon size={24} className={file.error ? "text-red-400" : "text-slate-400"} />
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium text-slate-800 truncate" title={file.file.name}>
              {file.file.name}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>{formatFileSize(file.file.size)}</span>
              {file.uploaded && (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle size={10} /> Uploaded
                </span>
              )}
              {file.error && (
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                  <AlertCircle size={10} /> {file.error}
                </span>
              )}
            </div>
          </div>
        </div>
        {!disabled && (
          <button 
            type="button" 
            onClick={() => onRemove(file.localId)} 
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {!file.uploaded && !file.error && (
        <div className="flex items-center gap-2">
          <ProgressBar progress={file.progress} />
          <span className="text-[10px] text-slate-500 font-medium w-8 text-right">
            {Math.round(file.progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

const getFileIcon = (mimeOrName: string) => {
  const str = mimeOrName.toLowerCase();
  if (str.startsWith("image/") || str.endsWith(".jpg") || str.endsWith(".jpeg") || str.endsWith(".png")) return FileImage;
  if (str.startsWith("video/")) return FileVideo;
  if (str.startsWith("audio/")) return FileAudio;
  if (str === "application/pdf" || str.endsWith(".pdf") || str.endsWith(".doc") || str.endsWith(".docx") || str.endsWith(".txt")) return FileText;
  return FileIcon;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};