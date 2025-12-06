import { Outlet } from 'react-router-dom';
import TenantAdminNavbar from './navbars/TenantAdminNavbar';

export default function TenantAdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <TenantAdminNavbar />
            <main>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
