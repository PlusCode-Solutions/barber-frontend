import axios from "../../../lib/axios";
import type { Professional } from "../types";

export const ProfessionalsService = {
    // Get all professionals
    getAll: async (tenantSlug: string): Promise<Professional[]> => {
        const res = await axios.get(`/${tenantSlug}/professionals`);

        if (Array.isArray(res.data)) {
            return res.data;
        }

        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }

        return [];
    },

    // Create professional
    create: async (tenantSlug: string, data: Partial<Professional> | FormData): Promise<Professional> => {
        const res = await axios.post(`/${tenantSlug}/professionals`, data);
        return res.data;
    },

    // Update professional
    update: async (
        tenantSlug: string,
        professionalId: string,
        data: Partial<Professional> | FormData
    ): Promise<Professional> => {
        const res = await axios.patch(`/${tenantSlug}/professionals/${professionalId}`, data);
        return res.data;
    },

    // Delete professional
    delete: async (tenantSlug: string, professionalId: string): Promise<void> => {
        await axios.delete(`/${tenantSlug}/professionals/${professionalId}`);
    },
};
