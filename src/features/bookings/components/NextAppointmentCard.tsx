import { useEffect, useState } from 'react';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../../context/AuthContext';
import { BookingsService } from '../api/bookings.service';
import type { Booking } from '../types';

export default function NextAppointmentCard() {
    const { user } = useAuth();
    const [nextBooking, setNextBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchBookings = async () => {
            try {
                const bookings = await BookingsService.getUserBookings(user.id);

                // Show the LATEST appointment by date (Desc), regardless of status or if it's past/future
                // as per user request: "ultima cita en agregar"
                const sortedBookings = bookings
                    .sort((a, b) => {
                        const dateA = parseISO(`${a.date}T${a.startTime}`);
                        const dateB = parseISO(`${b.date}T${b.startTime}`);
                        return dateB.getTime() - dateA.getTime(); // Descending (Newest first)
                    });

                setNextBooking(sortedBookings[0] || null);
            } catch (error) {
                console.error("Error fetching next appointment:", error);
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

    const date = parseISO(nextBooking.date);
    const statusParams = getStatusParams(nextBooking.status);

    return (
        <div className={`bg-white rounded-3xl shadow-md p-6 border-l-4 mb-6 relative overflow-hidden ${nextBooking.status === 'CANCELLED' ? 'border-red-500' : 'border-blue-600'
            }`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Calendar size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Tu Última Cita</h2>
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
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fecha</p>
                            <p className="font-bold text-gray-900 capitalize">
                                {format(date, "EEEE d 'de' MMMM", { locale: es })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
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
