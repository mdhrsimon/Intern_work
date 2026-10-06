import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import type {
  NotificationItem,
  PagedNotifications,
  UnreadCountResponse,
} from "../types/notification";

export interface GetNotificationsParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<PagedNotifications, GetNotificationsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
        if (params?.unreadOnly !== undefined)
          queryParams.append("unreadOnly", params.unreadOnly.toString());

        const queryStr = queryParams.toString();
        return `notifications${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Notifications" as const, id })),
              { type: "Notifications", id: "LIST" },
            ]
          : [{ type: "Notifications", id: "LIST" }],
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => "notifications/unread-count",
      providesTags: [{ type: "UnreadCount", id: "COUNT" }],
    }),

    markAsRead: builder.mutation<NotificationItem, number>({
      query: (id) => ({
        url: `notifications/${id}/read`,
        method: "PATCH",
      }),
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        // Optimistic update for unread count
        const patchUnread = dispatch(
          notificationApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
            if (draft.unreadCount > 0) {
              draft.unreadCount -= 1;
            }
          })
        );

        try {
          await queryFulfilled;
          // Invalidate or update list caches
          dispatch(
            notificationApi.util.invalidateTags([
              { type: "Notifications", id: "LIST" },
              { type: "UnreadCount", id: "COUNT" },
            ])
          );
        } catch {
          patchUnread.undo();
        }
      },
    }),

    markAllAsRead: builder.mutation<{ message: string; markedCount: number }, void>({
      query: () => ({
        url: "notifications/read-all",
        method: "PATCH",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchUnread = dispatch(
          notificationApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
            draft.unreadCount = 0;
          })
        );

        try {
          await queryFulfilled;
          dispatch(
            notificationApi.util.invalidateTags([
              { type: "Notifications", id: "LIST" },
              { type: "UnreadCount", id: "COUNT" },
            ])
          );
        } catch {
          patchUnread.undo();
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
