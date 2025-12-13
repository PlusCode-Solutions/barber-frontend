import { useEffect, useState } from "react";
import { BookingsService } from "../api/bookings.service";
import { useAuth } from "../../../context/AuthContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { useTenant } from "../../../context/TenantContext";
import type { Booking } from "../types";

export function useUserBookings() {
    const { tenant } = useTenant();
    const { user, token } = useAuth();
    const { handleError } = useErrorHandler();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id || !token || !tenant?.slug) {
            setLoading(false);
            return;
        }

        async function load() {
            if (!tenant?.slug) return;

            try {
                const data = await BookingsService.getUserBookings(tenant.slug);
                setBookings(data);
            } catch (err) {
                const message = handleError(err, 'useUserBookings');
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user?.id, token, tenant?.slug, handleError]);

    return { bookings, loading, error };
}
