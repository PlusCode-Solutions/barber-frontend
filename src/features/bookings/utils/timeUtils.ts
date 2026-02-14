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
    
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    const lStartMin = lunchStart ? timeToMinutes(lunchStart) : null;
    const lEndMin = lunchEnd ? timeToMinutes(lunchEnd) : null;

    let current = startMin;

    while (current < endMin) {
        let isLunch = false;
        if (lStartMin !== null && lEndMin !== null) {
            if (current >= lStartMin && current < lEndMin) {
                isLunch = true;
            }
        }

        if (!isLunch) {
            slots.push(minutesToTime(current));
        }

        current += intervalMinutes;
    }

    return slots;
}

/**
 * Converts "HH:mm" string to minutes from midnight.
 */
export function timeToMinutes(time: string | any): number {
    if (!time || typeof time !== 'string') {
        return 0; 
    }
    
    const cleanTime = time.trim().toUpperCase();
    const isPM = cleanTime.includes('PM');
    const isAM = cleanTime.includes('AM');
    
    // Remove AM/PM for splitting
    const numericPart = cleanTime.replace('AM', '').replace('PM', '').trim();
    let [hours, minutes] = numericPart.split(':').map(Number);
    
    if (isNaN(hours)) return 0;
    if (isNaN(minutes)) minutes = 0;

    // Convert to 24h if AM/PM present
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    
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
