import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../types/auth";
import { loadAuth, clearAuth, saveAuth } from "../lib/authStorage";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialUser = loadAuth();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<AuthUser>
    ) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
      saveAuth(action.payload);
    },
    logOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      clearAuth();
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setCredentials, logOut, setInitialized } = authSlice.actions;
export default authSlice.reducer;
