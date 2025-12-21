import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingsService } from "../api/bookings.service";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";

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
        staleTime: 1000 * 60 * 5, // 5 minutes (Aggressive caching as requested)
        gcTime: 1000 * 60 * 10,   // 10 minutes (Keep in cache longer)
        refetchOnWindowFocus: false, // Do not refetch on window focus
    });

    const { mutateAsync: cancelBooking, isPending: cancelling } = useMutation({
        mutationFn: BookingsService.cancelBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });

    const { mutateAsync: updateBooking, isPending: updating } = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => 
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
