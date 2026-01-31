import { Calendar, Store, User } from "lucide-react";
import { useClosures } from "../hooks/useClosures";
import { safeDate } from "../../../utils/dateUtils";
import { useBarbers } from "../../barbers/hooks/useBarbers";

interface Props {
    barberId?: string;
}

export default function PublicClosuresView({ barberId }: Props) {
    const { closures, loading } = useClosures(barberId);
    const { barbers } = useBarbers();

    if (loading || closures.length === 0) return null;

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

                    return (
                        <div
                            key={closure.id}
                            className={`p-5 flex items-center justify-between hover:bg-gray-50 transition-colors ${index !== closures.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{closure.reason}</p>
                                <p className="text-sm text-gray-500 capitalize">
                                    {d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                {/* Show barber name or "Toda la Tienda" */}
                                {barberName ? (
                                    <div className="flex items-center gap-1 mt-1">
                                        <User size={12} className="text-blue-600" />
                                        <span className="text-xs text-blue-600 font-medium">{barberName}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Store size={12} className="text-gray-500" />
                                        <span className="text-xs text-gray-500 font-medium">Toda la Tienda</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-100 uppercase tracking-wide flex-shrink-0">
                                Cerrado
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
