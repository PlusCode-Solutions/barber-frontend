import { useMemo, useState, useEffect } from "react";
import { useTenantBookings } from "../hooks/useTenantBookings";
import BookingsList from "../components/BookingsList";
import BookingsSkeleton from "../components/BookingsSkeleton";
import Pagination from "../../../components/ui/Pagination";
import {
    formatDateForInput,
    formatHour,
    formatRelativeDate,
    normalizeDateString
} from "../../../utils/dateUtils";
import TenantBookingsDateFilter from "../components/TenantBookingsDateFilter";
import { useBarbers } from "../../barbers/hooks/useBarbers"; // Import useBarbers
import { formatCurrency } from "../../../utils/formatUtils";
import { Filter, RefreshCw } from "lucide-react"; // Icons
import Toast from "../../../components/ui/Toast";
import { calculateEndTime } from "../utils/timeUtils";
import { SchedulesService } from "../../schedules/api/schedules.service";
import { generateTimeSlots, timeToMinutes } from "../utils/timeUtils";
import { getDay } from "date-fns";


export default function TenantBookingsPage() {
    const [selectedBarberId, setSelectedBarberId] = useState<string | undefined>(undefined);
    const { bookings, loading, refetch } = useTenantBookings({ barberId: selectedBarberId }); // Pass filter
    const { barbers } = useBarbers(); // Fetch barbers for dropdown
    const [selectedDate, setSelectedDate] = useState<string>(formatDateForInput(new Date()));
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false,
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate, selectedBarberId]);

    const [schedules, setSchedules] = useState<any[]>([]);
    const [tenantSchedules, setTenantSchedules] = useState<any[]>([]);
    const [closures, setClosures] = useState<any[]>([]);
    const [hasLoadedMetadata, setHasLoadedMetadata] = useState(false);

    /**
     * Loads schedule metadata once to enable efficient client-side availability calculations.
     */
    useEffect(() => {
        const loadMetadata = async () => {
            if (hasLoadedMetadata) return;

            try {
                const [allScheds, allClosures, tScheds] = await Promise.all([
                    SchedulesService.getAllSchedules(),
                    SchedulesService.getClosures(),
                    SchedulesService.getSchedules()
                ]);
                setSchedules(allScheds);
                setClosures(allClosures);
                setTenantSchedules(tScheds);
            } catch (e) {
                console.error("Error loading schedules metadata", e);
            } finally {
                setHasLoadedMetadata(true);
            }
        };
        loadMetadata();
    }, []);

    /**
     * Computes available time slots for all barbers based on schedules and existing bookings.
     * Memoized to optimize performance and prevent re-renders.
     */
    const computedFreeSlots = useMemo(() => {
        if (barbers.length === 0 || !hasLoadedMetadata) {
            return [];
        }

        const dateStr = normalizeDateString(selectedDate) || selectedDate;
        const parsedDate = new Date(selectedDate + 'T00:00:00');
        if (isNaN(parsedDate.getTime())) return [];

        const dayOfWeek = getDay(parsedDate);

        const isGloballyClosed = closures.some(c => !c.barberId && normalizeDateString(c.date) === dateStr);
        if (isGloballyClosed) return [];

        const allSlots: { time: string, barberId: string, barberName: string }[] = [];

        // If a barber is selected, only iterate over that one. Otherwise, check all.
        const barbersToCheck = selectedBarberId
            ? barbers.filter(b => b.id === selectedBarberId)
            : barbers;

        barbersToCheck.forEach(barber => {
            const isBarberClosed = closures.some(c => c.barberId === barber.id && normalizeDateString(c.date) === dateStr);
            if (isBarberClosed) return;

            let schedule = schedules.find(s => s.barberId === barber.id && Number(s.dayOfWeek) === dayOfWeek);
            if (!schedule) {
                schedule = tenantSchedules.find(s => Number(s.dayOfWeek) === dayOfWeek);
            }

            if (!schedule || schedule.isClosed || !schedule.startTime || !schedule.endTime) return;

            const slots = generateTimeSlots(
                schedule.startTime,
                schedule.endTime,
                30,
                schedule.lunchStartTime,
                schedule.lunchEndTime
            );
            // Filter out busy times (checking overlaps)
            const barberBookings = bookings.filter(b =>
                b.barber?.id === barber.id &&
                normalizeDateString(b.date) === dateStr &&
                b.status !== 'CANCELLED'
            );

            const occupiedRanges = barberBookings.map(b => {
                const start = timeToMinutes(b.startTime);
                let end = start + 30; // default assumption
                if (b.endTime) end = timeToMinutes(b.endTime);
                return { start, end };
            });

            const free = slots
                .filter(time => {
                    const slotStart = timeToMinutes(time);
                    const slotEnd = slotStart + 30; // Assuming "Free Slot" is a 30m block

                    // Check strict overlap
                    return !occupiedRanges.some(range =>
                        (slotStart < range.end) && (slotEnd > range.start)
                    );
                })
                .map(time => ({
                    time,
                    barberId: barber.id,
                    barberName: barber.name
                }));

            allSlots.push(...free);
        });

        return allSlots;
    }, [selectedBarberId, selectedDate, barbers, bookings, schedules, tenantSchedules, closures, hasLoadedMetadata]);

    /**
     * Merges bookings and available slots into a single chronological list.
     */
    const filteredBookings = useMemo(() => {
        const realBookings = bookings.filter((b) => {
            const bookingDate = normalizeDateString(b.date);
            const dateMatch = bookingDate === selectedDate;
            const barberMatch = selectedBarberId ? b.barber?.id === selectedBarberId : true;
            return dateMatch && barberMatch;
        }).map(b => ({
            ...b,
            type: 'BOOKING' as const
        }));

        // Now we always use the locally computed slots, which handles both single and all barber cases
        const slotsToDisplay = computedFreeSlots;

        const freeSlotsCalls = slotsToDisplay.map(slot => ({
            id: `free-${slot.time}-${slot.barberId}`,
            date: selectedDate,
            startTime: slot.time,
            endTime: calculateEndTime(slot.time, 30),
            customerName: "Disponible",
            barberName: slot.barberName,
            service: { name: "Espacio Libre", price: 0 },
            status: 'AVAILABLE' as const,
            type: 'FREE' as const,
            user: { name: "Disponible" },
            barber: { name: slot.barberName }
        }));

        const combined = [...realBookings, ...freeSlotsCalls];
        return combined.sort((a, b) => a.startTime.localeCompare(b.startTime));

    }, [bookings, selectedDate, selectedBarberId, computedFreeSlots]);

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

    const formatItem = (b: any) => ({
        ...b,
        date: formatRelativeDate(b.date),
        startTime: formatHour(b.startTime),
        endTime: formatHour(b.endTime),
        service: {
            ...b.service,
            name: b.status === 'AVAILABLE' ? "Espacio Libre" : (b.service?.name || "Servicio General"),
            price: b.service?.price ? formatCurrency(b.service.price) : "—",
        },
        customerName: b.user?.name || "Cliente Desconocido",
        barberName: b.barber?.name || "Barbero Asignado"
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
                                totalCount={bookings.length}
                            />
                        </div>

                        <div className="flex items-center gap-3">
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
                                    className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer min-w-[180px]"
                                >
                                    <option value="">Todos los barberos</option>
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
        </div>
    );
}
