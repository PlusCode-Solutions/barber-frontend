import { useQuery } from "@tanstack/react-query";
import { SchedulesService } from "../api/schedules.service";
import { safeDate } from "../../../utils/dateUtils";

export function useClosures(barberId?: string) {
    const { 
        data: closures = [], 
        isLoading: loading, 
        error,
        refetch 
    } = useQuery({
        queryKey: ['closures', barberId],
        queryFn: async () => {
            if (!barberId) return [];
            return SchedulesService.getClosures(barberId);
        },
        enabled: !!barberId,
        select: (data) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcoming = data.filter(c => {
                const cDate = safeDate(c.date);
                return cDate && cDate >= today;
            });

            // Ordenar por fecha ascendente
            return upcoming.sort((a, b) => {
                const dA = safeDate(a.date);
                const dB = safeDate(b.date);
                return (dA?.getTime() || 0) - (dB?.getTime() || 0);
            });
        }
    });

    return { 
        closures, 
        loading, 
        error: error ? (error as Error).message : null, 
        refetch 
    };
}
