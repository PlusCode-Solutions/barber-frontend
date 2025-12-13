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
        <div className="mt-12 max-w-4xl mx-auto animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-500" />
                Próximos Días Libres
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {closures.map(closure => {
                    const d = safeDate(closure.date);
                    if (!d) return null;

                    return (
                        <div key={closure.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="font-semibold text-gray-900">{closure.reason}</p>
                                <p className="text-sm text-gray-500 capitalize">
                                    {d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <div className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-100">
                                CERRADO
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
