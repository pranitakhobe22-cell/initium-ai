import { useState, useCallback, useRef } from 'react';

const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  
  const synth = window.speechSynthesis;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const isVoiceSupported = !!synth && !!SpeechRecognition;

  const speak = useCallback((text, onEnd) => {
    if (!synth) {
      onEnd?.();
      return;
    }
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.95;
    
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utter.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    synth.speak(utter);
  }, [synth]);

  const stopSpeaking = useCallback(() => {
    if (synth) synth.cancel();
    setIsSpeaking(false);
  }, [synth]);

  const startListening = useCallback((onResult, onError) => {
    if (!SpeechRecognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    if (recognitionRef.current) recognitionRef.current.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript + ' ';
        else interim += transcript;
      }
      onResult({ final: final.trim(), interim: interim.trim() });
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      onError?.(e.error);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [SpeechRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isVoiceSupported,
    isListening,
    isSpeaking,
    speak,
    stopSpeaking,
    startListening,
    stopListening
  };
};

export default useVoice;
