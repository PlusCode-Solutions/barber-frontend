import { useEffect, useState } from "react";
import { BarbersService } from "../api/barbers.service";
import type { Barber } from "../types";
import { useTenant } from "../../../context/TenantContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";

export function useBarbers() {
    const { tenant } = useTenant();
    const { handleError } = useErrorHandler();
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tenant?.slug) {
            setLoading(false);
            return;
        }

        async function load() {
            if (!tenant?.slug) return;

            try {
                const data = await BarbersService.getAll(tenant.slug);
                setBarbers(data);
            } catch (err) {
                const message = handleError(err, 'useBarbers');
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [tenant?.slug, handleError]);

    return { barbers, loading, error };
}
