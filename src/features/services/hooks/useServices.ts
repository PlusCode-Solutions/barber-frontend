import { useQuery } from "@tanstack/react-query";
import { ServicesService } from "../api/services.service";
import { useTenant } from "../../../context/TenantContext";


export function useServices() {
    const { tenant } = useTenant();
    const slug = tenant?.slug;

    const { 
        data: services = [], 
        isLoading: loading, 
        error,
        refetch 
    } = useQuery({
        queryKey: ['services', slug],
        queryFn: () => ServicesService.getAll(slug!),
        enabled: !!slug, // Only fetch if slug exists
    });

    return { 
        services, 
        loading, 
        error: error ? (error as Error).message : null, 
        refresh: refetch 
    };
}
