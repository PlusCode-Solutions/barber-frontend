import { useState } from 'react';
import { useChocoVoice } from '../hooks/useChocoVoice';
import { Mic, MicOff, X } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

export const ChocoAssistant = ({ userRole }: { userRole: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { status, startListening, cancelSpeech, lastTranscript, response, errorMessage } = useChocoVoice('tony'); // Slug dinámico si tienes auth
    const { tenant } = useTenant();

    // Solo mostrar para ADMIN
    if (userRole !== 'TENANT_ADMIN') return null;

    const primaryColor = tenant?.primaryColor || '#1a1a1dff'; // Indigo-600 fallback
    const secondaryColor = tenant?.secondaryColor || '#ec4899'; // Pink-500 fallback

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* --- PANEL DE CHAT (EXPANDIDO) --- */}
            {isOpen && (
                <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-10">
                    {/* Header */}
                    <div
                        className="p-4 flex justify-between items-center text-white"
                        style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💈</span>
                            <h3 className="font-bold">Choco Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                            <X size={18} />
                        </button>
                    </div>
                    {/* Body */}
                    <div className="p-4 min-h-[150px] max-h-[300px] overflow-y-auto bg-gray-50">
                        {errorMessage && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                ⚠️ {errorMessage}
                            </div>
                        )}
                        {status === 'IDLE' && !response && !errorMessage && (
                            <p className="text-gray-400 text-center text-sm mt-4">
                                Presiona el micrófono y di "Choco..."
                            </p>
                        )}
                        {/* Transcripción del usuario */}
                        {lastTranscript && (
                            <div className="mb-2 flex justify-end">
                                <span
                                    className="text-white px-3 py-1 rounded-lg text-sm rounded-tr-none shadow-sm"
                                    style={{ backgroundColor: secondaryColor }}
                                >
                                    "{lastTranscript}"
                                </span>
                            </div>
                        )}
                        {/* Respuesta de Choco */}
                        {response && (
                            <div className="mb-2 flex justify-start">
                                <span className="bg-white border text-gray-800 px-3 py-2 rounded-lg text-sm rounded-tl-none shadow-sm">
                                    {status === 'PROCESSING' ? '🧠 Pensando...' : `🤖 ${response}`}
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Footer / Controles */}
                    <div className="p-4 bg-white border-t flex justify-center py-6">
                        {status === 'SPEAKING' ? (
                            <button
                                onClick={cancelSpeech}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg animate-pulse"
                            >
                                <MicOff size={20} /> "Choco Pare"
                            </button>
                        ) : (
                            <button
                                onClick={status === 'LISTENING' ? cancelSpeech : startListening}
                                className={`
                                    flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all
                                    text-white
                                    ${status === 'LISTENING' ? 'scale-110 ring-4 ring-red-200 bg-red-500' : ''}
                                `}
                                style={status !== 'LISTENING' ? { backgroundColor: primaryColor } : {}}
                            >
                                <Mic size={28} className={status === 'LISTENING' ? 'animate-bounce' : ''} />
                            </button>
                        )}
                    </div>
                </div>
            )}
            {/* --- BURBUJA FLOTANTE (CERRADO) --- */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: primaryColor }}
                >
                    <span className="text-2xl">💈</span>
                </button>
            )}
        </div>
    );
};
