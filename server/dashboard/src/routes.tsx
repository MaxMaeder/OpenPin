import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";

import LoginRoute from "./routes/auth/login.tsx";
import ResetRoute from "./routes/auth/reset.tsx";
import SignupRoute from "./routes/auth/signup.tsx";
import NotFoundRoute from "./routes/notfound/index.tsx";
import { auth } from "./comm/firebase.ts";
import { useAuthState } from "react-firebase-hooks/auth";
import PageLayout from "./routes/device/PageLayout/index.tsx";
import Overview from "./routes/device/tabs/Overview.tsx";
import Captures from "./routes/device/tabs/Captures.tsx";
import Notes from "./routes/device/tabs/Notes.tsx";
import Messages from "./routes/device/tabs/Messages.tsx";
import Settings from "./routes/device/tabs/Settings.tsx";

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
      { index: true, element: <Navigate to="/devices/overview" replace /> },
      {
        path: "devices",
        element: <PageLayout />,
        children: [
          { index: true, element: <Navigate to="/devices/overview" replace /> },
          { path: "overview", element: <Overview /> },
          { path: "captures", element: <Captures /> },
          { path: "notes", element: <Notes /> },
          { path: "messages", element: <Messages /> },
          { path: "settings", element: <Settings /> },
        ],
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
