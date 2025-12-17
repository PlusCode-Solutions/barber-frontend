import type { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import type { Permission } from '../../config/permissions';

interface CanProps {
    permission: Permission | Permission[];
    /**
     * Logic to use when multiple permissions are provided:
     * - 'any': User needs at least one (OR) - Default
     * - 'all': User needs all permissions (AND)
     */
    match?: 'any' | 'all';
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Conditional rendering component based on permissions
 * 
 * @example
 * <Can permission={PERMISSIONS.BOOKINGS_DELETE}>
 *   <DeleteButton />
 * </Can>
 * 
 * @example
 * <Can permission={[PERMISSIONS.A, PERMISSIONS.B]} match="all">
 *   <SensitiveFeature />
 * </Can>
 */
export function Can({ permission, match = 'any', children, fallback = null }: CanProps) {
    const { can, canAny, canAll } = usePermissions();

    let hasPermission = false;

    if (Array.isArray(permission)) {
        hasPermission = match === 'all'
            ? canAll(permission)
            : canAny(permission);
    } else {
        hasPermission = can(permission);
    }

    return hasPermission ? <>{children}</> : <>{fallback}</>;
}
