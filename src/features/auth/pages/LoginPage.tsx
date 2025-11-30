import { Link, useParams } from "react-router-dom";
import { useTenantLoader } from "../../tenants/hooks/useTenantLoader";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const { tenantSlug } = useParams();
  const { tenant, loading } = useTenantLoader(tenantSlug!);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600 text-lg font-medium">Cargando barbería...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm w-full">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Barbería no encontrada
          </h2>
          <p className="text-gray-600">El espacio solicitado no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/fondo.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm"></div>

      {/* CARD PRINCIPAL */}
      <div className="
        relative 
        bg-white/90 
        backdrop-blur-xl 
        p-7 
        sm:p-10 
        rounded-3xl 
        shadow-2xl 
        w-full 
        max-w-sm 
        border border-gray-200 
        animate-fadeIn
      ">

        {/* LOGO */}
        {tenant.logoUrl && (
          <div className="flex justify-center mb-7">
            <div
              className="
                bg-white p-4 rounded-full shadow-lg border border-gray-200 
                transition-transform duration-300 hover:scale-105
              "
            >
              <img
                src={tenant.logoUrl}
                className="h-16 sm:h-20 object-contain"
                alt="Tenant Logo"
              />
            </div>
          </div>
        )}

        {/* TEXTOS */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Bienvenido
          </h1>
          <p
            className="text-lg font-semibold mt-1 tracking-wide"
            style={{ color: tenant.primaryColor ?? "#6366f1" }}
          >
            {tenant.name}
          </p>
        </div>

        {/* FORM */}
        <LoginForm />

        {/* FOOTER */}
        <div className="mt-8 text-center border-t border-gray-200 pt-6">
          <p className="text-base text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link
              to={`/${tenantSlug}/auth/register`}
              style={{ color: tenant.primaryColor ?? "#4f46e5" }}
              className="font-semibold hover:underline transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
