import { Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import TenantAdminLayout from "./components/layout/TenantAdminLayout";

// Auth & Protection
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// User Pages
import DashboardHome from "./pages/dashboard/DashboardHome";

// Shared Feature Pages
import BookingsPage from "./features/bookings/pages/BookingsPage";
import ServicesPage from "./features/services/pages/ServicesPage";
import BarbersPage from "./features/barbers/pages/BarbersPage";
import SchedulesPage from "./features/schedules/pages/SchedulesPage";

// Admin Pages
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import TenantAdminDashboard from "./pages/tenant-admin/TenantAdminDashboard";
import TenantBookingsPage from "./features/bookings/pages/TenantBookingsPage";

// Permissions
import { PERMISSIONS } from "./config/permissions";

export default function App() {
  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route path=":tenantSlug/auth/login" element={<LoginPage />} />
      <Route path=":tenantSlug/auth/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ========== SUPER ADMIN ROUTES ========== */}
      <Route
        path="/admin"
        element={<ProtectedRoute requiredPermissions={[PERMISSIONS.PLATFORM_SETTINGS]} />}
      >
        <Route element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          {/* TODO: Add more super admin routes */}
          {/* <Route path="tenants" element={<TenantsPage />} /> */}
          {/* <Route path="users" element={<UsersPage />} /> */}
          {/* <Route path="billing" element={<BillingPage />} /> */}
          {/* <Route path="settings" element={<PlatformSettingsPage />} /> */}
        </Route>
      </Route>

      {/* ========== TENANT ADMIN ROUTES ========== */}
      <Route
        path=":tenantSlug/admin"
        element={<ProtectedRoute requiredRole="TENANT_ADMIN" />}
      >
        <Route element={<TenantAdminLayout />}>
          <Route path="dashboard" element={<TenantAdminDashboard />} />
          <Route path="bookings" element={<TenantBookingsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="barbers" element={<BarbersPage />} />
          <Route path="schedules" element={<SchedulesPage />} />
          {/* TODO: Add more tenant admin routes */}
          {/* <Route path="customers" element={<CustomersPage />} /> */}
          {/* <Route path="reports" element={<ReportsPage />} /> */}
          {/* <Route path="settings" element={<TenantSettingsPage />} /> */}
        </Route>
      </Route>

      {/* ========== USER ROUTES ========== */}
      <Route
        path=":tenantSlug/dashboard"
        element={<ProtectedRoute requiredPermissions={[PERMISSIONS.BOOKINGS_VIEW_OWN]} />}
      >
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="barbers" element={<BarbersPage />} />
          <Route path="schedules" element={<SchedulesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
