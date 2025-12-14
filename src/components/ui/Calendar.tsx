import { useState, useMemo } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    isBefore,
    startOfDay,
    getDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Closure, Schedule } from '../../features/schedules/types';

interface CalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    closures?: Closure[];
    schedules?: Schedule[];
    className?: string;
    minDate?: Date;
}

export default function Calendar({
    selectedDate,
    onDateSelect,
    closures = [],
    schedules = [],
    className = "",
    minDate = startOfDay(new Date())
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Generate days
    const days = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const getDayStatus = (day: Date) => {
        const isPast = isBefore(day, minDate);
        if (isPast) return 'disabled';

        // Check for specific closure
        const closure = closures.find(c => isSameDay(new Date(c.date), day));
        if (closure) return 'closed';

        // Check for work schedule
        // date-fns getDay returns 0 for Sunday, 1 for Monday... matching our Schedule type
        const dayOfWeek = getDay(day);
        const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek);

        // If no schedule found for this day OR schedule says isClosed => OFF SCHEDULE
        if (!schedule || schedule.isClosed) {
            return 'off-schedule';
        }

        return 'available';
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    disabled={isSameMonth(currentMonth, new Date())} // Prevent going back past current month loosely
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="font-bold text-gray-900 capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                    const status = getDayStatus(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    let buttonClass = "h-10 w-full rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ";

                    if (status === 'disabled') {
                        buttonClass += "text-gray-300 cursor-not-allowed bg-gray-50";
                    } else if (status === 'closed') {
                        buttonClass += "bg-red-50 text-red-300 cursor-not-allowed"; // Specific closure
                    } else if (status === 'off-schedule') {
                        buttonClass += "bg-yellow-50 text-yellow-500 cursor-not-allowed opacity-80"; // Off schedule (yellow)
                    } else if (isSelected) {
                        buttonClass += "bg-blue-600 text-white shadow-md transform scale-105";
                    } else if (!isCurrentMonth) {
                        buttonClass += "text-gray-400";
                    } else {
                        buttonClass += "text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium";
                    }

                    if (isToday(day) && !isSelected) {
                        buttonClass += " border border-blue-200";
                    }

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => status === 'available' && onDateSelect(day)}
                            className={buttonClass}
                            disabled={status !== 'available'}
                        >
                            <span>{format(day, 'd')}</span>
                            {/* Dot for closures */}
                            {status === 'closed' && (
                                <span className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full"></span>
                            )}
                            {/* Dot for off-schedule - maybe yellow/orange? */}
                            {status === 'off-schedule' && (
                                <span className="absolute bottom-1 w-1 h-1 bg-yellow-400 rounded-full"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend/Info */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 justify-center border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Seleccionado</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span>Cerrado</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span>Descanso</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full border border-blue-200"></span>
                    <span>Hoy</span>
                </div>
            </div>
        </div>
    );
}
