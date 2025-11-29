import axios from "../../../lib/axios";

export async function getTenantInfo(slug: string) {
    const res = await axios.get(`/tenants/slug/${slug}`)

    return res.data;
}
