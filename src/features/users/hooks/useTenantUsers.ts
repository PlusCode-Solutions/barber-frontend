import { useQuery } from "@tanstack/react-query";
import { UsersService } from "../api/users.service";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";

export function useTenantUsers() {
    const { tenant } = useTenant();
    const { token } = useAuth();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['tenant-users', tenant?.slug],
        queryFn: UsersService.getTenantUsers,
        enabled: !!token && !!tenant?.slug,
        staleTime: 1000 * 60, // 1 minute
    });

    return { 
        users: data || [], 
        loading: isLoading, 
        error: error ? (error as Error).message : null, 
        refetch 
    };
}
