import { format as formatTz } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import type { AnnouncementType } from './types';

const CR_TIMEZONE = 'America/Costa_Rica';

export const ANNOUNCEMENT_TYPE_OPTIONS: Array<{ value: AnnouncementType; label: string }> = [
    { value: 'INFO', label: 'Información' },
    { value: 'SUCCESS', label: 'Éxito' },
    { value: 'WARNING', label: 'Advertencia' },
    { value: 'ERROR', label: 'Importante' },
];

export const ANNOUNCEMENT_TYPE_STYLES: Record<
    AnnouncementType,
    { label: string; badge: string; iconBox: string; accent: string }
> = {
    INFO: {
        label: 'Información',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        iconBox: 'bg-blue-100 text-blue-600',
        accent: 'bg-blue-500',
    },
    SUCCESS: {
        label: 'Éxito',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconBox: 'bg-emerald-100 text-emerald-600',
        accent: 'bg-emerald-500',
    },
    WARNING: {
        label: 'Advertencia',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        iconBox: 'bg-amber-100 text-amber-600',
        accent: 'bg-amber-500',
    },
    ERROR: {
        label: 'Importante',
        badge: 'bg-red-50 text-red-700 border-red-200',
        iconBox: 'bg-red-100 text-red-600',
        accent: 'bg-red-500',
    },
};

/** Converts a YYYY-MM-DD date to the end of that day in Costa Rica. */
export function expirationEndOfDay(date: string): Date {
    return new Date(`${date}T23:59:59.999-06:00`);
}

export function getAnnouncementTypeLabel(type: AnnouncementType): string {
    return ANNOUNCEMENT_TYPE_STYLES[type].label;
}

export function formatExpiration(isoDate: string): string {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'Fecha inválida';

    return formatTz(date, "d 'de' MMMM 'de' yyyy, hh:mm a", {
        timeZone: CR_TIMEZONE,
        locale: es,
    });
}

export function isExpired(isoDate: string): boolean {
    const date = new Date(isoDate);
    return Number.isNaN(date.getTime()) || date.getTime() <= Date.now();
}
