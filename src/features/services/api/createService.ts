import axios from "../../../lib/axios";
import type { Service } from "../types";

export interface CreateServicePayload {
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
}

export async function createService(tenantSlug: string, payload: CreateServicePayload): Promise<Service> {
    const res = await axios.post(`/${tenantSlug}/services`, payload);

    if (res.data) return res.data;
    throw new Error("No se pudo crear el servicio");
}
