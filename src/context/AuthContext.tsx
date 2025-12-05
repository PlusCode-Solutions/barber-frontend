import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Permission } from '../config/permissions';
import { resolveUserPermissions, syncPermissionsToStorage, type RBACUser } from '../utils/auth.utils';
// import instance from '../lib/axios'; // Removed unused import

/**
 * Interface for the user state in Context
 */
export interface AuthUser extends RBACUser {
    id: string;
    email: string;
    name?: string;
    tenantId?: string;
    tenantSlug?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    permissions: Permission[];
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: AuthUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);

                // Resolve permissions immediately using our utility
                const resolvedPermissions = resolveUserPermissions(parsedUser);
                setPermissions(resolvedPermissions);

                // Ensure permissions are synced (self-healing)
                syncPermissionsToStorage(parsedUser, resolvedPermissions);
            } catch (error) {
                console.error("Error parsing stored auth data", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, userData: AuthUser) => {
        // 1. Update State
        setToken(newToken);
        setUser(userData);

        // 2. Resolve Permissions
        const resolvedPermissions = resolveUserPermissions(userData);
        setPermissions(resolvedPermissions);

        // 3. Persist to Storage
        // We persist permissions in the user object too, for redundancy/access outside React if ever needed
        const userToStore = { ...userData, permissions: resolvedPermissions };
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userToStore));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setPermissions([]);
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Optional: Redirect to home or login is usually handled by the component calling logout
        // or by the ProtectedRoute detecting lack of auth
    };

    const value = {
        user,
        token,
        permissions,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access the AuthContext
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
