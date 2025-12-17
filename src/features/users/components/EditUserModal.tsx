import { useState } from "react";
import { X } from "lucide-react";
import type { User, UpdateUserDto } from "../types";
import type { UserRole } from "../../../config/roles";
import { useUpdateUser } from "../hooks/useUpdateUser";

interface EditUserModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
    // 1. Remove 'error' from destructuring, as the hook doesn't return it
    const { updateUser, loading } = useUpdateUser();

    // 2. Local state for error handling
    const [localError, setLocalError] = useState<string | null>(null);

    const [name, setName] = useState(user.name || "");
    const [role, setRole] = useState<UserRole>(user.role);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        // Only send changed data
        const updateData: UpdateUserDto = {};

        if (name.trim() !== user.name) {
            updateData.name = name.trim();
        }

        if (role !== user.role) {
            updateData.role = role;
        }

        if (Object.keys(updateData).length === 0) {
            onClose();
            return;
        }

        try {
            const result = await updateUser(user.id, updateData);
            if (result) {
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error("Update error:", err);

            const msg = err.response?.data?.message;
            const msgs = Array.isArray(msg) ? msg : [msg || err.message];

            const hasRoleError = msgs.some((m: any) =>
                typeof m === 'string' && (m.includes('role') || m.includes('not exist'))
            );

            if (hasRoleError) {
                setLocalError("El Backend no permite editar el Rol (Falta 'role' en UpdateUserDto).");
            } else {
                setLocalError(msgs[0] || "Error al actualizar el usuario.");
            }
        }
    };

    const handleClose = () => {
        setName(user.name || "");
        setRole(user.role);
        setLocalError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Editar Usuario</h2>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        type="button"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {localError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {localError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nombre del usuario"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rol
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="USER">Usuario (Cliente)</option>
                            <option value="TENANT_ADMIN">Administrador</option>
                        </select>
                    </div>

                    {/* Read-only info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium text-gray-900">{user.email}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            * El email no se puede modificar
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
