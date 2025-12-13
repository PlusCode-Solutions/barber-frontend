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
        if (!slug) return;
        
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
