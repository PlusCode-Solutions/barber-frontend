import { useQuery } from "@tanstack/react-query";
import { SchedulesService } from "../api/schedules.service";
import { safeDate } from "../../../utils/dateUtils";
import { useTenant } from "../../../context/TenantContext";

export function useClosures(barberId?: string) {
    const { tenant } = useTenant();
    const slug = tenant?.slug;

    const { 
        data: closures = [], 
        isLoading: loading, 
        error,
        refetch 
    } = useQuery({
        queryKey: ['closures', slug, barberId],
        queryFn: async () => {
            return SchedulesService.getClosures(barberId);
        },
        enabled: !!slug,
        select: (data) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Filter upcoming closures
            const upcoming = data.filter(c => {
                const cDate = safeDate(c.date);
                return cDate && cDate >= today;
            });

            // Filter by barber if barberId is provided
            const filtered = barberId
                ? upcoming.filter(c => {
                    // Show shop-wide closures (barberId is null) OR closures for the selected barber
                    return !c.barberId || c.barberId === barberId;
                })
                : upcoming; // If no barberId, show all closures

            // Sort by date ascending
            return filtered.sort((a, b) => {
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
