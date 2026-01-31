import { useState } from "react";
import { Scissors, Clock, Pencil, Trash2, Plus } from "lucide-react";
import { PERMISSIONS } from "../../../config/permissions";
import { usePermissions } from "../../../hooks/usePermissions";
import { useManageServices } from "../hooks/useManageServices";
import ServicesSkeleton from "../components/ServicesSkeleton";
import ServiceModal from "../components/ServiceModal";
import DeleteServiceModal from "../components/DeleteServiceModal";
import type { Service } from "../types";
import Toast from "../../../components/ui/Toast";
import SEO from "../../../components/shared/SEO";
import { useTenant } from "../../../context/TenantContext";

export default function ServicesPage() {
    const { tenant } = useTenant();
    const { can, isRole } = usePermissions();
    const {
        services,
        loading,
        error,
        submitting,
        createService,
        updateService,
        deleteService
    } = useManageServices();

    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);
    const [deleting, setDeleting] = useState<Service | null>(null);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [showToast, setShowToast] = useState(false);

    // Considerar rol de tenant admin además del permiso explícito
    const isAdmin = can(PERMISSIONS.SERVICES_MANAGE) || isRole("TENANT_ADMIN");

    if (loading || !tenant) return <ServicesSkeleton />;

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <p className="text-red-500 font-medium mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-600 hover:underline"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
            <SEO title="Servicios" description={`Explora nuestros servicios y precios en ${tenant?.name || 'la barbería'}.`} />

            {/* HEADER */}
            <div
                className="mx-4 mt-4 px-6 py-6 shadow-xl sticky top-20 z-10 text-white rounded-3xl"
                style={{ backgroundColor: tenant?.primaryColor || tenant?.secondaryColor || '#2563eb' }}
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight">
                            {isAdmin ? "Servicios" : "Nuestros Servicios"}
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
                                <span className="font-bold text-sm">
                                    {services.length}{" "}
                                    {services.length === 1 ? "servicio" : "servicios"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                            <Scissors className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowCreate(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow-lg transition hover:shadow-xl"
                                style={{ color: tenant?.primaryColor || '#4f46e5' }}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Nuevo servicio</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* SERVICES GRID */}
            <div className="px-6 pt-6">
                {services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-dashed border-blue-200 shadow-sm">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-5 shadow-lg">
                            <Scissors className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay servicios disponibles</h3>
                        <p className="text-gray-500 text-sm max-w-xs">Los servicios aparecerán aquí cuando estén disponibles.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                            >
                                {/* Barra superior decorativa */}
                                <div
                                    className="h-1.5"
                                    style={{
                                        background: `linear-gradient(to right, var(--primary-color, #3b82f6), var(--secondary-color, #ec4899))`
                                    }}
                                ></div>

                                <div className="p-6">
                                    {/* Nombre del servicio */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                                                style={{
                                                    backgroundColor: 'rgba(var(--secondary-rgb, 37, 99, 235), 0.1)',
                                                    color: 'var(--secondary-color, #2563eb)'
                                                }}
                                            >
                                                <Scissors className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                                                <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalles */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        {/* Duración */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Duración</p>
                                                <p className="text-sm font-bold text-purple-600">{service.durationMinutes} min</p>
                                            </div>
                                        </div>

                                        {/* Precio */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                                <span className="text-lg font-bold text-green-600">₡</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Precio</p>
                                                <p className="text-lg font-black text-green-600">₡{service.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 pb-6 pt-2">
                                    {isAdmin ? (
                                        <div className="grid grid-cols-2 gap-3 w-full">
                                            <button
                                                type="button"
                                                onClick={() => setEditing(service)}
                                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleting(service)}
                                                className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-bold text-red-600 shadow-sm transition-all hover:bg-red-100 hover:border-red-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Eliminar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end">
                                            <span className="text-gray-400 text-xs group-hover:text-blue-600 transition-colors">
                                                Reservar →
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modales */}
            <ServiceModal
                mode="create"
                open={showCreate}
                submitting={submitting}
                onClose={() => setShowCreate(false)}
                onSubmit={async (payload) => {
                    try {
                        await createService(payload);
                        setShowCreate(false);
                        setToastType("success");
                        setToastMessage("✅ Servicio creado correctamente");
                        setShowToast(true);
                    } catch (e) {
                        setToastType("error");
                        setToastMessage("No se pudo crear el servicio");
                        setShowToast(true);
                    }
                }}
            />

            <ServiceModal
                mode="edit"
                open={!!editing}
                initialData={editing ?? undefined}
                submitting={submitting}
                onClose={() => setEditing(null)}
                onSubmit={async (payload) => {
                    if (!editing) return;
                    try {
                        await updateService(editing.id, payload);
                        setEditing(null);
                        setToastType("success");
                        setToastMessage("✅ Servicio actualizado correctamente");
                        setShowToast(true);
                    } catch (e) {
                        setToastType("error");
                        setToastMessage("No se pudo actualizar el servicio");
                        setShowToast(true);
                    }
                }}
            />

            <DeleteServiceModal
                open={!!deleting}
                service={deleting}
                submitting={submitting}
                onClose={() => setDeleting(null)}
                onConfirm={async () => {
                    if (!deleting) return;
                    try {
                        await deleteService(deleting.id);
                        setDeleting(null);
                        setToastType("success");
                        setToastMessage("🗑️ Servicio eliminado");
                        setShowToast(true);
                    } catch (e) {
                        setToastType("error");
                        setToastMessage("No se pudo eliminar el servicio");
                        setShowToast(true);
                    }
                }}
            />

            <Toast
                message={toastMessage}
                type={toastType}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}
