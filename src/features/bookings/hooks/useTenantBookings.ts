import { useEffect, useState } from "react";
import { BookingsService } from "../api/bookings.service";
import { useAuth } from "../../../context/AuthContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { useTenant } from "../../../context/TenantContext";
import type { Booking } from "../types";

export function useTenantBookings(filters?: { barberId?: string }) {
    const { tenant } = useTenant();
    const { user, token } = useAuth();
    const { handleError } = useErrorHandler();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.tenantId || !token || !tenant?.slug) {
            setLoading(false);
            return;
        }

        async function load() {
            if (!tenant?.slug) return;
            setLoading(true); // Reset loading state on filter change

            try {
                // Pass barberId filter if present.
                // We pass undefined for dates to fetch all (or let backend default).
                const data = await BookingsService.getTenantBookings(undefined, undefined, filters?.barberId);
                setBookings(data);
            } catch (err) {
                const message = handleError(err, 'useTenantBookings');
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user?.tenantId, token, tenant?.slug, handleError, filters?.barberId]); // Re-run when barberId changes

    return { bookings, loading, error };
}
