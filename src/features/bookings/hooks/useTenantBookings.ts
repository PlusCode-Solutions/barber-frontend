import { useEffect, useState } from "react";
import { getTenantBookings } from "../api/getTenantBookings";
import { useAuth } from "../../../context/AuthContext";
import type { Booking } from "../types";

export function useTenantBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user, token } = useAuth();

    useEffect(() => {
        if (!user?.tenantId || !token) {
            // If we are strictly in a protected admin route, this might be handled by the guard,
            // but good to have a check here.
            setLoading(false);
            return;
        }

        async function load() {
            if (!user?.tenantId) return;

            try {
                const data = await getTenantBookings(user.tenantId);
                setBookings(data);
            } catch (err) {
                console.error("Error cargando todas las citas del tenant", err);
                setError("No se pudieron cargar las citas. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user?.tenantId, token]);

    return { bookings, loading, error };
}
