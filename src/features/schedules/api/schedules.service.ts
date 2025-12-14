import axios from "../../../lib/axios";
import type { Schedule, Closure, CreateScheduleDto, CreateClosureDto } from "../types";


// Helper to normalize snake_case to camelCase
const normalizeSchedule = (s: any): Schedule => ({
    ...s,
    id: s.id,
    dayOfWeek: Number(s.dayOfWeek ?? s.day_of_week),
    startTime: s.startTime ?? s.start_time,
    endTime: s.endTime ?? s.end_time,
    isClosed: s.isClosed ?? s.is_closed,
    lunchStartTime: s.lunchStartTime ?? s.lunch_start_time,
    lunchEndTime: s.lunchEndTime ?? s.lunch_end_time,
    tenantId: s.tenantId ?? s.tenant_id,
    barberId: s.barberId ?? s.barber_id
});

export const SchedulesService = {
    getSchedules: async (barberId?: string): Promise<Schedule[]> => {
        const params = barberId ? { barberId } : {};
        // Endpoint: GET /schedules
        const res = await axios.get(`/schedules`, { params });
        
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (!Array.isArray(data)) return [];

        return data.map(normalizeSchedule);
    },

    getAllSchedules: async (): Promise<Schedule[]> => {
        // Endpoint: GET /schedules/all
        const res = await axios.get(`/schedules/all`);

        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        
        if (!Array.isArray(data)) {
            console.error("Expected array but got:", res.data);
            return [];
        }

        return data.map(normalizeSchedule);
    },

    upsertSchedule: async (data: CreateScheduleDto): Promise<Schedule> => {
        // Endpoint: POST /schedules
        const res = await axios.post(`/schedules`, data);
        return res.data;
    },

    getClosures: async (barberId?: string): Promise<Closure[]> => {
        const params = barberId ? { barberId } : {};
        // Endpoint: GET /closures
        const res = await axios.get(`/closures`, { params });
        return res.data;
    },

    createClosure: async (data: CreateClosureDto): Promise<Closure> => {
        // Endpoint: POST /closures
        const res = await axios.post(`/closures`, data);
        return res.data;
    },

    deleteClosure: async (id: string): Promise<void> => {
        // Endpoint: DELETE /closures/:id
        await axios.delete(`/closures/${id}`);
    }
};
