import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Upload, Trash2, GripVertical, Image as ImageIcon, Pencil, Check, X, Loader2 } from "lucide-react";
import { GalleryService, type GalleryImage } from "../api/gallery.service";
import { Card } from "../../../components/ui/Card";

interface GalleryManagerProps {
    tenantId: string;
    primaryColor?: string;
}

export default function GalleryManager({ tenantId, primaryColor = "#2563eb" }: GalleryManagerProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Fetch gallery images for this tenant
    const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
        queryKey: ["gallery", tenantId],
        queryFn: () => GalleryService.getByTenantId(tenantId),
        enabled: !!tenantId,
    });

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: ({ file, title }: { file: File; title?: string }) =>
            GalleryService.upload(tenantId, file, title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery", tenantId] });
            toast.success("Imagen subida exitosamente");
        },
        onError: () => toast.error("Error al subir la imagen"),
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { title?: string } }) =>
            GalleryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery", tenantId] });
            setEditingId(null);
            toast.success("Título actualizado");
        },
        onError: () => toast.error("Error al actualizar"),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => GalleryService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery", tenantId] });
            setDeleteConfirm(null);
            toast.success("Imagen eliminada");
        },
        onError: () => toast.error("Error al eliminar"),
    });

    // Move mutation (reorder)
    const moveMutation = useMutation({
        mutationFn: (items: { id: string; order: number }[]) =>
            GalleryService.reorder(tenantId, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery", tenantId] });
        },
        onError: () => toast.error("Error al reordenar"),
    });

    // Handle file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                await uploadMutation.mutateAsync({ file: files[i] });
            }
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Move image up/down in order
    const moveImage = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === images.length - 1) return;

        const newImages = [...images];
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];

        const items = newImages.map((img, i) => ({ id: img.id, order: i }));
        moveMutation.mutate(items);
    };

    // Start editing title
    const startEdit = (img: GalleryImage) => {
        setEditingId(img.id);
        setEditTitle(img.title || "");
    };

    // Save edited title
    const saveEdit = (id: string) => {
        updateMutation.mutate({ id, data: { title: editTitle || undefined } });
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Galería</h2>
                        <p className="text-xs text-gray-500 mt-1">Sube fotos de tus trabajos. Se muestran en tu Landing Page.</p>
                    </div>
                </div>

                {/* Upload Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="h-10 px-5 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {uploading ? "Subiendo..." : "Subir Imagen"}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && images.length === 0 && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-gray-300 transition-colors"
                >
                    <ImageIcon size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No tienes imágenes en tu galería</p>
                    <p className="text-gray-400 text-sm mt-1">Haz clic aquí o en "Subir Imagen" para agregar fotos de tus trabajos</p>
                </div>
            )}

            {/* Gallery Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={img.id}
                            className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all"
                        >
                            {/* Image */}
                            <div className="aspect-[4/3] relative">
                                <img
                                    src={img.imageUrl}
                                    alt={img.title || "Galería"}
                                    className="w-full h-full object-cover"
                                />

                                {/* Reorder buttons overlay */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => moveImage(index, "up")}
                                        disabled={index === 0}
                                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm hover:bg-white disabled:opacity-30 transition-all text-xs font-bold text-gray-600"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => moveImage(index, "down")}
                                        disabled={index === images.length - 1}
                                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm hover:bg-white disabled:opacity-30 transition-all text-xs font-bold text-gray-600"
                                    >
                                        ▼
                                    </button>
                                </div>

                                {/* Order badge */}
                                <div className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                </div>
                            </div>

                            {/* Title + Actions */}
                            <div className="p-3">
                                {editingId === img.id ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="Título..."
                                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") saveEdit(img.id);
                                                if (e.key === "Escape") setEditingId(null);
                                            }}
                                        />
                                        <button onClick={() => saveEdit(img.id)} className="text-green-600 hover:text-green-700">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-600 truncate font-medium">
                                            {img.title || <span className="text-gray-300 italic">Sin título</span>}
                                        </p>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(img)}
                                                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(img.id)}
                                                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Delete Confirmation Overlay */}
                            {deleteConfirm === img.id && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-4 z-10">
                                    <p className="text-white text-sm font-bold text-center">¿Eliminar esta imagen?</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => deleteMutation.mutate(img.id)}
                                            className="px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all"
                                        >
                                            Eliminar
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="px-5 py-2 bg-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
