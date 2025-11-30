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
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/fondo.jpg')" }}
        >
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-sm">

                {successMsg && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-center">
                        {successMsg}
                    </div>
                )}

                {tenant.logoUrl && (
                    <div className="flex justify-center mb-6">
                        <img src={tenant.logoUrl} className="h-16 object-contain" />
                    </div>
                )}

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Crear cuenta</h1>
                    <p className="text-lg font-semibold" style={{ color: tenant.primaryColor ?? "#000000ff" }}>
                        {tenant.name}
                    </p>
                </div>

                {!successMsg && (
                    <RegisterForm onSubmit={handleRegister} loading={loading} />
                )}

                {!successMsg && (
                    <div className="mt-6 text-center border-t pt-4">
                        <p className="text-gray-600">
                            ¿Ya tienes cuenta?{" "}
                            <Link
                                to={`/${tenantSlug}/auth/login`}
                                className="font-semibold underline"
                                style={{ color: tenant.primaryColor ?? "#0d0c19ff" }}
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
