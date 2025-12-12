import { CalendarOff, Trash2, Plus, Calendar } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useClosureManager } from "../hooks/useClosureManager";

interface Props {
    onShowToast?: (message: string, type: "success" | "error") => void;
}

export default function ClosureManager({ onShowToast }: Props) {
    const { closures, loadingList, form, actions } = useClosureManager({ onShowToast });
    const { newDate, setNewDate, newReason, setNewReason, isCreating } = form;
    const { handleCreate, handleDelete } = actions;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <CalendarOff className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Días Libres & Festivos</h3>
                    <p className="text-sm text-gray-500">Gestiona cierres excepcionales.</p>
                </div>
            </div>

            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <form onSubmit={handleCreate} className="flex flex-col gap-3">
                    <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Nuevo Cierre</label>
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="w-full md:w-1/3">
                            <Input
                                type="date"
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                                required
                                className="bg-white w-full"
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Motivo (ej. Navidad)"
                                value={newReason}
                                onChange={e => setNewReason(e.target.value)}
                                required
                                className="bg-white w-full"
                            />
                        </div>
                        <Button type="submit" isLoading={isCreating} variant="secondary" className="w-full md:w-auto">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loadingList ? (
                    <div className="p-8 text-center text-gray-400">Cargando...</div>
                ) : closures.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <p className="text-gray-500 text-sm">No hay días libres registrados.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {closures.map(closure => (
                            <li key={closure.id} className="flex items-center justify-between p-3 border border-gray-100 md:border-transparent md:hover:bg-gray-50 rounded-lg group transition-colors bg-white md:bg-transparent shadow-sm md:shadow-none">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex flex-col items-center justify-center text-xs font-bold leading-none shadow-sm flex-shrink-0">
                                        <span>{new Date(closure.date + 'T00:00:00').getDate()}</span>
                                        <span className="text-[9px] opacity-75 uppercase">
                                            {new Date(closure.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' }).slice(0, 3)}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{closure.reason}</p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {new Date(closure.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(closure.id)}
                                    className="md:opacity-0 md:group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
