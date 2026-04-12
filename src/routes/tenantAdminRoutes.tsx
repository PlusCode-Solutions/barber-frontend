import { Route } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import TenantAdminLayout from "../components/layout/TenantAdminLayout";
import TenantAdminDashboard from "../pages/tenant-admin/TenantAdminDashboard";
import TenantBookingsPage from "../features/bookings/pages/TenantBookingsPage";
import TenantCustomersPage from "../features/users/pages/TenantCustomersPage";
import ServicesPage from "../features/services/pages/ServicesPage";
import ProfessionalsPage from "../features/professionals/pages/ProfessionalsPage";
import SchedulesPage from "../features/schedules/pages/SchedulesPage";
import TenantSettings from "../features/tenants/pages/TenantSettings";
import StatisticsPage from "../features/bookings/pages/StatisticsPage";

/**
 * Tenant Admin routes - business owner/manager dashboard
 */
export const tenantAdminRoutes = (
    <Route
        path=":tenantSlug/admin"
        element={<ProtectedRoute allowedRoles={['TENANT_ADMIN', 'PROFESSIONAL']} />}
    >
        <Route element={<TenantAdminLayout />}>
            <Route path="dashboard" element={<ProtectedRoute requiredRole="TENANT_ADMIN"><TenantAdminDashboard /></ProtectedRoute>} />
            <Route path="bookings" element={<TenantBookingsPage />} />
            <Route path="customers" element={<ProtectedRoute requiredRole="TENANT_ADMIN"><TenantCustomersPage /></ProtectedRoute>} />
            <Route path="services" element={<ProtectedRoute requiredRole="TENANT_ADMIN"><ServicesPage /></ProtectedRoute>} />
            <Route path="professionals" element={<ProtectedRoute requiredRole="TENANT_ADMIN"><ProfessionalsPage /></ProtectedRoute>} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="statistics" element={<ProtectedRoute requiredRole="TENANT_ADMIN"><StatisticsPage /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute requiredRole="TENANT_ADMIN"><TenantSettings /></ProtectedRoute>} />
        </Route>
    </Route>
);
