import { useState, useEffect } from "react";
import type { Schedule } from "../types";
import { getTenantSchedules } from "../api/getSchedules";

export function useSchedules() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await getTenantSchedules();
                setSchedules(data);
            } catch (err) {
                console.error("Error cargando horarios", err);
                setError("No se pudieron cargar los horarios.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return { schedules, loading, error };
}
