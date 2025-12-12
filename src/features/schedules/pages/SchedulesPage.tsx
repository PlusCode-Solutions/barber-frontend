import { useState, useEffect, useCallback } from "react";
import { Clock, Calendar, Settings, ArrowLeft } from "lucide-react";
import { useSchedules } from "../hooks/useSchedules";
import ScheduleCard from "../components/ScheduleCard";
import SchedulesSkeleton from "../components/SchedulesSkeleton";
import WeekScheduleEditor from "../components/WeekScheduleEditor";
import ClosureManager from "../components/ClosureManager";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/ui/Button";
import { SchedulesService } from "../api/schedules.service";
import Toast from "../../../components/ui/Toast";

export default function SchedulesPage() {
    const { schedules, loading, error, refresh } = useSchedules();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    // Toast State
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

    // Initial check for 'TENANT_ADMIN' role. 
    const isAdmin = user?.role === 'TENANT_ADMIN';

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

    // Ordenar horarios por día de la semana (Domingo a Sábado)
    const sortedSchedules = [...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <Toast
                message={toastState.message}
                type={toastState.type}
                isVisible={toastState.isVisible}
                onClose={handleCloseToast}
            />

            {/* HEADER */}
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

            {/* CONTENT */}
            <div className="max-w-7xl mx-auto px-6 pt-8">
                {isEditing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Weekly Schedule */}
                        <div className="lg:col-span-2">
                            <WeekScheduleEditor
                                currentSchedules={schedules}
                                onUpdate={refresh}
                                onShowToast={handleShowToast}
                            />
                        </div>

                        {/* Right Column: Closures */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-32">
                                <ClosureManager onShowToast={handleShowToast} />
                            </div>
                        </div>
                    </div>
                ) : (
                    // VIEW MODE
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
                                {sortedSchedules.map((schedule) => (
                                    <ScheduleCard key={schedule.id} schedule={schedule} />
                                ))}
                            </div>
                        )}

                        <PublicClosuresView />
                    </div>
                )}
            </div>
        </div>
    );
}

import { useTenant } from "../../../context/TenantContext";

function PublicClosuresView() {
    const { tenant } = useTenant();
    const slug = tenant?.slug;
    const [closures, setClosures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        SchedulesService.getClosures(slug)
            .then(data => {
                // Filter only future or today's closures
                const upcoming = data.filter((c: any) => new Date(c.date) >= new Date(new Date().setHours(0, 0, 0, 0)));
                setClosures(upcoming.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading || closures.length === 0) return null;

    return (
        <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-500" />
                Próximos Días Libres
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {closures.map(closure => (
                    <div key={closure.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900">{closure.reason}</p>
                            <p className="text-sm text-gray-500 capitalize">
                                {new Date(closure.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                        <div className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-100">
                            Cerrado
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
