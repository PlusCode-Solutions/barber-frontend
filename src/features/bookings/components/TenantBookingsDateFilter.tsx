import { useState, type ChangeEvent } from "react";
import { Calendar, ChevronDown, Sparkles } from "lucide-react";
import { formatFriendlyDay, safeDate } from "../../../utils/dateUtils";

interface Props {
    selectedDate: string; 
    onDateChange: (date: string) => void;
    countForDay: number;
    totalCount: number;
}

export default function TenantBookingsDateFilter({
    selectedDate,
    onDateChange,
    countForDay,
    totalCount,
}: Props) {
    const [showCalendar, setShowCalendar] = useState(false);
    const selectedDateObj = safeDate(selectedDate);
    const selectedDayLabel = selectedDateObj ? formatFriendlyDay(selectedDateObj) : "Fecha inválida";

    const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value) onDateChange(value);
    };

    return (
        <div className="bg-white px-6 py-6 shadow-sm mb-6 border-b border-gray-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                        <Sparkles className="h-4 w-4" />
                        <span>Panel del administrador</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gestión de Citas
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Por defecto ves las reservas de hoy. Cambia de día para validar disponibilidad o ausencias.
                    </p>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                        Filtrando: <span className="text-indigo-700 font-semibold capitalize">{selectedDayLabel}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 shadow-sm min-w-[150px]">
                        <p className="text-xs font-semibold text-indigo-700 uppercase">Citas del día</p>
                        <p className="text-2xl font-black text-indigo-900">{countForDay}</p>
                        <p className="text-[11px] text-indigo-600">Mostrando solo la fecha elegida</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-200 shadow-sm min-w-[150px]">
                        <p className="text-xs font-semibold text-gray-700 uppercase">Citas totales</p>
                        <p className="text-2xl font-black text-gray-900">{totalCount}</p>
                        <p className="text-[11px] text-gray-500">Histórico disponible</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCalendar((prev) => !prev)}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3 text-white font-semibold shadow-lg transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Calendar className="h-5 w-5" />
                        <span>Ver citas</span>
                        <ChevronDown className={`h-4 w-4 transition ${showCalendar ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </div>

            {showCalendar && (
                <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-white via-indigo-50 to-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase text-indigo-700">Filtro por fecha</p>
                            <p className="text-lg font-bold text-gray-900 capitalize">{selectedDayLabel}</p>
                            <p className="text-sm text-gray-500">
                                Selecciona un día para revisar quién agenda, validar picos y gestionar ausencias.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="tenant-bookings-date">
                                Elegir fecha:
                            </label>
                            <input
                                id="tenant-bookings-date"
                                type="date"
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                value={selectedDate}
                                onChange={handleDateChange}
                            />
                            <button
                                type="button"
                                onClick={() => onDateChange(new Date().toISOString().slice(0, 10))}
                                className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                            >
                                Hoy
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCalendar(false)}
                                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
