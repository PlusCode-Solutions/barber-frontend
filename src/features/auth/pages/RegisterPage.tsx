import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTenantLoader } from "../../tenants/hooks/useTenantLoader";
import { useRegister } from "../hooks/useRegister";
import RegisterForm from "../components/RegisterForm";
import { useState } from "react";

export default function RegisterPage() {
    const { tenantSlug } = useParams();
    const { tenant, loading: tenantLoading } = useTenantLoader(tenantSlug!);
    const { register } = useRegister();
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
            // Error al registrar
            alert("Error al registrar.");
        }

        setLoading(false);
    };

    if (tenantLoading || !tenant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-gray-600 text-lg font-medium">Cargando barbería...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url('${tenant.backgroundUrl || '/fondo.jpg'}')` }}
        >
            {/* Overlay elegante */}
            <div className="absolute inset-0 bg-black/35 backdrop-blur-sm"></div>

            {/* BOTÓN VOLVER (TOP LEFT) */}
            <Link
                to={`/${tenantSlug}`}
                className="
                    absolute top-8 left-8 
                    flex items-center gap-2 
                    bg-white/10 backdrop-blur-md 
                    text-white px-5 py-2.5 
                    rounded-2xl border border-white/20 
                    hover:bg-white/20 transition-all 
                    font-bold text-sm uppercase tracking-wide 
                    shadow-xl hover:scale-105 active:scale-95
                    z-50
                "
            >
                <ArrowLeft size={18} />
                Volver
            </Link>

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
