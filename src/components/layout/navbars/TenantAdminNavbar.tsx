import { useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, FileText, Scissors, Users, Calendar, UserCircle, LogOut } from "lucide-react";
import { useTenant } from "../../../context/TenantContext";

export default function TenantAdminNavbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { tenantSlug } = useParams();
    const { tenant } = useTenant();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "admin/dashboard" },
        { icon: FileText, label: "Citas", path: "admin/bookings" },
        { icon: Scissors, label: "Servicios", path: "admin/services" },
        { icon: Users, label: "Barberos", path: "admin/barbers" },
        { icon: Calendar, label: "Horarios", path: "admin/schedules" },
        { icon: UserCircle, label: "Clientes", path: "admin/customers" },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate(`/${tenantSlug}/auth/login`);
    };

    return (
        <>
            <header
                className="w-full fixed top-0 left-0 z-50 shadow-lg text-white"
                style={{ backgroundColor: tenant?.primaryColor || tenant?.secondaryColor || '#2563eb' }}
            >
                <div className="flex items-center justify-between px-6 h-16">
                    <div className="flex items-center gap-4">
                        {tenant?.logoUrl && (
                            <img
                                src={tenant.logoUrl}
                                alt="Logo"
                                className="h-11 w-11 rounded-xl object-cover border-2 border-white/50 shadow-md"
                            />
                        )}
                        <div>
                            <span className="font-bold text-xl block leading-tight">
                                {tenant?.name ?? "Barbería"}
                            </span>
                            <span className="text-white/80 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                                ADMIN PANEL
                            </span>
                        </div>
                    </div>

                    <button
                        className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Menu lateral */}
            <nav
                className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${menuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header del menú */}
                <div className="p-5 flex items-center justify-between border-b border-gray-200 bg-primary/5">
                    <div className="flex items-center gap-3">
                        {tenant?.logoUrl && (
                            <img
                                src={tenant.logoUrl}
                                alt="Logo"
                                className="h-10 w-10 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <h3 className="font-bold text-gray-900">{tenant?.name}</h3>
                            <p className="text-sm text-gray-500">Administración</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Items del menú */}
                <div className="p-4 flex-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.includes(`/${tenantSlug}/${item.path}`);

                        return (
                            <Link
                                key={item.path}
                                to={`/${tenantSlug}/${item.path}`}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-colors mb-2 group ${isActive
                                    ? 'shadow-sm font-semibold'
                                    : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                                style={isActive ? {
                                    backgroundColor: 'rgba(var(--secondary-rgb, 37, 99, 235), 0.1)',
                                    color: 'var(--secondary-color, #2563eb)'
                                } : undefined}
                            >
                                <div
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${!isActive && 'bg-gray-100 text-gray-500'}`}
                                    style={isActive ? {
                                        backgroundColor: 'rgba(var(--secondary-rgb, 37, 99, 235), 0.1)',
                                        color: 'var(--secondary-color, #2563eb)'
                                    } : undefined}
                                >
                                    <Icon
                                        size={22}
                                        strokeWidth={2}
                                    />
                                </div>
                                <span className="flex-1">
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: 'var(--secondary-color, #2563eb)' }}
                                    />
                                )}
                            </Link>
                        );

                    })}
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 text-red-600 transition-colors group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LogOut size={22} />
                        </div>
                        <span className="font-semibold text-base">Cerrar Sesión</span>
                    </button>
                </div>
            </nav>

            {/* Espaciador */}
            <div className="h-[76px]"></div>
        </>
    );
}
