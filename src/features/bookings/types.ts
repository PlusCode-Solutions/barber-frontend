export interface Booking {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELED';
    notes?: string | null;
    service?: {
        name: string;
        price: number;
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
}

export interface AvailabilityResponse {
    slots: AvailabilitySlot[];
}
