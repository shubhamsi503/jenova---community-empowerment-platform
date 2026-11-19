import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Send, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch, trackAnalyticsEvent } from '../lib/api';
import { PageHeader, ResilientImage, SafetyNotice } from '../components/SharedUI';
import { VISUAL_ASSETS } from '../lib/visualAssets';
import { ReadAloudButton, VoiceInputButton } from '../components/VoiceAccessibility';

interface SuggestedAction {
  label: string;
  path: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedActions?: SuggestedAction[];
}

export function AssistantPage() {
  const { language, setLanguage, t, navigate } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceNavHint, setVoiceNavHint] = useState<SuggestedAction | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const detectVoiceNavigation = (spoken: string): SuggestedAction | null => {
    const q = spoken.toLowerCase();
    if (/(প্রতারণা|সন্দেহজনক|scam|fraud|धोखाधड़ी)/i.test(q)) {
      return {
        label: language === 'bn' ? 'প্রতারণা যাচাই খুলুন' : 'Open Scam Checker',
        path: '/scam-check',
      };
    }
    if (/(ফোল্ডার|কাগজ|নথি|checklist|document|दस्तावेज़)/i.test(q)) {
      return {
        label: language === 'bn' ? 'ফোল্ডার চেক খুলুন' : 'Open Document Checklist',
        path: '/checklist',
      };
    }
    if (/(স্থানীয়|বিএসকে|bsk|bdo|local help|সাহায্য কেন্দ্র|स्थानीय सहायता)/i.test(q)) {
      return {
        label: language === 'bn' ? 'স্থানীয় সহায়তা কেন্দ্র খুলুন' : 'Open Local Assistance Finder',
        path: '/local-help',
      };
    }
    if (/(প্রকল্প|লক্ষ্মীর|কন্যাশ্রী|বিধবা|scheme|योजना)/i.test(q)) {
      return {
        label: language === 'bn' ? 'সরকারি প্রকল্প ডিরেক্টরি খুলুন' : 'Open Government Schemes',
        path: '/schemes',
      };
    }
    if (/(বায়োডাটা|সিভি|biodata|cv|resume)/i.test(q)) {
      return {
        label: language === 'bn' ? '১-মিনিট বায়োডাটা টুল খুলুন' : 'Open 1-Minute Biodata Builder',
        path: '/jobs/biodata',
      };
    }
    return null;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        language === 'bn'
          ? 'নমস্কার! আমি "JENOVA Voice" — আপনার বাংলা ভয়েস ও টেক্সট সহায়ক।\nনিচের বড় মাইক্রোফোন বোতামে চাপ দিয়ে বাংলায় বলুন অথবা টাইপ করুন: সরকারি প্রকল্প, কাগজপত্রের তালিকা, সন্দেহজনক মেসেজ যাচাই, ফ্রি প্রশিক্ষণ বা কাজ খোঁজা।'
          : language === 'hi'
            ? 'नमस्ते! मैं "JENOVA Voice" — आपका वॉइस और टेक्स्ट सहायक हूं। सरकारी योजनाओं, दस्तावेज़ सूची, धोखाधड़ी जांच या निःशुल्क प्रशिक्षण के बारे में बोलकर या लिखकर पूछें।'
            : 'Hello! I am JENOVA Voice — JENOVA’s Bengali-first AI voice and text assistant. Tap the large microphone button to speak, or type below about welfare schemes, document folders, scam checks, free skills, or jobs.',
      suggestedActions: [
        {
          label: language === 'bn' ? 'JENOVA Checklist শুরু করুন' : 'Open JENOVA Checklist',
          path: '/checklist',
        },
        {
          label: language === 'bn' ? 'JENOVA Protect (প্রতারণা যাচাই)' : 'Open JENOVA Protect',
          path: '/scam-check',
        },
        {
          label: language === 'bn' ? 'JENOVA Local (নিকটস্থ BSK)' : 'Open JENOVA Local',
          path: '/local-help',
        },
      ],
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const samplePrompts =
    language === 'bn'
      ? [
          'আমি বিধবা ভাতা সম্পর্কে জানতে চাই।',
          'লক্ষ্মীর ভাণ্ডারের জন্য কী কী কাগজ লাগবে?',
          'চাকরির জন্য ১,৫০০ টাকা চাইছে — এটা কি প্রতারণা?',
          'আমার জেলায় বিনামূল্যে কম্পিউটার বা সেলাই কোথায় শিখব?',
        ]
      : language === 'hi'
        ? [
            'लक्ष्मीर भंडार के लिए कौन से दस्तावेज़ चाहिए?',
            'नौकरी के लिए पैसे मांगना क्या धोखाधड़ी है?',
            'निःशुल्क कंप्यूटर या सिलाई प्रशिक्षण कहां सीखें?',
            'निकटतम BSK या BDO सहायता कैसे खोजें?',
          ]
        : [
            'I want to know about widow pension and welfare schemes.',
            'What documents do I need for Lakshmir Bhandar?',
            'Someone is asking ₹1,500 for a job — is it a scam?',
            'Where can I learn free computer or tailoring skills in my district?',
          ];

  const sendQuestion = async (questionText: string, viaVoice = false) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    if (viaVoice) {
      trackAnalyticsEvent('voice_assistant_use', language);
    }

    const navMatch = detectVoiceNavigation(trimmed);
    setVoiceNavHint(navMatch);

    setError('');
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await apiFetch<{
        reply: string;
        suggestedActions?: SuggestedAction[];
      }>('/api/ai/assistant', {
        method: 'POST',
        body: JSON.stringify({
          message: trimmed,
          language,
          history: nextMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: res.reply,
          suggestedActions: res.suggestedActions || [],
        },
      ]);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach JENOVA Voice right now. Please try again or use our direct tools below.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input, false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <PageHeader
        title={
          language === 'bn'
            ? 'JENOVA Voice — বাংলা ভয়েস ও টেক্সট সহায়ক'
            : language === 'hi'
              ? 'JENOVA Voice — वॉइस और टेक्स्ट सहायक'
              : 'JENOVA Voice — Bengali-First AI Voice Assistant'
        }
        subtitle={
          language === 'bn'
            ? 'টাইপ করতে অসুবিধা? বড় মাইক্রোফোন বোতামে চাপ দিয়ে সহজ বাংলায় বলুন। প্রতিটি উত্তর আপনি শুনেও নিতে পারবেন এবং সরাসরি পরবর্তী ধাপে যেতে পারবেন।'
            : 'Speak naturally in Bengali, Hindi, or English — or type below. Every reply includes Read-Aloud audio and clickable next actions grounded in verified platform records.'
        }
      />

      <SafetyNotice
        message={
          language === 'bn'
            ? 'সতর্কতা: এখানে কখনোই আপনার আধার নম্বর, ব্যাংক অ্যাকাউন্ট নম্বর, OTP, UPI PIN বা পাসওয়ার্ড বলবেন না বা লিখবেন না।'
            : 'Safety Notice: Never speak or type Aadhaar numbers, UPI PINs, OTPs, bank account numbers, or passwords here.'
        }
      />

      {/* Voice-First Hero Action Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5E3DC] flex flex-col sm:flex-row items-center gap-5">
        <ResilientImage
          src={VISUAL_ASSETS.aiAssistantMascot.src}
          alt={VISUAL_ASSETS.aiAssistantMascot.alt}
          eager
          containerClassName="w-24 h-24 rounded-2xl border border-[#E5E3DC] shrink-0"
        />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#252525]">
              {language === 'bn'
                ? 'কথা বলে সাহায্য নিন (বাংলা / হিন্দি / ইংরেজি)'
                : 'Ask by Voice or Text (Bengali · Hindi · English)'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5C58] mt-1 leading-relaxed">
              {language === 'bn'
                ? 'মাইক্রোফোনে বললে আপনার প্রশ্নটি সাথে সাথে চলে যাবে। ব্রাউজারে ভয়েস না থাকলে নিচের বক্সে টাইপ করুন।'
                : 'Tap the microphone to ask your question aloud. If microphone access is unavailable, typing works identically below.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <VoiceInputButton
              size="lg"
              lang={language}
              onResult={(spokenText) => {
                setInput(spokenText);
                sendQuestion(spokenText, true);
              }}
            />
            <div
              className="inline-flex items-center rounded-xl border border-[#E5E3DC] bg-[#FAF9F5] p-1 text-xs font-semibold"
              role="group"
              aria-label="Voice assistant language"
            >
              {(
                [
                  { code: 'bn', label: 'বাংলা' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'en', label: 'English' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code)}
                  className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    language === opt.code
                      ? 'bg-[#176B4D] text-white'
                      : 'text-[#5C5C58] hover:text-[#252525]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {voiceNavHint && (
            <div className="rounded-xl bg-[#EBF4F0] border border-[#176B4D]/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-[#11533B]">
                {language === 'bn'
                  ? 'ভয়েস নেভিগেশন শর্টকাট:'
                  : 'Voice-Guided Navigation Shortcut:'}
              </span>
              <button
                type="button"
                onClick={() => navigate(voiceNavHint.path)}
                className="inline-flex items-center gap-1 font-bold text-[#176B4D] hover:underline cursor-pointer"
              >
                <span>{voiceNavHint.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Starter Prompt Buttons */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#5C5C58]">
          {language === 'bn'
            ? 'এক ট্যাপে জিজ্ঞাসা করুন:'
            : 'Or tap a common question to start:'}
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => sendQuestion(q, false)}
              className="px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-white border border-[#E5E3DC] text-[#252525] hover:border-[#176B4D] hover:bg-[#EBF4F0] hover:text-[#11533B] transition-colors cursor-pointer text-left min-h-[42px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Box */}
      <div className="rounded-2xl bg-white border border-[#E5E3DC] flex flex-col min-h-[440px] max-h-[640px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {msg.role === 'user' ? (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#176B4D] text-white">
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <ResilientImage
                  src={VISUAL_ASSETS.aiAssistantMascot.src}
                  alt="JENOVA Voice Assistant"
                  containerClassName="w-9 h-9 rounded-xl border border-[#E5E3DC] shrink-0"
                />
              )}
              <div className={`max-w-[88%] space-y-2.5 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3.5 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#176B4D] text-white'
                      : 'bg-[#FAF9F5] border border-[#E5E3DC] text-[#252525]'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === 'assistant' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <ReadAloudButton compact text={msg.text} lang={language} />
                    {msg.suggestedActions?.map((act) => (
                      <button
                        key={`${msg.id}-${act.path}`}
                        type="button"
                        onClick={() => navigate(act.path)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EBF4F0] hover:bg-[#176B4D] text-[#11533B] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#5C5C58] pl-12">
              <span>
                {language === 'bn'
                  ? 'যাচাইকৃত তথ্য মিলিয়ে উত্তর তৈরি হচ্ছে...'
                  : 'Checking verified platform records...'}
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[#E5E3DC] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-[#FAF9F5] rounded-b-2xl"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'এখানে বাংলা বা ইংরেজিতে লিখুন...'
                : 'Type your question in Bengali, English, or Hindi...'
            }
            className="flex-1 rounded-xl border border-[#D8D5CC] bg-white px-4 py-3 text-sm text-[#252525] min-h-[46px]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-xl disabled:opacity-50 cursor-pointer whitespace-nowrap min-h-[46px]"
          >
            <Send className="w-4 h-4" />
            <span>{t.common.submit}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
