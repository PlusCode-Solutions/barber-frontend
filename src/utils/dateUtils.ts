
import { toZonedTime, fromZonedTime, format as formatTz } from "date-fns-tz";
import { es } from "date-fns/locale";

const CR_TIMEZONE = "America/Costa_Rica";

/** 
 * Verifica si un string de fecha es válido.
 * @param dateStr - Fecha en formato string
 */
export function isValidDate(dateStr: string): boolean {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

/** 
 * Parsea una fecha asegurando que se interprete en la zona horaria de Costa Rica (UTC-6).
 * Si recibe "YYYY-MM-DD", retorna el objeto Date que corresponde a las 00:00:00 de ese día en CR.
 */
/** 
 * Parsea una fecha asegurando consistencia con la zona horaria de Costa Rica (UTC-6).
 * Evita errores de zona horaria al convertir strings ISO o YYYY-MM-DD.
 * @param dateStr - Fecha (ej: "2023-10-25")
 * @returns Date a las 00:00:00 en CR o null
 */
export function safeDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    try {
        // Maneja formato "YYYY-MM-DD..." extrayendo estrictamente la parte de fecha
        // Esto cubre tanto "2023-10-25" como "2023-10-25T00:00:00.000Z" del backend
        if (typeof dateStr === 'string') {
            const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
                const datePart = dateMatch[1];
                // Forzar "2023-10-25 00:00:00" en Timezone CR
                return fromZonedTime(`${datePart} 00:00:00`, CR_TIMEZONE);
            }
        }

        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    } catch (e) {
        return null;
    }
}

/** 
 * Obtiene la fecha y hora actual en la zona horaria de Costa Rica.
 */
export function getCostaRicaNow(): Date {
    return toZonedTime(new Date(), CR_TIMEZONE);
}

/** 
 * Formatea una fecha relativa (Hoy, Mañana, o fecha corta).
 * @param dateInput - Fecha a formatear
 */
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

/** 
 * Formatea una fecha completa (ej: "Lunes, 3 de Febrero de 2025").
 * @param dateStr - Fecha a formatear
 */
export function formatFullDate(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? safeDate(dateStr) : dateStr;
    if (!date) return "Fecha inválida";

    return formatTz(date, "EEEE, d 'de' MMMM 'de' yyyy", { timeZone: CR_TIMEZONE, locale: es });
}

/** 
 * Formatea una hora en formato de 12 o 24 horas.
 * @param timeStr - Hora (HH:mm) o ISO string
 * @param mode - "12h" o "24h"
 */
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

    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = ((h + 11) % 12 + 1);
    return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/** 
 * Verifica si dos fechas corresponden al mismo día del calendario.
 * @param dateStr - Fecha 1 string
 * @param targetDate - Fecha 2 Date
 */
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
 * Formatea un objeto Date a string YYYY-MM-DD en zona CR.
 * @param date - Objeto Date
 */
export function formatDateForInput(date: Date): string {
    return formatTz(date, "yyyy-MM-dd", { timeZone: CR_TIMEZONE });
}

/** 
 * Formatea una fecha en formato amigable (ej: "Lunes, 3 de Febrero").
 * @param date - Objeto Date
 */
export function formatFriendlyDay(date: Date): string {
    return formatTz(date, "EEEE, d 'de' MMMM", { timeZone: CR_TIMEZONE, locale: es });
}

/** 
 * Normaliza un string de fecha al formato estandar YYYY-MM-DD.
 * @param dateStr - Fecha string
 */
export function normalizeDateString(dateStr: string): string | null {
    if (!dateStr) return null;
    // If it's an ISO string or contains T, take the first part
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
        return dateStr.split('T')[0];
    }
    // Fallback using safeDate for other formats
    const date = safeDate(dateStr);
    if (!date) return null;
    return formatDateForInput(date);
}


/** 
 * Verifica si una reserva es pasada (anterior a ahora).
 * @param dateStr - Fecha de la reserva
 * @param timeStr - Hora opcional
 */
export function isPastBooking(dateStr: string, timeStr?: string): boolean {
    const bookingDate = safeDate(dateStr);
    if (!bookingDate) return true;

    // Convert both to Costa Rica Time (Shifted Date components)
    // safeDate already returns a date corresponding to CR midnight in UTC context, 
    // but to compare components transparently we project everything to CR.
    const nowCR = getCostaRicaNow();
    const bookingCR = toZonedTime(bookingDate, CR_TIMEZONE);

    // 1. Compare Date Components (Year, Month, Day)
    
    // Year
    if (bookingCR.getFullYear() > nowCR.getFullYear()) return false;
    if (bookingCR.getFullYear() < nowCR.getFullYear()) return true;

    // Month (0-indexed)
    if (bookingCR.getMonth() > nowCR.getMonth()) return false;
    if (bookingCR.getMonth() < nowCR.getMonth()) return true;

    // Day
    if (bookingCR.getDate() > nowCR.getDate()) return false;
    if (bookingCR.getDate() < nowCR.getDate()) return true;

    // If we are here, it's the SAME DAY.
    
    // Case 2: Compare Time if provided
    if (timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        const nowHours = nowCR.getHours();
        const nowMinutes = nowCR.getMinutes();

        if (hours > nowHours) return false;
        if (hours < nowHours) return true;

        if (minutes > nowMinutes) return false;
        
        // Same time or earlier minute equals "Past" (or strictly "Now")
        return true; 
    }

    // If no time provided, and it's same day => Not past (Today is valid)
    return false;
}
