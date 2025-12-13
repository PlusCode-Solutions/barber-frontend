import { useState, useEffect } from "react";
import { type Schedule, type CreateScheduleDto } from "../types";
import { useAdminSchedules } from "./useAdminSchedules";

interface UseWeekScheduleEditorProps {
    currentSchedules: Schedule[];
    onUpdate: () => void;
    onShowToast?: (message: string, type: "success" | "error") => void;
    barberId?: string;
}

const DAYS = [
    { id: 1, name: "Lunes" },
    { id: 2, name: "Martes" },
    { id: 3, name: "Miércoles" },
    { id: 4, name: "Jueves" },
    { id: 5, name: "Viernes" },
    { id: 6, name: "Sábado" },
    { id: 0, name: "Domingo" },
];

export function useWeekScheduleEditor({ currentSchedules, onUpdate, onShowToast, barberId }: UseWeekScheduleEditorProps) {
    const { updateSchedule } = useAdminSchedules();
    const [savingDay, setSavingDay] = useState<number | null>(null);
    const [formData, setFormData] = useState<Record<number, CreateScheduleDto>>({});

    useEffect(() => {
        const initialData: Record<number, CreateScheduleDto> = {};
        DAYS.forEach(day => {
            const existing = currentSchedules.find(s => s.dayOfWeek === day.id);
            initialData[day.id] = {
                dayOfWeek: day.id,
                startTime: existing?.startTime || "09:00",
                endTime: existing?.endTime || "18:00",
                isClosed: existing?.isClosed || false,
                lunchStartTime: existing?.lunchStartTime || "",
                lunchEndTime: existing?.lunchEndTime || ""
            };
        });
        setFormData(initialData);
    }, [currentSchedules]);

    const handleSave = async (dayOfWeek: number) => {
        const data = formData[dayOfWeek];
        if (!data) return;

        setSavingDay(dayOfWeek);
        
        const payload = {
            ...data,
            barberId,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            lunchStartTime: data.lunchStartTime || null,
            lunchEndTime: data.lunchEndTime || null,
        };
        
        const sanitizedPayload: any = { ...payload };
        if (!sanitizedPayload.lunchStartTime) delete sanitizedPayload.lunchStartTime;
        if (!sanitizedPayload.lunchEndTime) delete sanitizedPayload.lunchEndTime;

        const res = await updateSchedule(sanitizedPayload);
        setSavingDay(null);

        if (res) {
            onUpdate();
            onShowToast?.("Horario guardado correctamente", "success");
        } else {
            onShowToast?.("Error al guardar el horario", "error");
        }
    };

    const handleChange = (day: number, field: keyof CreateScheduleDto, value: any) => {
        setFormData(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    return {
        formData,
        savingDay,
        handleSave,
        handleChange,
        DAYS
    };
}
