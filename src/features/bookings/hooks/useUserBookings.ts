import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingsService } from "../api/bookings.service";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";
import { APP_CONSTANTS } from "../../../config/constants";
import type { UpdateBookingDto, Booking, PaginatedResponse } from "../types";

/**
 * Hook to manage user or tenant bookings with pagination and mutations.
 * @param page Current page number
 * @param limit Items per page
 */
export function useUserBookings(page: number = 1, limit: number = 10) {
    const { tenant } = useTenant();
    const { user, token } = useAuth();
    const queryClient = useQueryClient();

    const { 
        data: bookingsData, 
        isLoading: loading, 
        error,
        refetch
    } = useQuery<PaginatedResponse<Booking>>({
        queryKey: ['bookings', user?.id, tenant?.slug, user?.role, page, limit],
        queryFn: () => {
            if (user?.role === 'TENANT_ADMIN') {
                return BookingsService.getTenantBookings(page, limit);
            }
            return BookingsService.getUserBookings(user!.id, page, limit);
        },
        enabled: !!user?.id && !!token && !!tenant?.slug,
        staleTime: APP_CONSTANTS.QUERY.STALE_TIME,
        gcTime: APP_CONSTANTS.QUERY.GC_TIME,
        refetchOnWindowFocus: false,
    });

    const { mutateAsync: cancelBooking, isPending: cancelling } = useMutation({
        mutationFn: BookingsService.cancelBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });

    const { mutateAsync: updateBooking, isPending: updating } = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBookingDto }) => 
            BookingsService.updateBooking(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });

    return { 
        bookings: bookingsData?.data || [], 
        meta: bookingsData?.meta,
        loading, 
        error: error ? (error as Error).message : null,
        refetch,
        cancelBooking,
        cancelling,
        updateBooking,
        updating
    };
}
