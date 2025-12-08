import axios from "../../../lib/axios";

export async function deleteBarber(tenantSlug: string, barberId: string): Promise<void> {
    await axios.delete(`/${tenantSlug}/barbers/${barberId}`);
}
