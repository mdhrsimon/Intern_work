import { createApi } from "@reduxjs/toolkit/query/react";
import type { User, PaginatedUsers, CreateUserPayload, UpdateUserPayload } from "../types/user";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

const PAGE_SIZE = 5;
export const STUDENT_DETAILS_PAGE_SIZE = 10;

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Users"],

  endpoints: (builder) => ({
    getUsers: builder.infiniteQuery<PaginatedUsers, void, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
          lastPage.hasMore ? lastPage.page + 1 : undefined,
      },
      query: ({ pageParam }) => ({
        url: "users",
        params: {
          page: pageParam,
          pageSize: PAGE_SIZE,
        },
      }),
      providesTags: [{ type: "Users", id: "LIST" }],
    }),
    getUserById: builder.query<User, number | string>({
      query: (id) => `users/${id}`,
      providesTags: ["Users"],
    }),

    getMySubmission: builder.query<User, void>({
      query: () => "users/me",
      providesTags: ["Users"],
    }),

    getStudentDetails: builder.query<PaginatedUsers, { page: number; pageSize?: number }>(
      {
        query: ({ page, pageSize = STUDENT_DETAILS_PAGE_SIZE }) => ({
          url: "users",
          params: { page, pageSize },
        }),
        providesTags: [{ type: "Users", id: "STUDENT_DETAILS" }],
      }
    ),

    createUser: builder.mutation<User, CreateUserPayload>({
      query: (body) => ({
        url: "users",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation<User, { id: number | string } & UpdateUserPayload>({
      query: ({ id, ...body }) => ({
        url: `users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    updateMySubmission: builder.mutation<User, UpdateUserPayload>({
      query: (body) => ({
        url: "users/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation<void, number | string>({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersInfiniteQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateMySubmissionMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetMySubmissionQuery,
  useGetStudentDetailsQuery,
} = userApi;

export { PAGE_SIZE };
