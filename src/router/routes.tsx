import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";

export const router = createBrowserRouter([
  {
    path: "/:tenantSlug/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/:tenantSlug/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <DashboardHome />,
      },
    ],
  },
]);
