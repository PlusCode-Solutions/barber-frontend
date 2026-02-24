import { BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { Card } from "../../../../components/ui/Card";

interface RevenueChartProps {
    dailyRevenue: { date: string; revenue: number }[];
}

export default function RevenueChart({ dailyRevenue }: RevenueChartProps) {
    const maxRevenue = Math.max(...(dailyRevenue?.map((x: any) => x.revenue) || []), 1);

    return (
        <Card className="lg:col-span-2 p-6 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-600" />
                    <h3 className="font-bold text-gray-900">Tendencia de Ingresos</h3>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase">Ingresos Diarios (₡)</span>
            </div>

            <div className="flex-1 flex items-end gap-2 h-[160px] pb-8 relative overflow-x-auto overflow-y-hidden custom-scrollbar">
                {dailyRevenue && dailyRevenue.length > 0 ? (
                    dailyRevenue.map((d: any, index: number) => {
                        const height = (d.revenue / maxRevenue) * 100;
                        // Mostrar etiquetas solo si hay espacio o es cada N días en móvil
                        const showLabel = dailyRevenue.length < 10 || index % Math.ceil(dailyRevenue.length / 10) === 0;

                        return (
                            <div key={d.date} className="flex-1 min-w-[35px] h-full flex flex-col justify-end items-center group relative">
                                <div
                                    className="w-full bg-blue-600 rounded-t-md transition-all duration-500 relative shadow-sm group-hover:bg-blue-700"
                                    style={{ height: `${Math.max(height, 4)}%` }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl pointer-events-none">
                                        ₡{d.revenue.toLocaleString()}
                                    </div>
                                </div>
                                <div className="absolute -bottom-7 flex flex-col items-center">
                                    <span className={`text-[10px] font-bold text-gray-400 transition-all ${showLabel ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
                                        {format(new Date(d.date + 'T00:00:00'), 'dd/MM')}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic">
                        No hay datos suficientes para mostrar la tendencia
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </Card>
    );
}
