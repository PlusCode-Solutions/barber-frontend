import { Clock, CalendarOff } from "lucide-react";
import type { Schedule } from "../types";

interface ScheduleCardProps {
    schedule: Schedule;
}

const DAYS = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
];

export default function ScheduleCard({ schedule }: ScheduleCardProps) {
    const dayName = DAYS[schedule.dayOfWeek];

    // Formatear hora (ej: 09:00 -> 9:00 AM)
    const formatTime = (time: string) => {
        if (!time) return "";
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${schedule.isDayOff
            ? "bg-gray-50 border-gray-200 opacity-80"
            : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200"
            }`}>
            {/* Indicador lateral de estado */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${schedule.isDayOff
                ? "bg-gray-300"
                : "bg-gradient-to-b from-blue-500 to-indigo-600"
                }`}></div>

            <div className="p-5 pl-7 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${schedule.isDayOff
                        ? "bg-gray-100 text-gray-400"
                        : "bg-blue-50 text-blue-600"
                        }`}>
                        {schedule.isDayOff ? <CalendarOff size={20} /> : <Clock size={20} />}
                    </div>

                    <div>
                        <h3 className={`font-bold text-lg ${schedule.isDayOff ? "text-gray-500" : "text-gray-900"
                            }`}>
                            {dayName}
                        </h3>
                        <p className={`text-sm font-medium ${schedule.isDayOff ? "text-gray-400" : "text-green-600"
                            }`}>
                            {schedule.isDayOff ? "Cerrado" : "Abierto"}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    {!schedule.isDayOff ? (
                        <>
                            <p className="text-gray-900 font-bold text-lg">
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </p>
                            {schedule.breakStartTime && schedule.breakEndTime && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Receso: {formatTime(schedule.breakStartTime)} - {formatTime(schedule.breakEndTime)}
                                </p>
                            )}
                        </>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Descanso
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
