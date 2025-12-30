import { useState, useCallback, useEffect } from "react";
import { BookingsService } from "../api/bookings.service";
import { generateTimeSlots, timeToMinutes } from "../utils/timeUtils";
import { normalizeDateString } from "../../../utils/dateUtils";
import { getDay, parse } from "date-fns";
import type { Barber } from "../../barbers/types";
import type { Closure, Schedule } from "../../schedules/types";
import type { Service } from "../../services/types";
import type { AvailabilitySlot } from "../types";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";

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
    const { user } = useAuth();

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [allPotentialSlots, setAllPotentialSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateSlots = useCallback(async () => {
        setLoadingSlots(true);
        setError(null);
        setAvailableSlots([]);
        setAllPotentialSlots([]);

        try {
            if (!selectedBarber || !selectedDate) return;

            // 1. Check Closures
            const closure = closures.find(c => normalizeDateString(c.date) === selectedDate);
            if (closure) {
                throw new Error(`La barbería está cerrada este día por: ${closure.reason}`);
            }

            // 2. Validate Schedule Restrictions
            const parsedDate = parse(selectedDate, 'yyyy-MM-dd', new Date());
            const dayOfWeek = getDay(parsedDate);

            const schedule = schedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));
            const tenantSchedule = tenantSchedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));

            if (!tenantSchedule || tenantSchedule.isClosed || !tenantSchedule.startTime || !tenantSchedule.endTime) {
                setAllPotentialSlots([]);
                throw new Error(`La barbería no abre los ${parsedDate.toLocaleDateString('es-ES', { weekday: 'long' })}s.`);
            }

            // 3. Generate Potential Slots
            if (schedule && !schedule.isClosed && schedule.startTime && schedule.endTime) {
                const maxTime = (t1: string, t2: string) => t1 > t2 ? t1 : t2;
                const minTime = (t1: string, t2: string) => t1 < t2 ? t1 : t2;

                const effectiveStartTime = maxTime(schedule.startTime, tenantSchedule.startTime);
                const effectiveEndTime = minTime(schedule.endTime, tenantSchedule.endTime);

                if (effectiveStartTime >= effectiveEndTime) {
                    setAllPotentialSlots([]);
                } else {
                    const slots = generateTimeSlots(
                        effectiveStartTime, 
                        effectiveEndTime, 
                        30, 
                        schedule.lunchStartTime, 
                        schedule.lunchEndTime
                    );
                    setAllPotentialSlots(slots);
                }
            } else {
                setAllPotentialSlots([]); 
            }

            if (!tenant?.slug) return;

            // 4. Check API Availability & Occupied Ranges
            const availabilityPromise = BookingsService.checkAvailability(selectedBarber.id, selectedDate);
            
            const isAdmin = user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN';
            const bookingsPromise = isAdmin && tenant?.slug
                ? BookingsService.getTenantBookings(selectedDate, selectedDate, selectedBarber.id).catch(() => [])
                : Promise.resolve([]);

            const [availabilityRes, existingBookings] = await Promise.all([availabilityPromise, bookingsPromise]);

            const rawSlots: AvailabilitySlot[] = availabilityRes.slots || [];

            // Calculate occupied ranges including service durations
            const occupiedRanges: { start: number, end: number }[] = existingBookings
                .filter((b: any) => b.status !== 'CANCELLED')
                .map((b: any) => {
                    const start = timeToMinutes(b.startTime);
                    
                    let end = start + 30; // Default minimum duration
                    if (b.endTime) {
                        end = timeToMinutes(b.endTime);
                    } else if (b.service?.durationMinutes) {
                        end = start + b.service.durationMinutes;
                    }
                    
                    return { start, end };
                });

            const serviceDuration = selectedService?.durationMinutes || 30;
            const apiAvailableTimes = rawSlots
                .filter(s => s.available)
                .map((s) => s.time.substring(0, 5));
            
            // Filter slots checking against occupied ranges and schedule limits
            const finalAvailableSlots = apiAvailableTimes.filter(slotTime => {
                const slotStart = timeToMinutes(slotTime);
                const slotEnd = slotStart + serviceDuration;

                // Check overlap with existing bookings
                const hasOverlap = occupiedRanges.some(range => 
                    (slotStart < range.end) && (slotEnd > range.start)
                );
                if (hasOverlap) return false;

                // Check overlap with closing time
                 const schedule = schedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));
                 if (schedule && schedule.endTime) {
                     const closingTime = timeToMinutes(schedule.endTime);
                     if (slotEnd > closingTime) return false;
                 }
                 
                 // Check overlap with lunch break
                 if (schedule && schedule.lunchStartTime) {
                     const lunchStart = timeToMinutes(schedule.lunchStartTime);
                     const lunchEnd = schedule.lunchEndTime ? timeToMinutes(schedule.lunchEndTime) : lunchStart + 60;
                     if ((slotStart < lunchEnd) && (slotEnd > lunchStart)) return false;
                 }

                return true;
            });
            
            setAvailableSlots(finalAvailableSlots);

        } catch (err: any) {
            console.error("Error calculating availability", err);
            if (err.message && !err.response) {
                setError(err.message);
            } else {
                setError("No se pudo verificar la disponibilidad.");
            }
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, [selectedBarber, selectedService, selectedDate, closures, schedules, tenantSchedules, tenant?.slug, user?.role]);


    // Trigger calculation when dependencies change
    useEffect(() => {
        calculateSlots();
    }, [calculateSlots]);

    return {
        availableSlots,
        allPotentialSlots,
        loadingSlots,
        error
    };
}
