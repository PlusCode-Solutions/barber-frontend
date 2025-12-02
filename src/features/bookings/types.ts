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
