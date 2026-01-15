import { useState, useEffect, useCallback } from 'react';
import { TenantsService, type Tenant } from '../api/tenants.service';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';

export function useTenants() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { handleError } = useErrorHandler();

    const fetchTenants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await TenantsService.getAll();
            setTenants(data);
        } catch (err) {
            const message = handleError(err, 'useTenants');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [handleError]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const deleteTenant = useCallback(async (id: string) => {
        try {
            await TenantsService.delete(id);
        } catch (err) {
            const message = handleError(err, 'useTenants');
            setError(message);
            throw err; 
        }
    }, [handleError]);

    return {
        tenants,
        loading,
        error,
        refresh: fetchTenants,
        deleteTenant
    };
}
