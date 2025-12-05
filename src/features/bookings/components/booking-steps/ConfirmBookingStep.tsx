import { Check, Scissors, Users, Calendar, Clock, ChevronLeft } from "lucide-react";
import type { Service } from "../../../services/types";
import type { Barber } from "../../../barbers/types";

interface ConfirmBookingStepProps {
    selectedService: Service;
    selectedBarber: Barber;
    selectedDate: string;
    selectedSlot: string;
    notes: string;
    submitting: boolean;
    onNotesChange: (notes: string) => void;
    onSubmit: () => void;
    onBack: () => void;
}

export default function ConfirmBookingStep({
    selectedService,
    selectedBarber,
    selectedDate,
    selectedSlot,
    notes,
    submitting,
    onNotesChange,
    onSubmit,
    onBack
}: ConfirmBookingStepProps) {
    return (
        <div role="region" aria-label="Confirmación de cita">
            <div className="flex items-center gap-2 mb-4">
                <Check className="text-green-600" size={24} aria-hidden="true" />
                <h3 className="text-xl font-bold text-gray-900">Confirmar Cita</h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 space-y-3" role="region" aria-label="Resumen de la cita">
                <div className="flex items-start gap-3">
                    <Scissors className="text-blue-600 mt-1" size={20} aria-hidden="true" />
                    <div>
                        <p className="text-xs text-gray-600">Servicio</p>
                        <p className="font-bold text-gray-900">{selectedService.name}</p>
                        <p className="text-sm text-green-600" aria-label={`Precio: ${selectedService.price} pesos`}>
                            ${selectedService.price}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Users className="text-blue-600 mt-1" size={20} aria-hidden="true" />
                    <div>
                        <p className="text-xs text-gray-600">Barbero</p>
                        <p className="font-bold text-gray-900">{selectedBarber.name}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Calendar className="text-blue-600 mt-1" size={20} aria-hidden="true" />
                    <div>
                        <p className="text-xs text-gray-600">Fecha</p>
                        <p className="font-bold text-gray-900">{selectedDate}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Clock className="text-blue-600 mt-1" size={20} aria-hidden="true" />
                    <div>
                        <p className="text-xs text-gray-600">Hora</p>
                        <p className="font-bold text-gray-900">{selectedSlot}</p>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="booking-notes" className="block text-sm font-semibold text-gray-700 mb-2">
                    Notas (Opcional)
                </label>
                <textarea
                    id="booking-notes"
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Ej: Corte clásico, lavar cabello..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
                    rows={3}
                    aria-label="Notas adicionales para la cita"
                />
            </div>

            <button
                onClick={onSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={submitting ? "Creando cita, por favor espera" : "Confirmar y crear cita"}
            >
                {submitting ? "Creando cita..." : "Confirmar Cita"}
            </button>

            <button
                onClick={onBack}
                className="mt-3 w-full flex items-center justify-center gap-2 text-blue-600 font-semibold hover:underline"
                aria-label="Volver al paso anterior"
                disabled={submitting}
            >
                <ChevronLeft size={20} aria-hidden="true" />
                Cambiar fecha/hora
            </button>
        </div>
    );
}
