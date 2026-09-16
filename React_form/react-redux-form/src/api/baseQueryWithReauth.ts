import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { setCredentials, logOut } from "../redux/authSlice";
import type { AuthResponse } from "../types/auth";
import { parseRole } from "../lib/permissions";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5070/api/",
  credentials: "include",
});

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const url = typeof args === "string" ? args : args.url;
    // Don't try refreshing if the failed request was login, register, logout, me, or refresh itself
    if (
      url.includes("Auth/login") ||
      url.includes("Auth/refresh") ||
      url.includes("Auth/register") ||
      url.includes("Auth/logout")
    ) {
      return result;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const refreshResult = await rawBaseQuery(
            { url: "Auth/refresh", method: "POST" },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const data = refreshResult.data as AuthResponse;
            const role = parseRole(data.role);
            if (role) {
              api.dispatch(
                setCredentials({
                  email: data.email,
                  fullName: data.fullName,
                  role,
                })
              );
              return true;
            }
          }
          api.dispatch(logOut());
          return false;
        } catch {
          api.dispatch(logOut());
          return false;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();
    }

    const refreshSuccess = await refreshPromise;
    if (refreshSuccess) {
      // Retry the original query
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
