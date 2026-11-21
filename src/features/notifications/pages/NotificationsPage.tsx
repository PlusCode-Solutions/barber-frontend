import { useMemo, useState } from "react";
import {
    Bell,
    CalendarClock,
    CheckCircle2,
    Clock,
    Megaphone,
    Pencil,
    Plus,
    Power,
    PowerOff,
    Trash2,
} from "lucide-react";
import { useTenant } from "../../../context/TenantContext";
import Toast from "../../../components/ui/Toast";
import { getErrorMessage } from "../../../lib/errorHandler";
import AnnouncementFormModal from "../components/AnnouncementFormModal";
import DeleteAnnouncementModal from "../components/DeleteAnnouncementModal";
import { useManageAnnouncements } from "../hooks/useManageAnnouncements";
import type { Announcement } from "../types";
import {
    ANNOUNCEMENT_TYPE_STYLES,
    formatExpiration,
    isExpired,
} from "../utils";

type ToastType = 'success' | 'error' | 'info';

export default function NotificationsPage() {
    const { tenant } = useTenant();
    const {
        announcements,
        loading,
        error,
        refetch,
        updateAnnouncement,
        deleteAnnouncement,
    } = useManageAnnouncements();

    const [selected, setSelected] = useState<Announcement | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState<{ message: string; type: ToastType }>({
        message: '',
        type: 'success',
    });

    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';

    const activeCount = useMemo(
        () => announcements.filter((announcement) => announcement.isActive && !isExpired(announcement.expiresAt)).length,
        [announcements]
    );

    const expiredCount = useMemo(
        () => announcements.filter((announcement) => isExpired(announcement.expiresAt)).length,
        [announcements]
    );

    const notify = (message: string, type: ToastType = 'success') => {
        setToastData({ message, type });
        setShowToast(true);
    };

    const handleCreate = () => {
        setSelected(null);
        setIsFormOpen(true);
    };

    const handleEdit = (announcement: Announcement) => {
        if (isExpired(announcement.expiresAt)) {
            notify('Los anuncios vencidos solo se pueden eliminar.', 'error');
            return;
        }

        setSelected(announcement);
        setIsFormOpen(true);
    };

    const handleDelete = (announcement: Announcement) => {
        setSelected(announcement);
        setIsDeleteOpen(true);
    };

    const handleToggle = async (announcement: Announcement) => {
        if (isExpired(announcement.expiresAt)) {
            notify('Los anuncios vencidos solo se pueden eliminar.', 'error');
            return;
        }

        setTogglingId(announcement.id);

        try {
            await updateAnnouncement(announcement.id, {
                isActive: !announcement.isActive,
            });
            notify(
                announcement.isActive
                    ? 'Notificación desactivada.'
                    : 'Notificación activada.'
            );
        } catch (toggleError) {
            notify(getErrorMessage(toggleError), 'error');
        } finally {
            setTogglingId(null);
        }
    };

    const handleFormSuccess = () => {
        refetch();
        notify(
            selected
                ? 'Notificación actualizada correctamente.'
                : 'Notificación publicada correctamente.'
        );
    };

    const handleDeleteConfirm = async () => {
        if (!selected) return;

        try {
            await deleteAnnouncement(selected.id);
            notify('Notificación eliminada correctamente.');
        } catch (deleteError) {
            throw new Error(getErrorMessage(deleteError));
        }
    };

    if (loading) {
        return (
            <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-8">
            <div
                className="mx-4 mt-4 px-8 py-6 sticky top-0 z-10 border-b border-gray-200/60 rounded-3xl shadow-xl text-white transition-colors duration-300"
                style={{ backgroundColor: primaryColor }}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Megaphone size={26} />
                            Notificaciones
                        </h1>
                        <p className="text-white/90 text-sm mt-1">
                            Publica anuncios que tus clientes verán al entrar mientras estén vigentes.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                    >
                        <Plus size={18} />
                        Nueva notificación
                    </button>
                </div>
            </div>

            <div className="px-4 md:px-8 max-w-7xl mx-auto mt-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                        No se pudieron cargar las notificaciones: {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Bell size={21} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 size={21} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activas</p>
                            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Clock size={21} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vencidas</p>
                            <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Notificación</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Expira</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {announcements.map((announcement) => {
                                    const expired = isExpired(announcement.expiresAt);
                                    const typeStyle = ANNOUNCEMENT_TYPE_STYLES[announcement.type];

                                    return (
                                        <tr key={announcement.id} className="group hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-6 py-4 max-w-md">
                                                <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                    {announcement.title}
                                                </p>
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                                                    {announcement.message}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${typeStyle.badge}`}>
                                                    {typeStyle.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CalendarClock size={15} className="text-gray-400 shrink-0" />
                                                    <span>{formatExpiration(announcement.expiresAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {expired ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                        Vencida
                                                    </span>
                                                ) : announcement.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Activa
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Inactiva
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {!expired && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(announcement)}
                                                                title="Editar"
                                                                aria-label={`Editar ${announcement.title}`}
                                                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                            >
                                                                <Pencil size={17} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggle(announcement)}
                                                                disabled={togglingId === announcement.id}
                                                                title={announcement.isActive ? 'Desactivar' : 'Activar'}
                                                                aria-label={
                                                                    announcement.isActive
                                                                        ? `Desactivar ${announcement.title}`
                                                                        : `Activar ${announcement.title}`
                                                                }
                                                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                            >
                                                                {announcement.isActive ? <PowerOff size={17} /> : <Power size={17} />}
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(announcement)}
                                                        title="Eliminar"
                                                        aria-label={`Eliminar ${announcement.title}`}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {announcements.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Megaphone size={48} className="mb-4 text-gray-200" />
                                                <p className="text-lg font-medium text-gray-900">No hay notificaciones</p>
                                                <p className="text-sm">Crea la primera para avisar a tus clientes.</p>
                                                <button
                                                    type="button"
                                                    onClick={handleCreate}
                                                    className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
                                                >
                                                    <Plus size={17} />
                                                    Nueva notificación
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="md:hidden space-y-4">
                    {announcements.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
                            <Megaphone size={42} className="mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-gray-900">No hay notificaciones</p>
                            <p className="text-sm mt-1">Crea la primera para avisar a tus clientes.</p>
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-semibold"
                            >
                                <Plus size={17} />
                                Nueva notificación
                            </button>
                        </div>
                    ) : (
                        announcements.map((announcement) => {
                            const expired = isExpired(announcement.expiresAt);
                            const typeStyle = ANNOUNCEMENT_TYPE_STYLES[announcement.type];

                            return (
                                <div
                                    key={announcement.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${typeStyle.badge}`}>
                                                {typeStyle.label}
                                            </span>
                                            <p className="font-bold text-gray-900 mt-2 leading-tight">
                                                {announcement.title}
                                            </p>
                                        </div>

                                        {expired ? (
                                            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                Vencida
                                            </span>
                                        ) : announcement.isActive ? (
                                            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Activa
                                            </span>
                                        ) : (
                                            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                Inactiva
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 whitespace-pre-line mt-3">
                                        {announcement.message}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
                                        <CalendarClock size={14} />
                                        <span>{formatExpiration(announcement.expiresAt)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                        {!expired && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(announcement)}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Pencil size={15} />
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggle(announcement)}
                                                    disabled={togglingId === announcement.id}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    {announcement.isActive ? <PowerOff size={15} /> : <Power size={15} />}
                                                    {announcement.isActive ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(announcement)}
                                            aria-label={`Eliminar ${announcement.title}`}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors shrink-0"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <AnnouncementFormModal
                isOpen={isFormOpen}
                announcement={selected}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
            />

            <DeleteAnnouncementModal
                announcement={selected}
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
            />

            <Toast
                message={toastData.message}
                type={toastData.type}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}
