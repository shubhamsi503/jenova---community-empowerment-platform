import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Laptop,
  PlayCircle,
  Printer,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Store,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pickText, tr } from '../i18n/translations';
import { UDAAN_PROGRAMMES } from '../data/udaanCatalog';
import { apiFetch, trackAnalyticsEvent } from '../lib/api';
import { VISUAL_ASSETS, type VisualAsset } from '../lib/visualAssets';
import type { Language, UdaanCategory, UdaanProgramme } from '../types/platform';
import { ResilientImage, SafetyNotice } from '../components/SharedUI';
import { ReadAloudButton } from '../components/VoiceAccessibility';

const CATEGORIES: ('All' | UdaanCategory)[] = [
  'All',
  'Interview Preparation',
  'Business Plan Executive',
  'Personality & Soft Skills',
  'Professional Digital',
  'MSME & Entrepreneurship',
  'Practical Executive',
];

function getModuleVisual(programmeId: string): {
  image: VisualAsset;
  Icon: React.ComponentType<{ className?: string }>;
} {
  switch (programmeId) {
    case 'udaan-interview-prep':
      return { image: VISUAL_ASSETS.udaanInterviewPrep, Icon: Users };
    case 'udaan-business-plan':
      return { image: VISUAL_ASSETS.udaanBusinessPlan, Icon: TrendingUp };
    case 'udaan-soft-skills':
      return { image: VISUAL_ASSETS.udaanSoftSkills, Icon: Star };
    case 'udaan-digital-pro':
      return { image: VISUAL_ASSETS.udaanDigitalSkills, Icon: Laptop };
    case 'udaan-msme-entrepreneur':
      return { image: VISUAL_ASSETS.udaanMsmeEntrepreneur, Icon: Store };
    case 'udaan-practical-exec':
    default:
      return { image: VISUAL_ASSETS.udaanPracticalExec, Icon: Wrench };
  }
}

function localizeCategory(cat: 'All' | UdaanCategory, language: Language): string {
  switch (cat) {
    case 'All':
      return tr(language, 'সব মডিউল (৬)', 'सभी मॉड्यूल (6)', 'All Modules (6)');
    case 'Interview Preparation':
      return tr(language, 'ইন্টারভিউ প্রস্তুতি', 'इंटरव्यू तैयारी', 'Interview Prep');
    case 'Business Plan Executive':
      return tr(language, 'বিজনেস প্ল্যান', 'बिज़नेस प्लान', 'Business Plan');
    case 'Personality & Soft Skills':
      return tr(language, 'ব্যক্তিত্ব ও সফট স্কিল', 'सॉफ्ट स्किल्स', 'Soft Skills');
    case 'Professional Digital':
      return tr(language, 'ডিজিটাল দক্ষতা', 'डिजिटल कौशल', 'Professional Digital');
    case 'MSME & Entrepreneurship':
      return tr(language, 'MSME ও উদ্যোক্তা', 'MSME और उद्यमिता', 'MSME & Entrepreneurship');
    case 'Practical Executive':
      return tr(language, 'প্র্যাকটিক্যাল এক্সিকিউটিভ', 'प्रैक्टिकल एग्जीक्यूटिव', 'Practical Executive');
  }
}

function computeProgress(
  prog: UdaanProgramme,
  completedLessons: string[],
  hasQuiz: boolean,
  hasAssignment: boolean
): number {
  const totalUnits = prog.lessons.length + 2; // lessons + assignment + quiz
  const doneUnits = completedLessons.length + (hasQuiz ? 1 : 0) + (hasAssignment ? 1 : 0);
  return Math.min(100, Math.round((doneUnits / totalUnits) * 100));
}

function UdaanWordmark() {
  return (
    <div className="inline-flex flex-col select-none" aria-label="JENOVA UDAAN">
      <span className="text-xs sm:text-sm font-extrabold tracking-[0.18em] text-[#572507] dark:text-[#FFD8B8] uppercase">
        JENOVA
      </span>
      <div className="flex items-end gap-1.5 -mt-1">
        <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#F47713] leading-none">
          UDAAN
        </span>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className="text-[#F47713] -mb-0.5 shrink-0"
        >
          <path
            d="M5 24 L25 6 M25 6 L15 6 M25 6 L25 16"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function UdaanHubPage() {
  const { language, navigate, udaanEnrolments, enrolUdaan, profile, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'catalogue' | 'dashboard'>('catalogue');
  const [selectedCategory, setSelectedCategory] = useState<'All' | UdaanCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [workshopRequested, setWorkshopRequested] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return UDAAN_PROGRAMMES.filter((p) => {
      const catOk = selectedCategory === 'All' || p.category === selectedCategory;
      if (!catOk) return false;
      if (!q) return true;
      const haystack = `${p.title.en} ${p.title.bn} ${p.title.hi} ${p.summary.en} ${p.category} ${p.skillTags.join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [selectedCategory, searchQuery]);

  const enrolledDetails = useMemo(() => {
    return udaanEnrolments
      .map((enr) => {
        const prog = UDAAN_PROGRAMMES.find((p) => p.id === enr.programmeId);
        if (!prog) return null;
        const pct = computeProgress(
          prog,
          enr.completedLessonIds,
          enr.quizScore !== undefined,
          Boolean(enr.assignmentResponse && enr.assignmentResponse.trim().length >= 15)
        );
        return { enr, prog, pct };
      })
      .filter(Boolean) as {
      enr: (typeof udaanEnrolments)[number];
      prog: UdaanProgramme;
      pct: number;
    }[];
  }, [udaanEnrolments]);

  const dashboardMetrics = useMemo(() => {
    const lessonsCompleted = enrolledDetails.reduce(
      (sum, item) => sum + item.enr.completedLessonIds.length,
      0
    );
    const quizzesCompleted = enrolledDetails.filter(
      (item) => item.enr.quizScore !== undefined
    ).length;
    const draftsSaved = enrolledDetails.filter(
      (item) => item.enr.assignmentResponse && item.enr.assignmentResponse.trim().length >= 15
    ).length;
    return { lessonsCompleted, quizzesCompleted, draftsSaved };
  }, [enrolledDetails]);

  const isRecommendedForUser = (prog: UdaanProgramme): boolean => {
    if (
      (profile.careerGoals.includes('start_business') || profile.businessInterests.length > 0) &&
      (prog.id === 'udaan-business-plan' || prog.id === 'udaan-msme-entrepreneur')
    ) {
      return true;
    }
    if (
      (profile.careerGoals.includes('find_job') || profile.employmentStatus === 'seeking_job') &&
      (prog.id === 'udaan-interview-prep' || prog.id === 'udaan-soft-skills')
    ) {
      return true;
    }
    return false;
  };

  const handleQuickEnrol = async (progId: string) => {
    await enrolUdaan(progId);
    showToast(
      tr(
        language,
        'JENOVA UDAAN মডিউলে সফলভাবে নথিভুক্ত হয়েছেন!',
        'JENOVA UDAAN मॉड्यूल में सफलतापूर्वक नामांकन हो गया!',
        'Enrolled in JENOVA UDAAN training module!'
      )
    );
    navigate(`/udaan/${progId}`);
  };

  const scrollToCatalogue = () => {
    setActiveTab('catalogue');
    window.setTimeout(() => {
      document.getElementById('udaan-modules')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const openDashboardView = () => {
    setActiveTab('dashboard');
    window.setTimeout(() => {
      document.getElementById('udaan-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleWorkshopInterest = () => {
    if (workshopRequested) return;
    trackAnalyticsEvent('workshop_interest', 'udaan-community-workshop');
    setWorkshopRequested(true);
    showToast(
      tr(
        language,
        'ওয়ার্কশপের আগ্রহ নথিভুক্ত হয়েছে! এলাকার সেশন আপডেটের জন্য যোগাযোগ পেজে আপনার জেলা জানাতে পারেন।',
        'वर्कशॉप में आपकी रुचि दर्ज हो गई है! स्थानीय सत्र अपडेट के लिए संपर्क पेज पर अपना जिला साझा करें।',
        'Workshop interest recorded! Share your preferred topic & district on the Contact page for local session updates.'
      )
    );
  };

  const partnerBenefits = [
    {
      title: tr(
        language,
        'গঠনমূলক স্ব-গতি প্রশিক্ষণ মডিউল',
        'संरचित स्व-गति प्रशिक्षण मॉड्यूल',
        'Structured Self-Paced Training Modules'
      ),
      desc: tr(
        language,
        'বাংলা, হিন্দি ও ইংরেজিতে ৬টি ব্যবহারিক পাঠ্যক্রম',
        'बंगाली, हिंदी और अंग्रेजी में 6 व्यावहारिक पाठ्यक्रम',
        '6 focused tracks in English, Bengali & Hindi'
      ),
    },
    {
      title: tr(
        language,
        'বাস্তবমুখী ও হাতে-কলমে অনুশীলন',
        'व्यावहारिक और हैंड्स-ऑन अभ्यास',
        'Practical & Hands-On Practice Tasks'
      ),
      desc: tr(
        language,
        'রুব্রিক চেকলিস্ট ও ঐচ্ছিক AI প্র্যাকটিস কোচ ফিডব্যাক',
        'रूब्रिक चेकलिस्ट और वैकल्पिक AI प्रैक्टिस कोच फीडबैक',
        'Real-world assignments with optional AI Coach feedback'
      ),
    },
    {
      title: tr(
        language,
        'চাকরি ও ক্ষুদ্র ব্যবসা-কেন্দ্রিক দক্ষতা',
        'करियर और व्यवसाय केंद्रित कौशल',
        'Career & Business Focused Skills'
      ),
      desc: tr(
        language,
        'ইন্টারভিউ, বায়োডাটা, বিজনেস প্ল্যান ও উদ্যম প্রস্তুতি',
        'इंटरव्यू, बायोडाटा, बिजनेस प्लान और उद्यम तैयारी',
        'Directly connected to jobs, MSME planning & Action Passport'
      ),
    },
    {
      title: tr(
        language,
        'অগ্রগতি ট্র্যাকিং ও অনুশীলন রেকর্ড',
        'प्रगति ट्रैकिंग और अभ्यास रिकॉर्ड',
        'Progress Tracking & Practice Records'
      ),
      desc: tr(
        language,
        'প্রিন্টযোগ্য ব্যক্তিগত অগ্রগতি নথি ও সরকারি কোর্সের লিঙ্ক',
        'प्रिंट योग्य प्रगति सारांश और सरकारी कोर्स लिंक',
        'Printable practice record + links to accredited public courses'
      ),
    },
  ];

  const journeySteps = [
    {
      num: '1',
      title: tr(language, 'প্রশিক্ষণ বাছুন', 'प्रशिक्षण चुनें', 'Choose Training'),
      sub: tr(language, 'লক্ষ্য অনুযায়ী মডিউল', 'लक्ष्य के अनुसार मॉड्यूल', 'Pick a track for your goal'),
      Icon: BookOpen,
      onClick: scrollToCatalogue,
    },
    {
      num: '2',
      title: tr(language, 'নথিভুক্ত হয়ে শিখুন', 'नामांकन कर सीखें', 'Enrol & Learn'),
      sub: tr(language, 'সহজ ভাষায় অডিওসহ পাঠ', 'सरल भाषा और ऑडियो पाठ', 'Bite-sized lessons with audio'),
      Icon: PlayCircle,
      onClick: scrollToCatalogue,
    },
    {
      num: '3',
      title: tr(language, 'অনুশীলন করুন', 'अभ्यास करें', 'Practise'),
      sub: tr(language, 'অ্যাসাইনমেন্ট ও কুইজ', 'अभ्यास कार्य और क्विज़', 'Complete tasks & quizzes'),
      Icon: ClipboardCheck,
      onClick: () => navigate(`/udaan/${udaanEnrolments[0]?.programmeId || 'udaan-interview-prep'}`),
    },
    {
      num: '4',
      title: tr(language, 'অগ্রগতি ট্র্যাক করুন', 'प्रगति ट्रैक करें', 'Track Progress'),
      sub: tr(language, 'লার্নিং ড্যাশবোর্ড', 'लर्निंग डैशबोर्ड', 'Monitor scores & records'),
      Icon: TrendingUp,
      onClick: openDashboardView,
    },
    {
      num: '5',
      title: tr(language, 'আগামী গড়ে তুলুন', 'आगे बढ़ें', 'Grow'),
      sub: tr(language, 'অ্যাকশন পাসপোর্ট ও সুযোগ', 'एक्शन पासपोर्ट और अवसर', 'Apply skills via Action Passport'),
      Icon: Trophy,
      onClick: () => navigate('/passport'),
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#FFF7F0] via-[#FFF0E4] to-[#FFE7D4] dark:from-[#1B100A] dark:via-[#160C07] dark:to-[#120A06] text-[#242424] dark:text-[#FFF5EC] min-h-screen transition-colors duration-200">
      {/* =====================================================================
          1. PREMIUM UDAAN HERO SECTION
          ===================================================================== */}
      <section className="relative overflow-hidden border-b border-[#F2D5BE] dark:border-[#4A2B18]">
        {/* Warm sunlit ambient backdrop accent (subtle, non-distracting) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 right-0 w-[520px] h-[520px] rounded-full bg-[#F47713]/12 dark:bg-[#F47713]/10 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-7 items-stretch">
            {/* Left Column: Brand Identity, Headline & CTAs */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-[#9E4B0C] dark:text-[#FFBC85]">
                  {tr(
                    language,
                    'প্রশিক্ষণ · অনুশীলন · পেশাদার বিকাশ',
                    'प्रशिक्षण · अभ्यास · पेशेवर विकास',
                    'Training · Practice · Professional Growth'
                  )}
                </p>

                <UdaanWordmark />

                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#242424] dark:text-[#FFF5EC] leading-[1.15] tracking-tight max-w-xl">
                  {tr(
                    language,
                    'শেখা থেকে বাস্তব আত্মবিশ্বাসের পথে।',
                    'सीखने से वास्तविक आत्मविश्वास तक।',
                    'From Learning to Real-World Confidence.'
                  )}
                </h1>

                <p className="text-sm sm:text-base text-[#5C3D2B] dark:text-[#E5CBB6] leading-relaxed max-w-lg">
                  {tr(
                    language,
                    'চাকরির ইন্টারভিউ, ক্ষুদ্র ব্যবসা পরিকল্পনা, ডিজিটাল দক্ষতা ও কর্মক্ষেত্রের প্রস্তুতি—সবকিছু সহজ ভাষায় শিখুন, অনুশীলন করুন এবং আত্মবিশ্বাসের সাথে এগিয়ে যান।',
                    'इंटरव्यू तैयारी, लघु व्यवसाय योजना, डिजिटल कौशल और कार्यस्थल की तैयारी—सरल भाषा में सीखें, अभ्यास करें और आत्मविश्वास के साथ आगे बढ़ें।',
                    'Build practical skills, prepare for job interviews and small business opportunities, and move confidently from learning to real-world action—100% free and self-paced.'
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={scrollToCatalogue}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#F47713] hover:bg-[#D96208] shadow-[0_10px_24px_-8px_rgba(244,119,19,0.55)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap min-h-[46px]"
                  >
                    <span>
                      {tr(language, 'প্রশিক্ষণ দেখুন', 'प्रशिक्षण देखें', 'Explore Trainings')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={openDashboardView}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-[#572507] dark:text-[#FFF5EC] bg-white dark:bg-[#26160D] border border-[#572507]/30 dark:border-[#F47713]/40 hover:border-[#F47713] hover:bg-[#FFF7F0] dark:hover:bg-[#351F12] transition-colors duration-200 cursor-pointer whitespace-nowrap min-h-[46px]"
                  >
                    <GraduationCap className="w-4 h-4 text-[#F47713]" />
                    <span>
                      {tr(
                        language,
                        `আমার ড্যাশবোর্ড (${enrolledDetails.length})`,
                        `मेरा डैशबोर्ड (${enrolledDetails.length})`,
                        `My Learning Dashboard (${enrolledDetails.length})`
                      )}
                    </span>
                  </button>
                </div>

                {/* Quiet unboxed summary metadata */}
                <p className="text-xs text-[#6B4C38] dark:text-[#D4B59E]">
                  {tr(
                    language,
                    '৬টি ব্যবহারিক মডিউল · বাংলা, হিন্দি ও ইংরেজি · সম্পূর্ণ ফ্রি স্ব-গতি শিক্ষা',
                    '6 व्यावहारिक मॉड्यूल · हिंदी, बंगाली और अंग्रेजी · पूर्णतः निःशुल्क स्व-गति',
                    '6 Practical Modules · English, Bengali & Hindi · 100% Free & Self-Paced'
                  )}
                </p>
              </div>
            </div>

            {/* Center Column: Authentic Editorial Training Photography */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="relative flex-1 min-h-[280px] rounded-2xl overflow-hidden border border-[#F1D5BF] dark:border-[#4A2B18] shadow-[0_18px_40px_-16px_rgba(87,37,7,0.22)] bg-[#FFE0CC] dark:bg-[#26160D]">
                <ResilientImage
                  src={VISUAL_ASSETS.udaanHeroLearner.src}
                  alt={VISUAL_ASSETS.udaanHeroLearner.alt}
                  eager
                  containerClassName="w-full h-full min-h-[280px]"
                  className="w-full h-full object-cover object-center"
                />
                {/* Measured contrast scrim for crisp bottom ribbon */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3B1704]/90 via-[#3B1704]/55 to-transparent px-5 pt-10 pb-4">
                  <p className="text-xs sm:text-sm font-bold tracking-wide text-[#FFF5EC] text-center">
                    {tr(
                      language,
                      'শিখুন · অনুশীলন করুন · এগিয়ে চলুন',
                      'सीखें · अभ्यास करें · आगे बढ़ें',
                      'Learn · Practice · Grow'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: "Your Training Partner for a Brighter Future" Benefits Card */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="flex-1 rounded-2xl bg-white/95 dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] shadow-[0_14px_34px_-16px_rgba(87,37,7,0.16)] p-5 sm:p-6 flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F4DFCE] dark:border-[#4A2B18]">
                    <h2 className="text-base sm:text-[17px] font-extrabold text-[#572507] dark:text-[#FFF5EC] leading-snug">
                      {tr(
                        language,
                        'উজ্জ্বল ভবিষ্যতের জন্য আপনার প্রশিক্ষণ সঙ্গী',
                        'उज्ज्वल भविष्य के लिए आपका प्रशिक्षण साथी',
                        'Your Training Partner for a Brighter Future'
                      )}
                    </h2>
                    <GraduationCap className="w-6 h-6 text-[#F47713] shrink-0 mt-0.5" />
                  </div>

                  <ul className="space-y-3">
                    {partnerBenefits.map((item) => (
                      <li key={item.title} className="flex items-start gap-2.5">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-[#F47713] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#242424] dark:text-[#FFF5EC] leading-snug">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#6B4C38] dark:text-[#D4B59E] mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/passport')}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#572507] dark:text-[#FFD8B8] bg-[#FFE8D6] dark:bg-[#3A2113] hover:bg-[#F47713] hover:text-white transition-colors cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>
                    {tr(
                      language,
                      'অ্যাকশন পাসপোর্টে যুক্ত করুন',
                      'एक्शन पासपोर्ट खोलें',
                      'Open Action Passport'
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. MAIN UDAAN WORKSPACE: CATALOGUE (6 PREMIUM CARDS) OR DASHBOARD
          ===================================================================== */}
      <section
        id="udaan-workspace"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 scroll-mt-20"
      >
        {/* Editorial Section Divider Heading (Echoing Reference Image) */}
        <div className="flex items-center justify-center gap-4">
          <span className="h-px flex-1 max-w-[140px] bg-[#E5BDA0] dark:bg-[#4A2B18]" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-black text-[#572507] dark:text-[#FFF5EC] tracking-tight text-center">
            {activeTab === 'catalogue'
              ? tr(language, 'আমাদের প্রশিক্ষণ মডিউলসমূহ', 'हमारे प्रशिक्षण मॉड्यूल', 'Our Training Modules')
              : tr(language, 'আমার লার্নিং ড্যাশবোর্ড', 'मेरा लर्निंग डैशबोर्ड', 'My Learning Dashboard')}
          </h2>
          <span className="h-px flex-1 max-w-[140px] bg-[#E5BDA0] dark:bg-[#4A2B18]" aria-hidden="true" />
        </div>

        {/* Workspace Mode Switcher + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#FFE0CC]/80 dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('catalogue')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'catalogue'
                  ? 'bg-[#F47713] text-white shadow-sm'
                  : 'text-[#572507] dark:text-[#E5CBB6] hover:bg-white/60 dark:hover:bg-white/5'
              }`}
            >
              {tr(language, 'সব প্রশিক্ষণ (৬)', 'सभी प्रशिक्षण (6)', 'All Trainings (6)')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-[#F47713] text-white shadow-sm'
                  : 'text-[#572507] dark:text-[#E5CBB6] hover:bg-white/60 dark:hover:bg-white/5'
              }`}
            >
              {tr(
                language,
                `আমার ড্যাশবোর্ড (${enrolledDetails.length})`,
                `मेरा डैशबोर्ड (${enrolledDetails.length})`,
                `My Dashboard (${enrolledDetails.length})`
              )}
            </button>
          </div>

          {activeTab === 'catalogue' ? (
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#8C6248] dark:text-[#D4B59E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tr(
                  language,
                  'প্রশিক্ষণ বা দক্ষতা খুঁজুন...',
                  'प्रशिक्षण या कौशल खोजें...',
                  'Search trainings or skills...'
                )}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#26160D] border border-[#EBCBB2] dark:border-[#4A2B18] text-xs sm:text-sm text-[#242424] dark:text-[#FFF5EC] placeholder:text-[#8C6248] dark:placeholder:text-[#B8947A]"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/skills')}
              className="text-xs font-bold text-[#9E4B0C] dark:text-[#FFBC85] hover:underline cursor-pointer self-start md:self-auto"
            >
              {tr(
                language,
                'সরকারি স্বীকৃত সার্টিফিকেট কোর্স দেখুন →',
                'सरकारी मान्यता प्राप्त कोर्स देखें →',
                'Browse Official Govt Accredited Courses →'
              )}
            </button>
          )}
        </div>

        {activeTab === 'catalogue' ? (
          <div id="udaan-modules" className="space-y-6 scroll-mt-24">
            {/* Functional Category Filter Tabs */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Training module categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#572507] dark:bg-[#F47713] text-white border-[#572507] dark:border-[#F47713]'
                      : 'bg-white/90 dark:bg-[#26160D] text-[#572507] dark:text-[#E5CBB6] border-[#EBCBB2] dark:border-[#4A2B18] hover:border-[#F47713]'
                  }`}
                >
                  {localizeCategory(cat, language)}
                </button>
              ))}
            </div>

            {/* 6 Premium Training Cards Grid */}
            {filtered.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] text-center space-y-3">
                <p className="text-sm font-semibold text-[#572507] dark:text-[#FFF5EC]">
                  {tr(
                    language,
                    'এই অনুসন্ধানে কোনো মডিউল পাওয়া যায়নি।',
                    'इस खोज के लिए कोई मॉड्यूल नहीं मिला।',
                    'No training modules match your current filter.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#F47713] hover:bg-[#D96208] cursor-pointer"
                >
                  {tr(language, 'সব মডিউল দেখান', 'सभी मॉड्यूल दिखाएं', 'Show All 6 Modules')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((prog) => {
                  const { image, Icon } = getModuleVisual(prog.id);
                  const enr = udaanEnrolments.find((e) => e.programmeId === prog.id);
                  const pct = enr
                    ? computeProgress(
                        prog,
                        enr.completedLessonIds,
                        enr.quizScore !== undefined,
                        Boolean(enr.assignmentResponse && enr.assignmentResponse.trim().length >= 15)
                      )
                    : 0;
                  const recommended = isRecommendedForUser(prog);

                  return (
                    <article
                      key={prog.id}
                      onClick={() => navigate(`/udaan/${prog.id}`)}
                      className="group rounded-2xl bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] hover:border-[#F47713] shadow-[0_14px_34px_-16px_rgba(87,37,7,0.16)] transition-all duration-200 hover:-translate-y-1 flex flex-col overflow-hidden cursor-pointer"
                    >
                      {/* Authentic 4:3 Editorial Photograph */}
                      <div className="relative">
                        <ResilientImage
                          src={image.src}
                          alt={image.alt}
                          containerClassName="aspect-[4/3] w-full bg-[#FFE0CC] dark:bg-[#3A2113]"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        {/* Centered Signature Orange Circular Module Emblem */}
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-[#F47713] text-white ring-4 ring-white dark:ring-[#26160D] flex items-center justify-center shadow-md">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="pt-8 pb-5 px-5 sm:px-6 flex-1 flex flex-col justify-between gap-4 text-center">
                        <div className="space-y-2.5">
                          {/* Clean Unboxed Metadata Line (Zero Pill Discipline) */}
                          <p className="text-[11px] font-semibold text-[#9E4B0C] dark:text-[#FFBC85]">
                            {prog.lessons.length} {tr(language, 'পাঠ', 'पाठ', 'Lessons')} · ~
                            {prog.estimatedMinutes} {tr(language, 'মিনিট', 'मिनट', 'mins')}
                            {recommended
                              ? ` · ${tr(language, 'আপনার জন্য উপযোগী', 'आपके लिए उपयुक्त', 'Matched for you')}`
                              : ''}
                          </p>

                          <h3 className="text-lg font-extrabold text-[#242424] dark:text-[#FFF5EC] group-hover:text-[#D96208] dark:group-hover:text-[#FF9D4D] transition-colors leading-snug">
                            {pickText(prog.title, language)}
                          </h3>

                          <p className="text-xs sm:text-[13px] text-[#5C3D2B] dark:text-[#DEC4B0] leading-relaxed line-clamp-3">
                            {pickText(prog.summary, language)}
                          </p>

                          {enr && (
                            <div className="pt-2 space-y-1 text-left">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-[#9E4B0C] dark:text-[#FFBC85]">
                                  {tr(language, 'আপনার অগ্রগতি', 'आपकी प्रगति', 'Your Progress')}
                                </span>
                                <span className="font-mono tabular-nums text-[#572507] dark:text-[#FFF5EC]">
                                  {pct}%
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-[#FFE0CC] dark:bg-[#3E2414] overflow-hidden">
                                <div
                                  className="h-full bg-[#F47713] rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[#F4DFCE] dark:border-[#4A2B18] flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-[#6B4C38] dark:text-[#D4B59E]">
                            {tr(language, 'বিনামূল্যে · স্ব-গতি', 'निःशुल्क · स्व-गति', 'Free · Self-Paced')}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (enr) {
                                navigate(`/udaan/${prog.id}`);
                              } else {
                                handleQuickEnrol(prog.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#D96208] dark:text-[#FF9D4D] hover:text-[#572507] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <span>
                              {enr
                                ? tr(language, 'শেখা চালিয়ে যান', 'सीखना जारी रखें', 'Continue Training')
                                : tr(language, 'প্রশিক্ষণ শুরু করুন', 'प्रशिक्षण शुरू करें', 'Start Training')}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* =================================================================
             INTERACTIVE LEARNER DASHBOARD VIEW
             ================================================================= */
          <div className="space-y-6">
            {/* Learner Summary Strip (Tabular Numerals) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: tr(language, 'নথিভুক্ত মডিউল', 'नामांकित मॉड्यूल', 'Enrolled Modules'),
                  val: `${enrolledDetails.length} / ${UDAAN_PROGRAMMES.length}`,
                },
                {
                  label: tr(language, 'সম্পন্ন পাঠ', 'पूर्ण पाठ', 'Lessons Completed'),
                  val: String(dashboardMetrics.lessonsCompleted),
                },
                {
                  label: tr(language, 'কুইজ মূল্যায়ন', 'क्विज़ पूर्ण', 'Assessments Taken'),
                  val: String(dashboardMetrics.quizzesCompleted),
                },
                {
                  label: tr(language, 'অনুশীলন খসড়া', 'अभ्यास ड्राफ्ट', 'Practice Drafts'),
                  val: String(dashboardMetrics.draftsSaved),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18]"
                >
                  <p className="text-xs font-semibold text-[#6B4C38] dark:text-[#D4B59E]">{stat.label}</p>
                  <p className="mt-1.5 text-2xl font-black font-mono tabular-nums text-[#572507] dark:text-[#FFF5EC]">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            {enrolledDetails.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] text-center space-y-4">
                <GraduationCap className="w-10 h-10 text-[#F47713] mx-auto" />
                <h3 className="text-lg font-extrabold text-[#242424] dark:text-[#FFF5EC]">
                  {tr(
                    language,
                    'আপনি এখনো কোনো UDAAN মডিউলে নথিভুক্ত হননি',
                    'आपने अभी तक किसी UDAAN मॉड्यूल में नामांकन नहीं किया है',
                    'Start your first JENOVA UDAAN module'
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C3D2B] dark:text-[#DEC4B0] max-w-md mx-auto">
                  {tr(
                    language,
                    'আমাদের ৬টি বিনামূল্যের ব্যবহারিক মডিউল থেকে আপনার লক্ষ্য অনুযায়ী একটি বেছে নিয়ে আজই শেখা শুরু করুন।',
                    'हमारे 6 निःशुल्क व्यावहारिक मॉड्यूल में से अपने लक्ष्य के अनुसार एक चुनें और आज ही अभ्यास शुरू करें।',
                    'Choose any of the 6 free, practical modules to start building interview, business, or workplace readiness today.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={scrollToCatalogue}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F47713] hover:bg-[#D96208] cursor-pointer"
                >
                  <span>{tr(language, 'সব প্রশিক্ষণ দেখুন', 'सभी प्रशिक्षण देखें', 'Explore All 6 Trainings')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledDetails.map(({ enr, prog, pct }) => {
                  const { image } = getModuleVisual(prog.id);
                  return (
                    <div
                      key={enr.id}
                      className="rounded-2xl bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] p-5 flex flex-col justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <ResilientImage
                          src={image.src}
                          alt={image.alt}
                          containerClassName="w-20 h-20 rounded-xl shrink-0 border border-[#F1D5BF] dark:border-[#4A2B18]"
                          className="w-full h-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-[#9E4B0C] dark:text-[#FFBC85]">
                            {localizeCategory(prog.category, language)}
                          </p>
                          <h3 className="text-base font-extrabold text-[#242424] dark:text-[#FFF5EC] mt-0.5 leading-snug">
                            {pickText(prog.title, language)}
                          </h3>
                          <p className="text-xs text-[#6B4C38] dark:text-[#D4B59E] mt-1 font-mono tabular-nums">
                            {enr.completedLessonIds.length}/{prog.lessons.length}{' '}
                            {tr(language, 'পাঠ', 'पाठ', 'Lessons')} ·{' '}
                            {enr.quizScore !== undefined
                              ? `${tr(language, 'কুইজ', 'क्विज़', 'Quiz')} ${enr.quizScore}/${enr.quizTotal || prog.quiz.length}`
                              : tr(language, 'কুইজ বাকি', 'क्विज़ शेष', 'Quiz pending')}
                          </p>
                        </div>
                        <span className="font-mono tabular-nums text-sm font-black text-[#F47713]">
                          {pct}%
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-[#FFE0CC] dark:bg-[#3E2414] overflow-hidden">
                        <div className="h-full bg-[#F47713] rounded-full" style={{ width: `${pct}%` }} />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F4DFCE] dark:border-[#4A2B18]">
                        <span className="text-[11px] text-[#6B4C38] dark:text-[#D4B59E]">
                          {tr(language, 'আপডেট:', 'अपडेट:', 'Updated:')} {enr.updatedAt.slice(0, 10)}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/udaan/${prog.id}`)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#F47713] hover:bg-[#D96208] cursor-pointer"
                        >
                          <span>{tr(language, 'মডিউল খুলুন', 'मॉड्यूल खोलें', 'Resume Module')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================================
          3. DEEP-BROWN "YOUR UDAAN JOURNEY" CONTRAST SECTION
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-[28px] bg-gradient-to-r from-[#4A1E05] via-[#572507] to-[#6E300B] text-[#FFF5EC] p-6 sm:p-8 lg:p-10 shadow-[0_22px_50px_-18px_rgba(61,24,4,0.5)] border border-[#8E4316]/40">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
            {/* Left Heading */}
            <div className="xl:w-52 shrink-0 space-y-1.5">
              <h2 className="text-2xl sm:text-[26px] font-black leading-tight text-white">
                {tr(language, 'আপনার UDAAN যাত্রা', 'आपकी UDAAN यात्रा', 'Your UDAAN Journey')}
              </h2>
              <p className="text-xs sm:text-sm text-[#FFD8B8]">
                {tr(
                  language,
                  'সাফল্যের সহজ ৫টি ধাপ',
                  'सफलता का सरल 5-चरणीय मार्ग',
                  'A simple path to real-world readiness'
                )}
              </p>
            </div>

            {/* Center 5-Step Journey */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
              {journeySteps.map((step, idx) => {
                const StepIcon = step.Icon;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={step.onClick}
                    className="group relative flex flex-col items-center text-center p-2.5 rounded-2xl hover:bg-white/8 transition-colors cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-[#3A1704] border-2 border-[#F47713] text-[#FFB870] group-hover:bg-[#F47713] group-hover:text-white flex items-center justify-center shadow-[0_0_20px_rgba(244,119,19,0.28)] transition-colors">
                        <StepIcon className="w-5 h-5" />
                      </span>
                      {idx < journeySteps.length - 1 && (
                        <ArrowRight
                          aria-hidden="true"
                          className="hidden lg:block w-4 h-4 text-[#F47713] absolute -right-7 top-1/2 -translate-y-1/2"
                        />
                      )}
                    </div>
                    <p className="mt-3 text-xs sm:text-sm font-extrabold text-white leading-snug">
                      {step.num}. {step.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#EBC5A6] leading-snug">{step.sub}</p>
                  </button>
                );
              })}
            </div>

            {/* Right Callout */}
            <div className="xl:w-52 shrink-0 xl:border-l xl:border-white/15 xl:pl-6 flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-start justify-between gap-3">
              <div>
                <p className="text-base font-black text-[#FFD8B8] leading-snug">
                  {tr(
                    language,
                    'আজ শিখুন। আগামী গড়ে তুলুন।',
                    'आज सीखें। कल संवारें।',
                    'Skill Today. Confidence Tomorrow.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/passport')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#F47713] hover:bg-[#FF8C2E] text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{tr(language, 'অ্যাকশন পাসপোর্ট', 'एक्शन पासपोर्ट', 'Action Passport')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. COMMUNITY WORKSHOPS & HONEST PROGRAMME TRANSPARENCY
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Local Community Workshop Information */}
          <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[#9E4B0C] dark:text-[#FFBC85]">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold">
                  {tr(
                    language,
                    'কমিউনিটি ওয়ার্কশপ তথ্য (আগ্রহ নিবন্ধন)',
                    'सामुदायिक वर्कशॉप जानकारी (रुचि पंजीकरण)',
                    'Community Workshop Information'
                  )}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#242424] dark:text-[#FFF5EC]">
                {tr(
                  language,
                  'আপনার এলাকায় ইন্টারভিউ বা ছোট ব্যবসা ওয়ার্কশপে আগ্রহী?',
                  'क्या आप अपने क्षेत्र में इंटरव्यू या व्यवसाय वर्कशॉप में रुचि रखते हैं?',
                  'Interested in a Local Practice Workshop in Your District?'
                )}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3D2B] dark:text-[#DEC4B0] leading-relaxed">
                {tr(
                  language,
                  'বর্তমানে কোনো নির্ধারিত লাইভ ব্যাচ চালু নেই—তাই আমরা কোনো কাল্পনিক তারিখ দেখাই না। তবে আপনি আপনার আগ্রহ জানালে পরবর্তী কমিউনিটি সেশনের পরিকল্পনায় তা সাহায্য করবে।',
                  'वर्तमान में कोई लाइव बैच निर्धारित नहीं है—हम कोई काल्पनिक तारीख नहीं दिखाते। आप अपनी रुचि दर्ज करा सकते हैं ताकि भविष्य के सामुदायिक सत्रों की योजना बनाई जा सके।',
                  'No live batches are currently scheduled, and we do not list placeholder dates. Expressing interest helps our community team plan future in-person or online practice sessions.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleWorkshopInterest}
                disabled={workshopRequested}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  workshopRequested
                    ? 'bg-[#FFE0CC] dark:bg-[#3A2113] text-[#572507] dark:text-[#FFD8B8]'
                    : 'bg-[#572507] dark:bg-[#F47713] text-white hover:bg-[#3E1A05]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {workshopRequested
                    ? tr(language, 'আগ্রহ নথিভুক্ত হয়েছে', 'रुचि दर्ज हो गई है', 'Workshop Interest Noted')
                    : tr(language, 'ওয়ার্কশপের আগ্রহ জানান', 'वर्कशॉप में रुचि दर्ज करें', 'Register Workshop Interest')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="text-xs font-bold text-[#9E4B0C] dark:text-[#FFBC85] hover:underline cursor-pointer"
              >
                {tr(language, 'বিষয় বা জেলার পরামর্শ দিন →', 'विषय या जिला सुझाएं →', 'Suggest a Topic or District →')}
              </button>
            </div>
          </div>

          {/* Honest Scope & Official Accredited Training Bridge */}
          <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl bg-[#FFE8D6]/80 dark:bg-[#26160D] border border-[#EBCBB2] dark:border-[#4A2B18] flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[#572507] dark:text-[#FFBC85]">
                <ShieldAlert className="w-4 h-4 text-[#F47713]" />
                <span className="text-xs font-bold">
                  {tr(language, 'স্বচ্ছতা ও সার্টিফিকেট নীতি', 'पारदर्शिता और प्रमाणपत्र नीति', 'Honest Scope & Certificate Policy')}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#242424] dark:text-[#FFF5EC]">
                {tr(
                  language,
                  'স্ব-গতি অনুশীলন রেকর্ড বনাম সরকারি সার্টিফিকেট',
                  'स्व-गति अभ्यास रिकॉर्ड बनाम सरकारी प्रमाणपत्र',
                  'Self-Paced Practice Records vs. Accredited Certificates'
                )}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3D2B] dark:text-[#DEC4B0] leading-relaxed">
                {tr(
                  language,
                  'JENOVA UDAAN-এর প্রতিটি মডিউল সম্পূর্ণ ফ্রি স্ব-গতি অনুশীলন ও প্রস্তুতির জন্য তৈরি—এটি কোনো সরকারি বা বিশ্ববিদ্যালয়-স্বীকৃত সার্টিফিকেট বা চাকরির গ্যারান্টি নয়। সরকারি স্বীকৃত বিনামূল্যের কোর্সের (PBSSD, Skill India, NSDC) জন্য আমাদের যাচাইকৃত স্কিল ডিরেক্টরি দেখুন।',
                  'JENOVA UDAAN के सभी मॉड्यूल पूर्णतः निःशुल्क स्व-गति अभ्यास हेतु हैं—यह किसी सरकारी या विश्वविद्यालय मान्यता प्राप्त डिग्री या नौकरी की गारंटी नहीं है। मान्यता प्राप्त सरकारी कोर्स (Skill India, PBSSD, NSDC) के लिए हमारी सत्यापित कौशल निर्देशिका देखें।',
                  'JENOVA UDAAN delivers 100% free self-paced lessons, practice tasks, quizzes, and a personal printable Practice Record—not a government or university-accredited certificate or job guarantee. For accredited public courses (PBSSD, Skill India, NSDC), explore our verified Skills Directory.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/skills')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#572507] dark:text-[#FFF5EC] bg-white dark:bg-[#3A2113] border border-[#D9A782] dark:border-[#6A3E24] hover:border-[#F47713] cursor-pointer"
              >
                <span>
                  {tr(language, 'সরকারি স্কিল কোর্স দেখুন', 'सरकारी कौशल कोर्स देखें', 'Open Verified Skills Directory')}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F47713]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. STRONG FINAL CTA BAND
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-[24px] bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] p-7 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-[0_14px_34px_-16px_rgba(87,37,7,0.16)]">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-[#572507] dark:text-[#FFF5EC] leading-tight">
              {tr(
                language,
                'আজই আপনার প্রথম UDAAN মডিউল শুরু করুন।',
                'आज ही अपना पहला UDAAN प्रशिक्षण मॉड्यूल शुरू करें।',
                'Ready to build practical career or business confidence?'
              )}
            </h2>
            <p className="text-sm text-[#5C3D2B] dark:text-[#DEC4B0]">
              {tr(
                language,
                'কোনো ফি নেই, কোনো জটিলতা নেই—নিজের গতিতে শিখুন, অনুশীলন করুন এবং আপনার অগ্রগতি সংরক্ষণ করুন।',
                'कोई शुल्क नहीं, कोई जटिलता नहीं—अपनी गति से सीखें, अभ्यास करें और प्रगति सहेजें।',
                'Zero fees, zero pressure. Enrol in any module, practise real-world scenarios, and carry your progress directly into JENOVA Action Passport.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={scrollToCatalogue}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#F47713] hover:bg-[#D96208] shadow-[0_10px_24px_-8px_rgba(244,119,19,0.5)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{tr(language, 'মডিউল বাছুন ও শুরু করুন', 'मॉड्यूल चुनें और शुरू करें', 'Choose a Training Module')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/msme/planner')}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold text-[#572507] dark:text-[#FFD8B8] bg-[#FFE8D6] dark:bg-[#3A2113] hover:bg-[#FFD8BA] dark:hover:bg-[#4B2B18] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{tr(language, 'ব্যবসা প্ল্যান বিল্ডার', 'व्यवसाय प्लान बिल्डर', 'Business Plan Builder')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================================
   UDAAN PROGRAMME DETAIL & INTERACTIVE LEARNING STUDIO (/udaan/:id)
   ============================================================================ */
export function UdaanProgrammeDetailPage({ programmeId }: { programmeId: string }) {
  const {
    language,
    navigate,
    user,
    udaanEnrolments,
    enrolUdaan,
    updateUdaanProgress,
    addPassportGoal,
    showToast,
  } = useApp();

  const programme = UDAAN_PROGRAMMES.find((p) => p.id === programmeId || p.slug === programmeId);
  const enrolment = udaanEnrolments.find((e) => programme && e.programmeId === programme.id);

  const [assignmentDraft, setAssignmentDraft] = useState(enrolment?.assignmentResponse || '');
  const [aiFeedback, setAiFeedback] = useState(enrolment?.assignmentFeedback || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    setAssignmentDraft(enrolment?.assignmentResponse || '');
    setAiFeedback(enrolment?.assignmentFeedback || '');
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setAiError('');
  }, [programmeId, enrolment?.assignmentResponse, enrolment?.assignmentFeedback]);

  if (!programme) {
    return (
      <div className="bg-[#FFF0E4] dark:bg-[#160C07] min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full p-8 rounded-2xl bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] text-center space-y-4">
          <h1 className="text-2xl font-black text-[#572507] dark:text-[#FFF5EC]">
            {tr(language, 'UDAAN মডিউল পাওয়া যায়নি', 'UDAAN मॉड्यूल नहीं मिला', 'UDAAN Module Not Found')}
          </h1>
          <button
            type="button"
            onClick={() => navigate('/udaan')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F47713] hover:bg-[#D96208] text-white cursor-pointer"
          >
            {tr(language, 'সব UDAAN মডিউলে ফিরে যান', 'सभी UDAAN मॉड्यूल पर लौटें', 'Back to JENOVA UDAAN')}
          </button>
        </div>
      </div>
    );
  }

  const { image, Icon } = getModuleVisual(programme.id);
  const completedIds = enrolment?.completedLessonIds || [];
  const pct = computeProgress(
    programme,
    completedIds,
    enrolment?.quizScore !== undefined,
    Boolean((enrolment?.assignmentResponse || assignmentDraft).trim().length >= 15)
  );

  const toggleLesson = async (lessonId: string) => {
    const next = completedIds.includes(lessonId)
      ? completedIds.filter((id) => id !== lessonId)
      : [...completedIds, lessonId];
    await updateUdaanProgress(programme.id, { completedLessonIds: next });
    showToast(
      tr(language, 'পাঠের অগ্রগতি সংরক্ষিত হয়েছে।', 'पाठ प्रगति सहेजी गई।', 'Lesson progress saved.')
    );
  };

  const handleSaveAssignment = async (requestAi: boolean) => {
    setAiError('');
    const trimmed = assignmentDraft.trim();
    if (trimmed.length < 15) {
      setAiError(
        tr(
          language,
          'অনুগ্রহ করে কমপক্ষে ১৫ অক্ষরের একটি উত্তর লিখুন।',
          'कृपया कम से कम 15 अक्षरों का उत्तर लिखें।',
          'Please write at least 15 characters before saving or requesting AI feedback.'
        )
      );
      return;
    }

    await updateUdaanProgress(programme.id, { assignmentResponse: trimmed });

    if (!requestAi) {
      showToast(
        tr(language, 'আপনার অনুশীলন উত্তর সেভ হয়েছে।', 'आपका अभ्यास उत्तर सहेजा गया।', 'Practice draft saved.')
      );
      return;
    }

    setAiLoading(true);
    try {
      const res = await apiFetch<{ feedback: string }>('/api/udaan/ai-feedback', {
        method: 'POST',
        body: JSON.stringify({
          programmeId: programme.id,
          userAnswer: trimmed,
          language,
        }),
      });
      setAiFeedback(res.feedback);
      await updateUdaanProgress(programme.id, {
        assignmentResponse: trimmed,
        assignmentFeedback: res.feedback,
      });
    } catch (err: unknown) {
      setAiError(
        err instanceof Error
          ? err.message
          : tr(
              language,
              'AI কোচ এই মুহূর্তে উপলব্ধ নয়। আপনার উত্তর সেভ হয়েছে।',
              'AI कोच अभी उपलब्ध नहीं है। आपका उत्तर सहेजा गया है।',
              'AI Practice Coach is temporarily unavailable. Your draft is saved safely.'
            )
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    for (const q of programme.quiz) {
      if (selectedAnswers[q.id] === q.correctIndex) score += 1;
    }
    setQuizSubmitted(true);
    await updateUdaanProgress(programme.id, {
      quizScore: score,
      quizTotal: programme.quiz.length,
    });
    showToast(
      tr(
        language,
        `মূল্যায়ন সম্পন্ন! স্কোর: ${score}/${programme.quiz.length}`,
        `मूल्यांकन पूर्ण! स्कोर: ${score}/${programme.quiz.length}`,
        `Assessment complete! Score: ${score}/${programme.quiz.length}`
      )
    );
  };

  const handleAddToPassport = async () => {
    await addPassportGoal({
      title: `JENOVA UDAAN: ${pickText(programme.title, language)}`,
      category: 'training',
      linkedPath: `/udaan/${programme.id}`,
      steps: [
        ...programme.lessons.map((l) => ({
          id: l.id,
          title: pickText(l.title, language),
          done: completedIds.includes(l.id),
        })),
        {
          id: 'step-practice',
          title: pickText(programme.assignment.title, language),
          done: Boolean(enrolment?.assignmentResponse),
        },
        {
          id: 'step-quiz',
          title: tr(language, 'মডিউল কুইজ ও মূল্যায়ন সম্পন্ন করুন', 'मॉड्यूल क्विज़ पूरा करें', 'Complete module knowledge quiz'),
          done: enrolment?.quizScore !== undefined,
        },
      ],
      notes: pickText(programme.tagline, language),
    });
    showToast(
      tr(
        language,
        'এই UDAAN মডিউলটি Action Passport-এ যোগ হয়েছে!',
        'यह UDAAN मॉड्यूल Action Passport में जोड़ा गया!',
        'Added this UDAAN module to your Action Passport!'
      )
    );
  };

  return (
    <div className="bg-gradient-to-b from-[#FFF7F0] via-[#FFF0E4] to-[#FFE7D4] dark:from-[#1B100A] dark:via-[#160C07] dark:to-[#120A06] min-h-screen py-8 sm:py-10 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <button
          type="button"
          onClick={() => navigate('/udaan')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9E4B0C] dark:text-[#FFBC85] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{tr(language, 'JENOVA UDAAN ক্যাটালগে ফিরুন', 'JENOVA UDAAN कैटलॉग पर लौटें', 'Back to JENOVA UDAAN')}</span>
        </button>

        {/* Programme Hero Card with Authentic 4:3 Photo */}
        <header className="rounded-[24px] bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] overflow-hidden shadow-[0_14px_34px_-16px_rgba(87,37,7,0.16)]">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            <div className="md:col-span-5 relative min-h-[220px]">
              <ResilientImage
                src={image.src}
                alt={image.alt}
                eager
                containerClassName="w-full h-full min-h-[220px]"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#9E4B0C] dark:text-[#FFBC85]">
                  <Icon className="w-4 h-4 text-[#F47713]" />
                  <span>
                    JENOVA UDAAN · {localizeCategory(programme.category, language)} · ~
                    {programme.estimatedMinutes} {tr(language, 'মিনিট', 'मिनट', 'mins')}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#242424] dark:text-[#FFF5EC] leading-tight">
                  {pickText(programme.title, language)}
                </h1>
                <p className="text-sm text-[#5C3D2B] dark:text-[#DEC4B0] leading-relaxed">
                  {pickText(programme.summary, language)}
                </p>
              </div>

              <div className="space-y-4">
                {/* Progress Meter */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#6B4C38] dark:text-[#D4B59E]">
                      {pickText(programme.formatNote, language)}
                    </span>
                    <span className="font-mono tabular-nums font-black text-[#F47713]">
                      {pct}% {tr(language, 'সম্পন্ন', 'पूर्ण', 'Complete')}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#FFE0CC] dark:bg-[#3E2414] overflow-hidden">
                    <div
                      className="h-full bg-[#F47713] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {!enrolment ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await enrolUdaan(programme.id);
                        showToast(tr(language, 'নথিভুক্ত হয়েছে!', 'नामांकन पूर्ण!', 'Enrolled in module!'));
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F47713] hover:bg-[#D96208] text-white cursor-pointer"
                    >
                      {tr(language, 'মডিউলে নথিভুক্ত হন (ফ্রি)', 'मॉड्यूल में नामांकन करें (निःशुल्क)', 'Enrol Free in Module')}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B4D] dark:text-[#6EE7B7]">
                      <CheckCircle2 className="w-4 h-4" />
                      {tr(language, 'নথিভুক্ত শিক্ষার্থী', 'नामांकित शिक्षार्थी', 'Enrolled')}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleAddToPassport}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#572507] dark:bg-[#3A2113] text-white hover:bg-[#3E1A05] cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5 text-[#FFB870]" />
                    <span>{tr(language, 'অ্যাকশন পাসপোর্টে যোগ করুন', 'एक्शन पासपोर्ट में जोड़ें', 'Add to Action Passport')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Section 1: Self-Paced Lessons */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#572507] dark:text-[#FFF5EC]">
              {tr(language, '০১. স্ব-গতি পাঠ্যক্রম', '01. स्व-गति पाठ', '01. Self-Paced Lessons')}
            </h2>
            <span className="text-xs font-mono tabular-nums font-bold text-[#9E4B0C] dark:text-[#FFBC85]">
              {completedIds.length} / {programme.lessons.length}{' '}
              {tr(language, 'সম্পন্ন', 'पूर्ण', 'Done')}
            </span>
          </div>

          {programme.lessons.map((lesson, idx) => {
            const done = completedIds.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className={`p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#26160D] border transition-colors space-y-4 ${
                  done
                    ? 'border-[#F47713] shadow-sm'
                    : 'border-[#F1D5BF] dark:border-[#4A2B18]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-mono tabular-nums font-semibold text-[#9E4B0C] dark:text-[#FFBC85]">
                      {tr(language, 'পাঠ', 'पाठ', 'Lesson')} 0{idx + 1} · ~{lesson.durationMinutes}{' '}
                      {tr(language, 'মিনিট', 'मिनट', 'mins')}
                    </p>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#242424] dark:text-[#FFF5EC] mt-0.5">
                      {pickText(lesson.title, language)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <ReadAloudButton
                      compact
                      lang={language}
                      text={`${pickText(lesson.title, language)}. ${pickText(lesson.content, language)}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleLesson(lesson.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        done
                          ? 'bg-[#F47713] text-white'
                          : 'bg-[#FFF5EC] dark:bg-[#3A2113] text-[#572507] dark:text-[#FFD8B8] border border-[#EBCBB2] dark:border-[#5C361E] hover:border-[#F47713]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {done
                          ? tr(language, 'সম্পন্ন হয়েছে', 'पूर्ण हुआ', 'Completed')
                          : tr(language, 'সম্পন্ন চিহ্নিত করুন', 'पूर्ण चिह्नित करें', 'Mark Complete')}
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-[#3F2E23] dark:text-[#EDE0D5] leading-relaxed">
                  {pickText(lesson.content, language)}
                </p>

                <div className="p-4 rounded-xl bg-[#FFF7F0] dark:bg-[#1D1009] border border-[#F4DFCE] dark:border-[#4A2B18] space-y-1.5">
                  <p className="text-xs font-bold text-[#9E4B0C] dark:text-[#FFBC85]">
                    {tr(language, 'মূল শিক্ষণীয় বিষয়', 'मुख्य बिंदु', 'Key Takeaways')}
                  </p>
                  <ul className="space-y-1 text-xs text-[#5C3D2B] dark:text-[#DEC4B0]">
                    {lesson.keyTakeaways.map((kt, ktIdx) => (
                      <li key={ktIdx}>• {pickText(kt, language)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </section>

        {/* Section 2: Practical Assignment + AI Practice Coach */}
        <section className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#9E4B0C] dark:text-[#FFBC85]">
              {tr(
                language,
                '০২. ব্যবহারিক অনুশীলন ও AI প্র্যাকটিস কোচ',
                '02. व्यावहारिक अभ्यास और AI प्रैक्टिस कोच',
                '02. Practical Assignment & Optional AI Practice Coach'
              )}
            </p>
            <h2 className="text-xl font-black text-[#242424] dark:text-[#FFF5EC]">
              {pickText(programme.assignment.title, language)}
            </h2>
            <p className="text-sm text-[#5C3D2B] dark:text-[#DEC4B0] leading-relaxed">
              {pickText(programme.assignment.prompt, language)}
            </p>
          </div>

          <SafetyNotice
            message={tr(
              language,
              'কখনোই অনুশীলন উত্তরে আপনার আসল ফোন নম্বর, আধার নম্বর, OTP বা ব্যাংকের তথ্য লিখবেন না।',
              'अभ्यास उत्तर में कभी भी अपना निजी फोन नंबर, आधार नंबर, OTP या बैंक विवरण न लिखें।',
              'Never enter real Aadhaar numbers, phone numbers, OTPs, or banking details in your practice draft.'
            )}
          />

          <textarea
            rows={4}
            value={assignmentDraft}
            onChange={(e) => setAssignmentDraft(e.target.value)}
            placeholder={tr(
              language,
              'এখানে বাংলা, হিন্দি বা ইংরেজিতে আপনার অনুশীলন উত্তর লিখুন...',
              'यहां हिंदी, बंगाली या अंग्रेजी में अपना अभ्यास उत्तर लिखें...',
              'Draft your response here in Bengali, Hindi, or English...'
            )}
            className="w-full rounded-xl border border-[#EBCBB2] dark:border-[#4A2B18] bg-[#FFF9F4] dark:bg-[#1D1009] px-4 py-3 text-sm text-[#242424] dark:text-[#FFF5EC]"
          />

          <div className="text-xs text-[#5C3D2B] dark:text-[#DEC4B0] space-y-1">
            <p className="font-bold text-[#242424] dark:text-[#FFF5EC]">
              {tr(language, 'স্ব-মূল্যায়ন মানদণ্ড:', 'स्व-मूल्यांकन मानदंड:', 'Self-Check Criteria:')}
            </p>
            {programme.assignment.rubricPoints.map((r, i) => (
              <p key={i}>✓ {pickText(r, language)}</p>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveAssignment(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#EBCBB2] dark:border-[#4A2B18] bg-[#FFF7F0] dark:bg-[#1D1009] text-[#572507] dark:text-[#FFD8B8] hover:border-[#F47713] cursor-pointer"
            >
              {tr(language, 'খসড়া সেভ করুন', 'ड्राफ्ट सहेजें', 'Save Draft')}
            </button>
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => handleSaveAssignment(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F47713] hover:bg-[#D96208] disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {aiLoading
                  ? tr(language, 'AI কোচ পর্যালোচনা করছে...', 'AI कोच समीक्षा कर रहा है...', 'AI Coach reviewing...')
                  : tr(language, 'AI প্র্যাকটিস কোচ ফিডব্যাক নিন', 'AI प्रैक्टिस कोच फीडबैक लें', 'Get AI Practice Coach Feedback')}
              </span>
            </button>
          </div>

          {aiError && <p className="text-xs text-red-700 dark:text-red-400 font-semibold">{aiError}</p>}

          {aiFeedback && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#FFF5EC] dark:bg-[#1D1009] border border-[#F47713]/40 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#9E4B0C] dark:text-[#FFBC85]">
                  {tr(
                    language,
                    'AI-তৈরি অনুশীলন পরামর্শ (সহায়ক নির্দেশিকা)',
                    'AI-जनित अभ्यास सुझाव (सहायक मार्गदर्शन)',
                    'AI-Generated Coaching Feedback (Practice Guidance)'
                  )}
                </span>
                <ReadAloudButton compact lang={language} text={aiFeedback} />
              </div>
              <p className="text-sm text-[#242424] dark:text-[#FFF5EC] whitespace-pre-wrap leading-relaxed">
                {aiFeedback}
              </p>
            </div>
          )}
        </section>

        {/* Section 3: Knowledge Assessment Quiz */}
        <section className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#26160D] border border-[#F1D5BF] dark:border-[#4A2B18] space-y-5">
          <div>
            <p className="text-xs font-bold text-[#9E4B0C] dark:text-[#FFBC85]">
              {tr(language, '০৩. জ্ঞান যাচাই কুইজ', '03. ज्ञान जांच क्विज़', '03. Knowledge Assessment Quiz')}
            </p>
            <h2 className="text-xl font-black text-[#242424] dark:text-[#FFF5EC] mt-0.5">
              {tr(
                language,
                'মডিউলটি কতটা বুঝলেন তা যাচাই করুন',
                'अपनी समझ की जांच करें',
                'Check Your Practical Understanding'
              )}
            </h2>
          </div>

          <form onSubmit={handleQuizSubmit} className="space-y-4">
            {programme.quiz.map((q, qIdx) => {
              const chosen = selectedAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-[#FFF9F4] dark:bg-[#1D1009] border border-[#F4DFCE] dark:border-[#4A2B18] space-y-2.5"
                >
                  <p className="text-sm font-bold text-[#242424] dark:text-[#FFF5EC]">
                    {qIdx + 1}. {pickText(q.question, language)}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isPicked = chosen === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      return (
                        <label
                          key={optIdx}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            quizSubmitted && isCorrect
                              ? 'bg-[#EBF4F0] border-[#176B4D] text-[#11533B] font-semibold'
                              : quizSubmitted && isPicked && !isCorrect
                                ? 'bg-red-50 border-red-300 text-red-800'
                                : isPicked
                                  ? 'bg-white dark:bg-[#26160D] border-[#F47713] font-semibold'
                                  : 'bg-white dark:bg-[#26160D] border-[#EBCBB2] dark:border-[#4A2B18]'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={isPicked}
                            onChange={() =>
                              setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                            }
                            className="mt-0.5 accent-[#F47713]"
                          />
                          <span>{pickText(opt, language)}</span>
                        </label>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <p className="text-xs text-[#176B4D] dark:text-[#6EE7B7] pt-1 font-medium">
                      {pickText(q.explanation, language)}
                    </p>
                  )}
                </div>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F47713] hover:bg-[#D96208] cursor-pointer"
              >
                {tr(language, 'উত্তর জমা দিন ও স্কোর দেখুন', 'उत्तर जमा करें और स्कोर देखें', 'Submit Quiz & View Score')}
              </button>
              {enrolment?.quizScore !== undefined && (
                <span className="text-xs font-mono tabular-nums font-bold text-[#572507] dark:text-[#FFBC85]">
                  {tr(language, 'সর্বশেষ স্কোর:', 'अंतिम स्कोर:', 'Latest Recorded Score:')}{' '}
                  {enrolment.quizScore} / {enrolment.quizTotal || programme.quiz.length}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Section 4: Deep-Brown Self-Paced Practice Record & Next Steps */}
        <section className="p-6 sm:p-7 rounded-2xl bg-[#572507] text-[#FFF5EC] border border-[#8E4316]/40 space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#F47713] text-white flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  {tr(
                    language,
                    'JENOVA UDAAN স্ব-গতি অনুশীলন রেকর্ড',
                    'JENOVA UDAAN स्व-गति अभ्यास रिकॉर्ड',
                    'JENOVA UDAAN Self-Paced Practice Record'
                  )}
                </h2>
                <p className="text-xs text-[#FFD8B8] font-mono tabular-nums">
                  {tr(language, 'শিক্ষার্থী:', 'शिक्षार्थी:', 'Learner:')}{' '}
                  {user?.name || tr(language, 'কমিউনিটি শিক্ষার্থী', 'सामुदायिक शिक्षार्थी', 'Community Learner')} ·{' '}
                  {pct}% {tr(language, 'সম্পন্ন', 'पूर्ण', 'Complete')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#572507] hover:bg-[#FFF0E4] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{tr(language, 'অগ্রগতি প্রিন্ট করুন', 'प्रगति प्रिंट करें', 'Print Practice Record')}</span>
            </button>
          </div>

          <p className="text-xs text-[#EBC5A6] leading-relaxed">
            {tr(
              language,
              'স্বচ্ছতা নোট: এটি JENOVA UDAAN-এ আপনার ব্যক্তিগত স্ব-গতি অনুশীলন ও প্রস্তুতির রেকর্ড—এটি কোনো সরকারি বা বিশ্ববিদ্যালয়-স্বীকৃত সার্টিফিকেট নয়।',
              'पारदर्शिता नोट: यह JENOVA UDAAN पर आपके व्यक्तिगत अभ्यास का रिकॉर्ड है—यह कोई सरकारी या विश्वविद्यालय मान्यता प्राप्त प्रमाणपत्र नहीं है।',
              'Transparency Note: This is a personal self-paced learning & practice record on JENOVA UDAAN—not an accredited government or university certificate.'
            )}
          </p>

          <div className="pt-3 border-t border-white/15 flex flex-wrap gap-2">
            {programme.relatedRoutes.map((r) => (
              <button
                key={r.path}
                type="button"
                onClick={() => navigate(r.path)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3A1704] hover:bg-[#F47713] text-[#FFD8B8] hover:text-white border border-[#F47713]/40 transition-colors cursor-pointer"
              >
                <span>{pickText(r.label, language)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
