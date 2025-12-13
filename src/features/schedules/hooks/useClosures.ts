import { useState, useEffect, useCallback } from "react";
import { type Closure } from "../types";
import { SchedulesService } from "../api/schedules.service";
import { safeDate } from "../../../utils/dateUtils";

export function useClosures(barberId?: string) {
    const [closures, setClosures] = useState<Closure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClosures = useCallback(async () => {
        if (!barberId) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const data = await SchedulesService.getClosures(barberId);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcoming = data.filter(c => {
                const cDate = safeDate(c.date);
                return cDate && cDate >= today;
            });

            // Ordenar por fecha ascendente
            setClosures(upcoming.sort((a, b) => {
                const dA = safeDate(a.date);
                const dB = safeDate(b.date);
                return (dA?.getTime() || 0) - (dB?.getTime() || 0);
            }));
        } catch (err: any) {
            console.error("Error fetching closures:", err);
            setError(err.message || "Error al cargar cierres");
        } finally {
            setLoading(false);
        }
    }, [barberId]);

    useEffect(() => {
        fetchClosures();
    }, [fetchClosures]);

    return { closures, loading, error, refetch: fetchClosures };
}
