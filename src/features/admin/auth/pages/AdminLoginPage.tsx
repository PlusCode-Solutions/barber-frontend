import { ShieldCheck } from 'lucide-react';
import AdminLoginForm from '../components/AdminLoginForm';

export default function AdminLoginPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
            style={{ backgroundImage: "url('/fondo.jpg')" }}
        >
            {/* Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-blue-900/30 backdrop-blur-sm"></div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* CARD PRINCIPAL */}
            <div className="
                relative 
                bg-gradient-to-br from-black/40 to-black/20
                backdrop-blur-2xl 
                px-8 py-10
                sm:px-12 sm:py-14
                rounded-3xl 
                shadow-2xl 
                w-full 
                max-w-md
                border border-white/20
                animate-fadeIn
                hover:border-blue-400/30
                transition-all duration-300
            ">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 blur-xl -z-10"></div>

                {/* ICON */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-blue-600 to-blue-500 p-4 rounded-2xl shadow-lg border border-blue-400/30">
                            <ShieldCheck size={40} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* TEXTOS */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white leading-tight drop-shadow-lg mb-2">
                        Sass Barber
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400"></div>
                        <p className="text-xs font-bold tracking-[0.2em] text-blue-300 uppercase">
                            Super Admin Portal
                        </p>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-400"></div>
                    </div>
                </div>

                {/* FORM */}
                <AdminLoginForm />

                {/* Footer decoration */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-center text-xs text-white/60">
                        Plataforma de Administración Centralizada
                    </p>
                </div>
            </div>
        </div>
    );
}
