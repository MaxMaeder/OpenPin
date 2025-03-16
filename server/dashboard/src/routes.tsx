import { Navigate, createBrowserRouter } from "react-router-dom";

import DeviceRoute from "./routes/device/index.tsx";
import LoginRoute from "./routes/login/index.tsx";
import NotFoundRoute from "./routes/notfound/index.tsx";
import { ReactNode } from "react";
import { selectIsAuthenticated } from "./state/slices/userSlice.ts";
import { useSelector } from "react-redux";

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <DeviceRoute />
      </AuthGuard>
    ),
  },
  {
    path: "/auth",
    element: <LoginRoute />,
  },
  {
    path: "*",
    element: <NotFoundRoute />,
  },
]);
