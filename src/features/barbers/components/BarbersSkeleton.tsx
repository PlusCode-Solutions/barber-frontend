import { useTenant } from "../../../context/TenantContext";

export default function BarbersSkeleton() {
    const { tenant } = useTenant();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
            {/* HEADER SKELETON */}
            <div
                className="px-6 pt-8 pb-6 shadow-lg sticky top-16 z-10 transition-colors duration-300"
                style={{ backgroundColor: tenant?.primaryColor || '#6b7280' }} // Gray-500 fallback
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-9 w-56 bg-white/20 rounded-lg mb-3 animate-pulse"></div>
                        <div className="h-7 w-32 bg-white/15 rounded-full animate-pulse"></div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl animate-pulse"></div>
                </div>
            </div>

            {/* BARBERS SKELETON */}
            <div className="px-6 pt-6 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
                    >
                        {/* Barra superior */}
                        <div className="h-1.5 bg-gray-200"></div>

                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-2xl animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-6 w-40 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                                    <div className="h-4 w-32 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                                    <div className="h-3 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                                </div>
                            </div>

                            {/* Detalles */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                                    <div className="flex-1">
                                        <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                                    <div className="flex-1">
                                        <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
