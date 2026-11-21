import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  Leaf,
  Megaphone,
  MessageSquarePlus,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../context/AppContext';
import {
  localizeAssistanceCategory,
  localizeJobCategory,
  localizeMode,
  localizeScamType,
  localizeSchemeCategory,
  localizeScope,
  localizeSkillCategory,
  pickText,
  tr,
} from '../i18n/translations';
import { apiFetch } from '../lib/api';
import type {
  Announcement,
  CourseListing,
  FraudAlert,
  JobListing,
  LocalAssistanceCentre,
  WelfareScheme,
} from '../types/platform';
import {
  Briefcase3DIcon,
  Checklist3DIcon,
  JenovaLocalLogo,
  JenovaProtectLogo,
  JenovaSchemesLogo,
  JourneyOrbIcon,
  LocalPin3DIcon,
  Schemes3DIcon,
  Shield3DIcon,
  Voice3DIcon,
} from '../components/JenovaIcons3D';
import { JenovaHeroShowcase } from '../components/JenovaHeroShowcase';
import { DemoModal } from '../components/DemoModal';
import { SafetyNotice, VerificationLabel } from '../components/SharedUI';
import { ReadAloudButton } from '../components/VoiceAccessibility';
import { PersonalisedForYouSection } from '../components/PersonalisedForYouSection';

gsap.registerPlugin(ScrollTrigger);

interface PublicStats {
  totalVisits: number;
  verifiedCounts: {
    jobs: number;
    demoJobs: number;
    courses: number;
    schemes: number;
    businesses: number;
    assistanceCentres?: number;
  };
  schemeReferrals: number;
  trainingReferrals: number;
  jobReferrals: number;
  checklistsCompleted?: number;
  fraudChecksCompleted?: number;
  localHelpClicks?: number;
  voiceAssistantUses?: number;
  updateSubscribersCount?: number;
  feedbackCount: number;
}

/**
 * Interactive 3D-perspective service card with mouse-responsive tilt and light saffron-cream polish.
 */
function ServiceGlassCard({
  title,
  description,
  ctaLabel,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -py * 8, ry: px * 10 });
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        backdropFilter: 'blur(12px)',
        boxShadow:
          '0 12px 28px -10px rgba(186, 112, 32, 0.2), 0 2px 6px rgba(186, 112, 32, 0.06)',
      }}
      className="jenova-glass-card service-glass-card text-left w-full rounded-[20px] p-4 sm:p-4.5 bg-white/96 dark:bg-[#241B13]/95 border-[1.5px] border-[#F2DCC1] dark:border-[#4A3522] hover:border-[#F4A340] text-[#26364B] dark:text-[#FFF5E8] cursor-pointer group flex flex-col justify-between gap-3 min-h-[152px] sm:min-h-[164px] transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 -mt-0.5 transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold tracking-tight text-[#26364B] dark:text-[#FFF5E8] group-hover:text-[#A85B0A] dark:group-hover:text-[#FFD19A] transition-colors leading-snug">
            {title}
          </h3>
          <p className="mt-1 text-[11.5px] sm:text-xs text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#F2DCC1] dark:border-[#3F2E1E]">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A85B0A] dark:text-[#FFD19A] group-hover:text-[#8E4B06] dark:group-hover:text-[#FFF5E8] transition-colors">
          <span>{ctaLabel}</span>
          <span className="w-4.5 h-4.5 rounded-full bg-[#FFE5C2] dark:bg-[#382616] text-[#26364B] dark:text-[#FFD19A] group-hover:bg-[#F4A340] group-hover:text-[#26364B] flex items-center justify-center transition-colors">
            <ArrowRight className="w-3 h-3" />
          </span>
        </span>
      </div>
    </button>
  );
}

/**
 * Light saffron-cream sunlit sunrise horizon backdrop preserving the iconic Indian skyline & Howrah Bridge silhouette
 */
function IndianHorizonBackdrop({ theme }: { theme: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  return (
    <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Luminous light cream & soft saffron sunrise sky */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 72% 28%, rgba(244,163,64,0.16) 0%, rgba(255,209,154,0.06) 34%, transparent 65%), linear-gradient(180deg, #18120C 0%, #221810 48%, #2A1D12 78%, #18120C 100%)'
            : 'radial-gradient(circle at 12% 35%, rgba(255,229,194,0.92) 0%, rgba(255,241,223,0.62) 34%, transparent 62%), radial-gradient(circle at 78% 24%, rgba(255,209,154,0.58) 0%, rgba(255,229,194,0.3) 44%, transparent 74%), linear-gradient(135deg, #FFF9F0 0%, #FFF5E6 40%, #FFF1DF 72%, #FFE5C2 100%)',
        }}
      />

      {/* Soft sunlit clouds */}
      <div
        className="absolute -top-10 left-[6%] w-[440px] h-[170px] rounded-full blur-3xl opacity-70"
        style={{ background: isDark ? 'rgba(244,163,64,0.1)' : 'rgba(255,255,255,0.88)' }}
      />
      <div
        className="absolute top-[10%] right-[4%] w-[460px] h-[180px] rounded-full blur-3xl opacity-55"
        style={{ background: isDark ? 'rgba(255,209,154,0.09)' : 'rgba(255,255,255,0.68)' }}
      />

      {/* Atmospheric Indian skyline + iconic cantilever bridge silhouette along lower horizon */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[210px] sm:h-[260px] opacity-85"
      >
        <defs>
          <linearGradient id="horizonRiver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#2B1E12' : '#FFE5C2'} stopOpacity="0.48" />
            <stop offset="50%" stopColor={isDark ? '#21170E' : '#FFF1DF'} stopOpacity="0.82" />
            <stop offset="100%" stopColor={isDark ? '#18120C' : '#FFF9F0'} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="sunReflect" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F4A340" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#FFD19A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F4A340" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {/* Distant city silhouette on left horizon */}
        <path
          d="M0 168 L60 168 L60 140 L84 140 L84 156 L112 156 L112 126 L138 126 L138 150 L175 150 L175 112 L205 112 L205 148 L240 148 L240 132 L272 132 L272 158 L330 158 L330 138 L368 138 L368 164 L480 164 L480 152 L530 152 L530 168 L1440 168 L1440 320 L0 320 Z"
          fill={isDark ? '#3A2818' : '#E6C195'}
          fillOpacity={isDark ? '0.62' : '0.38'}
        />

        {/* Iconic steel cantilever bridge silhouette (Howrah Bridge inspiration) on right horizon */}
        <g
          stroke={isDark ? '#8F6030' : '#C48845'}
          strokeWidth="2.5"
          strokeOpacity={isDark ? '0.52' : '0.45'}
          fill="none"
        >
          {/* Bridge deck */}
          <line x1="760" y1="162" x2="1440" y2="162" strokeWidth="4" />
          {/* Two main towers */}
          <path d="M900 162 L922 72 L944 162 M1270 162 L1292 64 L1314 162" strokeWidth="3.5" />
          {/* Sweeping truss arches */}
          <path d="M760 162 Q840 105 922 72 Q1107 132 1292 64 Q1375 102 1440 145" strokeWidth="3" />
          {/* Vertical & diagonal truss struts */}
          {[800, 840, 880, 965, 1010, 1055, 1100, 1145, 1190, 1235, 1345, 1390].map((x) => (
            <line key={x} x1={x} y1="162" x2={x} y2={x > 940 && x < 1270 ? '114' : '118'} />
          ))}
        </g>

        {/* Soft sunlit river surface blending seamlessly into #FFF9F0 */}
        <rect x="0" y="168" width="1440" height="152" fill="url(#horizonRiver)" />
        <rect x="0" y="168" width="1440" height="8" fill="url(#sunReflect)" />
        <ellipse cx="320" cy="215" rx="260" ry="14" fill="#F4A340" fillOpacity={isDark ? '0.1' : '0.16'} />
        <ellipse cx="1050" cy="220" rx="340" ry="16" fill="#FFD19A" fillOpacity={isDark ? '0.09' : '0.22'} />
      </svg>
    </div>
  );
}

export function HomePage() {
  const { language, theme, t, navigate } = useApp();
  const [demoOpen, setDemoOpen] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [courses, setCourses] = useState<CourseListing[]>([]);
  const [schemes, setSchemes] = useState<WelfareScheme[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [noticeIdx, setNoticeIdx] = useState(0);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [centres, setCentres] = useState<LocalAssistanceCentre[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ jobs: JobListing[] }>('/api/jobs'),
      apiFetch<{ courses: CourseListing[] }>('/api/courses'),
      apiFetch<{ schemes: WelfareScheme[] }>('/api/schemes'),
      apiFetch<{ announcements: Announcement[] }>('/api/announcements'),
      apiFetch<{ alerts: FraudAlert[] }>('/api/fraud/alerts'),
      apiFetch<{ centres: LocalAssistanceCentre[] }>('/api/assistance'),
      apiFetch<PublicStats>('/api/public/stats'),
    ])
      .then(([j, c, s, a, fa, ac, st]) => {
        setJobs(j.jobs.slice(0, 3));
        setCourses(c.courses.slice(0, 3));
        setSchemes(s.schemes.slice(0, 4));
        setAnnouncements(a.announcements.slice(0, 2));
        setFraudAlerts((fa.alerts || []).slice(0, 3));
        setCentres((ac.centres || []).slice(0, 4));
        setStats(st);
      })
      .catch(() => {});
  }, []);

  // GSAP + ScrollTrigger choreography for Service Cards & "How JENOVA Works?" 3D Journey
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !pageRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger-reveal 5 floating service cards
      gsap.fromTo(
        '.service-glass-card',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#jenova-services',
            start: 'top 92%',
            once: true,
          },
        }
      );

      // Sequential 3D Journey animation with pathway arrow illumination
      const journeyTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#how-jenova-works',
          start: 'top 84%',
          once: true,
        },
      });
      journeyTl
        .fromTo(
          '.journey-step-node',
          { y: 28, scale: 0.88, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.4)' }
        )
        .fromTo(
          '.journey-arrow',
          { scaleX: 0.2, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.35, stagger: 0.1, ease: 'power2.out' },
          '-=0.55'
        )
        .fromTo(
          '.journey-closing-panel',
          { x: 24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
          '-=0.35'
        );

      // General section scroll reveals
      gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((sec) => {
        gsap.fromTo(
          sec,
          { y: 20, opacity: 0.92 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const floatingQuickPanels = [
    {
      id: 'stay-safe',
      label: language === 'bn' ? 'নিরাপদ থাকুন' : language === 'hi' ? 'सुरक्षित रहें' : 'Stay Safe',
      path: '/scam-check',
      icon: <Shield3DIcon size={36} />,
      posClass: 'top-2 left-1 2xl:left-3',
      floatClass: 'animate-jenova-float',
    },
    {
      id: 'get-schemes',
      label: language === 'bn' ? 'সরকারি প্রকল্প' : language === 'hi' ? 'सरकारी योजनाएं' : 'Get Schemes',
      path: '/schemes',
      icon: <Schemes3DIcon size={36} />,
      posClass: 'bottom-12 left-1 2xl:left-3',
      floatClass: 'animate-jenova-float-alt',
    },
    {
      id: 'find-jobs',
      label: language === 'bn' ? 'কাজ খুঁজুন' : language === 'hi' ? 'नौकरी खोजें' : 'Find Jobs',
      path: '/jobs',
      icon: <Briefcase3DIcon size={35} />,
      posClass: 'top-2 right-1 2xl:right-3',
      floatClass: 'animate-jenova-float-alt',
    },
    {
      id: 'local-help',
      label: language === 'bn' ? 'স্থানীয় সহায়তা' : language === 'hi' ? 'स्थानीय सहायता' : 'Local Help',
      path: '/local-help',
      icon: <LocalPin3DIcon size={36} />,
      posClass: 'bottom-12 right-1 2xl:right-3',
      floatClass: 'animate-jenova-float',
    },
  ];

  const fiveServiceCards = [
    {
      path: '/scam-check',
      title: 'JENOVA Protect',
      desc:
        language === 'bn'
          ? 'সন্দেহজনক চাকরির প্রস্তাব, অনলাইন প্রতারণা ও ভুয়া স্ক্যাম শনাক্ত করুন।'
          : language === 'hi'
            ? 'संदिग्ध नौकरी प्रस्ताव, ऑनलाइन धोखाधड़ी और संभावित स्कैम पहचानें।'
            : 'Detect suspicious job offers, online fraud and potential scams.',
      icon: <Shield3DIcon size={54} />,
    },
    {
      path: '/schemes',
      title: 'JENOVA Schemes',
      desc:
        language === 'bn'
          ? 'সরকারি কল্যাণমূলক প্রকল্প খুঁজুন এবং প্রাথমিক যোগ্যতা যাচাই করুন।'
          : language === 'hi'
            ? 'सरकारी कल्याणकारी योजनाएं खोजें और प्रारंभिक पात्रता जांचें।'
            : 'Discover government schemes and check eligibility.',
      icon: <Schemes3DIcon size={54} />,
    },
    {
      path: '/checklist',
      title: 'JENOVA Checklist',
      desc:
        language === 'bn'
          ? 'অফিস বা BSK যাওয়ার আগে প্রয়োজনীয় কাগজপত্র গুছিয়ে প্রস্তুত করুন।'
          : language === 'hi'
            ? 'सरकारी दफ़्तर या BSK जाने से पहले आवश्यक दस्तावेज़ तैयार करें।'
            : 'Prepare documents before visiting offices.',
      icon: <Checklist3DIcon size={54} />,
    },
    {
      path: '/assistant',
      title: 'JENOVA Voice',
      desc:
        language === 'bn'
          ? 'সহজ ও স্বাভাবিক বাংলা কণ্ঠে আপনার প্রশ্নের সরাসরি উত্তর শুনুন।'
          : language === 'hi'
            ? 'सरल हिंदी और बंगाली आवाज़ में अपने सवालों के तुरंत उत्तर सुनें।'
            : 'Get answers in natural Bengali voice.',
      icon: <Voice3DIcon size={54} />,
    },
    {
      path: '/local-help',
      title: 'JENOVA Local',
      desc:
        language === 'bn'
          ? 'যাচাইকৃত স্থানীয় সহায়তা কেন্দ্র (BSK), বিডিও ও সরকারি হেল্পলাইন খুঁজুন।'
          : language === 'hi'
            ? 'सत्यापित स्थानीय सहायता केंद्र (BSK), BDO और सरकारी हेल्पलाइन खोजें।'
            : 'Find verified local assistance and support.',
      icon: <LocalPin3DIcon size={54} />,
    },
  ];

  const journeySteps: Array<{
    num: number;
    key: 'discover' | 'understand' | 'prepare' | 'act' | 'followup';
    title: string;
    subtitle: string;
    path: string;
  }> = [
    {
      num: 1,
      key: 'discover',
      title:
        language === 'bn'
          ? '১. খুঁজুন (Discover)'
          : language === 'hi'
            ? '1. खोजें (Discover)'
            : '1. Discover',
      subtitle:
        language === 'bn'
          ? 'সঠিক তথ্য খুঁজুন'
          : language === 'hi'
            ? 'अपनी जरूरत की जानकारी पाएं'
            : 'Find what you need',
      path: '/schemes',
    },
    {
      num: 2,
      key: 'understand',
      title:
        language === 'bn'
          ? '২. বুঝুন (Understand)'
          : language === 'hi'
            ? '2. समझें (Understand)'
            : '2. Understand',
      subtitle:
        language === 'bn'
          ? 'সহজ ভাষায় নির্দেশিকা'
          : language === 'hi'
            ? 'सरल भाषा में मार्गदर्शन'
            : 'Get clear guidance',
      path: '/assistant',
    },
    {
      num: 3,
      key: 'prepare',
      title:
        language === 'bn'
          ? '৩. প্রস্তুত হন (Prepare)'
          : language === 'hi'
            ? '3. तैयारी करें (Prepare)'
            : '3. Prepare',
      subtitle:
        language === 'bn'
          ? 'চেকলিস্ট দিয়ে প্রস্তুত'
          : language === 'hi'
            ? 'चेकलिस्ट से कागज़ तैयार करें'
            : 'Get ready with checklist',
      path: '/checklist',
    },
    {
      num: 4,
      key: 'act',
      title:
        language === 'bn'
          ? '৪. পদক্ষেপ নিন (Act)'
          : language === 'hi'
            ? '4. कदम बढ़ाएं (Act)'
            : '4. Act',
      subtitle:
        language === 'bn'
          ? 'অফিসিয়াল পরিষেবা নিন'
          : language === 'hi'
            ? 'आधिकारिक सेवाओं का लाभ लें'
            : 'Access services',
      path: '/local-help',
    },
    {
      num: 5,
      key: 'followup',
      title:
        language === 'bn'
          ? '৫. সাথে থাকুন (Follow Up)'
          : language === 'hi'
            ? '5. आगे बढ़ें (Follow Up)'
            : '5. Follow Up',
      subtitle:
        language === 'bn'
          ? 'অগ্রগতি ট্র্যাক করুন'
          : language === 'hi'
            ? 'अपनी प्रगति पर नज़र रखें'
            : 'Track progress',
      path: '/updates',
    },
  ];

  const activeAnnouncement = announcements[noticeIdx] || announcements[0] || null;

  return (
    <div ref={pageRef} className="overflow-x-hidden">
      {/* =====================================================================
          SECTION 1 & 2: HERO + FIVE SERVICE CARDS (LIGHT SAFFRON-ORANGE & CREAM)
          ===================================================================== */}
      <section className="relative pt-3 pb-10 sm:pt-5 sm:pb-12">
        <IndianHorizonBackdrop theme={theme} />

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fluid 2-Column Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-4 xl:gap-5 items-center lg:min-h-[430px] xl:min-h-[470px]">
            {/* Left Side: Editorial Hero Content */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4 sm:space-y-4.5 pt-2 lg:pt-0">
              {/* Verified Trust Badge (Green strictly for verified/trust indicator) */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#241B13]/92 border border-[#27845B]/45 dark:border-[#27845B]/60 shadow-sm text-[11px] sm:text-xs font-bold text-[#26364B] dark:text-[#FFF5E8]">
                <ShieldCheck className="w-4 h-4 text-[#27845B] dark:text-[#45B884] shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'বিশ্বস্ত • যাচাইকৃত • মানুষই প্রথম'
                    : language === 'hi'
                      ? 'विश्वसनीय • सत्यापित • जन-प्रथम'
                      : 'Trusted • Verified • People First'}
                </span>
              </div>

              {/* Exact 3-Line Display Heading (Matra-safe line-height for Hindi & Bengali) */}
              <h1
                className={`font-black text-[#26364B] dark:text-[#FFF5E8] ${
                  language === 'hi'
                    ? 'text-[32px] min-[400px]:text-[38px] sm:text-[44px] lg:text-[40px] xl:text-[50px] leading-[1.24] tracking-normal'
                    : language === 'bn'
                      ? 'text-[34px] min-[400px]:text-[40px] sm:text-[46px] lg:text-[42px] xl:text-[52px] leading-[1.18] tracking-normal'
                      : 'text-[34px] min-[400px]:text-[40px] sm:text-5xl lg:text-[44px] xl:text-[56px] leading-[1.06] tracking-tight'
                }`}
              >
                <span className="block">
                  {language === 'bn'
                    ? 'আপনার সমাজ।'
                    : language === 'hi'
                      ? 'आपका समाज।'
                      : 'Your Community.'}
                </span>
                <span className="block">
                  {language === 'bn'
                    ? 'আপনার সুযোগ।'
                    : language === 'hi'
                      ? 'आपके अवसर।'
                      : 'Your Opportunities.'}
                </span>
                <span className="block mt-0.5 bg-gradient-to-r from-[#E5841A] via-[#F4A340] to-[#D97706] bg-clip-text text-transparent">
                  {language === 'bn'
                    ? 'আপনার ভবিষ্যৎ।'
                    : language === 'hi'
                      ? 'आपका भविष्य।'
                      : 'Your Future.'}
                </span>
              </h1>

              {/* Supporting Description */}
              <p className="text-sm sm:text-[15px] text-[#454545] dark:text-[#DDD2C5] leading-relaxed max-w-[440px] font-semibold">
                {language === 'bn'
                  ? 'আপনার প্রয়োজনীয় তথ্য, সরকারি পরিষেবা, ডিজিটাল নিরাপত্তা এবং নতুন সুযোগ — সবকিছু এবার একটি বুদ্ধিমান কমিউনিটি প্ল্যাটফর্মে।'
                  : language === 'hi'
                    ? 'एक ही सरल और बुद्धिमान सामुदायिक मंच के माध्यम से आवश्यक जानकारी, सरकारी सहायता, डिजिटल सुरक्षा और नए अवसर खोजें।'
                    : 'Discover essential information, government assistance, digital safety and new opportunities through one intelligent community platform.'}
              </p>

              {/* Action Buttons: Explore Services + Watch Demo + Multilingual Read-Aloud */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('jenova-services')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full text-sm font-bold jenova-saffron-btn transition-all whitespace-nowrap cursor-pointer min-h-[44px]"
                >
                  <span>
                    {language === 'bn'
                      ? 'পরিষেবা দেখুন'
                      : language === 'hi'
                        ? 'सेवाएं देखें'
                        : 'Explore Services'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-full text-sm font-bold text-[#26364B] dark:text-[#FFF5E8] bg-white dark:bg-[#241B13] hover:bg-[#FFF1DF] dark:hover:bg-[#382616] border border-[#F2DCC1] dark:border-[#4A3522] shadow-sm transition-all whitespace-nowrap cursor-pointer min-h-[44px]"
                >
                  <span className="w-5.5 h-5.5 rounded-full bg-[#FFE5C2] dark:bg-[#382616] text-[#26364B] dark:text-[#FFD19A] flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                  <span>
                    {language === 'bn'
                      ? 'ডেমো দেখুন'
                      : language === 'hi'
                        ? 'डेमो देखें'
                        : 'Watch Demo'}
                  </span>
                </button>

                <ReadAloudButton
                  compact
                  lang={language}
                  text={
                    language === 'bn'
                      ? 'আপনার সমাজ, আপনার সুযোগ, আপনার ভবিষ্যৎ। নতুন সম্ভাবনা, সবার জন্য। জেনোভা আপনাকে সরকারি প্রকল্প, ডিজিটাল নিরাপত্তা ও স্থানীয় সহায়তা পেতে সাহায্য করে।'
                      : language === 'hi'
                        ? 'आपका समाज, आपके अवसर, आपका भविष्य। नई संभावनाएं, सभी के लिए। जेनोवा आपको सरकारी योजनाओं, डिजिटल सुरक्षा और स्थानीय सहायता तक सरलता से पहुंचाता है।'
                        : 'Your Community. Your Opportunities. Your Future. Discover essential information, government assistance, digital safety and new opportunities through JENOVA.'
                  }
                />
              </div>

              {/* Multilingual Signature Tagline below buttons */}
              <div className="flex items-center gap-2.5 pt-1 max-w-md">
                <Leaf className="w-4 h-4 text-[#27845B] dark:text-[#45B884] shrink-0" />
                <span className="text-sm sm:text-[15px] font-bold text-[#26364B] dark:text-[#FFF5E8] whitespace-nowrap">
                  {language === 'hi' ? 'नई संभावनाएं, सभी के लिए।' : 'নতুন সম্ভাবনা, সবার জন্য।'}
                </span>
                <span className="h-[1.5px] flex-1 bg-gradient-to-r from-[#F4A340]/65 to-transparent" />
              </div>
            </div>

            {/* Right Side: Interactive 3D India Map + Crystal JENOVA Globe Showcase */}
            <div className="lg:col-span-7 relative">
              <JenovaHeroShowcase language={language} onNavigate={navigate} />

              {/* Mobile Quick-Access 2x2 Tap Bar so phone users can jump cleanly into Stay Safe / Schemes / Jobs / Local Help */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 md:hidden">
                {floatingQuickPanels.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    onClick={() => navigate(panel.path)}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#4A3522] hover:border-[#F4A340] shadow-sm text-left transition-all cursor-pointer"
                  >
                    <div className="shrink-0">{panel.icon}</div>
                    <span className="text-xs font-extrabold text-[#26364B] dark:text-[#FFF5E8] leading-tight">
                      {panel.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* =================================================================
              FIVE SERVICE CARDS (ANCHORED BELOW HERO)
              ================================================================= */}
          <div id="jenova-services" className="mt-5 lg:mt-4 scroll-mt-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
              {fiveServiceCards.map((card) => (
                <ServiceGlassCard
                  key={card.path}
                  title={card.title}
                  description={card.desc}
                  ctaLabel={
                    language === 'bn'
                      ? 'আরও জানুন'
                      : language === 'hi'
                        ? 'अधिक जानें'
                        : 'Learn More'
                  }
                  icon={card.icon}
                  onClick={() => navigate(card.path)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: "HOW JENOVA WORKS?" — WARM CREAM RIBBON + SAFFRON CAPSULE
          ===================================================================== */}
      <section
        id="how-jenova-works"
        className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 scroll-mt-24"
      >
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 xl:gap-5">
          {/* Warm Cream-White Ribbon Container */}
          <div className="flex-1 rounded-[32px] bg-gradient-to-r from-white via-[#FFFDF9] to-[#FFF1DF]/85 dark:from-[#241B13] dark:via-[#261C14] dark:to-[#2C1F15] border border-[#F2DCC1] dark:border-[#4A3522] shadow-[0_14px_34px_-14px_rgba(186,112,32,0.2)] px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
              {/* Left Heading Block */}
              <div className="lg:w-[195px] shrink-0 space-y-1">
                <h2 className="text-2xl sm:text-[25px] font-black text-[#26364B] dark:text-[#FFF5E8] leading-snug">
                  {language === 'bn'
                    ? 'কীভাবে JENOVA কাজ করে?'
                    : language === 'hi'
                      ? 'JENOVA कैसे काम करता है?'
                      : 'How JENOVA Works?'}
                </h2>
                <p className="text-sm font-semibold text-[#454545] dark:text-[#DDD2C5]">
                  {language === 'bn'
                    ? 'সহজ ধাপ। বাস্তব সহায়তা।'
                    : language === 'hi'
                      ? 'सरल चरण। वास्तविक सहायता।'
                      : 'Simple steps. Real support.'}
                </p>
                <svg
                  width="64"
                  height="28"
                  viewBox="0 0 64 28"
                  fill="none"
                  className="hidden lg:block text-[#F4A340] dark:text-[#FFD19A] mt-1.5"
                  aria-hidden="true"
                >
                  <path
                    d="M4 22 C24 26, 44 18, 56 6 M56 6 L46 6 M56 6 L54 16"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Center 5 Interconnected 3D Orbs + Warm Pathway Arrows */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:flex lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-1.5">
                {journeySteps.map((step, idx) => (
                  <React.Fragment key={step.key}>
                    <button
                      type="button"
                      onClick={() => navigate(step.path)}
                      className={`journey-step-node group flex flex-col items-center text-center p-2 rounded-2xl hover:bg-[#FFF1DF]/85 dark:hover:bg-[#382616]/70 transition-colors cursor-pointer ${
                        idx === journeySteps.length - 1 ? 'col-span-2 sm:col-span-1' : ''
                      }`}
                    >
                      <div className="transition-transform duration-200 group-hover:-translate-y-1.5 group-hover:scale-105">
                        <JourneyOrbIcon step={step.key} size={70} />
                      </div>
                      <h3 className="mt-2.5 text-xs sm:text-sm font-black text-[#26364B] dark:text-[#FFF5E8] group-hover:text-[#A85B0A] dark:group-hover:text-[#FFD19A] transition-colors">
                        {step.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-[#454545] dark:text-[#DDD2C5] max-w-[132px]">
                        {step.subtitle}
                      </p>
                    </button>

                    {idx < journeySteps.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="journey-arrow hidden lg:flex items-center justify-center shrink-0"
                      >
                        <div className="animate-jenova-arrow flex items-center text-[#F4A340] dark:text-[#FFD19A]">
                          <span className="w-5 xl:w-7 h-[2.5px] rounded-full bg-gradient-to-r from-[#F4A340] to-[#27845B] dark:from-[#FFD19A] dark:to-[#45B884]" />
                          <ArrowRight className="w-4 h-4 -ml-1.5" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Far Right Light Saffron-Cream Capsule Callout */}
          <button
            type="button"
            onClick={() => navigate('/assistant')}
            className="journey-closing-panel xl:w-[285px] shrink-0 rounded-[36px] px-6 py-5 bg-gradient-to-br from-[#FFF1DF] via-[#FFE5C2] to-[#FFD19A] dark:from-[#2D1F13] dark:via-[#382616] dark:to-[#472F19] border-[1.5px] border-[#F4A340]/75 hover:border-[#E58E26] shadow-[0_14px_30px_-12px_rgba(244,163,64,0.38)] text-left text-[#26364B] dark:text-[#FFF5E8] flex items-center justify-between gap-4 group cursor-pointer transition-all"
          >
            <div>
              <p className="text-[16px] sm:text-[17px] font-extrabold leading-snug text-[#26364B] dark:text-[#FFF5E8]">
                {language === 'bn'
                  ? 'মানুষের ক্ষমতায়ন। আরও সুন্দর আগামী।'
                  : language === 'hi'
                    ? 'सशक्त समाज। उज्ज्वल भविष्य की ओर।'
                    : 'Empowering People. Building a Better Tomorrow.'}
              </p>
              <span className="mt-1.5 inline-block text-[11px] font-bold text-[#A85B0A] dark:text-[#FFD19A]">
                {language === 'bn'
                  ? 'JENOVA Voice শুরু করুন'
                  : language === 'hi'
                    ? 'JENOVA Voice शुरू करें'
                    : 'Start with JENOVA Voice'}
              </span>
            </div>
            <span className="w-11 h-11 rounded-full bg-white/90 dark:bg-[#241B13] text-[#26364B] dark:text-[#FFD19A] group-hover:bg-[#F4A340] group-hover:text-[#26364B] border border-[#F4A340]/50 flex items-center justify-center shrink-0 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </span>
          </button>
        </div>
      </section>

      {/* =====================================================================
          BELOW-THE-FOLD HOMEPAGE SECTIONS (LIGHT SAFFRON-ORANGE & CREAM THEME)
          ===================================================================== */}
      <div className="jenova-saffron-theme bg-[#FFF9F0] dark:bg-[#18120C] text-[#454545] dark:text-[#DDD2C5] pt-4 pb-14 sm:pb-16">
      {/* =====================================================================
          PERSONALISED LIVELIHOOD ENGINE + JENOVA UDAAN & ACTION PASSPORT DISCOVERY
          ===================================================================== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 space-y-5">
        <PersonalisedForYouSection compact forceSaffron />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => navigate('/udaan')}
            className="text-left p-5 sm:p-6 rounded-[24px] bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] hover:border-[#F4A340] shadow-[0_12px_30px_-14px_rgba(244,163,64,0.2)] transition-all flex items-center justify-between gap-4 group cursor-pointer"
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#A85B0A] dark:text-[#FFD19A]">
                {tr(
                  language,
                  'প্রশিক্ষণ • অনুশীলন • পেশাদার বিকাশ',
                  'प्रशिक्षण • अभ्यास • पेशेवर विकास',
                  'TRAINING • PRACTICE • PROFESSIONAL GROWTH'
                )}
              </p>
              <h3 className="text-lg font-black text-[#26364B] dark:text-[#FFF5E8] group-hover:text-[#A85B0A] dark:group-hover:text-[#FFD19A] transition-colors">
                JENOVA UDAAN —{' '}
                {tr(
                  language,
                  'শেখা থেকে বাস্তব আত্মবিশ্বাস',
                  'सीखने से वास्तविक आत्मविश्वास तक',
                  'From Learning to Real-World Confidence'
                )}
              </h3>
              <p className="text-xs sm:text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
                {tr(
                  language,
                  'ইন্টারভিউ প্রস্তুতি, বিজনেস প্ল্যান, ডিজিটাল দক্ষতা, সফট স্কিল ও MSME অনুশীলন — ৬টি স্ব-গতিশীল মডিউল, কুইজ ও AI প্র্যাকটিস কোচসহ।',
                  'इंटरव्यू तैयारी, बिजनेस प्लान, डिजिटल कौशल, सॉफ्ट स्किल्स और MSME अभ्यास — 6 स्व-गति मॉड्यूल, क्विज़ और AI प्रैक्टिस कोच के साथ।',
                  '6 self-paced practical modules covering Interview Prep, Business Planning, Soft Skills, Digital Productivity, MSME Entrepreneurship & Workplace Execution.'
                )}
              </p>
            </div>
            <span className="w-10 h-10 rounded-full bg-[#FFE5C2] dark:bg-[#382616] text-[#A85B0A] dark:text-[#FFD19A] group-hover:bg-[#F4A340] group-hover:text-[#26364B] flex items-center justify-center shrink-0 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/passport')}
            className="text-left p-5 sm:p-6 rounded-[24px] bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] hover:border-[#F4A340] shadow-[0_12px_30px_-14px_rgba(244,163,64,0.2)] transition-all flex items-center justify-between gap-4 group cursor-pointer"
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#A85B0A] dark:text-[#FFD19A]">
                {tr(
                  language,
                  'পরিকল্পনা থেকে বাস্তব পদক্ষেপ',
                  'योजना से वास्तविक कदम तक',
                  'GUIDED ACTION TRACKER'
                )}
              </p>
              <h3 className="text-lg font-black text-[#26364B] dark:text-[#FFF5E8] group-hover:text-[#A85B0A] dark:group-hover:text-[#FFD19A] transition-colors">
                JENOVA Action Passport —{' '}
                {tr(
                  language,
                  'ধাপে ধাপে লক্ষ্য ও কাগজপত্র ট্র্যাক করুন',
                  'चरणबद्ध लक्ष्य और दस्तावेज़ ट्रैक करें',
                  'Track Goals, Documents & Next Steps'
                )}
              </h3>
              <p className="text-xs sm:text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
                {tr(
                  language,
                  'দক্ষতা শেখা, ছোট ব্যবসা শুরু, চাকরি বা সরকারি প্রকল্পের প্রস্তুতিকে সহজ চেকলিস্ট, নোট ও অফিসিয়াল লিঙ্কে সাজিয়ে রাখুন।',
                  'कौशल, छोटे व्यवसाय, नौकरी या सरकारी योजना की तैयारी को सरल चेकलिस्ट, नोट्स और आधिकारिक लिंक के साथ व्यवस्थित रखें।',
                  'Convert any skill, UDAAN module, small business plan, job goal, or government scheme into step-by-step checklists with official links and notes.'
                )}
              </p>
            </div>
            <span className="w-10 h-10 rounded-full bg-[#FFE5C2] dark:bg-[#382616] text-[#A85B0A] dark:text-[#FFD19A] group-hover:bg-[#F4A340] group-hover:text-[#26364B] flex items-center justify-center shrink-0 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </span>
          </button>
        </div>
      </section>

      {/* =====================================================================
          ATTRACTIVE OFFICIAL COMMUNITY NOTICE SPOTLIGHT
          ===================================================================== */}
      <section className="reveal-section max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-white via-[#FFF9F0] to-[#FFF1DF] dark:from-[#241B13] dark:via-[#221911] dark:to-[#2B1F15] border border-[#F2DCC1] dark:border-[#4A3522] shadow-[0_14px_34px_-14px_rgba(244,163,64,0.22)]">
          {/* Warm Saffron-to-Green Portal Accent Strip */}
          <div
            className="h-1.5 w-full bg-gradient-to-r from-[#F4A340] via-[#FFD19A] via-55% to-[#27845B]"
            aria-hidden="true"
          />

          <div className="p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Warm Saffron Notice Emblem */}
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#F4A340] to-[#FFB75E] text-[#26364B] flex items-center justify-center shadow-[0_10px_22px_-8px_rgba(244,163,64,0.45)] border border-[#FFD19A]">
                <Megaphone className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#FFE5C2] dark:bg-[#382616] text-[#26364B] dark:text-[#FFD19A] border border-[#F2DCC1] dark:border-[#5C4128]">
                    <span className="w-2 h-2 rounded-full bg-[#F4A340] animate-pulse" />
                    {language === 'bn'
                      ? 'গুরুত্বপূর্ণ কমিউনিটি নোটিশ'
                      : language === 'hi'
                        ? 'महत्वपूर्ण सामुदायिक सूचना'
                        : 'Official Community Notice'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#27845B] dark:text-[#45B884]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'bn'
                      ? 'যাচাইকৃত সরকারি লিঙ্ক · কোনো ফি নেই'
                      : language === 'hi'
                        ? 'सत्यापित सरकारी लिंक · कोई शुल्क नहीं'
                        : 'Verified Official Links · 100% Free'}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-[#26364B] dark:text-[#FFF5E8] leading-snug">
                  {activeAnnouncement
                    ? pickText(activeAnnouncement.title, language)
                    : language === 'bn'
                      ? 'JENOVA কমিউনিটি গ্রোথ হাব — যাচাইকৃত সুযোগ, সবার জন্য'
                      : language === 'hi'
                        ? 'JENOVA सामुदायिक विकास हब — हर नागरिक के लिए सत्यापित अवसर'
                        : 'JENOVA Community Growth Hub — Verified Opportunities for Every Citizen'}
                </h2>

                <p className="text-xs sm:text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed max-w-4xl">
                  {activeAnnouncement
                    ? pickText(activeAnnouncement.body, language)
                    : language === 'bn'
                      ? 'JENOVA আপনাকে সহজ বাংলা, হিন্দি ও ইংরেজিতে যাচাইকৃত সরকারি প্রকল্প, প্রতারণা যাচাই এবং স্থানীয় BSK ও BDO সহায়তা কেন্দ্রে পৌঁছাতে সাহায্য করে। কখনোই কোনো অজানা লিঙ্কে OTP বা UPI PIN শেয়ার করবেন না।'
                      : language === 'hi'
                        ? 'JENOVA आपको सरल हिंदी, बंगाली और अंग्रेजी में सत्यापित सरकारी योजनाओं, धोखाधड़ी से सुरक्षा और स्थानीय BSK व BDO सहायता केंद्रों से जोड़ता है। कभी भी किसी अनजान लिंक पर अपना OTP या UPI PIN साझा न करें।'
                        : 'JENOVA connects citizens directly to verified government portals, scam protection tools, and local BSK & BDO assistance centres in English, Bengali, and Hindi. Never pay fees to middlemen or share your OTP/UPI PIN.'}
                </p>

                {announcements.length > 1 && (
                  <div className="flex items-center gap-2 pt-1">
                    {announcements.map((ann, i) => (
                      <button
                        key={ann.id}
                        type="button"
                        onClick={() => setNoticeIdx(i)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                          i === noticeIdx
                            ? 'jenova-saffron-btn'
                            : 'bg-[#FFF1DF] dark:bg-[#2E2116] text-[#26364B] dark:text-[#DDD2C5] border border-[#F2DCC1] dark:border-[#4A3522] hover:bg-[#FFE5C2]'
                        }`}
                      >
                        {language === 'bn'
                          ? `নোটিশ ${i + 1}`
                          : language === 'hi'
                            ? `सूचना ${i + 1}`
                            : `Notice ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Cluster */}
            <div className="flex flex-wrap lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/scam-check')}
                className="jenova-saffron-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#26364B]" />
                <span>
                  {language === 'bn'
                    ? 'JENOVA Protect ব্যবহার করুন'
                    : language === 'hi'
                      ? 'JENOVA Protect जांचें'
                      : 'Check with JENOVA Protect'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/schemes')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#241B13] border border-[#F4A340]/60 text-[#26364B] dark:text-[#FFD19A] hover:bg-[#FFE5C2] dark:hover:bg-[#382616] text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
                >
                  <span>
                    {language === 'bn'
                      ? 'সরকারি প্রকল্প'
                      : language === 'hi'
                        ? 'सरकारी योजनाएं'
                        : 'Official Schemes'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#4A3522] text-[#26364B] dark:text-[#FFF5E8] hover:bg-[#FFF1DF] dark:hover:bg-[#382616] text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn'
                      ? 'মতামত দিন'
                      : language === 'hi'
                        ? 'सुझाव दें'
                        : 'Share Feedback'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PRESERVED LIVE COMMUNITY SECTIONS (ALL REAL DB DATA & WORKING TOOLS)
          ===================================================================== */}

      {/* SECTION 4: LOCAL OPPORTUNITIES (Approved Jobs & Free Training) */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#26364B] dark:text-[#FFF5E8]">
              {t.home.localTitle}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-[#454545] dark:text-[#DDD2C5]">
              {t.home.localSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="text-[#A85B0A] dark:text-[#FFD19A] hover:underline whitespace-nowrap cursor-pointer"
            >
              {t.nav.jobs} →
            </button>
            <button
              type="button"
              onClick={() => navigate('/skills')}
              className="text-[#A85B0A] dark:text-[#FFD19A] hover:underline whitespace-nowrap cursor-pointer"
            >
              {t.nav.skills} →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Approved Job & Portal Listings */}
          <div className="rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#FFF1DF] dark:bg-[#2B1F15] border-b border-[#F2DCC1] dark:border-[#3F2E1E] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#26364B] dark:text-[#FFF5E8]">{t.nav.jobs}</h3>
              <button
                type="button"
                onClick={() => navigate('/jobs/biodata')}
                className="text-xs font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
              >
                {tr(language, '১-মিনিটে বায়োডাটা →', '1-मिनट बायोडाटा →', '1-Min Biodata Builder →')}
              </button>
            </div>
            <div className="divide-y divide-[#F2DCC1] dark:divide-[#3F2E1E]">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="w-full text-left p-5 hover:bg-[#FFF9F0] dark:hover:bg-[#2E2116] transition-colors block cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B4F] dark:text-[#B6A695] mb-1.5">
                    <span>
                      {localizeJobCategory(job.category, language)} · {job.location}
                    </span>
                    <VerificationLabel status={job.verificationStatus} isDemo={job.isDemo} />
                  </div>
                  <p className="text-base font-bold text-[#26364B] dark:text-[#FFF5E8]">
                    {pickText(job.title, language)}
                  </p>
                  <p className="mt-1 text-xs text-[#454545] dark:text-[#DDD2C5]">
                    {job.employerName} ·{' '}
                    <span className="font-bold text-[#27845B] dark:text-[#45B884]">
                      {pickText(job.salaryDisplay, language)}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Verified Free Skill Development */}
          <div className="rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#FFF1DF] dark:bg-[#2B1F15] border-b border-[#F2DCC1] dark:border-[#3F2E1E] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#26364B] dark:text-[#FFF5E8]">{t.nav.skills}</h3>
              <button
                type="button"
                onClick={() => navigate('/updates')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{t.nav.updates}</span>
              </button>
            </div>
            <div className="divide-y divide-[#F2DCC1] dark:divide-[#3F2E1E]">
              {courses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => navigate(`/skills/${course.id}`)}
                  className="w-full text-left p-5 hover:bg-[#FFF9F0] dark:hover:bg-[#2E2116] transition-colors block cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B4F] dark:text-[#B6A695] mb-1.5">
                    <span>
                      {localizeSkillCategory(course.category, language)} ·{' '}
                      {localizeMode(course.mode, language)} · {course.fees}
                    </span>
                    <VerificationLabel status={course.verificationStatus} isDemo={course.isDemo} />
                  </div>
                  <p className="text-base font-bold text-[#26364B] dark:text-[#FFF5E8]">
                    {pickText(course.name, language)}
                  </p>
                  <p className="mt-1 text-xs text-[#454545] dark:text-[#DDD2C5]">
                    {course.provider} · {course.duration}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FINANCIAL EDUCATION CALCULATORS */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#26364B] dark:text-[#FFF5E8]">
              {t.home.financeTitle}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-[#454545] dark:text-[#DDD2C5] max-w-2xl">
              {t.home.financeSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/finance')}
            className="text-sm font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline whitespace-nowrap cursor-pointer"
          >
            {t.home.viewAll} →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {[
            {
              path: '/finance/budget',
              title:
                language === 'bn'
                  ? 'মাসিক সংসার বাজেট ক্যালকুলেটর'
                  : language === 'hi'
                    ? 'मासिक घरेलू बजट कैलकुलेटर'
                    : 'Monthly Budget Calculator',
              desc:
                language === 'bn'
                  ? 'আয় ও প্রয়োজনীয় খরচ চার্টে দেখুন এবং মাসিক সঞ্চয় পরিকল্পনা করুন।'
                  : language === 'hi'
                    ? 'घरेलू आय और आवश्यक खर्चों को चार्ट में देखें और मासिक बचत की योजना बनाएं।'
                    : 'Break down household income vs. essentials with live charts and practical spending guidance.',
            },
            {
              path: '/finance/savings',
              title:
                language === 'bn'
                  ? 'সঞ্চয় ক্যালকুলেটর ও লক্ষ্য ট্র্যাকার'
                  : language === 'hi'
                    ? 'बचत कैलकुलेटर और लक्ष्य ट्रैकर'
                    : 'Savings Calculator & Goal Tracker',
              desc:
                language === 'bn'
                  ? 'প্রতি মাসে ছোট সঞ্চয় কীভাবে বাড়ে তা হিসাব করুন এবং নিজের লক্ষ্য সেভ করুন।'
                  : language === 'hi'
                    ? 'जानें कि हर महीने की छोटी बचत समय के साथ कैसे बढ़ती है और अपने लक्ष्य सहेजें।'
                    : 'See how regular monthly savings grow over time and track emergency or education goals.',
            },
            {
              path: '/finance/emi',
              title:
                language === 'bn'
                  ? 'ঋণের ইএমআই (EMI) ও সুদ ক্যালকুলেটর'
                  : language === 'hi'
                    ? 'ऋण ईएमआई (EMI) कैलकुलेटर'
                    : 'Loan EMI & Interest Calculator',
              desc:
                language === 'bn'
                  ? 'যেকোনো ঋণ নেওয়ার আগে মাসিক কিস্তি এবং মোট সুদ আগে থেকেই যাচাই করুন।'
                  : language === 'hi'
                    ? 'कोई भी औपचारिक ऋण लेने से पहले मासिक किस्त और कुल ब्याज की सटीक गणना करें।'
                    : 'Calculate exact monthly instalments and total interest payable before taking any formal loan.',
            },
          ].map((tool) => (
            <div
              key={tool.path}
              className="p-6 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] hover:border-[#F4A340] transition-colors flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-[#26364B] dark:text-[#FFF5E8]">{tool.title}</h3>
                <p className="mt-2 text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
                  {tool.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(tool.path)}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
              >
                <span>{t.home.openTool}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <SafetyNotice />
      </section>

      {/* SECTION 6: VERIFIED GOVERNMENT SCHEMES (With Branded JENOVA Schemes Logo) */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="max-w-2xl space-y-2.5">
            <JenovaSchemesLogo size="sm" theme={theme} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#26364B] dark:text-[#FFF5E8]">
                {t.home.schemesTitle}
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-[#454545] dark:text-[#DDD2C5]">
                {t.home.schemesSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/schemes')}
            className="text-sm font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline whitespace-nowrap cursor-pointer"
          >
            {t.home.viewAll} →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {schemes.map((sch) => (
            <div
              key={sch.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] hover:border-[#F4A340] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B4F] dark:text-[#B6A695] mb-2">
                  <span>
                    {localizeScope(sch.scope, language)} · {localizeSchemeCategory(sch.category, language)}
                  </span>
                  <VerificationLabel status={sch.verificationStatus} />
                </div>
                <h3 className="text-lg font-bold text-[#26364B] dark:text-[#FFF5E8]">
                  {pickText(sch.officialName, language)}
                </h3>
                <p className="mt-1 text-xs text-[#665B4F] dark:text-[#B6A695]">
                  {pickText(sch.department, language)}
                </p>
                <p className="mt-2.5 text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed line-clamp-2">
                  {pickText(sch.description, language)}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#F2DCC1] dark:border-[#3F2E1E] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/schemes/${sch.id}`)}
                  className="text-xs font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
                >
                  {language === 'bn'
                    ? 'বিস্তারিত গাইড দেখুন →'
                    : language === 'hi'
                      ? 'विस्तृत गाइड देखें →'
                      : 'View Scheme Guide →'}
                </button>
                <a
                  href={sch.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#454545] dark:text-[#DDD2C5] hover:text-[#26364B] hover:underline truncate max-w-[200px]"
                >
                  {sch.officialWebsite.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: RECENT FRAUD WARNINGS, DOCUMENT PREP & LOCAL DIRECTORY */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Recent Fraud Warnings (With Branded JENOVA Protect Logo) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="space-y-2.5">
              <JenovaProtectLogo size="sm" theme={theme} />
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#26364B] dark:text-[#FFF5E8]">
                  {language === 'bn'
                    ? 'সাম্প্রতিক প্রতারণা সতর্কতা (JENOVA Protect)'
                    : language === 'hi'
                      ? 'हालिया धोखाधड़ी चेतावनियाँ (JENOVA Protect)'
                      : 'Recent Fraud Warnings'}
                </h2>
                <p className="mt-1 text-sm text-[#454545] dark:text-[#DDD2C5]">
                  {language === 'bn'
                    ? 'সারা দেশে প্রচলিত ডিজিটাল ও চাকরির প্রতারণার ধরনগুলি জানুন এবং সন্দেহজনক মেসেজ যাচাই করুন।'
                    : language === 'hi'
                      ? 'देश भर में सक्रिय डिजिटल और नौकरी धोखाधड़ी के तरीकों से सतर्क रहें और संदिग्ध संदेशों की जांच करें।'
                      : 'Stay ahead of active digital, employment, and welfare scam patterns across India.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/scam-check')}
              className="text-sm font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline whitespace-nowrap cursor-pointer"
            >
              {language === 'bn'
                ? 'JENOVA Protect খুলুন →'
                : language === 'hi'
                  ? 'JENOVA Protect खोलें →'
                  : 'Open JENOVA Protect →'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {fraudAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] hover:border-[#F4A340] transition-colors flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#665B4F] dark:text-[#B6A695]">
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {localizeScamType(alert.scamType, language)}
                    </span>
                    <span>{alert.publishedAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#26364B] dark:text-[#FFF5E8]">
                    {pickText(alert.title, language)}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
                    {pickText(alert.summary, language)}
                  </p>
                </div>
                <p className="text-xs font-medium text-[#1F6A49] dark:text-[#7DE0B0] bg-[#E9F5EF] dark:bg-[#143022] border border-[#27845B]/25 rounded-xl px-3 py-2">
                  {pickText(alert.safetyTip, language)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist Guide + Verified Local Assistance Directory (With Branded JENOVA Local Logo) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#FFF1DF] via-[#FFF9F0] to-[#FFE5C2] dark:from-[#261B12] dark:via-[#221911] dark:to-[#2E2014] text-[#26364B] dark:text-[#FFF5E8] border border-[#F4A340]/55 dark:border-[#5C4128] flex flex-col justify-between gap-5 shadow-[0_12px_28px_-14px_rgba(244,163,64,0.28)]">
            <div className="space-y-3">
              <span className="w-11 h-11 rounded-xl bg-white dark:bg-[#382616] border border-[#F2DCC1] dark:border-[#5C4128] inline-flex items-center justify-center">
                <FileCheck2 className="w-6 h-6 text-[#A85B0A] dark:text-[#FFD19A]" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#26364B] dark:text-[#FFF5E8]">
                {language === 'bn'
                  ? 'JENOVA Checklist — কাগজপত্র প্রস্তুতি গাইড'
                  : language === 'hi'
                    ? 'JENOVA Checklist — दस्तावेज़ तैयारी गाइड'
                    : 'JENOVA Checklist — Document Preparation Guide'}
              </h2>
              <p className="text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
                {language === 'bn'
                  ? 'অসম্পূর্ণ কাগজ বা নামের বানানের অমিলের জন্য বারবার BSK বা BDO অফিস থেকে ফিরে আসতে হয়। যাওয়ার আগেই আপনার ফোল্ডার যাচাই করে নিন।'
                  : language === 'hi'
                    ? 'अधूरे कागज़ात या नाम की वर्तनी में अंतर के कारण बार-बार BSK या BDO कार्यालय से लौटना न पड़े — जाने से पहले अपना फ़ोल्डर जांच लें।'
                    : 'Avoid wasted trips to BSK or BDO offices caused by missing photocopies, spelling mismatches, or inactive Aadhaar DBT seeding.'}
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#454545] dark:text-[#E5D3BE] pt-1">
                <li>
                  <strong className="text-[#26364B] dark:text-[#FFD19A]">1.</strong>{' '}
                  {language === 'bn'
                    ? 'প্রকল্প বেছে নিন ও ৩টি সহজ প্রশ্নে প্রাথমিক ধারণা পান।'
                    : language === 'hi'
                      ? 'अपनी योजना चुनें और 3 सरल प्रश्नों के उत्तर दें।'
                      : 'Select your scheme and answer 3 non-sensitive questions.'}
                </li>
                <li>
                  <strong className="text-[#26364B] dark:text-[#FFD19A]">2.</strong>{' '}
                  {language === 'bn'
                    ? 'প্রতিটি নথি "প্রস্তুত / নেই / সাহায্য দরকার" চিহ্নিত করুন।'
                    : language === 'hi'
                      ? 'प्रत्येक दस्तावेज़ को "तैयार / अधूरा / सहायता चाहिए" के रूप में चिह्नित करें।'
                      : 'Mark each document Ready, Missing, Not Applicable, or Need Help.'}
                </li>
                <li>
                  <strong className="text-[#26364B] dark:text-[#FFD19A]">3.</strong>{' '}
                  {language === 'bn'
                    ? 'অফলাইনে সেভ করুন, প্রিন্ট নিন বা হোয়াটসঅ্যাপে পাঠান (কোনো আপলোড নেই)।'
                    : language === 'hi'
                      ? 'फ़ोन में ऑफ़लाइन सहेजें, PDF प्रिंट करें या WhatsApp पर साझा करें — कोई अपलोड नहीं।'
                      : 'Save offline on your phone, print PDF, or share via WhatsApp — zero uploads.'}
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => navigate('/checklist')}
              className="jenova-saffron-btn inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-extrabold cursor-pointer min-h-[46px]"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>
                {language === 'bn'
                  ? 'JENOVA Checklist শুরু করুন'
                  : language === 'hi'
                    ? 'JENOVA Checklist खोलें'
                    : 'Open JENOVA Checklist'}
              </span>
            </button>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <JenovaLocalLogo size="sm" theme={theme} />
                <div>
                  <h2 className="text-xl font-extrabold text-[#26364B] dark:text-[#FFF5E8]">
                    {language === 'bn'
                      ? 'JENOVA Local — স্থানীয় সহায়তা ডিরেক্টরি'
                      : language === 'hi'
                        ? 'JENOVA Local — सत्यापित स्थानीय सहायता निर्देशिका'
                        : 'JENOVA Local — Verified Assistance Directory'}
                  </h2>
                  <p className="text-xs text-[#665B4F] dark:text-[#B6A695] mt-0.5">
                    {language === 'bn'
                      ? 'ভারত ও রাজ্য স্তরের যাচাইকৃত অফিসিয়াল সহায়তা সূত্র ও শেষ যাচাইয়ের তারিখ।'
                      : language === 'hi'
                        ? 'सत्यापन स्थिति और अंतिम जांच तिथि के साथ आधिकारिक स्थानीय सहायता स्रोत।'
                        : 'Verified official assistance portals with verification status and last-checked dates.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/local-help')}
                className="text-xs font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
              >
                {t.home.viewAll} →
              </button>
            </div>
            <div className="divide-y divide-[#F2DCC1] dark:divide-[#3F2E1E]">
              {centres.map((centre) => (
                <div
                  key={centre.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#665B4F] dark:text-[#B6A695]">
                      <span>{localizeAssistanceCategory(centre.category, language)}</span>
                      <span>·</span>
                      <VerificationLabel status={centre.verificationStatus} />
                      <span>·</span>
                      <span>
                        {tr(
                          language,
                          `যাচাই তারিখ ${centre.dateVerified}`,
                          `जांच तिथि ${centre.dateVerified}`,
                          `Checked ${centre.dateVerified}`
                        )}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#26364B] dark:text-[#FFF5E8] mt-0.5">
                      {pickText(centre.name, language)}
                    </p>
                    <p className="text-xs text-[#454545] dark:text-[#DDD2C5]">{centre.locationArea}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/local-help')}
                    className="text-xs font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline whitespace-nowrap self-start sm:self-center cursor-pointer"
                  >
                    {language === 'bn'
                      ? 'বিস্তারিত →'
                      : language === 'hi'
                        ? 'विवरण देखें →'
                        : 'View Details →'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust & Verification Standards + Interactive FAQ Accordion (#jenova-faqs) */}
        <div id="jenova-faqs" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 scroll-mt-24">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] space-y-4">
            <div className="flex items-center gap-2 text-[#27845B] dark:text-[#45B884]">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-lg font-extrabold text-[#26364B] dark:text-[#FFF5E8]">
                {language === 'bn'
                  ? 'বিশ্বাস ও যাচাইকরণ নীতি'
                  : language === 'hi'
                    ? 'विश्वास और सत्यापन मानक'
                    : 'Trust & Verification Standards'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
              {language === 'bn'
                ? 'JENOVA কোনো সরকারি দপ্তর, ব্যাংক বা দালাল সংস্থা নয়। প্রতিটি তথ্যের পাশে তার প্রকৃত যাচাইয়ের অবস্থা ও সরকারি উৎস উল্লেখ থাকে:'
                : language === 'hi'
                  ? 'JENOVA एक स्वतंत्र सामुदायिक मार्गदर्शन मंच है — यह कोई सरकारी कार्यालय, बैंक या एजेंट नहीं है। प्रत्येक जानकारी के साथ उसकी सत्यापन स्थिति स्पष्ट रूप से दिखाई जाती है:'
                  : 'JENOVA is an independent community guidance platform — not a government office, lender, or placement agency. Every listing discloses its verification status:'}
            </p>
            <ul className="space-y-2 text-xs text-[#454545] dark:text-[#DDD2C5]">
              <li>
                <strong className="text-[#27845B] dark:text-[#45B884]">
                  {tr(language, 'সরকারিভাবে যাচাইকৃত:', 'आधिकारिक रूप से सत्यापित:', 'Officially Verified:')}
                </strong>{' '}
                {tr(
                  language,
                  'সরাসরি অফিসিয়াল .gov.in / .nic.in পোর্টাল থেকে সংগৃহীত।',
                  'सीधे आधिकारिक .gov.in / .nic.in पोर्टल से संकलित।',
                  'Directly sourced from official .gov.in / .nic.in portals.'
                )}
              </li>
              <li>
                <strong className="text-[#27845B] dark:text-[#45B884]">
                  {tr(language, 'স্বতন্ত্রভাবে যাচাইকৃত:', 'स्वतंत्र रूप से सत्यापित:', 'Independently Verified:')}
                </strong>{' '}
                {tr(
                  language,
                  'আমাদের যাচাইকরণ টিম কর্তৃক উৎস লিঙ্ক ও পরীক্ষার তারিখসহ যাচাইকৃত।',
                  'हमारी सत्यापन टीम द्वारा स्रोत लिंक और जांच तिथि के साथ सत्यापित।',
                  'Checked by our Verification Desk with source link & review date.'
                )}
              </li>
              <li>
                <strong className="text-[#A85B0A] dark:text-[#FFD19A]">
                  {tr(
                    language,
                    'কমিউনিটি জমাকৃত / যাচাই বাকি:',
                    'समुदाय द्वारा जमा / सत्यापन लंबित:',
                    'Community Submitted / Pending:'
                  )}
                </strong>{' '}
                {tr(
                  language,
                  'স্থানীয়ভাবে জমা দেওয়া হয়েছে এবং যাচাইয়ের অপেক্ষায় আছে — কখনোই নিশ্চিত হিসেবে দেখানো হয় না।',
                  'स्थानीय रूप से साझा किया गया और सत्यापन की प्रतीक्षा में — कभी भी पुष्टि के रूप में नहीं दिखाया जाता।',
                  'Submitted locally and awaiting verification — never shown as confirmed.'
                )}
              </li>
              <li>
                <strong className="text-red-600 dark:text-red-400">
                  {tr(language, 'মেয়াদোত্তীর্ণ:', 'समाप्त:', 'Expired:')}
                </strong>{' '}
                {tr(
                  language,
                  'শেষ তারিখ পার হলেই স্পষ্টভাবে চিহ্নিত করা হয় যাতে কারো সময় নষ্ট না হয়।',
                  'अंतिम तिथि बीत जाने पर स्पष्ट रूप से चिह्नित किया जाता है ताकि किसी का समय व्यर्थ न हो।',
                  'Marked outdated past review deadline so users never waste a trip.'
                )}
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] space-y-3">
            <h2 className="text-lg font-extrabold text-[#26364B] dark:text-[#FFF5E8]">
              {language === 'bn'
                ? 'সাধারণ জিজ্ঞাসা (FAQs)'
                : language === 'hi'
                  ? 'अक्सर पूछे जाने वाले प्रश्न (FAQs)'
                  : 'Frequently Asked Questions (FAQs)'}
            </h2>
            <div className="divide-y divide-[#F2DCC1] dark:divide-[#3F2E1E]">
              {[
                {
                  qBn: 'JENOVA কি কোনো সরকারি ওয়েবসাইট?',
                  qHi: 'क्या JENOVA कोई सरकारी वेबसाइट है?',
                  qEn: 'Is JENOVA an official government website?',
                  aBn: 'না। JENOVA একটি স্বাধীন কমিউনিটি সহায়তা প্ল্যাটফর্ম। এটি আপনাকে সহজ বাংলায় প্রকল্প বুঝতে, কাগজপত্র প্রস্তুত করতে এবং সরাসরি অফিসিয়াল .gov.in পোর্টাল বা BSK-তে পৌঁছাতে সাহায্য করে।',
                  aHi: 'नहीं। JENOVA एक स्वतंत्र सामुदायिक मार्गदर्शन मंच है। यह आपको सरल भाषा में योजनाएं समझने, दस्तावेज़ तैयार करने और सीधे आधिकारिक .gov.in पोर्टल या BSK तक पहुंचने में मदद करता है।',
                  aEn: 'No. JENOVA is an independent community information platform. It explains schemes simply and links directly to official .gov.in / .nic.in portals and verified BSK resources.',
                },
                {
                  qBn: 'JENOVA Checklist বা JENOVA Protect-এ কি আধার বা OTP দিতে হয়?',
                  qHi: 'क्या JENOVA Checklist या JENOVA Protect में आधार या OTP देना होता है?',
                  qEn: 'Do I need to upload Aadhaar or share OTP/UPI PIN?',
                  aBn: 'কখনোই নয়। JENOVA কখনোই আপনার আধার নম্বর, ব্যাংক পাসবই আপলোড, OTP বা UPI PIN চায় না। আপনার চেকলিস্ট কেবল আপনার ফোনেই অফলাইনে সেভ থাকে।',
                  aHi: 'बिल्कुल नहीं। JENOVA कभी भी आपका आधार अपलोड, OTP, UPI PIN या बैंक पासवर्ड नहीं मांगता। आपकी दस्तावेज़ सूची केवल आपके फ़ोन में ऑफ़लाइन सुरक्षित रहती है।',
                  aEn: 'Never. JENOVA never asks for Aadhaar uploads, OTPs, UPI PINs, or banking passwords. Your document checklist stays locally on your own device.',
                },
                {
                  qBn: 'JENOVA Protect কি কোনো মেসেজকে ১০০% নিরাপদ বলে গ্যারান্টি দেয়?',
                  qHi: 'क्या JENOVA Protect किसी संदेश के 100% सुरक्षित होने की गारंटी देता है?',
                  qEn: 'Does JENOVA Protect guarantee a message is 100% safe?',
                  aBn: 'না। কোনো স্বয়ংক্রিয় টুল ১০০% নিশ্চয়তা দিতে পারে না। এটি পরিচিত প্রতারণার লক্ষণ ধরিয়ে দেয়, তবে টাকা বা ব্যক্তিগত তথ্য দেওয়ার আগে সবসময় অফিসিয়াল উৎসে যাচাই করুন এবং প্রতারণা হলে ১৯৩০-তে কল করুন।',
                  aHi: 'नहीं। कोई भी स्वचालित टूल 100% गारंटी नहीं दे सकता। यह धोखाधड़ी के संभावित संकेत दिखाता है और आधिकारिक हेल्पलाइन (1930 / cybercrime.gov.in) की जानकारी देता है, पर हमेशा स्वतंत्र रूप से भी पुष्टि करें।',
                  aEn: 'No automated tool can guarantee 100% safety. JENOVA Protect highlights known fraud indicators and official reporting channels (1930 / cybercrime.gov.in), but always verify independently.',
                },
                {
                  qBn: 'ইন্টারনেট দুর্বল থাকলে বা অফলাইনে কি JENOVA কাজ করবে?',
                  qHi: 'क्या धीमे इंटरनेट या ऑफ़लाइन में भी JENOVA काम करेगा?',
                  qEn: 'Does JENOVA work on slow mobile networks or offline?',
                  aBn: 'হ্যাঁ। আপনি JENOVA-কে আপনার ফোনের হোম স্ক্রিনে অ্যাপ হিসেবে ইনস্টল করতে পারেন এবং আগে দেখা সরকারি প্রকল্প, স্থানীয় সহায়তা ও আপনার সেভ করা চেকলিস্ট অফলাইনেও দেখতে পারবেন।',
                  aHi: 'हाँ। आप JENOVA को अपने फ़ोन की होम स्क्रीन पर ऐप (PWA) के रूप में इंस्टॉल कर सकते हैं और पहले देखी गई योजनाएं, स्थानीय सहायता केंद्र और अपनी चेकलिस्ट ऑफ़लाइन भी देख सकते हैं।',
                  aEn: 'Yes. You can install JENOVA on your phone home screen as a PWA to access cached public scheme guides, local help directories, and your saved checklists offline.',
                },
              ].map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="py-3">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-3 text-left text-sm font-bold text-[#26364B] dark:text-[#FFF5E8] hover:text-[#A85B0A] dark:hover:text-[#FFD19A] cursor-pointer"
                    >
                      <span>
                        {language === 'bn' ? item.qBn : language === 'hi' ? item.qHi : item.qEn}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-[#665B4F] dark:text-[#B6A695] transition-transform ${
                          isOpen ? 'rotate-180 text-[#A85B0A] dark:text-[#FFD19A]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs sm:text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
                        {language === 'bn' ? item.aBn : language === 'hi' ? item.aHi : item.aEn}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: REAL VERIFIED PLATFORM STATS & HONEST PILOT TARGETS */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#26364B] dark:text-[#FFF5E8]">
            {t.home.impactTitle}
          </h2>
          <p className="mt-1.5 text-sm text-[#454545] dark:text-[#DDD2C5] leading-relaxed">
            {t.home.impactDisclaimer}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label:
                language === 'bn'
                  ? 'যাচাইকৃত সরকারি প্রকল্প ও সহায়তা'
                  : language === 'hi'
                    ? 'सत्यापित योजनाएं एवं सहायता केंद्र'
                    : 'Verified Schemes & Help Centres',
              value: stats
                ? String(stats.verifiedCounts.schemes + (stats.verifiedCounts.assistanceCentres || 0))
                : '—',
              note: tr(language, 'লাইভ ডাটাবেস সংখ্যা', 'लाइव डेटाबेस संख्या', 'Live database count'),
            },
            {
              label:
                language === 'bn'
                  ? 'সম্পন্ন ফোল্ডার চেকলিস্ট'
                  : language === 'hi'
                    ? 'पूर्ण दस्तावेज़ चेकलिस्ट'
                    : 'Document Checklists Completed',
              value: stats ? String(stats.checklistsCompleted ?? 0) : '—',
              note: tr(language, 'প্রকৃত ব্যবহারের সংখ্যা', 'वास्तविक उपयोग गणना', 'Real completion counter'),
            },
            {
              label:
                language === 'bn'
                  ? 'সম্পন্ন প্রতারণা যাচাই'
                  : language === 'hi'
                    ? 'पूर्ण धोखाधड़ी जांच'
                    : 'Fraud Checks Completed',
              value: stats ? String(stats.fraudChecksCompleted ?? 0) : '—',
              note: tr(language, 'প্রকৃত সুরক্ষা যাচাই সংখ্যা', 'वास्तविक सुरक्षा जांच गणना', 'Real safety check counter'),
            },
            {
              label:
                language === 'bn'
                  ? 'অফিসিয়াল পোর্টাল ও BSK রেফারেল'
                  : language === 'hi'
                    ? 'आधिकारिक पोर्टल और BSK रेफ़रल'
                    : 'Official & Local Help Referrals',
              value: stats
                ? String(
                    stats.schemeReferrals +
                      stats.trainingReferrals +
                      stats.jobReferrals +
                      (stats.localHelpClicks ?? 0)
                  )
                : '—',
              note: tr(
                language,
                `ভিজিট: ${stats ? stats.totalVisits : '—'}`,
                `विज़िट्स: ${stats ? stats.totalVisits : '—'}`,
                `Visits: ${stats ? stats.totalVisits : '—'}`
              ),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E]"
            >
              <p className="text-xs font-semibold text-[#665B4F] dark:text-[#B6A695]">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-[#26364B] dark:text-[#FFD19A]">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-[#665B4F] dark:text-[#B6A695]">{stat.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 p-5 rounded-2xl bg-[#FFF1DF] dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#3F2E1E] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#27845B] dark:text-[#45B884] shrink-0 mt-0.5" />
            <div className="text-sm text-[#26364B] dark:text-[#FFF5E8]">
              <p className="font-bold">
                {language === 'bn'
                  ? 'JENOVA কমিউনিটি ইমপ্যাক্ট ও ডিজিটাল অন্তর্ভুক্তি মিশন'
                  : language === 'hi'
                    ? 'JENOVA सामुदायिक प्रभाव और डिजिटल समावेशन मिशन'
                    : 'JENOVA Community Impact & Digital Inclusion Mission'}
              </p>
              <p className="text-xs text-[#454545] dark:text-[#DDD2C5] mt-1">
                {language === 'bn'
                  ? 'প্রতিটি পরিবার যেন যাচাইকৃত সরকারি প্রকল্প, নিরাপদ কর্মসংস্থান, বিনামূল্যে দক্ষতা প্রশিক্ষণ এবং প্রতারণা সুরক্ষা নিজ ভাষায় সহজে পায় — সেই লক্ষ্যেই JENOVA কাজ করে।'
                  : language === 'hi'
                    ? 'हमारा उद्देश्य है कि हर परिवार अपनी भाषा में सत्यापित सरकारी योजनाओं, सुरक्षित रोजगार, निःशुल्क कौशल प्रशिक्षण और डिजिटल सुरक्षा उपकरणों तक आसानी से पहुंच सके।'
                    : 'Empowering households across India with verified welfare portals, scam-free career discovery, free skill pathways, and practical financial planning tools in their own language.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/about')}
            className="text-xs font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline whitespace-nowrap cursor-pointer"
          >
            {language === 'bn'
              ? 'আমাদের মিশন পড়ুন →'
              : language === 'hi'
                ? 'हमारा मिशन पढ़ें →'
                : 'Explore Our Mission →'}
          </button>
        </div>
      </section>
      </div>

      {/* Interactive Watch Demo Walkthrough Modal */}
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
