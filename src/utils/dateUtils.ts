// src/utils/dateUtils.ts

/** Valida si una fecha es válida */
export function isValidDate(dateStr: string): boolean {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

/** Parsea fecha de forma segura (si falla devuelve null) */
export function safeDate(dateStr: string): Date | null {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
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