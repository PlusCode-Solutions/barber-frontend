import axios from "../../../lib/axios";
import type { User } from "../types";

export const UsersService = {
    // Get tenant users
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

    // Update user
    update: async (
        tenantSlug: string,
        userId: string,
        data: Partial<User>
    ): Promise<User> => {
        const res = await axios.put(`/${tenantSlug}/users/${userId}`, data);
        return res.data;
    },

    // Delete user
    delete: async (tenantSlug: string, userId: string): Promise<void> => {
        await axios.delete(`/${tenantSlug}/users/${userId}`);
    },
};
