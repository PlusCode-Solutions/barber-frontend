import { Save, Clock, AlertCircle, X } from "lucide-react";
import { type Schedule } from "../types";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useWeekScheduleEditor } from "../hooks/useWeekScheduleEditor";

interface Props {
    currentSchedules: Schedule[];
    onUpdate: () => void;
    onShowToast?: (message: string, type: "success" | "error") => void;
    barberId?: string;
}

export default function WeekScheduleEditor({ currentSchedules, onUpdate, onShowToast, barberId }: Props) {
    const { formData, savingDay, handleSave, handleChange, DAYS } = useWeekScheduleEditor({
        currentSchedules,
        onUpdate,
        onShowToast,
        barberId
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Configuración Semanal</h3>
                    <p className="text-sm text-gray-500">Define los horarios estándar para cada día.</p>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {DAYS.map((day) => {
                    const data = formData[day.id];
                    if (!data) return null;

                    const isOff = data.isClosed;

                    // Calculate isDirty
                    const original = currentSchedules.find(s => s.dayOfWeek === day.id);
                    const isDirty = (() => {
                        if (!original) return true;
                        if (original.isClosed !== data.isClosed) return true;
                        if (original.startTime !== data.startTime) return true;
                        if (original.endTime !== data.endTime) return true;
                        if ((original.lunchStartTime || "") !== (data.lunchStartTime || "")) return true;
                        if ((original.lunchEndTime || "") !== (data.lunchEndTime || "")) return true;
                        return false;
                    })();

                    return (
                        <div key={day.id} className={`p-4 lg:p-6 transition-colors ${isOff ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'}`}>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">

                                {/* Day Name */}
                                <div className="flex items-center gap-3 lg:w-40 lg:flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={!isOff}
                                        onChange={(e) => handleChange(day.id, 'isClosed', !e.target.checked)}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 cursor-pointer"
                                    />
                                    <span className={`font-medium ${isOff ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                        {day.name}
                                    </span>
                                </div>

                                {/* Timer Controls */}
                                {!isOff && (
                                    <div className="flex-1 min-w-0">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="col-span-1">
                                                <label className="text-xs text-gray-500 mb-1 block">Apertura</label>
                                                <Input
                                                    type="time"
                                                    value={data.startTime}
                                                    onChange={(e) => handleChange(day.id, 'startTime', e.target.value)}
                                                    className="!py-2 !text-sm"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="text-xs text-gray-500 mb-1 block">Cierre</label>
                                                <Input
                                                    type="time"
                                                    value={data.endTime}
                                                    onChange={(e) => handleChange(day.id, 'endTime', e.target.value)}
                                                    className="!py-2 !text-sm"
                                                />
                                            </div>

                                            <div className="col-span-2 sm:col-span-2 border-t pt-2 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4 border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-400 mb-1 block">Inicio Descanso</label>
                                                        <Input
                                                            type="time"
                                                            value={data.lunchStartTime || ""}
                                                            onChange={(e) => handleChange(day.id, 'lunchStartTime', e.target.value)}
                                                            className="!py-2 !text-sm !bg-gray-50"
                                                            placeholder="--:--"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-400 mb-1 block">Fin Descanso</label>
                                                        <Input
                                                            type="time"
                                                            value={data.lunchEndTime || ""}
                                                            onChange={(e) => handleChange(day.id, 'lunchEndTime', e.target.value)}
                                                            className="!py-2 !text-sm !bg-gray-50"
                                                            placeholder="--:--"
                                                        />
                                                    </div>
                                                    {/* Clear Break Button */}
                                                    {(data.lunchStartTime || data.lunchEndTime) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleChange(day.id, 'lunchStartTime', '');
                                                                handleChange(day.id, 'lunchEndTime', '');
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                            title="Quitar descanso"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isOff && (
                                    <div className="flex-1 flex items-center text-gray-400 text-sm italic py-2">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Cerrado todo el día
                                    </div>
                                )}

                                {/* Save Button - Separated */}
                                <div className="flex justify-end lg:justify-center lg:w-16 lg:flex-shrink-0 lg:border-l lg:border-gray-200 lg:pl-4">
                                    <Button
                                        size="sm"
                                        variant={isDirty ? "secondary" : "ghost"}
                                        disabled={!isDirty}
                                        isLoading={savingDay === day.id}
                                        onClick={() => handleSave(day.id)}
                                        className={`h-10 w-10 p-0 flex items-center justify-center rounded-lg transition-all ${isDirty
                                                ? "text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:scale-105"
                                                : "text-gray-300 bg-gray-50 border border-gray-100"
                                            }`}
                                        title={isDirty ? "Guardar cambios" : "No hay cambios pendientes"}
                                    >
                                        <Save size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
