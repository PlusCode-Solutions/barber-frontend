import { useEffect } from 'react';
import { X, AlertTriangle, Calendar, FileText, User, Store } from 'lucide-react';
import type { Closure } from '../types';
import { safeDate } from '../../../utils/dateUtils';

interface DeleteClosureModalProps {
    isOpen: boolean;
    closure: Closure | null;
    barberName?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteClosureModal({
    isOpen,
    closure,
    barberName,
    onConfirm,
    onCancel
}: DeleteClosureModalProps) {
    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onCancel]);

    if (!isOpen || !closure) return null;

    // Format date
    const dateObj = safeDate(closure.date);
    const formattedDate = dateObj?.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) || 'Fecha inválida';

    const scope = closure.barberId ? barberName || 'Barbero específico' : 'Toda la Tienda';
    const ScopeIcon = closure.barberId ? User : Store;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
        >
            <div
                className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <AlertTriangle className="text-white" size={24} />
                        </div>
                        <h2 id="delete-modal-title" className="text-xl font-bold text-white">
                            Eliminar Día Libre
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-700 font-medium">
                        ¿Está seguro de que desea eliminar este día libre?
                    </p>

                    {/* Closure Details */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                        {/* Date */}
                        <div className="flex items-start gap-3">
                            <Calendar className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                                    Fecha
                                </p>
                                <p className="text-gray-900 font-semibold capitalize">
                                    {formattedDate}
                                </p>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="flex items-start gap-3">
                            <FileText className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                                    Motivo
                                </p>
                                <p className="text-gray-900 font-semibold">
                                    {closure.reason}
                                </p>
                            </div>
                        </div>

                        {/* Scope */}
                        <div className="flex items-start gap-3">
                            <ScopeIcon className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                                    Alcance
                                </p>
                                <p className="text-gray-900 font-semibold">
                                    {scope}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-amber-800 text-sm font-medium">
                            Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
