export type AnnouncementType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Announcement {
    id: string;
    tenantId: string;
    title: string;
    message: string;
    type: AnnouncementType;
    isActive: boolean;
    actionLabel: string | null;
    actionUrl: string | null;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAnnouncementPayload {
    title: string;
    message: string;
    type: AnnouncementType;
    /** Fecha local de Costa Rica en formato YYYY-MM-DD. */
    expiresAt: string;
    actionLabel?: string | null;
    actionUrl?: string | null;
}

export interface UpdateAnnouncementPayload extends Partial<CreateAnnouncementPayload> {
    isActive?: boolean;
}
