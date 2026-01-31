import { useState, useCallback } from "react";
import { Clock, Calendar, Settings, ArrowLeft, User } from "lucide-react";
import { useSchedules } from "../hooks/useSchedules";
import ScheduleCard from "../components/ScheduleCard";
import SchedulesSkeleton from "../components/SchedulesSkeleton";
import WeekScheduleEditor from "../components/WeekScheduleEditor";
import ClosureManager from "../components/ClosureManager";
import PublicClosuresView from "../components/PublicClosuresView";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { useBarbers } from "../../../features/barbers/hooks/useBarbers";
import SEO from "../../../components/shared/SEO";
import { useTenant } from "../../../context/TenantContext";

export default function SchedulesPage() {
    const { tenant } = useTenant();
    const { user } = useAuth();
    const isAdmin = user?.role === 'TENANT_ADMIN';

    // Obtener barberos para identificar el principal y permitir selección
    const { barbers } = useBarbers({ enabled: isAdmin });

    // Estado para el barbero seleccionado
    const [selectedBarberId, setSelectedBarberId] = useState<string | undefined>(undefined);

    // Removed auto-selection effect to allow viewing Tenant schedules by default

    // Cargar horarios del barbero seleccionado
    const { schedules, loading, error, refresh } = useSchedules(selectedBarberId, false);

    const [isEditing, setIsEditing] = useState(false);

    // Sistema de notificaciones (Toast)
    const [toastState, setToastState] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false,
    });

    const handleShowToast = useCallback((message: string, type: "success" | "error") => {
        setToastState({ message, type, isVisible: true });
    }, []);

    const handleCloseToast = useCallback(() => {
        setToastState(prev => ({ ...prev, isVisible: false }));
    }, []);

    if (loading && !schedules.length) return <SchedulesSkeleton />;
    if (!tenant) return <SchedulesSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">{error}</p>
                    <Button variant="ghost" className="mt-4" onClick={() => refresh()}>Reintentar</Button>
                </div>
            </div>
        );
    }

    // Ordenar horarios (Domingo a Sábado)
    const sortedSchedules = [...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <SEO title="Horarios" description={`Consulta nuestros horarios de atención y días festivos en ${tenant?.name}.`} />
            <Toast
                message={toastState.message}
                type={toastState.type}
                isVisible={toastState.isVisible}
                onClose={handleCloseToast}
            />

            {/* Encabezado */}
            <div
                className="mx-4 mt-4 px-6 py-6 sticky top-0 z-20 shadow-xl transition-colors duration-300 text-white rounded-3xl"
                style={{ backgroundColor: tenant?.primaryColor || tenant?.secondaryColor || '#2563eb' }}
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                                <Clock className="w-6 h-6 text-current" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {isEditing ? 'Gestión de Horarios' : 'Horarios de Atención'}
                                </h1>
                                <p className="opacity-90 text-sm">
                                    {isEditing ? 'Configura la disponibilidad.' : 'Consulta nuestra disponibilidad.'}
                                </p>
                            </div>
                        </div>

                        {/* Selector de Barbero (Solo Admin) */}
                        {isAdmin && isEditing && (
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/20 sm:ml-4">
                                <User className="w-4 h-4 ml-2 opacity-80" />
                                <select
                                    value={selectedBarberId || ""}
                                    onChange={(e) => setSelectedBarberId(e.target.value || undefined)}
                                    className="bg-transparent border-none text-white text-sm font-medium focus:ring-0 cursor-pointer [&>option]:text-gray-900"
                                >
                                    <option value="">🕒 Horarios Generales (Barbería)</option>
                                    {barbers.map(barber => (
                                        <option key={barber.id} value={barber.id}>
                                            {barber.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {isAdmin && (
                        <div>
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant={isEditing ? "ghost" : "secondary"}
                                className={isEditing ? "text-white hover:bg-white/10" : "shadow-md text-gray-900 bg-white hover:bg-gray-100 border-none"}
                            >
                                {isEditing ? (
                                    <>
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Volver a la vista pública
                                    </>
                                ) : (
                                    <>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Administrar Horarios
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {isEditing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna Izquierda: Editor Semanal */}
                        <div className="lg:col-span-2">
                            <WeekScheduleEditor
                                key={selectedBarberId} // Force re-mount on barber change to reset form state
                                currentSchedules={schedules}
                                onUpdate={refresh}
                                onShowToast={handleShowToast}
                                barberId={selectedBarberId}
                            />
                        </div>

                        {/* Columna Derecha: Días Libres */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-32">
                                <ClosureManager
                                    key={`closure-${selectedBarberId}`}
                                    onShowToast={handleShowToast}
                                    barberId={selectedBarberId}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Vista Pública (Siempre muestra horarios del primer barbero/tienda por defecto o el seleccionado si quisiéramos)
                    // Para vista pública habitual, solemos mostrar "Horarios de la Tienda" (General). 
                    // Si la tienda usa el perfil del primer barbero como "General", está bien.
                    // Vista Pública
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar: Próximos Días Libres (1 col) */}
                        <div className="lg:col-span-1">
                            {/* Make sticky so it stays visible while scrolling schedule if list is long */}
                            <div className="sticky top-24">
                                <PublicClosuresView barberId={selectedBarberId} />
                            </div>
                        </div>

                        {/* Main: Horario Semanal (3 cols) */}
                        <div className="lg:col-span-3">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                Horario Semanal
                            </h3>

                            {sortedSchedules.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                                        <Calendar className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Sin horarios definidos</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mb-6 mx-auto">Aún no se han configurado los horarios de atención.</p>
                                    {isAdmin && (
                                        <Button onClick={() => setIsEditing(true)}>
                                            Configurar ahora
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Chunk schedules into pairs for the requested "2 days per row box" layout */}
                                    {Array.from({ length: Math.ceil(sortedSchedules.length / 2) }).map((_, i) => {
                                        const pair = sortedSchedules.slice(i * 2, i * 2 + 2);
                                        return (
                                            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-row divide-x divide-gray-100">
                                                {pair.map((schedule) => (
                                                    <div key={schedule.id} className="flex-1 min-w-0">
                                                        <ScheduleCard
                                                            schedule={schedule}
                                                            variant="embedded"
                                                        />
                                                    </div>
                                                ))}
                                                {/* Filler padding if last row has only 1 item to maintain grid look (optional, but keeping it simpler properly aligns) */}
                                                {pair.length === 1 && <div className="flex-1 hidden md:block bg-gray-50/20"></div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
