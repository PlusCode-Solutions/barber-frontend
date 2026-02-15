export interface Schedule {
    id: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    isClosed: boolean;
    lunchStartTime?: string;
    lunchEndTime?: string;
    tenantId?: string;
    barberId?: string;
}

export interface Closure {
    id: string;
    date: string; // YYYY-MM-DD
    reason: string;
    tenantId: string;
    barberId?: string;
    isFullDay?: boolean;
    startTime?: string;
    endTime?: string;
}

export interface CreateScheduleDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isClosed: boolean;
    lunchStartTime?: string;
    lunchEndTime?: string;
    barberId?: string;
}

export interface CreateClosureDto {
    date: string;
    reason: string;
    barberId?: string | null;
    isFullDay?: boolean;
    startTime?: string;
    endTime?: string;
}
