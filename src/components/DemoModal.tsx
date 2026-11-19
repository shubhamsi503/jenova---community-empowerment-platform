import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Play, Sparkles, Volume2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
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

const DEMO_SLIDES = [
  {
    id: 'protect',
    title: 'JENOVA Protect',
    subtitle: 'Instant Fraud & Suspicious Job Offer Screening',
    description:
      'Paste any WhatsApp job forward, fake loan message, or suspicious scheme link. Our rule engine + AI highlights OTP/UPI traps and links directly to National Cyber Helpline 1930.',
    route: '/scam-check',
    cta: 'Try JENOVA Protect Live',
    icon: Shield3DIcon,
    highlights: [
      'Detects advance-fee job traps, fake .apk links & UPI QR scams',
      'Zero OTP, Aadhaar, or bank details ever collected',
      'Direct one-tap access to 1930 & cybercrime.gov.in',
    ],
  },
  {
    id: 'schemes',
    title: 'JENOVA Schemes',
    subtitle: 'Verified West Bengal & Central Government Schemes',
    description:
      'Explore Lakshmir Bhandar, Kanyashree, Swasthya Sathi, Krishak Bandhu, e-Shram and more in clear everyday language with direct links to official .gov.in portals.',
    route: '/schemes',
    cta: 'Explore JENOVA Schemes',
    icon: Schemes3DIcon,
    highlights: [
      'Filter schemes by age, gender, and occupation safely',
      'Plain-language Bengali, English & Hindi explanations',
      'Grounded AI Scheme Q&A directly on each scheme page',
    ],
  },
  {
    id: 'checklist',
    title: 'JENOVA Checklist',
    subtitle: 'Offline Pre-Visit Document Preparation',
    description:
      'Avoid wasted trips to BSK or BDO offices. Check off every required document, spot name/DOB mismatches early, and print or share your checklist — stored 100% locally on your phone.',
    route: '/checklist',
    cta: 'Open JENOVA Checklist',
    icon: Checklist3DIcon,
    highlights: [
      'Works offline without uploading sensitive documents',
      'Downloadable & WhatsApp-shareable folder checklist',
      'Covers Aadhaar-Bank DBT seeding & photocopy checks',
    ],
  },
  {
    id: 'voice',
    title: 'JENOVA Voice',
    subtitle: 'Natural Bengali, Hindi & English Voice Assistant',
    description:
      'Speak naturally in Bengali and listen to warm, clear Bengali voice responses powered by neural speech synthesis — designed for first-time smartphone users.',
    route: '/assistant',
    cta: 'Talk to JENOVA Voice',
    icon: Voice3DIcon,
    sampleBengali:
      'নমস্কার! জেনোভা প্ল্যাটফর্মে আপনাকে স্বাগতম। নতুন সম্ভাবনা, সবার জন্য। সরকারি প্রকল্প, ডিজিটাল নিরাপত্তা এবং স্থানীয় সহায়তার জন্য আমাকে যেকোনো প্রশ্ন করুন।',
    highlights: [
      'Speak via microphone or tap quick Bengali questions',
      'Authentic West Bengal Bengali neural Read-Aloud audio',
      'Strict safety guardrail: refuses Aadhaar, OTP & UPI PINs',
    ],
  },
  {
    id: 'local',
    title: 'JENOVA Local',
    subtitle: 'Verified Local Assistance & Official Helplines',
    description:
      'Find verified Bangla Sahayata Kendra (BSK), Purba Medinipur BDO directories, Duare Sarkar portals, and RSETI training centres with transparent verification dates.',
    route: '/local-help',
    cta: 'Find Local Support',
    icon: LocalPin3DIcon,
    highlights: [
      'Every centre shows verification tier & last-checked date',
      'No fabricated phone numbers or unverified middlemen',
      'Works offline once cached as an installable PWA',
    ],
  },
];

export function DemoModal({ open, onClose }: DemoModalProps) {
  const { navigate } = useApp();
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
      className="fixed inset-0 z-50 bg-[#041227]/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jenova-demo-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#0B2242] border border-[#36E7F2]/40 shadow-2xl overflow-hidden text-[#092B55] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#092B55] via-[#0D3B6E] to-[#138A45] text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Play className="w-4 h-4 text-[#FFC45C]" />
            <div>
              <h2 id="jenova-demo-title" className="text-base font-bold leading-tight">
                Interactive Platform Walkthrough — JENOVA
              </h2>
              <p className="text-[11px] text-[#CBE6FF]">
                Explore all 5 working community tools & test live Bengali voice audio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close demo"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2 border-b border-[#D6E6F5] dark:border-white/10 bg-[#F3F8FD] dark:bg-[#071A34]">
          {DEMO_SLIDES.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                idx === activeIdx
                  ? 'bg-[#092B55] dark:bg-[#36E7F2] text-white dark:text-[#092B55]'
                  : 'bg-white dark:bg-[#0E2A4F] text-[#355373] dark:text-[#B9D8F7] border border-[#D6E6F5] dark:border-white/15 hover:border-[#36E7F2]'
              }`}
            >
              {idx + 1}. {item.title}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-[#E6F4FF] via-[#F7FBFF] to-[#E6F7EE] dark:from-[#0E2E57] dark:to-[#0A3D32] border border-[#36E7F2]/30">
            <IconComp size={88} />
            <span className="mt-3 text-sm font-extrabold text-[#092B55] dark:text-white">
              {slide.title}
            </span>
            <span className="text-[11px] text-[#138A45] dark:text-[#36E7F2] font-semibold mt-0.5">
              Live Working Module
            </span>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#FF8A18] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step {activeIdx + 1} of 5</span>
              </p>
              <h3 className="text-xl sm:text-2xl font-extrabold mt-1 text-[#092B55] dark:text-white">
                {slide.subtitle}
              </h3>
              <p className="mt-2 text-sm text-[#46607E] dark:text-[#C5DCF3] leading-relaxed">
                {slide.description}
              </p>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-[#1E3B5A] dark:text-[#E2F0FF]">
              {slide.highlights.map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#138A45] dark:text-[#36E7F2] shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {slide.sampleBengali && (
              <div className="p-3.5 rounded-xl bg-[#F3F8FD] dark:bg-[#081F3D] border border-[#36E7F2]/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#092B55] dark:text-[#CBE6FF]">
                  <Volume2 className="w-4 h-4 text-[#FF8A18]" />
                  <span>Test live Bengali Neural Voice right here:</span>
                </div>
                <ReadAloudButton lang="bn" text={slide.sampleBengali} />
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleLaunch(slide.route)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#138A45] to-[#0E6D4E] hover:from-[#0E7439] hover:to-[#09553C] text-white text-xs sm:text-sm font-semibold shadow-md cursor-pointer"
              >
                <span>{slide.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((prev) => (prev - 1 + DEMO_SLIDES.length) % DEMO_SLIDES.length)
                  }
                  className="px-3.5 py-2 rounded-full border border-[#C6DCF0] dark:border-white/20 text-xs font-semibold text-[#092B55] dark:text-white hover:bg-[#EAF4FD] dark:hover:bg-white/10 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIdx((prev) => (prev + 1) % DEMO_SLIDES.length)}
                  className="px-3.5 py-2 rounded-full bg-[#092B55] dark:bg-[#36E7F2] text-white dark:text-[#092B55] text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
