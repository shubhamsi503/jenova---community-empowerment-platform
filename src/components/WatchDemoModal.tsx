import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Pause, Play, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pickText, tr } from '../i18n/translations';
import type { LocalizedText } from '../types/platform';
import { ReadAloudButton } from './VoiceAccessibility';
import {
  Building3DIcon,
  Clipboard3DIcon,
  LocationPin3DIcon,
  Microphone3DIcon,
  Shield3DIcon,
} from './Jenova3DIcons';

interface WatchDemoModalProps {
  open: boolean;
  onClose: () => void;
}

interface DemoStepItem {
  id: string;
  path: string;
  badge: LocalizedText;
  tabLabel: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  highlights: LocalizedText[];
  Icon: typeof Shield3DIcon;
}

const DEMO_STEPS: DemoStepItem[] = [
  {
    id: 'protect',
    path: '/scam-check',
    badge: {
      bn: 'ধাপ ১ / ৫ · JENOVA Protect',
      hi: 'चरण 1 / 5 · JENOVA Protect',
      en: 'Step 1 of 5 · JENOVA Protect',
    },
    tabLabel: { bn: '১. সুরক্ষা', hi: '1. सुरक्षा', en: '1. Protect' },
    title: {
      bn: 'টাকা বা OTP দেওয়ার আগে ভুয়া চাকরি ও প্রতারণা যাচাই করুন',
      hi: 'पैसे या OTP देने से पहले नकली नौकरी और धोखाधड़ी की जांच करें',
      en: 'Verify Suspicious Jobs, Links & UPI Scams Before Paying',
    },
    summary: {
      bn: 'যেকোনো হোয়াটসঅ্যাপ চাকরির মেসেজ, লোনের লিঙ্ক বা বৃত্তির এসএমএস JENOVA Protect-এ পেস্ট করুন। এটি তৎক্ষণাৎ প্রতারণার লক্ষণ ধরিয়ে দেয় এবং সরাসরি ১৯৩০ হেল্পলাইন দেখায়।',
      hi: 'किसी भी व्हाट्सएप नौकरी संदेश, लोन लिंक या छात्रवृत्ति SMS को JENOVA Protect में पेस्ट करें। यह तुरंत धोखाधड़ी के संकेत बताता है और सीधे 1930 हेल्पलाइन दिखाता है।',
      en: 'Paste any WhatsApp job offer, loan link, or scholarship SMS into JENOVA Protect. Our rule engine flags advance-fee traps, fake .gov links, and OTP scams instantly — and connects you directly to National Cyber Helpline 1930.',
    },
    highlights: [
      {
        bn: 'অগ্রিম ফি ও UPI PIN চাওয়ার ফাঁদ স্বয়ংক্রিয়ভাবে শনাক্ত করে',
        hi: 'अग्रिम शुल्क और UPI PIN मांगने के जाल को स्वचालित रूप से पहचानता है',
        en: 'Detects upfront fee & UPI PIN requests automatically',
      },
      {
        bn: 'কখনোই আপনার আধার, OTP বা ব্যাংকের তথ্য চায় না',
        hi: 'कभी भी आपका आधार, OTP या बैंक विवरण नहीं मांगता',
        en: 'Never asks for your Aadhaar, OTP, or bank credentials',
      },
      {
        bn: 'সাইবার হেল্পলাইন ১৯৩০ ও cybercrime.gov.in-এর সরাসরি লিঙ্ক',
        hi: 'साइबर हेल्पलाइन 1930 और cybercrime.gov.in के सीधे लिंक',
        en: 'Direct links to Cyber Helpline 1930 & cybercrime.gov.in',
      },
    ],
    Icon: Shield3DIcon,
  },
  {
    id: 'schemes',
    path: '/schemes',
    badge: {
      bn: 'ধাপ ২ / ৫ · JENOVA Schemes',
      hi: 'चरण 2 / 5 · JENOVA Schemes',
      en: 'Step 2 of 5 · JENOVA Schemes',
    },
    tabLabel: { bn: '২. প্রকল্প', hi: '2. योजनाएं', en: '2. Schemes' },
    title: {
      bn: 'যাচাইকৃত রাজ্য ও কেন্দ্রীয় সরকারি প্রকল্প সহজে জানুন',
      hi: 'सत्यापित राज्य और केंद्र सरकारी योजनाओं को आसानी से समझें',
      en: 'Discover Verified State & Central Welfare Schemes',
    },
    summary: {
      bn: 'অন্নপূর্ণা যোজনা, কন্যাশ্রী, স্বাস্থ্য সাথী ও ই-শ্রম-এর মতো সরকারি প্রকল্প সহজ বাংলায় বুঝুন এবং সরাসরি অফিসিয়াল .gov.in পোর্টালে যান।',
      hi: 'अन्नपूर्णा योजना, कन्याश्री, स्वास्थ्य साथी और ई-श्रम जैसी सरकारी योजनाओं को सरल हिंदी में समझें और सीधे आधिकारिक .gov.in पोर्टल पर जाएं।',
      en: 'Filter West Bengal and Government of India schemes like Annapurna Yojana, Kanyashree, Swasthya Sathi, and e-Shram in plain language, with direct links to official .gov.in portals.',
    },
    highlights: [
      {
        bn: 'সহজ বাংলা, হিন্দি ও ইংরেজি সারসংক্ষেপ',
        hi: 'सरल बंगाली, हिंदी और अंग्रेजी सारांश',
        en: 'Plain-language Bengali, English & Hindi summaries',
      },
      {
        bn: 'বিল্ট-ইন প্রকল্প অনুসন্ধান সহায়ক ফিল্টার',
        hi: 'बिल्ट-इन योजना खोज सहायक फ़िल्टर',
        en: 'Built-in Scheme Discovery Assistant filter',
      },
      {
        bn: 'প্রতিটি তালিকায় যাচাই অবস্থা ও অফিসিয়াল URL দেখানো হয়',
        hi: 'प्रत्येक सूची में सत्यापन स्थिति और आधिकारिक URL दिखता है',
        en: 'Every listing displays its verification status & official URL',
      },
    ],
    Icon: Building3DIcon,
  },
  {
    id: 'checklist',
    path: '/checklist',
    badge: {
      bn: 'ধাপ ৩ / ৫ · JENOVA Checklist',
      hi: 'चरण 3 / 5 · JENOVA Checklist',
      en: 'Step 3 of 5 · JENOVA Checklist',
    },
    tabLabel: { bn: '৩. চেকলিস্ট', hi: '3. चेकलिस्ट', en: '3. Checklist' },
    title: {
      bn: 'অফিস বা BSK যাওয়ার আগে আপনার কাগজপত্র ফোল্ডার যাচাই করুন',
      hi: 'कार्यालय या BSK जाने से पहले अपने दस्तावेज़ फोल्डर की जांच करें',
      en: 'Prepare Your Document Folder Offline Before Visiting Any Office',
    },
    summary: {
      bn: 'অসম্পূর্ণ কাগজ বা নামের বানানের ভুলের জন্য বারবার অফিস থেকে ফিরে আসা এড়ান। আপনার ফোনেই প্রতিটি কাগজ টিক দিয়ে অফলাইনে সেভ ও প্রিন্ট করুন।',
      hi: 'अधूरे कागज़ या नाम की वर्तनी की गलती से बार-बार कार्यालय के चक्कर लगाने से बचें। अपने फोन में ही हर दस्तावेज़ पर टिक लगाकर ऑफलाइन सेव और प्रिंट करें।',
      en: 'Avoid wasted trips caused by missing photocopies or mismatched Aadhaar-bank spellings. Tick off each document locally on your device, print or download your checklist, with zero uploads required.',
    },
    highlights: [
      {
        bn: 'আপনার ব্রাউজারেই ১০০% অফলাইনে সেভ হয় — কোনো আপলোড লাগে না',
        hi: 'आपके ब्राउज़र में ही 100% ऑफलाइन सहेजा जाता है — कोई अपलोड नहीं',
        en: 'Saved 100% offline inside your own browser — zero uploads',
      },
      {
        bn: 'আধার-পাসবই নামের মিল ও DBT সিডিং যাচাই করে',
        hi: 'आधार-पासबुक नाम मिलान और DBT सीडिंग जांचता है',
        en: 'Checks Aadhaar-Passbook name match & DBT seeding',
      },
      {
        bn: 'প্রিন্টযোগ্য ও হোয়াটসঅ্যাপে শেয়ারযোগ্য চেকলিস্ট',
        hi: 'प्रिंट और व्हाट्सएप शेयर करने योग्य चेकलिस्ट',
        en: 'Printable & WhatsApp-shareable checklist export',
      },
    ],
    Icon: Clipboard3DIcon,
  },
  {
    id: 'voice',
    path: '/assistant',
    badge: {
      bn: 'ধাপ ৪ / ৫ · JENOVA Voice',
      hi: 'चरण 4 / 5 · JENOVA Voice',
      en: 'Step 4 of 5 · JENOVA Voice',
    },
    tabLabel: { bn: '৪. ভয়েস', hi: '4. वॉयस', en: '4. Voice' },
    title: {
      bn: 'বাংলায় কথা বলুন ও স্বাভাবিক বাংলা কণ্ঠে উত্তর শুনুন',
      hi: 'हिंदी या बंगाली में बोलें और स्पष्ट आवाज़ में उत्तर सुनें',
      en: 'Speak & Listen in Natural Bengali, Hindi & English Voice',
    },
    summary: {
      bn: 'প্রথমবার স্মার্টফোন ব্যবহারকারীদের জন্য তৈরি। বাংলায় প্রশ্ন করুন এবং পরিষ্কার স্বাভাবিক বাংলা কণ্ঠে উত্তর শুনুন।',
      hi: 'पहली बार स्मार्टफोन उपयोगकर्ताओं के लिए निर्मित। अपनी भाषा में सवाल पूछें और स्पष्ट आवाज़ में सत्यापित उत्तर सुनें।',
      en: 'Designed for first-time smartphone users across India. Ask questions by voice or tap, get concise grounded answers, and listen via clear natural neural speech.',
    },
    highlights: [
      {
        bn: 'JENOVA-র যাচাইকৃত স্থানীয় ও অফিসিয়াল তথ্যের ভিত্তিতে উত্তর',
        hi: 'JENOVA के सत्यापित स्थानीय और आधिकारिक रिकॉर्ड पर आधारित उत्तर',
        en: 'Grounded strictly in JENOVA verified local & portal records',
      },
      {
        bn: 'স্বাভাবিক বাংলা, হিন্দি ও ভারতীয় ইংরেজি নিউরাল রিড-অ্যালাউড',
        hi: 'स्वाभाविक हिंदी, बंगाली और भारतीय अंग्रेजी न्यूरल रीड-अलाउड',
        en: 'Natural Bengali, Hindi & Indian English neural Read-Aloud',
      },
      {
        bn: 'কখনোই ভুয়া ক্যাম্পের তারিখ বা নিশ্চিত অনুমোদনের প্রতিশ্রুতি দেয় না',
        hi: 'कभी भी गलत कैंप तिथि या गारंटीशुदा स्वीकृति का दावा नहीं करता',
        en: 'Never fabricates camp dates or guarantees approvals',
      },
    ],
    Icon: Microphone3DIcon,
  },
  {
    id: 'local',
    path: '/local-help',
    badge: {
      bn: 'ধাপ ৫ / ৫ · JENOVA Local',
      hi: 'चरण 5 / 5 · JENOVA Local',
      en: 'Step 5 of 5 · JENOVA Local',
    },
    tabLabel: { bn: '৫. স্থানীয়', hi: '5. स्थानीय', en: '5. Local' },
    title: {
      bn: 'যাচাইকৃত বাংলা সহায়তা কেন্দ্র (BSK), BDO ও স্থানীয় সহায়তা',
      hi: 'सत्यापित स्थानीय सहायता केंद्र (BSK), BDO और हेल्पलाइन',
      en: 'Reach Verified Local Assistance Centres & Helplines',
    },
    summary: {
      bn: 'কোনো দালাল ছাড়াই বিনামূল্যে সহায়তার জন্য যাচাইকৃত বাংলা সহায়তা কেন্দ্র, জেলা ও বিডিও ডিরেক্টরি, কমন সার্ভিস সেন্টার ও জরুরি হেল্পলাইন খুঁজুন।',
      hi: 'बिना किसी बिचौलिये के निःशुल्क सहायता के लिए सत्यापित बांग्ला सहायता केंद्र, जिला व बीडीओ डायरेक्टरी, कॉमन सर्विस सेंटर और आपातकालीन हेल्पलाइन खोजें।',
      en: 'Locate verified Bangla Sahayata Kendra (BSK) desks, District & BDO portals, CSC Digital Seva centres, RSETI free training, and emergency helplines without paying middlemen.',
    },
    highlights: [
      {
        bn: 'প্রতিটি তালিকায় যাচাই স্তর ও সর্বশেষ পরীক্ষার তারিখ দেখানো হয়',
        hi: 'प्रत्येक प्रविष्टि पर सत्यापन स्तर और अंतिम जांच तिथि दिखाई जाती है',
        en: 'Shows verification tier & last-checked date on every entry',
      },
      {
        bn: 'জাতীয়, রাজ্য ও জেলা স্তরের যাচাইকৃত নাগরিক পোর্টাল',
        hi: 'राष्ट्रीय, राज्य और जिला स्तरीय सत्यापित नागरिक पोर्टल',
        en: 'Covers National, State & District verified citizen portals',
      },
      {
        bn: 'বিনামূল্যে ১-মিনিটের মোবাইল বায়োডাটা (CV) বিল্ডার ও ক্যালকুলেটর',
        hi: 'निःशुल्क 1-मिनट मोबाइल बायोडाटा (CV) बिल्डर और कैलकुलेटर',
        en: 'Includes free 1-minute mobile Biodata (CV) builder & calculators',
      },
    ],
    Icon: LocationPin3DIcon,
  },
];

export function WatchDemoModal({ open, onClose }: WatchDemoModalProps) {
  const { language, navigate } = useApp();
  const [stepIdx, setStepIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (!open) {
      setAutoPlay(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !autoPlay) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [open, autoPlay]);

  if (!open) return null;

  const current = DEMO_STEPS[stepIdx];
  const StepIcon = current.Icon;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#041328]/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jenova-demo-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0B2242] border border-[#70B8F2]/40 dark:border-[#36E7F2]/30 shadow-2xl overflow-hidden text-[#092B55] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#092B55] via-[#0E4378] to-[#0E5E47] text-white flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#36E7F2]">
              {pickText(current.badge, language)}
            </p>
            <h2 id="jenova-demo-title" className="text-base sm:text-lg font-bold mt-0.5">
              {tr(
                language,
                'JENOVA ইন্টারেক্টিভ ডেমো ট্যুর',
                'JENOVA इंटरैक्टिव डेमो टूर',
                'JENOVA Interactive Platform Walkthrough'
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>
                {autoPlay
                  ? tr(language, 'থামান', 'रोकें', 'Pause')
                  : tr(language, 'অটো ট্যুর', 'ऑटो टूर', 'Auto Tour')}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={tr(language, 'ডেমো বন্ধ করুন', 'डेमो बंद करें', 'Close demo')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step selector tabs */}
        <div className="px-6 pt-4 flex items-center gap-1.5 overflow-x-auto border-b border-[#D4E4F4] dark:border-white/10 pb-3">
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setAutoPlay(false);
                setStepIdx(idx);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                idx === stepIdx
                  ? 'bg-[#092B55] dark:bg-[#36E7F2] text-white dark:text-[#041328]'
                  : 'bg-[#EFF7FF] dark:bg-white/10 text-[#2D4D73] dark:text-[#BFE8FF] hover:bg-[#DCEEFF] dark:hover:bg-white/15'
              }`}
            >
              {pickText(s.tabLabel, language)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#EFF7FF] to-[#D6EEFF] dark:from-[#0F315E] dark:to-[#08203F] border border-[#70B8F2]/40 flex items-center justify-center shrink-0 shadow-inner">
              <StepIcon size={58} />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg sm:text-xl font-bold leading-snug">
                {pickText(current.title, language)}
              </h3>
              <p className="text-sm text-[#3A5676] dark:text-[#CBE3FA] leading-relaxed">
                {pickText(current.summary, language)}
              </p>
            </div>
          </div>

          <ul className="space-y-2 rounded-xl bg-[#F4F9FE] dark:bg-[#071A34] border border-[#D4E4F4] dark:border-white/10 p-4">
            {current.highlights.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1E3B5A] dark:text-[#DCF0FF]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#138A45] dark:text-[#36E7F2] shrink-0 mt-0.5" />
                <span>{pickText(item, language)}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <ReadAloudButton
              lang={language}
              text={`${pickText(current.title, language)}। ${pickText(current.summary, language)}`}
            />
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setStepIdx((prev) => (prev + 1) % DEMO_STEPS.length)}
                className="px-4 py-2.5 rounded-xl border border-[#70B8F2]/50 text-xs sm:text-sm font-semibold text-[#092B55] dark:text-white hover:bg-[#EFF7FF] dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {tr(language, 'পরবর্তী ধাপ', 'अगला चरण', 'Next Step')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(current.path);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#138A45] to-[#0D5C36] hover:brightness-110 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer"
              >
                <span>{tr(language, 'লাইভ টুল খুলুন', 'लाइव टूल खोलें', 'Open Live Tool')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
