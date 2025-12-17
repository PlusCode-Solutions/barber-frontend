import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "success" | "error";
    isVisible: boolean;
    onClose: () => void;
}

export default function Toast({ message, type = "success", isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Auto-close after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${type === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}>
                <CheckCircle
                    size={20}
                    className={type === "success" ? "text-green-600" : "text-red-600"}
                />
                <span className={`font-medium text-sm ${type === "success" ? "text-green-800" : "text-red-800"
                    }`}>
                    {message}
                </span>
                <button
                    onClick={onClose}
                    className="ml-2 hover:opacity-70 transition-opacity"
                >
                    <X size={16} className="text-gray-500" />
                </button>
            </div>
        </div>
    );
}
