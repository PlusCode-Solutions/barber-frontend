import { useState, useEffect } from "react";
import type { Schedule } from "../types";
import { SchedulesService } from "../api/schedules.service";
import { useTenant } from "../../../context/TenantContext";

export function useSchedules() {
    const { tenant } = useTenant();
    const slug = tenant?.slug;

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            // If we're still loading tenant or no tenant, we might want to wait or stop.
            // But if we return here, loading stays true. 
            // Better to check if tenant is explicitly null (after loading).
            // For now, let's just return and let the tenant loader handle the parent loading state if needed.
            // OR: set loading to false if we know there is no tenant coming?
            // Actually, if !slug, we can't fetch. 
            return;
        }
        
        async function load() {
            try {
                const data = await SchedulesService.getSchedules(slug!);
                setSchedules(data);
            } catch (err) {
                console.error("Error cargando horarios", err);
                setError("No se pudieron cargar los horarios.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [slug]);

    const refresh = () => {
        if (!slug) return;
        setLoading(true);
        SchedulesService.getSchedules(slug)
            .then(data => setSchedules(data))
            .catch(err => {
                console.error("Error cargando horarios", err);
                setError("No se pudieron cargar los horarios.");
            })
            .finally(() => setLoading(false));
    };

    return { schedules, loading, error, refresh };
}
