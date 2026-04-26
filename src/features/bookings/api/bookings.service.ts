import axios from "../../../lib/axios";
import type { Booking, AvailabilityResponse, UpdateBookingDto, PaginatedResponse } from "../types";

export const BookingsService = {

    // Get user bookings
    getUserBookings: async (userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Booking>> => {
        const res = await axios.get(`/bookings/user/${userId}`, {
            params: { page, limit }
        });
        return res.data;
    },

    // Get tenant bookings
    getTenantBookings: async (
        page: number = 1,
        limit: number = 10,
        professionalId?: string,
        startDate?: string,
        endDate?: string
    ): Promise<PaginatedResponse<Booking>> => {
        const params: any = { page, limit };
        if (professionalId) params.professionalId = professionalId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await axios.get(`/bookings`, { params });
        return res.data;
    },

    // Create booking
    create: async (data: Partial<Booking>): Promise<Booking> => {
        const res = await axios.post(`/bookings`, data);
        return res.data;
    },

    // Check availability
    checkAvailability: async (
        professionalId: string,
        date: string,
        userId?: string
    ): Promise<AvailabilityResponse> => {
        const res = await axios.get(`/bookings/availability`, {
            params: { professionalId, date, userId }
        });
        return res.data;
    },

    // Update booking
    updateBooking: async (id: string, dto: UpdateBookingDto): Promise<Booking> => {
        const { data } = await axios.patch<Booking>(`/bookings/${id}`, dto);
        return data;
    },

    // Cancel booking (Delete)
    cancelBooking: async (id: string): Promise<void> => {
        await axios.delete(`/bookings/${id}`);
    },

    // Get statistics
    getStatistics: async (startDate: string, endDate: string): Promise<any> => {
        const res = await axios.get(`/bookings/statistics`, {
            params: { startDate, endDate }
        });
        return res.data;
    },

    // Get timeline (Admin/Professional view)
    getTimeline: async (date: string, professionalId?: string): Promise<any[]> => {
        const res = await axios.get(`/bookings/timeline`, {
            params: { date, professionalId }
        });
        return res.data;
    },
};
