import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TenantsService } from '../api/tenants.service';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';


const TENANTS_QUERY_KEY = ['admin', 'tenants'];

export function useTenants() {
    const { handleError } = useErrorHandler();
    const queryClient = useQueryClient();

    // Fetch tenants with caching
    const {
        data: tenants = [],
        isLoading: loading,
        error: queryError,
        refetch
    } = useQuery({
        queryKey: TENANTS_QUERY_KEY,
        queryFn: async () => {
            try {
                return await TenantsService.getAll();
            } catch (err) {
                const message = handleError(err, 'useTenants');
                throw new Error(message);
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
        gcTime: 10 * 60 * 1000, // 10 minutes - cache retention (formerly cacheTime)
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        refetchOnReconnect: true, // Refetch when internet reconnects
    });

    // Delete tenant mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await TenantsService.delete(id);
        },
        onSuccess: () => {
            // Invalidate and refetch tenants after successful delete
            queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
        },
        onError: (err) => {
            handleError(err, 'useTenants');
        }
    });

    return {
        tenants,
        loading,
        error: queryError?.message || null,
        refresh: refetch,
        deleteTenant: deleteMutation.mutateAsync
    };
}
