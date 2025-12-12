import { useState, useEffect } from "react";
import { type Closure, type CreateClosureDto } from "../types";
import { useAdminSchedules } from "./useAdminSchedules";
import { SchedulesService } from "../api/schedules.service";
import { useTenant } from "../../../context/TenantContext";

interface UseClosureManagerProps {
    onShowToast?: (message: string, type: "success" | "error") => void;
}

export function useClosureManager({ onShowToast }: UseClosureManagerProps = {}) {
    const { tenant } = useTenant();
    const slug = tenant?.slug;

    const { createClosure, deleteClosure } = useAdminSchedules();
    
    // List State
    const [closures, setClosures] = useState<Closure[]>([]);
    const [loadingList, setLoadingList] = useState(true);

    // Form State
    const [newDate, setNewDate] = useState("");
    const [newReason, setNewReason] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const fetchClosures = async () => {
        if (!slug) return;
        try {
            const data = await SchedulesService.getClosures(slug);
            
            // Filter: Keep only Today and Future
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcoming = data.filter(c => {
                const cDate = new Date(c.date + 'T00:00:00');
                return cDate >= today;
            });

            // Sort by date asc
            setClosures(upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchClosures();
    }, [slug]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDate || !newReason) return;

        setIsCreating(true);
        const dto: CreateClosureDto = {
            date: newDate,
            reason: newReason
        };

        const res = await createClosure(dto);
        if (res) {
            setNewDate("");
            setNewReason("");
            fetchClosures();
            onShowToast?.("Día libre agregado correctamente", "success");
        } else {
            onShowToast?.("Error al agregar el día libre", "error");
        }
        setIsCreating(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este día libre?")) return;
        await deleteClosure(id);
        fetchClosures();
        onShowToast?.("Día libre eliminado", "success");
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
