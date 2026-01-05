import { Calendar, Users, Activity } from 'lucide-react';
import { useDashboardStats } from '../../features/dashboard/hooks/useDashboardStats';
import { StatCard } from '../../features/dashboard/components/StatCard';
import { useTenant } from '../../context/TenantContext';

export default function TenantAdminDashboard() {
    const { stats, loading } = useDashboardStats();
    const { tenant } = useTenant();

    const cardStyle = {
        borderColor: tenant?.primaryColor || '#e5e7eb',
        borderWidth: '2px' // Making the uniform border slightly visible
    };

    return (
        <div className="pb-12 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Panel de Control
            </h1>

            {/* 2x2 Grid Layout - More spacious */}
            <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                {/* 1. Citas Hoy */}
                <StatCard
                    icon={<Calendar className="text-blue-600" size={32} />}
                    label="Citas Hoy"
                    value={loading ? "..." : (stats?.appointmentsToday?.toString() ?? "0")}
                    subtitle="Programadas para hoy"
                    className="h-full min-h-[180px] py-6"
                    style={cardStyle}
                />

                {/* 2. Citas Mes Pasado */}
                <StatCard
                    icon={<Activity className="text-purple-600" size={32} />}
                    label="Citas Mes Pasado"
                    value={loading ? "..." : (stats?.appointmentsLastMonth?.toString() ?? "0")}
                    subtitle="Total citas ciclo anterior"
                    className="h-full min-h-[180px] py-6"
                    style={cardStyle}
                />

                {/* 3. Barberos Activos */}
                <StatCard
                    icon={<Users className="text-indigo-600" size={32} />}
                    label="Barberos Activos"
                    value={loading ? "..." : (stats?.activeBarbers?.toString() ?? "0")}
                    subtitle="En turno actualmente"
                    className="h-full min-h-[180px] py-6"
                    style={cardStyle}
                />
            </div>
        </div>
    );
}
