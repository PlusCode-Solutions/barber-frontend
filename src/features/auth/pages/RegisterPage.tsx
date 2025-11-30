import { Link, useNavigate, useParams } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { useRegister } from "../hooks/useRegister";
import RegisterForm from "../components/RegisterForm";
import { useState } from "react";

export default function RegisterPage() {
    const { tenant } = useTenant();
    const { register } = useRegister();
    const { tenantSlug } = useParams();
    const navigate = useNavigate();

    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (form: any) => {
        if (!tenant) return;

        setLoading(true);

        try {
            await register({ ...form, tenantId: tenant.id });

            setSuccessMsg("🎉 Cuenta creada exitosamente. Redirigiendo...");

            setTimeout(() => {
                navigate(`/${tenantSlug}/auth/login`);
            }, 1500);
        } catch (err) {
            console.error(err);
            alert("Error al registrar.");
        }

        setLoading(false);
    };

    if (!tenant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg font-semibold">Cargando...</p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
            style={{ backgroundImage: "url('/fondo.jpg')" }}
        >
            {/* Overlay elegante */}
            <div className="absolute inset-0 bg-black/35 backdrop-blur-sm"></div>

            <div className="relative bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-200">

                {/* Mensaje de éxito */}
                {successMsg && (
                    <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-xl text-center font-medium">
                        {successMsg}
                    </div>
                )}

                {/* Logo */}
                {tenant.logoUrl && !successMsg && (
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-3 rounded-full shadow-md border border-gray-200">
                            <img src={tenant.logoUrl} alt="logo" className="h-16 object-contain" />
                        </div>
                    </div>
                )}

                {/* Títulos */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Crear cuenta</h1>
                    <p
                        className="text-lg font-semibold mt-1"
                        style={{ color: tenant.primaryColor ?? "#6366f1" }}
                    >
                        {tenant.name}
                    </p>
                </div>

                {/* Formulario */}
                {!successMsg && (
                    <RegisterForm onSubmit={handleRegister} loading={loading} />
                )}

                {/* Footer con link */}
                {!successMsg && (
                    <div className="mt-8 text-center border-t border-gray-200 pt-6">
                        <p className="text-gray-600">
                            ¿Ya tienes cuenta?{" "}
                            <Link
                                to={`/${tenantSlug}/auth/login`}
                                className="font-semibold hover:underline"
                                style={{ color: tenant.primaryColor ?? "#4f46e5" }}
                            >
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
