import { useEffect, useState } from 'react';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { BookingsService } from '../api/bookings.service';
import type { Booking } from '../types';
import { formatFullDate, safeDate } from '../../../utils/dateUtils';

export default function NextAppointmentCard() {
    const { user } = useAuth();
    const [nextBooking, setNextBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchBookings = async () => {
            try {
                const bookings = await BookingsService.getUserBookings(user.id);

                // Filter for "ACTIVE" bookings (Pending/Confirmed and Future)
                // And sort ASCENDING (Closest date first)
                const now = new Date();
                const activeBookings = bookings
                    .filter(b => {
                        if (b.status === 'CANCELLED' || b.status === 'COMPLETED') return false;
                        const bDate = safeDate(b.date);
                        if (!bDate) return false;

                        // Check if it's future (including today if time hasn't passed)
                        // We can use isPastBooking logic manually or just date check to be safe
                        // Simple check: date >= today (ignoring time precision for list filter)
                        return bDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    })
                    .sort((a, b) => {
                        const dateA = safeDate(a.date)?.getTime() || 0;
                        const dateB = safeDate(b.date)?.getTime() || 0;
                        // Determine order:
                        // 1. Primary: Date Ascending
                        if (dateA !== dateB) return dateA - dateB;

                        // 2. Secondary: Time Ascending
                        const timeA = parseInt(a.startTime.replace(':', ''));
                        const timeB = parseInt(b.startTime.replace(':', ''));
                        return timeA - timeB;
                    });

                setNextBooking(activeBookings[0] || null);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setNextBooking(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user?.id]);

    const getStatusParams = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return { label: 'Confirmada', className: 'bg-green-100 text-green-800' };
            case 'PENDING':
                return { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' };
            case 'CANCELLED':
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

    if (!nextBooking) return null;

    const dateStr = nextBooking.date;
    const statusParams = getStatusParams(nextBooking.status);

    return (
        <div
            className={`bg-white rounded-3xl shadow-md p-6 border-l-4 mb-6 relative overflow-hidden`}
            style={{
                borderColor: nextBooking.status === 'CANCELLED' ? '#ef4444' : 'var(--secondary-color, #2563eb)'
            }}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Calendar size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Tu Próxima Cita</h2>
                        <p className="text-gray-500 text-sm">
                            {nextBooking.status === 'CANCELLED'
                                ? 'Esta cita está cancelada'
                                : 'No olvides llegar a tiempo 🕒'}
                        </p>
                    </div>
                    <span className={`${statusParams.className} text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                        {statusParams.label}
                    </span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            style={{
                                backgroundColor: 'rgba(var(--secondary-rgb, 37, 99, 235), 0.1)',
                                color: 'var(--secondary-color, #2563eb)'
                            }}
                        >
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fecha</p>
                            <p className="font-bold text-gray-900 capitalize">
                                {formatFullDate(dateStr)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            style={{
                                backgroundColor: 'rgba(var(--secondary-rgb, 79, 70, 229), 0.1)',
                                color: 'var(--secondary-color, #4f46e5)'
                            }}
                        >
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hora</p>
                            <p className="font-bold text-gray-900">
                                {nextBooking.startTime} - {nextBooking.endTime}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-gray-200 pt-3 mt-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                            <UserIcon size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                {nextBooking.barber?.name || 'Barbero asignado'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {nextBooking.service?.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
