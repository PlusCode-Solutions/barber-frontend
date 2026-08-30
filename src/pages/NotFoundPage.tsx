import { Link } from "react-router-dom";
import { Scissors } from "lucide-react";

/**
 * 404 Page - Shown by the client router for unmatched paths.
 * Visual counterpart of public/404.html (served by the server with a real HTTP 404).
 */
export default function NotFoundPage() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-center p-6">
            <Scissors size={64} className="text-primary-500 mb-8 animate-bounce" />
            <h1 className="text-8xl font-black italic uppercase tracking-tighter text-white mb-6">
                404
            </h1>
            <h2 className="text-3xl font-black italic uppercase tracking-tight text-white mb-4">
                Profesionalía No Encontrada
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-10 font-medium italic">
                La página o professionalía que buscas no existe o fue movida. Verifica
                el enlace e intenta de nuevo.
            </p>
            <Link
                to="/"
                className="px-10 py-4 bg-white text-black font-black uppercase text-sm rounded-full hover:bg-gray-200 transition-all"
            >
                Volver al Inicio
            </Link>
        </div>
    );
}