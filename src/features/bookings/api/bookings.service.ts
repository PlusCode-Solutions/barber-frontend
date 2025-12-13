import axios from "../../../lib/axios";
import type { Booking } from "../types";

interface AvailabilityResponse {
    available: boolean;
    slots?: string[];
}

/**
 * Bookings API Service
 * Handles all API calls related to bookings management
 */
export const BookingsService = {
    /**
     * Get user's bookings
     */
    getUserBookings: async (tenantSlug: string): Promise<Booking[]> => {
        const res = await axios.get(`/${tenantSlug}/bookings/my-bookings`);

        if (Array.isArray(res.data)) {
            return res.data;
        }

        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }

        return [];
    },

    /**
     * Get all bookings for tenant admin
     */
    getTenantBookings: async (
        tenantSlug: string,
        startDate?: string,
        endDate?: string
    ): Promise<Booking[]> => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await axios.get(`/${tenantSlug}/bookings`, { params });

        if (Array.isArray(res.data)) {
            return res.data;
        }

        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }

        return [];
    },

    /**
     * Create a new booking
     */
    create: async (tenantSlug: string, data: Partial<Booking>): Promise<Booking> => {
        const res = await axios.post(`/${tenantSlug}/bookings`, data);
        return res.data;
    },

    /**
     * Check availability for a specific date and barber
     */
    checkAvailability: async (
        tenantSlug: string,
        barberId: string,
        date: string
    ): Promise<AvailabilityResponse> => {
        const res = await axios.get(`/${tenantSlug}/bookings/availability`, {
            params: { barberId, date },
        });
        return res.data;
    },
};
