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
