import { useState } from "react";
import { deleteUser as deleteUserApi } from "../api/deleteUser";

export function useDeleteUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUser = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            await deleteUserApi(id);
            return true;
        } catch (err: any) {
            console.error("Error deleting user:", err);
            setError(err.response?.data?.message || "Error al eliminar usuario");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteUser, loading, error };
}
