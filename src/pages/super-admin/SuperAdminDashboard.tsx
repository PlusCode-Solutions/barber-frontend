import { Building2, Users, TrendingUp, DollarSign } from 'lucide-react';

export default function SuperAdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Super Admin Dashboard
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Building2 className="text-purple-600" size={32} />}
                    label="Total Tenants"
                    value="150"
                    trend="+12%"
                />
                <StatCard
                    icon={<Users className="text-blue-600" size={32} />}
                    label="Total Users"
                    value="3,500"
                    trend="+8%"
                />
                <StatCard
                    icon={<TrendingUp className="text-green-600" size={32} />}
                    label="Active Subscriptions"
                    value="142"
                    trend="+5%"
                />
                <StatCard
                    icon={<DollarSign className="text-indigo-600" size={32} />}
                    label="MRR"
                    value="$45,000"
                    trend="+15%"
                />
            </div>

            {/* Placeholder for more content */}
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                <p className="text-lg">Dashboard content coming soon...</p>
                <p className="text-sm mt-2">Tenants management, analytics, and more</p>
            </div>
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend: string;
}

function StatCard({ icon, label, value, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                {icon}
                <span className="text-sm font-semibold text-green-600">{trend}</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
