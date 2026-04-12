import { Ban, Clock, Scissors, Trash2 } from "lucide-react";
import { formatHour } from "../../../utils/dateUtils";

interface BookingItem {
    id: string;
    customerName: string;
    professionalName: string;
    service: {
        name: string;
        price: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    isOwner?: boolean;
}

interface BookingsListProps {
    bookings: BookingItem[];
    onSelectBooking?: (booking: BookingItem) => void;
    onCancelBooking?: (booking: BookingItem) => void;
}

export default function BookingsList({ bookings, onSelectBooking, onCancelBooking }: BookingsListProps) {
    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No hay citas para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    className={`flex items-center justify-between p-4 transition-colors border-l-4 ${booking.status === 'AVAILABLE'
                            ? 'cursor-pointer bg-green-50/50 hover:bg-green-50 border-green-400'
                            : booking.status === 'CLOSED'
                                ? 'cursor-default bg-orange-50/50 border-orange-400'
                                : 'cursor-pointer bg-white hover:bg-gray-50 border-transparent'
                        }`}
                    onClick={() => onSelectBooking?.(booking)}
                >
                    {/* Left: Client & Service */}
                    <div className="flex flex-col gap-1 min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2">
                            <span className={`truncate ${booking.status === 'AVAILABLE' ? 'text-green-700 font-medium' : booking.status === 'CLOSED' ? 'text-orange-700 font-medium' : 'font-bold text-gray-900'}`}>
                                {booking.customerName}
                            </span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-sm ${booking.status === 'AVAILABLE' ? 'text-green-600/70' : booking.status === 'CLOSED' ? 'text-orange-600/70' : 'text-gray-500'}`}>
                            {booking.status !== 'AVAILABLE' && booking.status !== 'CLOSED' && <Scissors size={14} className="flex-shrink-0" />}
                            {booking.status === 'CLOSED' && <Ban size={14} className="flex-shrink-0" />}
                            <span className="truncate">{booking.service.name}</span>
                        </div>
                    </div>

                    {/* Right: Time & Action */}
                    <div className="flex flex-col items-end flex-shrink-0">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${booking.status === 'AVAILABLE' ? 'bg-green-100 text-green-700'
                                : booking.status === 'CLOSED' ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-50 text-blue-700'
                            }`}>
                            <Clock size={14} />
                            <span className="text-sm font-semibold tracking-wide">
                                {formatHour(booking.startTime, "12h")}
                                {booking.status !== 'AVAILABLE' && ` - ${formatHour(booking.endTime, "12h")}`}
                            </span>
                        </div>
                        {/* Optional: Small professional name or price below time if needed */}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">
                                {booking.professionalName}
                            </span>
                            {booking.isOwner && onCancelBooking && booking.status !== 'AVAILABLE' && booking.status !== 'CLOSED' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCancelBooking(booking);
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    title="Eliminar reservación"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
