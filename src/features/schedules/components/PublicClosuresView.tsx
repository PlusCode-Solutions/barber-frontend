import { Calendar, Store, User, Clock } from "lucide-react";
import { useClosures } from "../hooks/useClosures";
import { safeDate } from "../../../utils/dateUtils";
import { useBarbers } from "../../barbers/hooks/useBarbers";
import ClosuresSkeleton from "./ClosuresSkeleton";

interface Props {
    barberId?: string;
}

export default function PublicClosuresView({ barberId }: Props) {
    const { closures, loading } = useClosures(barberId);
    const { barbers } = useBarbers();

    if (loading) return <ClosuresSkeleton />;
    if (closures.length === 0) return null;

    return (
        <div className="animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-500" />
                Próximos Días Libres
            </h3>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {closures.map((closure, index) => {
                    const d = safeDate(closure.date);
                    if (!d) return null;

                    // Find barber name if closure is barber-specific
                    const barberName = closure.barberId
                        ? barbers.find(b => b.id === closure.barberId)?.name
                        : null;

                    const isPartial = closure.isFullDay === false;

                    return (
                        <div
                            key={closure.id}
                            className={`p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-gray-50 transition-colors ${index !== closures.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <p className="font-extrabold text-gray-900 text-base leading-tight">
                                        {isPartial ? "Medio día libre" : closure.reason}
                                    </p>
                                    {isPartial && (
                                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase tracking-wide">
                                            Parcial
                                        </span>
                                    )}
                                </div>

                                {isPartial && (
                                    <p className="text-xs text-gray-500 font-medium mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                                        Motivo: {closure.reason}
                                    </p>
                                )}

                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 font-semibold capitalize flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>

                                    <div className="flex flex-col gap-2 mt-3">
                                        {/* Show barber name or "Toda la Tienda" */}
                                        {barberName ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100 w-fit">
                                                <User size={14} className="text-blue-600" />
                                                <span className="text-xs text-blue-700 font-bold">{barberName}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                                                <Store size={14} className="text-gray-500" />
                                                <span className="text-xs text-gray-600 font-bold">Toda la Tienda</span>
                                            </div>
                                        )}

                                        {/* Time Range for partial closures */}
                                        {isPartial && closure.startTime && closure.endTime && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-xl border border-orange-100 w-fit">
                                                <Clock size={14} className="text-orange-600" />
                                                <span className="text-xs text-orange-700 font-black">
                                                    {closure.startTime} - {closure.endTime}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`self-start sm:self-center shrink-0 px-4 py-1.5 rounded-full border shadow-sm text-[11px] font-black uppercase tracking-widest ${isPartial
                                    ? 'bg-orange-50 text-orange-600 border-orange-200'
                                    : 'bg-red-50 text-red-600 border-red-200'
                                }`}>
                                {isPartial ? 'Horario Reducido' : 'Cerrado'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
