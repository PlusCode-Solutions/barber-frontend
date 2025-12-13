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
    };
}

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export const AuthService = {
    /**
     * Login user
     */
    login: async (
        tenantSlug: string,
        credentials: LoginCredentials
    ): Promise<AuthResponse> => {
        const res = await axios.post(`/${tenantSlug}/auth/login`, credentials);
        return res.data;
    },

    /**
     * Register new user
     */
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const res = await axios.post("/users", data);
        return res.data;
    },

    /**
     * Logout user (if backend endpoint exists)
     */
    logout: async (): Promise<void> => {
        // Clear local storage is handled by AuthContext
        // This is a placeholder for backend logout if needed
        await axios.post("/auth/logout");
    },
};
