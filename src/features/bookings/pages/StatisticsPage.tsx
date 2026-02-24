import { useState, useEffect } from "react";
import { format, startOfMonth, subDays } from "date-fns";
import {
    TrendingUp,
    Calendar,
    Download,
    Loader2,
    PieChart,
    Scissors
} from "lucide-react";
import { BookingsService } from "../api/bookings.service";
import { useTenant } from "../../../context/TenantContext";
import { PDFService } from "../services/pdf.service";
import { Card } from "../../../components/ui/Card";
import { toast } from "react-hot-toast";

export default function StatisticsPage() {
    const { tenant } = useTenant();

    // El reporte solo permite hasta ayer
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(yesterday);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    const fetchStats = async () => {
        if (!tenant) return;

        // Validación extra en frontend
        if (endDate > yesterday) {
            toast.error("El reporte solo puede generarse hasta el día de ayer.");
            return;
        }

        setLoading(true);
        try {
            const data = await BookingsService.getStatistics(startDate, endDate);
            setStats(data);
        } catch (error: any) {
            const msg = error.response?.data?.message || "Error al cargar las estadísticas";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [tenant]);

    const handleGeneratePDF = async () => {
        if (!stats || !tenant) return;
        setGeneratingPDF(true);
        try {
            await PDFService.generateStatisticsPDF(
                tenant.name,
                startDate,
                endDate,
                stats,
                tenant.logoUrl
            );
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setGeneratingPDF(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-6 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Estadísticas y Analítica</h1>
                    <p className="text-gray-500 mt-1">Reportes inteligentes para el crecimiento de tu negocio</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                        <Calendar size={18} className="text-gray-400" />
                        <input
                            type="date"
                            className="text-sm font-semibold border-none focus:ring-0 p-0 cursor-pointer bg-transparent"
                            value={startDate}
                            max={yesterday}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                        <input
                            type="date"
                            className="text-sm font-semibold border-none focus:ring-0 p-0 cursor-pointer bg-transparent"
                            value={endDate}
                            max={yesterday}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        Filtrar
                    </button>
                </div>
            </header>

            {!stats && !loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 mb-6 border border-gray-100">
                        <PieChart size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Selecciona un rango de fechas</h2>
                    <p className="text-gray-500 text-sm mt-2 max-w-xs text-center">
                        Para ver el rendimiento y descargar reportes, elige las fechas arriba y presiona Filtrar.
                    </p>
                </div>
            ) : (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium">Ingresos Reales</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                    {loading ? "..." : `$${(stats?.totalRevenue || 0).toLocaleString()}`}
                                </h3>
                                <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${(stats?.growthPercentage || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {(stats?.growthPercentage || 0) >= 0 ? "+" : ""}{(stats?.growthPercentage || 0).toFixed(1)}% vs anterior
                                </div>
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
                                    {loading ? "..." : `$${(stats?.lostRevenue || 0).toLocaleString()}`}
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
                                onClick={handleGeneratePDF}
                                disabled={!stats || loading || generatingPDF}
                                className="mt-4 bg-white text-gray-900 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-gray-100 active:scale-95 disabled:opacity-50"
                            >
                                {generatingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                Descargar Reporte
                            </button>
                        </Card>
                    </div>

                    {/* Performance Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Services */}
                        <Card className="p-0 overflow-hidden border-none shadow-xl shadow-gray-200/50">
                            <div className="p-6 bg-white border-b border-gray-100 flex items-center gap-3">
                                <Scissors size={20} className="text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-900">Rendimiento por Servicio</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Servicio</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Citas</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {(stats?.servicesBreakdown || []).map((s: any) => (
                                            <tr key={s.name} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{s.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{s.count || 0}</td>
                                                <td className="px-6 py-4 text-right font-bold text-blue-600">${(s.revenue || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Barbers */}
                        <Card className="p-0 overflow-hidden border-none shadow-xl shadow-gray-200/50">
                            <div className="p-6 bg-white border-b border-gray-100 flex items-center gap-3">
                                <TrendingUp size={20} className="text-emerald-600" />
                                <h2 className="text-lg font-bold text-gray-900">Rendimiento por Barbero</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Barbero</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Trabajos</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Producido</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {(stats?.barbersBreakdown || []).map((b: any) => (
                                            <tr key={b.name} className="hover:bg-emerald-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold uppercase">
                                                            {(b.name || "U").charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-gray-900">{b.name || "Usuario"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 font-medium">{b.count || 0}</td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600">${(b.revenue || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
