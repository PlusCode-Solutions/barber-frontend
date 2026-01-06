import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle: string;
    className?: string; // Allow custom styling
}

export function StatCard({
    icon,
    label,
    value,
    subtitle,
    className = "",
    style = {},
    iconBgClassName = "bg-gray-50 text-gray-600"
}: StatCardProps & { style?: React.CSSProperties, iconBgClassName?: string }) {
    return (
        <div
            className={`bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 border border-transparent ${className}`}
            style={{
                ...style
            }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1 transition-colors group-hover:text-gray-700">{label}</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
                </div>
                <div className={`p-4 rounded-xl flex items-center justify-center transition-transform hover:scale-110 duration-200 ${iconBgClassName}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
            </div>
        </div>
    );
}
