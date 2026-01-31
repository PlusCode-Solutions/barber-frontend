import { useState } from "react";
import { Users, Mail, Phone, Award, UserCheck, Pencil, Trash2 } from "lucide-react";
import type { Barber } from "../types";

interface BarberCardProps {
    barber: Barber;
    isAdmin?: boolean;
    onEdit?: (barber: Barber) => void;
    onDelete?: (barber: Barber) => void;
}

export default function BarberCard({ barber, isAdmin = false, onEdit, onDelete }: BarberCardProps) {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-200 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 overflow-hidden">
            {/* Barra superior decorativa */}
            <div
                className="h-1.5"
                style={{
                    background: `linear-gradient(to right, var(--primary-color, #a855f7), var(--secondary-color, #ec4899))`
                }}
            ></div>

            <div className="p-6">
                {/* Header con foto y nombre */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Foto del barbero */}
                    <div className="relative">
                        {barber.avatar && !imgError ? (
                            <img
                                src={barber.avatar}
                                alt={barber.name}
                                onError={() => setImgError(true)}
                                className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2"
                                style={{ borderColor: 'rgba(var(--primary-rgb, 168, 85, 247), 0.2)' }}
                            />
                        ) : (
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2"
                                style={{
                                    backgroundColor: 'rgba(var(--primary-rgb, 168, 85, 247), 0.1)',
                                    borderColor: 'rgba(var(--primary-rgb, 168, 85, 247), 0.2)',
                                    color: 'var(--primary-color, #a855f7)'
                                }}
                            >
                                <Users className="w-10 h-10" />
                            </div>
                        )}
                        {/* Badge de estado */}
                        {barber.isActive && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                                <UserCheck className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Información principal */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{barber.name}</h3>
                        {barber.specialty && (
                            <div className="flex items-center gap-2 mb-2">
                                <Award
                                    className="w-4 h-4"
                                    style={{ color: 'var(--secondary-color, #9333ea)' }}
                                />
                                <p
                                    className="text-sm font-semibold"
                                    style={{ color: 'var(--secondary-color, #9333ea)' }}
                                >
                                    {barber.specialty}
                                </p>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${barber.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-xs text-gray-500 font-medium">
                                {barber.isActive ? 'Disponible' : 'No disponible'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detalles de contacto */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                    {/* Email */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Email</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{barber.email || "No registrado"}</p>
                        </div>
                    </div>

                    {/* Teléfono */}
                    {barber.phone && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Phone className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Teléfono</p>
                                <p className="text-sm font-medium text-gray-900">{barber.phone}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2">
                {isAdmin ? (
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                            type="button"
                            onClick={() => onEdit?.(barber)}
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
                        >
                            <Pencil className="h-4 w-4" />
                            Editar
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete?.(barber)}
                            className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-bold text-red-600 shadow-sm transition-all hover:bg-red-100 hover:border-red-200"
                        >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-end">
                        <span className="text-gray-400 text-xs flex items-center gap-1 group-hover:text-purple-600 transition-colors">
                            Ver perfil completo →
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
