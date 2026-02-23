import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Save, Upload, Building2, Palette, Image as ImageIcon, Lock } from "lucide-react";
import { useTenant } from "../../../context/TenantContext";
import { useAuth } from "../../../context/AuthContext";
import { TenantsService } from "../api/tenants.service";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";

interface TenantForm {
    name: string;
    slug: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
}

export default function TenantSettings() {
    const { tenant, setTenant } = useTenant();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBackground, setUploadingBackground] = useState(false);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TenantForm>();

    // Watch color values for the color picker
    const primaryColorValue = watch("primaryColor") || "#000000";
    const secondaryColorValue = watch("secondaryColor") || "#000000";

    // Helper to ensure 6-digit hex
    const normalizeHex = (hex: string) => {
        if (!hex) return "#000000";
        if (hex.length === 4 && hex.startsWith('#')) {
            return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
        }
        return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#000000";
    };

    useEffect(() => {
        if (tenant) {
            setValue("name", tenant.name);
            setValue("slug", tenant.slug);
            setValue("primaryColor", tenant.primaryColor || "#000000");
            setValue("secondaryColor", tenant.secondaryColor || "#000000");
        }
    }, [tenant, setValue]);

    const onSubmit = async (data: TenantForm) => {
        if (!tenant) return;
        setIsLoading(true);

        try {
            // El Super Admin ahora solo puede editar nombre y logo (el slug y colores quedan restringidos)
            // El Tenant Admin puede editar nombre, logo y colores
            const payload = isSuperAdmin
                ? { name: data.name }
                : {
                    name: data.name,
                    primaryColor: data.primaryColor,
                    secondaryColor: data.secondaryColor
                };

            const updated = await TenantsService.update(tenant.id, payload);
            setTenant({ ...tenant, ...updated });
            toast.success("Información actualizada exitosamente");
        } catch (error) {
            // Error actualizando información
            toast.error("Error al actualizar la información");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'background') => {
        if (!tenant || !e.target.files?.[0]) return;

        if (!isSuperAdmin && user?.role !== 'TENANT_ADMIN') return;

        const file = e.target.files[0];
        const isLogo = type === 'logo';
        const setUploading = isLogo ? setUploadingLogo : setUploadingBackground;
        const uploadMethod = isLogo ? TenantsService.uploadLogo : TenantsService.uploadBackground;
        const label = isLogo ? "logo" : "fondo de pantalla";

        // Validación de tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error(`La imagen es muy pesada. Máximo 5MB.`);
            return;
        }

        setUploading(true);
        const loadingToast = toast.loading(`Subiendo ${label}...`);

        try {
            const updated = await uploadMethod(tenant.id, file);
            setTenant({ ...tenant, ...updated });
            toast.success(`¡${label.charAt(0).toUpperCase() + label.slice(1)} actualizado exitosamente!`, { id: loadingToast });
        } catch (error: any) {
            // Error subiendo imagen
            const message = error.response?.data?.message || `No se pudo cargar el ${label}. Intente de nuevo.`;
            toast.error(message, { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    if (!tenant) return null;

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <header>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">Configuración de la Barbería</h1>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Lock size={12} /> {isSuperAdmin ? 'Gestión de Plataforma' : 'Gestión de Barbería'}
                    </span>
                </div>
                <p className="text-gray-500 mt-2">Gestiona la identidad visual y datos de tu negocio</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Datos Generales */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Building2 size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Información General</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Nombre del Negocio"
                            {...register("name", { required: "El nombre es obligatorio" })}
                            error={errors.name?.message}
                            placeholder="Ej: Barbería Top"
                        />

                        <div className="relative">
                            <Input
                                label="Slug (URL)"
                                {...register("slug")}
                                disabled
                                error={errors.slug?.message}
                                helperText="Identificador único para tu URL (No editable)"
                            />
                            <Lock size={14} className="absolute right-3 top-9 text-gray-400" />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ backgroundColor: tenant?.primaryColor || '#2563eb' }}
                            >
                                <Save size={20} />
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </form>
                </Card>

                <div className="space-y-8">
                    {/* Logo - Enabled for everyone */}
                    <Card className="p-6 relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                <ImageIcon size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Logotipo
                            </h2>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative">
                                    {tenant.logoUrl ? (
                                        <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400">Sin logo</span>
                                    )}

                                    {uploadingLogo && (
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-2">
                                            <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mb-2"></div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Subiendo...</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-2 right-2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Upload size={14} className="text-gray-600" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'logo')}
                                        disabled={uploadingLogo}
                                    />
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-900">
                                    Sube tu logo
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Recomendado: PNG o JPG, 500x500px</p>
                            </div>
                        </div>
                    </Card>

                    {/* Background Image */}
                    <Card className="p-6 relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <ImageIcon size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Fondo de Login
                            </h2>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <div className="relative group w-full">
                                <div className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative">
                                    {tenant.backgroundUrl ? (
                                        <img src={tenant.backgroundUrl} alt="Background" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <p className="text-sm text-gray-400">Usando fondo predeterminado</p>
                                            <p className="text-xs text-gray-400 mt-1">(/fondo.jpg)</p>
                                        </div>
                                    )}

                                    {uploadingBackground && (
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                                            <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full mb-3"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Cargando imagen...</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-2 right-2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Upload size={14} className="text-gray-600" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'background')}
                                        disabled={uploadingBackground}
                                    />
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-900">
                                    Sube una imagen de fondo
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Recomendado: Paisajes o texturas, JPG/PNG máx 5MB</p>
                            </div>
                        </div>
                    </Card>

                    {/* Apariencia - Read only for Super Admin, editable for Tenant Admin */}
                    <Card className="p-6 relative">
                        {isSuperAdmin && (
                            <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] cursor-not-allowed rounded-2xl flex items-center justify-center">
                                <span className="bg-white px-3 py-1.5 rounded-lg shadow-sm border text-xs font-medium text-gray-600 flex items-center gap-2">
                                    <Lock size={14} /> Solo editable por el dueño de la barbería
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                                <Palette size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                Apariencia
                                {isSuperAdmin && <Lock size={16} className="text-gray-400" />}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color Primario
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            disabled={isSuperAdmin}
                                            value={normalizeHex(primaryColorValue)}
                                            onChange={(e) => setValue("primaryColor", e.target.value)}
                                            className="h-10 w-14 p-1 rounded border border-gray-300 disabled:opacity-50"
                                        />
                                        <Input
                                            {...register("primaryColor")}
                                            placeholder="#000000"
                                            disabled={isSuperAdmin}
                                            containerClassName="flex-1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color Secundario
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            disabled={isSuperAdmin}
                                            value={normalizeHex(secondaryColorValue)}
                                            onChange={(e) => setValue("secondaryColor", e.target.value)}
                                            className="h-10 w-14 p-1 rounded border border-gray-300 disabled:opacity-50"
                                        />
                                        <Input
                                            {...register("secondaryColor")}
                                            placeholder="#000000"
                                            disabled={isSuperAdmin}
                                            containerClassName="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>
                            {!isSuperAdmin && (
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all"
                                    >
                                        Actualizar Colores
                                    </button>
                                </div>
                            )}
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
