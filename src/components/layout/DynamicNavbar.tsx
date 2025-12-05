import SuperAdminNavbar from './navbars/SuperAdminNavbar';
import TenantAdminNavbar from './navbars/TenantAdminNavbar';
import UserNavbar from './navbars/UserNavbar';
import { useAuth } from '../../context/AuthContext';

/**
 * Dynamic Navbar that renders the appropriate navbar based on user role
 * This component should be used in layouts instead of individual navbars
 */
export default function DynamicNavbar() {
    // Get user from AuthContext (Reactive)
    const { user } = useAuth();

    // Render navbar based on role
    switch (user?.role) {
        case 'SUPER_ADMIN':
            return <SuperAdminNavbar />;
        case 'TENANT_ADMIN':
            return <TenantAdminNavbar />;
        case 'USER':
        default:
            return <UserNavbar />;
    }
}
