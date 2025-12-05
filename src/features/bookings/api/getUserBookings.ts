import axios from "../../../lib/axios";
import type { Booking } from "../types";

export async function getUserBookings(userId: string): Promise<Booking[]> {
    const res = await axios.get(`/bookings/user/${userId}`);

    if (Array.isArray(res.data)) {
        return res.data;
    }

    if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }

    return [];
}
