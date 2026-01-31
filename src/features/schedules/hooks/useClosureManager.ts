import { useState, useEffect } from "react";
import { type CreateClosureDto } from "../types";
import { useAdminSchedules } from "./useAdminSchedules";
import { useClosures } from "./useClosures";

interface UseClosureManagerProps {
    onShowToast?: (message: string, type: "success" | "error") => void;
    barberId?: string;
}

export function useClosureManager({ onShowToast, barberId }: UseClosureManagerProps = {}) {
    // Hooks
    const { createClosure, deleteClosure } = useAdminSchedules();
    const { closures, loading: loadingList, refetch, error: fetchError } = useClosures(barberId);
    
    // Notificar errores de carga si es necesario
    useEffect(() => {
        if (fetchError) {
             onShowToast?.("Error al cargar los días libres.", "error");
        }
    }, [fetchError, onShowToast]);

    // Estado del formulario
    const [newDate, setNewDate] = useState("");
    const [newReason, setNewReason] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Estado del modal de eliminación
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [closureToDelete, setClosureToDelete] = useState<string | null>(null);

    // Crear un nuevo día libre
    const handleCreate = async (e?: React.FormEvent, overrideBarberId?: string | null) => {
        if (e) e.preventDefault();
        if (!newDate || !newReason) return;

        setIsCreating(true);

        const finalBarberId = overrideBarberId !== undefined ? overrideBarberId : barberId;

        const dto: CreateClosureDto = {
            date: newDate,
            reason: newReason,
            barberId: finalBarberId
        };

        const res = await createClosure(dto);
        if (res) {
            setNewDate("");
            setNewReason("");
            refetch();
            onShowToast?.("Día libre registrado exitosamente.", "success");
        } else {
            onShowToast?.("No se pudo registrar el día libre. Intente nuevamente.", "error");
        }
        setIsCreating(false);
    };

    // Abrir modal de eliminación
    const handleDelete = (id: string) => {
        setClosureToDelete(id);
        setDeleteModalOpen(true);
    };

    // Confirmar eliminación
    const confirmDelete = async () => {
        if (!closureToDelete) return;

        const result = await deleteClosure(closureToDelete);
        if (result === true) {
            refetch();
            onShowToast?.("Día libre eliminado correctamente.", "success");
        } else {
            onShowToast?.(`Error al eliminar: ${result}`, "error");
        }

        // Cerrar modal
        setDeleteModalOpen(false);
        setClosureToDelete(null);
    };

    // Cancelar eliminación
    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setClosureToDelete(null);
    };

    return {
        closures,
        loadingList,
        form: {
            newDate,
            setNewDate,
            newReason,
            setNewReason,
            isCreating
        },
        actions: {
            handleCreate,
            handleDelete
        },
        deleteModal: {
            isOpen: deleteModalOpen,
            closureToDelete: closureToDelete ? closures.find(c => c.id === closureToDelete) : null,
            onConfirm: confirmDelete,
            onCancel: cancelDelete
        }
    };
}
