import { Routes, Route } from "react-router-dom";
import TenantRoute from "./TenantRoute";

import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";

import BookingsPage from "../features/bookings/pages/BookingsPage";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Rutas protegidas */}
      <Route element={<TenantRoute />}>

        {/* Dashboard */}
        <Route path=":tenantSlug/dashboard" element={<DashboardLayout />}>

          {/* Inicio */}
          <Route index element={<DashboardHome />} />

          {/* Citas */}
          <Route path="bookings" element={<BookingsPage />} />

        </Route>

      </Route>

    </Routes>
  );
}
