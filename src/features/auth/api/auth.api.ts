import apiClient from "../../../lib/axios";

export const loginApi = (tenantSlug: string, email: string, password: string) => {
    return apiClient.post(`/${tenantSlug}/auth/login`, {
        email,
        password,
    });
};
