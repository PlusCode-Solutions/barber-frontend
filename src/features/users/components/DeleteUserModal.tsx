import { AlertTriangle, X } from "lucide-react";
import type { User } from "../types";
import { useDeleteUser } from "../hooks/useDeleteUser";

interface DeleteUserModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteUserModal({ user, isOpen, onClose, onSuccess }: DeleteUserModalProps) {
    const { deleteUser, loading, error } = useDeleteUser();

    const handleDelete = async () => {
        const success = await deleteUser(user.id);
        if (success) {
            onSuccess();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Eliminar Usuario</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <p className="text-gray-600">
                        ¿Estás seguro de que deseas eliminar a{" "}
                        <span className="font-bold text-gray-900">{user.name || user.email}</span>?
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>Advertencia:</strong> Esta acción no se puede deshacer. Todos los datos
                            asociados a este usuario serán eliminados permanentemente.
                        </p>
                    </div>

                    {/* User Info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium text-gray-900">{user.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Rol:</span>
                            <span className="font-medium text-gray-900">{user.role}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Eliminando..." : "Eliminar Usuario"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
