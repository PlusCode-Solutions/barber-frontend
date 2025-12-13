import axios from "../../../lib/axios";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    primaryColor?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Tenants API Service
 * Handles all tenant-related API calls
 */
export const TenantsService = {
    /**
     * Get tenant by slug
     */
    getBySlug: async (slug: string): Promise<Tenant> => {
        const res = await axios.get(`/tenants/slug/${slug}`);
        return res.data;
    },

    /**
     * Get all tenants (admin only)
     */
    getAll: async (): Promise<Tenant[]> => {
        const res = await axios.get("/tenants");
        
        if (Array.isArray(res.data)) {
            return res.data;
        }

        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }

        return [];
    },
};
