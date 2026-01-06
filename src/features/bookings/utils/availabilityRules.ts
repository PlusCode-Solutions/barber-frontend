import { timeToMinutes } from "./timeUtils";
import type { Schedule } from "../../schedules/types";

/**
 * Filters available slots based on duration constraints:
 * 1. Must finish before closing time.
 * 2. Must not overlap with lunch break.
 */
export function filterSlotsByDuration(
    slots: string[],
    durationMinutes: number,
    schedule: Schedule | undefined,
    tenantSchedule: Schedule | undefined
): string[] {
    if (!slots.length) return [];

    let closingTime: number | null = null;
    
    if (schedule && !schedule.isClosed && schedule.endTime) {
        closingTime = timeToMinutes(schedule.endTime);
    } else if (tenantSchedule && !tenantSchedule.isClosed && tenantSchedule.endTime) {
        closingTime = timeToMinutes(tenantSchedule.endTime);
    }

    const lunchStartStr = schedule?.lunchStartTime || tenantSchedule?.lunchStartTime;
    const lunchEndStr = schedule?.lunchEndTime || tenantSchedule?.lunchEndTime;
    
    let lunchStart: number | null = null;
    let lunchEnd: number | null = null;
    
    if (lunchStartStr && lunchEndStr) {
        lunchStart = timeToMinutes(lunchStartStr);
        lunchEnd = timeToMinutes(lunchEndStr);
    }

    return slots.filter(slotTime => {
        const slotStart = timeToMinutes(slotTime);
        const slotEnd = slotStart + durationMinutes;

        // Constraint 1: Closing Time
        if (closingTime !== null) {
            if (slotEnd > closingTime) return false;
        }

        // Constraint 2: Lunch Overlap
        // Overlap formula: (StartA < EndB) and (EndA > StartB)
        if (lunchStart !== null && lunchEnd !== null) {
            if (slotStart < lunchEnd && slotEnd > lunchStart) {
                return false;
            }
        }
        
        return true;
    });
}
