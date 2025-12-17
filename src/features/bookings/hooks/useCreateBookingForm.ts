import { useState, useCallback, useMemo, useEffect } from "react";
import type { Service } from "../../services/types";
import type { Barber } from "../../barbers/types";
import type { CreateBookingDto, AvailabilitySlot } from "../types";
import { BookingsService } from "../api/bookings.service";
import { validateBookingForm, type FormValidationError } from "../utils/validation";
import { calculateEndTime, generateTimeSlots } from "../utils/timeUtils";
import { SchedulesService } from "../../schedules/api/schedules.service";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";
import type { Closure, Schedule } from "../../schedules/types";
import { normalizeDateString } from "../../../utils/dateUtils";
import { getDay, parse } from "date-fns";

type Step = 1 | 2 | 3 | 4;

/**
 * Custom hook to manage the state and logic of the Booking Creation Wizard.
 * Handles step navigation, data fetching (schedules, closures, availability),
 * and form validation.
 * 
 * Visual Busy Slots Strategy:
 * 1. We calculate `allPotentialSlots` locally based on the barber's weekly schedule (Start - End time).
 * 2. We fetch `availableSlots` from the API, which returns only the truly free times.
 * 3. The UI compares these lists: Any slot present in `allPotentialSlots` but missing from `availableSlots`
 *    is rendered as "Occupied" (Red/Disabled).
 */
export function useCreateBookingForm(onSuccess?: () => void, onClose?: () => void) {
    const { tenant } = useTenant();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [notes, setNotes] = useState("");
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [allPotentialSlots, setAllPotentialSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<FormValidationError[]>([]);
    
    // New state for schedules and closures
    const [closures, setClosures] = useState<Closure[]>([]);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [tenantSchedules, setTenantSchedules] = useState<Schedule[]>([]);

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

    const reset = useCallback(() => {
        setStep(1);
        setSelectedService(null);
        setSelectedBarber(null);
        setSelectedDate("");
        setSelectedSlot("");
        setNotes("");
        setAvailableSlots([]);
        setAllPotentialSlots([]);
        setError(null);
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
        setAvailableSlots([]);
        setAllPotentialSlots([]);

        if (selectedBarber && date) {
            // Check closures
            const closure = closures.find(c => normalizeDateString(c.date) === date);
            if (closure) {
                setError(`La barbería está cerrada este día por: ${closure.reason}`);
                return;
            }

            // Calculations for ALL slots
            // Get day of week for the selected date
            // We parse strictly as local YYYY-MM-DD to avoid timezone shifts at midnight
            const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
            const dayOfWeek = getDay(parsedDate); // 0-6 (Sun-Sat)
            
            // Find schedule
            const schedule = schedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));
            const tenantSchedule = tenantSchedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));
            
            // Validation: Tenant Schedule dictates strict limits
            if (!tenantSchedule || tenantSchedule.isClosed || !tenantSchedule.startTime || !tenantSchedule.endTime) {
                 setAllPotentialSlots([]); // Business is closed
                 setError(`La barbería no abre los ${parsedDate.toLocaleDateString('es-ES', { weekday: 'long' })}s.`);
                 // Note: we continue to try fetching availableSlots below? no, probably allow "Unavailable"
                 // But UI will show red anyway if allPotentialSlots is empty? No, it will show NOTHING.
                 // If error is set, user knows.
                 return;
            }

            if (schedule && !schedule.isClosed && schedule.startTime && schedule.endTime) {
                // CLAMPING: Intersection of Barber Hours and Tenant Hours
                // Barber cannot open before tenant or close after tenant.
                
                // Helper to compare HH:mm strings
                const maxTime = (t1: string, t2: string) => t1 > t2 ? t1 : t2;
                const minTime = (t1: string, t2: string) => t1 < t2 ? t1 : t2;

                const effectiveStartTime = maxTime(schedule.startTime, tenantSchedule.startTime);
                const effectiveEndTime = minTime(schedule.endTime, tenantSchedule.endTime);

                // If effective interval is invalid (start >= end)
                if (effectiveStartTime >= effectiveEndTime) {
                     setAllPotentialSlots([]);
                } else {
                    // Generate all potential slots based on CLAMPED schedule
                    const slots = generateTimeSlots(
                        effectiveStartTime, 
                        effectiveEndTime, 
                        30, // Default interval 30 mins
                        schedule.lunchStartTime,
                        schedule.lunchEndTime
                    );
                    setAllPotentialSlots(slots);
                }
            } else {
                // No schedule or closed
                setAllPotentialSlots([]); 
            }

            setLoadingSlots(true);
            try {
                if (!tenant?.slug) return;

                // DUAL CHECK STRATEGY:
                // 1. Public Availability (The standard way)
                // 2. Direct Bookings Check (Authorized way - for admin verification)
                // We run both to ensure that if one fails or excludes "PENDING", the other catches it.
                
                const availabilityPromise = BookingsService.checkAvailability(selectedBarber.id, date);
                
                // Only Attempt to fetch actual bookings if ADMIN (avoids 403 for regular users)
                const isAdmin = user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN';
                const bookingsPromise = isAdmin && tenant?.slug
                    ? BookingsService.getTenantBookings(date, date, selectedBarber.id).catch(() => [])
                    : Promise.resolve([]);

                const [availabilityRes, existingBookings] = await Promise.all([availabilityPromise, bookingsPromise]);

                const rawSlots: AvailabilitySlot[] = availabilityRes.slots || [];

                // 1. Get explicitly Busy slots from existing bookings
                const busyTimes = new Set<string>();
                existingBookings.forEach((b: any) => {
                     // Status check: Pending/Confirmed/Completed are BUSY. Only Cancelled is free.
                     if (b.status !== 'CANCELLED') {
                         // Normalize time "09:00:00" -> "09:00"
                         const time = b.startTime ? b.startTime.substring(0, 5) : "";
                         if (time) busyTimes.add(time);
                     }
                });

                // 2. Filter available slots from API
                const apiAvailableTimes = rawSlots
                    .filter(s => s.available)
                    .map((s) => s.time.substring(0, 5));
                
                // 3. MERGE: Slot is available IF API says Yes AND it's not in our explicit busy list
                const finalAvailableSlots = apiAvailableTimes.filter(time => !busyTimes.has(time));
                
                setAvailableSlots(finalAvailableSlots);

            } catch (err) {
                console.error("Availability error", err);
                setError("No se pudo verificar la disponibilidad. Por favor intenta de nuevo.");
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        }
    }, [selectedBarber, selectedService?.id, closures, schedules]);

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
        allPotentialSlots, // Exposed
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
