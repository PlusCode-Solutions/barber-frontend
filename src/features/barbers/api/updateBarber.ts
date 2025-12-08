import axios from "../../../lib/axios";
import type { Barber, UpdateBarberDto } from "../types";

export async function updateBarber(
    tenantSlug: string,
    barberId: string,
    payload: UpdateBarberDto
): Promise<Barber> {
    try {
        const res = await axios.patch(`/${tenantSlug}/barbers/${barberId}`, payload);
        return res.data;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "No se pudo actualizar el barbero";
        throw new Error(Array.isArray(message) ? message.join(", ") : message);
    }
}
