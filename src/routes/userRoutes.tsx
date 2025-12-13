import { Route } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import BookingsPage from "../features/bookings/pages/BookingsPage";
import ServicesPage from "../features/services/pages/ServicesPage";
import BarbersPage from "../features/barbers/pages/BarbersPage";
import SchedulesPage from "../features/schedules/pages/SchedulesPage";
import { PERMISSIONS } from "../config/permissions";

/**
 * User routes - regular customer dashboard
 */
export const userRoutes = (
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
);
