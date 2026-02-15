import type { Schedule } from '../types';


export function validateCustomRange(
    customStart: string,
    customEnd: string,
    schedule: Schedule
): { valid: boolean; error?: string } {
    if (customStart >= customEnd) {
        return { valid: false, error: 'La hora de inicio debe ser anterior a la hora de fin' };
    }
    
    if (customStart < schedule.startTime || customEnd > schedule.endTime) {
        return { 
            valid: false, 
            error: `El rango debe estar dentro del horario laboral (${schedule.startTime} - ${schedule.endTime})` 
        };
    }
    
    return { valid: true };
}
