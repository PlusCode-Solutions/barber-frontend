import { useState, useEffect } from 'react';
import { X, Lock, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { TenantsService, type Tenant, type UpdateTenantDTO } from '../api/tenants.service';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import { toast } from 'react-hot-toast';

interface EditTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenant: Tenant | null;
}

export default function EditTenantModal({ isOpen, onClose, onSuccess, tenant }: EditTenantModalProps) {
    const [formData, setFormData] = useState<UpdateTenantDTO>({
        name: '',
        slug: '',
        email: '',
        active: true,
        logoUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { handleError } = useErrorHandler();

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name || '',
                slug: tenant.slug || '',
                email: tenant.email || '',
                active: tenant.active,
                logoUrl: tenant.logoUrl || ''
            });
        }
    }, [tenant]);

    if (!isOpen || !tenant) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!tenant || !e.target.files?.[0]) return;

        setUploadingLogo(true);
        try {
            const file = e.target.files[0];
            const updated = await TenantsService.uploadLogo(tenant.id, file);
            setFormData(prev => ({ ...prev, logoUrl: updated.logoUrl }));
            toast.success("Logo subido temporalmente");
        } catch (err) {
            console.error(err);
            toast.error("Error al subir el logo");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // El Super Admin ahora solo puede editar nombre y logo
            const payload = {
                name: formData.name,
                logoUrl: formData.logoUrl
            };
            await TenantsService.update(tenant.id, payload);
            onSuccess();
            onClose();
        } catch (err) {
            const message = handleError(err, 'EditTenantModal');
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                {/* Overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                {/* Modal Panel */}
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900">Configuración del Local</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X size={24} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form id="edit-tenant-form" onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Nombre del Negocio"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <Input
                                        label="Slug"
                                        name="slug"
                                        value={formData.slug}
                                        disabled
                                        className="lowercase opacity-60"
                                    />
                                    <Lock size={14} className="absolute right-3 top-9 text-gray-400" />
                                </div>

                                <div className="relative">
                                    <Input
                                        label="Email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="opacity-60"
                                    />
                                    <Lock size={14} className="absolute right-3 top-9 text-gray-400" />
                                </div>
                            </div>

                            {/* Logo Upload Section */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">Logotipo</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-300" size={32} />
                                        )}
                                        {uploadingLogo && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                <Loader2 className="animate-spin text-indigo-600" size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <Upload size={16} />
                                            {uploadingLogo ? "Subiendo..." : "Cargar nuevo logo"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoUpload}
                                                disabled={uploadingLogo}
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">PNG, JPG hasta 2MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 opacity-60">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    Estado:
                                    <Lock size={12} className="text-gray-400" />
                                </label>
                                <button
                                    type="button"
                                    disabled
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.active ? 'bg-green-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.active ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                                <span className="text-sm text-gray-500">
                                    {formData.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </form>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <Button
                            type="submit"
                            form="edit-tenant-form"
                            isLoading={loading}
                            className="w-full sm:w-auto sm:ml-3"
                        >
                            Guardar Cambios
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="mt-3 w-full sm:mt-0 sm:w-auto"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
