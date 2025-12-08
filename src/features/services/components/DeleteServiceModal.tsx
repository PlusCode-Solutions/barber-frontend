import { X, Trash2 } from "lucide-react";
import type { Service } from "../types";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-red-600">Eliminar</p>
                        <h3 className="text-xl font-bold text-gray-900">Confirmar eliminación</h3>
                    </div>
                    <button
                        type="button"
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700">
                        <div className="mt-1">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold">¿Seguro que deseas eliminar este servicio?</p>
                            <p className="text-sm text-red-600/80">
                                {service.name} — ${service.price} · {service.durationMinutes} min
                            </p>
                            <p className="mt-2 text-xs text-red-500">Esta acción no se puede deshacer.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={onConfirm}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 disabled:opacity-60"
                        >
                            {submitting ? "Eliminando..." : "Eliminar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
