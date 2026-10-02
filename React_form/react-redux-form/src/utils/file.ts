import {
  FileAudio,
  FileIcon,
  FileImage,
  FileText,
  FileVideo,
} from "lucide-react";
import { API_BASE_URL } from "../constants/api";

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileIcon = (mimeOrName: string) => {
  const str = mimeOrName.toLowerCase();
  if (
    str.startsWith("image/") ||
    str.endsWith(".jpg") ||
    str.endsWith(".jpeg") ||
    str.endsWith(".png")
  ) {
    return FileImage;
  }
  if (str.startsWith("video/")) return FileVideo;
  if (str.startsWith("audio/")) return FileAudio;
  if (
    str === "application/pdf" ||
    str.endsWith(".pdf") ||
    str.endsWith(".doc") ||
    str.endsWith(".docx") ||
    str.endsWith(".txt")
  ) {
    return FileText;
  }
  return FileIcon;
};

export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("File download error:", error);
    alert("Failed to download file");
  }
};

export const getAttachmentDownloadUrl = (assignmentId: number, fileId: number): string => {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${base}assignments/${assignmentId}/attachments/${fileId}/download`;
};

export const getSubmissionFileDownloadUrl = (
  assignmentId: number,
  submissionId: number,
  fileId: number
): string => {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${base}assignments/${assignmentId}/submissions/${submissionId}/files/${fileId}/download`;
};
