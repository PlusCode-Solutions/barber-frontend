import { Calendar as CalendarIcon, ChevronLeft, Clock } from "lucide-react";
import Calendar from "../../../../components/ui/Calendar";
import type { Closure, Schedule } from "../../../schedules/types";
import { format } from "date-fns";
import { safeDate, formatFriendlyDay, getCostaRicaNow, isSameDay } from "../../../../utils/dateUtils";
import { useTenant } from "../../../../context/TenantContext";

interface SelectDateTimeStepProps {
    selectedDate: string;
    availableSlots: string[];
    allPotentialSlots?: string[];
    breakSlots?: string[]; // Lunch/Break hours
    loadingSlots: boolean;
    closures?: Closure[];
    schedules?: Schedule[];
    tenantSchedules?: Schedule[]; // New prop
    onDateChange: (date: string) => void;
    onSelectSlot: (slot: string) => void;
    onBack?: () => void;
    viewOnly?: boolean;
}

export default function SelectDateTimeStep({
    selectedDate,
    availableSlots,
    allPotentialSlots = [],
    breakSlots = [],
    loadingSlots,
    closures = [],
    schedules = [],
    tenantSchedules = [],
    onDateChange,
    onSelectSlot,
    onBack,
    viewOnly = false
}: SelectDateTimeStepProps) {
    const { tenant } = useTenant();
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';
    const dateObj = selectedDate ? safeDate(selectedDate) : null;

    // Combine regular slots with break slots for full day view
    // This ensures break hours appear in the list (styled as orange)
    const combinedSlots = [...new Set([...allPotentialSlots, ...breakSlots])].sort();

    // - Morning (Now < 12): Booking allowed only for Afternoon (>= 12)
    // - Afternoon (Now >= 12): Booking allowed only for Tomorrow (All Today slots hidden)
    const rawDisplaySlots = combinedSlots.length > 0 ? combinedSlots : availableSlots;

    const displaySlots = rawDisplaySlots.filter(slot => {
        if (!selectedDate) return true;

        // Check if selected date is "Today"
        const nowCR = getCostaRicaNow(); // Current CR time
        // Note: isSameDay(string, Date)
        const isToday = isSameDay(selectedDate, nowCR);

        if (!isToday) return true; // Future dates are fully open

        const currentHour = nowCR.getHours();
        const slotHour = parseInt(slot.split(':')[0]);
        const isSlotMorning = slotHour < 12;

        // Rule 1: Morning slots are never bookable "Today"
        // (If it's Morning, must book Afternoon. If it's Afternoon, must book Tomorrow).
        if (isSlotMorning) return false;

        // Rule 2: Afternoon slots are only bookable if it's currently Morning (< 12)
        // If it's already Afternoon (currentHour >= 12), then Afternoon slots are same-shift -> Blocked.
        if (currentHour >= 12) return false;

        return true;
    });

    const morningSlots = displaySlots.filter(slot => parseInt(slot.split(':')[0]) < 12);
    const afternoonSlots = displaySlots.filter(slot => parseInt(slot.split(':')[0]) >= 12);

    const handleSlotClick = (slot: string) => {
        if (viewOnly) {
            // Optional: Show toast explaining why they can't book
            return;
        }
        onSelectSlot(slot);
    };

    return (
        <div role="region" aria-label="Selección de fecha y hora">
            <div className="flex items-center gap-2 mb-6">
                <CalendarIcon size={24} aria-hidden="true" style={{ color: primaryColor }} />
                <h3 className="text-xl font-bold text-gray-900">Fecha y Hora</h3>
            </div>

            {viewOnly && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm">
                    <strong>Modo Consulta:</strong> Puedes ver los horarios disponibles, pero no puedes agendar nuevas citas porque has alcanzado tu límite.
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Column 1: Calendar */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Selecciona la fecha
                    </label>
                    <Calendar
                        selectedDate={dateObj}
                        onDateSelect={(date) => onDateChange(format(date, 'yyyy-MM-dd'))}
                        closures={closures}
                        schedules={schedules}
                        tenantSchedules={tenantSchedules}
                        className="w-full"
                        maxDate={new Date(new Date().getFullYear(), 11, 31)}
                    />
                </div>

                {/* Column 2: Slots */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Horarios disponibles
                        {dateObj && <span className="font-normal text-gray-500 ml-1">
                            para el {formatFriendlyDay(dateObj)}
                        </span>}
                    </label>

                    {!selectedDate ? (
                        <div className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                            <CalendarIcon size={48} className="mb-2 opacity-20" />
                            <p>Selecciona una fecha en el calendario para ver los horarios</p>
                        </div>
                    ) : loadingSlots ? (
                        <div className="h-64 border-2 border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-500">
                            <div
                                className="animate-spin rounded-full h-8 w-8 border-b-2 mb-3"
                                style={{ borderColor: primaryColor }}
                            ></div>
                            <p>Buscando disponibilidad...</p>
                        </div>
                    ) : displaySlots.length === 0 ? (
                        <div className="h-64 border-2 border-gray-100 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                            <Clock size={48} className="mb-2 opacity-20" />
                            {(() => {
                                const nowCR = getCostaRicaNow();
                                const isToday = selectedDate && isSameDay(selectedDate, nowCR);
                                if (isToday && nowCR.getHours() >= 12) {
                                    return (
                                        <>
                                            <p className="font-medium text-gray-900">Agenda Cerrada por Hoy</p>
                                            <p className="text-sm mt-1 text-orange-600 max-w-xs">
                                                Solo se puede agendar con una jornada de anticipación.
                                                Por favor selecciona <strong>Mañana</strong>.
                                            </p>
                                        </>
                                    );
                                }
                                return (
                                    <>
                                        <p className="font-medium text-gray-900">No hay horarios disponibles</p>
                                        <p className="text-sm mt-1">Intenta seleccionar otra fecha o barbero.</p>
                                    </>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                            {morningSlots.length > 0 && (
                                <div>
                                    <h4 className="text-center font-bold text-gray-800 mb-3 text-sm tracking-wide">MAÑANA</h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3" role="group" aria-label="Horarios de mañana">
                                        {morningSlots.map((slot) => {
                                            const isAvailable = availableSlots.includes(slot);
                                            const isBreak = breakSlots.includes(slot);
                                            const isOccupied = !isAvailable && !isBreak && allPotentialSlots.length > 0;
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => isAvailable && handleSlotClick(slot)}
                                                    disabled={!isAvailable || viewOnly}
                                                    className={`
                                                        border rounded-full py-2 px-1 text-sm font-medium transition focus:outline-none whitespace-nowrap
                                                        ${isBreak
                                                            ? 'bg-orange-50 border-orange-200 text-orange-500 cursor-not-allowed opacity-70'
                                                            : isOccupied
                                                                ? 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-60'
                                                                : viewOnly
                                                                    ? 'bg-green-50 border-green-200 text-green-700 cursor-default opacity-80'
                                                                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                                                        }
                                                        ${selectedDate && isAvailable && !viewOnly ? 'hover:scale-105 active:scale-95' : ''}
                                                    `}
                                                    aria-label={isBreak ? `Descanso ${slot}` : isOccupied ? `Horario ocupado ${slot}` : `Seleccionar horario ${slot}`}
                                                >
                                                    {slot}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {afternoonSlots.length > 0 && (
                                <div>
                                    <h4 className="text-center font-bold text-gray-800 mb-3 text-sm tracking-wide">TARDE</h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3" role="group" aria-label="Horarios de tarde">
                                        {afternoonSlots.map((slot) => {
                                            const isAvailable = availableSlots.includes(slot);
                                            const isBreak = breakSlots.includes(slot);
                                            const isOccupied = !isAvailable && !isBreak && allPotentialSlots.length > 0;
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => isAvailable && handleSlotClick(slot)}
                                                    disabled={!isAvailable || viewOnly}
                                                    className={`
                                                        border rounded-full py-2 px-1 text-sm font-medium transition focus:outline-none whitespace-nowrap
                                                        ${isBreak
                                                            ? 'bg-orange-50 border-orange-200 text-orange-500 cursor-not-allowed opacity-70'
                                                            : isOccupied
                                                                ? 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-60'
                                                                : viewOnly
                                                                    ? 'bg-green-50 border-green-200 text-green-700 cursor-default opacity-80'
                                                                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                                                        }
                                                        ${selectedDate && isAvailable && !viewOnly ? 'hover:scale-105 active:scale-95' : ''}
                                                    `}
                                                    aria-label={isBreak ? `Descanso ${slot}` : isOccupied ? `Horario ocupado ${slot}` : `Seleccionar horario ${slot}`}
                                                >
                                                    {slot}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="mt-8 flex items-center gap-2 text-gray-500 font-medium hover:text-gray-900 transition-colors"
                    aria-label="Volver al paso anterior"
                >
                    <ChevronLeft size={20} aria-hidden="true" />
                    Volver a selección de barbero
                </button>
            )}
        </div>
    );
}
