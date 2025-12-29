import { addMinutes, parse, format } from 'date-fns';

/**
 * Calculate end time based on start time and duration in minutes
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
    try {
        // Parse time string "HH:mm" to Date
        const startDate = parse(startTime, 'HH:mm', new Date());

        // Add duration
        const endDate = addMinutes(startDate, durationMinutes);

        // Format back to "HH:mm"
        return format(endDate, 'HH:mm');
    } catch (error) {
        // Fallback to manual calculation if date-fns fails
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMins = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    }
}

/**
 * Generate time slots between start and end time
 */
export function generateTimeSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number = 30,
    lunchStart?: string | null,
    lunchEnd?: string | null
): string[] {
    const slots: string[] = [];
    const today = new Date();
    
    // Helper to ensure HH:mm format (strip seconds if present)
    const normalize = (t: string) => t.length > 5 ? t.substring(0, 5) : t;

    // Parse times
    let current = parse(normalize(startTime), 'HH:mm', today);
    const end = parse(normalize(endTime), 'HH:mm', today);
    const lStart = lunchStart ? parse(normalize(lunchStart), 'HH:mm', today) : null;
    const lEnd = lunchEnd ? parse(normalize(lunchEnd), 'HH:mm', today) : null;

    // Generate slots
    while (current < end) {
        // If lunch break is defined, skip slots that fall inside it
        // A slot is "inside" if it starts >= lunchStart AND start < lunchEnd
        let isLunch = false;
        if (lStart && lEnd) {
            if (current >= lStart && current < lEnd) {
                isLunch = true;
            }
        }

        if (!isLunch) {
            slots.push(format(current, 'HH:mm'));
        }

        current = addMinutes(current, intervalMinutes);
    }

    return slots;
}

/**
 * Converts "HH:mm" string to minutes from midnight.
 */
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight to "HH:mm" string.
 */
export function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
