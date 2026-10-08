export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5070/api/";

export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20 MB
  MAX_FILES: 10,
  ALLOWED_EXTENSIONS: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".txt", ".zip"] as string[],
};
