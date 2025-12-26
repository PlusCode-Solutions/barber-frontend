import { useState, useCallback, useEffect } from "react";
import { BookingsService } from "../api/bookings.service";
import { generateTimeSlots } from "../utils/timeUtils";
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

            // 1. Check closures
            const closure = closures.find(c => normalizeDateString(c.date) === selectedDate);
            if (closure) {
                throw new Error(`La barbería está cerrada este día por: ${closure.reason}`);
            }

            // 2. Calculations for ALL slots
            const parsedDate = parse(selectedDate, 'yyyy-MM-dd', new Date());
            const dayOfWeek = getDay(parsedDate); // 0-6

            const schedule = schedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));
            const tenantSchedule = tenantSchedules.find(s => Number(s.dayOfWeek) === Number(dayOfWeek));

            // Validation rule: Tenant Schedule dictates strict limits
            if (!tenantSchedule || tenantSchedule.isClosed || !tenantSchedule.startTime || !tenantSchedule.endTime) {
                setAllPotentialSlots([]);
                throw new Error(`La barbería no abre los ${parsedDate.toLocaleDateString('es-ES', { weekday: 'long' })}s.`);
            }

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

            // 3. Fetch Availability
            const availabilityPromise = BookingsService.checkAvailability(selectedBarber.id, selectedDate);
            
            const isAdmin = user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN';
            const bookingsPromise = isAdmin && tenant?.slug
                ? BookingsService.getTenantBookings(selectedDate, selectedDate, selectedBarber.id).catch(() => [])
                : Promise.resolve([]);

            const [availabilityRes, existingBookings] = await Promise.all([availabilityPromise, bookingsPromise]);

            const rawSlots: AvailabilitySlot[] = availabilityRes.slots || [];

            // Get explicitly Busy slots from existing bookings
            const busyTimes = new Set<string>();
            existingBookings.forEach((b: any) => {
                if (b.status !== 'CANCELLED') {
                    const time = b.startTime ? b.startTime.substring(0, 5) : "";
                    if (time) busyTimes.add(time);
                }
            });

            // Filter available slots from API
            const apiAvailableTimes = rawSlots
                .filter(s => s.available)
                .map((s) => s.time.substring(0, 5));
            
            // MERGE
            const finalAvailableSlots = apiAvailableTimes.filter(time => !busyTimes.has(time));
            
            setAvailableSlots(finalAvailableSlots);

        } catch (err: any) {
            console.error("Availability calculation error", err);
            // Don't overwrite if it was a specific validation error thrown above
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
