
import { Navigate, Outlet } from 'react-router-dom';
import type { Permission } from '../../config/permissions';
import type { UserRole } from '../../config/roles';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    requiredRole?: UserRole;
    allowedRoles?: UserRole[];
    requiredPermissions?: Permission[];
    requiredAnyPermission?: Permission[];
    children?: React.ReactNode;
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
    allowedRoles,
    requiredPermissions,
    requiredAnyPermission,
    children
}: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { isRole, canAll, canAny } = usePermissions();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.some(role => isRole(role))) {
            return <Navigate to="/unauthorized" replace />;
        }
    } else if (requiredRole && !isRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
        if (!canAll(requiredPermissions)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    if (requiredAnyPermission && requiredAnyPermission.length > 0) {
        if (!canAny(requiredAnyPermission)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
}
