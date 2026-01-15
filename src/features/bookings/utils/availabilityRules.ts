import { timeToMinutes } from "./timeUtils";

/**
 * Filters available slots based on duration constraints:
 * 1. Must finish before closing time.
 * 2. Must not overlap with lunch break.
 */
export function filterSlotsByDuration(
    slots: string[],
    durationMinutes: number,
    closingTimeStr: string | null | undefined,
    lunchStartStr: string | null | undefined,
    lunchEndStr: string | null | undefined
): string[] {
    if (!slots.length) return [];

    const closingTime = closingTimeStr ? timeToMinutes(closingTimeStr) : null;

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
