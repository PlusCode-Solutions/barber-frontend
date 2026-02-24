import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const PDFService = {
    generateStatisticsPDF: async (
        tenantName: string,
        startDate: string,
        endDate: string,
        stats: any,
        logoUrl?: string | null
    ) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // 1. Logo and Header
        let yPos = 20;

        if (logoUrl) {
            try {
                const img = await PDFService.loadImage(logoUrl);
                const circleCanvas = document.createElement('canvas');
                const size = 200; // Alta resolución para el logo
                circleCanvas.width = size;
                circleCanvas.height = size;
                const ctx = circleCanvas.getContext('2d');

                if (ctx) {
                    ctx.beginPath();
                    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(img, 0, 0, size, size);

                    const logoData = circleCanvas.toDataURL('image/png');
                    const logoSize = 30;
                    const xPos = (pageWidth - logoSize) / 2;
                    doc.addImage(logoData, 'PNG', xPos, 10, logoSize, logoSize);
                    yPos = 55; // Mayor espacio entre logo y título
                }
            } catch (error) {
                console.error("Error loading logo for PDF", error);
            }
        }

        doc.setFontSize(22);
        doc.setTextColor(33, 33, 33);
        doc.text("Reporte de Estadísticas", pageWidth / 2, yPos, { align: "center" });

        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text(tenantName, pageWidth / 2, yPos + 10, { align: "center" });

        // 2. Info de Filtro
        doc.setFontSize(10);
        doc.text(`Período: ${startDate} al ${endDate}`, 14, yPos + 25);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, yPos + 30);

        // 3. Resumen General
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Resumen de Negocio", 14, yPos + 45);

        autoTable(doc, {
            startY: yPos + 50,
            head: [["Descriptor", "Valor"]],
            body: [
                ["Ingresos Reales", `CRC ${(stats?.totalRevenue || 0).toLocaleString()}`],
                ["Citas Efectivas", stats?.totalAppointments || 0],
                ["Crecimiento vs Periodo Anterior", `${(stats?.growthPercentage || 0).toFixed(1)}%`],
                ["Ingresos Perdidos (Cancelaciones)", `CRC ${(stats?.lostRevenue || 0).toLocaleString()}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });

        // 4. Desglose por Servicio
        let lastY = (doc as any).lastAutoTable.finalY || 100;
        doc.setFontSize(14);
        doc.text("Rendimiento por Servicio", 14, lastY + 15);

        autoTable(doc, {
            startY: lastY + 20,
            head: [["Servicio", "Cant. Citas", "Ingresos Generados"]],
            body: (stats?.servicesBreakdown || []).map((s: any) => [
                s.name || "N/A",
                s.count || 0,
                `CRC ${(s.revenue || 0).toLocaleString()}`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        });

        // 5. Desglose por Barbero
        lastY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text("Rendimiento por Barbero", 14, lastY);

        autoTable(doc, {
            startY: lastY + 5,
            head: [["Barbero", "Trabajos Realizados", "Total Producido"]],
            body: (stats?.barbersBreakdown || []).map((b: any) => [
                b.name || "N/A",
                b.count || 0,
                `CRC ${(b.revenue || 0).toLocaleString()}`
            ]),
            theme: 'striped',
            headStyles: { fillColor: [39, 174, 96], textColor: 255 },
        });

        // 6. Pie de página
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Sass Barber - Reporte Analítico Profesional", pageWidth / 2, finalY, { align: "center" });

        // Guardar/Descargar
        doc.save(`Reporte_Premium_${tenantName}_${startDate}.pdf`);
    },

    loadImage: (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Importante para evitar problemas de CORS con Cloudinary
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
        });
    }
};
