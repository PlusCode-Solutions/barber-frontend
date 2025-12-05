import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function TenantAdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Dashboard - Admin
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Calendar className="text-blue-600" size={32} />}
                    label="Citas Hoy"
                    value="12"
                    subtitle="3 pendientes"
                />
                <StatCard
                    icon={<Users className="text-indigo-600" size={32} />}
                    label="Barberos Activos"
                    value="5"
                    subtitle="de 6 totales"
                />
                <StatCard
                    icon={<DollarSign className="text-green-600" size={32} />}
                    label="Ingresos Hoy"
                    value="$2,400"
                    subtitle="+15% vs ayer"
                />
                <StatCard
                    icon={<TrendingUp className="text-purple-600" size={32} />}
                    label="Clientes Este Mes"
                    value="145"
                    subtitle="+22 nuevos"
                />
            </div>

            {/* Placeholder for more content */}
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                <p className="text-lg">Dashboard content coming soon...</p>
                <p className="text-sm mt-2">Upcoming appointments, analytics, and more</p>
            </div>
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle: string;
}

function StatCard({ icon, label, value, subtitle }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
                {icon}
                <div className="flex-1">
                    <h3 className="text-gray-600 text-sm font-medium">{label}</h3>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
    );
}
