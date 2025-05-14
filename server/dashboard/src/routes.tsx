import { Navigate, Outlet, createBrowserRouter, useLocation } from "react-router-dom";

import LoginRoute from "./routes/auth/Login.tsx";
import ResetRoute from "./routes/auth/Reset.tsx";
import SignupRoute from "./routes/auth/Signup.tsx";
import NotFoundRoute from "./routes/NotFound/index.tsx";
import DeviceRoute from "./routes/Device/index.tsx";
import SelectDeviceRoute from "./routes/SelectDevice/index.tsx";
import { Loader } from "@mantine/core";
import ModalsLayout from "./layouts/ModalsLayout.tsx";
import { useRequireAuth } from "./state/hooks.ts";

const AuthGuard = () => {
  const { ready, authenticated } = useRequireAuth();
  const location = useLocation();

  if (!ready) return <Loader />

  const redirectTo = `/auth/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`;

  return authenticated ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

const GuestGuard = () => {
  const { ready, authenticated } = useRequireAuth();
  const location = useLocation();

  if (!ready) return <Loader />

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirectTo") || "/";

  return !authenticated ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

const simpleAuth = import.meta.env.DASH_SIMPLE_AUTH;

export const router = createBrowserRouter([
  {
    element: <ModalsLayout />,
    children: [
      {
        path: "/",
        element: <AuthGuard />,
        children: [
          { index: true, element: <SelectDeviceRoute /> },
          {
            path: ":deviceId/:tab",
            element: <DeviceRoute />,
          },
          // If only :deviceId is provided, redirect to default tab.
          {
            path: ":deviceId",
            element: <Navigate to="overview" replace />,
          },
        ],
      },
      {
        path: "/auth",
        element: <GuestGuard />,
        children: [
          { index: true, element: <Navigate to="/auth/login" replace /> },
          { path: "login", element: <LoginRoute /> },
          ...(!simpleAuth
            ? [
              { path: "signup", element: <SignupRoute /> },
              { path: "reset", element: <ResetRoute /> },
            ]
            : []),
        ],
      },
      {
        path: "*",
        element: <NotFoundRoute />,
      },
    ]
  }
]);
