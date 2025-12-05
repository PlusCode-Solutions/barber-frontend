import type { Permission } from '../config/permissions';
import { ROLE_PERMISSIONS, type UserRole } from '../config/roles';


// Interface representing the minimal user structure required for RBAC operations.
export interface RBACUser {
    role?: string;
    permissions?: Permission[];
    [key: string]: any;
}

// Function to resolve the final list of permissions for a given user.
export function resolveUserPermissions(user: RBACUser | null): Permission[] {
    if (!user) return [];

    if (user.permissions?.length) {
        return user.permissions;
    }

    if (user.role && user.role in ROLE_PERMISSIONS) {
        return ROLE_PERMISSIONS[user.role as UserRole];
    }

    return [];
}

// Function to synchronize resolved permissions back to local storage for persistence.
export function syncPermissionsToStorage(user: RBACUser, permissions: Permission[]): void {
    const hasNoExplicitPermissions = !user.permissions || user.permissions.length === 0;
    const hasResolvedPermissions = permissions.length > 0;

    if (hasNoExplicitPermissions && hasResolvedPermissions) {
        const updatedUser = { ...user, permissions };
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }
}
