import { useTenant } from "../../context/TenantContext";

export default function DashboardHome() {
    const { tenant } = useTenant();

    return (
        <div className="min-h-screen bg-gray-50 px-5 py-6">

            {/* Card principal */}
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
                    <span className="font-semibold text-blue-600">
                        Agenda tu cita cuando quieras — ¡tu tiempo es nuestra prioridad!
                    </span>
                </p>

                {/* CTA bonito */}
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <p className="text-blue-700 text-sm font-medium">
                        ✨ Consejo: Revisa tus citas recientes para mantener todo bajo control.
                    </p>
                </div>

            </div>

        </div>
    );
}
