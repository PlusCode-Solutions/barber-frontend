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
    startOfDay,
    getDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Closure, Schedule } from '../../features/schedules/types';
import { getCostaRicaNow, formatDateForInput, normalizeDateString } from '../../utils/dateUtils';

interface CalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    closures?: Closure[];
    schedules?: Schedule[];
    tenantSchedules?: Schedule[];
    barberId?: string; // Selected barber ID for filtering closures
    className?: string;
    minDate?: Date;
    maxDate?: Date;
}

export default function Calendar({
    selectedDate,
    onDateSelect,
    closures = [],
    schedules = [],
    tenantSchedules = [],
    barberId,
    className = "",
    minDate,
    maxDate
}: CalendarProps) {
    const nowCR = getCostaRicaNow();
    const effectiveMinDate = minDate || startOfDay(nowCR);
    const [currentMonth, setCurrentMonth] = useState(nowCR);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const days = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const getDayStatus = (day: Date) => {
        const dayLabel = format(day, 'yyyy-MM-dd');
        const minDateLabel = formatDateForInput(effectiveMinDate);

        if (dayLabel < minDateLabel) return 'disabled';
        if (maxDate && dayLabel > formatDateForInput(maxDate)) return 'disabled';

        const closure = closures.find(c => {
            const isDateMatch = normalizeDateString(c.date) === dayLabel;
            const isScopeMatch = !c.barberId || (barberId && c.barberId === barberId);
            const isFullDay = c.isFullDay === true || c.isFullDay === undefined;
            return isDateMatch && isScopeMatch && isFullDay;
        });
        if (closure) return 'closed';

        const dayOfWeek = getDay(day);

        // 1. Check Tenant Schedule
        const tenantSchedule = tenantSchedules.length > 0
            ? tenantSchedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek))
            : null;

        if (tenantSchedules.length > 0 && (!tenantSchedule || tenantSchedule.isClosed)) {
            return 'off-schedule';
        }

        // 2. Check Barber Schedule
        const schedule = schedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));

        if (schedules.length > 0 && (!schedule || schedule.isClosed)) {
            return 'off-schedule';
        }

        if (!schedule && !tenantSchedule) return 'off-schedule';

        return 'available';
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    disabled={isSameMonth(currentMonth, new Date())}
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

            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                    const status = getDayStatus(day);
                    const dayLabel = format(day, 'yyyy-MM-dd');
                    const selectedLabel = selectedDate ? formatDateForInput(selectedDate) : null;
                    const todayLabel = formatDateForInput(nowCR);
                    const isSelected = dayLabel === selectedLabel;
                    const isDayToday = dayLabel === todayLabel;
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    let buttonClass = "h-10 w-full rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ";

                    if (status === 'disabled') {
                        buttonClass += "text-gray-300 cursor-not-allowed bg-gray-50";
                    } else if (status === 'closed' || status === 'off-schedule') {
                        buttonClass += "bg-red-50 text-red-400 font-medium cursor-not-allowed";
                    } else if (isSelected) {
                        buttonClass += "bg-blue-600 text-white shadow-md transform scale-105";
                    } else if (!isCurrentMonth) {
                        buttonClass += "text-gray-400";
                    } else {
                        buttonClass += "text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium";
                    }

                    if (isDayToday && !isSelected) {
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
                            {/* Dot for off-schedule */}
                            {status === 'off-schedule' && (
                                <span className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full"></span>
                            )}
                        </button>
                    );
                })}
            </div>

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
                    <span className="w-2 h-2 rounded-full border border-blue-200"></span>
                    <span>Hoy</span>
                </div>
            </div>
        </div>
    );
}
