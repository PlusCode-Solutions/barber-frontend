
import { toZonedTime, fromZonedTime, format as formatTz } from "date-fns-tz";
import { es } from "date-fns/locale";

const CR_TIMEZONE = "America/Costa_Rica";

/** 
 * Verifies if a date string is valid.
 * @param dateStr - Date as string
 */
export function isValidDate(dateStr: string): boolean {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

/** 
 * Parses a date ensuring consistency with the Costa Rica time zone (UTC-6).
 * Prevents timezone errors when converting ISO or YYYY-MM-DD strings.
 * @param dateStr - Date (e.g.: "2023-10-25")
 * @returns Date at 00:00:00 in CR or null
 */
export function safeDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    try {
        // Handles "YYYY-MM-DD..." format by strictly extracting the date part.
        // This covers both "2023-10-25" and "2023-10-25T00:00:00.000Z" from the backend.
        if (typeof dateStr === 'string') {
            const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
                const datePart = dateMatch[1];
                // Force "2023-10-25 00:00:00" in CR Timezone
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
 * Gets the current date and time in the Costa Rica time zone.
 */
export function getCostaRicaNow(): Date {
    return toZonedTime(new Date(), CR_TIMEZONE);
}

/** 
 * Formats a relative date (Today, Tomorrow, or short date).
 * @param dateInput - Date to format
 */
export function formatRelativeDate(dateInput: string | Date): string {
    let date = typeof dateInput === 'string' ? safeDate(dateInput) : dateInput;
    if (!date) return "Fecha inválida";

    // Convert everything to "CR time" to compare calendar days
    const nowCR = getCostaRicaNow();
    const targetCR = toZonedTime(date, CR_TIMEZONE);

    // Reset hours to compare dates only
    const cleanNow = new Date(nowCR.getFullYear(), nowCR.getMonth(), nowCR.getDate());
    const cleanTarget = new Date(targetCR.getFullYear(), targetCR.getMonth(), targetCR.getDate());

    const diffTime = cleanTarget.getTime() - cleanNow.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";

    return formatTz(date, "EEE d MMM", { timeZone: CR_TIMEZONE, locale: es });
}

/** 
 * Formats a full date (e.g.: "Lunes, 3 de Febrero de 2025").
 * @param dateStr - Date to format
 */
export function formatFullDate(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? safeDate(dateStr) : dateStr;
    if (!date) return "Fecha inválida";

    return formatTz(date, "EEEE, d 'de' MMMM 'de' yyyy", { timeZone: CR_TIMEZONE, locale: es });
}

/** 
 * Formats time in 12h or 24h format.
 * @param timeStr - Time (HH:mm) or ISO string
 * @param mode - "12h" or "24h"
 */
export function formatHour(timeStr: string, mode: "12h" | "24h" = "24h"): string {
    if (!timeStr) return "";
    
    // If it comes only as "HH:mm", it's already abstract (no zone). Return as is or formatted.
    // If we want to format a Date object to CR time:
    if (timeStr.includes('T') || timeStr.includes('Z')) {
        const d = safeDate(timeStr);
        if(!d) return "";
        return formatTz(d, mode === "24h" ? "HH:mm" : "hh:mm a", { timeZone: CR_TIMEZONE });
    }

    // Legacy "14:00" string treatment
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    if (mode === "24h") return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = ((h + 11) % 12 + 1);
    return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/** 
 * Verifies if two dates correspond to the same calendar day.
 * @param dateStr - Date 1 string
 * @param targetDate - Date 2 Date
 */
export function isSameDay(dateStr: string, targetDate: Date): boolean {
    const d1 = safeDate(dateStr);
    if (!d1) return false;

    // Convert both to CR and compare YMD components
    const cr1 = toZonedTime(d1, CR_TIMEZONE);
    const cr2 = toZonedTime(targetDate, CR_TIMEZONE);

    return (
        cr1.getFullYear() === cr2.getFullYear() &&
        cr1.getMonth() === cr2.getMonth() &&
        cr1.getDate() === cr2.getDate()
    );
}

/** 
 * Formats a Date object to YYYY-MM-DD string in CR zone.
 * @param date - Date object
 */
export function formatDateForInput(date: Date): string {
    return formatTz(date, "yyyy-MM-dd", { timeZone: CR_TIMEZONE });
}

/** 
 * Formats a date in a friendly format (e.g.: "Lunes, 3 de Febrero").
 * @param date - Date object
 */
export function formatFriendlyDay(date: Date): string {
    return formatTz(date, "EEEE, d 'de' MMMM", { timeZone: CR_TIMEZONE, locale: es });
}

/** 
 * Normalizes a date string to the standard YYYY-MM-DD format.
 * @param dateStr - Date string
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
 * Verifies if a booking is past (before now).
 * @param dateStr - Booking date
 * @param timeStr - Optional time
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
