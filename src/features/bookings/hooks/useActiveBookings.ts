import { useMemo } from 'react';
import { useUserBookings } from './useUserBookings';
import { isPastBooking, safeDate } from '../../../utils/dateUtils';


/**
 * Hook to manage active bookings logic (Limit: 2, Next Appointment).
 * Centralizes filtering and sorting to ensure consistency across the app.
 */
export function useActiveBookings() {
    const { bookings, loading, refetch, error } = useUserBookings();
    
    // Constant for the limit (easier to change later)
    const ACTIVE_BOOKING_LIMIT = 2;

    const activeBookings = useMemo(() => {
        return bookings.filter(b => 
            (b.status === 'CONFIRMED' || b.status === 'PENDING') && 
            !isPastBooking(b.date, b.startTime)
        );
    }, [bookings]);

    const activeCount = activeBookings.length;
    
    // Check if limit is reached
    const limitReached = activeCount >= ACTIVE_BOOKING_LIMIT;

    // Determine Next Closest Appointment
    const nextAppointment = useMemo(() => {
        if (activeBookings.length === 0) return null;

        const sorted = [...activeBookings].sort((a, b) => {
            const dateA = safeDate(a.date)?.getTime() || 0;
            const dateB = safeDate(b.date)?.getTime() || 0;
            
            // 1. Primary: Date Ascending
            if (dateA !== dateB) return dateA - dateB;
            
            // 2. Secondary: Time Ascending
            const timeA = parseInt(a.startTime.replace(':', ''));
            const timeB = parseInt(b.startTime.replace(':', ''));
            return timeA - timeB;
        });

        return sorted[0] || null;
    }, [activeBookings]);

    return {
        bookings,           
        activeBookings,   
        activeCount,       
        limitReached,       
        nextAppointment,    
        loading,
        refetch,
        error
    };
}
