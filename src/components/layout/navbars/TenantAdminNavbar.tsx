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

    const primary = tenant?.primaryColor ?? "#3b82f6";

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
                className="w-full fixed top-0 left-0 z-50 shadow-lg"
                style={{ backgroundColor: primary }}
            >
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        {tenant?.logoUrl && (
                            <img
                                src={tenant.logoUrl}
                                alt="Logo"
                                className="h-11 w-11 rounded-xl object-cover border-2 border-white/50 shadow-md"
                            />
                        )}
                        <div>
                            <span className="text-white font-bold text-xl block leading-tight">
                                {tenant?.name ?? "Barbería"}
                            </span>
                            <span className="text-white/80 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                                ADMIN PANEL
                            </span>
                        </div>
                    </div>

                    <button
                        className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95"
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
                <div
                    className="p-5 flex items-center justify-between border-b border-gray-200"
                    style={{ backgroundColor: `${primary}08` }}
                >
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
                                className={`flex items-center gap-4 p-4 rounded-xl transition-colors mb-2 group ${isActive ? 'shadow-md' : 'hover:bg-gray-50'
                                    }`}
                                style={isActive ? { backgroundColor: `${primary}10` } : {}}
                            >
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                                    style={{
                                        backgroundColor: isActive ? primary : `${primary}15`,
                                    }}
                                >
                                    <Icon
                                        size={22}
                                        style={{ color: isActive ? 'white' : primary }}
                                        strokeWidth={2}
                                    />
                                </div>
                                <span
                                    className="font-semibold text-base flex-1"
                                    style={{ color: isActive ? primary : '#374151' }}
                                >
                                    {item.label}
                                </span>
                                <svg
                                    className="w-5 h-5"
                                    style={{ color: isActive ? primary : '#9ca3af' }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
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
