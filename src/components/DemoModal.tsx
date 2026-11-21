import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Play, Sparkles, Volume2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pickText, tr } from '../i18n/translations';
import type { LocalizedText } from '../types/platform';
import {
  Checklist3DIcon,
  LocalPin3DIcon,
  Schemes3DIcon,
  Shield3DIcon,
  Voice3DIcon,
} from './JenovaIcons3D';
import { ReadAloudButton } from './VoiceAccessibility';

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

interface DemoSlide {
  id: string;
  title: string;
  subtitle: LocalizedText;
  description: LocalizedText;
  route: string;
  cta: LocalizedText;
  icon: typeof Shield3DIcon;
  sampleVoice?: LocalizedText;
  highlights: LocalizedText[];
}

const DEMO_SLIDES: DemoSlide[] = [
  {
    id: 'protect',
    title: 'JENOVA Protect',
    subtitle: {
      bn: 'তাৎক্ষণিক প্রতারণা ও সন্দেহজনক চাকরির অফার যাচাই',
      hi: 'तत्काल धोखाधड़ी और संदिग्ध नौकरी ऑफर की जांच',
      en: 'Instant Fraud & Suspicious Job Offer Screening',
    },
    description: {
      bn: 'যেকোনো হোয়াটসঅ্যাপ চাকরির ফরোয়ার্ড, ভুয়া লোনের বার্তা বা সন্দেহজনক প্রকল্পের লিঙ্ক পেস্ট করুন। আমাদের নিয়ম ইঞ্জিন ও এআই OTP/UPI ফাঁদ শনাক্ত করে সরাসরি ন্যাশনাল সাইবার হেল্পলাইন ১৯৩০-এর সাথে যুক্ত করে।',
      hi: 'किसी भी व्हाट्सएप नौकरी संदेश, नकली लोन ऑफर या संदिग्ध योजना लिंक को पेस्ट करें। हमारा नियम इंजन और एआई OTP/UPI जाल पहचानकर सीधे राष्ट्रीय साइबर हेल्पलाइन 1930 से जोड़ता है।',
      en: 'Paste any WhatsApp job forward, fake loan message, or suspicious scheme link. Our rule engine + AI highlights OTP/UPI traps and links directly to National Cyber Helpline 1930.',
    },
    route: '/scam-check',
    cta: {
      bn: 'JENOVA Protect লাইভ ব্যবহার করুন',
      hi: 'JENOVA Protect लाइव आज़माएं',
      en: 'Try JENOVA Protect Live',
    },
    icon: Shield3DIcon,
    highlights: [
      {
        bn: 'অগ্রিম ফি চাওয়া ভুয়া চাকরি, নকল .apk লিঙ্ক ও UPI QR প্রতারণা শনাক্ত করে',
        hi: 'अग्रिम शुल्क वाली नकली नौकरी, फर्जी .apk लिंक और UPI QR धोखाधड़ी पहचानता है',
        en: 'Detects advance-fee job traps, fake .apk links & UPI QR scams',
      },
      {
        bn: 'কখনোই OTP, আধার নম্বর বা ব্যাংকের তথ্য সংগ্রহ করা হয় না',
        hi: 'कभी भी OTP, आधार या बैंक विवरण एकत्र नहीं किया जाता',
        en: 'Zero OTP, Aadhaar, or bank details ever collected',
      },
      {
        bn: 'সরাসরি ১৯৩০ ও cybercrime.gov.in-এ এক ট্যাপে পৌঁছানোর সুবিধা',
        hi: '1930 और cybercrime.gov.in पर सीधे एक टैप में पहुंचने की सुविधा',
        en: 'Direct one-tap access to 1930 & cybercrime.gov.in',
      },
    ],
  },
  {
    id: 'schemes',
    title: 'JENOVA Schemes',
    subtitle: {
      bn: 'যাচাইকৃত রাজ্য ও কেন্দ্রীয় সরকারি প্রকল্প',
      hi: 'सत्यापित राज्य और केंद्र सरकार की योजनाएं',
      en: 'Verified West Bengal & Central Government Schemes',
    },
    description: {
      bn: 'অন্নপূর্ণা যোজনা, কন্যাশ্রী, স্বাস্থ্য সাথী, কৃষক বন্ধু, ই-শ্রম এবং আরও অনেক প্রকল্প সহজ ভাষায় জানুন এবং সরাসরি অফিসিয়াল .gov.in পোর্টালে যান।',
      hi: 'अन्नपूर्णा योजना, कन्याश्री, स्वास्थ्य साथी, कृषक बंधु, ई-श्रम और अन्य योजनाओं को सरल भाषा में समझें और सीधे आधिकारिक .gov.in पोर्टल पर जाएं।',
      en: 'Explore Annapurna Yojana, Kanyashree, Swasthya Sathi, Krishak Bandhu, e-Shram and more in clear everyday language with direct links to official .gov.in portals.',
    },
    route: '/schemes',
    cta: {
      bn: 'JENOVA Schemes দেখুন',
      hi: 'JENOVA Schemes देखें',
      en: 'Explore JENOVA Schemes',
    },
    icon: Schemes3DIcon,
    highlights: [
      {
        bn: 'বয়স, লিঙ্গ ও পেশা অনুযায়ী নিরাপদে প্রকল্প ফিল্টার করুন',
        hi: 'आयु, लिंग और व्यवसाय के आधार पर सुरक्षित रूप से योजनाएं फ़िल्टर करें',
        en: 'Filter schemes by age, gender, and occupation safely',
      },
      {
        bn: 'সহজ বাংলা, হিন্দি ও ইংরেজিতে স্পষ্ট ব্যাখ্যা',
        hi: 'सरल बंगाली, हिंदी और अंग्रेजी में स्पष्ट व्याख्या',
        en: 'Plain-language Bengali, English & Hindi explanations',
      },
      {
        bn: 'প্রতিটি প্রকল্প পেজে যাচাইকৃত তথ্যের ভিত্তিতে এআই প্রশ্নোত্তর',
        hi: 'प्रत्येक योजना पृष्ठ पर सत्यापित जानकारी आधारित एआई प्रश्नोत्तर',
        en: 'Grounded AI Scheme Q&A directly on each scheme page',
      },
    ],
  },
  {
    id: 'checklist',
    title: 'JENOVA Checklist',
    subtitle: {
      bn: 'অফিস যাওয়ার আগে অফলাইন কাগজপত্র প্রস্তুতি',
      hi: 'कार्यालय जाने से पहले ऑफलाइन दस्तावेज़ तैयारी',
      en: 'Offline Pre-Visit Document Preparation',
    },
    description: {
      bn: 'BSK বা BDO অফিসে বারবার ঘোরাঘুরি এড়ান। প্রতিটি প্রয়োজনীয় নথি টিক দিন, নাম/জন্মতারিখের অমিল আগে ধরুন এবং ফোল্ডার চেকলিস্ট প্রিন্ট বা শেয়ার করুন — সবকিছু ১০০% আপনার ফোনেই সেভ থাকবে।',
      hi: 'BSK या BDO कार्यालय के अनावश्यक चक्कर से बचें। हर आवश्यक दस्तावेज़ पर टिक लगाएं, नाम/जन्मतिथि की त्रुटि पहले पकड़ें और चेकलिस्ट प्रिंट या शेयर करें — सब कुछ 100% आपके फोन में ही सुरक्षित रहेगा।',
      en: 'Avoid wasted trips to BSK or BDO offices. Check off every required document, spot name/DOB mismatches early, and print or share your checklist — stored 100% locally on your phone.',
    },
    route: '/checklist',
    cta: {
      bn: 'JENOVA Checklist খুলুন',
      hi: 'JENOVA Checklist खोलें',
      en: 'Open JENOVA Checklist',
    },
    icon: Checklist3DIcon,
    highlights: [
      {
        bn: 'কোনো সংবেদনশীল নথি আপলোড না করেই অফলাইনে কাজ করে',
        hi: 'बिना कोई संवेदनशील दस्तावेज़ अपलोड किए ऑफलाइन काम करता है',
        en: 'Works offline without uploading sensitive documents',
      },
      {
        bn: 'ডাউনলোডযোগ্য ও হোয়াটসঅ্যাপে শেয়ারযোগ্য ফোল্ডার চেকলিস্ট',
        hi: 'डाउनलोड और व्हाट्सएप शेयर करने योग्य फोल्डर चेकलिस्ट',
        en: 'Downloadable & WhatsApp-shareable folder checklist',
      },
      {
        bn: 'আধার-ব্যাংক DBT সিডিং ও জেরক্স কপি যাচাই অন্তর্ভুক্ত',
        hi: 'आधार-बैंक DBT सीडिंग और फोटोकॉपी जांच शामिल',
        en: 'Covers Aadhaar-Bank DBT seeding & photocopy checks',
      },
    ],
  },
  {
    id: 'voice',
    title: 'JENOVA Voice',
    subtitle: {
      bn: 'স্বাভাবিক বাংলা, হিন্দি ও ইংরেজি ভয়েস সহায়ক',
      hi: 'स्वाभाविक बंगाली, हिंदी और अंग्रेजी वॉयस सहायक',
      en: 'Natural Bengali, Hindi & English Voice Assistant',
    },
    description: {
      bn: 'বাংলা বা হিন্দিতে স্বাভাবিকভাবে কথা বলুন এবং নিউরাল স্পিচ প্রযুক্তিতে স্পষ্ট কণ্ঠে উত্তর শুনুন — প্রথমবার স্মার্টফোন ব্যবহারকারীদের জন্য বিশেষভাবে তৈরি।',
      hi: 'हिंदी या बंगाली में स्वाभाविक रूप से बोलें और न्यूरल स्पीच तकनीक से स्पष्ट आवाज़ में उत्तर सुनें — पहली बार स्मार्टफोन उपयोगकर्ताओं के लिए विशेष रूप से डिज़ाइन किया गया।',
      en: 'Speak naturally in Bengali, Hindi, or English and listen to warm, clear voice responses powered by neural speech synthesis — designed for first-time smartphone users.',
    },
    route: '/assistant',
    cta: {
      bn: 'JENOVA Voice-এর সাথে কথা বলুন',
      hi: 'JENOVA Voice से बात करें',
      en: 'Talk to JENOVA Voice',
    },
    icon: Voice3DIcon,
    sampleVoice: {
      bn: 'নমস্কার! জেনোভা প্ল্যাটফর্মে আপনাকে স্বাগতম। নতুন সম্ভাবনা, সবার জন্য। সরকারি প্রকল্প, ডিজিটাল নিরাপত্তা এবং স্থানীয় সহায়তার জন্য আমাকে যেকোনো প্রশ্ন করুন।',
      hi: 'नमस्कार! जेनोवा प्लेटफॉर्म में आपका स्वागत है। नई संभावनाएं, सभी के लिए। सरकारी योजनाओं, डिजिटल सुरक्षा और स्थानीय सहायता के लिए मुझसे कोई भी सवाल पूछें।',
      en: 'Welcome to JENOVA — A New Way to Grow Together. Ask me any question about government schemes, digital safety, jobs, or local support.',
    },
    highlights: [
      {
        bn: 'মাইক্রোফোনে কথা বলুন বা দ্রুত প্রশ্নগুলোতে ট্যাপ করুন',
        hi: 'माइक्रोफोन से बोलें या त्वरित प्रश्नों पर टैप करें',
        en: 'Speak via microphone or tap quick questions',
      },
      {
        bn: 'স্বাভাবিক বাংলা, হিন্দি ও ভারতীয় ইংরেজি নিউরাল রিড-অ্যালাউড অডিও',
        hi: 'स्वाभाविक हिंदी, बंगाली और भारतीय अंग्रेजी न्यूरल रीड-अलाउड ऑडियो',
        en: 'Authentic Bengali, Hindi & Indian English neural Read-Aloud audio',
      },
      {
        bn: 'কঠোর নিরাপত্তা সুরক্ষা: কখনোই আধার, OTP বা UPI PIN গ্রহণ করে না',
        hi: 'कठोर सुरक्षा नियम: आधार, OTP और UPI PIN को सख्ती से अस्वीकार करता है',
        en: 'Strict safety guardrail: refuses Aadhaar, OTP & UPI PINs',
      },
    ],
  },
  {
    id: 'local',
    title: 'JENOVA Local',
    subtitle: {
      bn: 'যাচাইকৃত স্থানীয় সহায়তা কেন্দ্র ও অফিসিয়াল হেল্পলাইন',
      hi: 'सत्यापित स्थानीय सहायता केंद्र और आधिकारिक हेल्पलाइन',
      en: 'Verified Local Assistance & Official Helplines',
    },
    description: {
      bn: 'যাচাইকৃত বাংলা সহায়তা কেন্দ্র (BSK), জেলা ও BDO ডিরেক্টরি, CSC ডিজিটাল সেবা ডেস্ক, দুয়ারে সরকার পোর্টাল এবং RSETI প্রশিক্ষণ কেন্দ্র খুঁজে নিন স্বচ্ছ যাচাই তারিখের সাথে।',
      hi: 'सत्यापित बांग्ला सहायता केंद्र (BSK), जिला व BDO डायरेक्टरी, CSC डिजिटल सेवा डेस्क, दुआरे सरकार पोर्टल और RSETI प्रशिक्षण केंद्र पारदर्शी सत्यापन तिथि के साथ खोजें।',
      en: 'Find verified Bangla Sahayata Kendra (BSK), District & BDO directories, CSC Digital Seva desks, Duare Sarkar portals, and RSETI training centres with transparent verification dates.',
    },
    route: '/local-help',
    cta: {
      bn: 'স্থানীয় সহায়তা খুঁজুন',
      hi: 'स्थानीय सहायता खोजें',
      en: 'Find Local Support',
    },
    icon: LocalPin3DIcon,
    highlights: [
      {
        bn: 'প্রতিটি কেন্দ্রে যাচাই স্তর ও সর্বশেষ পরীক্ষার তারিখ দেখানো হয়',
        hi: 'प्रत्येक केंद्र पर सत्यापन स्तर और अंतिम जांच की तिथि दिखाई जाती है',
        en: 'Every centre shows verification tier & last-checked date',
      },
      {
        bn: 'কোনো ভুয়া ফোন নম্বর বা অযাচাইকৃত দালাল নেই',
        hi: 'कोई नकली फोन नंबर या असत्यापित बिचौलिया नहीं',
        en: 'No fabricated phone numbers or unverified middlemen',
      },
      {
        bn: 'ইনস্টলযোগ্য PWA হিসেবে অফলাইনেও কাজ করে',
        hi: 'इंस्टॉल करने योग्य PWA के रूप में ऑफलाइन भी काम करता है',
        en: 'Works offline once cached as an installable PWA',
      },
    ],
  },
];

export function DemoModal({ open, onClose }: DemoModalProps) {
  const { navigate, language } = useApp();
  const [activeIdx, setActiveIdx] = useState(0);

  if (!open) return null;

  const slide = DEMO_SLIDES[activeIdx];
  const IconComp = slide.icon;

  const handleLaunch = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#26364B]/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jenova-demo-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#4A3522] shadow-2xl overflow-hidden text-[#26364B] dark:text-[#FFF5E8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FFF1DF] via-[#FFE5C2] to-[#FFF1DF] dark:from-[#2C1F14] dark:via-[#382616] dark:to-[#2C1F14] border-b border-[#F2DCC1] dark:border-[#4A3522] text-[#26364B] dark:text-[#FFF5E8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#4A3522] flex items-center justify-center shrink-0">
              <Play className="w-3.5 h-3.5 text-[#A85B0A] dark:text-[#FFD19A] fill-current ml-0.5" />
            </span>
            <div>
              <h2 id="jenova-demo-title" className="text-base font-bold leading-tight">
                {tr(
                  language,
                  'ইন্টারেক্টিভ প্ল্যাটফর্ম পরিচিতি — JENOVA',
                  'इंटरैक्टिव प्लेटफॉर्म परिचय — JENOVA',
                  'Interactive Platform Walkthrough — JENOVA'
                )}
              </h2>
              <p className="text-[11px] text-[#665B4F] dark:text-[#C9B8A5]">
                {tr(
                  language,
                  '৫টি কার্যকর কমিউনিটি টুল দেখুন ও লাইভ ভয়েস অডিও পরীক্ষা করুন',
                  'सभी 5 कार्यशील सामुदायिक टूल्स देखें और लाइव वॉयस ऑडियो आज़माएं',
                  'Explore all 5 working community tools & test live voice audio'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr(language, 'ডেমো বন্ধ করুন', 'डेमो बंद करें', 'Close demo')}
            className="p-2 rounded-full bg-white/80 dark:bg-[#241B13] hover:bg-white dark:hover:bg-[#382616] border border-[#F2DCC1] dark:border-[#4A3522] text-[#26364B] dark:text-[#FFF5E8] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="px-6 pt-4 pb-3 flex flex-wrap gap-2 border-b border-[#F2DCC1] dark:border-[#3F2E1E] bg-[#FFF9F0] dark:bg-[#1E160F]">
          {DEMO_SLIDES.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                idx === activeIdx
                  ? 'jenova-saffron-btn font-bold'
                  : 'bg-white dark:bg-[#241B13] text-[#454545] dark:text-[#DDD2C5] border border-[#F2DCC1] dark:border-[#4A3522] hover:border-[#F4A340]'
              }`}
            >
              {idx + 1}. {item.title}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-[#FFF9F0] via-[#FFF1DF] to-[#FFE5C2]/70 dark:from-[#2A1F15] dark:to-[#352414] border border-[#F2DCC1] dark:border-[#4A3522]">
            <IconComp size={88} />
            <span className="mt-3 text-sm font-extrabold text-[#26364B] dark:text-[#FFF5E8]">
              {slide.title}
            </span>
            <span className="text-[11px] text-[#27845B] dark:text-[#45B884] font-semibold mt-0.5">
              {tr(language, 'লাইভ কার্যকর মডিউল', 'लाइव कार्यशील मॉड्यूल', 'Live Working Module')}
            </span>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#A85B0A] dark:text-[#FFD19A] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F4A340]" />
                <span>
                  {tr(
                    language,
                    `ধাপ ${activeIdx + 1} / ৫`,
                    `चरण ${activeIdx + 1} / 5`,
                    `Step ${activeIdx + 1} of 5`
                  )}
                </span>
              </p>
              <h3 className="text-xl sm:text-2xl font-extrabold mt-1 text-[#26364B] dark:text-[#FFF5E8]">
                {pickText(slide.subtitle, language)}
              </h3>
              <p className="mt-2 text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
                {pickText(slide.description, language)}
              </p>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-[#454545] dark:text-[#DDD2C5]">
              {slide.highlights.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#27845B] dark:text-[#45B884] shrink-0 mt-0.5" />
                  <span>{pickText(pt, language)}</span>
                </li>
              ))}
            </ul>

            {slide.sampleVoice && (
              <div className="p-3.5 rounded-xl bg-[#FFF9F0] dark:bg-[#1E160F] border border-[#F2DCC1] dark:border-[#4A3522] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#26364B] dark:text-[#FFF5E8]">
                  <Volume2 className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
                  <span>
                    {tr(
                      language,
                      'এখানেই লাইভ বাংলা নিউরাল ভয়েস পরীক্ষা করুন:',
                      'यहीं लाइव हिंदी न्यूरल वॉयस सुनें:',
                      'Test live Neural Voice right here:'
                    )}
                  </span>
                </div>
                <ReadAloudButton lang={language} text={pickText(slide.sampleVoice, language)} />
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleLaunch(slide.route)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full jenova-saffron-btn text-xs sm:text-sm font-bold cursor-pointer"
              >
                <span>{pickText(slide.cta, language)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((prev) => (prev - 1 + DEMO_SLIDES.length) % DEMO_SLIDES.length)
                  }
                  className="px-3.5 py-2 rounded-full border border-[#F2DCC1] dark:border-[#4A3522] text-xs font-semibold text-[#26364B] dark:text-[#FFF5E8] hover:bg-[#FFF1DF] dark:hover:bg-[#382616] cursor-pointer"
                >
                  {tr(language, 'পূর্ববর্তী', 'पिछला', 'Previous')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIdx((prev) => (prev + 1) % DEMO_SLIDES.length)}
                  className="px-3.5 py-2 rounded-full bg-[#26364B] dark:bg-[#F4A340] text-white dark:text-[#26364B] text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  {tr(language, 'পরবর্তী →', 'अगला →', 'Next →')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
