import { useState } from "react";
import { UsersService } from "../api/users.service";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { useTenant } from "../../../context/TenantContext";

export function useDeleteUser() {
    const { tenant } = useTenant();
    const { handleError } = useErrorHandler();
    const [loading, setLoading] = useState(false);

    const deleteUser = async (userId: string) => {
        if (!tenant?.slug) {
            throw new Error("Tenant no disponible");
        }

        setLoading(true);
        try {
            await UsersService.delete(tenant.slug, userId);
        } catch (err) {
            handleError(err, 'useDeleteUser');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { deleteUser, loading };
}
