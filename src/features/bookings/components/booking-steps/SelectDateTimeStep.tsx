import { Calendar, ChevronLeft } from "lucide-react";

interface SelectDateTimeStepProps {
    selectedDate: string;
    availableSlots: string[];
    loadingSlots: boolean;
    onDateChange: (date: string) => void;
    onSelectSlot: (slot: string) => void;
    onBack: () => void;
}

export default function SelectDateTimeStep({
    selectedDate,
    availableSlots,
    loadingSlots,
    onDateChange,
    onSelectSlot,
    onBack
}: SelectDateTimeStepProps) {
    return (
        <div role="region" aria-label="Selección de fecha y hora">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" size={24} aria-hidden="true" />
                <h3 className="text-xl font-bold text-gray-900">Fecha y Hora</h3>
            </div>

            <div className="mb-6">
                <label htmlFor="date-picker" className="block text-sm font-semibold text-gray-700 mb-2">
                    Selecciona la fecha
                </label>
                <input
                    id="date-picker"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
                    aria-label="Seleccionar fecha de la cita"
                />
            </div>

            {selectedDate && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Horarios disponibles</label>
                    {loadingSlots ? (
                        <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
                            Cargando horarios...
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl" role="status">
                            No hay horarios disponibles para esta fecha
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Horarios disponibles">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => onSelectSlot(slot)}
                                    className="border-2 border-gray-200 rounded-xl py-3 font-semibold hover:border-blue-500 hover:bg-blue-50 transition"
                                    aria-label={`Seleccionar horario ${slot}`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={onBack}
                className="mt-4 flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                aria-label="Volver al paso anterior"
            >
                <ChevronLeft size={20} aria-hidden="true" />
                Volver a barberos
            </button>
        </div>
    );
}
