import { Calendar as CalendarIcon, ChevronLeft, Clock } from "lucide-react";
import Calendar from "../../../../components/ui/Calendar";
import type { Closure, Schedule } from "../../../schedules/types";
import { format } from "date-fns";
import { safeDate, formatFriendlyDay } from "../../../../utils/dateUtils";
import { useTenant } from "../../../../context/TenantContext";

interface SelectDateTimeStepProps {
    selectedDate: string;
    availableSlots: string[];
    allPotentialSlots?: string[];
    breakSlots?: string[]; // Lunch/Break hours
    loadingSlots: boolean;
    closures?: Closure[];
    schedules?: Schedule[];
    onDateChange: (date: string) => void;
    onSelectSlot: (slot: string) => void;
    onBack?: () => void;
}

export default function SelectDateTimeStep({
    selectedDate,
    availableSlots,
    allPotentialSlots = [],
    breakSlots = [],
    loadingSlots,
    closures = [],
    schedules = [],
    onDateChange,
    onSelectSlot,
    onBack
}: SelectDateTimeStepProps) {
    const { tenant } = useTenant();
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';
    const dateObj = selectedDate ? safeDate(selectedDate) : null;

    // Combine regular slots with break slots for full day view
    // This ensures break hours appear in the list (styled as orange)
    const combinedSlots = [...new Set([...allPotentialSlots, ...breakSlots])].sort();
    const displaySlots = combinedSlots.length > 0 ? combinedSlots : availableSlots;

    const morningSlots = displaySlots.filter(slot => parseInt(slot.split(':')[0]) < 12);
    const afternoonSlots = displaySlots.filter(slot => parseInt(slot.split(':')[0]) >= 12);

    return (
        <div role="region" aria-label="Selección de fecha y hora">
            <div className="flex items-center gap-2 mb-6">
                <CalendarIcon size={24} aria-hidden="true" style={{ color: primaryColor }} />
                <h3 className="text-xl font-bold text-gray-900">Fecha y Hora</h3>
            </div>

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
                            <p className="font-medium text-gray-900">No hay horarios disponibles</p>
                            <p className="text-sm mt-1">Intenta seleccionar otra fecha o barbero.</p>
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
                                                    onClick={() => isAvailable && onSelectSlot(slot)}
                                                    disabled={!isAvailable}
                                                    className={`
                                                        border rounded-full py-2 px-1 text-sm font-medium transition focus:outline-none whitespace-nowrap
                                                        ${isBreak
                                                            ? 'bg-orange-50 border-orange-200 text-orange-500 cursor-not-allowed opacity-70'
                                                            : isOccupied
                                                                ? 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-60'
                                                                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                                                        }
                                                        ${selectedDate && isAvailable ? 'hover:scale-105 active:scale-95' : ''}
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
                                                    onClick={() => isAvailable && onSelectSlot(slot)}
                                                    disabled={!isAvailable}
                                                    className={`
                                                        border rounded-full py-2 px-1 text-sm font-medium transition focus:outline-none whitespace-nowrap
                                                        ${isBreak
                                                            ? 'bg-orange-50 border-orange-200 text-orange-500 cursor-not-allowed opacity-70'
                                                            : isOccupied
                                                                ? 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-60'
                                                                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                                                        }
                                                        ${selectedDate && isAvailable ? 'hover:scale-105 active:scale-95' : ''}
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
