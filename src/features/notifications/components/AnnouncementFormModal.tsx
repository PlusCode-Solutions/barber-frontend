import { useEffect, useState } from 'react';
import { Bell, CalendarClock, Link2, Megaphone, X } from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';
import { getErrorMessage } from '../../../lib/errorHandler';
import { formatDateForInput } from '../../../utils/dateUtils';
import { AnnouncementsService } from '../api/announcements.service';
import type {
    Announcement,
    AnnouncementType,
    CreateAnnouncementPayload,
} from '../types';
import {
    ANNOUNCEMENT_TYPE_OPTIONS,
    expirationEndOfDay,
    getAnnouncementTypeLabel,
} from '../utils';

interface AnnouncementFormModalProps {
    isOpen: boolean;
    announcement: Announcement | null;
    onClose: () => void;
    onSuccess: () => void;
}

function getDefaultExpiration() {
    return formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000));
}

export default function AnnouncementFormModal({
    isOpen,
    announcement,
    onClose,
    onSuccess,
}: AnnouncementFormModalProps) {
    const { tenant } = useTenant();
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<AnnouncementType>('INFO');
    const [expiresAt, setExpiresAt] = useState(getDefaultExpiration);
    const [actionLabel, setActionLabel] = useState('');
    const [actionUrl, setActionUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        setLocalError(null);
        setSaving(false);

        if (announcement) {
            setTitle(announcement.title);
            setMessage(announcement.message);
            setType(announcement.type);
            setExpiresAt(formatDateForInput(new Date(announcement.expiresAt)));
            setActionLabel(announcement.actionLabel ?? '');
            setActionUrl(announcement.actionUrl ?? '');
            setIsActive(announcement.isActive);
            return;
        }

        setTitle('');
        setMessage('');
        setType('INFO');
        setExpiresAt(getDefaultExpiration());
        setActionLabel('');
        setActionUrl('');
        setIsActive(true);
    }, [announcement, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLocalError(null);

        const cleanTitle = title.trim();
        const cleanMessage = message.trim();
        const cleanActionLabel = actionLabel.trim();
        const cleanActionUrl = actionUrl.trim();

        if (cleanTitle.length < 3) {
            setLocalError('El título debe tener al menos 3 caracteres.');
            return;
        }

        if (cleanMessage.length < 5) {
            setLocalError('El mensaje debe tener al menos 5 caracteres.');
            return;
        }

        if (!expiresAt) {
            setLocalError('Selecciona una fecha de expiración.');
            return;
        }

        const expirationDate = expirationEndOfDay(expiresAt);
        if (
            Number.isNaN(expirationDate.getTime()) ||
            expirationDate.getTime() <= Date.now()
        ) {
            setLocalError('La fecha de expiración no puede estar vencida.');
            return;
        }

        if (cleanActionUrl) {
            try {
                const parsed = new URL(cleanActionUrl);
                if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                    throw new Error('Protocolo no permitido');
                }
            } catch {
                setLocalError('La URL debe iniciar con http:// o https://.');
                return;
            }
        }

        const payload: CreateAnnouncementPayload = {
            title: cleanTitle,
            message: cleanMessage,
            type,
            expiresAt,
            actionLabel: cleanActionUrl ? cleanActionLabel || null : null,
            actionUrl: cleanActionUrl || null,
        };

        try {
            setSaving(true);

            if (announcement) {
                await AnnouncementsService.update(announcement.id, {
                    ...payload,
                    isActive,
                });
            } else {
                await AnnouncementsService.create(payload);
            }

            onSuccess();
            onClose();
        } catch (error) {
            setLocalError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={announcement ? 'Editar notificación' : 'Nueva notificación'}
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {announcement ? <Bell size={22} /> : <Megaphone size={22} />}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-gray-900 truncate">
                                {announcement ? 'Editar notificación' : 'Nueva notificación'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Se mostrará al cliente cada vez que entre al sistema mientras esté vigente.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Cerrar"
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {localError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {localError}
                        </div>
                    )}

                    <div>
                        <label htmlFor="announcement-title" className="block text-sm font-semibold text-gray-700 mb-2">
                            Título
                        </label>
                        <input
                            id="announcement-title"
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            maxLength={100}
                            autoFocus
                            placeholder="Ej. Nueva ubicación"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
                    </div>

                    <div>
                        <label htmlFor="announcement-message" className="block text-sm font-semibold text-gray-700 mb-2">
                            Mensaje
                        </label>
                        <textarea
                            id="announcement-message"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            maxLength={2000}
                            rows={4}
                            placeholder="Escribe la información que verá el cliente..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-y"
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/2000</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="announcement-type" className="block text-sm font-semibold text-gray-700 mb-2">
                                Tipo
                            </label>
                            <select
                                id="announcement-type"
                                value={type}
                                onChange={(event) => setType(event.target.value as AnnouncementType)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            >
                                {ANNOUNCEMENT_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                Estilo visual: {getAnnouncementTypeLabel(type)}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="announcement-expiration" className="block text-sm font-semibold text-gray-700 mb-2">
                                Expira el
                            </label>
                            <div className="relative">
                                <CalendarClock
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                                <input
                                    id="announcement-expiration"
                                    type="date"
                                    value={expiresAt}
                                    onChange={(event) => setExpiresAt(event.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Se oculta al final del día en Costa Rica (11:59 p.m.).
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Link2 size={16} className="text-gray-400" />
                            Enlace opcional
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="announcement-action-label" className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Texto del botón
                                </label>
                                <input
                                    id="announcement-action-label"
                                    type="text"
                                    value={actionLabel}
                                    onChange={(event) => setActionLabel(event.target.value)}
                                    maxLength={40}
                                    disabled={!actionUrl.trim()}
                                    placeholder="Ej. Ver ubicación"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                />
                            </div>

                            <div>
                                <label htmlFor="announcement-action-url" className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    URL
                                </label>
                                <input
                                    id="announcement-action-url"
                                    type="url"
                                    value={actionUrl}
                                    onChange={(event) => setActionUrl(event.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">
                            Solo se permiten enlaces http o https. Si no necesitas botón, deja ambos campos vacíos.
                        </p>
                    </div>

                    {announcement && (
                        <label className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl px-4 py-3 cursor-pointer">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Notificación activa</p>
                                <p className="text-xs text-gray-500">
                                    Si la desactivas, no se mostrará aunque no haya vencido.
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(event) => setIsActive(event.target.checked)}
                                className="w-5 h-5 accent-primary"
                            />
                        </label>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {saving
                                ? 'Guardando...'
                                : announcement
                                    ? 'Guardar cambios'
                                    : 'Publicar notificación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
