import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getSpeechConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechInput(onTranscript: (text: string) => void) {
  const [isSupported] = useState<boolean>(() => getSpeechConstructor() !== null);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const callbackRef = useRef(onTranscript);
  callbackRef.current = onTranscript;

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    const Ctor = getSpeechConstructor();
    if (!Ctor) {
      setFeedback('Voice input is not supported in this browser. Type your question instead.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const rec = new Ctor();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const lastIdx = event.results.length - 1;
        const transcript = event.results[lastIdx]?.[0]?.transcript?.trim();
        if (transcript) {
          callbackRef.current(transcript);
          setFeedback(null);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setFeedback('Microphone permission was denied. Type your message instead.');
        } else if (event.error === 'no-speech') {
          setFeedback('No speech detected. Please try again or type your message.');
        } else {
          setFeedback('Voice capture unavailable right now. Type your question instead.');
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      setFeedback(null);
      setIsListening(true);
      rec.start();
    } catch {
      setIsListening(false);
      setFeedback('Unable to start browser speech recognition. Type your question instead.');
    }
  }, [isListening]);

  return {
    isSupported,
    isListening,
    feedback,
    clearFeedback: () => setFeedback(null),
    toggleListening,
    stopListening,
  };
}
