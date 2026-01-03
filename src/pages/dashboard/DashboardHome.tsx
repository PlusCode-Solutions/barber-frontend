import { useState } from "react";
import { Plus, CheckCircle } from "lucide-react";
import { useTenant } from "../../context/TenantContext";
import CreateBookingModal from "../../features/bookings/components/CreateBookingModal";
import NextAppointmentCard from "../../features/bookings/components/NextAppointmentCard";
import SEO from "../../components/shared/SEO";
import { useUserBookings } from "../../features/bookings/hooks/useUserBookings";
import { isPastBooking } from "../../utils/dateUtils";

export default function DashboardHome() {
    const { tenant } = useTenant();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { bookings, refetch } = useUserBookings();

    // Logic: Limit to 2 active future bookings
    // TODO: Consider moving this limit to a configuration or database setting
    const activeBookingsCount = bookings.filter(b =>
        (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
        !isPastBooking(b.date, b.startTime)
    ).length;

    const limitReached = activeBookingsCount >= 2;

    const handleSuccess = async () => {
        // Explicitly fetch from server to update the limit immediately
        await refetch();

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 px-5 py-6">
            <SEO
                title="Inicio"
                description={`Bienvenido a ${tenant?.name || 'tu barbería'}. Gestiona tus citas y servicios fácilmente.`}
            />

            {/* Success Message */}
            {showSuccess && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 z-50 animate-bounce">
                    <CheckCircle size={24} />
                    <span className="font-semibold">¡Cita creada exitosamente!</span>
                </div>
            )}

            {/* Next Appointment Card */}
            <NextAppointmentCard />

            {/* Dashboard Content */}
            <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100">

                {/* Encabezado con logo y nombre */}
                <div className="flex items-center gap-4 mb-5">
                    {tenant?.logoUrl && (
                        <img
                            src={tenant.logoUrl}
                            alt="Logo"
                            className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-gray-200"
                        />
                    )}

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                            Bienvenidos a {tenant?.name ?? "tu barbería"}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Es un gusto tenerte con nosotros ✂️
                        </p>
                    </div>
                </div>

                {/* Mensaje principal */}
                <p className="text-gray-700 text-base leading-relaxed">
                    Gestiona tus citas, barberos, servicios y más desde este panel.
                    <span
                        className="font-semibold block mt-1"
                        style={{ color: tenant?.primaryColor || tenant?.secondaryColor || '#2563eb' }}
                    >
                        Agenda tu cita cuando quieras — ¡tu tiempo es nuestra prioridad!
                    </span>
                </p>

                {/* CTA Button - Nueva Cita */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    title={limitReached ? "Modo solo lectura: Límite de citas alcanzado" : "Crear nueva cita"}
                    className={`mt-6 w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 group hover:shadow-xl`}
                    style={{ backgroundColor: tenant?.primaryColor || '#2563eb' }}
                >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                        {limitReached ? <CheckCircle size={20} /> : <Plus size={20} />}
                    </div>
                    <span className="text-lg">
                        {limitReached ? "Ver disponibilidad" : "Nueva Cita"}
                    </span>
                </button>

                {/* CTA bonito */}
                <div
                    className="mt-6 border rounded-2xl p-4"
                    style={{
                        borderColor: `${tenant?.primaryColor || '#2563eb'}40`,
                        backgroundColor: `${tenant?.primaryColor || '#2563eb'}10`
                    }}
                >
                    <p
                        className="text-sm font-medium"
                        style={{ color: tenant?.primaryColor || '#2563eb' }}
                    >
                        ✨ Consejo: Revisa tus citas recientes para mantener todo bajo control.
                    </p>
                </div>

            </div>

            {/* Modal */}
            <CreateBookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                viewOnly={limitReached}
            />

        </div>
    );
}
