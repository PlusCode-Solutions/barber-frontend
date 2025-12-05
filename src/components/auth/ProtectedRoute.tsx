
import { Navigate, Outlet } from 'react-router-dom';
import type { Permission } from '../../config/permissions';
import type { UserRole } from '../../config/roles';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    requiredRole?: UserRole;
    /**
     * User must have ALL of these permissions (AND logic)
     */
    requiredPermissions?: Permission[];
    /**
     * User must have AT LEAST ONE of these permissions (OR logic)
     */
    requiredAnyPermission?: Permission[];
}

/**
 * Protected Route component that checks authentication and permissions
 * 
 * Uses usePermissions hook for consistent logic across the app.
 * 
 * @example
 * <ProtectedRoute requiredRole="SUPER_ADMIN">
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * @example
 * <ProtectedRoute requiredPermissions={[PERMISSIONS.BOOKINGS_DELETE]}>
 *   <DeleteButton />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
    requiredRole,
    requiredPermissions,
    requiredAnyPermission
}: ProtectedRouteProps) {
    // Use AuthContext for reactive authentication state
    const { user, isAuthenticated, isLoading } = useAuth();

    // Initialize hook to access consistent permission logic
    const { isRole, canAll, canAny } = usePermissions();

    if (isLoading) {
        return null; // Or a spinner
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // 1. Check Role Match
    if (requiredRole && !isRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 2. Check Required Permissions (AND Logic)
    if (requiredPermissions && requiredPermissions.length > 0) {
        if (!canAll(requiredPermissions)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // 3. Check Any Permission (OR Logic)
    if (requiredAnyPermission && requiredAnyPermission.length > 0) {
        if (!canAny(requiredAnyPermission)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <Outlet />;
}
