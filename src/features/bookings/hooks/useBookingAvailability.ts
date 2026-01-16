import { useState, useEffect } from "react";
import { SchedulesService } from "../../schedules/api/schedules.service";
import { BookingsService } from "../api/bookings.service";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";
import type { Closure, Schedule } from "../../schedules/types";
import { normalizeDateString, safeDate } from "../../../utils/dateUtils";
import { generateTimeSlots, timeToMinutes } from "../utils/timeUtils";
import { getDay } from "date-fns";
import type { AvailabilitySlot } from "../types";

import { filterSlotsByDuration } from "../utils/availabilityRules";

interface UseBookingAvailabilityProps {
    barber: { id: string } | null | undefined;
    date: string;
    bookingIdToExclude?: string;
    durationMinutes?: number; // Add duration
}


/**
 * Centralized hook to calculate availability.
 * Combines business rules (Tenant/Barber Schedules, Closures) with real availability (Bookings).
 */
export function useBookingAvailability({ barber, date, bookingIdToExclude, durationMinutes }: UseBookingAvailabilityProps) {
    const { tenant } = useTenant();
    const { user } = useAuth();

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [allPotentialSlots, setAllPotentialSlots] = useState<string[]>([]);
    const [breakSlots, setBreakSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [closures, setClosures] = useState<Closure[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [tenantSchedules, setTenantSchedules] = useState<Schedule[]>([]);

    // 1. Cargar Horarios y Cierres (Sistema)
    useEffect(() => {
        if (!barber || !tenant?.slug) return;

        Promise.all([
            SchedulesService.getClosures(barber.id),
            SchedulesService.getSchedules(barber.id),
            SchedulesService.getClosures(),
            SchedulesService.getSchedules()
        ]).then(([barberClosures, schedulesData, globalClosures, tenantSchedulesData]) => {
            const closureMap = new Map<string, Closure>();
            [...globalClosures, ...barberClosures].forEach(c => closureMap.set(c.id, c));
            setClosures(Array.from(closureMap.values()));
            setSchedules(schedulesData);
            setTenantSchedules(tenantSchedulesData);
        }).catch(() => {});
    }, [barber, tenant?.slug]);

    // 2. Calcular Slots y Verificar Disponibilidad
    useEffect(() => {
        if (!barber || !date) {
            setAvailableSlots([]);
            setAllPotentialSlots([]);
            return;
        }

        // Limpieza inicial
        setAvailableSlots([]);
        setAllPotentialSlots([]);
        setError(null);

        const fetchAvailability = async () => {
            // A. Check Closures
            const closure = closures.find(c => normalizeDateString(c.date) === date);
            if (closure) {
                setError(`Cerrado: ${closure.reason || 'Mantenimiento o Festivo'}`);
                return;
            }

            // B. Validate Schedule Restrictions
            const parsedDate = safeDate(date);
            if (!parsedDate) return;

            const dayOfWeek = getDay(parsedDate);
            const schedule = schedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));
            const tenantSchedule = tenantSchedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));

            if (!tenantSchedule || tenantSchedule.isClosed || !tenantSchedule.startTime || !tenantSchedule.endTime) {
                setAllPotentialSlots([]); 
                setError(`No abrimos los ${parsedDate.toLocaleDateString('es-ES', { weekday: 'long' })}.`);
                return;
            }

            if (schedule && !schedule.isClosed && schedule.startTime && schedule.endTime) {
                const maxTime = (t1: string, t2: string) => t1 > t2 ? t1 : t2;
                const minTime = (t1: string, t2: string) => t1 < t2 ? t1 : t2;

                const start = maxTime(schedule.startTime, tenantSchedule.startTime);
                const end = minTime(schedule.endTime, tenantSchedule.endTime);

                if (start >= end) {
                    setAllPotentialSlots([]);
                    setBreakSlots([]);
                } else {
                    // Fallback to tenant lunch times if not defined in barber schedule
                    const lunchStart = schedule.lunchStartTime || tenantSchedule?.lunchStartTime;
                    const lunchEnd = schedule.lunchEndTime || tenantSchedule?.lunchEndTime;

                    const slots = generateTimeSlots(start, end, 30, lunchStart, lunchEnd);
                    setAllPotentialSlots(slots);

                    // Calculate Break Slots
                    if (lunchStart && lunchEnd) {
                        const breaks = generateTimeSlots(lunchStart, lunchEnd, 30);
                        setBreakSlots(breaks);
                    } else {
                        setBreakSlots([]);
                    }
                }
            } else {
                setAllPotentialSlots([]);
                setBreakSlots([]);
            }

            // C. Fetch Real Availability
            setLoading(true);
            try {
                if (!tenant?.slug) return;

                const isAdmin = user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN';
                const formattedDate = parsedDate.toISOString().split('T')[0];
                
                const [availabilityRes, existingBookings] = await Promise.all([
                    BookingsService.checkAvailability(barber.id, formattedDate),
                    isAdmin 
                        ? BookingsService.getTenantBookings(formattedDate, formattedDate, barber.id).catch(() => []) 
                        : Promise.resolve([])
                ]);

                const rawSlots: AvailabilitySlot[] = Array.isArray(availabilityRes) 
                    ? availabilityRes 
                    : (availabilityRes?.slots || []);

                const occupiedRanges: { start: number, end: number }[] = [];
                existingBookings.forEach((b: any) => {
                    if (b.status !== 'CANCELLED' && b.id !== bookingIdToExclude) {
                        const start = timeToMinutes(b.startTime);
                        let end = start + 30;
                        if (b.endTime) end = timeToMinutes(b.endTime);
                        occupiedRanges.push({ start, end });
                    }
                });

                const mappedRawSlots = rawSlots
                    .filter(s => s.available && typeof s.time === 'string')
                    .map(s => s.time.substring(0, 5));
                
                const finalSlots = mappedRawSlots.filter(time => {
                    const slotStart = timeToMinutes(time);
                    const slotEnd = slotStart + 30; // Assuming 30 min duration for availability check
                    return !occupiedRanges.some(range => (slotStart < range.end) && (slotEnd > range.start));
                });
                
                // Helper to get effective closing/lunch
                const lunchStart = schedule?.lunchStartTime || tenantSchedule?.lunchStartTime;
                const lunchEnd = schedule?.lunchEndTime || tenantSchedule?.lunchEndTime;
                
                const closingTime = (schedule?.endTime && tenantSchedule?.endTime) 
                    ? (schedule.endTime < tenantSchedule.endTime ? schedule.endTime : tenantSchedule.endTime)
                    : (schedule?.endTime || tenantSchedule?.endTime);

                const validatedSlots = filterSlotsByDuration(
                    finalSlots,
                    durationMinutes || 30,
                    closingTime || "23:59",
                    lunchStart,
                    lunchEnd
                );

                setAvailableSlots(validatedSlots);

            } catch {
                setError("No se pudo verificar disponibilidad.");
            } finally {
                setLoading(false);
            }
        };

        // Execute only if metadata is loaded
        if (schedules.length > 0 || tenantSchedules.length > 0) {
            fetchAvailability();
        }

    }, [barber, date, closures, schedules, tenantSchedules, tenant?.slug, user?.role, bookingIdToExclude]);

    return {
        availableSlots,
        allPotentialSlots,
        breakSlots,
        loading,
        error,
        closures,
        schedules,
        tenantSchedules 
    };
}
