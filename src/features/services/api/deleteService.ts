import axios from "../../../lib/axios";

export async function deleteService(tenantSlug: string, serviceId: string): Promise<void> {
    await axios.delete(`/${tenantSlug}/services/${serviceId}`);
}
