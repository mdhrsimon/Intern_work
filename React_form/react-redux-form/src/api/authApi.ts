import { createApi } from "@reduxjs/toolkit/query/react";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "Auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "Auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "Auth/refresh",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "Auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.resetApiState());
        } catch {
          // ignore
        }
      },
    }),
    me: builder.query<AuthResponse, void>({
      query: () => "Auth/me",
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useMeQuery,
  useLazyMeQuery,
} = authApi;
