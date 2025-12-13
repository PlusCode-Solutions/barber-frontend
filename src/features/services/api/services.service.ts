import axios from "../../../lib/axios";
import type { Service } from "../types";

/**
 * Services API Service
 * Handles all API calls related to services management
 */
export const ServicesService = {
    /**
     * Get all services for a tenant
     */
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

    /**
     * Create a new service
     */
    create: async (tenantSlug: string, data: Partial<Service>): Promise<Service> => {
        const res = await axios.post(`/${tenantSlug}/services`, data);
        return res.data;
    },

    /**
     * Update an existing service
     */
    update: async (
        tenantSlug: string,
        serviceId: string,
        data: Partial<Service>
    ): Promise<Service> => {
        const res = await axios.put(`/${tenantSlug}/services/${serviceId}`, data);
        return res.data;
    },

    /**
     * Delete a service
     */
    delete: async (tenantSlug: string, serviceId: string): Promise<void> => {
        await axios.delete(`/${tenantSlug}/services/${serviceId}`);
    },
};
