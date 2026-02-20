import { useState } from "react";
import { useUserBookings } from "../hooks/useUserBookings";
import { BookingsTable } from "../components/BookingsTable";
import BookingsSkeleton from "../components/BookingsSkeleton";
import { formatRelativeDate, formatHour, isPastBooking } from "../../../utils/dateUtils";
import SEO from "../../../components/shared/SEO";
import { useTenant } from "../../../context/TenantContext";
import { Trash2, AlertTriangle, Pencil } from "lucide-react";
import RescheduleBookingModal from "../components/RescheduleBookingModal";
import CancelBookingModal from "../components/CancelBookingModal";
import type { Booking } from "../types";
import Toast from "../../../components/ui/Toast";
import { Button } from "../../../components/ui/Button";

export default function BookingsPage() {
    const { bookings, loading, error, cancelBooking, refetch } = useUserBookings();
    const { tenant } = useTenant();
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false,
    });

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar citas</h2>
                    <p className="text-gray-500 mb-6">
                        No pudimos obtener tu historial de citas. Por favor,Verificar que tengas citas programadas o verifica tu conexión o inténtalo de nuevo más tarde.
                    </p>
                    <Button onClick={() => refetch()} variant="secondary">
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

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
                price: b.service?.price ? `₡${b.service.price}` : "—",
            },
        }));

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;

        setIsCancelling(true);
        try {
            await cancelBooking(bookingToCancel);
            setToast({
                message: "Cita cancelada exitosamente",
                type: "error",
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

    const handleRescheduleSuccess = () => {
        setToast({
            message: "Cita reprogramada exitosamente",
            type: "success",
            isVisible: true,
        });
        setBookingToReschedule(null);
        refetch();
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
                className="mx-4 mt-4 px-6 py-6 shadow-xl sticky top-20 z-10 text-white rounded-3xl transition-colors duration-300"
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
                        //{ header: "Notas 📝", accessor: "notes" },
                    ]}
                    renderActions={(booking) => {
                        // Only show cancel button if status is PENDING or CONFIRMED (assuming user can cancel confirmed)
                        if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') return null;

                        const originalBooking = bookings.find(b => b.id === booking.id);
                        const isPast = originalBooking
                            ? isPastBooking(originalBooking.date, originalBooking.startTime)
                            : true;

                        return (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (originalBooking) setBookingToReschedule(originalBooking);
                                    }}
                                    disabled={isPast}
                                    title={isPast ? "No se pueden editar citas pasadas" : "Editar cita"}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border
                                        ${isPast
                                            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                                            : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                        }`}
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => setBookingToCancel(booking.id)}
                                    disabled={isPast}
                                    title={isPast ? "No se pueden cancelar citas pasadas" : "Cancelar cita"}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border
                                        ${isPast
                                            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                                            : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                        }`}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Cancelar
                                </button>
                            </div>
                        );
                    }}
                />
            </div>

            {/* Modal de Confirmación */}
            <CancelBookingModal
                isOpen={!!bookingToCancel}
                isCancelling={isCancelling}
                onClose={() => setBookingToCancel(null)}
                onConfirm={handleConfirmCancel}
            />

            {/* Modal de Reprogramación */}
            <RescheduleBookingModal
                isOpen={!!bookingToReschedule}
                booking={bookingToReschedule}
                onClose={() => setBookingToReschedule(null)}
                onSuccess={handleRescheduleSuccess}
            />
        </div>
    );
}