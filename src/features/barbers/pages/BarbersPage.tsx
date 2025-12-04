import { useBarbers } from "../hooks/useBarbers";
import BarbersSkeleton from "../components/BarbersSkeleton";
import BarberCard from "../components/BarberCard";
import { Users } from "lucide-react";

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
                            <BarberCard key={barber.id} barber={barber} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
