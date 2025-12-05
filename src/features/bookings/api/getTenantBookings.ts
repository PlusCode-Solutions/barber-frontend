import axios from "../../../lib/axios";
import type { Booking } from "../types";

export async function getTenantBookings(_tenantId: string): Promise<Booking[]> {
    // The endpoint is just GET /bookings based on the controller provided by the user
    // The server uses the user's token (tenantId in payload) to filter 
    const res = await axios.get(`/bookings`);

    if (Array.isArray(res.data)) {
        return res.data;
    }

    if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }

    return [];
}
