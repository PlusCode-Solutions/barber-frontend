import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Service } from "../types";

type Mode = "create" | "edit";

interface Props {
    mode: Mode;
    open: boolean;
    initialData?: Service;
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        description: string;
        price: number;
        durationMinutes: number;
    }) => Promise<void> | void;
}

export default function ServiceModal({
    mode,
    open,
    initialData,
    submitting = false,
    onClose,
    onSubmit,
}: Props) {
    const [form, setForm] = useState({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        price: initialData?.price?.toString() ?? "",
        durationMinutes: initialData?.durationMinutes?.toString() ?? "",
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            price: initialData?.price?.toString() ?? "",
            durationMinutes: initialData?.durationMinutes?.toString() ?? "",
        });
    }, [open, initialData]);

    const title = mode === "create" ? "Agregar servicio" : "Editar servicio";
    const actionLabel = mode === "create" ? "Crear servicio" : "Guardar cambios";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSubmit({
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            durationMinutes: Number(form.durationMinutes),
        });
    };

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-indigo-600">{mode === "create" ? "Nuevo" : "Edición"}</p>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
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

                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Nombre</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            placeholder="Corte premium"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Descripción</label>
                        <textarea
                            required
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            placeholder="Detalle del servicio y valor agregado"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Precio</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={(e) => handleChange("price", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                placeholder="18.50"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Duración (min)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="5"
                                value={form.durationMinutes}
                                onChange={(e) => handleChange("durationMinutes", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                placeholder="45"
                            />
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
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {submitting ? "Guardando..." : actionLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
