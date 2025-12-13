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

export const AuthService = {
    // Login user
    login: async (
        tenantSlug: string,
        credentials: LoginCredentials
    ): Promise<AuthResponse> => {
        const res = await axios.post(`/${tenantSlug}/auth/login`, credentials);
        // Backend returns access_token, map it to token
        return {
            token: res.data.access_token,
            user: res.data.user
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
