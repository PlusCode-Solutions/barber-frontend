import { Star, Sparkles } from "lucide-react";
import { Card } from "../../../../components/ui/Card";

interface BusinessInsightsProps {
    stats: any;
}

export default function BusinessInsights({ stats }: BusinessInsightsProps) {
    return (
        <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border-none bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-100/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-200/50 rounded-lg text-amber-700">
                        <Star size={20} fill="currentColor" />
                    </div>
                    <h3 className="font-bold text-amber-900 leading-tight">Servicio Estrella</h3>
                </div>
                <p className="text-2xl font-black text-amber-900">
                    {stats?.insights?.starService?.name || "Calculando..."}
                </p>
                <p className="text-sm text-amber-700 mt-1 font-medium">
                    Generó ₡{(stats?.insights?.starService?.revenue || 0).toLocaleString()} este periodo
                </p>
            </Card>

            <Card className="p-6 border-none bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg shadow-indigo-100/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-200/50 rounded-lg text-indigo-700">
                        <Sparkles size={20} />
                    </div>
                    <h3 className="font-bold text-indigo-900 leading-tight">Día de Oro</h3>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-indigo-900">
                        {stats?.insights?.busiestDay || "—"}
                    </p>
                </div>
                <p className="text-sm text-indigo-700 mt-1 font-medium">
                    Es el día con mayor afluencia de clientes
                </p>
            </Card>
        </div>
    );
}
