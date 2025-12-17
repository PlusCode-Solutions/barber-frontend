import { useState } from "react";
import { AuthService } from "../api/auth.service";
import { useErrorHandler } from "../../../hooks/useErrorHandler";

export function useRegister() {
    const { handleError } = useErrorHandler();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const register = async (data: {
        name: string;
        email: string;
        password: string;
        tenantId: string;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const response = await AuthService.register(data);
            return response;
        } catch (err) {
            const message = handleError(err, 'useRegister');
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        register,
        loading,
        error,
    };
}
