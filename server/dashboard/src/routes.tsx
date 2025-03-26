import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";

import DeviceRoute from "./routes/device/index.tsx";
import LoginRoute from "./routes/auth/login.tsx";
import ResetRoute from "./routes/auth/reset.tsx";
import SignupRoute from "./routes/auth/signup.tsx";
import NotFoundRoute from "./routes/notfound/index.tsx";
import { auth } from "./comm/firebase.ts";
import { useAuthState } from "react-firebase-hooks/auth";

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
      { index: true, element: <DeviceRoute /> },
    ]
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
