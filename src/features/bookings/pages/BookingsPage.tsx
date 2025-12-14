import { useUserBookings } from "../hooks/useUserBookings";
import { BookingsTable } from "../components/BookingsTable";
import BookingsSkeleton from "../components/BookingsSkeleton";
import { formatRelativeDate, formatHour } from "../../../utils/dateUtils";
import SEO from "../../../components/shared/SEO";

export default function BookingsPage() {
    const { bookings, loading } = useUserBookings();

    if (loading) return <BookingsSkeleton />;

    const formattedBookings = bookings
        .slice(0, 10) // Limit to 10 latest entries
        .map((b) => ({
            ...b,
            date: formatRelativeDate(b.date),
            startTime: formatHour(b.startTime),
            endTime: formatHour(b.endTime),
            service: {
                ...b.service,
                price: b.service?.price ? `$${b.service.price}` : "—",
            },
        }));

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
            <SEO title="Mis Citas" description="Revisa y administra tus próximas citas de barbería." />

            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-6 shadow-lg sticky top-16 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                            Mis Citas
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
                                <span className="text-white font-bold text-sm">
                                    {formattedBookings.length}{" "}
                                    {formattedBookings.length === 1 ? "cita" : "citas"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="px-4 pt-6">
                <BookingsTable
                    data={formattedBookings}
                    columns={[
                        { header: "Servicio 🎨", accessor: "service.name" },
                        { header: "Precio 💵", accessor: "service.price" },
                        { header: "Fecha 📅", accessor: "date" },
                        { header: "Inicio ⏰", accessor: "startTime" },
                        { header: "Fin ⏰", accessor: "endTime" },
                        { header: "Notas 📝", accessor: "notes" },
                    ]}
                />
            </div>
        </div>
    );
}