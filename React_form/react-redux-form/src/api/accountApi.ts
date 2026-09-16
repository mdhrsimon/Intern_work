import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  AccountUser,
  PaginatedAccounts,
  CreateAccountRequest,
  UpdateAccountRequest,
  ChangeRoleRequest,
  AccountRole,
} from "../types/account";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

const PAGE_SIZE = 10;

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Accounts"],
  endpoints: (builder) => ({
    getAccounts: builder.query<
      PaginatedAccounts,
      {
        page?: number;
        pageSize?: number;
        search?: string;
        role?: AccountRole | "";
        active?: boolean | "";
      }
    >({
      query: ({ page = 1, pageSize = PAGE_SIZE, search = "", role = "", active = "" }) => {
        const params: Record<string, string | number | boolean> = {
          page,
          pageSize,
        };
        if (search) params.search = search;
        if (role) params.role = role;
        if (active !== "") params.isActive = active;
        return {
          url: "accounts",
          params,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Accounts" as const, id })),
              { type: "Accounts", id: "LIST" },
            ]
          : [{ type: "Accounts", id: "LIST" }],
    }),

    getAccountById: builder.query<AccountUser, string>({
      query: (id) => `accounts/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Accounts", id }],
    }),

    createAccount: builder.mutation<AccountUser, CreateAccountRequest>({
      query: (body) => ({
        url: "accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Accounts", id: "LIST" }],
    }),

    updateAccount: builder.mutation<AccountUser, UpdateAccountRequest>({
      query: ({ id, ...body }) => ({
        url: `accounts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Accounts", id },
        { type: "Accounts", id: "LIST" },
      ],
    }),

    changeRole: builder.mutation<AccountUser, ChangeRoleRequest>({
      query: ({ id, role }) => ({
        url: `accounts/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Accounts", id },
        { type: "Accounts", id: "LIST" },
      ],
    }),

    toggleActive: builder.mutation<AccountUser, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `accounts/${id}/active`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Accounts", id },
        { type: "Accounts", id: "LIST" },
      ],
    }),

    deleteAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Accounts", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useChangeRoleMutation,
  useToggleActiveMutation,
  useDeleteAccountMutation,
} = accountApi;

export { PAGE_SIZE as ACCOUNT_PAGE_SIZE };