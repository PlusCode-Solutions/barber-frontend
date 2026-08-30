import { Routes, Route } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { userRoutes } from "./userRoutes";
import { tenantAdminRoutes } from "./tenantAdminRoutes";
import { superAdminRoutes } from "./superAdminRoutes";
import NotFoundPage from "../pages/NotFoundPage";

/**
 * Main application router
 * Combines all route modules into a single routing configuration
 */
export default function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            {publicRoutes}

            {/* Super Admin Routes */}
            {superAdminRoutes}

            {/* Tenant Admin Routes */}
            {tenantAdminRoutes}

            {/* User Routes */}
            {userRoutes}

            {/* Catch-all: unmatched client routes render the 404 page */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
