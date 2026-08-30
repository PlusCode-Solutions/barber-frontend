import type { Currency } from "../services/types";

export interface Booking {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELED';
    notes?: string | null;
    service?: {
        id?: string;
        name: string;
        price: number;
        currency?: Currency;
    };
    user?: {
        id: string;
        name: string;
        email?: string;
    };
    professional?: {
        id: string;
        name: string;
    };
}

export interface CreateBookingDto {
    serviceId: string;
    professionalId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

export interface UpdateBookingDto {
    date?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELED';
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface AvailabilitySlot {
    time: string;
    available: boolean;
    blockedBy?: 'past' | 'advance';
}

export interface AdvanceRestriction {
    enabled: boolean;
    hours: number;
    blockedToday: boolean;
    nextAvailableTime?: string;
    blockedUntil?: string;
}

export interface AvailabilityResponse {
    slots: AvailabilitySlot[];
    advanceRestriction?: AdvanceRestriction;
}
