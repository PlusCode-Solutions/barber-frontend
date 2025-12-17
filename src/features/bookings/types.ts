export interface Booking {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    notes?: string | null;
    service?: {
        name: string;
        price: number;
    };
    // Include these for admin view
    user?: {
        id: string;
        name: string;
        email?: string;
    };
    barber?: {
        id: string;
        name: string;
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

export interface AvailabilitySlot {
    time: string;
    available: boolean;
}

export interface AvailabilityResponse {
    slots: AvailabilitySlot[];
}
