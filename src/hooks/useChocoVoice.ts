import { useState, useEffect, useRef, useCallback } from 'react';
import client from '../lib/axios';

export const useChocoVoice = (tenantSlug: string = 'tony') => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING'>('IDLE');
    const [lastTranscript, setLastTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    const recognitionRef = useRef<any>(null);

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-US'; // O es-CR si lo soporta tu OS
        
        utterance.onstart = () => {
                setIsSpeaking(true);
                setStatus('SPEAKING');
        };
        
        utterance.onend = () => {
                setIsSpeaking(false);
                setStatus('IDLE');
        };
        window.speechSynthesis.speak(utterance);
    };

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const cancelSpeech = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setStatus('IDLE');
        // Opcional: Parar el reconocimiento también o dejarlo listo para la próxima
        if(recognitionRef.current) recognitionRef.current.abort();
    }, []);

    useEffect(() => {
        // Inicializar SpeechRecognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognition) {

            const recognition = new SpeechRecognition();
            recognition.continuous = false; // Cambiamos a false para evitar problemas de red en bucle
            recognition.lang = 'es-ES'; // Cambiamos a es-ES para mayor compatibilidad
            recognition.interimResults = true; 
            
            recognition.onstart = () => {

                setIsListening(true);
                setStatus('LISTENING');
                setErrorMessage('');
            };

            recognition.onerror = (event: any) => {

                setStatus('IDLE');
                setIsListening(false);
                
                if (event.error === 'network') {
                    setErrorMessage('Problema de conexión. Verifica tu internet.');
                } else if (event.error === 'not-allowed') {
                    setErrorMessage('Permiso de micrófono denegado.');
                } else if (event.error === 'no-speech') {
                    setErrorMessage('No se escuchó nada. Intenta de nuevo.');
                } else {
                    setErrorMessage(`Error: ${event.error}`);
                }
            };

            recognition.onend = () => {

                setIsListening(false);
                setStatus('IDLE');
            };

            recognition.onresult = async (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const t = event.results[i][0].transcript.toLowerCase();
                    if (event.results[i].isFinal) finalTranscript += t;
                    else interimTranscript += t;
                }
                const fullText = finalTranscript || interimTranscript;
                setLastTranscript(fullText);
                
                // 🛑 COMANDO DE INTERRUPCIÓN
                if (fullText.includes('choco pare') || fullText.includes('basta') || fullText.includes('silencio')) {
                    cancelSpeech();
                    return;
                }
                // ⚡ COMANDO DE CONSULTA (Solo si es final)
                if (finalTranscript.includes('choco') && !finalTranscript.includes('pare')) {
                    // Detener escucha activa para procesar
                    if (recognitionRef.current) recognitionRef.current.stop();
                    setStatus('PROCESSING');
                    
                    try {
                        const { data } = await client.post('/voice/query', {
                            text: finalTranscript,
                            tenantSlug
                        });
                        setResponse(data.phrase);
                        speak(data.phrase);
                    } catch (error) {

                        setStatus('IDLE');
                        setResponse("Error de conexión");
                        speak("Lo siento, hubo un error conectando con el servidor.");
                    }
                }
            };
            recognitionRef.current = recognition;
        } else {

        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [tenantSlug, cancelSpeech]); // Removed status from dependencies

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setStatus('LISTENING');
            } catch(e) { }
        }
    }, []);

    return {
        isListening,
        isSpeaking,
        status,
        lastTranscript,
        response,
        errorMessage,
        startListening,
        stopListening,
        cancelSpeech
    };
};
