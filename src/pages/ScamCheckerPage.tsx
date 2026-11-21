import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  ExternalLink,
  Flag,
  Info,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch, readOfflineCache, trackAnalyticsEvent, writeOfflineCache } from '../lib/api';
import { localizeScamType, pickText, tr } from '../i18n/translations';
import type { FraudAlert, FraudAnalysisResult } from '../types/platform';
import { PageHeader, SafetyNotice } from '../components/SharedUI';
import { ReadAloudButton, VoiceInputButton } from '../components/VoiceAccessibility';
import { JenovaProtectLogo } from '../components/JenovaIcons3D';

type CheckCategory = 'message' | 'job' | 'loan' | 'link' | 'payment' | 'contact';

const CATEGORIES: { id: CheckCategory; bn: string; en: string; hi: string }[] = [
  { id: 'message', bn: 'হোয়াটসঅ্যাপ / SMS মেসেজ', en: 'WhatsApp / SMS Message', hi: 'व्हाट्सएप / SMS संदेश' },
  { id: 'job', bn: 'চাকরির অফার', en: 'Job Offer', hi: 'नौकरी का ऑफर' },
  { id: 'loan', bn: 'ঋণ / লোন অফার', en: 'Loan Offer', hi: 'लोन ऑफर' },
  { id: 'link', bn: 'ওয়েবসাইট লিঙ্ক', en: 'Website Link', hi: 'वेबसाइट लिंक' },
  { id: 'payment', bn: 'UPI / পেমেন্ট অনুরোধ', en: 'Payment / UPI Request', hi: 'UPI / पेमेंट अनुरोध' },
  { id: 'contact', bn: 'ফোন / যোগাযোগ নম্বর', en: 'Phone / Contact', hi: 'फ़ोन / संपर्क' },
];

const SAMPLE_TESTS: {
  id: string;
  category: CheckCategory;
  labelBn: string;
  labelHi: string;
  labelEn: string;
  text: string;
}[] = [
  {
    id: 'job-fee',
    category: 'job',
    labelBn: 'নমুনা ১: চাকরির আগে ফি চাওয়া মেসেজ',
    labelHi: 'नमूना 1: नौकरी से पहले शुल्क मांगने वाला संदेश',
    labelEn: 'Sample 1: Job Asking Registration Fee',
    text: 'Urgent Airport & Warehouse Packing Job! Salary ₹28,500/month. Pay ₹1,500 registration & uniform fee via UPI today to confirm joining letter.',
  },
  {
    id: 'upi-qr',
    category: 'payment',
    labelBn: 'নমুনা ২: টাকা পাওয়ার জন্য UPI PIN চাওয়া',
    labelHi: 'नमूना 2: पैसे पाने के लिए UPI PIN मांगना',
    labelEn: 'Sample 2: UPI QR / PIN to Receive Money',
    text: 'আপনার লটারি ও অন্নপূর্ণা যোজনা বোনাস ₹15,000 মঞ্জুর হয়েছে। টাকা অ্যাকাউন্টে পেতে এই QR কোড স্ক্যান করে আপনার UPI PIN দিন এবং AnyDesk অ্যাপ ডাউনলোড করুন।',
  },
  {
    id: 'kyc-link',
    category: 'link',
    labelBn: 'নমুনা ৩: ব্যাংক KYC বন্ধের ভয় দেখানো লিঙ্ক',
    labelHi: 'नमूना 3: बैंक KYC बंद होने का डर दिखाने वाला लिंक',
    labelEn: 'Sample 3: Urgent Bank KYC Link',
    text: 'Dear Customer, your SBI account will be blocked within 2 hours. Update PAN KYC immediately at http://sbi-kyc-update-alert.xyz/verify or share OTP.',
  },
];

export function ScamCheckerPage() {
  const { language, theme, navigate, openReportModal } = useApp();
  const [category, setCategory] = useState<CheckCategory>('message');
  const [content, setContent] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FraudAnalysisResult | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>(() =>
    readOfflineCache<FraudAlert[]>('fraud_alerts', [])
  );

  useEffect(() => {
    apiFetch<{ alerts: FraudAlert[] }>('/api/fraud/alerts')
      .then((res) => {
        setAlerts(res.alerts || []);
        writeOfflineCache('fraud_alerts', res.alerts || []);
      })
      .catch(() => {});
  }, []);

  const runCheck = async (overrideText?: string, overrideCat?: CheckCategory) => {
    const textToAnalyze = (overrideText ?? content).trim();
    const catToUse = overrideCat ?? category;
    if (textToAnalyze.length < 4) {
      setError(
        tr(
          language,
          'অনুগ্রহ করে সন্দেহজনক মেসেজ, লিঙ্ক বা অফারের অন্তত ১টি লাইন পেস্ট করুন।',
          'कृपया संदिग्ध संदेश, लिंक या ऑफर की कम से कम 1 पंक्ति पेस्ट करें।',
          'Please paste at least one line of the suspicious message, link, or offer.'
        )
      );
      return;
    }

    setError(null);
    setChecking(true);
    try {
      const res = await apiFetch<{ result: FraudAnalysisResult }>('/api/fraud/analyze', {
        method: 'POST',
        body: JSON.stringify({
          inputType: catToUse,
          content: textToAnalyze,
          language,
          includeAi: true,
        }),
      });
      setResult(res.result);
      trackAnalyticsEvent('fraud_check_completed', catToUse);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tr(language, 'এই মুহূর্তে যাচাই করা সম্ভব হচ্ছে না।', 'इस समय जांच नहीं की जा सकी।', 'Unable to analyze right now.')
      );
    } finally {
      setChecking(false);
    }
  };

  const riskStyles = result
    ? result.riskLevel === 'HIGH RISK'
      ? {
          box: 'bg-red-50 border-red-300 text-red-950',
          badge: 'bg-red-700 text-white',
          icon: <AlertOctagon className="w-7 h-7 text-red-700 shrink-0" />,
          label: tr(language, 'উচ্চ ঝুঁকি', 'उच्च जोखिम', 'HIGH RISK'),
        }
      : result.riskLevel === 'NEEDS VERIFICATION'
        ? {
            box: 'bg-[#FFF1DF] border-[#F4A340] text-[#26364B]',
            badge: 'bg-[#FFD19A] text-[#26364B] border border-[#F4A340]',
            icon: <AlertTriangle className="w-7 h-7 text-[#A85B0A] shrink-0" />,
            label: tr(language, 'যাচাই প্রয়োজন', 'सत्यापन आवश्यक', 'NEEDS VERIFICATION'),
          }
        : {
            box: 'bg-[#E9F5EF] dark:bg-[#143022] border-[#27845B]/40 text-[#1F6A49] dark:text-[#7DE0B0]',
            badge: 'bg-[#27845B] text-white',
            icon: <ShieldCheck className="w-7 h-7 text-[#27845B] dark:text-[#45B884] shrink-0" />,
            label: tr(language, 'বড় কোনো বিপদসংকেত মেলেনি', 'कोई बड़ा खतरा नहीं मिला', 'NO MAJOR RED FLAGS FOUND'),
          }
    : null;

  const fullSpeakableSummary = result
    ? [
        result.headline,
        result.summary,
        ...result.indicators.map((ind) => `${ind.title}: ${ind.explanation}`),
        result.aiExplanation || '',
        ...result.safeNextSteps,
      ]
        .filter(Boolean)
        .join('. ')
    : '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-[#FFF1DF] via-white to-[#FFE5C2]/65 dark:from-[#261B12] dark:via-[#241B13] dark:to-[#2D1E12] border border-[#F2DCC1] dark:border-[#4A3522] p-5 sm:p-6 shadow-sm">
        <JenovaProtectLogo
          size="lg"
          theme={theme}
          subtitle={tr(
            language,
            'ডিজিটাল সুরক্ষা ও প্রতারণা শনাক্তকরণ কেন্দ্র',
            'डिजिटल सुरक्षा और धोखाधड़ी जांच केंद्र',
            'Digital Safety & Suspicious Offer Shield'
          )}
        />
      </div>

      <PageHeader
        title={tr(
          language,
          'JENOVA Protect — প্রতারণা ও ভুয়া অফার যাচাই',
          'JENOVA Protect — धोखाधड़ी और संदिग्ध ऑफर जांच',
          'JENOVA Protect — Fraud & Suspicious Offer Detection'
        )}
        subtitle={tr(
          language,
          'অজানা WhatsApp/SMS মেসেজ, চাকরির অফার, লোনের প্রস্তাব বা লিঙ্ক যাচাই করুন। আমরা কখনোই কোনো লিঙ্ক ওপেন করি না — নিরাপদভাবে ঝুঁকির লক্ষণ পরীক্ষা করি।',
          'संदिग्ध WhatsApp/SMS संदेश, नौकरी के ऑफर, लोन ऑफर या लिंक की जांच करें। हम बाहरी लिंक खोले बिना सुरक्षित रूप से जोखिम के संकेत जांचते हैं।',
          'Paste a suspicious SMS, WhatsApp forward, job offer, loan message, or URL. We analyze warning signs statically without ever opening or running external links.'
        )}
      />

      <SafetyNotice
        message={tr(
          language,
          'কখনোই এখানে আপনার আসল OTP, UPI PIN, ব্যাংক পাসওয়ার্ড বা আধার নম্বর লিখবেন না। শুধু সন্দেহজনক মেসেজ বা লিঙ্কটি পেস্ট করুন।',
          'कभी भी यहाँ अपना असली OTP, UPI PIN, बैंक पासवर्ड या आधार नंबर न लिखें। केवल संदिग्ध संदेश, लिंक या ऑफर टेक्स्ट पेस्ट करें।',
          'Never paste your real OTP, UPI PIN, bank password, or Aadhaar number here. Paste only the suspicious message, link, or offer text.'
        )}
      />

      {/* Input Panel */}
      <div className="rounded-2xl bg-white border border-[#F2DCC1] p-5 sm:p-7 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#26364B] mb-2.5">
            {tr(language, '১. আপনি কী পরীক্ষা করতে চান?', '1. आप क्या जांचना चाहते हैं?', '1. What would you like to check?')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-left transition-colors cursor-pointer min-h-[44px] ${
                  category === cat.id
                    ? 'jenova-saffron-btn border-[#E69228]'
                    : 'bg-[#FFF1DF] text-[#26364B] border-[#F2DCC1] hover:bg-[#FFE5C2]'
                }`}
              >
                {tr(language, cat.bn, cat.hi, cat.en)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label htmlFor="scam-input" className="text-sm font-semibold text-[#26364B]">
              {tr(
                language,
                '২. সন্দেহজনক মেসেজ, অফার বা লিঙ্ক এখানে পেস্ট করুন বা বলুন',
                '2. संदिग्ध संदेश, ऑफर या लिंक यहाँ पेस्ट करें या बोलें',
                '2. Paste the suspicious message, offer, or link (or speak it)'
              )}
            </label>
            <VoiceInputButton
              lang={language}
              onResult={(spoken) => setContent((prev) => (prev ? `${prev} ${spoken}` : spoken))}
              label={tr(language, 'বলুন (ভয়েস)', 'बोलें (वॉइस)', 'Speak text')}
            />
          </div>
          <textarea
            id="scam-input"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={tr(
              language,
              'যেমন: "এয়ারপোর্ট প্যাকিং জব, বেতন ২৫,০০০ টাকা। আজই ১,৫০০ টাকা রেজিস্ট্রেশন ফি পাঠান..." অথবা সন্দেহজনক ওয়েবসাইট লিঙ্ক...',
              'उदाहरण: "पक्की नौकरी के लिए UPI से ₹1,500 रजिस्ट्रेशन शुल्क भेजें..." या कोई संदिग्ध लिंक/SMS पेस्ट करें...',
              'Example: "Pay ₹1,500 registration fee via UPI for confirmed job..." or paste a suspicious URL or SMS...'
            )}
            className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-4 py-3 text-sm sm:text-base text-[#26364B] focus:outline-none focus:ring-2 focus:ring-[#F4A340] focus:bg-white"
          />
          {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
        </div>

        {/* Safe Test Examples */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#454545]">
            {tr(
              language,
              'কীভাবে কাজ করে দেখতে নমুনা উদাহরণ চেষ্টা করুন:',
              'जांच कैसे काम करती है देखने के लिए नमूना उदाहरण आज़माएं:',
              'Try a sample scam pattern to see how analysis works:'
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TESTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setCategory(sample.category);
                  setContent(sample.text);
                  runCheck(sample.text, sample.category);
                }}
                className="text-xs px-3 py-2 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] text-[#26364B] hover:border-[#F4A340] hover:bg-[#FFE5C2] transition-colors cursor-pointer text-left"
              >
                {tr(language, sample.labelBn, sample.labelHi, sample.labelEn)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            disabled={checking}
            onClick={() => runCheck()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl jenova-saffron-btn font-semibold text-sm sm:text-base transition-colors disabled:opacity-60 cursor-pointer min-h-[48px]"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>
              {checking
                ? tr(language, 'ঝুঁকি পরীক্ষা চলছে...', 'जोखिम की जांच हो रही है...', 'Analyzing risk...')
                : tr(language, 'এখনই ঝুঁকি যাচাই করুন', 'अभी जोखिम जांचें', 'Check Risk Now')}
            </span>
          </button>
          {content && (
            <button
              type="button"
              onClick={() => {
                setContent('');
                setResult(null);
                setError(null);
              }}
              className="px-4 py-3 rounded-xl border border-[#F2DCC1] text-sm font-medium text-[#454545] hover:bg-[#FFF1DF] cursor-pointer"
            >
              {tr(language, 'মুছে ফেলুন', 'साफ़ करें', 'Clear')}
            </button>
          )}
        </div>
      </div>

      {/* Analysis Result */}
      {result && riskStyles && (
        <div className="space-y-5">
          <div className={`rounded-2xl border-2 p-6 space-y-4 ${riskStyles.box}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {riskStyles.icon}
                <div>
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded ${riskStyles.badge}`}
                  >
                    {riskStyles.label}
                  </span>
                  <h2 className="mt-2 text-lg sm:text-xl font-bold leading-snug">
                    {result.headline}
                  </h2>
                  <p className="mt-1 text-sm opacity-90">{result.summary}</p>
                </div>
              </div>
              <ReadAloudButton text={fullSpeakableSummary} lang={language} />
            </div>

            {result.aiExplanation ? (
              <div className="rounded-xl bg-white/85 border border-black/10 p-4 text-sm text-[#26364B] leading-relaxed">
                <p className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {tr(
                    language,
                    'সহজ ভাষায় এআই ব্যাখ্যা',
                    'सरल भाषा में एआई स्पष्टीकरण',
                    'Plain-Language AI Explanation (Static Engine + AI)'
                  )}
                </p>
                <p className="whitespace-pre-line">{result.aiExplanation}</p>
              </div>
            ) : result.analysisPipeline?.aiLimitationNote ? (
              <div className="rounded-xl bg-white/85 border border-[#F4A340]/50 p-3.5 text-xs text-[#6B3F06] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#A85B0A] shrink-0 mt-0.5" />
                <span>{result.analysisPipeline.aiLimitationNote}</span>
              </div>
            ) : null}

            {/* Warning Signs Detected */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider opacity-85">
                {tr(
                  language,
                  `শনাক্তকৃত সতর্কতা লক্ষণ (${result.indicators.length})`,
                  `पहचाने गए चेतावनी संकेत (${result.indicators.length})`,
                  `Detected Warning Signals (${result.indicators.length})`
                )}
              </h3>
              {result.indicators.length === 0 ? (
                <p className="text-sm bg-white/75 rounded-xl p-4 border border-black/10">
                  {tr(
                    language,
                    'কোনো পরিচিত প্রতারণার শব্দ বা ভুয়া লিঙ্ক পাওয়া যায়নি। তবুও টাকা বা OTP দেওয়ার আগে অফিসিয়াল ওয়েবসাইট যাচাই করুন।',
                    'कोई सामान्य धोखाधड़ी संकेत नहीं मिला। फिर भी पैसे भेजने या निजी जानकारी साझा करने से पहले आधिकारिक वेबसाइट से स्वतंत्र रूप से पुष्टि जरूर करें।',
                    'No common automated scam patterns matched. However, automated screening cannot guarantee 100% safety — always verify independently before paying or sharing personal data.'
                  )}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.indicators.map((ind, idx) => (
                    <div
                      key={`${ind.code}-${idx}`}
                      className="rounded-xl bg-white/90 border border-black/10 p-4 space-y-1 text-[#26364B]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">{ind.title}</span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            ind.severity === 'high'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {ind.severity === 'high'
                            ? tr(language, 'গুরুতর', 'गंभीर', 'High')
                            : tr(language, 'সতর্কতা', 'सावधानी', 'Caution')}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#454545] leading-relaxed">
                        {ind.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Safe Next Steps & What To Avoid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white p-5 border border-black/10 text-[#26364B] space-y-3">
                <h3 className="font-bold text-base">
                  {tr(language, 'নিরাপদ পরবর্তী পদক্ষেপ', 'सुरक्षित अगले कदम', 'Recommended Next Steps')}
                </h3>
                <ul className="space-y-2 text-sm">
                  {result.safeNextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#27845B] dark:text-[#45B884] shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.whatToAvoid && result.whatToAvoid.length > 0 && (
                <div className="rounded-xl bg-white p-5 border border-red-200 text-[#26364B] space-y-3">
                  <h3 className="font-bold text-base text-red-800">
                    {tr(language, 'যা কখনোই করবেন না (এড়িয়ে চলুন)', 'क्या बिल्कुल न करें (बचें)', 'What You Should Avoid')}
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {result.whatToAvoid.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Ban className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Official Reporting Options */}
            <div className="rounded-xl bg-white p-5 border border-black/10 text-[#26364B] space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-red-700" />
                {tr(
                  language,
                  'প্রতারণার শিকার হলে অফিসিয়াল রিপোর্ট করুন',
                  'धोखाधड़ी की आधिकारिक शिकायत के माध्यम (भारत)',
                  'Official Reporting Channels (India)'
                )}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.officialReporting.map((ch) => {
                  const href = ch.url || 'tel:1930';
                  const isHttp = href.startsWith('http');
                  return (
                    <a
                      key={ch.name}
                      href={href}
                      target={isHttp ? '_blank' : undefined}
                      rel={isHttp ? 'noopener noreferrer' : undefined}
                      className="rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] p-3.5 hover:border-[#F4A340] transition-colors flex flex-col justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-sm text-[#A85B0A] dark:text-[#FFD19A]">{ch.name}</p>
                        <p className="text-xs text-[#454545] mt-1">{ch.detail}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] inline-flex items-center gap-1">
                        {isHttp
                          ? tr(language, 'অফিসিয়াল পোর্টাল খুলুন', 'आधिकारिक पोर्टल खोलें', 'Open Official Portal')
                          : tr(language, '১৯৩০-এ কল করুন', '1930 पर कॉल करें', 'Call 1930')}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </a>
                  );
                })}
              </div>
              <p className="text-xs text-[#454545] pt-1 border-t border-[#F2DCC1]">
                {result.disclaimer}
              </p>
            </div>

            {/* Next Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() =>
                  openReportModal({
                    targetType: 'general',
                    targetId: 'scam-alert-tip',
                    targetTitle: tr(
                      language,
                      'সন্দেহজনক প্রতারণার সতর্কতা রিপোর্ট',
                      'संदिग्ध धोखाधड़ी पैटर्न रिपोर्ट',
                      'Suspicious Scam Pattern Report'
                    ),
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-semibold text-[#26364B] hover:bg-[#FFF1DF] cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5 text-red-700" />
                {tr(language, 'কমিউনিটিকে সতর্ক করতে রিপোর্ট করুন', 'JENOVA सुरक्षा टीम को सूचित करें', 'Alert JENOVA Safety Team')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/local-help')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:bg-[#FFE5C2] cursor-pointer"
              >
                {tr(language, 'স্থানীয় সহায়তা খুঁজুন', 'स्थानीय सहायता खोजें', 'Find Local Help')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/finance/fraud-awareness')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:bg-[#FFE5C2] cursor-pointer"
              >
                {tr(language, 'প্রতারণা সুরক্ষা গাইড পড়ুন', 'धोखाधड़ी सुरक्षा गाइड पढ़ें', 'Read Fraud Safety Guide')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Fraud Alerts Feed */}
      <section className="space-y-4 pt-4 border-t border-[#F2DCC1]">
        <div>
          <h2 className="text-xl font-bold text-[#26364B]">
            {tr(
              language,
              'সক্রিয় কমিউনিটি প্রতারণা সতর্কতা',
              'सक्रिय सामुदायिक धोखाधड़ी अलर्ट',
              'Active Community Fraud Alerts'
            )}
          </h2>
          <p className="text-sm text-[#454545]">
            {tr(
              language,
              'সারা দেশে প্রচলিত ডিজিটাল, চাকরি ও সরকারি প্রকল্প-সংক্রান্ত প্রতারণার ধরনগুলি জেনে সচেতন থাকুন।',
              'देश भर में सक्रिय डिजिटल, नौकरी और कल्याणकारी योजनाओं से जुड़ी धोखाधड़ी के तरीकों से सतर्क रहें।',
              'Stay ahead of common digital, employment, and welfare scam patterns flagged across India.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="rounded-2xl bg-white border border-[#F2DCC1] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                    {localizeScamType(alert.scamType, language)}
                  </span>
                  <span className="text-[11px] text-[#454545]">{alert.publishedAt}</span>
                </div>
                <h3 className="font-bold text-base text-[#26364B]">
                  {pickText(alert.title, language)}
                </h3>
                <p className="text-sm text-[#454545] leading-relaxed">
                  {pickText(alert.summary, language)}
                </p>
                <div className="rounded-lg bg-[#FFF1DF] p-3 text-xs text-[#26364B] border border-[#F2DCC1]">
                  <span className="font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
                    {tr(language, 'সুরক্ষা পরামর্শ: ', 'सुरक्षा सुझाव: ', 'Protection Tip: ')}
                  </span>
                  {pickText(alert.safetyTip, language)}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F2DCC1] text-xs text-[#454545]">
                <span>{alert.createdBy}</span>
                <ReadAloudButton
                  compact
                  lang={language}
                  text={`${pickText(alert.title, language)}. ${pickText(alert.summary, language)}. ${pickText(alert.safetyTip, language)}`}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
