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
    professionalId?: string;
}

export function useClosureManager({ onShowToast, professionalId }: UseClosureManagerProps = {}) {
    const { createClosure, deleteClosure } = useAdminSchedules();
    const { closures, loading: loadingList, refetch, error: fetchError } = useClosures(professionalId);
    const { schedules } = useSchedules(professionalId);

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
    const [conflictingBookings, setConflictingBookings] = useState<any[]>([]);
    const [showConflictModal, setShowConflictModal] = useState(false);

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

    const handleCreate = async (e?: React.FormEvent, overrideProfessionalId?: string | null, force: boolean = false) => {
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

        const finalProfessionalId = overrideProfessionalId !== undefined ? overrideProfessionalId : professionalId;
        let dto: CreateClosureDto;

        const baseDto = {
            date: newDate,
            reason: newReason,
            professionalId: finalProfessionalId,
            force
        };

        switch (closureType) {
            case 'full':
                dto = {
                    ...baseDto,
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
                    ...baseDto,
                    isFullDay: false,
                    startTime: customStartTime,
                    endTime: customEndTime
                };
                break;
        }

        const res = await createClosure(dto);

        // Handle conflict response
        if (res && (res as any).hasConflicts && !(res as any).forced) {
            setConflictingBookings((res as any).bookings);
            setShowConflictModal(true);
            setIsCreating(false);
            return;
        }

        if (res) {
            setNewDate("");
            setNewReason("");
            setClosureType('full');
            setCustomStartTime("");
            setCustomEndTime("");
            setConflictingBookings([]);
            setShowConflictModal(false);
            refetch();

            if ((res as any).forced) {
                onShowToast?.(`Cierre creado. Se cancelaron ${(res as any).cancelledCount} citas y se notificó a los clientes.`, "success");
            } else {
                onShowToast?.("Excepción creada exitosamente. No se encontraron citas conflictivas.", "success");
            }
        } else {
            onShowToast?.("No se pudo registrar el día libre. Intente nuevamente.", "error");
        }
        setIsCreating(false);
    };

    const handleConfirmForce = () => {
        handleCreate(undefined, undefined, true);
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
            scheduleForDate,
            conflictingBookings,
            showConflictModal,
            setShowConflictModal
        },
        actions: {
            handleCreate,
            handleDelete,
            handleConfirmForce
        },
        deleteModal: {
            isOpen: deleteModalOpen,
            closureToDelete: closureToDelete ? closures.find(c => c.id === closureToDelete) : null,
            onConfirm: confirmDelete,
            onCancel: cancelDelete
        }
    };
}
