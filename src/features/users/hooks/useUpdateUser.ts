import { useState } from "react";
import type { User, UpdateUserDto } from "../types";
import { updateUser as updateUserApi } from "../api/updateUser";

export function useUpdateUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateUser = async (id: string, data: UpdateUserDto): Promise<User | null> => {
        try {
            setLoading(true);
            setError(null);
            const updatedUser = await updateUserApi(id, data);
            return updatedUser;
        } catch (err: any) {
            console.error("Error updating user:", err);
            setError(err.response?.data?.message || "Error al actualizar usuario");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { updateUser, loading, error };
}
