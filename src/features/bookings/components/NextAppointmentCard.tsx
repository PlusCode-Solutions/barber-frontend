import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Trash2, CalendarClock, Layers } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTenant } from '../../../context/TenantContext';
import type { Booking } from '../types';
import { useUserBookings } from '../hooks/useUserBookings';
import CancelBookingModal from './CancelBookingModal';
import RescheduleBookingModal from './RescheduleBookingModal';
import Toast from '../../../components/ui/Toast';
import { safeDate, isPastBooking, formatHour } from '../../../utils/dateUtils';
import { ApiError, getErrorMessage } from '../../../lib/errorHandler';

const MAX_VISIBLE = 2;

function shortDate(dateStr: string): { day: string; month: string; weekday: string } {
    const d = safeDate(dateStr);
    if (!d) return { day: '--', month: '', weekday: '' };
    return {
        day: String(d.getUTCDate()).padStart(2, '0'),
        month: d.toLocaleDateString('es-ES', { month: 'short', timeZone: 'UTC' }).replace('.', ''),
        weekday: d.toLocaleDateString('es-ES', { weekday: 'short', timeZone: 'UTC' }).replace('.', ''),
    };
}

export default function NextAppointmentCard() {
    const { user } = useAuth();
    const { tenant } = useTenant();
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';
    const { bookings, loading, cancelBooking } = useUserBookings();
    const [upcoming, setUpcoming] = useState<Booking[]>([]);
    // Índice de la carta al frente (0 o 1). Solo aplica cuando hay 2.
    const [frontIndex, setFrontIndex] = useState(0);

    // Cancellation state
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    // Reschedule state (reuses RescheduleBookingModal -> PATCH, never DELETE)
    const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isVisible: boolean }>({
        message: "",
        type: "success", // Will be overridden to error for red styling
        isVisible: false,
    });

    // Use QueryClient to invalidate queries
    const queryClient = useQueryClient();

    // Use the custom hook data
    useEffect(() => {
        if (!user?.id || loading) return;

        const activeBookings = bookings
            .filter(b => {
                if (b.status === 'CANCELED' || b.status === 'COMPLETED') return false;
                return !isPastBooking(b.date, b.startTime);
            })
            .sort((a, b) => {
                const dateA = safeDate(a.date)?.getTime() || 0;
                const dateB = safeDate(b.date)?.getTime() || 0;
                if (dateA !== dateB) return dateA - dateB;
                const timeA = parseInt(a.startTime.replace(':', ''));
                const timeB = parseInt(b.startTime.replace(':', ''));
                return timeA - timeB;
            });

        setUpcoming(activeBookings.slice(0, MAX_VISIBLE));
        setFrontIndex(0);
    }, [user?.id, bookings, loading]);

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
            queryClient.invalidateQueries({ queryKey: ['bookings'] }); // Update ALL lists including dashboard
        } catch (error) {
            const isForbidden = (error as ApiError)?.statusCode === 403;
            setToast({
                message: isForbidden
                    ? "No tienes permiso para eliminar citas"
                    : getErrorMessage(error),
                type: "error",
                isVisible: true,
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const getStatusParams = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return { label: 'Confirmada', className: 'bg-green-100 text-green-800' };
            case 'PENDING':
                return { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' };
            case 'CANCELED':
                return { label: 'Cancelada', className: 'bg-red-100 text-red-800' };
            case 'COMPLETED':
                return { label: 'Completada', className: 'bg-gray-100 text-gray-800' };
            default:
                return { label: status, className: 'bg-blue-100 text-blue-800' };
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100 mb-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-gray-100 rounded-xl"></div>
            </div>
        );
    }

    if (upcoming.length === 0) return null;

    const swap = () => setFrontIndex((i) => (i === 0 ? 1 : 0));

    // --- Una sola cita: tarjeta simple ---
    if (upcoming.length === 1) {
        const booking = upcoming[0];
        const sd = shortDate(booking.date);
        const statusParams = getStatusParams(booking.status);
        return (
            <div
                className="bg-white rounded-3xl shadow-md p-9 border-2 mb-6 relative overflow-hidden min-h-[320px] flex flex-col justify-center"
                style={{ borderColor: primaryColor }}
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Calendar size={120} />
                </div>
                <div className="relative z-10">
                    <h2 className="text-lg font-bold text-gray-900">Tu Próxima Cita</h2>
                    <p className="text-gray-500 text-sm mb-3">No olvides llegar a tiempo 🕒</p>
                    <div className="bg-gray-50 rounded-2xl p-5 flex items-center gap-4 border border-gray-100">
                        <div
                            className="w-16 shrink-0 rounded-xl text-center py-2.5 text-white shadow-sm"
                            style={{ backgroundColor: 'var(--secondary-color, #2563eb)' }}
                        >
                            <p className="text-2xl font-extrabold leading-none">{sd.day}</p>
                            <p className="text-[10px] font-bold uppercase leading-tight">{sd.month}</p>
                            <p className="text-[10px] uppercase opacity-80 leading-tight">{sd.weekday}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-lg truncate">
                                {formatHour(booking.startTime, "12h")} - {formatHour(booking.endTime, "12h")}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                                {booking.service?.name || 'Servicio'} · {booking.professional?.name || 'Profesional'}
                            </p>
                            <span className={`${statusParams.className} inline-block mt-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                                {statusParams.label}
                            </span>
                        </div>
                    </div>
                    {/* Botones con etiqueta, responsivos: apilados en móvil, lado a lado en sm+ */}
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => setBookingToReschedule(booking)}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-xl transition-all shadow-md hover:shadow-lg font-bold text-sm"
                        >
                            <CalendarClock size={17} />
                            Reagendar
                        </button>
                        <button
                            onClick={() => setBookingToCancel(booking.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 py-3 rounded-xl transition-all shadow-md hover:shadow-lg font-bold text-sm"
                        >
                            <Trash2 size={17} />
                            Eliminar
                        </button>
                    </div>
                </div>
                {/* Número en la esquina inferior de la carta */}
                <span
                    title="Cita 1"
                    className="absolute bottom-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full text-white text-sm font-extrabold shadow"
                    style={{ backgroundColor: primaryColor }}
                >
                    1
                </span>

                <CancelBookingModal
                    isOpen={!!bookingToCancel}
                    isCancelling={isCancelling}
                    onClose={() => setBookingToCancel(null)}
                    onConfirm={handleConfirmCancel}
                />
                <RescheduleBookingModal
                    isOpen={!!bookingToReschedule}
                    booking={bookingToReschedule}
                    onClose={() => setBookingToReschedule(null)}
                    onSuccess={() => {
                        setBookingToReschedule(null);
                        setToast({ message: "Cita reagendada exitosamente", type: "info", isVisible: true });
                        queryClient.invalidateQueries({ queryKey: ['bookings'] });
                    }}
                />
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast({ ...toast, isVisible: false })}
                />
            </div>
        );
    }

    // --- Dos citas: mazo de cartas ---
    const front = upcoming[frontIndex];
    const back = upcoming[frontIndex === 0 ? 1 : 0];
    const frontDate = shortDate(front.date);
    const backDate = shortDate(back.date);
    const frontStatus = getStatusParams(front.status);

    const cardBody = (booking: Booking, interactive: boolean) => {
        const sd = shortDate(booking.date);
        const st = getStatusParams(booking.status);
        return (
            <>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center gap-4 border border-gray-100">
                <div
                    className="w-16 shrink-0 rounded-xl text-center py-2.5 text-white shadow-sm"
                    style={{ backgroundColor: 'var(--secondary-color, #2563eb)' }}
                >
                    <p className="text-2xl font-extrabold leading-none">{sd.day}</p>
                    <p className="text-[10px] font-bold uppercase leading-tight">{sd.month}</p>
                    <p className="text-[10px] uppercase opacity-80 leading-tight">{sd.weekday}</p>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-lg truncate">
                        {formatHour(booking.startTime, "12h")} - {formatHour(booking.endTime, "12h")}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                        {booking.service?.name || 'Servicio'} · {booking.professional?.name || 'Profesional'}
                    </p>
                    <span className={`${st.className} inline-block mt-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                        {st.label}
                    </span>
                </div>
            </div>
            {/* Botones con etiqueta, responsivos: apilados en móvil, lado a lado en sm+.
                Siempre se renderizan (invisibles atrás) para que ambas cartas midan lo mismo
                y no cambien de tamaño al intercambiar. */}
            <div
                aria-hidden={!interactive}
                className={`mt-4 flex flex-col sm:flex-row gap-2 ${interactive ? '' : 'invisible select-none'}`}
            >
                    <button
                        onClick={() => interactive && setBookingToReschedule(booking)}
                        tabIndex={interactive ? 0 : -1}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-xl transition-all shadow-md hover:shadow-lg font-bold text-sm"
                    >
                        <CalendarClock size={17} />
                        Reagendar
                    </button>
                    <button
                        onClick={() => interactive && setBookingToCancel(booking.id)}
                        tabIndex={interactive ? 0 : -1}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 py-3 rounded-xl transition-all shadow-md hover:shadow-lg font-bold text-sm"
                    >
                        <Trash2 size={17} />
                        Eliminar
                    </button>
                </div>
        </>
        );
    };

    return (
        <div className="mb-6 w-full max-w-full min-w-0">
            <div className="flex justify-between items-center mb-3 px-1">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Tus Próximas Citas</h2>
                    <p className="text-gray-500 text-sm">Toca la esquina para ver la otra 🃏</p>
                </div>
                {/* Indicadores */}
                <div className="flex gap-1.5">
                    {[0, 1].map((i) => (
                        <button
                            key={i}
                            onClick={() => setFrontIndex(i)}
                            aria-label={`Ver cita ${i + 1}`}
                            className={`h-2 rounded-full transition-all ${frontIndex === i ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Mazo: las 2 cartas en la misma celda, la de atrás corrida a la derecha y arriba.
                key={frontIndex} re-monta las cartas en cada cambio para repetir la animación. */}
            <div key={frontIndex} className="grid grid-cols-[minmax(0,1fr)] px-4 pt-4 min-w-0">
                {/* Carta de atrás (vista previa, clic = traer al frente) */}
                <div
                    onClick={swap}
                    title="Ver esta cita"
                    className="col-start-1 row-start-1 w-full max-w-full min-w-0 overflow-hidden animate-card-back translate-x-4 -translate-y-3 rotate-2 scale-[0.97] opacity-90 cursor-pointer hover:translate-x-5 hover:opacity-100 transition-all duration-300 bg-white rounded-3xl shadow-lg p-9 border-2 z-0 min-h-[320px] flex flex-col justify-center relative"
                    style={{ borderColor: `${primaryColor}55` }}
                >
                    <div className="flex justify-between items-center gap-2 mb-2 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate min-w-0">
                            {backDate.day} {backDate.month} · {formatHour(back.startTime, "12h")}
                        </span>
                        <span className="shrink-0 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            Ver →
                        </span>
                    </div>
                    {cardBody(back, false)}
                    {/* Número en la esquina inferior de la carta */}
                    <span
                        title={`Cita ${frontIndex === 0 ? 2 : 1}`}
                        className="absolute bottom-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-white text-sm font-extrabold shadow"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {frontIndex === 0 ? 2 : 1}
                    </span>
                </div>

                {/* Carta del frente */}
                <div className="col-start-1 row-start-1 w-full max-w-full min-w-0 z-10 transition-all duration-300 animate-card-front bg-white rounded-3xl shadow-md p-9 border-2 relative overflow-hidden min-h-[320px] flex flex-col justify-center"
                    style={{ borderColor: primaryColor }}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Calendar size={120} />
                    </div>
                    {/* Botón esquina para intercambiar, color del tenant */}
                    <button
                        onClick={swap}
                        title="Cambiar a la otra cita"
                        aria-label="Cambiar a la otra cita"
                        style={{ backgroundColor: primaryColor }}
                        className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full text-white shadow transition hover:brightness-110 active:scale-95"
                    >
                        <Layers size={15} />
                    </button>
                    <div className="relative z-10 pr-8 min-w-0">
                        <div className="flex justify-between items-center gap-2 mb-2 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate min-w-0">
                                {frontIndex === 0 ? 'Cita 1 de 2' : 'Cita 2 de 2'} · {frontDate.day} {frontDate.month}
                            </span>
                            <span className={`${frontStatus.className} shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase`}>
                                {frontStatus.label}
                            </span>
                        </div>
                        {cardBody(front, true)}
                    </div>
                    {/* Número en la esquina inferior de la carta */}
                    <span
                        title={`Cita ${frontIndex + 1}`}
                        className="absolute bottom-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full text-white text-sm font-extrabold shadow"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {frontIndex + 1}
                    </span>
                </div>
            </div>

            <CancelBookingModal
                isOpen={!!bookingToCancel}
                isCancelling={isCancelling}
                onClose={() => setBookingToCancel(null)}
                onConfirm={handleConfirmCancel}
            />
            <RescheduleBookingModal
                isOpen={!!bookingToReschedule}
                booking={bookingToReschedule}
                onClose={() => setBookingToReschedule(null)}
                onSuccess={() => {
                    setBookingToReschedule(null);
                    setToast({ message: "Cita reagendada exitosamente", type: "info", isVisible: true });
                    queryClient.invalidateQueries({ queryKey: ['bookings'] });
                }}
            />
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
}
