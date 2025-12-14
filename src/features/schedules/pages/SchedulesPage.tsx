import { useState, useCallback } from "react";
import { Clock, Calendar, Settings, ArrowLeft } from "lucide-react";
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

    // Obtener barberos para identificar el principal
    const { barbers } = useBarbers();
    const shopBarberId = barbers?.[0]?.id;

    // Cargar horarios globales usando el ID del barbero principal
    const { schedules, loading, error, refresh } = useSchedules(shopBarberId, false);

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

    if (loading) return <SchedulesSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">{error}</p>
                    <Button variant="ghost" className="mt-4" onClick={refresh}>Reintentar</Button>
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
            <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {isEditing ? 'Gestión de Horarios' : 'Horarios de Atención'}
                            </h1>
                            <p className="text-gray-500 text-sm">
                                {isEditing ? 'Configura la disponibilidad semanal y días libres.' : 'Consulta nuestra disponibilidad semanal.'}
                            </p>
                        </div>
                    </div>

                    {isAdmin && (
                        <div>
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant={isEditing ? "ghost" : "primary"}
                                className={isEditing ? "text-gray-600" : "shadow-md shadow-indigo-200"}
                            >
                                {isEditing ? (
                                    <>
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Volver a la vista normal
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
            <div className="max-w-7xl mx-auto px-6 pt-8">
                {isEditing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna Izquierda: Editor Semanal */}
                        <div className="lg:col-span-2">
                            <WeekScheduleEditor
                                currentSchedules={schedules}
                                onUpdate={refresh}
                                onShowToast={handleShowToast}
                                barberId={shopBarberId}
                            />
                        </div>

                        {/* Columna Derecha: Días Libres */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-32">
                                <ClosureManager onShowToast={handleShowToast} barberId={shopBarberId} />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Vista Pública
                    <div>
                        {sortedSchedules.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                                    <Calendar className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sin horarios definidos</h3>
                                <p className="text-gray-500 text-sm max-w-xs mb-6">Aún no se han configurado los horarios de atención.</p>
                                {isAdmin && (
                                    <Button onClick={() => setIsEditing(true)}>
                                        Configurar ahora
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {sortedSchedules.map((schedule, index) => (
                                    <ScheduleCard
                                        key={`${schedule.id || 'no-id'}-${schedule.dayOfWeek}-${index}`}
                                        schedule={schedule}
                                    />
                                ))}
                            </div>
                        )}

                        <PublicClosuresView barberId={shopBarberId} />
                    </div>
                )}
            </div>
        </div>
    );
}
