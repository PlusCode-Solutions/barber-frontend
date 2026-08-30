import { Calendar as CalendarIcon, ChevronLeft, Clock } from "lucide-react";
import Calendar from "../../../../components/ui/Calendar";
import type { Closure, Schedule } from "../../../schedules/types";
import type { AdvanceRestriction } from "../../types";
import { format } from "date-fns";
import { safeDate, formatFriendlyDay, getCostaRicaNow, isSameDay, formatHour } from "../../../../utils/dateUtils";
import { useTenant } from "../../../../context/TenantContext";
import SlotsSkeleton from "./SlotsSkeleton";

interface SelectDateTimeStepProps {
    selectedDate: string;
    availableSlots: string[];
    allPotentialSlots?: string[];
    breakSlots?: string[];
    blockedSlots?: Map<string, 'past' | 'advance'>;
    advanceRestriction?: AdvanceRestriction;
    loadingSlots: boolean;
    closures?: Closure[];
    schedules?: Schedule[];
    tenantSchedules?: Schedule[];
    professionalId?: string;
    onDateChange: (date: string) => void;
    onSelectSlot: (slot: string) => void;
    onBack?: () => void;
    viewOnly?: boolean;
}

type SlotState = 'available' | 'break' | 'advance' | 'occupied' | 'past' | 'locked';

interface SlotButtonProps {
    slot: string;
    state: SlotState;
    tooltip: string;
    onSelect: (slot: string) => void;
    disallowSelect?: boolean;
}

function SlotButton({ slot, state, tooltip, onSelect, disallowSelect }: SlotButtonProps) {
    const styles: Record<SlotState, string> = {
        available: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 hover:scale-105 active:scale-95',
        locked: 'bg-green-50 border-green-200 text-green-700 cursor-default opacity-80',
        break: 'bg-orange-50 border-orange-200 text-orange-500 cursor-not-allowed opacity-70',
        advance: 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-60',
        occupied: 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-60',
        past: 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed',
    };

    const ariaLabels: Record<SlotState, string> = {
        available: `Seleccionar horario ${slot}`,
        locked: `Horario no disponible ${slot}`,
        break: `Descanso ${slot}`,
        advance: `Horario bloqueado ${slot} - requiere anticipacion`,
        occupied: `Horario ocupado ${slot}`,
        past: `Horario pasado ${slot}`,
    };

    const canSelect = state === 'available' && !disallowSelect;

    return (
        <button
            type="button"
            onClick={() => canSelect && onSelect(slot)}
            disabled={!canSelect}
            title={tooltip}
            aria-label={ariaLabels[state]}
            className={`border rounded-full py-2 px-1 text-sm font-medium transition focus:outline-none whitespace-nowrap relative ${styles[state]}`}
        >
            {formatHour(slot, "12h")}
        </button>
    );
}

export default function SelectDateTimeStep({
    selectedDate,
    availableSlots,
    allPotentialSlots = [],
    breakSlots = [],
    blockedSlots,
    advanceRestriction,
    loadingSlots,
    closures = [],
    schedules = [],
    tenantSchedules = [],
    professionalId,
    onDateChange,
    onSelectSlot,
    onBack,
    viewOnly = false
}: SelectDateTimeStepProps) {
    const { tenant } = useTenant();
    const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';
    const dateObj = selectedDate ? safeDate(selectedDate) : null;

    const combinedSlots = [...new Set([...allPotentialSlots, ...breakSlots])].sort();
    const displaySlots = combinedSlots.length > 0 ? combinedSlots : availableSlots;

    const morningSlots = displaySlots.filter(slot => parseInt(slot.split(':')[0]) < 12);
    const afternoonSlots = displaySlots.filter(slot => parseInt(slot.split(':')[0]) >= 12);

    const advanceTooltip = () => {
        const h = advanceRestriction?.hours ?? tenant?.bookingAdvanceHours ?? 0;
        const label = h < 1 ? `${Math.round(h * 60)} min` : h === 1 ? '1 hora' : `${h} horas`;
        return `Debes agendar con al menos ${label} de anticipación`;
    };

    const buildSlotState = (slot: string): { state: SlotState; tooltip: string } => {
        const isAvailable = availableSlots.includes(slot);
        const isBreak = breakSlots.includes(slot);
        const blockedBy = blockedSlots?.get(slot);

        if (isBreak) return { state: 'break', tooltip: 'Almuerzo' };
        if (isAvailable) return { state: viewOnly ? 'locked' : 'available', tooltip: '' };
        if (blockedBy === 'advance') return { state: 'advance', tooltip: advanceTooltip() };
        if (blockedBy === 'past') return { state: 'past', tooltip: 'Horario pasado' };
        return { state: 'occupied', tooltip: 'Horario ocupado' };
    };

    return (
        <div role="region" aria-label="Selección de fecha y hora">
            <div className="flex items-center gap-2 mb-6">
                <CalendarIcon size={24} aria-hidden="true" style={{ color: primaryColor }} />
                <h3 className="text-xl font-bold text-gray-900">Fecha y Hora</h3>
            </div>

            {viewOnly && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm">
                    <strong>Modo Consulta:</strong> Puedes ver los horarios disponibles, pero no puedes agendar nuevas citas porque has alcanzado tu límite.
                </div>
            )}

            {advanceRestriction?.enabled && !viewOnly && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                    <strong>Agendamiento con anticipación:</strong> Debes agendar con al menos{' '}
                    {(() => {
                        const h = advanceRestriction.hours;
                        if (h < 1) return `${Math.round(h * 60)} minutos`;
                        const whole = Math.floor(h);
                        const rem = Math.round((h - whole) * 60);
                        return rem > 0
                            ? `${whole} hora${whole !== 1 ? 's' : ''} y ${rem} minutos`
                            : `${whole} hora${whole !== 1 ? 's' : ''}`;
                    })()}{' '}
                    de anticipación.
                    {advanceRestriction.blockedUntil && (
                        <> Los horarios antes de las <strong>{formatHour(advanceRestriction.blockedUntil, "12h")}</strong> no están disponibles hoy.</>
                    )}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Column 1: Calendar */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Selecciona la fecha
                    </label>
                    <Calendar
                        selectedDate={dateObj}
                        onDateSelect={(date) => onDateChange(format(date, 'yyyy-MM-dd'))}
                        closures={closures}
                        schedules={schedules}
                        tenantSchedules={tenantSchedules}
                        professionalId={professionalId}
                        className="w-full"
                        maxDate={new Date(new Date().getFullYear(), 11, 31)}
                    />
                </div>

                {/* Column 2: Slots */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Horarios disponibles
                        {dateObj && <span className="font-normal text-gray-500 ml-1">
                            para el {formatFriendlyDay(dateObj)}
                        </span>}
                    </label>

                    {!selectedDate ? (
                        <div className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                            <CalendarIcon size={48} className="mb-2 opacity-20" />
                            <p>Selecciona una fecha en el calendario para ver los horarios</p>
                        </div>
                    ) : loadingSlots ? (
                        <div className="h-64 border-2 border-gray-100 rounded-xl p-4">
                            <SlotsSkeleton />
                        </div>
                    ) : displaySlots.length === 0 ? (
                        <div className="h-64 border-2 border-gray-100 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                            <Clock size={48} className="mb-2 opacity-20" />
                            {(() => {
                                const nowCR = getCostaRicaNow();
                                const isToday = selectedDate && isSameDay(selectedDate, nowCR);
                                const isBlockedByAdvance = isToday && advanceRestriction?.enabled && advanceRestriction?.blockedToday;

                                if (isBlockedByAdvance) {
                                    const h = advanceRestriction.hours;
                                    let timeLabel: string;
                                    if (h < 1) {
                                        timeLabel = `${Math.round(h * 60)} minutos`;
                                    } else {
                                        const whole = Math.floor(h);
                                        const rem = Math.round((h - whole) * 60);
                                        timeLabel = rem > 0
                                            ? `${whole} hora${whole !== 1 ? 's' : ''} y ${rem} minutos`
                                            : `${whole} hora${whole !== 1 ? 's' : ''}`;
                                    }

                                    return (
                                        <>
                                            <p className="font-medium text-gray-900">Horario no disponible hoy</p>
                                            <p className="text-sm mt-1 text-orange-600 max-w-xs">
                                                Se requiere agendar con al menos {timeLabel} de anticipación.
                                                {advanceRestriction.nextAvailableTime && (
                                                    <> Próximo horario disponible después de las <strong>{formatHour(advanceRestriction.nextAvailableTime, "12h")}</strong>.</>
                                                )}
                                                {' '}Selecciona <strong>mañana</strong> o un día posterior.
                                            </p>
                                        </>
                                    );
                                }
                                return (
                                    <>
                                        <p className="font-medium text-gray-900">No hay horarios disponibles</p>
                                        <p className="text-sm mt-1">Intenta seleccionar otra fecha o profesional.</p>
                                    </>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                            {morningSlots.length > 0 && (
                                <div>
                                    <h4 className="text-center font-bold text-gray-800 mb-3 text-sm tracking-wide">MAÑANA</h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3" role="group" aria-label="Horarios de mañana">
                                        {morningSlots.map((slot) => {
                                            const { state, tooltip } = buildSlotState(slot);
                                            return (
                                                <SlotButton
                                                    key={slot}
                                                    slot={slot}
                                                    state={state}
                                                    tooltip={tooltip}
                                                    onSelect={onSelectSlot}
                                                    disallowSelect={viewOnly}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {afternoonSlots.length > 0 && (
                                <div>
                                    <h4 className="text-center font-bold text-gray-800 mb-3 text-sm tracking-wide">TARDE</h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3" role="group" aria-label="Horarios de tarde">
                                        {afternoonSlots.map((slot) => {
                                            const { state, tooltip } = buildSlotState(slot);
                                            return (
                                                <SlotButton
                                                    key={slot}
                                                    slot={slot}
                                                    state={state}
                                                    tooltip={tooltip}
                                                    onSelect={onSelectSlot}
                                                    disallowSelect={viewOnly}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="mt-8 flex items-center gap-2 text-gray-500 font-medium hover:text-gray-900 transition-colors"
                    aria-label="Volver al paso anterior"
                >
                    <ChevronLeft size={20} aria-hidden="true" />
                    Volver a selección de profesional
                </button>
            )}
        </div>
    );
}
