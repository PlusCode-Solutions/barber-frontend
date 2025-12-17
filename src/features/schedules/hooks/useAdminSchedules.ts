import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SchedulesService } from '../api/schedules.service';
import type { CreateScheduleDto, CreateClosureDto, Schedule, Closure } from '../types';
import { useTenant } from '../../../context/TenantContext';

export function useAdminSchedules() {
    const { tenant } = useTenant();
    const queryClient = useQueryClient();
    const slug = tenant?.slug;

    // Actualizar horario
    const scheduleMutation = useMutation({
        mutationFn: (data: CreateScheduleDto) => {
            if (!slug) throw new Error("Tenant no disponible");
            return SchedulesService.upsertSchedule(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        }
    });

    // Crear cierre
    const createClosureMutation = useMutation({
        mutationFn: (data: CreateClosureDto) => {
            if (!slug) throw new Error("Tenant no disponible");
            return SchedulesService.createClosure(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['closures', variables.barberId] });
        }
    });

    // Eliminar cierre
    const deleteClosureMutation = useMutation({
        mutationFn: (id: string) => {
            if (!slug) throw new Error("Tenant no disponible");
            return SchedulesService.deleteClosure(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['closures'] });
        }
    });

    // Wrappers
    const updateSchedule = async (data: CreateScheduleDto): Promise<Schedule | null> => {
        try {
            return await scheduleMutation.mutateAsync(data);
        } catch {
            return null;
        }
    };

    const createClosure = async (data: CreateClosureDto): Promise<Closure | null> => {
        try {
            return await createClosureMutation.mutateAsync(data);
        } catch {
            return null;
        }
    };

    const deleteClosure = async (id: string): Promise<boolean | string> => {
        try {
            await deleteClosureMutation.mutateAsync(id);
            return true;
        } catch (error: any) {
            return error.response?.data?.message || error.message || "Error desconocido al eliminar";
        }
    };

    return {
        updateSchedule,
        createClosure,
        deleteClosure,
        loading: scheduleMutation.isPending || createClosureMutation.isPending || deleteClosureMutation.isPending,
        error: scheduleMutation.error || createClosureMutation.error || deleteClosureMutation.error ? "Error en la operación" : null
    };
}
