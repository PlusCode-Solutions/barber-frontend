import { useState } from 'react';
import { SchedulesService } from '../api/schedules.service';
import type { CreateScheduleDto, CreateClosureDto, Schedule, Closure } from '../types';
import { useTenant } from '../../../context/TenantContext';

export function useAdminSchedules() {
    const { tenant } = useTenant();
    const slug = tenant?.slug;
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateSchedule = async (data: CreateScheduleDto): Promise<Schedule | null> => {
        if (!slug) {
            console.error("No tenant slug found in context");
            return null;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await SchedulesService.upsertSchedule(slug, data);
            return result;
        } catch (err) {
            console.error("Error updating schedule", err);
            setError("Failed to update schedule");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const createClosure = async (data: CreateClosureDto): Promise<Closure | null> => {
        if (!slug) {
            console.error("No tenant slug found in context");
            return null;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await SchedulesService.createClosure(slug, data);
            return result;
        } catch (err) {
            console.error("Error creating closure", err);
            setError("Failed to create closure");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteClosure = async (id: string): Promise<boolean> => {
        if (!slug) {
            console.error("No tenant slug found in context");
            return false;
        }
        setLoading(true);
        setError(null);
        try {
            await SchedulesService.deleteClosure(slug, id);
            return true;
        } catch (err) {
            console.error("Error deleting closure", err);
            setError("Failed to delete closure");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateSchedule,
        createClosure,
        deleteClosure,
        loading,
        error
    };
}
