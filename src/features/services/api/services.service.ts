import axios from "../../../lib/axios";
import type { Service } from "../types";

export const ServicesService = {
    // Get all services
    getAll: async (tenantSlug: string): Promise<Service[]> => {
        const res = await axios.get(`/${tenantSlug}/services`);

        if (Array.isArray(res.data)) {
            return res.data;
        }

        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }

        return [];
    },

    // Create service
    create: async (tenantSlug: string, data: Partial<Service>): Promise<Service> => {
        const res = await axios.post(`/${tenantSlug}/services`, data);
        return res.data;
    },

    // Update service
    update: async (
        tenantSlug: string,
        serviceId: string,
        data: Partial<Service>
    ): Promise<Service> => {
        const res = await axios.put(`/${tenantSlug}/services/${serviceId}`, data);
        return res.data;
    },

    // Delete service
    delete: async (tenantSlug: string, serviceId: string): Promise<void> => {
        await axios.delete(`/${tenantSlug}/services/${serviceId}`);
    },
};
