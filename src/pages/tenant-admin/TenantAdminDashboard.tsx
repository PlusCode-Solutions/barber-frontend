import { useState } from 'react';
import { Calendar, Users, Activity, Plus, CheckCircle } from 'lucide-react';
import { useDashboardStats } from '../../features/dashboard/hooks/useDashboardStats';
import { StatCard } from '../../features/dashboard/components/StatCard';
import CreateBookingModal from '../../features/bookings/components/CreateBookingModal';
import { useTenant } from '../../context/TenantContext';

export default function TenantAdminDashboard() {
    const { stats, loading, refetch } = useDashboardStats();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { tenant } = useTenant();

    const handleBookingSuccess = () => {
        // Refetch stats after a successfull booking creation
        if (refetch) refetch();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };
    return (
        <div className="pb-12 max-w-6xl mx-auto px-4 sm:px-6">
            {showSuccess && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 z-50 animate-bounce">
                    <CheckCircle size={24} />
                    <span className="font-semibold">¡Cita creada exitosamente!</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Panel de Control
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-xl shadow-sm hover:opacity-90 transition active:scale-95"
                    style={{ backgroundColor: tenant?.primaryColor || '#4f46e5' }}
                >
                    <Plus size={20} />
                    Nueva Cita
                </button>
            </div>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Today's Appointments */}
                <StatCard
                    icon={<Calendar className="text-white" size={24} />}
                    label="Citas Hoy"
                    value={loading ? "..." : (stats?.appointmentsToday?.toString() ?? "0")}
                    subtitle="Programadas para hoy"
                    className="border-indigo-100 hover:border-indigo-200"
                    iconBgClassName="bg-indigo-500 shadow-indigo-200 shadow-lg"
                />

                {/* 2. Last Month's Appointments */}
                <StatCard
                    icon={<Activity className="text-white" size={24} />}
                    label="Citas Mes Pasado"
                    value={loading ? "..." : (stats?.appointmentsLastMonth?.toString() ?? "0")}
                    subtitle="Total citas ciclo anterior"
                    className="border-purple-100 hover:border-purple-200"
                    iconBgClassName="bg-purple-500 shadow-purple-200 shadow-lg"
                />

                {/* 3. Active Professionals */}
                <StatCard
                    icon={<Users className="text-white" size={24} />}
                    label="Profesionales Activos"
                    value={loading ? "..." : (stats?.activeProfessionals?.toString() ?? "0")}
                    subtitle="En turno actualmente"
                    className="border-pink-100 hover:border-pink-200"
                    iconBgClassName="bg-pink-500 shadow-pink-200 shadow-lg"
                />
            </div>

            <CreateBookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleBookingSuccess}
            />
        </div>
    );
}
