import { useState } from "react";
import { format, startOfMonth, subDays } from "date-fns";
import { BookingsService } from "../api/bookings.service";
import { useTenant } from "../../../context/TenantContext";
import { PDFService } from "../services/pdf.service";
import { toast } from "react-hot-toast";


// Singleton to persist statistics between navigations without using extra libraries
let statsCache: any = null;
let lastStartDate: string = format(startOfMonth(new Date()), "yyyy-MM-dd");
let lastEndDate: string = format(subDays(new Date(), 1), "yyyy-MM-dd");

export function useStatistics() {
    const { tenant } = useTenant();

    // El reporte solo permite hasta ayer
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    const [startDate, setStartDate] = useState(lastStartDate);
    const [endDate, setEndDate] = useState(lastEndDate);
    const [stats, setStats] = useState<any>(statsCache);
    const [loading, setLoading] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    const fetchStats = async () => {
        if (!tenant) return;

        // Extra validation in frontend
        if (endDate > yesterday) {
            toast.error("El reporte solo puede generarse hasta el día de ayer.");
            return;
        }

        setLoading(true);
        try {
            const data = await BookingsService.getStatistics(startDate, endDate);
            setStats(data);

            // Update global cache
            statsCache = data;
            lastStartDate = startDate;
            lastEndDate = endDate;

        } catch (error: any) {
            const msg = error.response?.data?.message || "Error al cargar las estadísticas";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // We removed the useEffect that loaded automatically on mount
    // to avoid saturating the server and comply with "On-Demand" loading

    const handleGeneratePDF = async () => {
        if (!stats || !tenant) return;
        setGeneratingPDF(true);
        try {
            await PDFService.generateStatisticsPDF(
                tenant.name,
                startDate,
                endDate,
                stats,
                tenant.logoUrl
            );
        } catch (error) {
            console.error("Failed to generate PDF", error);
            toast.error("Error al generar el PDF");
        } finally {
            setGeneratingPDF(false);
        }
    };

    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        stats,
        loading,
        generatingPDF,
        yesterday,
        fetchStats,
        handleGeneratePDF
    };
}
