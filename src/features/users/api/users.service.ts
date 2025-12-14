import axios from "../../../lib/axios";
import type { User } from "../types";

export const UsersService = {
    // Get tenant users
    getTenantUsers: async (): Promise<User[]> => {
        const res = await axios.get(`/users`);

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
        userId: string,
        data: Partial<User>
    ): Promise<User> => {
        const res = await axios.patch(`/users/${userId}`, data); // Backend uses @Patch
        return res.data;
    },

    // Delete user
    delete: async (userId: string): Promise<void> => {
        await axios.delete(`/users/${userId}`);
    },
};
