import { format, parseISO } from "date-fns";
import { toZonedTime, fromZonedTime, format as formatTz } from "date-fns-tz";
import { es } from "date-fns/locale";

const CR_TIMEZONE = "America/Costa_Rica";

/** Verifica si la fecha es válida */
export function isValidDate(dateStr: string): boolean {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

/** 
 * Parsea una fecha asegurando que se interprete en la zona horaria de Costa Rica (UTC-6).
 * Si recibe "YYYY-MM-DD", retorna el objeto Date que corresponde a las 00:00:00 de ese día en CR.
 */
export function safeDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    try {
        // Si es formato YYYY-MM-DD simple
        if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            // "2023-10-25" -> "2023-10-25 00:00:00" en CR
            return fromZonedTime(`${dateStr} 00:00:00`, CR_TIMEZONE);
        }

        // Si es ISO completo con zona, date-fns lo maneja. Si no tiene zona, asumimos UTC o local?
        // Mejor asegurar consistencia: parsedDate
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    } catch (e) {
        return null;
    }
}

/** Retorna la fecha actual en la zona horaria de Costa Rica */
export function getCostaRicaNow(): Date {
    return toZonedTime(new Date(), CR_TIMEZONE);
}

/** Formatea fecha relativa (Hoy, Mañana, lun 3 feb) basado en CR */
export function formatRelativeDate(dateInput: string | Date): string {
    let date = typeof dateInput === 'string' ? safeDate(dateInput) : dateInput;
    if (!date) return "Fecha inválida";

    // Convertir todo a "tiempo CR" para comparar días calendarios
    const nowCR = getCostaRicaNow();
    const targetCR = toZonedTime(date, CR_TIMEZONE);

    // Resetear horas para comparar solo fechas
    const cleanNow = new Date(nowCR.getFullYear(), nowCR.getMonth(), nowCR.getDate());
    const cleanTarget = new Date(targetCR.getFullYear(), targetCR.getMonth(), targetCR.getDate());

    const diffTime = cleanTarget.getTime() - cleanNow.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";

    return formatTz(date, "EEE d MMM", { timeZone: CR_TIMEZONE, locale: es });
}

/** Fecha larga estilo: "lunes, 3 de febrero de 2025" (Zona CR) */
export function formatFullDate(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? safeDate(dateStr) : dateStr;
    if (!date) return "Fecha inválida";

    return formatTz(date, "EEEE, d 'de' MMMM 'de' yyyy", { timeZone: CR_TIMEZONE, locale: es });
}

/** Formatea hora en zona CR, ej: "14:00" */
export function formatHour(timeStr: string, mode: "12h" | "24h" = "24h"): string {
    if (!timeStr) return "";
    
    // Si viene solo "HH:mm", ya es abstracto, no tiene zona. Lo devolvemos tal cual o formateado.
    // Si queremos formatear un Date objeto a hora CR:
    if (timeStr.includes('T') || timeStr.includes('Z')) {
        const d = safeDate(timeStr);
        if(!d) return "";
        return formatTz(d, mode === "24h" ? "HH:mm" : "hh:mm a", { timeZone: CR_TIMEZONE });
    }

    // Tratamiento legacy string "14:00"
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    if (mode === "24h") return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

    const suffix = h >= 12 ? "pm" : "am";
    const hour12 = ((h + 11) % 12 + 1);
    return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/** Verifica si una fecha string corresponde al mismo día que un target Date (en CR) */
export function isSameDay(dateStr: string, targetDate: Date): boolean {
    const d1 = safeDate(dateStr);
    if (!d1) return false;

    // Convertir ambas a CR y comparar componentes YMD
    const cr1 = toZonedTime(d1, CR_TIMEZONE);
    const cr2 = toZonedTime(targetDate, CR_TIMEZONE);

    return (
        cr1.getFullYear() === cr2.getFullYear() &&
        cr1.getMonth() === cr2.getMonth() &&
        cr1.getDate() === cr2.getDate()
    );
}

/**
 * Formatea un objeto Date a "YYYY-MM-DD" basado en su valor en Costa Rica.
 * Útil para enviar al backend o settear inputs fecha.
 */
export function formatDateForInput(date: Date): string {
    return formatTz(date, "yyyy-MM-dd", { timeZone: CR_TIMEZONE });
}

/** "lunes, 3 de febrero" (CR) */
export function formatFriendlyDay(date: Date): string {
    return formatTz(date, "EEEE, d 'de' MMMM", { timeZone: CR_TIMEZONE, locale: es });
}

/** Normaliza string -> YYYY-MM-DD (CR) */
export function normalizeDateString(dateStr: string): string | null {
    const date = safeDate(dateStr);
    if (!date) return null;
    return formatDateForInput(date);
}

