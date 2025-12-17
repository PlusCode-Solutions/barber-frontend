import { useEffect, useState } from "react";
import { useTenant } from "../../../context/TenantContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { TenantsService } from "../api/tenants.service";

export function useTenantLoader(slug: string) {
    const { tenant, setTenant } = useTenant();
    const { handleError } = useErrorHandler();
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

                // Skip if already loaded
                if (tenant && tenant.slug === slug) {
                    setLoading(false);
                    return;
                }

                const data = await TenantsService.getBySlug(slug);
                setTenant(data);

            } catch (err) {
                const message = handleError(err, 'useTenantLoader');
                setError(message || "No se encontró la barbería");
            }

            setLoading(false);
        }

        load();
    }, [slug, tenant, setTenant, handleError]);

    return { tenant, loading, error };
}
