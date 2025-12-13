import { useState } from "react";
import { UsersService } from "../api/users.service";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { useTenant } from "../../../context/TenantContext";
import type { User } from "../types";

export function useUpdateUser() {
    const { tenant } = useTenant();
    const { handleError } = useErrorHandler();
    const [loading, setLoading] = useState(false);

    const updateUser = async (userId: string, data: Partial<User>) => {
        if (!tenant?.slug) {
            throw new Error("Tenant no disponible");
        }

        setLoading(true);
        try {
            const updated = await UsersService.update(tenant.slug, userId, data);
            return updated;
        } catch (err) {
            handleError(err, 'useUpdateUser');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateUser, loading };
}
