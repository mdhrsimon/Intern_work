/**
 * Extracts a user-friendly error message from an unknown API error object.
 * Handles RTK FetchBaseQueryError, SerializedError, Axios errors, and standard JS Errors.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred."
): string {
  if (!error) return fallbackMessage;

  // Handle Axios-like error or RTK FetchBaseQueryError where error data is attached
  const errObj = error as {
    response?: {
      data?: {
        message?: string;
        errors?: string[] | Record<string, string[]>;
        title?: string;
      };
    };
    data?: {
      message?: string;
      errors?: string[] | Record<string, string[]>;
      title?: string;
    };
    error?: string;
    message?: string;
  };

  const data = errObj?.response?.data ?? errObj?.data;

  if (data) {
    if (typeof data === "string" && (data as string).trim()) {
      return (data as string).trim();
    }
    if (typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message.trim();
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.filter(Boolean).join(", ");
      }
      if (data.errors && typeof data.errors === "object") {
        const errorValues = Object.values(data.errors).flat().filter(Boolean);
        if (errorValues.length > 0) {
          return errorValues.join(", ");
        }
      }
      if (typeof data.title === "string" && data.title.trim()) {
        return data.title.trim();
      }
    }
  }

  // Handle RTK FetchBaseQueryError with `error` string property (e.g. FETCH_ERROR)
  if (typeof errObj?.error === "string" && errObj.error.trim()) {
    return errObj.error.trim();
  }

  // Handle standard Error or SerializedError with `message`
  if (typeof errObj?.message === "string" && errObj.message.trim()) {
    return errObj.message.trim();
  }

  return fallbackMessage;
}
