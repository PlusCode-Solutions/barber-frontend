import { AlertCircle, X, Calendar } from "lucide-react";
import { useRescheduleBookingForm } from "../hooks/useRescheduleBookingForm";
import SelectDateTimeStep from "./booking-steps/SelectDateTimeStep";
import { useTenant } from "../../../context/TenantContext";
import type { Booking } from "../types";
import { Button } from "../../../components/ui/Button";

interface RescheduleBookingModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

/**
 * Componente Modal para la reprogramación de citas.
 * 
 * Proporciona una interfaz de usuario limpia reutilizando `SelectDateTimeStep`
 * para permitir al usuario seleccionar una nueva fecha y hora.
 * Se integra con `useRescheduleBookingForm` para manejar la lógica de negocio y validaciones.
 */
export default function RescheduleBookingModal({ booking, isOpen, onClose, onSuccess }: RescheduleBookingModalProps) {
    const { tenant } = useTenant();
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';
    if (!isOpen || !booking) return null;

    return <RescheduleBookingModalContent booking={booking} onClose={onClose} onSuccess={onSuccess} primaryColor={primaryColor} />;
}

function RescheduleBookingModalContent({ booking, onClose, onSuccess, primaryColor }: { booking: Booking, onClose: () => void, onSuccess?: () => void, primaryColor: string }) {
    const {
        selectedDate,
        selectedSlot,
        availableSlots,
        allPotentialSlots,
        breakSlots, // Extract here
        loadingSlots,
        submitting,
        error,
        closures,
        schedules,
        tenantSchedules, // Extract here
        handleClose,
        handleDateChange,
        handleSlotSelect,
        handleSubmit,
        selectedService,
        selectedBarber
    } = useRescheduleBookingForm(booking, onSuccess, onClose);

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white w-full max-w-2xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
                {/* Header */}
                <div
                    className="px-6 py-5 flex items-center justify-between"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl text-white">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Reprogramar Cita</h2>
                            <p className="text-blue-100 text-sm">{selectedService?.name} con {selectedBarber?.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                        <p className="text-red-800 font-semibold text-sm">
                            {typeof error === 'string' ? error : (error as any)?.message || 'Error desconocido'}
                        </p>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <SelectDateTimeStep
                        selectedDate={selectedDate}
                        availableSlots={availableSlots}
                        allPotentialSlots={allPotentialSlots}
                        breakSlots={breakSlots} // Pass it here
                        loadingSlots={loadingSlots}
                        closures={closures}
                        schedules={schedules}
                        tenantSchedules={tenantSchedules} // Pass it here
                        barberId={selectedBarber?.id}
                        onDateChange={handleDateChange}
                        onSelectSlot={handleSlotSelect}
                    />
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!selectedDate || !selectedSlot || submitting}
                        isLoading={submitting}
                        className="flex-1"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Guardar Cambios
                    </Button>
                </div>
            </div>
        </div>
    );
}
