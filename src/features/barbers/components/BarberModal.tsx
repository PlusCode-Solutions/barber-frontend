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
        userName?: string;
        email?: string;
        phone?: string;
        specialty?: string;
        avatar?: string;
        isActive?: boolean;
        password?: string;
        passwordConfirm?: string;
        file?: File | null;
    } | FormData) => Promise<void> | void;
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
        userName: "",
        email: initialData?.email ?? "",
        phone: initialData?.phone ?? "",
        specialty: initialData?.specialty ?? "",
        avatar: initialData?.avatar ?? "",
        isActive: initialData?.isActive ?? true,
        password: "",
        passwordConfirm: "",
    });
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (open) {
            setForm({
                name: initialData?.name ?? "",
                userName: "",
                email: initialData?.email ?? "",
                phone: initialData?.phone ?? "",
                specialty: initialData?.specialty ?? "",
                avatar: initialData?.avatar ?? "",
                isActive: initialData?.isActive ?? true,
                password: "",
                passwordConfirm: "",
            });
            setFile(null);
        } else {
            // Limpiar estado al cerrar para evitar fugas de datos
            setForm({
                name: "", userName: "", email: "", phone: "", specialty: "", avatar: "", isActive: true, password: "", passwordConfirm: ""
            });
            setFile(null);
        }
    }, [open, initialData]);

    if (!open) return null;

    const title = mode === "create" ? "Agregar barbero" : "Editar barbero";
    const actionLabel = mode === "create" ? "Crear barbero" : "Guardar cambios";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (mode === "create") {
            if (form.password !== form.passwordConfirm) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            const formData = new FormData();
            formData.append('name', form.name.trim());
            formData.append('userName', form.userName.trim());
            if (form.specialty.trim()) formData.append('specialty', form.specialty.trim());
            if (form.email.trim()) formData.append('email', form.email.trim());
            if (form.password) formData.append('password', form.password);
            if (form.passwordConfirm) formData.append('passwordConfirm', form.passwordConfirm);
            if (file) formData.append('file', file);

            await onSubmit(formData);
        } else {
            if (file) {
                const formData = new FormData();
                formData.append('name', form.name.trim());
                if (form.specialty.trim()) formData.append('specialty', form.specialty.trim());
                formData.append('file', file);
                await onSubmit(formData);
            } else {
                await onSubmit({
                    name: form.name.trim(),
                    specialty: form.specialty.trim() || undefined,
                    avatar: form.avatar.trim() || undefined,
                });
            }
        }
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
                            <label className="text-sm font-semibold text-gray-700">Alias del Barbero *</label>
                            <input
                                required
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                placeholder="Tony Barber"
                            />
                        </div>
                        {mode === 'create' && (
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Nombre Real (Usuario) *</label>
                                <input
                                    required={mode === 'create'}
                                    value={form.userName}
                                    onChange={(e) => handleChange("userName", e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    placeholder="Juan Pérez"
                                />
                            </div>
                        )}
                        {mode === 'create' && (
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Correo *</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    placeholder="correo@barberia.com"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {mode === 'create' && (
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Teléfono</label>
                                <input
                                    value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    placeholder="+57 300 000 0000"
                                />
                            </div>
                        )}
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

                    {mode === 'create' && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Contraseña *</label>
                                <input
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    placeholder="******"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Confirmar Contraseña *</label>
                                <input
                                    type="password"
                                    required
                                    value={form.passwordConfirm}
                                    onChange={(e) => handleChange("passwordConfirm", e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    placeholder="******"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-semibold text-gray-700">Avatar {mode === "edit" ? "(Nueva Foto Opcional)" : ""}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                        {mode === 'edit' && form.avatar && (
                            <p className="mt-1 text-xs text-gray-500">
                                Sube una imagen solo si deseas cambiar la actual.
                            </p>
                        )}
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
