import { useEffect, useState } from "react";
import { getBarbers } from "../api/getBarbers";
import type { Barber } from "../types";
import { useTenant } from "../../../context/TenantContext";

export function useBarbers() {
    const { tenant } = useTenant();
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tenant?.slug) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                const data = await getBarbers(tenant!.slug);
                setBarbers(data);
            } catch (err) {
                console.error("Error cargando barberos", err);
                setError("No se pudieron cargar los barberos. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [tenant?.slug]);

    return { barbers, loading, error };
}
