import { Route } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import TenantAdminLayout from "../components/layout/TenantAdminLayout";
import TenantAdminDashboard from "../pages/tenant-admin/TenantAdminDashboard";
import TenantBookingsPage from "../features/bookings/pages/TenantBookingsPage";
import TenantCustomersPage from "../features/users/pages/TenantCustomersPage";
import ServicesPage from "../features/services/pages/ServicesPage";
import BarbersPage from "../features/barbers/pages/BarbersPage";
import SchedulesPage from "../features/schedules/pages/SchedulesPage";

/**
 * Tenant Admin routes - business owner/manager dashboard
 */
export const tenantAdminRoutes = (
    <Route
        path=":tenantSlug/admin"
        element={<ProtectedRoute requiredRole="TENANT_ADMIN" />}
    >
        <Route element={<TenantAdminLayout />}>
            <Route path="dashboard" element={<TenantAdminDashboard />} />
            <Route path="bookings" element={<TenantBookingsPage />} />
            <Route path="customers" element={<TenantCustomersPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="barbers" element={<BarbersPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
        </Route>
    </Route>
);
