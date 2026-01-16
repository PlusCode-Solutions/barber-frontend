import { Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import AdminLoginPage from "../features/admin/auth/pages/AdminLoginPage";

/**
 * Public routes - accessible without authentication
 */
export const publicRoutes = (
    <>
        <Route path=":tenantSlug/auth/login" element={<LoginPage />} />
        <Route path=":tenantSlug/auth/register" element={<RegisterPage />} />

        {/* Super Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        {/* Redirect generic login to admin login for now or handle appropriately */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />

        {/* Main Entry Point - Redirect to Admin for Super Admin focus */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </>
);
