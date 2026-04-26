import { useState } from "react";
import { CalendarOff, Trash2, Store, User } from "lucide-react";
import { useClosureManager } from "../hooks/useClosureManager";
import { safeDate } from "../../../utils/dateUtils";
import { useProfessionals } from "../../professionals/hooks/useProfessionals";
import DeleteClosureModal from "./DeleteClosureModal";
import { useAuth } from "../../../context/AuthContext";

interface Props {
    onShowToast?: (message: string, type: "success" | "error") => void;
    professionalId?: string;
}

export default function ClosureManager({ onShowToast, professionalId }: Props) {
    const { user } = useAuth();
    const isProfessional = user?.role === 'PROFESSIONAL';

    const { closures, loadingList, form, actions, deleteModal } = useClosureManager({ onShowToast, professionalId });
    const { professionals } = useProfessionals();

    // State for scope selection
    // If professionalId prop is present OR user is PROFESSIONAL, default to PROFESSIONAL, otherwise SHOP
    const [scope, setScope] = useState<'SHOP' | 'PROFESSIONAL'>((professionalId || isProfessional) ? 'PROFESSIONAL' : 'SHOP');
    const [targetProfessionalId, setTargetProfessionalId] = useState(isProfessional ? user?.professionalId || "" : professionalId || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Determine the ID to send
        // Shop -> null
        // Professional -> selected ID
        const finalId = scope === 'SHOP' ? null : targetProfessionalId;

        // Validation: If Professional scope, must have ID
        if (scope === 'PROFESSIONAL' && !finalId) {
            onShowToast?.("Debe seleccionar un profesional.", "error");
            return;
        }

        actions.handleCreate(e, finalId);
    };

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

                {/* Creation Form */}
                <form onSubmit={handleSubmit} className="space-y-3 mt-4">

                    {/* Scope Selector (Hidden for Professionals) */}
                    {!isProfessional && (
                        <div className="bg-white p-1 rounded-lg border border-gray-200 flex mb-2">
                            <button
                                type="button"
                                onClick={() => setScope('SHOP')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${scope === 'SHOP'
                                    ? 'bg-gray-100 text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Store size={14} />
                                Toda la Tienda
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setScope('PROFESSIONAL');
                                    if (!targetProfessionalId && professionals.length > 0) {
                                        setTargetProfessionalId(professionals[0].id);
                                    }
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${scope === 'PROFESSIONAL'
                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <User size={14} />
                                Profesional
                            </button>
                        </div>
                    )}

                    {/* Professional Dropdown (Only if scope is PROFESSIONAL, Hidden for Professionals) */}
                    {scope === 'PROFESSIONAL' && !isProfessional && (
                        <div className="animate-fade-in-down">
                            <select
                                value={targetProfessionalId}
                                onChange={(e) => setTargetProfessionalId(e.target.value)}
                                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                                required
                            >
                                <option value="" disabled>Seleccionar Profesional...</option>
                                {professionals.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                                Fecha
                            </label>
                            <input
                                type="date"
                                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5"
                                value={form.newDate}
                                onChange={(e) => form.setNewDate(e.target.value)}
                                required
                            />
                        </div>

                        {form.scheduleForDate && !form.scheduleForDate.isClosed && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <p className="text-xs font-semibold text-blue-900 mb-1">📅 Horario laboral</p>
                                <p className="text-sm text-blue-700">
                                    {form.scheduleForDate.startTime} - {form.scheduleForDate.endTime}
                                    {form.scheduleForDate.lunchStartTime && (
                                        <span className="ml-2 text-xs">
                                            (Almuerzo: {form.scheduleForDate.lunchStartTime} - {form.scheduleForDate.lunchEndTime})
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        {form.scheduleForDate?.isClosed && (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">⚠️ Este día ya está cerrado en el horario regular</p>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                                Motivo
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Cita médica, día familiar"
                                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                                value={form.newReason}
                                onChange={(e) => form.setNewReason(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 block">
                                Tipo de Cierre
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="closureType"
                                        value="full"
                                        checked={form.closureType === 'full'}
                                        onChange={() => form.setClosureType('full')}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">Día completo</p>
                                        <p className="text-xs text-gray-500">No trabajar en absoluto ese día</p>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${!form.scheduleForDate || form.scheduleForDate.isClosed ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}>
                                    <input
                                        type="radio"
                                        name="closureType"
                                        value="custom"
                                        checked={form.closureType === 'custom'}
                                        onChange={() => form.setClosureType('custom')}
                                        disabled={!form.scheduleForDate || form.scheduleForDate.isClosed}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">Horario personalizado (Parcial)</p>
                                        <p className="text-xs text-gray-500">Definir horas de cierre (Permite agendar en el resto del día)</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {form.closureType === 'custom' && form.scheduleForDate && (
                            <div className="border border-blue-200 bg-blue-50/50 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-blue-900 mb-3">
                                    Rango de horas que estará CERRADO:
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Hora inicio
                                        </label>
                                        <input
                                            type="time"
                                            value={form.customStartTime}
                                            onChange={(e) => form.setCustomStartTime(e.target.value)}
                                            min={form.scheduleForDate.startTime}
                                            max={form.scheduleForDate.endTime}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Hora fin
                                        </label>
                                        <input
                                            type="time"
                                            value={form.customEndTime}
                                            onChange={(e) => form.setCustomEndTime(e.target.value)}
                                            min={form.scheduleForDate.startTime}
                                            max={form.scheduleForDate.endTime}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={form.isCreating || !form.newDate || !form.newReason || (!form.scheduleForDate || form.scheduleForDate.isClosed)}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {form.isCreating ? 'Creando...' : 'Agregar Excepción'}
                        </button>
                    </div>
                </form>
            </div >

            {/* Closures List */}
            < div className="flex-1 overflow-y-auto p-4 custom-scrollbar" >
                {
                    loadingList ? (
                        <div className="flex items-center justify-center h-20 text-gray-400 text-sm" >
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
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Date Badge */}
                                            <div className={`w-10 h-10 ${isValid ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'} rounded-lg flex flex-col items-center justify-center text-xs font-bold leading-none shadow-sm flex-shrink-0`}>
                                                <span>{dayNumber}</span>
                                                <span className="text-[9px] opacity-75 uppercase">
                                                    {monthShort}
                                                </span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-gray-900 truncate">{closure.reason}</p>
                                                    {closure.professionalId ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-200 flex-shrink-0">
                                                            <User size={10} />
                                                            {professionals.find(b => b.id === closure.professionalId)?.name || 'Profesional'}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-full border border-gray-200 flex-shrink-0">
                                                            <Store size={10} />
                                                            Toda la Tienda
                                                        </span>
                                                    )}
                                                    {closure.isFullDay === false && closure.startTime && closure.endTime && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-semibold rounded-full border border-orange-200 flex-shrink-0">
                                                            🕐 {closure.startTime} - {closure.endTime}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate capitalize">
                                                    {fullDate}
                                                    {closure.isFullDay !== false && (
                                                        <span className="ml-2 text-red-600 font-medium">(Día completo)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => actions.handleDelete(closure.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
                                            title="Eliminar registro"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )
                }
            </div >

            {/* Delete Confirmation Modal */}
            < DeleteClosureModal
                isOpen={deleteModal.isOpen}
                closure={deleteModal.closureToDelete || null}
                professionalName={deleteModal.closureToDelete?.professionalId ? professionals.find(b => b.id === deleteModal.closureToDelete?.professionalId)?.name : undefined}
                onConfirm={deleteModal.onConfirm}
                onCancel={deleteModal.onCancel}
            />

            {/* Conflict Confirmation Modal */}
            {form.showConflictModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <CalendarOff className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Conflictos Detectados</h3>
                                    <p className="text-sm text-gray-500">Hay citas agendadas para este horario.</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 mb-6">
                                <p className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                                    ⚠️ Las siguientes {form.conflictingBookings.length} personas tienen cita:
                                </p>
                                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                    {form.conflictingBookings.map((b: any) => (
                                        <div key={b.id} className="bg-white/80 p-2.5 rounded-lg border border-amber-200/50 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{b.customerName}</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-medium">{b.service}</p>
                                            </div>
                                            <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                                                {b.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => actions.handleConfirmForce()}
                                    disabled={form.isCreating}
                                    className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                                >
                                    {form.isCreating ? 'Procesando...' : 'Cancelar Citas y Confirmar Cierre'}
                                </button>
                                <button
                                    onClick={() => form.setShowConflictModal(false)}
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                                >
                                    Volver Atrás
                                </button>
                            </div>

                            <p className="mt-4 text-[10px] text-center text-gray-400">
                                Al confirmar, se enviará automáticamente un correo profesional a cada cliente informando la cancelación.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
