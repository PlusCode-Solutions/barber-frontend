/**
 * Centralized permission definitions
 * 
 * NAMING CONVENTION:
 * - RESOURCE_ACTION: Basic action
 * - RESOURCE_ACTION_SCOPE: Action with specific scope (OWN/ALL)
 */
export const PERMISSIONS = {
    // ========== BOOKINGS ==========
    BOOKINGS_VIEW_OWN: 'bookings.view.own',   // View own bookings (User)
    BOOKINGS_VIEW_ALL: 'bookings.view_all',   // View all tenant bookings (Admin)
    BOOKINGS_CREATE: 'bookings.create',
    BOOKINGS_UPDATE: 'bookings.update',
    BOOKINGS_DELETE: 'bookings.delete',

    // ========== SERVICES ==========
    SERVICES_VIEW: 'services.view',
    SERVICES_MANAGE: 'services.manage', // Create, Update, Delete

    // ========== BARBERS ==========
    BARBERS_VIEW: 'barbers.view',
    BARBERS_MANAGE: 'barbers.manage',

    // ========== SCHEDULES ==========
    SCHEDULES_VIEW: 'schedules.view',
    SCHEDULES_MANAGE: 'schedules.manage',

    // ========== CUSTOMERS ==========
    CUSTOMERS_VIEW: 'customers.view',
    CUSTOMERS_MANAGE: 'customers.manage',

    // ========== ANALYTICS ==========
    ANALYTICS_VIEW: 'analytics.view',
    ANALYTICS_ADVANCED: 'analytics.advanced',

    // ========== TENANTS (Super Admin only) ==========
    TENANTS_VIEW: 'tenants.view',
    TENANTS_MANAGE: 'tenants.manage',

    // ========== PLATFORM (Super Admin only) ==========
    PLATFORM_SETTINGS: 'platform.settings',
    PLATFORM_BILLING: 'platform.billing',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
