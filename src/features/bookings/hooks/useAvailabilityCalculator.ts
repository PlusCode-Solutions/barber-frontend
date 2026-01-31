import { useState, useCallback, useEffect } from "react";
import { BookingsService } from "../api/bookings.service";
import { generateTimeSlots } from "../utils/timeUtils";
import { normalizeDateString } from "../../../utils/dateUtils";
import { getDay, parse } from "date-fns";
import type { Barber } from "../../barbers/types";
import type { Closure, Schedule } from "../../schedules/types";
import type { Service } from "../../services/types";
import type { AvailabilitySlot } from "../types";
import { useTenant } from "../../../context/TenantContext";
import { filterSlotsByDuration } from "../utils/availabilityRules";

interface UseAvailabilityCalculatorProps {
    selectedBarber: Barber | null;
    selectedService: Service | null;
    selectedDate: string;
    closures: Closure[];
    schedules: Schedule[];
    tenantSchedules: Schedule[];
}

export function useAvailabilityCalculator({
    selectedBarber,
    selectedService,
    selectedDate,
    closures,
    schedules,
    tenantSchedules
}: UseAvailabilityCalculatorProps) {
    const { tenant } = useTenant();

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [allPotentialSlots, setAllPotentialSlots] = useState<string[]>([]);
    const [breakSlots, setBreakSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateSlots = useCallback(async () => {
        setLoadingSlots(true);
        setError(null);
        setAvailableSlots([]);
        setAllPotentialSlots([]);
        setBreakSlots([]);

        try {
            if (!selectedBarber || !selectedDate) return;

            // 1. Check Closures
            const closure = closures.find(c => normalizeDateString(c.date) === selectedDate);
            if (closure) {
                throw new Error(`La barbería está cerrada este día por: ${closure.reason || 'Mantenimiento o Festivo'}`);
            }

            // 2. Validate Schedule Restrictions
            const parsedDate = parse(selectedDate, 'yyyy-MM-dd', new Date());
            const dayOfWeek = getDay(parsedDate);

            const schedule = schedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));
            const tenantSchedule = tenantSchedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));

            if (!tenantSchedule || tenantSchedule.isClosed || !tenantSchedule.startTime || !tenantSchedule.endTime) {
                setAllPotentialSlots([]);
                setAvailableSlots([]);
                setError(`La barbería no abre los ${parsedDate.toLocaleDateString('es-ES', { weekday: 'long' })}s.`);
                setLoadingSlots(false);
                return;
            }

            // 3. Generate Potential Slots
            // Use barber schedule if available, otherwise tenant schedule
            const activeSchedule = (schedule && !schedule.isClosed && schedule.startTime && schedule.endTime) 
                ? schedule 
                : tenantSchedule;
            
            if (activeSchedule && !activeSchedule.isClosed && activeSchedule.startTime && activeSchedule.endTime) {
                const maxTime = (t1: string, t2: string) => t1 > t2 ? t1 : t2;
                const minTime = (t1: string, t2: string) => t1 < t2 ? t1 : t2;

                const effectiveStartTime = maxTime(activeSchedule.startTime, tenantSchedule.startTime);
                const effectiveEndTime = minTime(activeSchedule.endTime, tenantSchedule.endTime);
                
                // Get lunch times from active schedule OR tenant as fallback
                const lunchStart = activeSchedule.lunchStartTime || tenantSchedule?.lunchStartTime;
                const lunchEnd = activeSchedule.lunchEndTime || tenantSchedule?.lunchEndTime;

                if (effectiveStartTime >= effectiveEndTime) {
                    setAllPotentialSlots([]);
                } else {
                    const slots = generateTimeSlots(
                        effectiveStartTime, 
                        effectiveEndTime, 
                        30, 
                        lunchStart, 
                        lunchEnd
                    );
                    setAllPotentialSlots(slots);
                    
                    // Generate break slots for visual display (orange styling)
                    if (lunchStart && lunchEnd) {
                        const lunchSlots = generateTimeSlots(
                            lunchStart,
                            lunchEnd,
                            30
                        );
                        setBreakSlots(lunchSlots);
                    }
                }
            } else {
                setAllPotentialSlots([]);
            }

            if (!tenant?.slug) return;

            // 4. Check API Availability - Backend is source of truth
            const availabilityRes = await BookingsService.checkAvailability(selectedBarber.id, selectedDate);
            const rawSlots: AvailabilitySlot[] = availabilityRes.slots || [];

            // Trust the backend: slots with available=true are bookable
            // Slots with available=false are occupied (shown in red in UI)
            const apiAvailableTimes = rawSlots
                .filter(s => s.available)
                .map((s) => s.time.substring(0, 5));

            const serviceDuration = selectedService?.durationMinutes || 30;
            
            // Calculate effective constraints
            let closingTime = "23:59";
            if (schedule && !schedule.isClosed && schedule.endTime) {
                 closingTime = schedule.endTime;
            } else if (tenantSchedule && !tenantSchedule.isClosed && tenantSchedule.endTime) {
                 closingTime = tenantSchedule.endTime;
            }

            // Reuse lunchStart/lunchEnd variables if they were calculated above, 
            // but for safety/clarity inside this block (as scope is large):
            const lStart = activeSchedule?.lunchStartTime || tenantSchedule?.lunchStartTime;
            const lEnd = activeSchedule?.lunchEndTime || tenantSchedule?.lunchEndTime;

            const finalAvailableSlots = filterSlotsByDuration(
                apiAvailableTimes,
                serviceDuration,
                closingTime,
                lStart,
                lEnd
            );
            
            // Check if we have available slots, if not set informative message
            if (apiAvailableTimes.length > 0 && finalAvailableSlots.length === 0) {
                // Backend has slots but none fit the service duration
                setError(`No hay horarios disponibles para un servicio de ${serviceDuration} minutos. Selecciona otra fecha o un servicio más corto.`);
            }
            
            setAvailableSlots(finalAvailableSlots);

            // Fallback: If local slot calculation failed but API returned slots, use API slots as potential slots
            // This ensures we show "Occupied" (Red) slots instead of hiding them
            if (rawSlots.length > 0) {
                 const apiAllTimes = rawSlots.map(s => s.time.substring(0, 5));
                 setAllPotentialSlots(prev => prev.length > 0 ? prev : apiAllTimes);
            }

        } catch (err: any) {
            let errorMessage = "No se pudo verificar la disponibilidad.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.message === 'string') {
                errorMessage = err.message;
            }
            setError(errorMessage);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, [selectedBarber, selectedService, selectedDate, closures, schedules, tenantSchedules, tenant?.slug]);

    // Trigger calculation when dependencies change
    useEffect(() => {
        calculateSlots();
    }, [calculateSlots]);

    return {
        availableSlots,
        allPotentialSlots,
        breakSlots,
        loadingSlots,
        error,
        refresh: calculateSlots
    };
}
