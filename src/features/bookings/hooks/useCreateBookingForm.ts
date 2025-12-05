import { useState, useCallback, useMemo } from "react";
import type { Service } from "../../services/types";
import type { Barber } from "../../barbers/types";
import type { CreateBookingDto } from "../types";
import { checkAvailability } from "../api/checkAvailability";
import { createBooking } from "../api/createBooking";
import { validateBookingForm, type FormValidationError } from "../utils/validation";
import { calculateEndTime } from "../utils/timeUtils";

type Step = 1 | 2 | 3 | 4;

export function useCreateBookingForm(onSuccess?: () => void, onClose?: () => void) {
    const [step, setStep] = useState<Step>(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [notes, setNotes] = useState("");
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<FormValidationError[]>([]);

    const reset = useCallback(() => {
        setStep(1);
        setSelectedService(null);
        setSelectedBarber(null);
        setSelectedDate("");
        setSelectedSlot("");
        setNotes("");
        setAvailableSlots([]);
        setError(null);
        setValidationErrors([]);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose?.();
    }, [reset, onClose]);

    const handleServiceSelect = useCallback((service: Service) => {
        setSelectedService(service);
        setStep(2);
        setError(null);
    }, []);

    const handleBarberSelect = useCallback((barber: Barber) => {
        setSelectedBarber(barber);
        setStep(3);
        setError(null);
    }, []);

    const handleDateChange = useCallback(async (date: string) => {
        setSelectedDate(date);
        setSelectedSlot("");
        setError(null);

        if (selectedBarber && date) {
            setLoadingSlots(true);
            try {
                const result = await checkAvailability(date, selectedBarber.id, selectedService?.id);

                // Filter only available slots and extract the time
                const available = result.slots
                    ? result.slots
                        .filter(slot => slot.available)
                        .map(slot => slot.time)
                    : [];

                setAvailableSlots(available);
            } catch (err) {
                setError("No se pudo verificar la disponibilidad. Por favor intenta de nuevo.");
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        }
    }, [selectedBarber, selectedService?.id]);

    const handleSlotSelect = useCallback((slot: string) => {
        setSelectedSlot(slot);
        setStep(4);
        setError(null);
    }, []);

    const handleSubmit = useCallback(async () => {
        // Validate form
        const errors = validateBookingForm({
            selectedService,
            selectedBarber,
            selectedDate,
            selectedSlot
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            setError(errors[0].message);
            return;
        }

        if (!selectedService || !selectedBarber || !selectedDate || !selectedSlot) return;

        setValidationErrors([]);
        setError(null);

        // Calculate endTime using date-fns
        const duration = selectedService.durationMinutes || 60;
        const endTime = calculateEndTime(selectedSlot, duration);

        const dto: CreateBookingDto = {
            serviceId: selectedService.id,
            barberId: selectedBarber.id,
            date: selectedDate,
            startTime: selectedSlot,
            endTime: endTime,
            notes: notes || undefined
        };

        setSubmitting(true);
        try {
            await createBooking(dto);
            handleClose();
            onSuccess?.();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message ||
                "No se pudo crear la cita. Por favor intenta de nuevo.";
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, [selectedService, selectedBarber, selectedDate, selectedSlot, notes, handleClose, onSuccess]);

    const goToStep = useCallback((newStep: Step) => {
        setStep(newStep);
        setError(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
        setValidationErrors([]);
    }, []);

    // Memoized values
    const canProceedToConfirm = useMemo(() => {
        return !!(selectedService && selectedBarber && selectedDate && selectedSlot);
    }, [selectedService, selectedBarber, selectedDate, selectedSlot]);

    return {
        // State
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
        validationErrors,
        canProceedToConfirm,

        // Actions
        handleClose,
        handleServiceSelect,
        handleBarberSelect,
        handleDateChange,
        handleSlotSelect,
        handleSubmit,
        setNotes,
        goToStep,
        clearError,
    };
}
