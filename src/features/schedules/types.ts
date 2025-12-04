export interface Schedule {
    id: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    isDayOff: boolean;
    breakStartTime?: string;
    breakEndTime?: string;
    tenantId?: string;
    barberId?: string;
}
