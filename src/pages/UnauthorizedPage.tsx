import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
    const { user, logout } = useAuth();
    // Fallback to localStorage if context not ready or user null
    const tenantSlug = user?.tenantSlug || localStorage.getItem('tenant');
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        if (tenantSlug) {
            navigate(`/${tenantSlug}/auth/login`);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <ShieldOff className="mx-auto h-20 w-20 text-red-500 mb-6" />

                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">403</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Acceso Restringido
                </h2>

                <p className="text-gray-600 mb-8 text-lg">
                    Lo sentimos, no tienes los permisos necesarios para ver esta sección.
                    Si es un error, contacta a tu administrador.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {tenantSlug ? (
                        <Link
                            to={`/${tenantSlug}/dashboard`}
                            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-md hover:shadow-lg gap-2"
                        >
                            <ArrowLeft size={20} />
                            Volver al Panel
                        </Link>
                    ) : (
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
                        >
                            Ir al Inicio
                        </Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition border border-gray-200 gap-2"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
