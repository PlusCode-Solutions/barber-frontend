import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, CalendarCheck, Users, Scissors, Clock } from "lucide-react";
import { useTenant } from "../../context/TenantContext";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { tenant } = useTenant();

    const primary = tenant?.primaryColor ?? "#3b82f6";

    return (
        <header
            className="w-full fixed top-0 left-0 z-50 shadow-md"
            style={{ backgroundColor: primary }}
        >
            <div className="flex items-center justify-between px-4 py-3">

                {/* Logo + Nombre */}
                <div className="flex items-center gap-2">
                    {tenant?.logoUrl && (
                        <img
                            src={tenant.logoUrl}
                            className="h-8 w-8 rounded-full object-cover border border-white/40 shadow"
                        />
                    )}
                    <span className="text-white font-semibold text-lg tracking-tight">
                        {tenant?.name ?? "Barbería"}
                    </span>
                </div>

                {/* Botón mobile */}
                <button
                    className="text-white"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* MOBILE MENU */}
            {menuOpen && (
                <nav
                    className="flex flex-col gap-4 px-4 pb-5 pt-2 text-white text-base animate-slideDown"
                >
                    <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3"
                    >
                        <Home size={20} /> Inicio
                    </Link>

                    <Link
                        to="/dashboard/appointments"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3"
                    >
                        <CalendarCheck size={20} /> Citas
                    </Link>

                    <Link
                        to="/dashboard/barbers"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3"
                    >
                        <Users size={20} /> Barberos
                    </Link>

                    <Link
                        to="/dashboard/services"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3"
                    >
                        <Scissors size={20} /> Servicios
                    </Link>

                    <Link
                        to="/dashboard/schedule"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3"
                    >
                        <Clock size={20} /> Horarios
                    </Link>
                </nav>
            )}
        </header>
    );
}
