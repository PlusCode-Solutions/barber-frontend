import axios from "../../../lib/axios";
import type { Barber } from "../types";


// Get barbers
export async function getBarbers(tenantSlug: string): Promise<Barber[]> {
    const res = await axios.get(`/${tenantSlug}/barbers`);
    if (Array.isArray(res.data)) {
        return res.data;
    }
    if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    return [];
}
