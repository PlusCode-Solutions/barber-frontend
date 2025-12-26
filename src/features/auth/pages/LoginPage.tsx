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
        bg-black/30 
        backdrop-blur-xl 
        px-7 py-10
        sm:px-10 sm:py-12
        rounded-3xl 
        shadow-2xl 
        w-full 
        max-w-sm 
        border border-white/10
        animate-fadeIn
      ">

        {/* LOGO */}
        {tenant.logoUrl && (
          <div className="flex justify-center -mt-24 mb-6 relative z-10">
            <div
              className="
                bg-black/40 backdrop-blur-md p-1.5 rounded-full shadow-2xl border-2 
                transition-transform duration-300 hover:scale-105
                w-36 h-36 flex items-center justify-center
              "
              style={{ borderColor: tenant.primaryColor ?? '#ffffff' }}
            >
              <img
                src={tenant.logoUrl}
                className="w-full h-full object-cover rounded-full"
                alt="Tenant Logo"
              />
            </div>
          </div>
        )}

        {/* TEXTOS */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
            Bienvenido
          </h1>
          <p
            className="text-lg font-semibold mt-1 tracking-wide text-white/90"
          >
            {tenant.name}
          </p>
        </div>

        {/* FORM */}
        <LoginForm variant="glass" />

        {/* FOOTER */}
        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-base text-gray-200">
            ¿No tienes cuenta?{" "}
            <Link
              to={`/${tenantSlug}/auth/register`}
              className="font-bold text-white hover:underline transition-colors hover:text-gray-100"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
