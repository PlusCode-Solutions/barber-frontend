import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Barber } from "../types";

type Mode = "create" | "edit";

interface Props {
    mode: Mode;
    open: boolean;
    initialData?: Barber;
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        email: string;
        phone?: string;
        specialty?: string;
        avatar?: string;
        isActive?: boolean;
    }) => Promise<void> | void;
}

export default function BarberModal({
    mode,
    open,
    initialData,
    submitting = false,
    onClose,
    onSubmit,
}: Props) {
    const [form, setForm] = useState({
        name: initialData?.name ?? "",
        email: initialData?.email ?? "",
        phone: initialData?.phone ?? "",
        specialty: initialData?.specialty ?? "",
        avatar: initialData?.avatar ?? "",
        isActive: initialData?.isActive ?? true,
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            name: initialData?.name ?? "",
            email: initialData?.email ?? "",
            phone: initialData?.phone ?? "",
            specialty: initialData?.specialty ?? "",
            avatar: initialData?.avatar ?? "",
            isActive: initialData?.isActive ?? true,
        });
    }, [open, initialData]);

    if (!open) return null;

    const title = mode === "create" ? "Agregar barbero" : "Editar barbero";
    const actionLabel = mode === "create" ? "Crear barbero" : "Guardar cambios";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSubmit({
            name: form.name.trim(),
            specialty: form.specialty.trim() || undefined,
            avatar: form.avatar.trim() || undefined,
            // email/phone no se envían porque el backend actual no los soporta en update
        });
    };

    const handleChange = (key: keyof typeof form, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value } as typeof prev));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-purple-600">{mode === "create" ? "Nuevo" : "Edición"}</p>
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Nombre</label>
                            <input
                                required
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                placeholder="Juan Pérez"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Correo (opcional)</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                placeholder="correo@barberia.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Teléfono</label>
                            <input
                                value={form.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                placeholder="+57 300 000 0000"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Especialidad</label>
                            <input
                                value={form.specialty}
                                onChange={(e) => handleChange("specialty", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                placeholder="Fade, Barba, Tintura..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700">Avatar (URL)</label>
                        <input
                            value={form.avatar}
                            onChange={(e) => handleChange("avatar", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            placeholder="https://..."
                        />
                    </div>

                    {/* isActive se mantiene solo lectura en backend, no editable desde aquí */}

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
                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700 disabled:opacity-60"
                        >
                            {submitting ? "Guardando..." : actionLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
