import { registerRequest } from "../api/register.api";

export function useRegister() {
    const register = async (data: {
        name: string;
        email: string;
        password: string;
        tenantId: string;
    }) => {
        const res = await registerRequest(data);
        return res.data;
    };

    return { register };
}
