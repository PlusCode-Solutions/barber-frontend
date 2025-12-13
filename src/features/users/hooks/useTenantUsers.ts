import { useState, useEffect } from "react";
import type { User } from "../types";
import { UsersService } from "../api/users.service";
import { useAuth } from "../../../context/AuthContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { useTenant } from "../../../context/TenantContext";

export function useTenantUsers() {
    const { tenant } = useTenant();
    const { token } = useAuth();
    const { handleError } = useErrorHandler();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUsers() {
            if (!tenant?.slug) return;

            try {
                setLoading(true);
                const data = await UsersService.getTenantUsers(tenant.slug);
                setUsers(data);
            } catch (err) {
                const message = handleError(err, 'useTenantUsers');
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        if (token && tenant?.slug) {
            fetchUsers();
        }
    }, [token, tenant?.slug, handleError]);

    return { users, loading, error };
}
