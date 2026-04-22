import { useEffect, useState, useRef, type FormEvent } from "react";
import { X, Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
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
    onUploadImage?: (file: File) => Promise<void>;
    onDeleteImage?: () => Promise<void>;
}

export default function ServiceModal({
    mode,
    open,
    initialData,
    submitting = false,
    onClose,
    onSubmit,
    onUploadImage,
    onDeleteImage,
}: Props) {
    const [form, setForm] = useState({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        price: initialData?.price?.toString() ?? "",
        durationMinutes: initialData?.durationMinutes?.toString() ?? "",
    });
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        setForm({
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            price: initialData?.price?.toString() ?? "",
            durationMinutes: initialData?.durationMinutes?.toString() ?? "",
        });
        setImagePreview(initialData?.imageUrl || null);
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

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUploadImage) return;

        setUploadingImage(true);
        try {
            await onUploadImage(file);
            // Show local preview immediately
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteImage = async () => {
        if (!onDeleteImage) return;
        setUploadingImage(true);
        try {
            await onDeleteImage();
            setImagePreview(null);
        } finally {
            setUploadingImage(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
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
                    {/* Image Section (only in edit mode when service already has an ID) */}
                    {mode === "edit" && onUploadImage && (
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Imagen del servicio</label>
                            {imagePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                                    <img
                                        src={imagePreview}
                                        alt="Imagen del servicio"
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all"
                                            title="Cambiar imagen"
                                        >
                                            <Upload size={18} className="text-gray-700" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeleteImage}
                                            disabled={uploadingImage}
                                            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all"
                                            title="Eliminar imagen"
                                        >
                                            <Trash2 size={18} className="text-white" />
                                        </button>
                                    </div>
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 size={28} className="text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {uploadingImage ? (
                                        <Loader2 size={24} className="text-gray-400 animate-spin" />
                                    ) : (
                                        <>
                                            <ImageIcon size={24} className="text-gray-400" />
                                            <span className="text-sm text-gray-500">Agregar imagen</span>
                                        </>
                                    )}
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </div>
                    )}

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
                            <label className="text-sm font-semibold text-gray-700">Precio (₡)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="1"
                                value={form.price}
                                onChange={(e) => handleChange("price", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                placeholder="5000"
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
