import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { PERMISSIONS } from "../../../config/permissions";
import { usePermissions } from "../../../hooks/usePermissions";
import { useManageBarbers } from "../hooks/useManageBarbers";
import BarbersSkeleton from "../components/BarbersSkeleton";
import BarberCard from "../components/BarberCard";
import BarberModal from "../components/BarberModal";
import DeleteBarberModal from "../components/DeleteBarberModal";
import Toast from "../../../components/ui/Toast";
import SEO from "../../../components/shared/SEO";
import { useTenant } from "../../../context/TenantContext";
import { handleApiError } from "../../../lib/errorHandler";
import type { Barber } from "../types";

export default function BarbersPage() {
    const { tenant } = useTenant();
    const { can, isRole } = usePermissions();
    const { barbers, loading, error, submitting, createBarber, updateBarber, deleteBarber } = useManageBarbers();
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Barber | null>(null);
    const [deleting, setDeleting] = useState<Barber | null>(null);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [showToast, setShowToast] = useState(false);

    const isAdmin = can(PERMISSIONS.BARBERS_MANAGE) || isRole("TENANT_ADMIN");

    if (loading || !tenant) return <BarbersSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
            <SEO title="Barberos" description="Conoce a nuestro equipo de barberos." />
            {/* HEADER */}
            <div
                className="mx-4 mt-4 px-6 py-6 shadow-xl sticky top-20 z-10 text-white rounded-3xl"
                style={{ backgroundColor: tenant?.primaryColor || tenant?.secondaryColor || '#2563eb' }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight">
                            {isAdmin ? "Barberos del tenant" : "Nuestros Barberos"}
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
                                <span className="font-bold text-sm">
                                    {barbers.length}{" "}
                                    {barbers.length === 1 ? "barbero" : "barberos"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                            <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowCreate(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow-lg transition hover:shadow-xl"
                                style={{ color: tenant?.primaryColor || '#9333ea' }}
                            >
                                <Plus className="h-4 w-4" />
                                Nuevo barbero
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* BARBERS GRID */}
            <div className="px-6 pt-6">
                {barbers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-dashed border-purple-200 shadow-sm">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-5 shadow-lg">
                            <Users className="w-12 h-12 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay barberos disponibles</h3>
                        <p className="text-gray-500 text-sm max-w-xs">Los barberos aparecerán aquí cuando estén disponibles.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {barbers.map((barber) => (
                            <BarberCard
                                key={barber.id}
                                barber={barber}
                                isAdmin={isAdmin}
                                onEdit={(b) => setEditing(b)}
                                onDelete={(b) => setDeleting(b)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modales */}
            <BarberModal
                mode="create"
                open={showCreate}
                submitting={submitting}
                onClose={() => setShowCreate(false)}
                onSubmit={async (payload) => {
                    try {
                        await createBarber({ ...payload, isActive: undefined });
                        setShowCreate(false);
                        setToastType("success");
                        setToastMessage("✅ Barbero creado correctamente");
                        setShowToast(true);
                    } catch (e) {
                        setToastType("error");
                        setToastMessage(handleApiError(e).message);
                        setShowToast(true);
                    }
                }}
            />

            <BarberModal
                mode="edit"
                open={!!editing}
                initialData={editing ?? undefined}
                submitting={submitting}
                onClose={() => setEditing(null)}
                onSubmit={async (payload) => {
                    if (!editing) return;
                    try {
                        await updateBarber(editing.id, payload);
                        setEditing(null);
                        setToastType("success");
                        setToastMessage("✅ Barbero actualizado correctamente");
                        setShowToast(true);
                    } catch (e) {
                        setToastType("error");
                        setToastMessage(handleApiError(e).message);
                        setShowToast(true);
                    }
                }}
            />

            <DeleteBarberModal
                open={!!deleting}
                barber={deleting}
                submitting={submitting}
                onClose={() => setDeleting(null)}
                onConfirm={async () => {
                    if (!deleting) return;
                    try {
                        await deleteBarber(deleting.id);
                        setDeleting(null);
                        setToastType("success");
                        setToastMessage("🗑️ Barbero eliminado");
                        setShowToast(true);
                    } catch (e) {
                        setToastType("error");
                        setToastMessage(handleApiError(e).message);
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
