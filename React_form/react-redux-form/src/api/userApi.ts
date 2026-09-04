import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {User, PaginatedUsers } from "../types/user";

const PAGE_SIZE = 5;

export const userApi = createApi({
  reducerPath: "userApi",

  baseQuery: fetchBaseQuery({
  baseUrl: "https://localhost:7028/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("reactform_auth");
    if (token) {
      try {
        const parsed = JSON.parse(token) as { token?: string };
        if (parsed.token) {
          headers.set("Authorization", `Bearer ${parsed.token}`);
        }
      } catch {
        /* ignore */
      }
    }
    return headers;
  },
}),

  tagTypes: ["Users"],

  endpoints: (builder) => ({
    // GET /api/users
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
    // GET /api/users/:id
    getUserById: builder.query<User, number | string>({
      query: (id) => `users/${id}`,
      providesTags:["Users"],
    }),

    getMySubmission: builder.query<User, void>({
      query: () => "users/me",
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

    // PUT /api/Users
    updateUser: builder.mutation<User, User>({
      query: (user) => ({
        url: `users/${user.id}`,
        method: "PUT",
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

    // DELETE /api user/:id
    deleteUser: builder.mutation <void, number | string>({
      query: (id) => ({
        url:`users/${id}`,
        method: "DELETE"

      }),
      invalidatesTags: ["Users"],

    }),

  }),
});

// Automatically generated hooks
export const {
  useGetUsersInfiniteQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useCreateUserMutation,
  useClearUsersMutation,
  useDeleteUserMutation,
  useGetMySubmissionQuery,
} = userApi;

export { PAGE_SIZE };