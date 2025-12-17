import { useQuery } from "@tanstack/react-query";
import { BookingsService } from "../api/bookings.service";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";

export function useTenantBookings(filters?: { barberId?: string }) {
    const { tenant } = useTenant();
    const { user, token } = useAuth();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['tenant-bookings', tenant?.slug, filters?.barberId],
        queryFn: () => BookingsService.getTenantBookings(undefined, undefined, filters?.barberId),
        enabled: !!user?.tenantId && !!token && !!tenant?.slug,
    });

    return { 
        bookings: data || [], 
        loading: isLoading, 
        error: error ? (error as Error).message : null,
        refetch
    };
}
