import { CalendarOff, Trash2 } from "lucide-react";
import { useClosureManager } from "../hooks/useClosureManager";
import { safeDate } from "../../../utils/dateUtils";

interface Props {
    onShowToast?: (message: string, type: "success" | "error") => void;
    barberId?: string;
}

export default function ClosureManager({ onShowToast, barberId }: Props) {
    const { closures, loadingList, form, actions } = useClosureManager({ onShowToast, barberId });

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                        <CalendarOff className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Días Libres & Festivos</h3>
                        <p className="text-xs text-gray-500">Gestione los días que no habrá atención.</p>
                    </div>
                </div>

                {/* Formulario de Creación */}
                <form onSubmit={actions.handleCreate} className="space-y-3 mt-4">
                    <div className="grid grid-cols-1 gap-2">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                                NUEVO CIERRE
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5"
                                    value={form.newDate}
                                    onChange={(e) => form.setNewDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Motivo (ej. Navidad, Capacitación)"
                                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                                value={form.newReason}
                                onChange={(e) => form.setNewReason(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={form.isCreating || !form.newDate || !form.newReason}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xl leading-none flex items-center justify-center"
                            >
                                {form.isCreating ? <span className="animate-spin">⏳</span> : "+"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Lista de Cierres */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loadingList ? (
                    <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                        Cargando...
                    </div>
                ) : closures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2 border-2 border-dashed border-gray-100 rounded-xl">
                        <CalendarOff className="w-8 h-8 opacity-20" />
                        <span className="text-xs font-medium">No hay días libres registrados</span>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {closures.map(closure => {
                            const dateObj = safeDate(closure.date);
                            const isValid = dateObj && !isNaN(dateObj.getTime());

                            const dayNumber = isValid ? dateObj.getDate() : "?";
                            const monthShort = isValid ? dateObj.toLocaleDateString('es-ES', { month: 'short' }).slice(0, 3) : "?";
                            const fullDate = isValid ? dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Fecha inválida";

                            return (
                                <li key={closure.id} className="flex items-center justify-between p-3 border border-gray-100 md:border-transparent md:hover:bg-gray-50 rounded-lg group transition-colors bg-white md:bg-transparent shadow-sm md:shadow-none hover:shadow-md">
                                    <div className="flex items-center gap-3">
                                        {/* Date Badge */}
                                        <div className={`w-10 h-10 ${isValid ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'} rounded-lg flex flex-col items-center justify-center text-xs font-bold leading-none shadow-sm flex-shrink-0`}>
                                            <span>{dayNumber}</span>
                                            <span className="text-[9px] opacity-75 uppercase">
                                                {monthShort}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{closure.reason}</p>
                                            <p className="text-xs text-gray-500 truncate capitalize">
                                                {fullDate}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => actions.handleDelete(closure.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                        title="Eliminar registro"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
