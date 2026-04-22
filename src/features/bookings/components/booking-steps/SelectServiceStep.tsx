import { useState } from "react";
import { Scissors, ChevronRight, Clock, X } from "lucide-react";
import { useServices } from "../../../services/hooks/useServices";
import type { Service } from "../../../services/types";
import { useTenant } from "../../../../context/TenantContext";

interface SelectServiceStepProps {
    onSelectService: (service: Service) => void;
}

export default function SelectServiceStep({ onSelectService }: SelectServiceStepProps) {
    const { services, loading } = useServices();
    const { tenant } = useTenant();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
                            aria-label={`Seleccionar ${service.name}, precio ₡${service.price}`}
                        >
                            <div className="flex items-center gap-4">
                                {service.imageUrl ? (
                                    <div 
                                        className="relative group/img cursor-zoom-in"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(service.imageUrl!);
                                        }}
                                    >
                                        <img
                                            src={service.imageUrl}
                                            alt={service.name}
                                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/0 transition-colors rounded-xl"></div>
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Scissors className="text-gray-400" size={20} />
                                    </div>
                                )}
                                <div className="flex-1 flex justify-between items-center overflow-hidden">
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{service.name}</h4>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            <Clock size={12} className="text-gray-400" />
                                            {service.durationMinutes} min
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-2">
                                        <p className="text-lg font-bold text-green-600">₡{service.price}</p>
                                        <div className="bg-gray-50 p-1.5 rounded-full">
                                            <ChevronRight className="text-gray-400" size={16} aria-hidden="true" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox for SelectServiceStep */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Service" 
                        className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in duration-300"
                    />
                </div>
            )}
        </div>
    );
}
