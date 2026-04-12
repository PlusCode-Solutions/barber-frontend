import { useQuery } from "@tanstack/react-query";
import { SchedulesService } from "../api/schedules.service";
import { useTenant } from "../../../context/TenantContext";

export function useSchedules(professionalId?: string, fetchAll: boolean = false) {
    const { tenant } = useTenant();
    const slug = tenant?.slug;

    const { 
        data: schedules = [], 
        isLoading: loading, 
        error,
        refetch 
    } = useQuery({
        queryKey: ['schedules', slug, professionalId, fetchAll],
        queryFn: () => fetchAll 
            ? SchedulesService.getAllSchedules()
            : SchedulesService.getSchedules(professionalId),
        enabled: !!slug, 
    });

    return { 
        schedules, 
        loading, 
        error: error ? (error as Error).message : null, 
        refresh: refetch, 
        professionalId 
    };
}
