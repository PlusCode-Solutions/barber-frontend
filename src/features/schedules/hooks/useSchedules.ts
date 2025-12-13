import { useState, useEffect } from "react";
import type { Schedule } from "../types";
import { SchedulesService } from "../api/schedules.service";
import { useTenant } from "../../../context/TenantContext";

export function useSchedules(barberId?: string, fetchAll: boolean = false) {
    const { tenant } = useTenant();
    const slug = tenant?.slug;

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        
        async function load() {
            setLoading(true);
            try {
                // If fetchAll is true (Admin mode), use the admin endpoint
                const data = fetchAll 
                    ? await SchedulesService.getAllSchedules()
                    : await SchedulesService.getSchedules(barberId);
                    
                setSchedules(data);
            } catch (err) {
                console.error("Error cargando horarios", err);
                setError("No se pudieron cargar los horarios.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [slug, barberId, fetchAll]);

    const refresh = () => {
        if (!slug) return;
        setLoading(true);
        const promise = fetchAll 
            ? SchedulesService.getAllSchedules()
            : SchedulesService.getSchedules(barberId);

        promise
            .then(data => setSchedules(data))
            .catch(err => {
                console.error("Error cargando horarios", err);
                setError("No se pudieron cargar los horarios.");
            })
            .finally(() => setLoading(false));
    };

    return { schedules, loading, error, refresh, barberId };
}
