import { useEffect, useState } from "react";
import { useTenant } from "../../../context/TenantContext";
import { getTenantBySlugApi } from "../api/tenants.api";

export function useTenantLoader(slug: string) {
    const { tenant, setTenant } = useTenant();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setError("Slug inválido");
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);

                // Siempre validar que el slug actual coincide
                if (tenant && tenant.slug === slug) {
                    setLoading(false);
                    return;
                }

                const data = await getTenantBySlugApi(slug);

                // Guardar en contexto
                setTenant(data);

                // Guardar cache local
                localStorage.setItem("tenant", JSON.stringify(data));

            } catch (err) {
                console.error(err);
                setError("No se encontró la barbería");
            }

            setLoading(false);
        }

        load();
    }, [slug]);

    return { tenant, loading, error };
}
