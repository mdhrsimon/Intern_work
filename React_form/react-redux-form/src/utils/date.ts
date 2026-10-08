export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
};

export const formatDateShort = (dateInput?: string | Date | null): string => {
  if (!dateInput) return "";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return typeof dateInput === "string" ? dateInput : "";
  }
};

export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
};
