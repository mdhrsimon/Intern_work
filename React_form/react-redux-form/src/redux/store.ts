import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";
import { authApi } from "../api/authApi";
import { accountApi } from "../api/accountApi";
import { classApi } from "../api/classApi";
import { assignmentApi } from "../api/assignmentApi";
import { notificationApi } from "../api/notificationApi";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [userApi.reducerPath]: userApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [classApi.reducerPath]: classApi.reducer,
    [assignmentApi.reducerPath]: assignmentApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(authApi.middleware)
      .concat(accountApi.middleware)
      .concat(classApi.middleware)
      .concat(assignmentApi.middleware)
      .concat(notificationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;