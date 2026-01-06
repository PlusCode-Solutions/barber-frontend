import { Calendar, Users, Activity } from 'lucide-react';
import { useDashboardStats } from '../../features/dashboard/hooks/useDashboardStats';
import { StatCard } from '../../features/dashboard/components/StatCard';


export default function TenantAdminDashboard() {
    const { stats, loading } = useDashboardStats();


    return (
        <div className="pb-12 max-w-6xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">
                Panel de Control
            </h1>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Citas Hoy */}
                <StatCard
                    icon={<Calendar className="text-white" size={24} />}
                    label="Citas Hoy"
                    value={loading ? "..." : (stats?.appointmentsToday?.toString() ?? "0")}
                    subtitle="Programadas para hoy"
                    className="border-indigo-100 hover:border-indigo-200"
                    iconBgClassName="bg-indigo-500 shadow-indigo-200 shadow-lg"
                />

                {/* 2. Citas Mes Pasado */}
                <StatCard
                    icon={<Activity className="text-white" size={24} />}
                    label="Citas Mes Pasado"
                    value={loading ? "..." : (stats?.appointmentsLastMonth?.toString() ?? "0")}
                    subtitle="Total citas ciclo anterior"
                    className="border-purple-100 hover:border-purple-200"
                    iconBgClassName="bg-purple-500 shadow-purple-200 shadow-lg"
                />

                {/* 3. Barberos Activos */}
                <StatCard
                    icon={<Users className="text-white" size={24} />}
                    label="Barberos Activos"
                    value={loading ? "..." : (stats?.activeBarbers?.toString() ?? "0")}
                    subtitle="En turno actualmente"
                    className="border-pink-100 hover:border-pink-200"
                    iconBgClassName="bg-pink-500 shadow-pink-200 shadow-lg"
                />
            </div>
        </div>
    );
}
