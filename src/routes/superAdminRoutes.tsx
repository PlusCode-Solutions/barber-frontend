import { Route } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import SuperAdminLayout from "../components/layout/SuperAdminLayout";
import SuperAdminDashboard from "../pages/super-admin/SuperAdminDashboard";
import { PERMISSIONS } from "../config/permissions";

/**
 * Super Admin routes - platform administration
 */
export const superAdminRoutes = (
    <Route
        path="/admin"
        element={<ProtectedRoute requiredPermissions={[PERMISSIONS.PLATFORM_SETTINGS]} />}
    >
        <Route element={<SuperAdminLayout />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            {/* Future super admin routes can be added here */}
            {/* <Route path="tenants" element={<TenantsPage />} /> */}
            {/* <Route path="users" element={<UsersPage />} /> */}
            {/* <Route path="billing" element={<BillingPage />} /> */}
            {/* <Route path="settings" element={<PlatformSettingsPage />} /> */}
        </Route>
    </Route>
);
