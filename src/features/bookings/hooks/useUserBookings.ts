import { useEffect, useState } from "react";
import { getUserBookings } from "../api/getUserBookings";
import type { Booking } from "../types";

export function useUserBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (!user.id || !token) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                const data = await getUserBookings(user.id, token as string);
                setBookings(data);
            } catch (err) {
                console.error("Error cargando citas del usuario", err);
                setError("No se pudieron cargar las citas. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user.id, token]);

    return { bookings, loading, error };
}
