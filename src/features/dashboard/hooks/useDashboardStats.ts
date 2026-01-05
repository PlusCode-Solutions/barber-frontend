import { useQuery } from '@tanstack/react-query';
import { StatisticsService, type DashboardStats } from '../api/statistics.service';
import { useTenant } from '../../../context/TenantContext'; // ID: 3e86bdaf-dc9b-4538-8102-76dec32f9eeb

export function useDashboardStats() {
    const { tenant } = useTenant();

    const { data: stats, isLoading, error } = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats', tenant?.id],
        queryFn: () => StatisticsService.getDashboardStats(),
        enabled: !!tenant?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const defaultStats: DashboardStats = {
        appointmentsToday: 0,
        appointmentsLastMonth: 0,
        activeBarbers: 0,
        monthlyRevenue: 0
    };

    return {
        stats: stats || defaultStats,
        loading: isLoading,
        error
    };
}
