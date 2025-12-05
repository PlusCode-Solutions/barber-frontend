import { AlertCircle, X } from "lucide-react";
import { useCreateBookingForm } from "../hooks/useCreateBookingForm";
import SelectServiceStep from "./booking-steps/SelectServiceStep";
import SelectBarberStep from "./booking-steps/SelectBarberStep";
import SelectDateTimeStep from "./booking-steps/SelectDateTimeStep";
import ConfirmBookingStep from "./booking-steps/ConfirmBookingStep";

interface CreateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateBookingModal({ isOpen, onClose, onSuccess }: CreateBookingModalProps) {
    const {
        step,
        selectedService,
        selectedBarber,
        selectedDate,
        selectedSlot,
        notes,
        availableSlots,
        loadingSlots,
        submitting,
        error,
        handleClose,
        handleServiceSelect,
        handleBarberSelect,
        handleDateChange,
        handleSlotSelect,
        handleSubmit,
        setNotes,
        goToStep,
        clearError,
    } = useCreateBookingForm(onSuccess, onClose);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="bg-white w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 id="modal-title" className="text-2xl font-bold text-white">Nueva Cita</h2>
                        <p className="text-blue-100 text-sm" aria-live="polite">Paso {step} de 4</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition"
                        aria-label="Cerrar modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex bg-gray-100" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 h-1 transition-all ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
                            aria-label={`Paso ${s}${s <= step ? ' completado' : ''}`}
                        />
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3" role="alert">
                        <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                        <div className="flex-1">
                            <p className="text-red-800 font-semibold text-sm">{error}</p>
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-600 hover:text-red-800 transition"
                            aria-label="Cerrar mensaje de error"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <SelectServiceStep onSelectService={handleServiceSelect} />
                    )}

                    {step === 2 && (
                        <SelectBarberStep
                            onSelectBarber={handleBarberSelect}
                            onBack={() => goToStep(1)}
                        />
                    )}

                    {step === 3 && (
                        <SelectDateTimeStep
                            selectedDate={selectedDate}
                            availableSlots={availableSlots}
                            loadingSlots={loadingSlots}
                            onDateChange={handleDateChange}
                            onSelectSlot={handleSlotSelect}
                            onBack={() => goToStep(2)}
                        />
                    )}

                    {step === 4 && selectedService && selectedBarber && (
                        <ConfirmBookingStep
                            selectedService={selectedService}
                            selectedBarber={selectedBarber}
                            selectedDate={selectedDate}
                            selectedSlot={selectedSlot}
                            notes={notes}
                            submitting={submitting}
                            onNotesChange={setNotes}
                            onSubmit={handleSubmit}
                            onBack={() => goToStep(3)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
