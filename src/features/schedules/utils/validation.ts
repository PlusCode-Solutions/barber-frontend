import type { Schedule } from "../types";

/**
 * Validates if a professional's schedule fits within the tenant's operating hours.
 * @param professionalSchedule The schedule proposed for the professional
 * @param tenantSchedule The general tenant schedule for that day
 * @returns { isValid: boolean, error?: string }
 */
export function validateScheduleMargin(
    professionalSchedule: { startTime?: string; endTime?: string; isClosed?: boolean },
    tenantSchedule?: Schedule
): { isValid: boolean; error?: string } {
    // If no tenant schedule exists for this day, assume it's closed (or open 24/7? Safest is closed/undefined).
    // If tenant schedule says "Closed", professional MUST be closed.
    if (!tenantSchedule || tenantSchedule.isClosed) {
        if (!professionalSchedule.isClosed) {
            return { isValid: false, error: "La professionalía está cerrada este día. El profesional no puede trabajar." };
        }
        return { isValid: true };
    }

    // If professional is closed, it's always valid
    if (professionalSchedule.isClosed) return { isValid: true };

    // Helper to convert "HH:mm" to minutes
    const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const tStart = toMinutes(tenantSchedule.startTime);
    const tEnd = toMinutes(tenantSchedule.endTime);
    
    // Check start time
    if (professionalSchedule.startTime) {
        const bStart = toMinutes(professionalSchedule.startTime);
        if (bStart < tStart) {
            return { isValid: false, error: `El profesional no puede abrir antes de la hora general (${tenantSchedule.startTime}).` };
        }
        if (bStart > tEnd) {
             return { isValid: false, error: `El inicio del turno debe ser antes del cierre general.` };
        }
    }

    // Check end time
    if (professionalSchedule.endTime) {
        const bEnd = toMinutes(professionalSchedule.endTime);
        if (bEnd > tEnd) {
            return { isValid: false, error: `El profesional no puede cerrar después de la hora general (${tenantSchedule.endTime}).` };
        }
        if (bEnd < tStart) {
             return { isValid: false, error: `El fin del turno debe ser después de la apertura general.` };
        }
    }

    return { isValid: true };
}
