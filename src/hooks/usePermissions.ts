import type { Permission } from '../config/permissions';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for checking user permissions
 * 
 * Uses AuthContext for state management (Memory) instead of localStorage (Disk).
 * 10/10 Performance & Reactivity.
 */
export function usePermissions() {
    // Access context state
    const { user, permissions } = useAuth();

    // permissions are already resolved in AuthProvider
    const userPermissions = permissions;


    /**
     * Check if user has a specific permission
     */
    const can = (permission: Permission): boolean => {
        return userPermissions.includes(permission);
    };

    /**
     * Check if user has ANY of the specified permissions
     */
    const canAny = (permissions: Permission[]): boolean => {
        return permissions.some(permission => can(permission));
    };

    /**
     * Check if user has ALL of the specified permissions
     */
    const canAll = (permissions: Permission[]): boolean => {
        return permissions.every(permission => can(permission));
    };

    /**
     * Check if user has a specific role
     */
    const isRole = (role: string): boolean => {
        if (!user) return false;
        return user.role === role;
    };

    return { can, canAny, canAll, isRole };
}
