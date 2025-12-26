import { Outlet } from 'react-router-dom';
import TenantAdminNavbar from './navbars/TenantAdminNavbar';
import { useAuth } from '../../context/AuthContext';
import { ChocoAssistant } from '../ChocoAssistant';

export default function TenantAdminLayout() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <TenantAdminNavbar />
            <main>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            {/* Choco Assistant Integration */}
            {user && <ChocoAssistant userRole={user.role || ''} />}
        </div>
    );
}
