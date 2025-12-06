import { useState } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import type { User } from "../types";

interface UserActionsMenuProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export default function UserActionsMenu({ user, onEdit, onDelete }: UserActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
                <MoreVertical size={18} className="text-gray-600" />
            </button>

            {isOpen && (
                <>
                    {/* Overlay to close menu */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                            onClick={() => {
                                onEdit(user);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                        >
                            <Edit size={16} className="text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">Editar</span>
                        </button>
                        <button
                            onClick={() => {
                                onDelete(user);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={16} className="text-red-600" />
                            <span className="text-sm font-medium text-red-600">Eliminar</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
