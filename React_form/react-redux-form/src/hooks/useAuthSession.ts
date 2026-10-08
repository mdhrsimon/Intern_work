import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useMeQuery } from "../api/authApi";
import { setCredentials, logOut, setInitialized } from "../redux/authSlice";
import { parseRole } from "../lib/permissions";
import type { Role } from "../types/auth";

export function useAuthSession() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  // Call /Auth/me on mount to verify the session.
  // Skip if we already know the user is logged out.
  const { data, isError, isLoading, isFetching } = useMeQuery(undefined, {
    skip: authState.isInitialized && !authState.isAuthenticated,
  });

  useEffect(() => {
    if (data) {
      const role = parseRole(data.role);
      if (role) {
        dispatch(setCredentials({ email: data.email, fullName: data.fullName, role }));
      }
    } else if (isError) {
      // /me failed even after a refresh attempt → user is truly logged out
      dispatch(logOut());
    }

    if (!isLoading && !isFetching) {
      dispatch(setInitialized(true));
    }
  }, [data, isError, isLoading, isFetching, dispatch]);

  const user = authState.user;
  const role: Role = user?.role ? parseRole(user.role) : null;

  return {
    loggedIn: authState.isAuthenticated && !!role,
    role,
    email: user?.email ?? null,
    fullName: user?.fullName ?? null,
    isChecking: !authState.isInitialized && (isLoading || isFetching),
  };
}

export default useAuthSession;
