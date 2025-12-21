import { Calendar, Clock, Scissors, DollarSign } from "lucide-react";
import { useTenant } from "../../../context/TenantContext";

interface Column {
    header: string;
    accessor: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column[];
    renderActions?: (item: T) => React.ReactNode;
}

function getNestedValue(obj: any, path: string) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

// Mapeo de iconos según el header
const getIconForHeader = (header: string) => {
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes("servicio")) return <Scissors className="w-4 h-4" />;
    if (lowerHeader.includes("precio")) return <DollarSign className="w-4 h-4" />;
    if (lowerHeader.includes("fecha")) return <Calendar className="w-4 h-4" />;
    if (lowerHeader.includes("hora") || lowerHeader.includes("inicio") || lowerHeader.includes("fin")) return <Clock className="w-4 h-4" />;
    return null;
};

// Determinar color según el tipo de dato
const getValueColor = (header: string) => {
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes("precio")) return "text-green-600 font-bold";
    if (lowerHeader.includes("fecha")) return "text-blue-600 font-semibold";
    if (lowerHeader.includes("hora")) return "text-purple-600 font-semibold";
    return "text-gray-900 font-semibold";
};

export function BookingsTable<T>({ data, columns, renderActions }: TableProps<T>) {
    const { tenant } = useTenant();

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-dashed border-blue-200 shadow-sm">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-5 shadow-lg">
                    <Calendar className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No hay citas programadas</h3>
                <p className="text-gray-500 text-sm max-w-xs">Tus próximas citas aparecerán aquí. ¡Agenda una nueva cita!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((row, i) => (
                <div
                    key={i}
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                >
                    {/* Barra superior decorativa con color secundario */}
                    <div
                        className="h-1.5"
                        style={{
                            background: tenant?.secondaryColor || 'linear-gradient(to right, #3b82f6, #a855f7, #ec4899)'
                        }}
                    ></div>

                    <div className="p-5">
                        {columns.map((col, index) => {
                            const value = String(getNestedValue(row, col.accessor) ?? "—");
                            const icon = getIconForHeader(col.header);
                            const valueColor = getValueColor(col.header);

                            return (
                                <div
                                    key={col.header}
                                    className={`flex justify-between items-center py-3.5 gap-4 ${index !== columns.length - 1 ? "border-b border-gray-100" : ""
                                        }`}
                                >
                                    {/* Label con icono */}
                                    <div className="flex items-center gap-2">
                                        {icon && (
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center text-blue-600">
                                                {icon}
                                            </div>
                                        )}
                                        <span className="text-gray-600 text-xs font-bold uppercase tracking-wide">
                                            {col.header.replace(/[🎨📅💰⏰]/g, '').trim()}
                                        </span>
                                    </div>

                                    {/* Valor con estilo dinámico */}
                                    <span className={`text-right text-base max-w-[60%] truncate ${valueColor}`}>
                                        {value}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer decorativo con acciones */}
                    <div className="px-5 pb-4 pt-2 border-t border-gray-100/50">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                Confirmada
                            </span>

                            {renderActions && (
                                <div className="flex items-center gap-2">
                                    {renderActions(row)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
