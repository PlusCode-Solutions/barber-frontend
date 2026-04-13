import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TenantsService } from "../../tenants/api/tenants.service";
import { ServicesService } from "../../services/api/services.service";
import { ProfessionalsService } from "../../professionals/api/professionals.service";
import type { Professional } from "../../professionals/types";
import type { Service } from "../../services/types";
// @ts-ignore
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

import {
    MapPin,
    Phone,
    ArrowRight,
    Scissors,
    Clock,
    User,
    X,
    Sparkles,
    Waves,
    Smile,
    Zap,
    Navigation
} from "lucide-react";

/**
 * Helper to get a dynamic icon based on service name
 */
const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("corte") || n.includes("haircut")) return <Scissors size={32} />;
    if (n.includes("barba") || n.includes("beard")) return <User size={32} />;
    if (n.includes("lavado") || n.includes("wash") || n.includes("agua")) return <Waves size={32} />;
    if (n.includes("facial") || n.includes("mascarilla") || n.includes("limpieza")) return <Smile size={32} />;
    if (n.includes("combo") || n.includes("especial") || n.includes("completo")) return <Sparkles size={32} />;
    if (n.includes("rapido") || n.includes("express")) return <Zap size={32} />;
    return <Scissors size={32} />; // Default
};

const LandingPage = () => {
    const { tenantSlug } = useParams<{ tenantSlug: string }>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [offsetY, setOffsetY] = useState(0);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    // Fetch Tenant Info
    const { data: tenant, isLoading: loadingTenant, isError: tenantError } = useQuery({
        queryKey: ["tenant", tenantSlug],
        queryFn: () => TenantsService.getBySlug(tenantSlug!),
        enabled: !!tenantSlug,
        retry: 1
    });

    // Fetch Services
    const { data: services } = useQuery<Service[]>({
        queryKey: ["services", tenantSlug],
        queryFn: () => ServicesService.getAll(tenantSlug!),
        enabled: !!tenant && !!tenantSlug
    });

    // Fetch Professionals
    const { data: professionals } = useQuery<Professional[]>({
        queryKey: ["professionals", tenantSlug],
        queryFn: () => ProfessionalsService.getAll(tenantSlug!),
        enabled: !!tenant && !!tenantSlug
    });

    // Auto-scroll removed as we switched to table layout
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove("opacity-0", "translate-y-10");
                    entry.target.classList.add("opacity-100", "translate-y-0");
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll(".reveal-on-scroll");
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [services, professionals, loadingTenant]);

    // Handle Navbar & Parallax Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            setOffsetY(window.scrollY);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (loadingTenant) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-4 text-center p-6">
            <div className="w-16 h-16 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="text-white font-black italic tracking-[0.2em] uppercase text-sm mt-4">Cargando Experiencia...</p>
        </div>
    );

    if (tenantError || !tenant) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-center p-6">
            <Scissors size={64} className="text-primary-500 mb-8 animate-bounce" />
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">Professionalía No Encontrada</h1>
            <p className="text-gray-400 max-w-md mx-auto mb-10 font-medium italic">
                No hemos podido encontrar la professionalía que buscas. Por favor, verifica el enlace e intenta de nuevo.
            </p>
            <Link to="/" className="px-10 py-4 bg-white text-black font-black uppercase text-sm rounded-full hover:bg-gray-200 transition-all">
                Volver al Inicio
            </Link>
        </div>
    );

    const primaryColor = tenant.primaryColor || "#000000";

    return (
        <div className="min-h-screen bg-black text-gray-900 font-sans selection:bg-white selection:text-black">

            {/* 1. Navigation (Premium Glassmorphism) */}
            <nav
                className={`fixed w-full z-50 transition-all duration-700 ${scrolled ? "py-4 border-b border-white/10" : "bg-transparent py-8 border-b border-transparent"}`}
                style={scrolled ? { 
                    backgroundColor: `${primaryColor}CC`, 
                    backdropFilter: 'blur(24px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                    boxShadow: `0 10px 40px -10px ${primaryColor}60`
                } : {}}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {tenant.logoUrl && <img src={tenant.logoUrl} alt="Logo" className="w-10 h-10 object-cover rounded-full border border-white/20" />}
                        <span className="text-2xl font-black italic tracking-tighter uppercase text-white">{tenant.name}</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-10">
                        <a href="#profesionales" className="text-xs font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors">Profesionales</a>
                        <a href="#servicios" className="text-xs font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors">Servicios</a>
                        <a href="#localizacion" className="text-xs font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors">Localización</a>
                        <Link
                            to={`/${tenant.slug}/auth/login`}
                            className="px-6 py-2.5 bg-white text-black rounded-full text-xs font-black uppercase hover:bg-gray-100 transition-all shadow-lg active:scale-95"
                        >
                            Iniciar Sesión
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white p-2 relative z-[60]">
                        <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}></div>
                        <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all ${isMenuOpen ? "opacity-0" : ""}`}></div>
                        <div className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></div>
                    </button>
                </div>

            </nav>

            {/* Mobile Menu Overlay - Moved to Root for absolute isolation */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center gap-12 p-10 animate-in fade-in duration-300">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-all"
                    >
                        <X size={48} />
                    </button>

                    <div className="flex flex-col items-center gap-10">
                        <a
                            href="#profesionales"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-4xl font-black italic uppercase tracking-tighter text-white hover:scale-110 transition-transform"
                        >
                            Profesionales
                        </a>
                        <a
                            href="#servicios"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-4xl font-black italic uppercase tracking-tighter text-white hover:scale-110 transition-transform"
                        >
                            Servicios
                        </a>
                        <a
                            href="#localizacion"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-4xl font-black italic uppercase tracking-tighter text-white hover:scale-110 transition-transform"
                        >
                            Localización
                        </a>
                    </div>

                    <Link
                        to={`/${tenant.slug}/auth/login`}
                        onClick={() => setIsMenuOpen(false)}
                        style={{ backgroundColor: primaryColor }}
                        className="px-14 py-5 text-white rounded-full text-xl font-black uppercase shadow-2xl active:scale-95 transition-all mt-4"
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            )}

            {/* 2. Hero Section (Parallax Effect) */}
            <header
                id="hero"
                className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
            >
                {/* 2.a Capa de Fondo Parallax */}
                <div 
                    className="absolute top-0 left-0 w-full h-[140%] bg-cover bg-center will-change-transform"
                    style={{
                        backgroundImage: `url(${tenant.backgroundUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2000'})`,
                        transform: `translateY(${offsetY * 0.4}px)`,
                    }}
                />
                
                {/* 2.b Filtros de Gradiente para contraste */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>

                {/* 2.c Contenido del Hero (se mueve normal) */}
                <div className="container mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-20">
                    <div className="mb-8 inline-block">
                        <div className="p-2 border border-white/20 rounded-full backdrop-blur-sm">
                            {tenant.logoUrl ? (
                                <img src={tenant.logoUrl} alt={tenant.name} className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-4 border-white shadow-2xl" />
                            ) : (
                                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-white text-black flex items-center justify-center text-7xl font-black italic shadow-2xl">
                                    {tenant.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase italic leading-tight text-shadow-xl">
                        {tenant.name}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 font-medium leading-relaxed drop-shadow-md">
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to={`/${tenant.slug}/auth/login`}
                            style={{ backgroundColor: primaryColor }}
                            className="px-10 py-5 text-white font-black text-lg rounded-full shadow-2xl hover:brightness-110 transition-all flex items-center gap-3 active:scale-95 group"
                        >
                            RESERVAR CITA <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2">
                    <div className="w-1 h-12 bg-gradient-to-b from-white/60 to-transparent rounded-full"></div>
                </div>
            </header>

            {/* Nueva Sección: Nuestra Historia */}
            {tenant.description && (
                <section id="historia" className="py-32 bg-gray-50 relative overflow-hidden">
                    {/* Elementos decorativos */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-black/5 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/5 blur-3xl"></div>
                    
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col items-center mb-16 text-center">
                                <span style={{ color: primaryColor }} className="font-black uppercase tracking-[0.4em] text-xs mb-4 block">
                                    Nuestra Historia
                                </span>
                                <h2 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter text-black leading-none reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700">
                                    Quiénes Somos
                                </h2>
                            </div>

                            <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
                                <div className="bg-white p-10 sm:p-16 rounded-[40px] shadow-2xl shadow-black/5 border border-white relative mt-10">
                                    {/* Floating Quote Icon */}
                                    <div 
                                        className="absolute -top-10 left-10 md:left-16 w-20 h-20 rounded-[20px] flex items-center justify-center text-white shadow-xl rotate-12 hover:rotate-0 transition-all duration-500"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                        </svg>
                                    </div>

                                    <div className="mt-6 relative z-10">
                                        <p className="text-xl sm:text-[22px] text-gray-700 font-medium leading-relaxed italic whitespace-pre-wrap">
                                            {tenant.description}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-gray-100 pt-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-gray-200 p-1">
                                                {tenant.logoUrl ? (
                                                    <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="w-full h-full bg-black text-white flex items-center justify-center rounded-full font-black italic text-xl">
                                                        {tenant.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black uppercase tracking-tight text-black leading-none mb-1">{tenant.name}</h4>
                                                <p style={{ color: primaryColor }} className="text-[10px] font-black uppercase tracking-widest">Atención de Excelencia</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Profesionales Section */}
            {professionals && professionals.length > 0 && (
                <section id="profesionales" className="py-48 bg-gray-50 overflow-hidden relative border-t-8 border-white">
                    <div className="absolute top-0 left-0 w-full h-8 bg-white/50 skew-y-1 origin-top-left"></div>
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center mb-10 md:mb-20 text-center">
                            <span style={{ color: primaryColor }} className="font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs mb-3 md:mb-4">Conoce a los</span>
                            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-black mb-6 md:mb-10 leading-[0.9]">Profesionales</h2>
                            <div className="flex items-center gap-4">
                                <div style={{ backgroundColor: primaryColor }} className="h-1.5 w-16 rounded-full"></div>
                                <div className="h-1.5 w-4 bg-gray-200 rounded-full"></div>
                                <div className="h-1.5 w-4 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>

                        <div className={`flex flex-wrap items-center justify-center gap-12 ${professionals.length === 1 ? "max-w-md mx-auto" :
                            professionals.length === 2 ? "max-w-3xl mx-auto" : ""
                            }`}>
                            {professionals.map((professional, index) => (
                                <div
                                    key={professional.id}
                                    className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 group relative flex-1 min-w-[280px] max-w-[320px]"
                                    style={{ transitionDelay: `${index * 150}ms` }}
                                >
                                    <div className="relative h-[480px] rounded-[50px] overflow-hidden shadow-2xl border-4 border-white group-hover:border-white transition-all duration-500">
                                        {professional.avatar ? (
                                            <img src={professional.avatar} alt={professional.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                <User size={120} />
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/40 to-transparent pt-32">
                                            <h3 className="text-3xl font-black uppercase text-white tracking-tight mb-2 leading-none">{professional.name}</h3>
                                            <p style={{ color: primaryColor }} className="font-black uppercase text-[10px] tracking-[0.2em]">{professional.specialty || "Professionalía Pro"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. Servicios Section */}
            <section id="servicios" className="py-48 bg-white selection:bg-black selection:text-white relative overflow-hidden border-t-8 border-gray-50">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center mb-32 text-center">
                        <span style={{ color: primaryColor }} className="font-black uppercase tracking-[0.4em] text-xs mb-6 block">Menú de Estilo</span>
                        <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-black leading-[0.9] mb-8">Nuestros Servicios</h2>
                        <div className="max-w-2xl h-1 bg-gray-100 rounded-full w-full relative overflow-hidden">
                            <div style={{ backgroundColor: primaryColor }} className="absolute inset-y-0 left-0 w-1/4"></div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {services && services.length > 0 ? (
                            services.map((service, index) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 group grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-6 p-8 bg-white rounded-[35px] border-2 transition-all duration-500 cursor-pointer shadow-md hover:shadow-2xl"
                                    style={{
                                        transitionDelay: `${index * 50}ms`,
                                        borderColor: `${primaryColor}20`,
                                        borderLeft: `8px solid ${primaryColor}`
                                    }}
                                >
                                    {/* Icon Container */}
                                    <div className="w-16 h-16 bg-white border border-gray-100 text-black rounded-[20px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0">
                                        {getServiceIcon(service.name)}
                                    </div>

                                    {/* Info Container */}
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-black leading-tight mb-2">
                                            {service.name}
                                        </h3>
                                        <p className="text-gray-400 font-medium italic text-xs leading-relaxed line-clamp-2">
                                            {service.description || "Resultado impecable garantizado por nuestros expertos."}
                                        </p>
                                    </div>

                                    {/* Price & Action Container */}
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 shrink-0">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                            <Clock size={12} /> {service.durationMinutes} min
                                        </div>
                                        <span style={{ color: primaryColor }} className="text-3xl font-black italic tracking-tighter">
                                            ₡{service.price}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic animate-pulse">
                                Próximamente nuevos servicios...
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 5. Localización Section */}
            <section id="localizacion" className="py-24 md:py-48 bg-gray-50 text-black border-t-8 border-white">
                <div className="container mx-auto px-6">
                    {/* Centered Title */}
                    <div className="flex flex-col items-center mb-16 md:mb-32 text-center">
                        <span style={{ color: primaryColor }} className="font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 md:mb-6 block">Encuéntranos</span>
                        <h2 className="text-5xl sm:text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-black leading-[0.9] mb-8">Ubicación</h2>
                        <div className="flex items-center gap-4">
                            <div className="h-1.5 w-4 bg-gray-200 rounded-full"></div>
                            <div style={{ backgroundColor: primaryColor }} className="h-1.5 w-16 rounded-full"></div>
                            <div className="h-1.5 w-4 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
                        {/* Map side */}
                        <div className="w-full lg:w-3/5 rounded-[60px] overflow-hidden shadow-2xl border-[15px] border-white h-[600px] group relative z-0">
                            {tenant.latitude && tenant.longitude ? (
                                <MapContainer
                                    center={[tenant.latitude, tenant.longitude]}
                                    zoom={16}
                                    scrollWheelZoom={false}
                                    dragging={!L.Browser.mobile}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[tenant.latitude, tenant.longitude]} />
                                </MapContainer>
                            ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                    <p className="text-gray-400 italic text-xl tracking-widest font-black uppercase">Ubicación No Disponible</p>
                                </div>
                            )}
                        </div>

                        {/* Info side */}
                        <div className="w-full lg:w-2/5 reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000">
                            <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-8 leading-none text-black/80">Cómo Llegar</h3>

                            <div className="space-y-10 mb-14">
                                <div className="flex items-start gap-6">
                                    <div style={{ border: `1px solid ${primaryColor}40` }} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                        <MapPin size={28} style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p style={{ color: primaryColor }} className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Visítanos en</p>
                                        <p className="text-2xl font-black uppercase tracking-tight text-black leading-tight">{tenant.address || "No disponible"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div style={{ border: `1px solid ${primaryColor}40` }} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                        <Phone size={28} style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p style={{ color: primaryColor }} className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Reserva por teléfono</p>
                                        <p className="text-2xl font-black uppercase tracking-tight text-black leading-tight">{tenant.phone || "No disponible"}</p>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={tenant.latitude && tenant.longitude
                                    ? `https://www.google.com/maps/dir/?api=1&destination=${tenant.latitude},${tenant.longitude}`
                                    : (tenant.googleMapsUrl || "#")
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ backgroundColor: primaryColor }}
                                className="inline-flex items-center gap-4 px-12 py-6 text-white rounded-3xl font-black uppercase text-lg hover:brightness-110 transition-all shadow-2xl group active:scale-95"
                            >
                                <Navigation size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Trazar Ruta en GPS
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Footer */}
            <footer className="py-20 bg-white border-t-8 border-gray-50 text-black text-center">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-4">
                            <span style={{ color: primaryColor }} className="text-4xl font-black italic tracking-tighter uppercase">{tenant.name}</span>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">&copy; {new Date().getFullYear()} - Red de Profesionales</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Service Detail Modal */}
            {selectedService && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/95 backdrop-blur-md"
                        onClick={() => setSelectedService(null)}
                    ></div>
                    <div className="bg-white border border-black/5 w-full max-w-xl rounded-[50px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300 relative z-10 transition-all">
                        <button
                            onClick={() => setSelectedService(null)}
                            className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="p-12">
                            <div className="w-24 h-24 bg-gray-50 text-black border border-gray-100 rounded-[35px] flex items-center justify-center mb-10 shadow-sm">
                                {getServiceIcon(selectedService.name)}
                            </div>

                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Detalle del Servicio</p>
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-black mb-4 leading-none">
                                {selectedService.name}
                            </h2>
                            <div className="flex items-center gap-6 mb-10">
                                <span style={{ color: primaryColor }} className="text-4xl font-black italic tabular-nums leading-none">
                                    ${selectedService.price}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] bg-gray-100 px-4 py-2 rounded-full">
                                    <Clock size={16} /> {selectedService.durationMinutes} min
                                </span>
                            </div>

                            <div className="space-y-6">
                                <p style={{ borderLeft: `4px solid ${primaryColor}` }} className="text-gray-600 text-xl font-medium leading-relaxed italic pl-6">
                                    {selectedService.description || "Calidad y precisión garantizada."}
                                </p>
                            </div>

                            <div className="mt-14 flex flex-col gap-4">
                                <Link
                                    to={`/${tenant.slug}/auth/login`}
                                    style={{ backgroundColor: primaryColor }}
                                    className="w-full py-6 text-white font-black uppercase text-lg rounded-3xl hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98] text-center shadow-2xl"
                                >
                                    Reservar Cita
                                </Link>
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="w-full py-4 text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-black transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
