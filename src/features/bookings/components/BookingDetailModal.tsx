import { X, User, Mail, Phone, Calendar, Clock, Scissors, FileText } from "lucide-react";
import { useTenant } from "../../../context/TenantContext";
import { Button } from "../../../components/ui/Button";

export interface BookingDetail {
    id: string;
    customerName: string;
    email?: string;
    phone?: string;
    serviceName: string;
    professionalName: string;
    dateLabel: string;
    timeLabel: string;
    status: string;
    notes?: string | null;
}

interface BookingDetailModalProps {
    booking: BookingDetail | null;
    isOpen: boolean;
    onClose: () => void;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || "?";
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'APPROVED':
            return 'Confirmada';
        case 'PENDING':
            return 'Pendiente';
        case 'CANCELED':
            return 'Cancelada';
        case 'COMPLETED':
            return 'Completada';
        case 'REJECTED':
            return 'Rechazada';
        default:
            return status;
    }
}

/**
 * Modal con los datos personales del cliente de una cita.
 * Se abre al tocar una cita en la agenda del admin/profesional.
 * Estructurado por secciones para agregar más datos en el futuro.
 */
export default function BookingDetailModal({ booking, isOpen, onClose }: BookingDetailModalProps) {
    const { tenant } = useTenant();
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';
    if (!isOpen || !booking) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de la cita de ${booking.customerName}`}
        >
            <div className="bg-white w-full max-w-lg rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
                {/* Header */}
                <div
                    className="px-6 py-5 flex items-center justify-between"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-extrabold shrink-0">
                            {getInitials(booking.customerName)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-white truncate">{booking.customerName}</h2>
                            <p className="text-blue-100 text-sm truncate">{booking.email || "Sin correo registrado"}</p>
                            <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-white/20 text-white">
                                {getStatusLabel(booking.status)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar detalle"
                        className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition shrink-0"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Cliente */}
                    <section>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                            <User size={16} style={{ color: primaryColor }} />
                            Datos del cliente
                        </h3>
                        <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 border border-gray-100">
                            <div className="flex items-center gap-3 px-4 py-3">
                                <User size={18} className="text-gray-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Nombre</p>
                                    <p className="font-semibold text-gray-900 truncate">{booking.customerName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3">
                                <Mail size={18} className="text-gray-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Correo</p>
                                    <p className="font-semibold text-gray-900 truncate">{booking.email || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3">
                                <Phone size={18} className="text-gray-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Teléfono</p>
                                    <p className="font-semibold text-gray-900 truncate">{booking.phone || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cita */}
                    <section>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                            <Calendar size={16} style={{ color: primaryColor }} />
                            Detalle de la cita
                        </h3>
                        <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 border border-gray-100">
                            <div className="flex items-center gap-3 px-4 py-3">
                                <Calendar size={18} className="text-gray-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fecha</p>
                                    <p className="font-semibold text-gray-900 capitalize">{booking.dateLabel}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3">
                                <Clock size={18} className="text-gray-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hora</p>
                                    <p className="font-semibold text-gray-900">{booking.timeLabel}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3">
                                <Scissors size={18} className="text-gray-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Servicio · Profesional</p>
                                    <p className="font-semibold text-gray-900 truncate">
                                        {booking.serviceName} · {booking.professionalName}
                                    </p>
                                </div>
                            </div>
                            {booking.notes ? (
                                <div className="flex items-start gap-3 px-4 py-3">
                                    <FileText size={18} className="text-gray-400 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Notas</p>
                                        <p className="font-semibold text-gray-900 break-words">{booking.notes}</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
