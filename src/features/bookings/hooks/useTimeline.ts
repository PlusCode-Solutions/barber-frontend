import { useQuery } from "@tanstack/react-query";
import { BookingsService } from "../api/bookings.service";
import { useTenant } from "../../../context/TenantContext";
import { useAuth } from "../../../context/AuthContext";

/**
 * Hook estrella para el Panel Administrativo.
 * Consume el nuevo endpoint de timeline que ya trae todo calculado del backend.
 */
export function useTimeline(date: string, barberId?: string) {
    const { tenant } = useTenant();
    const { token } = useAuth();

    const { data, isLoading, error, refetch, isPlaceholderData } = useQuery({
        queryKey: ['timeline', tenant?.id, date, barberId],
        queryFn: () => BookingsService.getTimeline(date, barberId),
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
