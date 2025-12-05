import { Outlet } from 'react-router-dom';
import SuperAdminNavbar from './navbars/SuperAdminNavbar';

export default function SuperAdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <SuperAdminNavbar />
            <main className="pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
