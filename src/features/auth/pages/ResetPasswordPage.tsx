import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useTenantLoader } from "../../tenants/hooks/useTenantLoader";
import { AuthService } from "../api/auth.service";
import { Input } from "../../../components/ui/Input";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
    const { tenantSlug } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const { tenant, loading: tenantLoading } = useTenantLoader(tenantSlug!);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Token de recuperación no encontrado.");
            navigate(`/${tenantSlug}/auth/login`);
        }
    }, [token, navigate, tenantSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Las contraseñas no coinciden.");
        }

        if (password.length < 6) {
            return toast.error("La contraseña debe tener al menos 6 caracteres.");
        }

        setLoading(true);
        try {
            await AuthService.resetPassword(tenantSlug!, { token, password });
            toast.success("Contraseña restablecida con éxito. Ya puedes iniciar sesión.");
            navigate(`/${tenantSlug}/auth/login`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al restablecer la contraseña.");
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
                    <h1 className="text-2xl font-extrabold text-white">Nueva Contraseña</h1>
                    <p className="text-sm text-white/80 mt-2">
                        Establece tu nueva clave de acceso para {tenant.name}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Nueva Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="********"
                        containerClassName="[&>label]:!text-white/90"
                        className="!bg-white/10 !border-white/20 !text-white placeholder:!text-white/60 focus:!ring-white/30 focus:!border-white/50"
                    />

                    <Input
                        label="Confirmar Contraseña"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="********"
                        containerClassName="[&>label]:!text-white/90"
                        className="!bg-white/10 !border-white/20 !text-white placeholder:!text-white/60 focus:!ring-white/30 focus:!border-white/50"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 text-white mt-4"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {loading ? "Actualizando..." : "Cambiar Contraseña"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <Link
                        to={`/${tenantSlug}/auth/login`}
                        className="text-sm font-bold text-white hover:underline"
                    >
                        Cancelar y volver
                    </Link>
                </div>
            </div>
        </div>
    );
}
