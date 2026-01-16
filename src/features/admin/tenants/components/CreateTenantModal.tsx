import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { TenantsService } from '../api/tenants.service';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';

interface CreateTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateTenantModal({ isOpen, onClose, onSuccess }: CreateTenantModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        email: '',
        password: '',
        confirmPassword: '',
        logoUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { handleError } = useErrorHandler();

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...payload } = formData;
            await TenantsService.create(payload);
            onSuccess();
            onClose();
            // Reset form
            setFormData({ name: '', slug: '', email: '', password: '', confirmPassword: '', logoUrl: '' });
        } catch (err) {
            const message = handleError(err, 'CreateTenantModal');
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
                            <h3 className="text-lg font-semibold leading-6 text-gray-900">Agregar Nuevo Tenant</h3>
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

                        <form id="create-tenant-form" onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Nombre del Negocio"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Barbería Central"
                            />

                            <Input
                                label="Slug (URL)"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                placeholder="ej: barberia-central"
                                className="lowercase"
                            />
                            <p className="text-xs text-gray-500 -mt-3">
                                Identificador único para la URL. Solo letras minúsculas, números y guiones.
                            </p>

                            <Input
                                label="Email de Contacto / Admin Inicial"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="admin@barberia.com"
                            />

                            <Input
                                label="Contraseña Inicial"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="********"
                            />

                            <Input
                                label="Confirmar Contraseña"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="********"
                            />

                            <Input
                                label="URL del Logo (Opcional)"
                                name="logoUrl"
                                value={formData.logoUrl}
                                onChange={handleChange}
                                placeholder="https://ejemplo.com/logo.png"
                            />
                        </form>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <Button
                            type="submit"
                            form="create-tenant-form"
                            isLoading={loading}
                            className="w-full sm:w-auto sm:ml-3"
                        >
                            Crear Tenant
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
