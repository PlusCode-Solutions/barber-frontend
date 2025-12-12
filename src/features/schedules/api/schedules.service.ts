import axios from "../../../lib/axios";
import type { Schedule, Closure, CreateScheduleDto, CreateClosureDto } from "../types";

// Mock Data Helpers
const STORAGE_KEYS = {
    SCHEDULES: 'mock_schedules_v2',
    CLOSURES: 'mock_closures_v2'
};

const getMockData = <T>(key: string, defaultData: T): T => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
};

const setMockData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Helper for defaults
const generateDefaultSchedules = (): Schedule[] => {
    const defaultSchedules: Schedule[] = [1, 2, 3, 4, 5].map(day => ({
        id: `sched-${day}`,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isClosed: false
    }));
    // Sat 09-14
    defaultSchedules.push({ id: 'sched-6', dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isClosed: false });
    // Sun Off
    defaultSchedules.push({ id: 'sched-0', dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isClosed: true });
    return defaultSchedules;
};

export const SchedulesService = {
    getSchedules: async (slug: string, barberId?: string): Promise<Schedule[]> => {
        try {
            const params = barberId ? { barberId } : {};
            const res = await axios.get(`/${slug}/schedules`, { params });
            if (Array.isArray(res.data)) return res.data;
            
            console.warn("API returned invalid format (not array), using Mock data");
            throw new Error("Invalid format"); 
        } catch (error: any) {
            console.warn("API Error (Schedules), using Mock data:", error.message || "Unknown error");
            
            let stored = getMockData<Schedule[] | null>(STORAGE_KEYS.SCHEDULES, null);
            if (!stored) {
                stored = generateDefaultSchedules();
                setMockData(STORAGE_KEYS.SCHEDULES, stored);
            }
            return stored;
        }
    },

    upsertSchedule: async (slug: string, data: CreateScheduleDto): Promise<Schedule> => {
        try {
            const res = await axios.post(`/${slug}/schedules`, data);
            return res.data;
        } catch (error) {
            console.warn("API Error (Upsert), using Mock data");
            
            let current = getMockData<Schedule[] | null>(STORAGE_KEYS.SCHEDULES, null);
            if (!current) {
                current = generateDefaultSchedules();
            }

            const newSchedule: Schedule = {
                ...data,
                id: `sched-${data.dayOfWeek}-${Date.now()}`,
                tenantId: 'mock-tenant'
            };
            
            const existingIndex = current.findIndex(s => s.dayOfWeek === data.dayOfWeek);
            if (existingIndex >= 0) {
                current[existingIndex] = { ...current[existingIndex], ...data };
            } else {
                current.push(newSchedule);
            }
            
            setMockData(STORAGE_KEYS.SCHEDULES, current);
            return newSchedule;
        }
    },

    getClosures: async (slug: string, barberId?: string): Promise<Closure[]> => {
        try {
            const params = barberId ? { barberId } : {};
            const res = await axios.get(`/${slug}/closures`, { params });
            if (Array.isArray(res.data)) return res.data;
            console.warn("API returned invalid format (not array), using Mock data");
            return getMockData<Closure[]>(STORAGE_KEYS.CLOSURES, []);
        } catch (error: any) {
            console.warn("API Error (Closures), using Mock data:", error.message || "Unknown error");
            return getMockData<Closure[]>(STORAGE_KEYS.CLOSURES, []);
        }
    },

    createClosure: async (slug: string, data: CreateClosureDto): Promise<Closure> => {
        try {
            const res = await axios.post(`/${slug}/closures`, data);
            return res.data;
        } catch (error) {
            console.warn("API Error (Create Closure), using Mock data");
            const current = getMockData<Closure[]>(STORAGE_KEYS.CLOSURES, []);
            const newClosure: Closure = {
                id: `closure-${Date.now()}`,
                date: data.date,
                reason: data.reason,
                tenantId: 'mock-tenant'
            };
            current.push(newClosure);
            setMockData(STORAGE_KEYS.CLOSURES, current);
            return newClosure;
        }
    },

    deleteClosure: async (slug: string, id: string): Promise<void> => {
        try {
            await axios.delete(`/${slug}/closures/${id}`);
        } catch (error) {
            console.warn("API Error (Delete Closure), using Mock data");
            const current = getMockData<Closure[]>(STORAGE_KEYS.CLOSURES, []);
            const filtered = current.filter(c => c.id !== id);
            setMockData(STORAGE_KEYS.CLOSURES, filtered);
        }
    }
};
