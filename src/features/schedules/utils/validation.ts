import type { Schedule } from "../types";

/**
 * Validates if a barber's schedule fits within the tenant's operating hours.
 * @param barberSchedule The schedule proposed for the barber
 * @param tenantSchedule The general tenant schedule for that day
 * @returns { isValid: boolean, error?: string }
 */
export function validateScheduleMargin(
    barberSchedule: { startTime?: string; endTime?: string; isClosed?: boolean },
    tenantSchedule?: Schedule
): { isValid: boolean; error?: string } {
    // If no tenant schedule exists for this day, assume it's closed (or open 24/7? Safest is closed/undefined).
    // If tenant schedule says "Closed", barber MUST be closed.
    if (!tenantSchedule || tenantSchedule.isClosed) {
        if (!barberSchedule.isClosed) {
            return { isValid: false, error: "La barbería está cerrada este día. El barbero no puede trabajar." };
        }
        return { isValid: true };
    }

    // If barber is closed, it's always valid
    if (barberSchedule.isClosed) return { isValid: true };

    // Helper to convert "HH:mm" to minutes
    const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const tStart = toMinutes(tenantSchedule.startTime);
    const tEnd = toMinutes(tenantSchedule.endTime);
    
    // Check start time
    if (barberSchedule.startTime) {
        const bStart = toMinutes(barberSchedule.startTime);
        if (bStart < tStart) {
            return { isValid: false, error: `El barbero no puede abrir antes de la hora general (${tenantSchedule.startTime}).` };
        }
        if (bStart > tEnd) {
             return { isValid: false, error: `El inicio del turno debe ser antes del cierre general.` };
        }
    }

    // Check end time
    if (barberSchedule.endTime) {
        const bEnd = toMinutes(barberSchedule.endTime);
        if (bEnd > tEnd) {
            return { isValid: false, error: `El barbero no puede cerrar después de la hora general (${tenantSchedule.endTime}).` };
        }
        if (bEnd < tStart) {
             return { isValid: false, error: `El fin del turno debe ser después de la apertura general.` };
        }
    }

    return { isValid: true };
}
