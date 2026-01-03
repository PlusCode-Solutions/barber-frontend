import { useState, useCallback, useMemo, useEffect } from "react";
import type { Service } from "../../services/types";
import type { Barber } from "../../barbers/types";
import type { CreateBookingDto } from "../types";
import { BookingsService } from "../api/bookings.service";
import { validateBookingForm, type FormValidationError } from "../utils/validation";
import { calculateEndTime } from "../utils/timeUtils";
import { SchedulesService } from "../../schedules/api/schedules.service";
import { useTenant } from "../../../context/TenantContext";
import type { Closure, Schedule } from "../../schedules/types";
import { useAvailabilityCalculator } from "./useAvailabilityCalculator";

type Step = 1 | 2 | 3 | 4;

export function useCreateBookingForm(onSuccess?: () => void, onClose?: () => void) {
    const { tenant } = useTenant();
    
    // Form State
    const [step, setStep] = useState<Step>(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [notes, setNotes] = useState("");
    

    // UI State
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<FormValidationError[]>([]);
    
    // Data State (Schedules)
    const [closures, setClosures] = useState<Closure[]>([]);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [tenantSchedules, setTenantSchedules] = useState<Schedule[]>([]);

    // 1. Fetch Schedules when Barber is selected
    useEffect(() => {
        if (selectedBarber && tenant?.slug) {
            Promise.all([
                SchedulesService.getClosures(selectedBarber.id),
                SchedulesService.getSchedules(selectedBarber.id),
                SchedulesService.getClosures(),
                SchedulesService.getSchedules() // Tenant General Schedules
            ])
            .then(([barberClosures, schedulesData, globalClosures, tenantSchedulesData]) => {
                const closureMap = new Map<string, Closure>();
                [...globalClosures, ...barberClosures].forEach(c => closureMap.set(c.id, c));
                
                setClosures(Array.from(closureMap.values()));
                setSchedules(schedulesData);
                setTenantSchedules(tenantSchedulesData);
            })
            .catch(console.error);
        }
    }, [selectedBarber, tenant?.slug]);

    // 2. Calculate Availability using extracted logic
    const { 
        availableSlots, 
        allPotentialSlots,
        breakSlots,
        loadingSlots, 
        error: availabilityError,
        refresh: refreshAvailability
    } = useAvailabilityCalculator({
        selectedBarber,
        selectedService,
        selectedDate,
        closures,
        schedules,
        tenantSchedules
    });

    // Combined Error State: Form Error takes precedence, then availability error
    const error = formError || availabilityError;

    const reset = useCallback(() => {
        setStep(1);
        setSelectedService(null);
        setSelectedBarber(null);
        setSelectedDate("");
        setSelectedSlot("");
        setNotes("");

        setFormError(null);
        setValidationErrors([]);
        setClosures([]);
		setSchedules([]);
        setTenantSchedules([]);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose?.();
    }, [reset, onClose]);

    const handleServiceSelect = useCallback((service: Service) => {
        setSelectedService(service);
        setStep(2);
        setFormError(null);
    }, []);

    const handleBarberSelect = useCallback((barber: Barber) => {
        setSelectedBarber(barber);
        setStep(3);
        setFormError(null);
    }, []);

    const handleDateChange = useCallback((date: string) => {
        setSelectedDate(date);
        setSelectedSlot("");
        setFormError(null);
        // Availability hook reacts automatically to selectedDate change
    }, []);

    const handleSlotSelect = useCallback((slot: string) => {
        setSelectedSlot(slot);
        setStep(4);
        setFormError(null);
    }, []);

    const handleSubmit = useCallback(async () => {
        // Validate form
        const errors = validateBookingForm({
            selectedService,
            selectedBarber,
            selectedDate,
            selectedSlot
        });

        // Availability Safety Check
        // Ensure the slot is strictly available before submitting
        if (availableSlots.length > 0 && !availableSlots.includes(selectedSlot)) {
            errors.push({ field: 'slot', message: 'Este horario ya no está disponible. Por favor selecciona otro.' });
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            setFormError(errors[0].message);
            return;
        }

        if (!selectedService || !selectedBarber || !selectedDate || !selectedSlot) return;

        setValidationErrors([]);
        setFormError(null);

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
            let errorMessage = err.response?.data?.message ||
                "No se pudo crear la cita. Por favor intenta de nuevo.";
            
            // Handle Concurrent Booking Conflict (409)
            if (err.response?.status === 409) {
                errorMessage = "Lo sentimos, este horario acaba de ser reservado por otra persona. Por favor selecciona otro.";
                
                // Refresh slots to show the latest availability
                refreshAvailability();
                
                // Go back to time selection step so user can pick a new slot
                setStep(3);
                setSelectedSlot(""); 
            }
            
            setFormError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, [selectedService, selectedBarber, selectedDate, selectedSlot, notes, availableSlots, handleClose, onSuccess, tenant?.slug, refreshAvailability]);

    const goToStep = useCallback((newStep: Step) => {
        setStep(newStep);
        setFormError(null);
    }, []);

    const clearError = useCallback(() => {
        setFormError(null);
        setValidationErrors([]);
    }, []);

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
        availableSlots,      // From hook
        allPotentialSlots,   // From hook
        breakSlots,          // From hook
        loadingSlots,        // From hook
        submitting,
        error,
        validationErrors,
        canProceedToConfirm,
        closures,
		schedules,
        tenantSchedules,

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
