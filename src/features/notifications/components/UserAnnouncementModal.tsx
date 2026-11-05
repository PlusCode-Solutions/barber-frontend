import { useCallback, useEffect, useState } from 'react';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    ExternalLink,
    Info,
    Megaphone,
    X,
    XCircle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTenant } from '../../../context/TenantContext';
import { usePendingAnnouncements } from '../hooks/usePendingAnnouncements';
import { ANNOUNCEMENT_TYPE_STYLES, formatExpiration } from '../utils';
import type { AnnouncementType } from '../types';

const TYPE_ICONS = {
    INFO: Info,
    SUCCESS: CheckCircle2,
    WARNING: AlertTriangle,
    ERROR: XCircle,
};

export default function UserAnnouncementModal() {
    const { user } = useAuth();
    const { tenant } = useTenant();
    const { announcements } = usePendingAnnouncements();
    const userId = user?.id ?? '';
    const [dismissedState, setDismissedState] = useState<{
        userId: string;
        ids: string[];
    }>({ userId, ids: [] });

    const dismissedIds =
        dismissedState.userId === userId ? dismissedState.ids : [];
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';
    const current = announcements.find(
        (announcement) => !dismissedIds.includes(announcement.id)
    );
    const currentId = current?.id;

    const dismiss = useCallback(
        (id: string) => {
            setDismissedState((previous) => {
                const ids = previous.userId === userId ? previous.ids : [];
                if (ids.includes(id)) return { userId, ids };
                return { userId, ids: [...ids, id] };
            });
        },
        [userId]
    );

    useEffect(() => {
        if (!currentId) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                dismiss(currentId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentId, dismiss]);

    useEffect(() => {
        if (!currentId) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [currentId]);

    if (!current) return null;

    const Icon = TYPE_ICONS[current.type as AnnouncementType];
    const typeStyle = ANNOUNCEMENT_TYPE_STYLES[current.type];
    const safeActionUrl =
        current.actionUrl && /^https?:\/\//i.test(current.actionUrl)
            ? current.actionUrl
            : null;

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
        >
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className={`h-1.5 w-full ${typeStyle.accent}`} />

                <button
                    type="button"
                    onClick={() => dismiss(current.id)}
                    aria-label="Cerrar notificación"
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4 pr-10">
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${typeStyle.iconBox}`}
                        >
                            <Icon size={28} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${typeStyle.badge}`}
                            >
                                <Megaphone size={12} />
                                {typeStyle.label}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 leading-tight">
                                {current.title}
                            </h2>
                        </div>
                    </div>

                    <p className="mt-5 text-gray-600 leading-relaxed whitespace-pre-line">
                        {current.message}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
                        <CalendarClock size={14} />
                        <span>Vigente hasta el {formatExpiration(current.expiresAt)}</span>
                    </div>

                    <div className="mt-7 flex flex-col sm:flex-row gap-3">
                        {safeActionUrl && (
                            <a
                                href={safeActionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => dismiss(current.id)}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-semibold transition-colors hover:bg-gray-50"
                                style={{ borderColor: primaryColor, color: primaryColor }}
                            >
                                {current.actionLabel || 'Ver más'}
                                <ExternalLink size={16} />
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => dismiss(current.id)}
                            className="flex-1 px-4 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.99]"
                            style={{
                                backgroundColor: primaryColor,
                                boxShadow: `0 10px 25px -10px ${primaryColor}`,
                            }}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
