import { useQuery } from '@tanstack/react-query';
import { StatisticsService, type DashboardStats } from '../api/statistics.service';
import { useTenant } from '../../../context/TenantContext';

export function useDashboardStats() {
    const { tenant } = useTenant();

    const { data: stats, isLoading, error, refetch } = useQuery<DashboardStats>({
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
        error,
        refetch
    };
}
