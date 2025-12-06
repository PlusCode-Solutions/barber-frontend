import { useState, useEffect } from "react";
import type { User } from "../types";
import { getTenantUsers } from "../api/getTenantUsers";
import { useAuth } from "../../../context/AuthContext";

export function useTenantUsers() {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);
                const data = await getTenantUsers();
                setUsers(data);
            } catch (err) {
                console.error(err);
                setError("Error al cargar los usuarios");
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            fetchUsers();
        }
    }, [token]);

    return { users, loading, error };
}
