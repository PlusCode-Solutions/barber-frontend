import { useState, useCallback, useMemo } from "react";
import type { Booking, UpdateBookingDto } from "../types";
import { BookingsService } from "../api/bookings.service";
import { calculateEndTime } from "../utils/timeUtils";
import { normalizeDateString } from "../../../utils/dateUtils";
import { differenceInMinutes, parse as parseDate } from "date-fns";
import { useBookingAvailability } from "./useBookingAvailability";

/**
 * Hook para reprogramar citas.
 * Refactorizado para usar `useBookingAvailability` y reducir duplicidad.
 */
export function useRescheduleBookingForm(booking: Booking, onSuccess?: () => void, onClose?: () => void) {
    
    // 1. Inicialización de datos
    const selectedService = booking.service;
    const selectedBarber = booking.barber;

    const duration = useMemo(() => {
        if (!booking.startTime || !booking.endTime) return 60;
        try {
            const start = parseDate(booking.startTime.substring(0, 5), 'HH:mm', new Date());
            const end = parseDate(booking.endTime.substring(0, 5), 'HH:mm', new Date());
            return differenceInMinutes(end, start);
        } catch (e) {
            return 60;
        }
    }, [booking.startTime, booking.endTime]);

    const initialDate = useMemo(() => {
        if (!booking.date) return "";
        return normalizeDateString(booking.date) || "";
    }, [booking.date]);

    const initialSlot = useMemo(() => {
        return booking.startTime ? booking.startTime.substring(0, 5) : "";
    }, [booking.startTime]);

    // 2. Estado del Formulario
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [selectedSlot, setSelectedSlot] = useState(initialSlot);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // 3. Hook de Disponibilidad (El "Cerebro" compartido)
    const { 
        availableSlots, 
        allPotentialSlots, 
        breakSlots, // Extract breakSlots
        loading: loadingSlots, 
        error: availabilityError, 
        closures, 
        schedules 
    } = useBookingAvailability({
        barber: selectedBarber,
        date: selectedDate,
        bookingIdToExclude: booking.id,
        durationMinutes: duration // Pass the calculated duration
    });

    const error = formError || availabilityError;

    // 4. Manejadores
    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    const handleDateChange = useCallback((date: string) => {
        setSelectedDate(date);
        setSelectedSlot("");
        setFormError(null);
    }, []);

    const handleSlotSelect = useCallback((slot: string) => {
        setSelectedSlot(slot);
        setFormError(null);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!selectedDate || !selectedSlot) {
            setFormError("Por favor selecciona una fecha y hora.");
            return;
        }

        const endTime = calculateEndTime(selectedSlot, duration);

        const dto: UpdateBookingDto = {
            date: selectedDate,
            startTime: selectedSlot,
            endTime: endTime,
        };

        setSubmitting(true);
        try {
            await BookingsService.updateBooking(booking.id, dto);
            onSuccess?.();
            handleClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message ||
                "No se pudo reprogramar la cita. Por favor intenta de nuevo.";
            setFormError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, [booking.id, selectedDate, selectedSlot, duration, handleClose, onSuccess]);

    return {
        selectedService,
        selectedBarber,
        selectedDate,
        selectedSlot,
        availableSlots,
        allPotentialSlots,
        breakSlots, 
        loadingSlots,
        submitting,
        error,
        closures,
        schedules,
        handleClose,
        handleDateChange,
        handleSlotSelect,
        handleSubmit,
    };
}
