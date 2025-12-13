import axios from "../../../lib/axios";
import type { User } from "../types";

/**
 * Users API Service
 * Handles all API calls related to user management
 */
export const UsersService = {
    /**
     * Get all users/customers for a tenant
     */
    getTenantUsers: async (tenantSlug: string): Promise<User[]> => {
        const res = await axios.get(`/${tenantSlug}/users`);

        if (Array.isArray(res.data)) {
            return res.data;
        }

        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }

        return [];
    },

    /**
     * Update a user
     */
    update: async (
        tenantSlug: string,
        userId: string,
        data: Partial<User>
    ): Promise<User> => {
        const res = await axios.put(`/${tenantSlug}/users/${userId}`, data);
        return res.data;
    },

    /**
     * Delete a user
     */
    delete: async (tenantSlug: string, userId: string): Promise<void> => {
        await axios.delete(`/${tenantSlug}/users/${userId}`);
    },
};
