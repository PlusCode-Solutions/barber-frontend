import axios from "../../../../lib/axios";

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    email: string; 
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    createdAt: string;
    active: boolean; 
    logoUrl?: string;
}

export interface CreateTenantDTO {
    name: string;
    slug: string;
    email: string;
    password?: string; 
}

export interface UpdateTenantDTO {
    name?: string;
    slug?: string;
    email?: string;
    active?: boolean;
    logoUrl?: string;
}

export const TenantsService = {
    getAll: async (): Promise<Tenant[]> => {
        const res = await axios.get('/tenants'); 
        return res.data;
    },

    create: async (data: CreateTenantDTO): Promise<Tenant> => {
        const res = await axios.post('/tenants', data);
        return res.data;
    },

    update: async (id: string, data: UpdateTenantDTO): Promise<Tenant> => {
        const res = await axios.patch(`/tenants/${id}`, data);
        return res.data;
    },

    uploadLogo: async (tenantId: string, file: File): Promise<Tenant> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`/tenants/upload-logo/${tenantId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`/tenants/${id}`);
    }
};
