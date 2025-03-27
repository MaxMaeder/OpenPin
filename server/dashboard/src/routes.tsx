import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";

import LoginRoute from "./routes/auth/Login.tsx";
import ResetRoute from "./routes/auth/Reset.tsx";
import SignupRoute from "./routes/auth/Signup.tsx";
import NotFoundRoute from "./routes/NotFound/index.tsx";
import { auth } from "./comm/firebase.ts";
import { useAuthState } from "react-firebase-hooks/auth";
import PageLayout from "./routes/Device/PageLayout/index.tsx";
import SelectDeviceRoute from "./routes/SelectDevice/index.tsx";

const AuthGuard = () => {
  const [user] = useAuthState(auth);

  return user ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

const GuestGuard = () => {
  const [user] = useAuthState(auth);

  return (!user) ? <Outlet /> : <Navigate to="/" replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthGuard />,
    children: [
      { index: true, element: <SelectDeviceRoute /> },
      {
        path: ":deviceId/:tab",
        element: <PageLayout />,
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
      { path: "signup", element: <SignupRoute /> },
      { path: "reset", element: <ResetRoute /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundRoute />,
  },
]);
