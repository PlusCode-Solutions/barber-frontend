import { useState, useCallback, useEffect } from "react";
import { BookingsService } from "../api/bookings.service";
import { generateTimeSlots, timeToMinutes, minutesToTime } from "../utils/timeUtils";
import { normalizeDateString } from "../../../utils/dateUtils";
import type { Professional } from "../../professionals/types";
import type { Closure, Schedule } from "../../schedules/types";
import type { Service } from "../../services/types";
import type { AvailabilitySlot } from "../types";
import { useTenant } from "../../../context/TenantContext";
import { filterSlotsByDuration } from "../utils/availabilityRules";

interface UseAvailabilityCalculatorProps {
    selectedProfessional: Professional | null;
    selectedService: Service | null;
    selectedDate: string;
    closures: Closure[];
    schedules: Schedule[];
    tenantSchedules: Schedule[];
    userId?: string;
}

export function useAvailabilityCalculator({
    selectedProfessional,
    selectedService,
    selectedDate,
    closures,
    schedules,
    tenantSchedules,
    userId
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
            if (!selectedProfessional || !selectedDate) return;

            let lStartMin = 0;
            let lEndMin = 0;

            // 1. Check Closures
            const closure = closures.find(c => {
                const isDateMatch = normalizeDateString(c.date) === selectedDate;
                const isScopeMatch = !c.professionalId || (selectedProfessional && c.professionalId === selectedProfessional.id);
                const isFullDay = c.isFullDay === true || c.isFullDay === undefined;
                return isDateMatch && isScopeMatch && isFullDay;
            });

            if (closure) {
                throw new Error(`La professionalía está cerrada este día por: ${closure.reason || 'Mantenimiento o Festivo'}`);
            }

            // 2. Validate Schedule Restrictions
            const parsedDate = new Date(`${selectedDate}T00:00:00Z`);
            const dayOfWeek = parsedDate.getUTCDay();

            const schedule = schedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));
            const tenantSchedule = tenantSchedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));

            if (!tenantSchedule || tenantSchedule.isClosed || !tenantSchedule.startTime || !tenantSchedule.endTime) {
                setAllPotentialSlots([]);
                setAvailableSlots([]);
                setError(`La professionalía no abre los ${parsedDate.toLocaleDateString('es-ES', { weekday: 'long' })}s.`);
                setLoadingSlots(false);
                return;
            }

            // 3. Generate Potential Slots
            const activeSchedule = (schedule && !schedule.isClosed && schedule.startTime && schedule.endTime)
                ? schedule
                : tenantSchedule;

            if (activeSchedule && !activeSchedule.isClosed && activeSchedule.startTime && activeSchedule.endTime) {
                const sStart = timeToMinutes(activeSchedule.startTime);
                const sEnd = timeToMinutes(activeSchedule.endTime);
                const tStart = timeToMinutes(tenantSchedule.startTime);
                const tEnd = timeToMinutes(tenantSchedule.endTime);

                const startMin = Math.max(sStart, tStart);
                const endMin = Math.min(sEnd, tEnd);

                const hasProfessionalLunch = activeSchedule.lunchStartTime || activeSchedule.lunchEndTime;
                const lunchStart = hasProfessionalLunch ? activeSchedule.lunchStartTime : tenantSchedule?.lunchStartTime;
                const lunchEnd = hasProfessionalLunch ? activeSchedule.lunchEndTime : tenantSchedule?.lunchEndTime;

                lStartMin = timeToMinutes(lunchStart);
                lEndMin = timeToMinutes(lunchEnd);

                if (startMin >= endMin) {
                    setAllPotentialSlots([]);
                } else {
                    const slots = generateTimeSlots(
                        minutesToTime(startMin),
                        minutesToTime(endMin),
                        30,
                        lStartMin > 0 ? minutesToTime(lStartMin) : null,
                        lEndMin > 0 ? minutesToTime(lEndMin) : null
                    );
                    setAllPotentialSlots(slots);

                    // Generate break slots for visual display (orange styling)
                    if (lStartMin > 0 && lEndMin > 0) {
                        const lunchSlots = generateTimeSlots(
                            minutesToTime(lStartMin),
                            minutesToTime(lEndMin),
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
            const availabilityRes = await BookingsService.checkAvailability(selectedProfessional.id, selectedDate, userId);
            const rawSlots: AvailabilitySlot[] = availabilityRes.slots || [];

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

            const hasProfessionalLunch2 = activeSchedule?.lunchStartTime || activeSchedule?.lunchEndTime;
            const lStartStr = hasProfessionalLunch2 ? activeSchedule?.lunchStartTime : tenantSchedule?.lunchStartTime;
            const lEndStr = hasProfessionalLunch2 ? activeSchedule?.lunchEndTime : tenantSchedule?.lunchEndTime;

            const finalAvailableSlots = filterSlotsByDuration(
                apiAvailableTimes,
                serviceDuration,
                closingTime,
                lStartStr,
                lEndStr
            );

            setAvailableSlots(finalAvailableSlots);

            if (rawSlots.length > 0) {
                const apiAllTimes = rawSlots.map(s => s.time.substring(0, 5));
                setAllPotentialSlots(apiAllTimes);
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
    }, [selectedProfessional, selectedService, selectedDate, closures, schedules, tenantSchedules, tenant?.slug]);

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
