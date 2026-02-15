import { useState, useEffect } from "react";
import type { CreateClosureDto, Schedule } from "../types";
import { useAdminSchedules } from "./useAdminSchedules";
import { useClosures } from "./useClosures";
import { useSchedules } from "./useSchedules";
import { 
    validateCustomRange 
} from "../utils/closureCalculations";

interface UseClosureManagerProps {
    onShowToast?: (message: string, type: "success" | "error") => void;
    barberId?: string;
}

export function useClosureManager({ onShowToast, barberId }: UseClosureManagerProps = {}) {
    const { createClosure, deleteClosure } = useAdminSchedules();
    const { closures, loading: loadingList, refetch, error: fetchError } = useClosures(barberId);
    const { schedules } = useSchedules(barberId);
    
    useEffect(() => {
        if (fetchError) {
             onShowToast?.("Error al cargar los días libres.", "error");
        }
    }, [fetchError, onShowToast]);

    const [newDate, setNewDate] = useState("");
    const [newReason, setNewReason] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [closureType, setClosureType] = useState<'full' | 'custom'>('full');
    const [customStartTime, setCustomStartTime] = useState("");
    const [customEndTime, setCustomEndTime] = useState("");
    const [scheduleForDate, setScheduleForDate] = useState<Schedule | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [closureToDelete, setClosureToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!newDate) {
            setScheduleForDate(null);
            return;
        }
        
        const [year, month, day] = newDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
        setScheduleForDate(schedule || null);
    }, [newDate, schedules]);

    const handleCreate = async (e?: React.FormEvent, overrideBarberId?: string | null) => {
        if (e) e.preventDefault();
        if (!newDate || !newReason) return;

        if (!scheduleForDate) {
            onShowToast?.('No se pudo obtener el horario para esta fecha', 'error');
            return;
        }
        
        if (scheduleForDate.isClosed) {
            onShowToast?.('Este día ya está cerrado en el horario regular', 'error');
            return;
        }

        setIsCreating(true);

        const finalBarberId = overrideBarberId !== undefined ? overrideBarberId : barberId;
        let dto: CreateClosureDto;

        switch (closureType) {
            case 'full':
                dto = {
                    date: newDate,
                    reason: newReason,
                    barberId: finalBarberId,
                    isFullDay: true
                };
                break;
                
            case 'custom':
                if (!customStartTime || !customEndTime) {
                    onShowToast?.('Debes especificar las horas de cierre', 'error');
                    setIsCreating(false);
                    return;
                }
                
                const validation = validateCustomRange(customStartTime, customEndTime, scheduleForDate);
                if (!validation.valid) {
                    onShowToast?.(validation.error!, 'error');
                    setIsCreating(false);
                    return;
                }
                
                dto = {
                    date: newDate,
                    reason: newReason,
                    barberId: finalBarberId,
                    isFullDay: false,
                    startTime: customStartTime,
                    endTime: customEndTime
                };
                break;
        }

        const res = await createClosure(dto);
        if (res) {
            setNewDate("");
            setNewReason("");
            setClosureType('full');
            setCustomStartTime("");
            setCustomEndTime("");
            refetch();
            onShowToast?.("Excepción creada exitosamente", "success");
        } else {
            onShowToast?.("No se pudo registrar el día libre. Intente nuevamente.", "error");
        }
        setIsCreating(false);
    };

    const handleDelete = (id: string) => {
        setClosureToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!closureToDelete) return;

        const result = await deleteClosure(closureToDelete);
        if (result === true) {
            refetch();
            onShowToast?.("Día libre eliminado correctamente.", "success");
        } else {
            onShowToast?.(`Error al eliminar: ${result}`, "error");
        }

        setDeleteModalOpen(false);
        setClosureToDelete(null);
    };

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
            isCreating,
            closureType,
            setClosureType,
            customStartTime,
            setCustomStartTime,
            customEndTime,
            setCustomEndTime,
            scheduleForDate
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
