import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Pause, Play, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
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

const DEMO_STEPS = [
  {
    id: 'protect',
    path: '/scam-check',
    badge: 'Step 1 of 5 · JENOVA Protect',
    titleEn: 'Verify Suspicious Jobs, Links & UPI Scams Before Paying',
    titleBn: 'টাকা বা OTP দেওয়ার আগে ভুয়া চাকরি ও প্রতারণা যাচাই করুন',
    summaryEn:
      'Paste any WhatsApp job offer, loan link, or scholarship SMS into JENOVA Protect. Our rule engine flags advance-fee traps, fake .gov links, and OTP scams instantly — and connects you directly to National Cyber Helpline 1930.',
    summaryBn:
      'যেকোনো হোয়াটসঅ্যাপ চাকরির মেসেজ, লোনের লিঙ্ক বা বৃত্তির এসএমএস JENOVA Protect-এ পেস্ট করুন। এটি তৎক্ষণাৎ প্রতারণার লক্ষণ ধরিয়ে দেয় এবং সরাসরি ১৯৩০ হেল্পলাইন দেখায়।',
    highlightsEn: [
      'Detects upfront fee & UPI PIN requests automatically',
      'Never asks for your Aadhaar, OTP, or bank credentials',
      'Direct links to Cyber Helpline 1930 & cybercrime.gov.in',
    ],
    Icon: Shield3DIcon,
  },
  {
    id: 'schemes',
    path: '/schemes',
    badge: 'Step 2 of 5 · JENOVA Schemes',
    titleEn: 'Discover Verified State & Central Welfare Schemes',
    titleBn: 'যাচাইকৃত রাজ্য ও কেন্দ্রীয় সরকারি প্রকল্প সহজে জানুন',
    summaryEn:
      'Filter West Bengal and Government of India schemes like Annapurna Yojana, Kanyashree, Swasthya Sathi, and e-Shram in plain language, with direct links to official .gov.in portals.',
    summaryBn:
      'অন্নপূর্ণা যোজনা, কন্যাশ্রী, স্বাস্থ্য সাথী ও ই-শ্রম-এর মতো সরকারি প্রকল্প সহজ বাংলায় বুঝুন এবং সরাসরি অফিসিয়াল .gov.in পোর্টালে যান।',
    highlightsEn: [
      'Plain-language Bengali, English & Hindi summaries',
      'Built-in Scheme Discovery Assistant filter',
      'Every listing displays its verification status & official URL',
    ],
    Icon: Building3DIcon,
  },
  {
    id: 'checklist',
    path: '/checklist',
    badge: 'Step 3 of 5 · JENOVA Checklist',
    titleEn: 'Prepare Your Document Folder Offline Before Visiting Any Office',
    titleBn: 'অফিস বা BSK যাওয়ার আগে আপনার কাগজপত্র ফোল্ডার যাচাই করুন',
    summaryEn:
      'Avoid wasted trips caused by missing photocopies or mismatched Aadhaar-bank spellings. Tick off each document locally on your device, print or download your checklist, with zero uploads required.',
    summaryBn:
      'অসম্পূর্ণ কাগজ বা নামের বানানের ভুলের জন্য বারবার অফিস থেকে ফিরে আসা এড়ান। আপনার ফোনেই প্রতিটি কাগজ টিক দিয়ে অফলাইনে সেভ ও প্রিন্ট করুন।',
    highlightsEn: [
      'Saved 100% offline inside your own browser — zero uploads',
      'Checks Aadhaar-Passbook name match & DBT seeding',
      'Printable & WhatsApp-shareable checklist export',
    ],
    Icon: Clipboard3DIcon,
  },
  {
    id: 'voice',
    path: '/assistant',
    badge: 'Step 4 of 5 · JENOVA Voice',
    titleEn: 'Speak & Listen in Natural Bengali Voice',
    titleBn: 'বাংলায় কথা বলুন ও স্বাভাবিক বাংলা কণ্ঠে উত্তর শুনুন',
    summaryEn:
      'Designed for first-time smartphone users across West Bengal and India. Ask questions by voice or tap, get concise grounded answers, and listen via clear natural Bengali neural speech.',
    summaryBn:
      'প্রথমবার স্মার্টফোন ব্যবহারকারীদের জন্য তৈরি। বাংলায় প্রশ্ন করুন এবং পরিষ্কার স্বাভাবিক বাংলা কণ্ঠে উত্তর শুনুন।',
    highlightsEn: [
      'Grounded strictly in JENOVA verified local & portal records',
      'Natural Bengali, Hindi & Indian English neural Read-Aloud',
      'Never fabricates camp dates or guarantees approvals',
    ],
    Icon: Microphone3DIcon,
  },
  {
    id: 'local',
    path: '/local-help',
    badge: 'Step 5 of 5 · JENOVA Local',
    titleEn: 'Reach Verified Local Assistance Centres & Helplines',
    titleBn: 'যাচাইকৃত বাংলা সহায়তা কেন্দ্র (BSK), BDO ও স্থানীয় সহায়তা',
    summaryEn:
      'Locate verified Bangla Sahayata Kendra (BSK) desks, District & BDO portals, CSC Digital Seva centres, RSETI free training, and emergency helplines without paying middlemen.',
    summaryBn:
      'কোনো দালাল ছাড়াই বিনামূল্যে সহায়তার জন্য যাচাইকৃত বাংলা সহায়তা কেন্দ্র, জেলা ও বিডিও ডিরেক্টরি, কমন সার্ভিস সেন্টার ও জরুরি হেল্পলাইন খুঁজুন।',
    highlightsEn: [
      'Shows verification tier & last-checked date on every entry',
      'Covers National, State & District verified citizen portals',
      'Includes free 1-minute mobile Biodata (CV) builder & calculators',
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
            <p className="text-xs font-semibold text-[#36E7F2]">{current.badge}</p>
            <h2 id="jenova-demo-title" className="text-base sm:text-lg font-bold mt-0.5">
              {language === 'bn' ? 'JENOVA ইন্টারেক্টিভ ডেমো ট্যুর' : 'JENOVA Interactive Platform Walkthrough'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoPlay ? 'Pause' : 'Auto Tour'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close demo"
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
              {idx + 1}. {s.id.charAt(0).toUpperCase() + s.id.slice(1)}
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
                {language === 'bn' ? current.titleBn : current.titleEn}
              </h3>
              <p className="text-sm text-[#3A5676] dark:text-[#CBE3FA] leading-relaxed">
                {language === 'bn' ? current.summaryBn : current.summaryEn}
              </p>
            </div>
          </div>

          <ul className="space-y-2 rounded-xl bg-[#F4F9FE] dark:bg-[#071A34] border border-[#D4E4F4] dark:border-white/10 p-4">
            {current.highlightsEn.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1E3B5A] dark:text-[#DCF0FF]">
                <CheckCircle2 className="w-4 h-4 text-[#138A45] dark:text-[#36E7F2] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <ReadAloudButton
              lang={language}
              text={
                language === 'bn'
                  ? `${current.titleBn}। ${current.summaryBn}`
                  : `${current.titleEn}. ${current.summaryEn}`
              }
            />
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setStepIdx((prev) => (prev + 1) % DEMO_STEPS.length)}
                className="px-4 py-2.5 rounded-xl border border-[#70B8F2]/50 text-xs sm:text-sm font-semibold text-[#092B55] dark:text-white hover:bg-[#EFF7FF] dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Next Step
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(current.path);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#138A45] to-[#0D5C36] hover:brightness-110 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer"
              >
                <span>Open Live Tool</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
