import axios from "../../../lib/axios";
import type { Booking, AvailabilityResponse } from "../types";

export const BookingsService = {
    
    // Get user bookings
    // Endpoint: GET /bookings/user/:userId
    getUserBookings: async (userId: string): Promise<Booking[]> => {
        const res = await axios.get(`/bookings/user/${userId}`);
        return res.data;
    },

    // Get tenant bookings
    // Endpoint: GET /bookings
    // Get tenant bookings
    // Endpoint: GET /bookings
    getTenantBookings: async (
        startDate?: string,
        endDate?: string,
        barberId?: string
    ): Promise<Booking[]> => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (barberId) params.barberId = barberId;

        const res = await axios.get(`/bookings`, { params });
        return res.data;
    },

    // Create booking
    // Endpoint: POST /bookings
    create: async (data: Partial<Booking>): Promise<Booking> => {
        const res = await axios.post(`/bookings`, data);
        return res.data;
    },

    // Check availability
    // Endpoint: GET /bookings/availability
    checkAvailability: async (
        barberId: string,
        date: string
    ): Promise<AvailabilityResponse> => {
        const res = await axios.get(`/bookings/availability`, {
            params: { barberId, date },
        });
        return res.data;
    },
};
