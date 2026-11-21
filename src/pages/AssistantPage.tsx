import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Send, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../i18n/translations';
import { apiFetch, trackAnalyticsEvent } from '../lib/api';
import type { Language } from '../types/platform';
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
  sourceLabel?: 'ai_grounded_in_verified_records' | 'welcome_guide';
}

function buildWelcomeMessage(language: Language): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    text: tr(
      language,
      'নমস্কার! আমি "JENOVA Voice" — আপনার বাংলা ভয়েস ও টেক্সট সহায়ক।\nনিচের বড় মাইক্রোফোন বোতামে চাপ দিয়ে বাংলায় বলুন অথবা টাইপ করুন: সরকারি প্রকল্প, কাগজপত্রের তালিকা, সন্দেহজনক মেসেজ যাচাই, ফ্রি প্রশিক্ষণ বা কাজ খোঁজা।',
      'नमस्ते! मैं "JENOVA Voice" — आपका वॉइस और टेक्स्ट सहायक हूं।\nनीचे बड़े माइक्रोफ़ोन बटन को दबाकर हिंदी में बोलें या टाइप करें: सरकारी योजनाएं, दस्तावेज़ सूची, धोखाधड़ी जांच, निःशुल्क प्रशिक्षण या रोजगार।',
      'Hello! I am JENOVA Voice — JENOVA’s multilingual AI voice and text assistant. Tap the large microphone button to speak, or type below about welfare schemes, document folders, scam checks, free skills, or jobs.'
    ),
    suggestedActions: [
      {
        label: tr(language, 'JENOVA Checklist শুরু করুন', 'JENOVA Checklist खोलें', 'Open JENOVA Checklist'),
        path: '/checklist',
      },
      {
        label: tr(
          language,
          'JENOVA Protect (প্রতারণা যাচাই)',
          'JENOVA Protect (धोखाधड़ी जांच)',
          'Open JENOVA Protect'
        ),
        path: '/scam-check',
      },
      {
        label: tr(
          language,
          'JENOVA Local (নিকটস্থ BSK)',
          'JENOVA Local (स्थानीय सहायता)',
          'Open JENOVA Local'
        ),
        path: '/local-help',
      },
    ],
  };
}

export function AssistantPage() {
  const { language, setLanguage, t, navigate, profile } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceNavHint, setVoiceNavHint] = useState<SuggestedAction | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const detectVoiceNavigation = (spoken: string): SuggestedAction | null => {
    const q = spoken.toLowerCase();
    if (/(প্রতারণা|সন্দেহজনক|scam|fraud|धोखाधड़ी)/i.test(q)) {
      return {
        label: tr(language, 'প্রতারণা যাচাই খুলুন', 'धोखाधड़ी जांच खोलें', 'Open Scam Checker'),
        path: '/scam-check',
      };
    }
    if (/(ফোল্ডার|কাগজ|নথি|checklist|document|दस्तावेज़)/i.test(q)) {
      return {
        label: tr(language, 'ফোল্ডার চেক খুলুন', 'दस्तावेज़ चेकलिस्ट खोलें', 'Open Document Checklist'),
        path: '/checklist',
      };
    }
    if (/(স্থানীয়|বিএসকে|bsk|bdo|local help|সাহায্য কেন্দ্র|स्थानीय सहायता)/i.test(q)) {
      return {
        label: tr(
          language,
          'স্থানীয় সহায়তা কেন্দ্র খুলুন',
          'स्थानीय सहायता केंद्र खोलें',
          'Open Local Assistance Finder'
        ),
        path: '/local-help',
      };
    }
    if (/(প্রকল্প|অন্নপূর্ণা|কন্যাশ্রী|বিধবা|scheme|annapurna|योजना|अन्नपूर्णा)/i.test(q)) {
      return {
        label: tr(
          language,
          'সরকারি প্রকল্প ডিরেক্টরি খুলুন',
          'सरकारी योजना निर्देशिका खोलें',
          'Open Government Schemes'
        ),
        path: '/schemes',
      };
    }
    if (/(বায়োডাটা|সিভি|biodata|cv|resume)/i.test(q)) {
      return {
        label: tr(
          language,
          '১-মিনিট বায়োডাটা টুল খুলুন',
          '1-मिनट बायोडाटा टूल खोलें',
          'Open 1-Minute Biodata Builder'
        ),
        path: '/jobs/biodata',
      };
    }
    if (/(উড়ান|udaan|ইন্টারভিউ|interview|সফট স্কিল|soft skill|প্রশিক্ষণ|training)/i.test(q)) {
      return {
        label: tr(
          language,
          'JENOVA UDAAN প্রশিক্ষণ খুলুন',
          'JENOVA UDAAN प्रशिक्षण खोलें',
          'Open JENOVA UDAAN Training'
        ),
        path: '/udaan',
      };
    }
    if (/(পাসপোর্ট|passport|লক্ষ্য|action plan|ট্র্যাকার)/i.test(q)) {
      return {
        label: tr(
          language,
          'JENOVA Action Passport খুলুন',
          'JENOVA Action Passport खोलें',
          'Open Action Passport'
        ),
        path: '/passport',
      };
    }
    if (/(ব্যবসা|business|উদ্যম|udyam|দোকান|সেলাই|tailoring|tiffin|msme|व्यापार|व्यवसाय)/i.test(q)) {
      return {
        label: tr(
          language,
          'ব্যবসা পরিকল্পনা বিল্ডার খুলুন',
          'व्यवसाय योजना बिल्डर खोलें',
          'Open Business Plan Builder'
        ),
        path: '/msme/planner',
      };
    }
    return null;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcomeMessage(language)]);

  // Keep the welcome message synchronized whenever the user switches site language
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === 'welcome' ? buildWelcomeMessage(language) : m))
    );
  }, [language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const samplePrompts =
    language === 'bn'
      ? [
          'আমি বিধবা ভাতা সম্পর্কে জানতে চাই।',
          'অন্নপূর্ণা যোজনার জন্য কী কী কাগজ লাগবে?',
          'চাকরির জন্য ১,৫০০ টাকা চাইছে — এটা কি প্রতারণা?',
          'আমার জেলায় বিনামূল্যে কম্পিউটার বা সেলাই কোথায় শিখব?',
        ]
      : language === 'hi'
        ? [
            'अन्नपूर्णा योजना के लिए कौन से दस्तावेज़ चाहिए?',
            'नौकरी के लिए पैसे मांगना क्या धोखाधड़ी है?',
            'निःशुल्क कंप्यूटर या सिलाई प्रशिक्षण कहां सीखें?',
            'निकटतम BSK या BDO सहायता कैसे खोजें?',
          ]
        : [
            'I want to know about widow pension and welfare schemes.',
            'What documents do I need for Annapurna Yojana?',
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
        sourceLabel?: 'ai_grounded_in_verified_records';
      }>('/api/ai/assistant', {
        method: 'POST',
        body: JSON.stringify({
          message: trimmed,
          language,
          history: nextMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          profileContext: {
            state: profile.location.state,
            district: profile.location.district,
            education: profile.education,
            employmentStatus: profile.employmentStatus,
            careerGoals: profile.careerGoals.slice(0, 4),
            skills: profile.skills.slice(0, 6),
          },
        }),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: res.reply,
          suggestedActions: res.suggestedActions || [],
          sourceLabel: res.sourceLabel || 'ai_grounded_in_verified_records',
        },
      ]);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : tr(
              language,
              'এই মুহূর্তে JENOVA Voice-এর সাথে সংযোগ করা যাচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।',
              'इस समय JENOVA Voice से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।',
              'Unable to reach JENOVA Voice right now. Please try again or use our direct tools below.'
            )
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
        title={tr(
          language,
          'JENOVA Voice — বাংলা ভয়েস ও টেক্সট সহায়ক',
          'JENOVA Voice — हिंदी वॉइस और टेक्स्ट सहायक',
          'JENOVA Voice — Multilingual AI Voice Assistant'
        )}
        subtitle={tr(
          language,
          'টাইপ করতে অসুবিধা? বড় মাইক্রোফোন বোতামে চাপ দিয়ে সহজ বাংলায় বলুন। প্রতিটি উত্তর আপনি শুনেও নিতে পারবেন এবং সরাসরি পরবর্তী ধাপে যেতে পারবেন।',
          'टाइप करने में कठिनाई? बड़े माइक्रोफ़ोन बटन को दबाकर सरल हिंदी में बोलें। हर उत्तर आप सुन सकते हैं और सीधे अगले कदम पर जा सकते हैं।',
          'Speak naturally in Bengali, Hindi, or English — or type below. Every reply includes Read-Aloud audio and clickable next actions grounded in verified platform records.'
        )}
      />

      <SafetyNotice
        message={tr(
          language,
          'সতর্কতা: এখানে কখনোই আপনার আধার নম্বর, ব্যাংক অ্যাকাউন্ট নম্বর, OTP, UPI PIN বা পাসওয়ার্ড বলবেন না বা লিখবেন না।',
          'सुरक्षा सूचना: यहां कभी भी अपना आधार नंबर, बैंक खाता संख्या, OTP, UPI PIN या पासवर्ड न बोलें और न लिखें।',
          'Safety Notice: Never speak or type Aadhaar numbers, UPI PINs, OTPs, bank account numbers, or passwords here.'
        )}
      />

      {/* Voice-First Hero Action Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#F2DCC1] flex flex-col sm:flex-row items-center gap-5">
        <ResilientImage
          src={VISUAL_ASSETS.aiAssistantMascot.src}
          alt={VISUAL_ASSETS.aiAssistantMascot.alt}
          eager
          containerClassName="w-24 h-24 rounded-2xl border border-[#F2DCC1] shrink-0"
        />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#26364B]">
              {tr(
                language,
                'কথা বলে সাহায্য নিন (বাংলা / হিন্দি / ইংরেজি)',
                'बोलकर या लिखकर मदद लें (हिंदी · बंगाली · अंग्रेजी)',
                'Ask by Voice or Text (Bengali · Hindi · English)'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#454545] mt-1 leading-relaxed">
              {tr(
                language,
                'মাইক্রোফোনে বললে আপনার প্রশ্নটি সাথে সাথে চলে যাবে। ব্রাউজারে ভয়েস না থাকলে নিচের বক্সে টাইপ করুন।',
                'माइक्रोफ़ोन पर बोलकर अपना सवाल पूछें। यदि माइक्रोफ़ोन उपलब्ध न हो, तो नीचे टाइप करके भी वही सहायता पा सकते हैं।',
                'Tap the microphone to ask your question aloud. If microphone access is unavailable, typing works identically below.'
              )}
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
              className="inline-flex items-center rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] p-1 text-xs font-semibold"
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
                      ? 'jenova-saffron-btn'
                      : 'text-[#454545] hover:text-[#26364B]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {voiceNavHint && (
            <div className="rounded-xl bg-[#FFE5C2] border border-[#F4A340]/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-[#26364B] dark:text-[#FFD19A]">
                {tr(
                  language,
                  'ভয়েস নেভিগেশন শর্টকাট:',
                  'वॉयस नेविगेशन शॉर्टकट:',
                  'Voice-Guided Navigation Shortcut:'
                )}
              </span>
              <button
                type="button"
                onClick={() => navigate(voiceNavHint.path)}
                className="inline-flex items-center gap-1 font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
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
        <p className="text-xs font-semibold text-[#454545]">
          {tr(
            language,
            'এক ট্যাপে জিজ্ঞাসা করুন:',
            'एक टैप में सवाल पूछें:',
            'Or tap a common question to start:'
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => sendQuestion(q, false)}
              className="px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-white border border-[#F2DCC1] text-[#26364B] hover:border-[#F4A340] hover:bg-[#FFE5C2] hover:text-[#26364B] dark:text-[#FFF5E8] dark:hover:text-[#FFD19A] transition-colors cursor-pointer text-left min-h-[42px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Box */}
      <div className="rounded-2xl bg-white border border-[#F2DCC1] flex flex-col min-h-[440px] max-h-[640px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {msg.role === 'user' ? (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 jenova-saffron-btn">
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <ResilientImage
                  src={VISUAL_ASSETS.aiAssistantMascot.src}
                  alt="JENOVA Voice Assistant"
                  containerClassName="w-9 h-9 rounded-xl border border-[#F2DCC1] shrink-0"
                />
              )}
              <div className={`max-w-[88%] space-y-2.5 ${msg.role === 'user' ? 'items-end' : ''}`}>
                {msg.role === 'assistant' && msg.id !== 'welcome' && (
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#454545]">
                    {tr(
                      language,
                      'AI-তৈরি ব্যাখ্যা · যাচাইকৃত JENOVA রেকর্ডের ওপর ভিত্তি করে',
                      'AI-जनित व्याख्या · सत्यापित JENOVA रिकॉर्ड पर आधारित',
                      'AI-Generated Explanation · Grounded in Verified JENOVA Records'
                    )}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-3.5 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'jenova-saffron-btn'
                      : 'bg-[#FFF1DF] border border-[#F2DCC1] text-[#26364B]'
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFE5C2] hover:bg-[#F4A340] text-[#26364B] dark:text-[#FFD19A] hover:text-[#26364B] dark:hover:text-[#1C140E] text-xs font-semibold transition-colors cursor-pointer"
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
            <div className="flex items-center gap-2 text-xs text-[#454545] pl-12">
              <span>
                {tr(
                  language,
                  'যাচাইকৃত তথ্য মিলিয়ে উত্তর তৈরি হচ্ছে...',
                  'सत्यापित रिकॉर्ड की जांच की जा रही है...',
                  'Checking verified platform records...'
                )}
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
          className="p-4 border-t border-[#F2DCC1] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-[#FFF1DF] rounded-b-2xl"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tr(
              language,
              'এখানে বাংলা বা ইংরেজিতে লিখুন...',
              'यहां हिंदी, बंगाली या अंग्रेजी में अपना प्रश्न लिखें...',
              'Type your question in Bengali, English, or Hindi...'
            )}
            className="flex-1 rounded-xl border border-[#F2DCC1] bg-white px-4 py-3 text-sm text-[#26364B] min-h-[46px]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-semibold jenova-saffron-btn rounded-xl disabled:opacity-50 cursor-pointer whitespace-nowrap min-h-[46px]"
          >
            <Send className="w-4 h-4" />
            <span>{t.common.submit}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
