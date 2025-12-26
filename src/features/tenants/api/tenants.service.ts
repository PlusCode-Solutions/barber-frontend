import axios from "../../../lib/axios";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    createdAt: string;
    updatedAt: string;
}

export const TenantsService = {
    // Get tenant by slug
    getBySlug: async (slug: string): Promise<Tenant> => {
        const res = await axios.get(`/tenants/slug/${slug}`);
        return res.data;
    },

    // Get all tenants
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


    // Update tenant
    update: async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
        const res = await axios.patch(`/tenants/${id}`, data);
        return res.data;
    },

    // Upload logo
    uploadLogo: async (id: string, file: File): Promise<Tenant> => {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await axios.post(`/tenants/upload-logo/${id}`, formData);
        return res.data;
    },
};
