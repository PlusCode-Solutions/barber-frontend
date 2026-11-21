import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { getErrorMessage } from '../../../lib/errorHandler';
import type { Announcement } from '../types';

interface DeleteAnnouncementModalProps {
    announcement: Announcement | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function DeleteAnnouncementModal({
    announcement,
    isOpen,
    onClose,
    onConfirm,
}: DeleteAnnouncementModalProps) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setDeleting(false);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen || !announcement) return null;

    const handleDelete = async () => {
        setError(null);
        setDeleting(true);

        try {
            await onConfirm();
            onClose();
        } catch (deleteError) {
            setError(getErrorMessage(deleteError));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Eliminar notificación"
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center">
                            <AlertTriangle size={22} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Eliminar notificación</h2>
                            <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        aria-label="Cerrar"
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <p className="text-gray-600">
                        ¿Eliminar permanentemente la notificación{' '}
                        <span className="font-bold text-gray-900">“{announcement.title}”</span>?
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <p className="text-sm text-amber-800">
                            Los clientes dejarán de verla inmediatamente. Si solo quieres ocultarla,
                            puedes desactivarla en lugar de eliminarla.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={deleting}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 size={17} />
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
