import { useState, useCallback, useMemo, useEffect } from "react";
import type { Service } from "../../services/types";
import type { Barber } from "../../barbers/types";
import type { CreateBookingDto, AvailabilitySlot } from "../types";
import { BookingsService } from "../api/bookings.service";
import { validateBookingForm, type FormValidationError } from "../utils/validation";
import { calculateEndTime } from "../utils/timeUtils";
import { SchedulesService } from "../../schedules/api/schedules.service";
import { useTenant } from "../../../context/TenantContext";
import type { Closure, Schedule } from "../../schedules/types";

type Step = 1 | 2 | 3 | 4;

export function useCreateBookingForm(onSuccess?: () => void, onClose?: () => void) {
    const { tenant } = useTenant();
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
    
    // New state for schedules and closures
    const [closures, setClosures] = useState<Closure[]>([]);
	const [schedules, setSchedules] = useState<Schedule[]>([]);

    useEffect(() => {
        if (selectedBarber && tenant?.slug) {
            // Fetch closures and schedules in parallel
            Promise.all([
                SchedulesService.getClosures(selectedBarber.id),
                SchedulesService.getSchedules(selectedBarber.id)
            ])
            .then(([closuresData, schedulesData]) => {
                setClosures(closuresData);
                setSchedules(schedulesData);
            })
            .catch(console.error);
        }
    }, [selectedBarber, tenant?.slug]);

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
        setClosures([]);
		setSchedules([]);
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
        setAvailableSlots([]); // Clear slots on date change

        if (selectedBarber && date) {
            // Check for closures
            const closure = closures.find(c => c.date === date);
            if (closure) {
                setError(`La barbería está cerrada este día por: ${closure.reason}`);
                return;
            }

            setLoadingSlots(true);
            try {
                if (!tenant?.slug) return;
                const result = await BookingsService.checkAvailability(selectedBarber.id, date);

                // Map availability slots to strings (time) strictly
                const rawSlots: AvailabilitySlot[] = result.slots || [];
                const stringSlots = rawSlots.map((s) => s.time);
                setAvailableSlots(stringSlots);
            } catch (err) {
                setError("No se pudo verificar la disponibilidad. Por favor intenta de nuevo.");
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        }
    }, [selectedBarber, selectedService?.id, closures]);

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
            if (!tenant?.slug) throw new Error("Tenant no disponible");
            await BookingsService.create(dto);
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
        closures,
		schedules,

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
