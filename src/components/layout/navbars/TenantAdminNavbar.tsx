import { Link, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, Users, Scissors, Calendar, FileText, UserCircle, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function TenantAdminNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { tenantSlug } = useParams();
    const navigate = useNavigate();

    const navItems = [
        { path: `/${tenantSlug}/admin/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { path: `/${tenantSlug}/admin/barbers`, label: 'Barberos', icon: Users },
        { path: `/${tenantSlug}/admin/services`, label: 'Servicios', icon: Scissors },
        { path: `/${tenantSlug}/admin/schedules`, label: 'Horarios', icon: Calendar },
        { path: `/${tenantSlug}/admin/bookings`, label: 'Citas', icon: FileText },
        { path: `/${tenantSlug}/admin/customers`, label: 'Clientes', icon: UserCircle },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate(`/${tenantSlug}/login`);
    };

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <Scissors size={28} className="text-blue-200" />
                        <div>
                            <h1 className="text-xl font-bold capitalize">{tenantSlug}</h1>
                            <p className="text-xs text-blue-200">Admin Panel</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                            >
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        ))}

                        <Link
                            to={`/${tenantSlug}/admin/settings`}
                            className="p-2 rounded-lg hover:bg-white/10 transition"
                            title="Settings"
                        >
                            <Settings size={20} />
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                        >
                            <LogOut size={18} />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-white/10"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="lg:hidden pb-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                        <Link
                            to={`/${tenantSlug}/admin/settings`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
                        >
                            <Settings size={20} />
                            <span className="font-medium">Settings</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
