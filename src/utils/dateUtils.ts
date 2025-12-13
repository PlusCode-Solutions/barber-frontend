// src/utils/dateUtils.ts

/** Valida si una fecha es válida */
export function isValidDate(dateStr: string): boolean {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

/** Parsea fecha de forma segura (si falla devuelve null) */
export function safeDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    // Si es formato YYYY-MM-DD estricto, forzar hora local
    if (typeof dateStr === 'string' && dateStr.length === 10 && dateStr.includes('-')) {
        const d = new Date(dateStr + 'T00:00:00');
        return isNaN(d.getTime()) ? null : d;
    }
    
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
}

/** Devuelve "Hoy", "Mañana" o fecha corta estilo "lun 3 feb" */
export function formatRelativeDate(dateStr: string): string {
    const date = safeDate(dateStr);
    if (!date) return "Fecha inválida";

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === tomorrow.toDateString()) return "Mañana";

    return date.toLocaleDateString("es-ES", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

/** Fecha larga estilo: "lunes, 3 de febrero de 2025" */
export function formatFullDate(dateStr: string): string {
    const date = safeDate(dateStr);
    if (!date) return "Fecha inválida";

    return date.toLocaleDateString("es-ES", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

/** Formatea hora (ej: "14:00") a 12h o 24h */
export function formatHour(timeStr: string, mode: "12h" | "24h" = "24h"): string {
    if (!timeStr) return "";

    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    if (mode === "24h") return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

    // Modo 12h
    const suffix = h >= 12 ? "pm" : "am";
    const hour12 = ((h + 11) % 12 + 1);
    return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/** Verifica si la fecha proporcionada coincide con el día indicado (ignorando horas/zona) */
export function isSameDay(dateStr: string, target: Date): boolean {
    const date = safeDate(dateStr);
    if (!date) return false;

    return (
        date.getFullYear() === target.getFullYear() &&
        date.getMonth() === target.getMonth() &&
        date.getDate() === target.getDate()
    );
}

/** Formatea un objeto Date al formato yyyy-MM-dd para inputs de tipo date */
export function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/** Devuelve una cadena amigable tipo: "lunes, 3 de febrero" (sin año) */
export function formatFriendlyDay(date: Date): string {
    return date.toLocaleDateString("es-ES", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

/** Normaliza un string de fecha a formato yyyy-MM-dd (retorna null si es inválida) */
export function normalizeDateString(dateStr: string): string | null {
    const date = safeDate(dateStr);
    if (!date) return null;
    return formatDateForInput(date);
}
