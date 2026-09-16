import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  ClassChannel,
  ClassWithMembers,
  CreateClassRequest,
  UpdateClassRequest,
  AssignMemberRequest,
  PaginatedClasses,
  PolicyCheckRequest,
  PolicyCheckResult,
} from "../types/class";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

const PAGE_SIZE = 20;

export const classApi = createApi({
  reducerPath: "classApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Classes", "ClassMembers", "MyClasses"],
  endpoints: (builder) => ({
    getClasses: builder.query<
      PaginatedClasses,
      { page?: number; pageSize?: number; search?: string }
    >({
      query: ({ page = 1, pageSize = PAGE_SIZE, search = "" }) => {
        const params: Record<string, string | number> = { page, pageSize };
        if (search) params.search = search;
        return { url: "classes", params };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Classes" as const, id })),
              { type: "Classes", id: "LIST" },
            ]
          : [{ type: "Classes", id: "LIST" }],
    }),

    getMyClasses: builder.query<ClassChannel[], void>({
      query: () => "classes/my-classes",
      providesTags: [{ type: "MyClasses", id: "LIST" }],
    }),

    getClassById: builder.query<ClassWithMembers, number | string>({
      query: (id) => `classes/${id}`,
      providesTags: (_r, _e, id) => [
        { type: "Classes", id },
        { type: "ClassMembers", id },
      ],
    }),

    createClass: builder.mutation<ClassChannel, CreateClassRequest>({
      query: (body) => ({
        url: "classes",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Classes", id: "LIST" },
        { type: "MyClasses", id: "LIST" },
      ],
    }),

    updateClass: builder.mutation<ClassChannel, UpdateClassRequest>({
      query: ({ id, ...body }) => ({
        url: `classes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Classes", id },
        { type: "Classes", id: "LIST" },
        { type: "MyClasses", id: "LIST" },
      ],
    }),

    deleteClass: builder.mutation<void, number>({
      query: (id) => ({
        url: `classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Classes", id: "LIST" },
        { type: "MyClasses", id: "LIST" },
      ],
    }),

    assignMember: builder.mutation<
      void,
      { classId: number; body: AssignMemberRequest }
    >({
      query: ({ classId, body }) => ({
        url: `classes/${classId}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { classId }) => [
        { type: "ClassMembers", id: classId },
        { type: "Classes", id: classId },
        { type: "Classes", id: "LIST" },
        { type: "MyClasses", id: "LIST" },
      ],
    }),

    removeMember: builder.mutation<void, { classId: number; accountId: string }>({
      query: ({ classId, accountId }) => ({
        url: `classes/${classId}/members/${accountId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { classId }) => [
        { type: "ClassMembers", id: classId },
        { type: "Classes", id: classId },
        { type: "Classes", id: "LIST" },
        { type: "MyClasses", id: "LIST" },
      ],
    }),

    checkPolicy: builder.mutation<PolicyCheckResult, PolicyCheckRequest>({
      query: (body) => ({
        url: "classes/check-policy",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetMyClassesQuery,
  useGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useAssignMemberMutation,
  useRemoveMemberMutation,
  useCheckPolicyMutation,
} = classApi;

export { PAGE_SIZE as CLASS_PAGE_SIZE };