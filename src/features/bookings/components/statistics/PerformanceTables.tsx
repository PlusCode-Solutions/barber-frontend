import { Scissors, TrendingUp } from "lucide-react";
import { Card } from "../../../../components/ui/Card";

interface PerformanceTablesProps {
    stats: any;
}

export default function PerformanceTables({ stats }: PerformanceTablesProps) {
    return (
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
                                    <td className="px-6 py-4 font-bold text-gray-900 border-b border-gray-100">{s.name}</td>
                                    <td className="px-6 py-4 text-gray-600 border-b border-gray-100">{s.count || 0}</td>
                                    <td className="px-6 py-4 text-right font-bold text-blue-600 border-b border-gray-100">₡{(s.revenue || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Professionals */}
            <Card className="p-0 overflow-hidden border-none shadow-xl shadow-gray-200/50">
                <div className="p-6 bg-white border-b border-gray-100 flex items-center gap-3">
                    <TrendingUp size={20} className="text-emerald-600" />
                    <h2 className="text-lg font-bold text-gray-900">Rendimiento por Profesional</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Profesional</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Trabajos</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Producido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {(stats?.professionalsBreakdown || []).map((b: any) => (
                                <tr key={b.name} className="hover:bg-emerald-50/30 transition-colors">
                                    <td className="px-6 py-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold uppercase">
                                                {(b.name || "U").charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-900">{b.name || "Usuario"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium border-b border-gray-100">{b.count || 0}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600 border-b border-gray-100">₡{(b.revenue || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
