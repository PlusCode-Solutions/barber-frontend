import { Calendar } from "lucide-react";
import { useClosures } from "../hooks/useClosures";
import { safeDate } from "../../../utils/dateUtils";

interface Props {
    barberId?: string;
}

export default function PublicClosuresView({ barberId }: Props) {
    const { closures, loading } = useClosures(barberId);

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

                    return (
                        <div
                            key={closure.id}
                            className={`p-5 flex items-center justify-between hover:bg-gray-50 transition-colors ${index !== closures.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <div>
                                <p className="font-semibold text-gray-900">{closure.reason}</p>
                                <p className="text-sm text-gray-500 capitalize">
                                    {d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <div className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-100 uppercase tracking-wide">
                                Cerrado
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
