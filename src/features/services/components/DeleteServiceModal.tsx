import { Trash2 } from "lucide-react";
import type { Service } from "../types";
import { formatCurrency } from "../../../utils/formatUtils";

interface Props {
    open: boolean;
    service?: Service | null;
    submitting?: boolean;
    onConfirm: () => Promise<void> | void;
    onClose: () => void;
}

export default function DeleteServiceModal({ open, service, submitting = false, onConfirm, onClose }: Props) {
    if (!open || !service) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-inner">
                        <Trash2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        ¿Eliminar Servicio?
                    </h3>
                    <div className="text-gray-500 text-sm mb-2">
                        <p>Vas a eliminar:</p>
                        <p className="font-bold text-gray-800 my-1">{service.name}</p>
                        <p className="text-xs">{formatCurrency(service.price)} • {service.durationMinutes} min</p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Eliminando..." : "Eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
