import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingsService } from "../api/bookings.service";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";
import { APP_CONSTANTS } from "../../../config/constants";
import type { UpdateBookingDto } from "../types";

export function useUserBookings() {
    const { tenant } = useTenant();
    const { user, token } = useAuth();
    const queryClient = useQueryClient();

    const { 
        data: bookings = [], 
        isLoading: loading, 
        error,
        refetch
    } = useQuery({
        queryKey: ['bookings', user?.id, tenant?.slug, user?.role],
        queryFn: () => {
            if (user?.role === 'TENANT_ADMIN') {
                return BookingsService.getTenantBookings();
            }
            return BookingsService.getUserBookings(user!.id);
        },
        enabled: !!user?.id && !!token && !!tenant?.slug,
        staleTime: APP_CONSTANTS.QUERY.STALE_TIME,
        gcTime: APP_CONSTANTS.QUERY.GC_TIME,
        refetchOnWindowFocus: false, // Do not refetch on window focus
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
        bookings, 
        loading, 
        error: error ? (error as Error).message : null,
        refetch,
        cancelBooking,
        cancelling,
        updateBooking,
        updating
    };
}
