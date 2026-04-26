import { useQuery } from "@tanstack/react-query";
import { BookingsService } from "../api/bookings.service";
import { useTenant } from "../../../context/TenantContext";
import { useAuth } from "../../../context/AuthContext";

/**
 * Core hook for the Administrative Panel.
 * Consumes the timeline endpoint which provides calculated slots and bookings from the backend.
 * @param date Date to view (YYYY-MM-DD)
 * @param professionalId Optional professional filter
 */
export function useTimeline(date: string, professionalId?: string) {
    const { tenant } = useTenant();
    const { token } = useAuth();

    const { data, isLoading, error, refetch, isPlaceholderData } = useQuery({
        queryKey: ['timeline', tenant?.id, date, professionalId],
        queryFn: () => BookingsService.getTimeline(date, professionalId),
        enabled: !!tenant?.id && !!date && !!token,
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 30,
    });

    return {
        items: data || [],
        loading: isLoading && !isPlaceholderData,
        isInitialLoading: isLoading && !data,
        error: error ? (error as Error).message : null,
        refetch
    };
}
