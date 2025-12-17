import { Calendar, Users, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { useDashboardStats } from '../../features/dashboard/hooks/useDashboardStats';
import { StatCard } from '../../features/dashboard/components/StatCard';
import { formatCurrency } from '../../utils/formatUtils';

export default function TenantAdminDashboard() {
    const { stats, loading } = useDashboardStats();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Panel de Control
            </h1>

            {/* Operational Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={<Calendar className="text-blue-600" size={32} />}
                    label="Citas Hoy"
                    value={loading ? "..." : stats.todayCount.toString()}
                    subtitle={loading ? "..." : `${stats.pendingToday} pendientes`}
                />
                <StatCard
                    icon={<Users className="text-indigo-600" size={32} />}
                    label="Barberos Activos"
                    value={loading ? "..." : stats.activeBarbersCount.toString()}
                    subtitle="Total registrados"
                />
                <StatCard
                    icon={<Users className="text-purple-600" size={32} />}
                    label="Clientes (Mes)"
                    value={loading ? "..." : stats.monthClientsCount.toString()}
                    subtitle="Usuarios únicos"
                />
            </div>

            {/* Financial Stats Section */}
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="text-gray-500" />
                Resumen Financiero
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={<DollarSign className="text-green-600" size={32} />}
                    label="Ingresos (Hoy)"
                    value={loading ? "..." : formatCurrency(stats.revenue.today)}
                    subtitle="Estimado del día"
                    className="border-green-100 bg-green-50/30"
                />
                <StatCard
                    icon={<TrendingUp className="text-green-600" size={32} />}
                    label="Ingresos (Semana)"
                    value={loading ? "..." : formatCurrency(stats.revenue.weekly)}
                    subtitle="Lunes - Domingo"
                    className="border-green-100 bg-green-50/30"
                />
                <StatCard
                    icon={<DollarSign className="text-emerald-700" size={32} />}
                    label="Ingresos (Mes)"
                    value={loading ? "..." : formatCurrency(stats.revenue.monthly)}
                    subtitle="Mes actual"
                    className="border-green-100 bg-green-50/50"
                />
            </div>

            {/* Placeholder for more content */}
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                <p className="text-lg">Más estadísticas próximamente...</p>
                <p className="text-sm mt-2">Estamos trabajando en gráficos detallados de rendimiento.</p>
            </div>
        </div>
    );
}
