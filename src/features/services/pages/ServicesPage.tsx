import { useServices } from "../hooks/useServices";
import ServicesSkeleton from "../components/ServicesSkeleton";
import { Scissors, Clock, DollarSign } from "lucide-react";

export default function ServicesPage() {
    const { services, loading, error } = useServices();

    if (loading) return <ServicesSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-6 shadow-lg sticky top-16 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                            Nuestros Servicios
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
                                <span className="text-white font-bold text-sm">
                                    {services.length}{" "}
                                    {services.length === 1 ? "servicio" : "servicios"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <Scissors className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            {/* SERVICES GRID */}
            <div className="px-6 pt-6">
                {services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-dashed border-blue-200 shadow-sm">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-5 shadow-lg">
                            <Scissors className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay servicios disponibles</h3>
                        <p className="text-gray-500 text-sm max-w-xs">Los servicios aparecerán aquí cuando estén disponibles.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                            >
                                {/* Barra superior decorativa */}
                                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                                <div className="p-6">
                                    {/* Nombre del servicio */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                                <Scissors className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                                                <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalles */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        {/* Duración */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Duración</p>
                                                <p className="text-sm font-bold text-purple-600">{service.durationMinutes} min</p>
                                            </div>
                                        </div>

                                        {/* Precio */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                                <DollarSign className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Precio</p>
                                                <p className="text-lg font-black text-green-600">${service.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 pb-4 pt-2">
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            Disponible
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            Reservar →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
