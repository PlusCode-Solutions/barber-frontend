import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle: string;
    className?: string; // Allow custom styling
}

export function StatCard({ icon, label, value, subtitle, className = "", style = {} }: StatCardProps & { style?: React.CSSProperties }) {
    return (
        <div
            className={`bg-white rounded-xl shadow-sm p-6 border ${className}`}
            style={{
                borderColor: style.borderColor || '#e5e7eb',
                ...style
            }}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
            </div>
            <p className="text-sm text-gray-400 font-medium">{subtitle}</p>
        </div>
    );
}
