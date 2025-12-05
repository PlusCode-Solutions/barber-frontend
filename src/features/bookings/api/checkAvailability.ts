import axios from "../../../lib/axios";
import type { AvailabilityResponse } from "../types";

export async function checkAvailability(
    date: string,
    barberId: string,
    serviceId?: string
): Promise<AvailabilityResponse> {
    const params: any = { date, barberId };
    if (serviceId) params.serviceId = serviceId;

    const res = await axios.get('/bookings/availability', { params });
    return res.data;
}
