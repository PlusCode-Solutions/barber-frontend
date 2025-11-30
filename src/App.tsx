import { Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import RegisterPage from "./features/auth/pages/RegisterPage";

export default function App() {
  return (
    <Routes>
      <Route path=":tenantSlug/auth/login" element={<LoginPage />} />
      <Route path=":tenantSlug/auth/register" element={<RegisterPage />} />
      <Route path=":tenantSlug/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
      </Route>
    </Routes>
  );
}
