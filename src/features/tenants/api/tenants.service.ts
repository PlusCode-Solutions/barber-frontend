import axios from "../../../lib/axios";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    backgroundUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
    address?: string;
    phone?: string;
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

    // Generic image upload
    uploadImage: async (id: string, file: File, type: 'logo' | 'background'): Promise<Tenant> => {
        const formData = new FormData();
        formData.append('file', file);

        const endpoint = type === 'logo' ? 'upload-logo' : 'upload-background';
        const res = await axios.post(`/tenants/${endpoint}/${id}`, formData);
        return res.data;
    },

    // Upload logo (legacy wrapper)
    uploadLogo: async (id: string, file: File): Promise<Tenant> => {
        return TenantsService.uploadImage(id, file, 'logo');
    },

    // Upload background (legacy wrapper)
    uploadBackground: async (id: string, file: File): Promise<Tenant> => {
        return TenantsService.uploadImage(id, file, 'background');
    },
};
