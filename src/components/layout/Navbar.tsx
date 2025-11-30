import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="w-full bg-black text-white shadow-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between p-4">

                {/* Logo */}
                <Link to="/dashboard" className="text-xl font-bold tracking-tight">
                    Barber <span className="text-blue-400">SaaS</span>
                </Link>

                {/* Botón Menu (solo móvil) */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Menu Desktop */}
                <nav className="hidden md:flex gap-6 text-sm">
                    <Link to="/dashboard" className="hover:text-gray-300">Inicio</Link>
                    <Link to="/dashboard/appointments" className="hover:text-gray-300">Citas</Link>
                    <Link to="/dashboard/barbers" className="hover:text-gray-300">Barberos</Link>
                    <Link to="/dashboard/services" className="hover:text-gray-300">Servicios</Link>
                    <Link to="/dashboard/schedule" className="hover:text-gray-300">Horarios</Link>
                </nav>

            </div>

            {/* Menu móvil */}
            {menuOpen && (
                <nav className="md:hidden bg-black text-white px-4 pb-4 flex flex-col gap-4 text-lg animate-fadeIn">
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Inicio</Link>
                    <Link to="/dashboard/appointments" onClick={() => setMenuOpen(false)}>Citas</Link>
                    <Link to="/dashboard/barbers" onClick={() => setMenuOpen(false)}>Barberos</Link>
                    <Link to="/dashboard/services" onClick={() => setMenuOpen(false)}>Servicios</Link>
                    <Link to="/dashboard/schedule" onClick={() => setMenuOpen(false)}>Horarios</Link>
                </nav>
            )}
        </header>
    );
}
