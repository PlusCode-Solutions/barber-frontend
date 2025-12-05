import { Users, ChevronRight, ChevronLeft } from "lucide-react";
import { useBarbers } from "../../../barbers/hooks/useBarbers";
import type { Barber } from "../../../barbers/types";

interface SelectBarberStepProps {
    onSelectBarber: (barber: Barber) => void;
    onBack: () => void;
}

export default function SelectBarberStep({ onSelectBarber, onBack }: SelectBarberStepProps) {
    const { barbers, loading } = useBarbers();

    return (
        <div role="region" aria-label="Selección de barbero">
            <div className="flex items-center gap-2 mb-4">
                <Users className="text-blue-600" size={24} aria-hidden="true" />
                <h3 className="text-xl font-bold text-gray-900">Selecciona un Barbero</h3>
            </div>
            {loading ? (
                <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
                    Cargando barberos...
                </div>
            ) : (
                <div className="space-y-3">
                    {barbers.filter(b => b.isActive).map((barber) => (
                        <button
                            key={barber.id}
                            onClick={() => onSelectBarber(barber)}
                            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-500 hover:shadow-md transition text-left"
                            aria-label={`Seleccionar a ${barber.name}, ${barber.specialty || 'Barbero profesional'}`}
                        >
                            <div className="flex items-center gap-4">
                                {barber.avatar ? (
                                    <img
                                        src={barber.avatar}
                                        alt={`Foto de ${barber.name}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center" aria-hidden="true">
                                        <Users className="text-blue-600" size={24} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">{barber.name}</h4>
                                    <p className="text-sm text-gray-500">{barber.specialty || "Barbero profesional"}</p>
                                </div>
                                <ChevronRight className="text-gray-400" size={20} aria-hidden="true" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
            <button
                onClick={onBack}
                className="mt-4 flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                aria-label="Volver al paso anterior"
            >
                <ChevronLeft size={20} aria-hidden="true" />
                Volver a servicios
            </button>
        </div>
    );
}
