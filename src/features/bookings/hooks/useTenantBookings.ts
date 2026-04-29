import { useQuery } from "@tanstack/react-query";
import { BookingsService } from "../api/bookings.service";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";
import type { Booking, PaginatedResponse } from "../types";

/**
 * Hook to retrieve and filter tenant-wide bookings with pagination.
 * @param page Page index
 * @param limit Items per page
 * @param filters Optional filters like professionalId
 */
export function useTenantBookings(page: number = 1, limit: number = 10, filters?: { professionalId?: string }) {
    const { tenant } = useTenant();
    const { user } = useAuth();

    const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<Booking>>({
        queryKey: ['tenant-bookings', tenant?.slug, filters?.professionalId, page, limit],
        queryFn: () => BookingsService.getTenantBookings(page, limit, filters?.professionalId),
        enabled: !!user?.tenantId && !!tenant?.slug,
    });

    return { 
        bookings: data?.data || [], 
        meta: data?.meta,
        loading: isLoading, 
        error: error ? (error as Error).message : null,
        refetch
    };
}
