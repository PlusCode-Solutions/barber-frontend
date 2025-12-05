export interface Booking {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    service?: {
        name: string;
        price: number;
    };
}

export interface CreateBookingDto {
    serviceId: string;
    barberId: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    notes?: string;
}

export interface AvailabilityResponse {
    slots: Array<{
        time: string;
        available: boolean;
    }>;
}
