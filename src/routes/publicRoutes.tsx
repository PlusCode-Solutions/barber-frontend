import { Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import AdminLoginPage from "../features/admin/auth/pages/AdminLoginPage";

/**
 * Public routes - accessible without authentication
 */
export const publicRoutes = (
    <>
        <Route path=":tenantSlug/auth/login" element={<LoginPage />} />
        <Route path=":tenantSlug/auth/register" element={<RegisterPage />} />
        <Route path=":tenantSlug/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path=":tenantSlug/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Super Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        {/* Redirect generic login to admin login for now or handle appropriately */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />

        {/* Main Entry Point - Redirect to Admin for Super Admin focus */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </>
);
