import { useParams } from "react-router-dom";
import { useTenantLoader } from "../../tenants/hooks/useTenantLoader";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const { tenantSlug } = useParams();
  const { tenant, loading } = useTenantLoader(tenantSlug!);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-xl font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-full max-w-sm">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No encontrado</h2>
          <p className="text-gray-600 text-base leading-relaxed">
            El espacio de trabajo que buscas no está disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: "url('/fondo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-sm border border-gray-100">
        {tenant.logoUrl && (
          <div className="flex justify-center mb-8">
            <img
              src={tenant.logoUrl}
              alt={`${tenant.name} logo`}
              className="h-16 sm:h-20 object-contain drop-shadow-lg"
            />
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Bienvenido
          </h1>
          <p
            className="text-xl font-semibold"
            style={{ color: tenant.primaryColor ?? "#6366f1" }}
          >
            {tenant.name}
          </p>
        </div>

        <LoginForm />

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-base text-gray-600">
            ¿Tienes Cuneta?{" "}
            <a
              href="#"
              className="text-indigo-600 hover:text-indigo-700 font-semibold inline-block"
              style={{ color: tenant.primaryColor ?? "#4f46e5" }}
            >
              Registrate aqui...
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}