import axios from "../../../lib/axios";

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    tenantId: string;
}

interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        tenantId?: string;
        tenantSlug?: string;
        [key: string]: any;
    };
}

export const AuthService = {
    // Login user
    login: async (
        tenantSlug: string,
        credentials: LoginCredentials
    ): Promise<AuthResponse> => {
        const res = await axios.post(`/${tenantSlug}/auth/login`, credentials);
        const userData = res.data.user || {};
        return {
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                tenantId: userData.tenantId,
                ...userData
            }
        };
    },

    // Login for Super Admin (no tenant context)
    adminLogin: async (
        credentials: LoginCredentials
    ): Promise<AuthResponse> => {
        const res = await axios.post(`/admin/auth/login`, credentials);
        const userData = res.data.user || {};
        return {
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                ...userData
            }
        };
    },

    // Register new user
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const res = await axios.post("/users", data);
        return res.data;
    },

    // Logout user
    logout: async (tenantSlug?: string): Promise<void> => {
        const url = tenantSlug ? `/${tenantSlug}/auth/logout` : "/admin/auth/logout";
        await axios.post(url);
    },

    // Get current session user
    getMe: async (tenantSlug?: string): Promise<any> => {
        const url = tenantSlug ? `/${tenantSlug}/auth/me` : "/admin/auth/me";
        const res = await axios.get(url);
        return res.data;
    },

    // Forgot password
    forgotPassword: async (tenantSlug: string, email: string) => {
        const res = await axios.post(`/${tenantSlug}/auth/forgot-password`, { email, tenantSlug });
        return res.data;
    },

    // Reset password
    resetPassword: async (tenantSlug: string, data: any) => {
        const res = await axios.post(`/${tenantSlug}/auth/reset-password`, { ...data, tenantSlug });
        return res.data;
    },

    // Refresh access token
    refreshToken: async (tenantSlug?: string): Promise<void> => {
        const url = tenantSlug ? `/${tenantSlug}/auth/refresh` : "/admin/auth/refresh";
        await axios.post(url);
    },
};
