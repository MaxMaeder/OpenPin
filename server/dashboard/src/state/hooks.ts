import { useCallback, useEffect } from "react";
import type { AppDispatch, RootState } from "./store";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  fetchCurrentUser,
  login,
  logout,
  resetPassword,
  signup,
} from "./slices/authSlice";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (status === "idle") dispatch(fetchCurrentUser());
  }, [status, dispatch]);

  const doLogin = useCallback(
    (email: string, password: string) => dispatch(login({ email, password })),
    [dispatch]
  );

  const doSignup = useCallback(
    (email: string, password: string) => dispatch(signup({ email, password })),
    [dispatch]
  );

  const doReset = useCallback((email: string) => dispatch(resetPassword({ email })), [dispatch]);

  const doLogout = useCallback(() => dispatch(logout()), [dispatch]);

  const doClearError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    user,
    authenticated: !!user,
    status,
    error,
    login: doLogin,
    signup: doSignup,
    logout: doLogout,
    resetPassword: doReset,
    clearError: doClearError,
  } as const;
};

export const useRequireAuth = () => {
  const { authenticated, status } = useAuth();
  return { ready: status !== "loading" && status !== "idle", authenticated } as const;
};
