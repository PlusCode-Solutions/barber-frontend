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

    // Initial browser support check
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setErrorMessage("Solo integrado en navegador Chrome. Próximamente demás navegadores.");
        }
    }, []);

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-US'; 
        
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
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore stop errors
            }
            setIsListening(false);
        }
    }, []);

    const cancelSpeech = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setStatus('IDLE');
        if(recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) { }
        }
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setErrorMessage("Solo integrado en navegador Chrome. Próximamente demás navegadores.");
            return;
        }

        // Re-initialize for each session to ensure freshness, especially on Safari
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = navigator.language || 'es-ES'; // Use system language
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setStatus('LISTENING');
            setErrorMessage('');
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Error:", event.error);
            setIsListening(false);
            setStatus('IDLE');
            
            if (event.error === 'network') {
                // On Linux, 'network' often means "Missing API Keys" in Chromium/Brave
                setErrorMessage("Solo integrado en navegador Chrome. Próximamente demás navegadores.");
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setErrorMessage('Acceso al micrófono denegado. Verifica los permisos.');
            } else if (event.error === 'no-speech') {
                setErrorMessage(''); 
            } else if (event.error === 'aborted') {
                setErrorMessage('');
            } else {
                setErrorMessage(`Error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            if (status !== 'PROCESSING' && status !== 'SPEAKING') {
                 setStatus('IDLE');
            }
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
            
            if (fullText.includes('choco pare') || fullText.includes('basta') || fullText.includes('silencio')) {
                cancelSpeech();
                return;
            }

            if (finalTranscript.includes('choco')) {
                // Stop immediately to process
                try {
                     recognition.stop(); 
                } catch(e) {}
                
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
        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start recognition:", e);
        }

    }, [tenantSlug, cancelSpeech, status]); 

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
