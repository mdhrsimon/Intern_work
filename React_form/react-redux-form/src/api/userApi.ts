import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User } from "../types/user";

export const userApi = createApi({
  reducerPath: "userApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://localhost:7028/api/",
  }),

  tagTypes: ["Users"],

  endpoints: (builder) => ({
    // GET /api/users
    getUsers: builder.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),

    // POST /api/users
    createUser: builder.mutation<User, User>({
      query: (user) => ({
        url: "users",
        method: "POST",
        body: user,
      }),

      invalidatesTags: ["Users"],
    }),

    // DELETE /api/users
    clearUsers: builder.mutation<void, void>({
      query: () => ({
        url: "users",
        method: "DELETE",
      }),

      invalidatesTags: ["Users"],
    }),
  }),
});

// Automatically generated hooks
export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useClearUsersMutation,
} = userApi;