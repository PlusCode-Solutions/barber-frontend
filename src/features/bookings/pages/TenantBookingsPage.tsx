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
import { useBarbers } from "../../barbers/hooks/useBarbers"; // Import useBarbers
import { formatCurrency } from "../../../utils/formatUtils";
import { Filter } from "lucide-react"; // Icons

export default function TenantBookingsPage() {
    const [selectedBarberId, setSelectedBarberId] = useState<string | undefined>(undefined);
    const { bookings, loading } = useTenantBookings({ barberId: selectedBarberId }); // Pass filter
    const { barbers } = useBarbers(); // Fetch barbers for dropdown
    const [selectedDate, setSelectedDate] = useState<string>(formatDateForInput(new Date()));

    const filteredBookings = useMemo(
        () =>
            bookings.filter((b) => {
                const bookingDate = normalizeDateString(b.date);
                const dateMatch = bookingDate === selectedDate;

                // Client-side safeguard: Ensure we only show bookings for the selected barber
                // even if the API returned extra data (e.g. from cache or race condition).
                const barberMatch = selectedBarberId
                    ? b.barber?.id === selectedBarberId
                    : true;

                return dateMatch && barberMatch;
            }),
        [bookings, selectedDate, selectedBarberId]
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
            price: b.service?.price ? formatCurrency(b.service.price) : "—",
        },
        customerName: b.user?.name || "Cliente Desconocido",
        barberName: b.barber?.name || "Barbero Asignado"
    }));

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        {/* Re-use Date Filter Component (Wrapped for layout) */}
                        <div className="flex-1">
                            <TenantBookingsDateFilter
                                selectedDate={selectedDate}
                                onDateChange={setSelectedDate}
                                countForDay={formattedBookings.length}
                                totalCount={bookings.length}
                            />
                        </div>

                        {/* Barber Filter Dropdown */}
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedBarberId || ""}
                                onChange={(e) => setSelectedBarberId(e.target.value || undefined)}
                                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer min-w-[180px]"
                            >
                                <option value="">Todos los barberos</option>
                                {barbers.map(barber => (
                                    <option key={barber.id} value={barber.id}>
                                        {barber.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="px-6 mt-6">
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
