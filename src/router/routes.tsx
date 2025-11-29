import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/:tenantSlug/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/:tenantSlug/dashboard",
    element: <h1>Dashboard</h1>,
  },
]);
