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

    // Crear un nuevo día libre
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDate || !newReason) return;

        setIsCreating(true);
        const dto: CreateClosureDto = {
            date: newDate,
            reason: newReason,
            barberId
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

    // Eliminar día libre
    const handleDelete = async (id: string) => {
        if (!confirm("¿Está seguro de que desea eliminar este registro?")) return;
        
        const result = await deleteClosure(id);
        if (result === true) {
            refetch();
            onShowToast?.("Registro eliminado correctamente.", "success");
        } else {
            onShowToast?.(`Error al eliminar: ${result}`, "error");
        }
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
        }
    };
}
