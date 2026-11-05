import axios from "../../../lib/axios";
import type {
    Announcement,
    CreateAnnouncementPayload,
    UpdateAnnouncementPayload,
} from "../types";

export const AnnouncementsService = {
    getTenantAnnouncements: async (): Promise<Announcement[]> => {
        const res = await axios.get('/announcements');

        if (Array.isArray(res.data)) {
            return res.data;
        }

        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }

        return [];
    },

    getPending: async (): Promise<Announcement[]> => {
        const res = await axios.get('/announcements/pending');

        if (Array.isArray(res.data)) {
            return res.data;
        }

        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }

        return [];
    },

    create: async (payload: CreateAnnouncementPayload): Promise<Announcement> => {
        const res = await axios.post('/announcements', payload);
        return res.data;
    },

    update: async (
        id: string,
        payload: UpdateAnnouncementPayload
    ): Promise<Announcement> => {
        const res = await axios.patch(`/announcements/${id}`, payload);
        return res.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`/announcements/${id}`);
    },
};
