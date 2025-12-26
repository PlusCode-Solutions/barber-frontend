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

            <div className="relative bg-black/30 backdrop-blur-xl px-7 py-10 sm:px-10 sm:py-12 rounded-3xl shadow-2xl w-full max-w-sm border border-white/10 animate-fadeIn">

                {/* Mensaje de éxito */}
                {successMsg && (
                    <div className="mb-6 p-3 bg-green-500/20 border border-green-500/30 text-white rounded-xl text-center font-medium backdrop-blur-sm">
                        {successMsg}
                    </div>
                )}

                {/* Logo */}
                {tenant.logoUrl && !successMsg && (
                    <div className="flex justify-center -mt-24 mb-6 relative z-10">
                        <div
                            className="bg-black/40 backdrop-blur-md p-1.5 rounded-full shadow-2xl border-2 transition-transform duration-300 hover:scale-105 w-36 h-36 flex items-center justify-center"
                            style={{ borderColor: tenant.primaryColor ?? '#ffffff' }}
                        >
                            <img src={tenant.logoUrl} alt="logo" className="w-full h-full object-cover rounded-full" />
                        </div>
                    </div>
                )}

                {/* Títulos */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-white leading-tight drop-shadow-sm">Crear cuenta</h1>
                    <p
                        className="text-lg font-semibold mt-1 tracking-wide text-white/90"
                    >
                        {tenant.name}
                    </p>
                </div>

                {/* Formulario */}
                {!successMsg && (
                    <RegisterForm
                        onSubmit={handleRegister}
                        loading={loading}
                        variant="glass"
                        buttonColor={tenant.primaryColor || undefined}
                    />
                )}

                {/* Footer con link */}
                {!successMsg && (
                    <div className="mt-8 text-center border-t border-white/10 pt-6">
                        <p className="text-gray-200">
                            ¿Ya tienes cuenta?{" "}
                            <Link
                                to={`/${tenantSlug}/auth/login`}
                                className="font-bold text-white hover:underline transition-colors hover:text-gray-100"
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
