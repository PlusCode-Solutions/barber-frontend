import { useState, useEffect } from "react";
import BookingsList from "../components/BookingsList";
import CancelBookingModal from "../components/CancelBookingModal";
import CreateBookingModal from "../components/CreateBookingModal";
import { useAuth } from "../../../context/AuthContext";
import { BookingsService } from "../api/bookings.service";
import BookingsSkeleton from "../components/BookingsSkeleton";
import Pagination from "../../../components/ui/Pagination";
import {
    formatDateForInput,
    formatHour,
    formatRelativeDate,
} from "../../../utils/dateUtils";
import TenantBookingsDateFilter from "../components/TenantBookingsDateFilter";
import { useBarbers } from "../../barbers/hooks/useBarbers";
import { formatCurrency } from "../../../utils/formatUtils";
import { Filter, RefreshCw, Plus } from "lucide-react";
import Toast from "../../../components/ui/Toast";
import { useTimeline } from "../hooks/useTimeline";


export default function TenantBookingsPage() {
    const { user } = useAuth();
    const isBarber = user?.role === 'BARBER';
    const [selectedBarberId, setSelectedBarberId] = useState<string | undefined>(isBarber ? user?.barberId : undefined);
    const [selectedDate, setSelectedDate] = useState<string>(formatDateForInput(new Date()));

    // 🔥 EL CAMBIO CLAVE: Usamos el nuevo hook que trae TODO calculado del backend
    const { items: timelineItems, loading, refetch } = useTimeline(selectedDate, selectedBarberId);

    const { barbers } = useBarbers();
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false,
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate, selectedBarberId]);

    const filteredBookings = timelineItems;

    if (loading) return <BookingsSkeleton />;

    /**
     * Handles manual refresh of bookings data.
     */
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
            setToast({
                message: "Citas actualizadas correctamente",
                type: "success",
                isVisible: true,
            });
        } catch (error) {
            console.error("Error al actualizar citas:", error);
            setToast({
                message: "Error al actualizar las citas. Inténtalo de nuevo.",
                type: "error",
                isVisible: true,
            });
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;

        setIsCancelling(true);
        try {
            await BookingsService.cancelBooking(bookingToCancel);
            setToast({
                message: "Cita cancelada exitosamente",
                type: "success",
                isVisible: true,
            });
            setBookingToCancel(null);
            refetch();
        } catch (error: any) {
            const isForbidden = error?.response?.status === 403;
            setToast({
                message: isForbidden
                    ? "No tienes permiso para eliminar citas de otras personas"
                    : "Error al cancelar la cita. Inténtalo de nuevo.",
                type: "error",
                isVisible: true,
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const formatItem = (b: any) => ({
        ...b,
        date: formatRelativeDate(b.date),
        startTime: formatHour(b.startTime),
        endTime: formatHour(b.endTime),
        service: {
            ...b.service,
            name: b.status === 'AVAILABLE' ? "Espacio Libre" : b.status === 'CLOSED' ? "Cierre Especial" : (b.service?.name || "Servicio General"),
            price: b.service?.price ? formatCurrency(b.service.price) : "—",
        },
        customerName: b.user?.name || "Cliente Desconocido",
        barberName: b.barber?.name || "Barbero Asignado",
        isOwner: b.userId === user?.id || b.user?.id === user?.id
    });

    const totalItems = filteredBookings.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const paginatedRaw = filteredBookings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const paginatedDisplay = paginatedRaw.map(formatItem);

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <div className="flex-1">
                            <TenantBookingsDateFilter
                                selectedDate={selectedDate}
                                onDateChange={setSelectedDate}
                                countForDay={filteredBookings.filter(b => b.type === 'BOOKING').length}
                                totalCount={filteredBookings.filter(b => b.type === 'BOOKING').length}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nueva Cita</span>
                            </button>

                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`
                                    p-2.5 rounded-lg border border-gray-200 bg-white text-gray-500
                                    hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200
                                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-100
                                    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                title="Actualizar citas"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
                            </button>

                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedBarberId || ""}
                                    onChange={(e) => setSelectedBarberId(e.target.value || undefined)}
                                    disabled={isBarber}
                                    className={`bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 min-w-[180px] ${isBarber ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                >
                                    {!isBarber && <option value="">Todos los barberos</option>}
                                    {barbers.map(barber => (
                                        <option key={barber.id} value={barber.id}>
                                            {barber.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-6 pb-20">
                <BookingsList
                    bookings={paginatedDisplay.map(b => ({
                        ...b,
                        id: b.id || Math.random().toString()
                    }))}
                    onCancelBooking={(b) => setBookingToCancel(b.id)}
                />

                {totalItems > ITEMS_PER_PAGE && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            onPageChange={setCurrentPage}
                            itemsName="citas"
                        />
                    </div>
                )}
            </div>

            <CancelBookingModal
                isOpen={!!bookingToCancel}
                isCancelling={isCancelling}
                onClose={() => setBookingToCancel(null)}
                onConfirm={handleConfirmCancel}
            />

            <CreateBookingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    refetch();
                    setIsCreateModalOpen(false);
                }}
            />
        </div>
    );
}
