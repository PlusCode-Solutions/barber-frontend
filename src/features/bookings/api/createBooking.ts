import axios from "../../../lib/axios";
import type { CreateBookingDto, Booking } from "../types";

export async function createBooking(dto: CreateBookingDto): Promise<Booking> {
    const res = await axios.post('/bookings', dto);
    return res.data;
}
