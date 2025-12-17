import { Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

/**
 * Public routes - accessible without authentication
 */
export const publicRoutes = (
    <>
        <Route path=":tenantSlug/auth/login" element={<LoginPage />} />
        <Route path=":tenantSlug/auth/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </>
);
