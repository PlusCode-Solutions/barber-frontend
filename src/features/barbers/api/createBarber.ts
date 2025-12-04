import axios from "../../../lib/axios";
import type { Barber, CreateBarberDto } from "../types";


// Create barber
export async function createBarber(
    tenantSlug: string,
    data: CreateBarberDto
): Promise<Barber> {
    const res = await axios.post(`/${tenantSlug}/barbers`, data);
    return res.data;
}
