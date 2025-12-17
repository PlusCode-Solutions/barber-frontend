import { useMemo } from 'react';
import { useTenantBookings } from '../../bookings/hooks/useTenantBookings';
import { useBarbers } from '../../barbers/hooks/useBarbers'; // Assuming useBarbers is in features/barbers
import { normalizeDateString, formatDateForInput } from '../../../utils/dateUtils';
import { isSameMonth, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export function useDashboardStats() {
    const { bookings, loading: loadingBookings } = useTenantBookings();
    const { barbers, loading: loadingBarbers } = useBarbers();

    const stats = useMemo(() => {
        const today = new Date();
        const todayString = formatDateForInput(today); // YYYY-MM-DD
        const startWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        const endWeek = endOfWeek(today, { weekStartsOn: 1 });
        
        let todayCount = 0;
        let pendingToday = 0;
        
        let revenueToday = 0;
        let revenueWeekly = 0;
        let revenueMonthly = 0;

        let monthClients = new Set<string>();

        bookings.forEach(booking => {
            const bDateObj = parseISO(booking.date);
            const bDateString = normalizeDateString(booking.date);
            
            const isToday = bDateString === todayString;
            const isWeekly = isWithinInterval(bDateObj, { start: startWeek, end: endWeek });
            const isMonthly = isSameMonth(bDateObj, today);
            
            const isCancelled = booking.status === 'CANCELLED';
            const price = booking.service?.price ? Number(booking.service.price) : 0;

            // Counts
            if (isToday && !isCancelled) {
                todayCount++;
                if (booking.status === 'PENDING') pendingToday++;
            }

            // Client Counting (Monthly Unique)
            if (isMonthly && !isCancelled && booking.user?.id) {
                monthClients.add(booking.user.id);
            }

            // Revenue Calculations (Non-cancelled only)
            if (!isCancelled && price > 0) {
                if (isToday) revenueToday += price;
                if (isWeekly) revenueWeekly += price;
                if (isMonthly) revenueMonthly += price; 
            }
        });

        return {
            todayCount,
            pendingToday,
            revenue: {
                today: revenueToday,
                weekly: revenueWeekly,
                monthly: revenueMonthly
            },
            monthClientsCount: monthClients.size,
            activeBarbersCount: barbers.length
        };
    }, [bookings, barbers]);

    return {
        stats,
        loading: loadingBookings || loadingBarbers
    };
}
