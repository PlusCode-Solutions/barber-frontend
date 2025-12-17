import { Scissors, ChevronRight } from "lucide-react";
import { useServices } from "../../../services/hooks/useServices";
import type { Service } from "../../../services/types";
import { useTenant } from "../../../../context/TenantContext";

interface SelectServiceStepProps {
    onSelectService: (service: Service) => void;
}

export default function SelectServiceStep({ onSelectService }: SelectServiceStepProps) {
    const { services, loading } = useServices();
    const { tenant } = useTenant();
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';

    return (
        <div role="region" aria-label="Selección de servicio">
            <div className="flex items-center gap-2 mb-4">
                <Scissors size={24} aria-hidden="true" style={{ color: primaryColor }} />
                <h3 className="text-xl font-bold text-gray-900">Selecciona un Servicio</h3>
            </div>
            {loading ? (
                <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
                    Cargando servicios...
                </div>
            ) : (
                <div className="space-y-3">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => onSelectService(service)}
                            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-primary hover:shadow-md transition text-left"
                            aria-label={`Seleccionar ${service.name}, precio $${service.price}`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-900">{service.name}</h4>
                                    <p className="text-sm text-gray-500">{service.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600">${service.price}</p>
                                    <ChevronRight className="text-gray-400" size={20} aria-hidden="true" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
