import { PERMISSIONS, type Permission } from './permissions';

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'USER';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    // ========== SUPER ADMIN ==========
    // Has ALL system permissions
    SUPER_ADMIN: Object.values(PERMISSIONS),

    // ========== TENANT ADMIN ==========
    // Manages everything within their tenant
    TENANT_ADMIN: [
        // Bookings
        PERMISSIONS.BOOKINGS_VIEW_ALL,
        PERMISSIONS.BOOKINGS_CREATE,
        PERMISSIONS.BOOKINGS_UPDATE,
        PERMISSIONS.BOOKINGS_DELETE,

        // Services
        PERMISSIONS.SERVICES_VIEW,
        PERMISSIONS.SERVICES_MANAGE,

        // Barbers
        PERMISSIONS.BARBERS_VIEW,
        PERMISSIONS.BARBERS_MANAGE,

        // Schedules
        PERMISSIONS.SCHEDULES_VIEW,
        PERMISSIONS.SCHEDULES_MANAGE,

        // Customers
        PERMISSIONS.CUSTOMERS_VIEW,
        PERMISSIONS.CUSTOMERS_MANAGE,

        // Analytics
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.ANALYTICS_ADVANCED,
    ],

    // ========== USER ==========
    // Regular customer permissions
    USER: [
        PERMISSIONS.BOOKINGS_VIEW_OWN,
        PERMISSIONS.BOOKINGS_CREATE,
        PERMISSIONS.BOOKINGS_UPDATE, // Can update own bookings
        PERMISSIONS.BOOKINGS_DELETE, // Can cancel (delete) own bookings

        // Read-only access to resources needed for booking
        PERMISSIONS.SERVICES_VIEW,
        PERMISSIONS.BARBERS_VIEW,
        PERMISSIONS.SCHEDULES_VIEW,
    ]
};

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Get all permissions for a role
 * If role is not recognized, defaults to USER permissions for safety
 */
export function getRolePermissions(role: UserRole | string): Permission[] {
    if (role in ROLE_PERMISSIONS) {
        return ROLE_PERMISSIONS[role as UserRole];
    }
    return ROLE_PERMISSIONS.USER;
}
