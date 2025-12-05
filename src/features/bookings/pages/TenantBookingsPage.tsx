import { useTenantBookings } from "../hooks/useTenantBookings";
import { BookingsTable } from "../components/BookingsTable";
import BookingsSkeleton from "../components/BookingsSkeleton";
import { formatRelativeDate, formatHour } from "../../../utils/dateUtils";

export default function TenantBookingsPage() {
    const { bookings, loading } = useTenantBookings();

    if (loading) return <BookingsSkeleton />;

    const formattedBookings = bookings.map((b) => ({
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
            {/* ADMIN HEADER - Distinto al del usuario */}
            <div className="bg-white px-6 py-6 shadow-sm mb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            Gestión de Citas
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Visualiza y administra todas las reservas de la barbería.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                            <span className="text-indigo-700 font-bold text-lg">
                                {formattedBookings.length}
                            </span>
                            <span className="text-indigo-600 text-xs ml-2 font-medium">TOTALES</span>
                        </div>
                    </div>
                </div>
            </div>

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
