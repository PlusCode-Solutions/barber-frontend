import { Clock, Calendar } from "lucide-react";
import { useSchedules } from "../hooks/useSchedules";
import ScheduleCard from "../components/ScheduleCard";
import SchedulesSkeleton from "../components/SchedulesSkeleton";

export default function SchedulesPage() {
    const { schedules, loading, error } = useSchedules();

    if (loading) return <SchedulesSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    // Ordenar horarios por día de la semana (Domingo a Sábado)
    const sortedSchedules = [...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-6 shadow-lg sticky top-16 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                            Horarios de Atención
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
                                <span className="text-white font-bold text-sm">
                                    Semanal
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <Clock className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            {/* SCHEDULES LIST */}
            <div className="px-4 pt-6">
                {sortedSchedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-dashed border-blue-200 shadow-sm">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-5 shadow-lg">
                            <Calendar className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay horarios configurados</h3>
                        <p className="text-gray-500 text-sm max-w-xs">Los horarios de atención aparecerán aquí cuando sean configurados.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-w-3xl mx-auto">
                        {sortedSchedules.map((schedule) => (
                            <ScheduleCard key={schedule.id} schedule={schedule} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
