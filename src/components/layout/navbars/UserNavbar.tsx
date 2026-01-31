import { useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home, CalendarCheck, Users, Scissors, Clock, LogOut } from "lucide-react";
import { useTenant } from "../../../context/TenantContext";
import { useAuth } from "../../../context/AuthContext";

export default function UserNavbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { tenantSlug } = useParams();
    const { tenant } = useTenant();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Fallback for slug
    const finalSlug = tenantSlug || tenant?.slug;

    const menuItems = [
        { icon: Home, label: "Inicio", path: "dashboard" },
        { icon: CalendarCheck, label: "Citas", path: "dashboard/bookings" },
        { icon: Scissors, label: "Servicios", path: "dashboard/services" },
        { icon: Users, label: "Barberos", path: "dashboard/barbers" },
        { icon: Clock, label: "Horarios", path: "dashboard/schedules" }
    ];

    const handleLogout = () => {
        // Manually clear storage like in TenantAdminNavbar
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (finalSlug) {
            navigate(`/${finalSlug}/auth/login`);
        } else {
            navigate('/');
        }
    };

    return (
        <>
            <header
                className="fixed w-full z-50 transition-all duration-300 shadow-lg text-white"
                style={{ backgroundColor: tenant?.primaryColor || tenant?.secondaryColor || '#2563eb' }}
            >
                <div className="w-full px-4 sm:px-6 lg:px-12">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <Link to={`/${finalSlug}/dashboard`} className="flex items-center gap-2 group">
                                {tenant?.logoUrl ? (
                                    <img src={tenant.logoUrl} alt={tenant.name || "Logo"} className="h-10 w-auto object-contain rounded-lg bg-white/10" />
                                ) : (
                                    <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10">
                                        <Scissors className="text-white w-6 h-6 transform group-hover:-rotate-12 transition-transform duration-300" />
                                    </div>
                                )}
                                <span className="text-2xl font-bold text-white tracking-tight">
                                    {tenant?.name || "BarberShop"}
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Menu - Centered */}
                        <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
                            {menuItems.map((item) => {
                                const fullPath = `/${finalSlug}/${item.path}`;
                                // Para "Inicio" (dashboard) requerimos coincidencia exacta para que no se active con los hijos
                                const isActive = item.path === 'dashboard'
                                    ? location.pathname === fullPath
                                    : location.pathname.startsWith(fullPath);

                                return (
                                    <Link
                                        key={item.path}
                                        to={fullPath}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isActive
                                            ? "bg-white text-blue-600 shadow-md"
                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                            }`}
                                        style={isActive ? { color: tenant?.primaryColor || '#2563eb' } : undefined}
                                    >
                                        <item.icon size={16} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop Actions - Right */}
                        <div className="hidden md:flex items-center gap-4">
                            <span className="text-white/80 text-sm font-medium hidden lg:block">
                                Hola, {user?.name?.split(' ')[0] || 'Cliente'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all backdrop-blur-sm flex items-center gap-2 border border-white/10 hover:border-white/30"
                            >
                                <LogOut size={18} />
                                Salir
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                            >
                                {menuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Mobile Menu */}
            <nav
                className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col md:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="p-5 flex items-center justify-between border-b border-gray-200 bg-primary/5">
                    <span className="font-bold text-lg text-gray-900">Menú</span>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === `/${finalSlug}/${item.path}`;
                        return (
                            <Link
                                key={item.path}
                                to={`/${finalSlug}/${item.path}`}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                style={isActive ? {
                                    backgroundColor: 'rgba(var(--secondary-rgb, 37, 99, 235), 0.1)',
                                    color: 'var(--secondary-color, #2563eb)'
                                } : undefined}
                            >
                                <item.icon
                                    size={20}
                                    className={isActive ? '' : 'text-gray-400'}
                                    style={isActive ? { color: 'var(--secondary-color, #2563eb)' } : undefined}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            {/* Spacer */}
            <div className="h-20" />
        </>
    );
}