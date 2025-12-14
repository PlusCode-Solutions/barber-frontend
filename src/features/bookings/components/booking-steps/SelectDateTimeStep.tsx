import { Calendar as CalendarIcon, ChevronLeft, Clock } from "lucide-react";
import Calendar from "../../../../components/ui/Calendar";
import type { Closure, Schedule } from "../../../schedules/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SelectDateTimeStepProps {
    selectedDate: string;
    availableSlots: string[];
    loadingSlots: boolean;
    closures?: Closure[];
    schedules?: Schedule[];
    onDateChange: (date: string) => void;
    onSelectSlot: (slot: string) => void;
    onBack: () => void;
}

export default function SelectDateTimeStep({
    selectedDate,
    availableSlots,
    loadingSlots,
    closures = [],
    schedules = [],
    onDateChange,
    onSelectSlot,
    onBack
}: SelectDateTimeStepProps) {
    return (
        <div role="region" aria-label="Selección de fecha y hora">
            <div className="flex items-center gap-2 mb-6">
                <CalendarIcon className="text-blue-600" size={24} aria-hidden="true" />
                <h3 className="text-xl font-bold text-gray-900">Fecha y Hora</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Column 1: Calendar */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Selecciona la fecha
                    </label>
                    <Calendar
                        selectedDate={selectedDate ? new Date(selectedDate.replace(/-/g, '/')) : null}
                        onDateSelect={(date) => onDateChange(format(date, 'yyyy-MM-dd'))}
                        closures={closures}
                        schedules={schedules}
                        className="w-full"
                    />
                </div>

                {/* Column 2: Slots */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Horarios disponibles
                        {selectedDate && <span className="font-normal text-gray-500 ml-1">
                            para el {format(new Date(selectedDate.replace(/-/g, '/')), "EEEE d 'de' MMMM", { locale: es })}
                        </span>}
                    </label>

                    {!selectedDate ? (
                        <div className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                            <CalendarIcon size={48} className="mb-2 opacity-20" />
                            <p>Selecciona una fecha en el calendario para ver los horarios</p>
                        </div>
                    ) : loadingSlots ? (
                        <div className="h-64 border-2 border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                            <p>Buscando disponibilidad...</p>
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="h-64 border-2 border-gray-100 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                            <Clock size={48} className="mb-2 opacity-20" />
                            <p className="font-medium text-gray-900">No hay horarios disponibles</p>
                            <p className="text-sm mt-1">Intenta seleccionar otra fecha o barbero.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar" role="group" aria-label="Horarios disponibles">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => onSelectSlot(slot)}
                                    className="border border-gray-200 rounded-xl py-2.5 px-2 text-sm font-medium hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    aria-label={`Seleccionar horario ${slot}`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={onBack}
                className="mt-8 flex items-center gap-2 text-gray-500 font-medium hover:text-gray-900 transition-colors"
                aria-label="Volver al paso anterior"
            >
                <ChevronLeft size={20} aria-hidden="true" />
                Volver a selección de barbero
            </button>
        </div>
    );
}
