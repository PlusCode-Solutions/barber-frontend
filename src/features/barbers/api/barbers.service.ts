import axios from "../../../lib/axios";
import type { Barber } from "../types";

/**
 * Barbers API Service
 * Handles all API calls related to barbers management
 */
export const BarbersService = {
    /**
     * Get all barbers for a tenant
     */
    getAll: async (tenantSlug: string): Promise<Barber[]> => {
        const res = await axios.get(`/${tenantSlug}/barbers`);

        if (Array.isArray(res.data)) {
            return res.data;
        }

        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }

        return [];
    },

    /**
     * Create a new barber
     */
    create: async (tenantSlug: string, data: Partial<Barber>): Promise<Barber> => {
        const res = await axios.post(`/${tenantSlug}/barbers`, data);
        return res.data;
    },

    /**
     * Update an existing barber
     */
    update: async (
        tenantSlug: string,
        barberId: string,
        data: Partial<Barber>
    ): Promise<Barber> => {
        const res = await axios.put(`/${tenantSlug}/barbers/${barberId}`, data);
        return res.data;
    },

    /**
     * Delete a barber
     */
    delete: async (tenantSlug: string, barberId: string): Promise<void> => {
        await axios.delete(`/${tenantSlug}/barbers/${barberId}`);
    },
};
