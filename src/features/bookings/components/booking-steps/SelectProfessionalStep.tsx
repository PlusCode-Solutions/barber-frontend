import { Users, ChevronRight, ChevronLeft } from "lucide-react";
import { useProfessionals } from "../../../professionals/hooks/useProfessionals";
import type { Professional } from "../../../professionals/types";
import { useTenant } from "../../../../context/TenantContext";

interface SelectProfessionalStepProps {
    onSelectProfessional: (professional: Professional) => void;
    onBack: () => void;
}

export default function SelectProfessionalStep({ onSelectProfessional, onBack }: SelectProfessionalStepProps) {
    const { professionals, loading } = useProfessionals();
    const { tenant } = useTenant();
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';

    return (
        <div role="region" aria-label="Selección de profesional">
            <div className="flex items-center gap-2 mb-4">
                <Users size={24} aria-hidden="true" style={{ color: primaryColor }} />
                <h3 className="text-xl font-bold text-gray-900">Selecciona un Profesional</h3>
            </div>
            {loading ? (
                <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
                    Cargando profesionales...
                </div>
            ) : (
                <div className="space-y-3">
                    {professionals.filter(b => b.isActive).map((professional) => (
                        <button
                            key={professional.id}
                            onClick={() => onSelectProfessional(professional)}
                            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-primary hover:shadow-md transition text-left"
                            aria-label={`Seleccionar a ${professional.name}, ${professional.specialty || 'Profesional profesional'}`}
                        >
                            <div className="flex items-center gap-4">
                                {professional.avatar ? (
                                    <img
                                        src={professional.avatar}
                                        alt={`Foto de ${professional.name}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center"
                                        aria-hidden="true"
                                        style={{ backgroundColor: `${primaryColor}20` }}
                                    >
                                        <Users size={24} style={{ color: primaryColor }} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">{professional.name}</h4>
                                    <p className="text-sm text-gray-500">{professional.specialty || "Profesional profesional"}</p>
                                </div>
                                <ChevronRight className="text-gray-400" size={20} aria-hidden="true" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
            <button
                onClick={onBack}
                className="mt-4 flex items-center gap-2 font-semibold hover:underline"
                style={{ color: primaryColor }}
                aria-label="Volver al paso anterior"
            >
                <ChevronLeft size={20} aria-hidden="true" />
                Volver a servicios
            </button>
        </div>
    );
}
