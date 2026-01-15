import { useState } from 'react';
import { useTenants } from '../hooks/useTenants';
import { Button } from '../../../../components/ui/Button';
import CreateTenantModal from '../components/CreateTenantModal';
import EditTenantModal from '../components/EditTenantModal';
import DeleteTenantModal from '../components/DeleteTenantModal';
import Toast from '../../../../components/ui/Toast';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import TenantsSkeleton from '../components/TenantsSkeleton';
import { Building2, X } from 'lucide-react';


export default function TenantsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<null | any>(null);

    // Notification & Delete State
    const [deletingTenant, setDeletingTenant] = useState<null | any>(null);
    const [zoomedLogo, setZoomedLogo] = useState<string | undefined>(undefined);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    });

    const { tenants, loading, error, refresh, deleteTenant } = useTenants();
    const { handleError } = useErrorHandler();

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, visible: true });
    };

    const handleEdit = (tenant: any) => {
        setSelectedTenant(tenant);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (tenant: any) => {
        setDeletingTenant(tenant);
    };

    const confirmDelete = async () => {
        if (!deletingTenant) return;
        setIsDeleting(true);
        try {
            await deleteTenant(deletingTenant.id);
            refresh();
            showToast('Tenant eliminado exitosamente');
            setDeletingTenant(null);
        } catch (err) {
            const msg = handleError(err, 'DeleteTenant');
            showToast(msg, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="py-8 animate-fade-in">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                            Gestión de Locales
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Administra todos los negocios registrados en la plataforma
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
                    >
                        + Agregar Local
                    </Button>
                </div>
            </div>

            <CreateTenantModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    refresh();
                    setIsCreateModalOpen(false);
                    showToast('Tenant creado exitosamente');
                }}
            />

            <EditTenantModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedTenant(null);
                }}
                onSuccess={() => {
                    refresh();
                    setIsEditModalOpen(false);
                    setSelectedTenant(null);
                    showToast('Tenant actualizado exitosamente');
                }}
                tenant={selectedTenant}
            />

            <DeleteTenantModal
                open={!!deletingTenant}
                tenant={deletingTenant}
                submitting={isDeleting}
                onClose={() => setDeletingTenant(null)}
                onConfirm={confirmDelete}
            />

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {loading ? (
                    <TenantsSkeleton />
                ) : error ? (
                    <div className="p-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200">
                            <Building2 className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Error al cargar</h3>
                        <p className="mt-2 text-sm text-gray-600">{error}</p>
                        <div className="mt-6">
                            <Button variant="secondary" onClick={refresh}>Intentar de nuevo</Button>
                        </div>
                    </div>
                ) : tenants.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200">
                            <Building2 className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-gray-900">No hay locales registrados</h3>
                        <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto">
                            Comienza registrando el primer negocio en la plataforma para gestionar sus servicios y usuarios.
                        </p>
                        <div className="mt-8">
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Crear Primer Local
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Logo</th>
                                    <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                                    <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Slug</th>
                                    <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email Contacto</th>
                                    <th scope="col" className="relative py-4 pl-3 pr-6">
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="whitespace-nowrap py-5 pl-6 pr-3">
                                            {tenant.logoUrl ? (
                                                <img
                                                    src={tenant.logoUrl}
                                                    alt={tenant.name}
                                                    className="h-12 w-12 rounded-xl object-cover border-2 border-gray-200 cursor-zoom-in hover:scale-110 hover:border-blue-400 transition-all duration-200 shadow-sm"
                                                    onClick={() => setZoomedLogo(tenant.logoUrl || undefined)}
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-gray-200 text-gray-400">
                                                    <Building2 size={24} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm font-semibold text-gray-900">
                                            {tenant.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-600 font-mono">{tenant.slug}</td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-600">{tenant.email}</td>
                                        <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(tenant)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200 font-medium mr-2 border border-blue-200"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(tenant)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 font-medium border border-red-200"
                                            >
                                                Borrar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Logo Zoom Modal */}
            {zoomedLogo && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4 animate-in fade-in duration-200"
                    onClick={() => setZoomedLogo(undefined)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setZoomedLogo(undefined); }}
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={zoomedLogo}
                            alt="Logo Enlarge"
                            className="rounded-lg shadow-2xl max-w-full max-h-[80vh] object-contain border-4 border-white"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
