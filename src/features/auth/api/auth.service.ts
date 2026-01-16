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
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        tenantId?: string;
        [key: string]: any; // Allow additional fields from backend
    };
}

export const AuthService = {
    // Login user
    login: async (
        tenantSlug: string,
        credentials: LoginCredentials
    ): Promise<AuthResponse> => {
        const res = await axios.post(`/${tenantSlug}/auth/login`, credentials);
        // Backend returns access_token, map it to token
        // Ensure we capture all user data including tenantId
        const userData = res.data.user || {};
        return {
            token: res.data.access_token,
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                tenantId: userData.tenantId,
                ...userData // Include any additional fields from backend
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
            token: res.data.access_token,
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
    logout: async (): Promise<void> => {
        await axios.post("/auth/logout");
    },
};
