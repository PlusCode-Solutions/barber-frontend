import { Clock, Scissors } from "lucide-react";

interface BookingItem {
    id: string;
    customerName: string;
    barberName: string;
    service: {
        name: string;
        price: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    status: string;
}

interface BookingsListProps {
    bookings: BookingItem[];
    onSelectBooking?: (booking: BookingItem) => void;
}

export default function BookingsList({ bookings, onSelectBooking }: BookingsListProps) {
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
                    className={`flex items-center justify-between p-4 transition-colors cursor-pointer border-l-4 ${booking.status === 'AVAILABLE'
                            ? 'bg-green-50/50 hover:bg-green-50 border-green-400'
                            : 'bg-white hover:bg-gray-50 border-transparent'
                        }`}
                    onClick={() => onSelectBooking?.(booking)}
                >
                    {/* Left: Client & Service */}
                    <div className="flex flex-col gap-1 min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2">
                            <span className={`truncate ${booking.status === 'AVAILABLE' ? 'text-green-700 font-medium' : 'font-bold text-gray-900'}`}>
                                {booking.customerName}
                            </span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-sm ${booking.status === 'AVAILABLE' ? 'text-green-600/70' : 'text-gray-500'}`}>
                            {booking.status !== 'AVAILABLE' && <Scissors size={14} className="flex-shrink-0" />}
                            <span className="truncate">{booking.service.name}</span>
                        </div>
                    </div>

                    {/* Right: Time & Action */}
                    <div className="flex flex-col items-end flex-shrink-0">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${booking.status === 'AVAILABLE'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}>
                            <Clock size={14} />
                            <span className="text-sm font-semibold tracking-wide">
                                {booking.startTime}
                                {booking.status !== 'AVAILABLE' && ` - ${booking.endTime}`}
                            </span>
                        </div>
                        {/* Optional: Small barber name or price below time if needed */}
                        <span className="text-xs text-gray-400 mt-1">
                            {booking.barberName}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
