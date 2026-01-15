import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, BarChart, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function SuperAdminNavbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart },
        { path: '/admin/tenants', label: 'Tenants', icon: Building2 }
    ];

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <>
            <header className="w-full fixed top-0 left-0 z-50 bg-gradient-to-r from-blue-700 to-blue-600 shadow-xl text-white border-b border-blue-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/admin/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                                <ShieldCheck size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Sass Barber</h1>
                                <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">Super Admin</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-4">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${isActive
                                            ? 'bg-white text-blue-700 shadow-lg'
                                            : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                                            }`}
                                    >
                                        <item.icon size={20} strokeWidth={2.5} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            <div className="h-8 w-px bg-white/20 mx-2"></div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl font-medium"
                            >
                                <LogOut size={20} strokeWidth={2.5} />
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
                        >
                            {menuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm md:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar (Right Drawer) */}
            <nav
                className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-blue-700 to-blue-800 z-50 shadow-2xl transform transition-transform duration-300 flex flex-col md:hidden border-l border-blue-500 ${menuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Drawer Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/10 bg-black/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                            <ShieldCheck size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Super Admin</h3>
                            <p className="text-xs text-blue-200">Control Panel</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-xl text-white transition-all backdrop-blur-sm"
                    >
                        <X size={22} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Drawer Items */}
                <div className="p-5 flex-1 overflow-y-auto space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-white text-blue-700 shadow-lg font-semibold'
                                        : 'text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm'
                                    }`}
                            >
                                <item.icon
                                    size={24}
                                    strokeWidth={2.5}
                                    className={`${isActive ? 'text-blue-700' : 'text-blue-200'} transition-colors`}
                                />
                                <span className="text-base">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-700 shadow-lg" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Drawer Footer */}
                <div className="p-5 border-t border-white/10 bg-black/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 rounded-xl text-white bg-red-500 hover:bg-red-600 transition-all font-semibold shadow-lg group"
                    >
                        <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
                            <LogOut size={20} strokeWidth={2.5} />
                        </div>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </nav>

            {/* Spacer for Fixed Header */}
            <div className="h-16"></div>
        </>
    );
}
