import { useBarbers } from "../hooks/useBarbers";
import BarbersSkeleton from "../components/BarbersSkeleton";
import { Users, Mail, Phone, Award, UserCheck } from "lucide-react";

export default function BarbersPage() {
    const { barbers, loading, error } = useBarbers();

    if (loading) return <BarbersSkeleton />;

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
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 pt-8 pb-6 shadow-lg sticky top-16 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                            Nuestros Barberos
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
                                <span className="text-white font-bold text-sm">
                                    {barbers.length}{" "}
                                    {barbers.length === 1 ? "barbero" : "barberos"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            {/* BARBERS GRID */}
            <div className="px-6 pt-6">
                {barbers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-dashed border-purple-200 shadow-sm">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-5 shadow-lg">
                            <Users className="w-12 h-12 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay barberos disponibles</h3>
                        <p className="text-gray-500 text-sm max-w-xs">Los barberos aparecerán aquí cuando estén disponibles.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {barbers.map((barber) => (
                            <div
                                key={barber.id}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-200 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 overflow-hidden"
                            >
                                {/* Barra superior decorativa */}
                                <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>

                                <div className="p-6">
                                    {/* Header con foto y nombre */}
                                    <div className="flex items-start gap-4 mb-4">
                                        {/* Foto del barbero */}
                                        <div className="relative">
                                            {barber.avatar ? (
                                                <img
                                                    src={barber.avatar}
                                                    alt={barber.name}
                                                    className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-purple-100"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-purple-100">
                                                    <Users className="w-10 h-10 text-purple-600" />
                                                </div>
                                            )}
                                            {/* Badge de estado */}
                                            {barber.isActive && (
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                                                    <UserCheck className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Información principal */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{barber.name}</h3>
                                            {barber.specialty && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Award className="w-4 h-4 text-purple-600" />
                                                    <p className="text-sm text-purple-600 font-semibold">{barber.specialty}</p>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${barber.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {barber.isActive ? 'Disponible' : 'No disponible'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalles de contacto */}
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        {/* Email */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Email</p>
                                                <p className="text-sm font-medium text-gray-900 truncate">{barber.email}</p>
                                            </div>
                                        </div>

                                        {/* Teléfono */}
                                        {barber.phone && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Phone className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Teléfono</p>
                                                    <p className="text-sm font-medium text-gray-900">{barber.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 pb-4 pt-2">
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            {barber.isActive && (
                                                <>
                                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                                    Activo
                                                </>
                                            )}
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            Ver perfil →
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
