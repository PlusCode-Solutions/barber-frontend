import { useState, useCallback, useMemo, useEffect } from "react";
import type { Service } from "../../services/types";
import type { Professional } from "../../professionals/types";
import type { CreateBookingDto } from "../types";
import { BookingsService } from "../api/bookings.service";
import { validateBookingForm, type FormValidationError } from "../utils/validation";
import { calculateEndTime } from "../utils/timeUtils";
import { SchedulesService } from "../../schedules/api/schedules.service";
import { useTenant } from "../../../context/TenantContext";
import type { Closure, Schedule } from "../../schedules/types";
import { useAvailabilityCalculator } from "./useAvailabilityCalculator";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";

type Step = 1 | 2 | 3 | 4;

export function useCreateBookingForm(onSuccess?: () => void, onClose?: () => void) {
    const queryClient = useQueryClient();
    const { tenant } = useTenant();
    const { user } = useAuth();

    // Form State
    const [step, setStep] = useState<Step>(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
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

    // 1. Fetch Schedules when Professional is selected
    useEffect(() => {
        if (selectedProfessional && tenant?.slug) {
            Promise.all([
                SchedulesService.getClosures(selectedProfessional.id),
                SchedulesService.getSchedules(selectedProfessional.id),
                SchedulesService.getClosures(),
                SchedulesService.getSchedules() // Tenant General Schedules
            ])
                .then(([professionalClosures, schedulesData, globalClosures, tenantSchedulesData]) => {
                    const closureMap = new Map<string, Closure>();
                    [...globalClosures, ...professionalClosures].forEach(c => closureMap.set(c.id, c));

                    setClosures(Array.from(closureMap.values()));
                    setSchedules(schedulesData);
                    setTenantSchedules(tenantSchedulesData);
                })
                .catch(console.error);
        }
    }, [selectedProfessional, tenant?.slug]);

    // 2. Calculate Availability using extracted logic
    const {
        availableSlots,
        allPotentialSlots,
        breakSlots,
        loadingSlots,
        error: availabilityError,
        refresh: refreshAvailability
    } = useAvailabilityCalculator({
        selectedProfessional,
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
        setSelectedProfessional(null);
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
        if (user?.role === 'PROFESSIONAL' && user?.professionalId) {
            setSelectedProfessional({ id: user.professionalId, name: user.name || 'Profesional' } as Professional);
            setStep(3);
        } else {
            setStep(2);
        }
        setFormError(null);
    }, [user]);

    const handleProfessionalSelect = useCallback((professional: Professional) => {
        setSelectedProfessional(professional);
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
            selectedProfessional,
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

        if (!selectedService || !selectedProfessional || !selectedDate || !selectedSlot) return;

        setValidationErrors([]);
        setFormError(null);

        const duration = selectedService.durationMinutes || 60;
        const endTime = calculateEndTime(selectedSlot, duration);

        const dto: CreateBookingDto = {
            serviceId: selectedService.id,
            professionalId: selectedProfessional.id,
            date: selectedDate,
            startTime: selectedSlot,
            endTime: endTime,
            notes: notes || undefined
        };

        setSubmitting(true);
        try {
            if (!tenant?.slug) throw new Error("Tenant no disponible");
            await BookingsService.create(dto);
            await queryClient.invalidateQueries({ queryKey: ['bookings'] }); // Refresh lists
            handleClose();
            onSuccess?.();
        } catch (err: any) {
            let errorMessage = err.response?.data?.message ||
                "No se pudo crear la cita. Por favor intenta de nuevo.";

            // Handle Concurrent Booking Conflict (409)
            if (err.response?.status === 409) {
                // If the backend didn't provide a specific message, use the fallback
                if (!err.response?.data?.message) {
                    errorMessage = "Lo sentimos, este horario acaba de ser reservado por otra persona. Por favor selecciona otro.";
                }

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
    }, [selectedService, selectedProfessional, selectedDate, selectedSlot, notes, availableSlots, handleClose, onSuccess, tenant?.slug, refreshAvailability]);

    const goToStep = useCallback((newStep: Step) => {
        setStep(newStep);
        setFormError(null);
    }, []);

    const clearError = useCallback(() => {
        setFormError(null);
        setValidationErrors([]);
    }, []);

    const canProceedToConfirm = useMemo(() => {
        return !!(selectedService && selectedProfessional && selectedDate && selectedSlot);
    }, [selectedService, selectedProfessional, selectedDate, selectedSlot]);

    return {
        // State
        step,
        selectedService,
        selectedProfessional,
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
        handleProfessionalSelect,
        handleDateChange,
        handleSlotSelect,
        handleSubmit,
        setNotes,
        goToStep,
        clearError,
    };
}
