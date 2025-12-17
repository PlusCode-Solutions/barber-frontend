import { useState } from "react";
import { UsersService } from "../api/users.service";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { useTenant } from "../../../context/TenantContext";

export function useDeleteUser() {
    const { tenant } = useTenant();
    const { handleError } = useErrorHandler();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUser = async (userId: string): Promise<boolean> => {
        if (!tenant?.slug) {
            throw new Error("Tenant no disponible");
        }

        setLoading(true);
        try {
            await UsersService.delete(userId);
            return true;
        } catch (err) {
            handleError(err, 'useDeleteUser');
            setError("No se pudo eliminar el usuario");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteUser, loading, error };
}
