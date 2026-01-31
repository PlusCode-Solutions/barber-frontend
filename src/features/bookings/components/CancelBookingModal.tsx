import { AlertTriangle } from 'lucide-react';
import { Button } from "../../../components/ui/Button";

interface CancelBookingModalProps {
    isOpen: boolean;
    isCancelling: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function CancelBookingModal({
    isOpen,
    isCancelling,
    onClose,
    onConfirm
}: CancelBookingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-inner">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        ¿Cancelar Cita?
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Esta acción no se puede deshacer. ¿Estás seguro de que deseas continuar?
                    </p>
                </div>
                <div className="p-4 bg-gray-50 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300"
                    >
                        Volver
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        isLoading={isCancelling}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                    >
                        Sí, Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
}
