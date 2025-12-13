import { useState, useEffect } from "react";
import { ServicesService } from "../api/services.service";
import { useTenant } from "../../../context/TenantContext";
import type { Service } from "../types";

export function useServices() {
    const { tenant } = useTenant();
    const slug = tenant?.slug;

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        async function loadServices() {
            try {
                const data = await ServicesService.getAll(slug!);
                setServices(data);
            } catch (err) {
                console.error("Error loading services:", err);
                setError("No se pudieron cargar los servicios.");
            } finally {
                setLoading(false);
            }
        }

        loadServices();
    }, [slug]);

    const refresh = async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const data = await ServicesService.getAll(slug);
            setServices(data);
        } catch (err) {
            console.error("Error refreshing services:", err);
            setError("No se pudieron cargar los servicios.");
        } finally {
            setLoading(false);
        }
    };

    return { services, loading, error, refresh };
}
