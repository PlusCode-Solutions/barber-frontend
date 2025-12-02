import axios from "../../../lib/axios";
import type { Service } from "../types";

export async function getServices(tenantSlug: string): Promise<Service[]> {
    const res = await axios.get(`/${tenantSlug}/services`);

    if (Array.isArray(res.data)) {
        return res.data;
    }

    if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }

    return [];
}
