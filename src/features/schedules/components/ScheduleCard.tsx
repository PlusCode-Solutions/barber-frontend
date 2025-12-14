import { Clock, CalendarOff } from "lucide-react";
import type { Schedule } from "../types";

interface ScheduleCardProps {
    schedule: Schedule;
}

import { useTenant } from "../../../context/TenantContext";

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
    const { tenant } = useTenant();
    const dayName = DAYS[schedule.dayOfWeek];

    // Helper to safely get properties (handles potential casing mismatch)
    const getProp = (obj: any, key: string, altKey: string) => obj[key] || obj[altKey];

    const startTime = getProp(schedule, 'startTime', 'start_time');
    const endTime = getProp(schedule, 'endTime', 'end_time');
    const lunchStartTime = getProp(schedule, 'lunchStartTime', 'lunch_start_time');
    const lunchEndTime = getProp(schedule, 'lunchEndTime', 'lunch_end_time');

    // Formatear hora (ej: 09:00 -> 9:00 AM)
    const formatTime = (time: string) => {
        if (!time) return "";
        try {
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours, 10);
            if (isNaN(h)) return time; // Fallback if parsing fails
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        } catch (e) {
            console.error("Error formatting time:", time, e);
            return time;
        }
    };

    return (
        <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${schedule.isClosed
            ? "bg-gray-50 border-gray-200 opacity-80"
            : "bg-white border-gray-100 shadow-sm hover:shadow-md"
            }`}
            style={!schedule.isClosed ? { borderColor: `${tenant?.primaryColor || '#bfdbfe'}40` } : {}}
        >
            {/* Indicador lateral de estado */}
            <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${schedule.isClosed ? "bg-gray-300" : ""}`}
                style={!schedule.isClosed ? { backgroundColor: tenant?.primaryColor || '#3b82f6' } : {}}
            ></div>

            <div className="p-5 pl-7 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${schedule.isClosed
                            ? "bg-gray-100 text-gray-400"
                            : ""
                            }`}
                        style={!schedule.isClosed ? {
                            backgroundColor: `${tenant?.primaryColor || '#eff6ff'}20`,
                            color: tenant?.primaryColor || '#2563eb'
                        } : {}}
                    >
                        {schedule.isClosed ? <CalendarOff size={20} /> : <Clock size={20} />}
                    </div>

                    <div>
                        <h3 className={`font-bold text-lg ${schedule.isClosed ? "text-gray-500" : "text-gray-900"
                            }`}>
                            {dayName}
                        </h3>
                        <p className={`text-sm font-medium ${schedule.isClosed ? "text-gray-400" : "text-green-600"
                            }`}>
                            {schedule.isClosed ? "Cerrado" : "Abierto"}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    {!schedule.isClosed ? (
                        <>
                            <p className="text-gray-900 font-bold text-lg">
                                {formatTime(startTime)} - {formatTime(endTime)}
                            </p>
                            {lunchStartTime && lunchEndTime && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Receso: {formatTime(lunchStartTime)} - {formatTime(lunchEndTime)}
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
