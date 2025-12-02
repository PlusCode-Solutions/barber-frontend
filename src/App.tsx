import { Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";

import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";

import BookingsPage from "./features/bookings/pages/BookingsPage";

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path=":tenantSlug/auth/login" element={<LoginPage />} />
      <Route path=":tenantSlug/auth/register" element={<RegisterPage />} />

      {/* Dashboard */}
      <Route path=":tenantSlug/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />

        {/* AQUÍ FALTABA ESTA RUTA */}
        <Route path="bookings" element={<BookingsPage />} />
      </Route>
    </Routes>
  );
}
