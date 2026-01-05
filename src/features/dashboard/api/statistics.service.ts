import axios from "../../../lib/axios";

export interface DashboardStats {
    appointmentsToday: number;
    appointmentsLastMonth: number;
    activeBarbers: number;
    monthlyRevenue: number;
}

export interface ServicePopularity {
    serviceName: string;
    count: number;
    percentage: number;
}

export const StatisticsService = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await axios.get('/statistics/dashboard');
        return response.data;
    }
};
