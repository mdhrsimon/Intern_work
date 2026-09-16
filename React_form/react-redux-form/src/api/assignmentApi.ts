import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  Assignment,
  AssignmentSubmission,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  SubmitAssignmentRequest,
  ReturnSubmissionRequest,
} from "../types/assignment";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const assignmentApi = createApi({
  reducerPath: "assignmentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Assignments", "Submissions"],
  endpoints: (builder) => ({
    getAssignmentsByClass: builder.query<Assignment[], number>({
      query: (classId) => `assignments/class/${classId}`,
      providesTags: (result, _error, classId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Assignments" as const, id })),
              { type: "Assignments", id: `CLASS_${classId}` },
            ]
          : [{ type: "Assignments", id: `CLASS_${classId}` }],
    }),

    createAssignment: builder.mutation<Assignment, CreateAssignmentRequest>({
      query: (body) => ({
        url: "assignments",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { classChannelId }) => [
        { type: "Assignments", id: `CLASS_${classChannelId}` },
      ],
    }),

    updateAssignment: builder.mutation<
      { message: string; assignmentId: number },
      UpdateAssignmentRequest
    >({
      query: ({ id, ...body }) => ({
        url: `assignments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Assignments", id },
        { type: "Assignments", id: "LIST" },
      ],
    }),

    deleteAssignment: builder.mutation<void, { id: number; classChannelId: number }>({
      query: ({ id }) => ({
        url: `assignments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { classChannelId }) => [
        { type: "Assignments", id: `CLASS_${classChannelId}` },
      ],
    }),

    submitAssignment: builder.mutation<AssignmentSubmission, SubmitAssignmentRequest>({
      query: ({ assignmentId, submittedText }) => ({
        url: `assignments/${assignmentId}/submit`,
        method: "POST",
        body: { submittedText },
      }),
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: "Assignments", id: assignmentId },
        { type: "Submissions", id: assignmentId },
      ],
    }),

    getSubmissions: builder.query<AssignmentSubmission[], number>({
      query: (assignmentId) => `assignments/${assignmentId}/submissions`,
      providesTags: (_result, _error, assignmentId) => [
        { type: "Submissions", id: assignmentId },
      ],
    }),

    returnSubmission: builder.mutation<
      AssignmentSubmission,
      ReturnSubmissionRequest
    >({
      query: ({ assignmentId, submissionId, grade, feedback }) => ({
        url: `assignments/${assignmentId}/submissions/${submissionId}/return`,
        method: "PUT",
        body: { grade, feedback },
      }),
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: "Assignments", id: assignmentId },
        { type: "Submissions", id: assignmentId },
      ],
    }),

    deleteAssignmentAttachment: builder.mutation<void, { assignmentId: number; fileId: number }>({
      query: ({ assignmentId, fileId }) => ({
        url: `assignments/${assignmentId}/attachments/${fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: "Assignments", id: assignmentId },
      ],
    }),

    deleteSubmissionFile: builder.mutation<void, { assignmentId: number; fileId: number }>({
      query: ({ assignmentId, fileId }) => ({
        url: `assignments/${assignmentId}/submissions/files/${fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: "Assignments", id: assignmentId },
        { type: "Submissions", id: assignmentId },
      ],
    }),
  }),
});

export const {
  useGetAssignmentsByClassQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useSubmitAssignmentMutation,
  useGetSubmissionsQuery,
  useReturnSubmissionMutation,
  useDeleteAssignmentAttachmentMutation,
  useDeleteSubmissionFileMutation,
} = assignmentApi;
