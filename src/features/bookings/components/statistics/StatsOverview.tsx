import { Download, Loader2 } from "lucide-react";
import { Card } from "../../../../components/ui/Card";

interface StatsOverviewProps {
    stats: any;
    loading: boolean;
    generatingPDF: boolean;
    onGeneratePDF: () => void;
}

export default function StatsOverview({ stats, loading, generatingPDF, onGeneratePDF }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-gray-500 text-sm font-medium">Ingresos Reales</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : `₡${(stats?.totalRevenue || 0).toLocaleString()}`}
                    </h3>
                </div>
            </Card>

            <Card className="p-6 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-gray-500 text-sm font-medium">Citas Efectivas</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : stats?.totalAppointments || 0}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">Citas aprobadas/completadas</p>
                </div>
            </Card>

            <Card className="p-6 border-l-4 border-rose-400 bg-rose-50/30">
                <div className="relative z-10">
                    <p className="text-rose-600 text-sm font-bold uppercase tracking-wider">Flujo Perdido</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : `₡${(stats?.lostRevenue || 0).toLocaleString()}`}
                    </h3>
                    <p className="text-xs text-rose-500 font-medium mt-2">En {stats?.lostAppointments || 0} citas canceladas</p>
                </div>
            </Card>

            <Card className="p-6 bg-gray-900 text-white flex flex-col justify-between">
                <div>
                    <h2 className="text-lg font-bold">Resumen PDF</h2>
                    <p className="text-gray-400 text-xs mt-1">Descarga el reporte detallado para tu contabilidad.</p>
                </div>
                <button
                    onClick={onGeneratePDF}
                    disabled={!stats || loading || generatingPDF}
                    className="mt-4 bg-white text-gray-900 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-gray-100 active:scale-95 disabled:opacity-50"
                >
                    {generatingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                    Descargar Reporte
                </button>
            </Card>
        </div>
    );
}
