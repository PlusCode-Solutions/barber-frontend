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

                    return (
                        <div key={day.id} className={`p-4 transition-colors ${isOff ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'}`}>
                            {/* Flex Wrapper for Mobile Stacking */}
                            <div className="flex flex-col xl:flex-row xl:items-center gap-4">

                                {/* Header / Toggle */}
                                <div className="flex items-center justify-between xl:w-40 xl:flex-shrink-0">
                                    <div className="flex items-center gap-3">
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
                                    {/* Mobile Only Action Button (Optional position adjustment) */}
                                    <div className="xl:hidden">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            isLoading={savingDay === day.id}
                                            onClick={() => handleSave(day.id)}
                                            className="text-indigo-600 hover:bg-indigo-50"
                                        >
                                            <Save className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Timer Controls */}
                                {!isOff && (
                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
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

                                        <div className="col-span-2 border-t pt-2 md:border-t-0 md:pt-0 md:border-l md:pl-4 border-gray-100">
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
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end mb-1"
                                                        title="Quitar descanso"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
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

                                {/* Desktop Action */}
                                <div className="hidden xl:block flex-shrink-0 ml-auto">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        isLoading={savingDay === day.id}
                                        onClick={() => handleSave(day.id)}
                                        className="text-indigo-600 hover:bg-indigo-50"
                                    >
                                        <Save className="w-4 h-4 mr-1" />
                                        Guardar
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
