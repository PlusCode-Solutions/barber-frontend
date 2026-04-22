import axios from "../../../lib/axios";

export interface GalleryImage {
    id: string;
    tenantId: string;
    imageUrl: string;
    title: string | null;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export const GalleryService = {
    // Get gallery images by tenant slug (public)
    getByTenantSlug: async (slug: string): Promise<GalleryImage[]> => {
        const res = await axios.get(`/gallery/${slug}`);
        return Array.isArray(res.data) ? res.data : [];
    },

    // Get gallery images by tenant ID (admin)
    getByTenantId: async (tenantId: string): Promise<GalleryImage[]> => {
        const res = await axios.get(`/gallery/admin/${tenantId}`);
        return Array.isArray(res.data) ? res.data : [];
    },

    // Upload a new gallery image
    upload: async (tenantId: string, file: File, title?: string): Promise<GalleryImage> => {
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);

        const res = await axios.post(`/gallery/upload/${tenantId}`, formData);
        return res.data;
    },

    // Update gallery image title
    update: async (id: string, data: { title?: string }): Promise<GalleryImage> => {
        const res = await axios.patch(`/gallery/${id}`, data);
        return res.data;
    },

    // Reorder gallery images
    reorder: async (tenantId: string, items: { id: string; order: number }[]): Promise<void> => {
        await axios.patch(`/gallery/reorder/${tenantId}`, { items });
    },

    // Delete a gallery image
    remove: async (id: string): Promise<void> => {
        await axios.delete(`/gallery/${id}`);
    },
};
