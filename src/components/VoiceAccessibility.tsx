import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Square, Volume2 } from 'lucide-react';
import type { Language } from '../types/platform';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function getSpeechLangCode(lang: Language): string {
  if (lang === 'bn') return 'bn-IN';
  if (lang === 'hi') return 'hi-IN';
  return 'en-IN';
}

export function useVoiceRecognition(
  lang: Language,
  onTranscript?: (finalText: string) => void
) {
  const [supported] = useState<boolean>(() => Boolean(getSpeechRecognitionCtor()));
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError(
        lang === 'bn'
          ? 'এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। অনুগ্রহ করে নিচে টাইপ করুন।'
          : lang === 'hi'
            ? 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया नीचे टाइप करें।'
            : 'Voice input is not supported in this browser. Please type your message below.'
      );
      return;
    }

    try {
      recognitionRef.current?.abort();
      const recognition = new Ctor();
      recognition.lang = getSpeechLangCode(lang);
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setInterimText('');
      };

      recognition.onresult = (event) => {
        let combined = '';
        let finalStr = '';
        for (let i = 0; i < event.results.length; i++) {
          const chunk = event.results[i][0]?.transcript || '';
          combined += chunk;
          if (event.results[i].isFinal) {
            finalStr += chunk;
          }
        }
        setInterimText(combined.trim());
        if (finalStr.trim() && onTranscriptRef.current) {
          onTranscriptRef.current(finalStr.trim());
        }
      };

      recognition.onerror = (event) => {
        setListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError(
            lang === 'bn'
              ? 'মাইক্রোফোন অনুমতি পাওয়া যায়নি। নিচে টাইপ করে প্রশ্ন করতে পারেন।'
              : lang === 'hi'
                ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। आप नीचे टाइप करके पूछ सकते हैं।'
                : 'Microphone permission was denied. You can continue by typing below.'
          );
        } else if (event.error === 'no-speech') {
          setError(
            lang === 'bn'
              ? 'কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন অথবা টাইপ করুন।'
              : lang === 'hi'
                ? 'कोई आवाज़ सुनाई नहीं दी। दोबारा कोशिश करें या टाइप करें।'
                : 'No speech detected. Please try again or type below.'
          );
        } else {
          setError(
            lang === 'bn'
              ? 'ভয়েস চালু করা যায়নি। অনুগ্রহ করে টাইপ করে জিজ্ঞাসা করুন।'
              : lang === 'hi'
                ? 'वॉइस शुरू नहीं हो सका। कृपया टाइप करके पूछें।'
                : 'Could not start voice input. Please type your question.'
          );
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
      setError(
        lang === 'bn'
          ? 'ভয়েস ইনপুট এখন উপলব্ধ নয়। অনুগ্রহ করে টাইপ করুন।'
          : 'Voice input is currently unavailable. Please type your question.'
      );
    }
  }, [lang]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return {
    supported,
    listening,
    interimText,
    error,
    startListening,
    stopListening,
    clearError: () => setError(null),
  };
}

export function VoiceInputButton({
  lang,
  onResult,
  size = 'md',
  label,
}: {
  lang: Language;
  onResult: (text: string) => void;
  size?: 'md' | 'lg';
  label?: string;
}) {
  const { supported, listening, interimText, error, startListening, stopListening } =
    useVoiceRecognition(lang, onResult);

  const defaultLabel =
    lang === 'bn'
      ? listening
        ? 'শুনছি... থামাতে চাপুন'
        : 'বাংলায় বলুন'
      : lang === 'hi'
        ? listening
          ? 'सुन रहे हैं... रोकने के लिए दबाएं'
          : 'बोलकर पूछें'
        : listening
          ? 'Listening... Tap to stop'
          : 'Speak Your Question';

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        aria-pressed={listening}
        aria-label={label || defaultLabel}
        className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all cursor-pointer ${
          size === 'lg'
            ? 'px-6 py-4 text-base min-h-[56px] w-full sm:w-auto'
            : 'px-4 py-2.5 text-sm min-h-[44px]'
        } ${
          listening
            ? 'bg-red-600 text-white hover:bg-red-700 ring-4 ring-red-200'
            : supported
              ? 'bg-[#176B4D] text-white hover:bg-[#11533B]'
              : 'bg-[#F5F4EF] text-[#5C5C58] border border-[#E5E3DC]'
        }`}
      >
        {listening ? (
          <MicOff className={size === 'lg' ? 'w-5 h-5 animate-pulse' : 'w-4 h-4 animate-pulse'} />
        ) : (
          <Mic className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        )}
        <span>{label || defaultLabel}</span>
      </button>
      {listening && interimText && (
        <p className="text-xs text-[#176B4D] bg-[#EBF4F0] px-3 py-1.5 rounded-lg">
          “{interimText}”
        </p>
      )}
      {error && (
        <p className="text-xs text-[#8A4E08] bg-[#FEF4E6] border border-[#F4A340]/40 px-3 py-1.5 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}

export function ReadAloudButton({
  text,
  lang,
  compact = false,
}: {
  text: string;
  lang: Language;
  compact?: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<{ key: string; url: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stopAll = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setLoadingAudio(false);
    setSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAll();
      if (cacheRef.current?.url) {
        URL.revokeObjectURL(cacheRef.current.url);
      }
    };
  }, [stopAll]);

  if (!text.trim()) return null;

  const fallbackBrowserSpeak = (cleanText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeaking(false);
      return;
    }
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLang = getSpeechLangCode(lang);
      utterance.lang = targetLang;
      utterance.rate = 0.92;

      const voices = synth.getVoices?.() || [];
      const exactVoice =
        voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(lang)) ||
        (lang === 'bn'
          ? voices.find((v) => /bengali|bangla/i.test(v.name))
          : lang === 'hi'
            ? voices.find((v) => /hindi/i.test(v.name))
            : undefined);
      if (exactVoice) utterance.voice = exactVoice;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      synth.speak(utterance);
    } catch {
      setSpeaking(false);
    }
  };

  const playAudioUrl = async (url: string) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      setSpeaking(false);
      audioRef.current = null;
    };
    audio.onerror = () => {
      setSpeaking(false);
      audioRef.current = null;
    };
    setSpeaking(true);
    await audio.play();
  };

  const toggleSpeak = async () => {
    if (speaking || loadingAudio) {
      stopAll();
      return;
    }

    stopAll();
    const cleanText = text
      .replace(/[*#`_~>|]+/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanText) return;

    const cacheKey = `${lang}:${cleanText.slice(0, 850)}`;
    if (cacheRef.current && cacheRef.current.key === cacheKey) {
      try {
        await playAudioUrl(cacheRef.current.url);
        return;
      } catch {
        // fall through to regenerate
      }
    }

    // Use server-side Gemini Neural TTS first so Bengali (বাংলা) & Hindi speak naturally
    // on every browser/OS even when local OS voice packs are missing.
    setLoadingAudio(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText.slice(0, 850), language: lang }),
        signal: controller.signal,
      });
      if (!resp.ok) throw new Error('TTS unavailable');
      const data = (await resp.json()) as { audioBase64?: string; mimeType?: string };
      if (!data.audioBase64) throw new Error('Empty audio');

      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const blobUrl = URL.createObjectURL(blob);

      if (cacheRef.current?.url) {
        URL.revokeObjectURL(cacheRef.current.url);
      }
      cacheRef.current = { key: cacheKey, url: blobUrl };
      setLoadingAudio(false);
      await playAudioUrl(blobUrl);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setLoadingAudio(false);
      // Graceful offline/fallback to native browser speech synthesis
      fallbackBrowserSpeak(cleanText);
    }
  };

  const label = loadingAudio
    ? lang === 'bn'
      ? 'অডিও তৈরি হচ্ছে...'
      : lang === 'hi'
        ? 'ऑडियो बन रहा है...'
        : 'Preparing Voice...'
    : speaking
      ? lang === 'bn'
        ? 'পড়া থামান'
        : lang === 'hi'
          ? 'रोकें'
          : 'Stop Reading'
      : lang === 'bn'
        ? 'বাংলায় শুনুন'
        : lang === 'hi'
          ? 'सुनें'
          : 'Read Aloud';

  return (
    <button
      type="button"
      onClick={toggleSpeak}
      aria-pressed={speaking}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
        compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs min-h-[40px]'
      } ${
        speaking || loadingAudio
          ? 'bg-[#FEF4E6] dark:bg-amber-950/60 border-[#FF8A18] text-[#8A4E08] dark:text-[#FFC45C]'
          : 'bg-white/90 dark:bg-slate-900/80 border-sky-200 dark:border-cyan-400/35 text-[#092B55] dark:text-cyan-200 hover:bg-sky-50 dark:hover:bg-slate-800'
      }`}
    >
      {speaking ? (
        <Square className="w-3.5 h-3.5 fill-current" />
      ) : (
        <Volume2 className={`w-3.5 h-3.5 ${loadingAudio ? 'animate-pulse' : ''}`} />
      )}
      <span>{label}</span>
    </button>
  );
}
