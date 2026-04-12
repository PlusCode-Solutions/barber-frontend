import { useQuery } from "@tanstack/react-query";
import { ProfessionalsService } from "../api/professionals.service";
import { useTenant } from "../../../context/TenantContext";

export function useProfessionals(options: { enabled?: boolean } = {}) {
    const { tenant } = useTenant();
    const slug = tenant?.slug;

    const { 
        data: professionals = [], 
        isLoading: loading, 
        error 
    } = useQuery({
        queryKey: ['professionals', slug],
        queryFn: () => ProfessionalsService.getAll(slug!),
        enabled: !!slug && (options.enabled !== false)
    });

    return { 
        professionals, 
        loading, 
        error: error ? (error as Error).message : null 
    };
}
