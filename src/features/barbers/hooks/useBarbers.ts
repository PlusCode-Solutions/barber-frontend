import { useQuery } from "@tanstack/react-query";
import { BarbersService } from "../api/barbers.service";
import { useTenant } from "../../../context/TenantContext";

export function useBarbers() {
    const { tenant } = useTenant();
    const slug = tenant?.slug;

    const { 
        data: barbers = [], 
        isLoading: loading, 
        error 
    } = useQuery({
        queryKey: ['barbers', slug],
        queryFn: () => BarbersService.getAll(slug!),
        enabled: !!slug
    });

    return { 
        barbers, 
        loading, 
        error: error ? (error as Error).message : null 
    };
}
