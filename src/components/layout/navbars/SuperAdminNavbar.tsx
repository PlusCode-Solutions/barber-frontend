import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, BarChart, Settings, CreditCard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function SuperAdminNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart },
        { path: '/admin/tenants', label: 'Tenants', icon: Building2 },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/billing', label: 'Billing', icon: CreditCard },
        { path: '/admin/settings', label: 'Settings', icon: Settings }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <Building2 size={28} className="text-purple-200" />
                        <div>
                            <h1 className="text-xl font-bold">Super Admin</h1>
                            <p className="text-xs text-purple-200">Platform Control</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                            >
                                <item.icon size={18} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                        >
                            <LogOut size={18} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden pb-4 space-y-2">
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
