import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Permission } from '../config/permissions';
import { resolveUserPermissions, type RBACUser } from '../utils/auth.utils';
import { AuthService } from '../features/auth/api/auth.service';

/**
 * Interface for the user state in Context
 */
export interface AuthUser extends RBACUser {
    id: string;
    email: string;
    name?: string;
    tenantId?: string;
    tenantSlug?: string;
    professionalId?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    permissions: Permission[];
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData?: AuthUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async (tenantSlug?: string) => {
        try {
            const userData = await AuthService.getMe(tenantSlug);
            setUser(userData);
            setPermissions(resolveUserPermissions(userData));
            return true;
        } catch (error) {
            console.error("Auth verification failed", error);
            setUser(null);
            setPermissions([]);
            return false;
        }
    }, []);

    // Verify session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const tenantSlug = window.location.pathname.split('/')[1];
            const isValidSlug = tenantSlug && !['admin', 'super-admin'].includes(tenantSlug);

            await fetchUser(isValidSlug ? tenantSlug : undefined);
            setIsLoading(false);
        };

        checkAuth();
    }, [fetchUser]);

    const login = (userData?: AuthUser) => {
        if (userData) {
            // Backwards compatibility: set user data directly
            setUser(userData);
            setPermissions(resolveUserPermissions(userData));
        } else {
            // After login, fetch user data from server
            const tenantSlug = window.location.pathname.split('/')[1];
            const isValidSlug = tenantSlug && !['admin', 'super-admin'].includes(tenantSlug);
            fetchUser(isValidSlug ? tenantSlug : undefined);
        }
    };

    const logout = async () => {
        try {
            const tenantSlug = window.location.pathname.split('/')[1];
            const isValidSlug = tenantSlug && !['admin', 'super-admin'].includes(tenantSlug);
            await AuthService.logout(isValidSlug ? tenantSlug : undefined);
        } catch (error) {
            console.error("Logout error", error);
        }
        setUser(null);
        setPermissions([]);
    };

    const value = {
        user,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Always render children - isLoading is exposed in context for components to use.
                The TenantProvider's SplashScreen already masks the UI during initial load. */}
            {children}
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
