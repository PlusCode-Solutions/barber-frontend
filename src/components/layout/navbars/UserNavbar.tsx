import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { Home, CalendarCheck, Users, Scissors, Clock, LogOut } from "lucide-react";
import { useTenant } from "../../../context/TenantContext";
import { useAuth } from "../../../context/AuthContext";
import MobileNavbar from "./MobileNavbar";
import { AuthService } from "../../../features/auth/api/auth.service";


export default function UserNavbar() {
    const { tenantSlug } = useParams();
    const { tenant } = useTenant();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Fallback for slug
    const finalSlug = tenantSlug || tenant?.slug;

    const menuItems = [
        { icon: CalendarCheck, label: "Citas", path: "dashboard/bookings" },
        { icon: Scissors, label: "Servicios", path: "dashboard/services" },
        { icon: Home, label: "Inicio", path: "dashboard" },
        { icon: Users, label: "Profesionales", path: "dashboard/professionals" },
        { icon: Clock, label: "Horarios", path: "dashboard/schedules" }
    ];

    const handleLogout = async () => {
        try {
            // Clear the httpOnly cookie on the server
            await AuthService.logout(finalSlug);
        } catch {
            // Proceed with logout even if API call fails
        } finally {
            logout(); // Clear React state and localStorage
            navigate(finalSlug ? `/${finalSlug}/auth/login` : '/');
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
                                    {tenant?.name || "ProfessionalShop"}
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {menuItems.map((item) => {
                                const fullPath = `/${finalSlug}/${item.path}`;
                                // For "Home" (dashboard) we require exact match so it doesn't activate with children
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
                        <div className="flex items-center gap-4">
                            <span className="text-white/80 text-sm font-medium hidden xl:block">
                                Hola, {user?.name?.split(' ')[0] || 'Cliente'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all backdrop-blur-sm flex items-center gap-2 border border-white/10 hover:border-white/30"
                            >
                                <LogOut size={18} />
                                <span className="hidden xl:inline">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bottom Bar Móvil */}
            <MobileNavbar
                items={menuItems.map((item) => ({ ...item, exact: item.path === "dashboard" }))}
                primaryColor={tenant?.primaryColor || '#2563eb'}
                basePath={`/${finalSlug}`}
            />
            
            {/* Spacer */}
            <div className="h-20" />
        </>
    );
}