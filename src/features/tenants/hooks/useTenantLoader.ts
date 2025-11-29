
import { useEffect, useState } from "react";
import axios from "../../../lib/axios";
import { useTenant } from "../../../context/TenantContext";

// useTenantLoader hook
export function useTenantLoader(slug: string) {
    const { tenant, setTenant } = useTenant();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await axios.get(`/tenants/slug/${slug}`)
                setTenant(res.data);
            } catch (err) {
                console.error("Error cargando tenant:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [slug]);

    return { tenant, loading };
}
