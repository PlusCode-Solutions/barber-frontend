import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTenantLoader } from "../../tenants/hooks/useTenantLoader";
import { AuthService } from "../api/auth.service";
import { Input } from "../../../components/ui/Input";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
    const { tenantSlug } = useParams();
    const { tenant, loading: tenantLoading } = useTenantLoader(tenantSlug!);

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await AuthService.forgotPassword(tenantSlug!, email);
            setSubmitted(true);
            toast.success("Si tu cuenta existe, recibirás instrucciones en breve.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "No se pudo procesar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    if (tenantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
        );
    }

    if (!tenant) return null;

    const primaryColor = tenant.primaryColor || '#2563eb';

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
            style={{ backgroundImage: "url('/fondo.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/35 backdrop-blur-sm"></div>

            <div className="relative bg-black/30 backdrop-blur-xl px-7 py-10 sm:px-10 sm:py-12 rounded-3xl shadow-2xl w-full max-w-sm border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-extrabold text-white">Recuperar Acceso</h1>
                    <p className="text-sm text-white/80 mt-2">
                        {submitted
                            ? "Revisa tu bandeja de entrada"
                            : `Ingresa tu correo vinculado a ${tenant.name}`}
                    </p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tu@email.com"
                            containerClassName="[&>label]:!text-white/90"
                            className="!bg-white/10 !border-white/20 !text-white placeholder:!text-white/60 focus:!ring-white/30 focus:!border-white/50"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {loading ? "Enviando..." : "Enviar Instrucciones"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-white/10 rounded-xl border border-white/10 text-white/90 text-sm">
                            Hemos enviado un enlace de recuperación. Si no lo ves, revisa tu carpeta de **SPAM**.
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <Link
                        to={`/${tenantSlug}/auth/login`}
                        className="text-sm font-bold text-white hover:underline"
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
