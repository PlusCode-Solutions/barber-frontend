import axios from "../../../lib/axios";
import type { Service } from "../types";

export interface UpdateServicePayload {
    name?: string;
    description?: string;
    price?: number;
    durationMinutes?: number;
}

export async function updateService(
    tenantSlug: string,
    serviceId: string,
    payload: UpdateServicePayload
): Promise<Service> {
    const res = await axios.patch(`/${tenantSlug}/services/${serviceId}`, payload);

    if (res.data) return res.data;
    throw new Error("No se pudo actualizar el servicio");
}
