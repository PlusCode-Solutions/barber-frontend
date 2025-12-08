import { useMemo, useState } from "react";
import { useTenantBookings } from "../hooks/useTenantBookings";
import { BookingsTable } from "../components/BookingsTable";
import BookingsSkeleton from "../components/BookingsSkeleton";
import {
    formatDateForInput,
    formatHour,
    formatRelativeDate,
    normalizeDateString
} from "../../../utils/dateUtils";
import TenantBookingsDateFilter from "../components/TenantBookingsDateFilter";

export default function TenantBookingsPage() {
    const { bookings, loading } = useTenantBookings();
    const [selectedDate, setSelectedDate] = useState<string>(formatDateForInput(new Date()));

    const filteredBookings = useMemo(
        () =>
            bookings.filter((b) => {
                const bookingDate = normalizeDateString(b.date);
                return bookingDate === selectedDate;
            }),
        [bookings, selectedDate]
    );

    if (loading) return <BookingsSkeleton />;

    const formattedBookings = filteredBookings.map((b) => ({
        ...b,
        date: formatRelativeDate(b.date),
        startTime: formatHour(b.startTime),
        endTime: formatHour(b.endTime),
        // Robust handling for nested service object
        service: {
            ...b.service,
            price: b.service?.price ? `$${b.service.price}` : "—",
        },
        customerName: b.user?.name || "Cliente Desconocido",
        barberName: b.barber?.name || "Barbero Asignado"
    }));

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <TenantBookingsDateFilter
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                countForDay={formattedBookings.length}
                totalCount={bookings.length}
            />

            {/* CONTENIDO */}
            <div className="px-6">
                <BookingsTable
                    data={formattedBookings}
                    columns={[
                        // Admin needs to see who the customer is first!
                        { header: "Cliente 👤", accessor: "customerName" },
                        { header: "Barbero ✂️", accessor: "barberName" },
                        { header: "Servicio 🎨", accessor: "service.name" },
                        { header: "Precio 💵", accessor: "service.price" },
                        { header: "Fecha 📅", accessor: "date" },
                        { header: "Inicio ⏰", accessor: "startTime" },
                        // { header: "Fin ⏰", accessor: "endTime" }, // Maybe less critical for overview
                        { header: "Estado 🏷️", accessor: "status" }, // Assuming status exists
                    ]}
                />
            </div>
        </div>
    );
}
