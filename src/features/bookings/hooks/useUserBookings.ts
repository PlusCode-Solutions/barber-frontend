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
        error 
    } = useQuery({
        queryKey: ['bookings', user?.id, tenant?.slug, user?.role],
        queryFn: () => {
            if (user?.role === 'TENANT_ADMIN') {
                return BookingsService.getTenantBookings();
            }
            return BookingsService.getUserBookings(user!.id);
        },
        enabled: !!user?.id && !!token && !!tenant?.slug,
    });

    const { mutateAsync: cancelBooking, isPending: cancelling } = useMutation({
        mutationFn: BookingsService.cancelBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });

    return { 
        bookings, 
        loading, 
        error: error ? (error as Error).message : null,
        cancelBooking,
        cancelling
    };
}
