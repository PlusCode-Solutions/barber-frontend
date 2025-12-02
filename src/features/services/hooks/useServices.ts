import { useEffect, useState } from "react";
import { getServices } from "../api/getServices";
import type { Service } from "../types";
import { useTenant } from "../../../context/TenantContext";

export function useServices() {
    const { tenant } = useTenant();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tenant?.slug) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                const data = await getServices(tenant!.slug);
                setServices(data);
            } catch (err) {
                console.error("Error cargando servicios", err);
                setError("No se pudieron cargar los servicios. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [tenant?.slug]);

    return { services, loading, error };
}
