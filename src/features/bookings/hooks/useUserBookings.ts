import { useEffect, useState } from "react";
import { getUserBookings } from "../api/getUserBookings";
import { useAuth } from "../../../context/AuthContext";
import type { Booking } from "../types";

export function useUserBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user, token } = useAuth();

    useEffect(() => {
        if (!user?.id || !token) {
            setLoading(false);
            return;
        }

        async function load() {
            if (!user?.id || !token) return;

            try {
                const data = await getUserBookings(user.id);
                setBookings(data);
            } catch (err) {
                console.error("Error cargando citas del usuario", err);
                setError("No se pudieron cargar las citas. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user?.id, token]);

    return { bookings, loading, error };
}
