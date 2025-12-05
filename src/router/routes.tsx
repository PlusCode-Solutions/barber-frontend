import { Routes, Route } from "react-router-dom";
import TenantRoute from "./TenantRoute";

import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";

import BookingsPage from "../features/bookings/pages/BookingsPage";
import TenantAdminLayout from "../components/layout/TenantAdminLayout";
import TenantAdminDashboard from "../pages/tenant-admin/TenantAdminDashboard";
import TenantBookingsPage from "../features/bookings/pages/TenantBookingsPage";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Rutas protegidas */}
      <Route element={<TenantRoute />}>

        {/* User Dashboard */}
        <Route path=":tenantSlug/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="bookings" element={<BookingsPage />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path=":tenantSlug/admin" element={<TenantAdminLayout />}>
          <Route path="dashboard" element={<TenantAdminDashboard />} />
          <Route path="bookings" element={<TenantBookingsPage />} />
          {/* Add other admin routes here later */}
        </Route>

      </Route>

    </Routes>
  );
}
