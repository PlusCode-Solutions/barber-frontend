import { useState } from "react";
import { useUserBookings } from "../hooks/useUserBookings";
import { BookingsTable } from "../components/BookingsTable";
import BookingsSkeleton from "../components/BookingsSkeleton";
import { formatRelativeDate, formatHour } from "../../../utils/dateUtils";
import SEO from "../../../components/shared/SEO";
import { useTenant } from "../../../context/TenantContext";
import { Trash2, AlertTriangle } from "lucide-react";
import Toast from "../../../components/ui/Toast";
import { Button } from "../../../components/ui/Button";

export default function BookingsPage() {
    const { bookings, loading, cancelBooking } = useUserBookings();
    const { tenant } = useTenant();
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false,
    });

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

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;

        setIsCancelling(true);
        try {
            await cancelBooking(bookingToCancel);
            setToast({
                message: "Cita cancelada exitosamente",
                type: "success",
                isVisible: true,
            });
            setBookingToCancel(null);
        } catch (error: any) {
            const isForbidden = error?.response?.status === 403;
            setToast({
                message: isForbidden
                    ? "No tienes permiso para eliminar citas (Falta permiso 'bookings.delete')"
                    : "Error al cancelar la cita. Inténtalo de nuevo.",
                type: "error",
                isVisible: true,
            });
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
            <SEO title="Mis Citas" description="Revisa y administra tus próximas citas de barbería." />

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            {/* HEADER */}
            <div
                className="px-6 pt-8 pb-6 shadow-lg sticky top-16 z-10 text-white transition-colors duration-300"
                style={{ backgroundColor: tenant?.primaryColor || tenant?.secondaryColor || '#2563eb' }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight">
                            Mis Citas
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
                                <span className="font-bold text-sm">
                                    {formattedBookings.length}{" "}
                                    {formattedBookings.length === 1 ? "cita" : "citas"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    renderActions={(booking) => {
                        // Only show cancel button if status is PENDING or CONFIRMED (assuming user can cancel confirmed)
                        if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') return null;

                        return (
                            <button
                                onClick={() => setBookingToCancel(booking.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Cancelar
                            </button>
                        );
                    }}
                />
            </div>

            {/* Modal de Confirmación */}
            {bookingToCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-inner">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                ¿Cancelar Cita?
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Esta acción no se puede deshacer. ¿Estás seguro de que deseas continuar?
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setBookingToCancel(null)}
                                className="flex-1 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300"
                            >
                                Volver
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleConfirmCancel}
                                isLoading={isCancelling}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                            >
                                Sí, Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}