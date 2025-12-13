import { useState } from 'react';
import { SchedulesService } from '../api/schedules.service';
import type { CreateScheduleDto, CreateClosureDto, Schedule, Closure } from '../types';
import { useTenant } from '../../../context/TenantContext';

export function useAdminSchedules() {
    const { tenant } = useTenant();
    const slug = tenant?.slug;
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Actualizar configuración de horario
    const updateSchedule = async (data: CreateScheduleDto): Promise<Schedule | null> => {
        if (!slug) return null;
        
        setLoading(true);
        setError(null);
        try {
            const result = await SchedulesService.upsertSchedule(data);
             // TODO: Invalidar cache si usáramos React Query
            return result;
        } catch (err) {
            console.error("Error updating schedule", err);
            setError("Error al actualizar el horario.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Crear cierre (Día libre/festivo)
    const createClosure = async (data: CreateClosureDto): Promise<Closure | null> => {
        if (!slug) return null;

        setLoading(true);
        setError(null);
        try {
            const result = await SchedulesService.createClosure(data);
            return result;
        } catch (err) {
            console.error("Error creating closure", err);
            setError("Error al crear el cierre.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Eliminar cierre
    const deleteClosure = async (id: string): Promise<boolean | string> => {
        if (!slug) return "Error de contexto (Tenant no encontrado)";

        setLoading(true);
        setError(null);
        try {
            await SchedulesService.deleteClosure(id);
            return true;
        } catch (err: any) {
            console.error("Error deleting closure", err);
            // Extraer mensaje del backend si existe
            const msg = err.response?.data?.message || err.message || "Error desconocido al eliminar";
            setError(msg);
            return msg;
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
