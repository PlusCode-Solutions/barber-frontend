import { Calendar, Loader2, PieChart } from "lucide-react";
import { useStatistics } from "../hooks/useStatistics";

// Componentes modulares
import StatsOverview from "../components/statistics/StatsOverview";
import BusinessInsights from "../components/statistics/BusinessInsights";
import RevenueChart from "../components/statistics/RevenueChart";
import PerformanceTables from "../components/statistics/PerformanceTables";

export default function StatisticsPage() {
    const {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        stats,
        loading,
        generatingPDF,
        yesterday,
        fetchStats,
        handleGeneratePDF
    } = useStatistics();

    return (
        <div className="space-y-6 animate-fade-in p-4 md:p-6 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Estadísticas y Analítica</h1>
                    <p className="text-gray-500 text-sm mt-1">Reportes inteligentes para el crecimiento de tu negocio</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                        <Calendar size={16} className="text-gray-400" />
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
                        className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-xl text-sm font-bold transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={14} />}
                        Filtrar
                    </button>
                </div>
            </header>

            {!stats && !loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
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
                    <StatsOverview
                        stats={stats}
                        loading={loading}
                        generatingPDF={generatingPDF}
                        onGeneratePDF={handleGeneratePDF}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <BusinessInsights stats={stats} />
                        <RevenueChart dailyRevenue={stats?.insights?.dailyRevenue} />
                    </div>

                    <PerformanceTables stats={stats} />
                </>
            )}
        </div>
    );
}
