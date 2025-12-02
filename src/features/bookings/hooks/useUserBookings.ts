import { useEffect, useState } from "react";
import { getUserBookings } from "../api/getUserBookings";

interface Booking {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    service?: {
        name: string;
        price: number;
    };
}

export function useUserBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

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
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user.id, token]);

    return { bookings, loading };
}
