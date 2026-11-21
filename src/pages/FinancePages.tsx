import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  PiggyBank,
  Plus,
  ShieldAlert,
  Trash2,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { tr } from '../i18n/translations';
import type { SavingsGoal } from '../types/platform';
import { PageHeader, ResilientImage, SafetyNotice } from '../components/SharedUI';
import { VISUAL_ASSETS } from '../lib/visualAssets';

const CHART_COLORS = ['#F4A340', '#27845B', '#E58E26', '#26364B', '#FFD19A', '#A85B0A'];

interface LiteracyTopic {
  id: string;
  titleBn: string;
  titleHi: string;
  titleEn: string;
  summaryBn: string;
  summaryHi: string;
  summaryEn: string;
  points: { bn: string; hi: string; en: string }[];
}

const LITERACY_TOPICS: LiteracyTopic[] = [
  {
    id: 'budgeting',
    titleBn: '১. সংসারের মাসিক বাজেট',
    titleHi: '1. घर का मासिक बजट',
    titleEn: '1. Household Budgeting',
    summaryBn: 'প্রতি মাসে কত টাকা আয় হচ্ছে এবং কোন খাতে কত খরচ হচ্ছে তা লিখে রাখলে অপ্রয়োজনীয় খরচ কমানো সহজ হয়।',
    summaryHi: 'हर महीने की आय और जरूरी खर्चों को लिखकर रखने से महीने के अंत में पैसे की कमी से बचा जा सकता है।',
    summaryEn: 'Tracking monthly income against essential household spending helps prevent month-end shortages.',
    points: [
      {
        bn: 'প্রথমে প্রয়োজনীয় খরচ (চাল-ডাল, বাড়ি ভাড়া, বিদ্যুৎ, চিকিৎসা, পড়াশোনা) আলাদা করুন।',
        hi: 'सबसे पहले जरूरी खर्च (राशन, किराया, बिजली, इलाज, पढ़ाई) अलग तय करें।',
        en: 'Separate Needs (food, rent, utilities, healthcare, education) before Wants.',
      },
      {
        bn: 'আয় হাতে পাওয়ার পরই প্রথমে অল্প হলেও সঞ্চয়ের টাকা আলাদা সরিয়ে রাখুন।',
        hi: 'कमाई मिलते ही सबसे पहले थोड़ी-सी बचत अलग रख दें।',
        en: 'Set aside a small savings amount first whenever wages or income arrive.',
      },
    ],
  },
  {
    id: 'saving',
    titleBn: '২. নিয়মিত সঞ্চয়ের অভ্যাস',
    titleHi: '2. नियमित बचत की आदत',
    titleEn: '2. Saving Habits',
    summaryBn: 'অল্প পরিমাণ হলেও প্রতি সপ্তাহে বা মাসে নিয়মিত সঞ্চয় করলে বিপদের সময় চড়া সুদের ধার নিতে হয় না।',
    summaryHi: 'थोड़ी-थोड़ी नियमित बचत से आपातकालीन फंड बनता है, जिससे महंगे ब्याज वाले कर्ज से बचा जा सकता है।',
    summaryEn: 'Consistent small savings build an emergency cushion so families avoid high-interest informal borrowing.',
    points: [
      {
        bn: 'লক্ষ্য রাখুন অন্তত ৩ মাসের সংসার খরচের সমান জরুরি তহবিল তৈরি করার।',
        hi: 'धीरे-धीरे कम से कम 3 महीने के घरेलू खर्च जितना आपातकालीन फंड बनाने का लक्ष्य रखें।',
        en: 'Aim gradually for an emergency reserve covering 3 months of essential household expenses.',
      },
      {
        bn: 'ব্যাংক বা পোস্ট অফিসের রেকারিং ডিপোজিট (RD) নিয়মিত সঞ্চয়ে সাহায্য করে।',
        hi: 'बैंक या पोस्ट ऑफिस की रेकरिंग डिपॉजिट (RD) नियमित मासिक बचत में मदद करती है।',
        en: 'Bank or Post Office Recurring Deposits (RD) encourage steady monthly savings.',
      },
    ],
  },
  {
    id: 'banking',
    titleBn: '৩. ব্যাংকিং সচেতনতা',
    titleHi: '3. बैंकिंग जागरूकता',
    titleEn: '3. Banking Awareness',
    summaryBn: 'নিজস্ব ব্যাংক অ্যাকাউন্ট, পাসবুক আপডেট এবং নমিনি যুক্ত রাখা প্রতিটি পরিবারের জন্য জরুরি।',
    summaryHi: 'सक्रिय बैंक खाता, अपडेटेड KYC और रजिस्टर्ड नॉमिनी परिवार की बचत को सुरक्षित रखते हैं।',
    summaryEn: 'Maintaining an active bank account with updated KYC and a registered nominee protects family savings.',
    points: [
      {
        bn: 'সরকারি প্রকল্পের সরাসরি টাকা (DBT) পেতে আধার সিডিং ও চালু ব্যাংক অ্যাকাউন্ট প্রয়োজন।',
        hi: 'सरकारी योजनाओं का सीधा लाभ (DBT) पाने के लिए आधार सीडिंग और सक्रिय बैंक खाता जरूरी है।',
        en: 'Keep your bank passbook updated and verify DBT seeding for official welfare transfers.',
      },
      {
        bn: 'ব্যাংক অ্যাকাউন্টে অবশ্যই পরিবারের একজন নমিনি যুক্ত করে রাখুন।',
        hi: 'हर बैंक और पोस्ट ऑफिस खाते में परिवार के किसी सदस्य को नॉमिनी जरूर बनाएं।',
        en: 'Always register a Nominee on every bank and post office account.',
      },
    ],
  },
  {
    id: 'interest',
    titleBn: '৪. সুদ ও চক্রবৃদ্ধি সুদ বোঝা',
    titleHi: '4. ब्याज और चक्रवृद्धि ब्याज समझें',
    titleEn: '4. Understanding Interest',
    summaryBn: 'সঞ্চয়ে চক্রবৃদ্ধি সুদ আপনার টাকা বাড়ায়, আর ঋণে উচ্চ সুদ আপনার বোঝা দ্রুত বাড়িয়ে দেয়।',
    summaryHi: 'बचत पर चक्रवृद्धि ब्याज आपका पैसा बढ़ाता है, जबकि कर्ज पर ज्यादा ब्याज बोझ को तेजी से बढ़ाता है।',
    summaryEn: 'Compound interest grows savings over time, while high interest on debt multiplies repayment burden.',
    points: [
      {
        bn: 'মাসে ৫% সুদ মানে বছরে ৬০% সুদ — এটি ব্যাংক ঋণের তুলনায় অনেক বেশি।',
        hi: 'महीने का 5% ब्याज मतलब साल का 60% ब्याज — यह बैंक लोन की तुलना में बहुत अधिक है।',
        en: 'An informal rate of 5% per month equals 60% per year — far steeper than formal bank loans.',
      },
      {
        bn: 'ঋণের আগে বার্ষিক সুদের হার ও মোট ফেরতযোগ্য টাকা হিসাব করুন।',
        hi: 'कर्ज लेने से पहले वार्षिक ब्याज दर और कुल लौटाई जाने वाली राशि की तुलना जरूर करें।',
        en: 'Always compare the Annual Percentage Rate (APR) and total repayment before borrowing.',
      },
    ],
  },
  {
    id: 'borrowing',
    titleBn: '৫. দায়িত্বশীল ঋণ গ্রহণ',
    titleHi: '5. ज़िम्मेदारी से कर्ज लेना',
    titleEn: '5. Responsible Borrowing',
    summaryBn: 'শুধুমাত্র প্রয়োজনীয় উদ্দেশ্যে (শিক্ষা, চিকিৎসা বা আয়-বর্ধক কাজ) এবং পরিশোধের ক্ষমতা বুঝে ঋণ নিন।',
    summaryHi: 'केवल जरूरी या कमाई बढ़ाने वाले काम के लिए ही, अपनी मासिक चुकाने की क्षमता देखकर कर्ज लें।',
    summaryEn: 'Borrow only for productive or essential needs, strictly within your verified monthly repayment capacity.',
    points: [
      {
        bn: 'অনিবন্ধিত ঋণ অ্যাপ থেকে কখনোই ঋণ নেবেন না — কেবল RBI-নিয়ন্ত্রিত ব্যাংক বা সংস্থা ব্যবহার করুন।',
        hi: 'अप्रमाणित लोन ऐप्स से कभी कर्ज न लें — केवल RBI द्वारा मान्यता प्राप्त बैंक या संस्था का उपयोग करें।',
        en: 'Avoid unverified mobile loan apps; use only RBI-regulated banks, cooperatives, or NBFCs.',
      },
      {
        bn: 'সমস্ত মাসিক কিস্তি যেন আপনার মোট আয়ের ৩০%–৩৫%-এর বেশি না হয়।',
        hi: 'सभी मासिक EMI आपकी कुल स्थिर आय के 30%–35% से अधिक न हों।',
        en: 'Keep total monthly EMIs below 30%–35% of stable household income.',
      },
    ],
  },
  {
    id: 'emi',
    titleBn: '৬. ইএমআই (EMI) কীভাবে কাজ করে',
    titleHi: '6. ईएमआई (EMI) कैसे काम करती है',
    titleEn: '6. Understanding EMIs',
    summaryBn: 'EMI-এর মধ্যে আসল ও সুদ দুইই থাকে। মেয়াদ যত বেশি, মাসিক কিস্তি কম হলেও মোট সুদ তত বেশি।',
    summaryHi: 'हर EMI में मूलधन और ब्याज दोनों शामिल होते हैं; अवधि लंबी होने पर मासिक किस्त कम होती है पर कुल ब्याज बढ़ता है।',
    summaryEn: 'Each Equated Monthly Instalment combines principal and interest; longer tenure lowers monthly EMI but increases total interest.',
    points: [
      {
        bn: 'লুকানো প্রসেসিং ফি বা লেট পেমেন্ট চার্জ আগে লিখিতভাবে জেনে নিন।',
        hi: 'हस्ताक्षर करने से पहले प्रोसेसिंग फीस, लेट चार्ज और प्रीपेमेंट की शर्तें लिखित में जांच लें।',
        en: 'Check processing fees, late charges, and prepayment terms in writing before signing.',
      },
    ],
  },
  {
    id: 'digital-payments',
    titleBn: '৭. ডিজিটাল পেমেন্ট ও রসিদ সংরক্ষণ',
    titleHi: '7. डिजिटल भुगतान और रसीद',
    titleEn: '7. Digital Payments',
    summaryBn: 'ইউপিআই বা ব্যাংক ট্রান্সফারের মাধ্যমে লেনদেন করলে প্রতিটি টাকার ডিজিটাল প্রমাণ থাকে।',
    summaryHi: 'UPI और बैंक ट्रांसफर से लेन-देन का डिजिटल रिकॉर्ड रहता है, जो घर और छोटे व्यापार दोनों के लिए उपयोगी है।',
    summaryEn: 'UPI and bank transfers create verifiable transaction histories useful for household tracking and small businesses.',
    points: [
      {
        bn: 'টাকা পাঠানোর আগে প্রাপকের নাম স্ক্রিনে ভালোভাবে মিলিয়ে নিন।',
        hi: 'पैसे भेजने से पहले स्क्रीन पर दिखने वाले प्राप्तकर्ता के नाम की पुष्टि जरूर करें।',
        en: 'Always double-check the verified recipient name displayed on screen before confirming payment.',
      },
    ],
  },
  {
    id: 'upi-safety',
    titleBn: '৮. ইউপিআই (UPI) নিরাপত্তা নিয়ম',
    titleHi: '8. यूपीआई (UPI) सुरक्षा नियम',
    titleEn: '8. UPI Safety Rules',
    summaryBn: 'টাকা পাওয়ার জন্য কখনোই UPI PIN দিতে হয় না বা QR কোড স্ক্যান করতে হয় না!',
    summaryHi: 'पैसे प्राप्त करने के लिए कभी भी UPI PIN डालने या QR कोड स्कैन करने की जरूरत नहीं होती!',
    summaryEn: 'You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money.',
    points: [
      {
        bn: 'UPI PIN শুধুমাত্র অ্যাকাউন্ট থেকে টাকা কাটার (পাঠানোর) সময় লাগে।',
        hi: 'UPI PIN डालने से हमेशा आपके बैंक खाते से पैसे कटते हैं, आते नहीं।',
        en: 'Entering your UPI PIN ALWAYS deducts money from your bank account.',
      },
      {
        bn: 'অচেনা ব্যক্তির পাঠানো “Collect Request” বা লিঙ্কে ক্লিক করবেন না।',
        hi: 'अनजान व्यक्ति द्वारा भेजे गए UPI Collect Request को तुरंत अस्वीकार करें।',
        en: 'Decline unknown UPI Collect Requests immediately.',
      },
    ],
  },
  {
    id: 'fraud',
    titleBn: '৯. আর্থিক প্রতারণা প্রতিরোধ',
    titleHi: '9. वित्तीय धोखाधड़ी से बचाव',
    titleEn: '9. Financial Fraud Prevention',
    summaryBn: 'ফোনে লটারি, কেওয়াইসি আপডেট বা সরকারি ভাতার নামে ওটিপি বা স্ক্রিন-শেয়ার অ্যাপ চাইলে তা প্রতারণা।',
    summaryHi: 'KYC अपडेट की धमकी, फर्जी लॉटरी कॉल, नौकरी फीस और स्क्रीन-शेयरिंग ऐप्स से हमेशा सावधान रहें।',
    summaryEn: 'Beware of KYC update threats, fake lottery calls, job registration fees, and screen-sharing apps.',
    points: [
      {
        bn: 'প্রতারণার শিকার হলে দ্রুত জাতীয় সাইবার ক্রাইম হেল্পলাইন ১৯৩০ (1930) বা cybercrime.gov.in-এ অভিযোগ করুন।',
        hi: 'वित्तीय साइबर धोखाधड़ी होने पर तुरंत राष्ट्रीय हेल्पलाइन 1930 या cybercrime.gov.in पर शिकायत दर्ज करें।',
        en: 'Report financial cyber fraud immediately on National Helpline 1930 or cybercrime.gov.in.',
      },
    ],
  },
  {
    id: 'investment',
    titleBn: '১০. মৌলিক বিনিয়োগ সচেতনতা',
    titleHi: '10. बुनियादी निवेश जागरूकता',
    titleEn: '10. Basic Investment Awareness',
    summaryBn: '“অল্প দিনে টাকা দ্বিগুণ” বলা স্কিমগুলি প্রতারণা। প্রথমে পোস্ট অফিস, পিপিএফ, সুকন্যা সমৃদ্ধি ও ব্যাংক এফডি-র মতো নিরাপদ বিকল্প বুঝুন।',
    summaryHi: '“कम समय में पैसा दोगुना” करने वाले प्रस्ताव धोखाधड़ी होते हैं। पहले पोस्ट ऑफिस, PPF, सुकन्या समृद्धि और बैंक FD जैसे सुरक्षित विकल्प समझें।',
    summaryEn: 'Treat “double your money fast” offers as fraud. Understand regulated options like Post Office schemes, PPF, Sukanya Samriddhi, and bank FDs before exploring market products.',
    points: [
      {
        bn: 'শিক্ষামূলক বার্তা: আমরা কোনো নির্দিষ্ট বিনিয়োগের সুপারিশ বা নিশ্চিত রিটার্নের প্রতিশ্রুতি দিই না।',
        hi: 'शैक्षिक सूचना: हम कोई व्यक्तिगत निवेश सलाह या निश्चित मुनाफे की गारंटी नहीं देते।',
        en: 'Educational note: We do not give personalized investment advice or promise guaranteed returns.',
      },
    ],
  },
];

function FinanceTabs({ active }: { active: 'hub' | 'budget' | 'savings' | 'emi' }) {
  const { navigate, language } = useApp();
  const tabs = [
    { id: 'hub', path: '/finance', label: tr(language, 'আর্থিক শিক্ষা গাইড', 'वित्तीय साक्षरता गाइड', 'Literacy Guides') },
    { id: 'budget', path: '/finance/budget', label: tr(language, 'বাজেট ক্যালকুলেটর', 'बजट कैलकुलेटर', 'Budget Calculator') },
    { id: 'savings', path: '/finance/savings', label: tr(language, 'সঞ্চয় ও লক্ষ্য', 'बचत और लक्ष्य', 'Savings & Goals') },
    { id: 'emi', path: '/finance/emi', label: tr(language, 'ইএমআই ক্যালকুলেটর', 'ईएमआई कैलकुलेटर', 'EMI Calculator') },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-white border border-[#F2DCC1] mb-8 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => navigate(tab.path)}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            active === tab.id
              ? 'jenova-saffron-btn'
              : 'text-[#454545] hover:text-[#26364B] hover:bg-[#FFF1DF]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function EducationalDisclaimer() {
  const { language } = useApp();
  return (
    <p className="text-xs text-[#454545] bg-[#FFF1DF] border border-[#F2DCC1] rounded-lg px-4 py-3 leading-relaxed">
      {tr(
        language,
        'শিক্ষামূলক দাবিত্যাগ: এই ক্যালকুলেটর ও তথ্য কেবলমাত্র সাধারণ আর্থিক সচেতনতা ও ব্যক্তিগত পরিকল্পনার জন্য। এটি কোনো বিনিয়োগ পরামর্শ, নিশ্চিত মুনাফা বা ঋণের প্রতিশ্রুতি নয়। চূড়ান্ত হার ও শর্তের জন্য সংশ্লিষ্ট ব্যাংক বা পোস্ট অফিসে যাচাই করুন।',
        'शैक्षिक अस्वीकरण: इस प्लेटफॉर्म के सभी कैलकुलेटर और गाइड केवल सामान्य वित्तीय जागरूकता और व्यक्तिगत योजना के लिए हैं। ये कोई व्यक्तिगत निवेश सलाह, निश्चित रिटर्न या लोन प्रस्ताव नहीं हैं। अंतिम दरों के लिए अपने बैंक या पोस्ट ऑफिस से पुष्टि करें।',
        'Educational Disclaimer: All calculators and literacy guides on this platform are for general financial education and personal planning only. They do not constitute personalized investment advice, guaranteed returns, or a loan offer.'
      )}
    </p>
  );
}

export function FinancialLiteracyHubPage() {
  const { language, navigate } = useApp();
  const [openTopic, setOpenTopic] = useState<string>('budgeting');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(
          language,
          'আর্থিক শিক্ষা ও সচেতনতা কেন্দ্র',
          'वित्तीय साक्षरता और जागरूकता केंद्र',
          'Financial Literacy Centre'
        )}
        subtitle={tr(
          language,
          'সহজ বাংলায় সংসারের বাজেট, সঞ্চয়, ব্যাংকিং, সুদের হিসাব, ইএমআই এবং ইউপিআই প্রতারণা থেকে সুরক্ষার ১০টি জরুরি পাঠ ও ইন্টারেক্টিভ টুল।',
          'सरल हिंदी में घर के बजट, बचत, बैंकिंग, ब्याज, ईएमआई और यूपीआई धोखाधड़ी से सुरक्षा के 10 जरूरी पाठ और इंटरैक्टिव कैलकुलेटर।',
          'Ten essential money-management topics in plain language paired with accurate interactive calculators for household budgeting, savings, and EMIs.'
        )}
      />

      <FinanceTabs active="hub" />

      <div className="mb-8">
        <SafetyNotice />
      </div>

      {/* 3D Financial Literacy & UPI Safety Visual Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-7 rounded-xl overflow-hidden bg-white border border-[#F2DCC1] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.financeSavingsGrowth.src}
            alt={VISUAL_ASSETS.financeSavingsGrowth.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-4 border-t border-[#F2DCC1]">
            <h2 className="text-base font-bold text-[#26364B]">
              {tr(
                language,
                'নিয়মিত সঞ্চয়, বাজেট ও নিরাপদ ব্যাংকিং অভ্যাস',
                'नियमित बचत, घरेलू बजट और सुरक्षित बैंकिंग आदतें',
                'Steady Savings, Household Budgeting & Regulated Banking'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#454545] mt-1">
              {tr(
                language,
                'স্বচ্ছ হিসাবের মাধ্যমে ধাপে ধাপে জরুরি তহবিল তৈরি করুন — চড়া সুদের অনানুষ্ঠানিক ঋণের ওপর নির্ভর না করেই।',
                'पारदर्शी गणनाओं के जरिए चरणबद्ध तरीके से आपातकालीन फंड बनाएं — बिना ऊंचे ब्याज वाले अनौपचारिक कर्ज पर निर्भर हुए।',
                'Build an emergency cushion step by step through transparent calculations — without relying on high-interest informal loans.'
              )}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl bg-white border border-[#F2DCC1] p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-4">
            <ResilientImage
              src={VISUAL_ASSETS.financeUpiSecurity.src}
              alt={VISUAL_ASSETS.financeUpiSecurity.alt}
              containerClassName="w-full sm:w-40 lg:w-full aspect-[4/3] lg:aspect-[16/10] rounded-lg border border-[#F2DCC1]"
            />
            <div>
              <h2 className="text-base font-bold text-[#26364B] inline-flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#A85B0A] shrink-0" />
                <span>
                  {tr(
                    language,
                    'ইউপিআই ও ডিজিটাল সুরক্ষা নিয়ম',
                    'यूपीआई और डिजिटल भुगतान सुरक्षा नियम',
                    'UPI & Digital Payment Safety'
                  )}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#454545] mt-1.5 leading-relaxed">
                {tr(
                  language,
                  'টাকা পাওয়ার জন্য কখনোই UPI PIN দিতে হয় না বা QR কোড স্ক্যান করতে হয় না। প্রতারণার শিকার হলে ১৯৩০ নম্বরে ফোন করুন।',
                  'पैसे प्राप्त करने के लिए कभी भी UPI PIN न डालें और न ही QR कोड स्कैन करें। वित्तीय साइबर धोखाधड़ी होने पर तुरंत राष्ट्रीय हेल्पलाइन 1930 पर कॉल करें।',
                  'Never enter your UPI PIN or scan a QR code to receive money. Report financial cyber fraud immediately at National Helpline 1930.'
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/scam-check')}
              className="px-3.5 py-2 rounded-lg jenova-saffron-btn text-xs font-semibold cursor-pointer"
            >
              {tr(language, 'সন্দেহজনক মেসেজ যাচাই করুন', 'संदिग्ध संदेश की जांच करें', 'Check a Suspicious Message')}
            </button>
            <button
              type="button"
              onClick={() => setOpenTopic('upi-safety')}
              className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
            >
              {tr(language, 'ইউপিআই সুরক্ষা পাঠ পড়ুন →', 'यूपीआई सुरक्षा पाठ पढ़ें →', 'Read UPI Safety Lesson →')}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Calculator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {[
          {
            icon: Wallet,
            path: '/finance/budget',
            title: tr(language, 'মাসিক বাজেট ও ব্যয় বিশ্লেষণ', 'मासिक बजट और खर्च चार्ट', 'Monthly Budget & Expense Chart'),
            desc: tr(
              language,
              'ইন্টারেক্টিভ চার্টের মাধ্যমে মাসিক আয় ও ব্যয়ের স্পষ্ট বিশ্লেষণ।',
              'इंटरैक्टिव चार्ट के साथ मासिक आय और खर्च का स्पष्ट विवरण।',
              'Income vs. expense breakdown with interactive visual charts.'
            ),
          },
          {
            icon: PiggyBank,
            path: '/finance/savings',
            title: tr(language, 'সঞ্চয় ক্যালকুলেটর ও গোল ট্র্যাকার', 'बचत कैलकुलेटर और लक्ष्य ट्रैकर', 'Savings Calculator & Goal Tracker'),
            desc: tr(
              language,
              'নিয়মিত মাসিক সঞ্চয়ের বৃদ্ধি হিসাব করুন এবং পরিবারের লক্ষ্য ট্র্যাক করুন।',
              'नियमित मासिक बचत की वृद्धि का अनुमान लगाएं और परिवार के लक्ष्य ट्रैक करें।',
              'Project recurring deposit growth and track family savings targets.'
            ),
          },
          {
            icon: Calculator,
            path: '/finance/emi',
            title: tr(language, 'ঋণের ইএমআই (EMI) ক্যালকুলেটর', 'ऋण ईएमआई (EMI) कैलकुलेटर', 'Loan EMI Calculator'),
            desc: tr(
              language,
              'ঋণ নেওয়ার আগেই সঠিক মাসিক কিস্তি ও মোট সুদের হিসাব জানুন।',
              'कर्ज लेने से पहले सटीक मासिक ईएमआई और कुल ब्याज की गणना करें।',
              'Compute accurate monthly EMI and total interest before borrowing.'
            ),
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.path}
              type="button"
              onClick={() => navigate(card.path)}
              className="text-left p-6 rounded-xl bg-white border border-[#F2DCC1] hover:border-[#F4A340] transition-colors flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <Icon className="w-6 h-6 text-[#A85B0A] dark:text-[#FFD19A] mb-3" />
                <h2 className="text-base font-bold text-[#26364B] group-hover:text-[#A85B0A] dark:group-hover:text-[#FFD19A]">
                  {card.title}
                </h2>
                <p className="text-xs text-[#454545] mt-1.5">{card.desc}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
                {tr(language, 'ক্যালকুলেটর খুলুন', 'कैलकुलेटर खोलें', 'Open Calculator')}{' '}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      {/* 10 Financial Literacy Modules */}
      <h2 className="text-xl sm:text-2xl font-bold text-[#26364B] mb-5">
        {tr(
          language,
          '১০টি মৌলিক আর্থিক শিক্ষা পাঠ',
          '10 ज़रूरी वित्तीय साक्षरता पाठ',
          '10 Essential Financial Literacy Lessons'
        )}
      </h2>

      <div className="space-y-3 mb-8">
        {LITERACY_TOPICS.map((topic) => {
          const isOpen = openTopic === topic.id;
          return (
            <div key={topic.id} className="rounded-xl bg-white border border-[#F2DCC1] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenTopic(isOpen ? '' : topic.id)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#FFF1DF] cursor-pointer"
              >
                <div>
                  <p className="text-base font-bold text-[#26364B]">
                    {tr(language, topic.titleBn, topic.titleHi, topic.titleEn)}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#665B4F] shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-[#F2DCC1] space-y-3 bg-[#FFF1DF]/60">
                  <p className="text-sm text-[#26364B] leading-relaxed">
                    {tr(language, topic.summaryBn, topic.summaryHi, topic.summaryEn)}
                  </p>
                  <ul className="space-y-2 pt-2">
                    {topic.points.map((pt, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-[#26364B] pl-3 border-l border-[#F4A340]/40">
                        <span className="block font-medium">{tr(language, pt.bn, pt.hi, pt.en)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <EducationalDisclaimer />
    </div>
  );
}

export function BudgetCalculatorPage() {
  const { language } = useApp();
  const [incomeMode, setIncomeMode] = useState<'monthly' | 'daily_wage'>('monthly');
  const [fixedMonthlyIncome, setFixedMonthlyIncome] = useState(18000);
  const [dailyWage, setDailyWage] = useState(500);
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState(22);
  const [expenses, setExpenses] = useState({
    food: 6000,
    housing: 3500,
    education: 2000,
    healthcare: 1200,
    transport: 1500,
    other: 1000,
  });

  const monthlyIncome =
    incomeMode === 'daily_wage' ? dailyWage * workDaysPerMonth : fixedMonthlyIncome;
  const leanMonthIncome =
    incomeMode === 'daily_wage' ? dailyWage * Math.max(0, workDaysPerMonth - 5) : monthlyIncome;
  const totalExpense = Object.values(expenses).reduce((acc, n) => acc + (Number(n) || 0), 0);
  const netBalance = monthlyIncome - totalExpense;
  const savingsRate = monthlyIncome > 0 ? (netBalance / monthlyIncome) * 100 : 0;

  const pieData = [
    { name: tr(language, 'খাদ্য ও বাজার', 'खाद्य और राशन', 'Food & Groceries'), value: expenses.food },
    { name: tr(language, 'বাড়ি ও বিদ্যুৎ', 'घर और बिजली', 'Housing & Utilities'), value: expenses.housing },
    { name: tr(language, 'শিক্ষা', 'शिक्षा', 'Education'), value: expenses.education },
    { name: tr(language, 'চিকিৎসা', 'स्वास्थ्य और दवा', 'Healthcare'), value: expenses.healthcare },
    { name: tr(language, 'যাতায়াত ও ফোন', 'यातायात और मोबाइल', 'Transport & Mobile'), value: expenses.transport },
    { name: tr(language, 'অন্যান্য', 'अन्य खर्च', 'Other Needs'), value: expenses.other },
  ].filter((d) => d.value > 0);

  const summaryBars = [
    { name: tr(language, 'মাসিক আয়', 'मासिक आय', 'Est. Income'), amount: monthlyIncome },
    { name: tr(language, 'মোট ব্যয়', 'कुल खर्च', 'Total Expenses'), amount: totalExpense },
    { name: tr(language, 'মাসিক সঞ্চয়', 'मासिक बचत', 'Net Savings'), amount: Math.max(0, netBalance) },
  ];

  const updateExp = (key: keyof typeof expenses, val: string) => {
    setExpenses((prev) => ({ ...prev, [key]: Math.max(0, Number(val) || 0) }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(
          language,
          'মাসিক ও দৈনিক মজুরি বাজেট ক্যালকুলেটর',
          'मासिक और दैनिक मज़दूरी बजट कैलकुलेटर',
          'Household & Daily-Wage Budget Calculator'
        )}
        subtitle={tr(
          language,
          'নিয়মিত মাসিক বেতন অথবা দৈনিক মজুরি (অনিয়মিত আয়) — দুভাবেই আপনার সংসারের বাজেট ও জরুরি সঞ্চয় হিসাব করুন।',
          'नियमित मासिक वेतन या दैनिक मज़दूरी (अनियमित आय) — दोनों तरीकों से अपने घर का बजट और सुरक्षित बचत तय करें।',
          'Switch between Fixed Monthly Income and Daily-Wage / Irregular Income mode to plan safe household spending even during low-work weeks.'
        )}
      />

      <FinanceTabs active="budget" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Inputs */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-5">
          {/* Income Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1]">
            <button
              type="button"
              onClick={() => setIncomeMode('monthly')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                incomeMode === 'monthly'
                  ? 'jenova-saffron-btn'
                  : 'text-[#454545] hover:text-[#26364B]'
              }`}
            >
              {tr(language, 'মাসিক নির্দিষ্ট আয়', 'निश्चित मासिक आय', 'Fixed Monthly Income')}
            </button>
            <button
              type="button"
              onClick={() => setIncomeMode('daily_wage')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                incomeMode === 'daily_wage'
                  ? 'jenova-saffron-btn'
                  : 'text-[#454545] hover:text-[#26364B]'
              }`}
            >
              {tr(language, 'দৈনিক মজুরি / অনিয়মিত আয়', 'दैनिक मज़दूरी / अनियमित आय', 'Daily-Wage / Irregular')}
            </button>
          </div>

          {incomeMode === 'monthly' ? (
            <div>
              <label className="block text-xs font-semibold text-[#26364B] mb-1.5">
                {tr(language, 'মোট মাসিক আয় (₹)', 'कुल मासिक घरेलू आय (₹)', 'Total Monthly Household Income (₹)')}
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={fixedMonthlyIncome}
                onChange={(e) => setFixedMonthlyIncome(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#F2DCC1] px-3.5 py-2.5 text-base font-mono font-semibold tabular-nums"
              />
            </div>
          ) : (
            <div className="space-y-3 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1] p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26364B] mb-1">
                    {tr(language, 'দৈনিক মজুরি (₹)', 'दैनिक मज़दूरी (₹)', 'Daily Wage (₹)')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={dailyWage}
                    onChange={(e) => setDailyWage(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-lg border border-[#F2DCC1] bg-white px-3 py-2 text-sm font-mono font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26364B] mb-1">
                    {tr(language, 'মাসে গড় কাজের দিন', 'महीने में औसत कार्य दिवस', 'Avg Work Days / Month')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={workDaysPerMonth}
                    onChange={(e) =>
                      setWorkDaysPerMonth(Math.min(31, Math.max(0, Number(e.target.value) || 0)))
                    }
                    className="w-full rounded-lg border border-[#F2DCC1] bg-white px-3 py-2 text-sm font-mono font-semibold tabular-nums"
                  />
                </div>
              </div>
              <div className="text-xs text-[#26364B] dark:text-[#FFD19A] flex items-center justify-between pt-2 border-t border-[#F2DCC1]">
                <span>{tr(language, 'আনুমানিক মাসিক আয়:', 'अनुमानित मासिक आय:', 'Estimated Monthly Income:')}</span>
                <span className="font-mono font-bold text-sm">
                  ₹{monthlyIncome.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-[#6B3F06] bg-[#FEF4E6] px-2.5 py-1.5 rounded-lg">
                {tr(
                  language,
                  `বর্ষা বা কম কাজের মাসে (৫ দিন কম কাজ হলে) আয় নেমে আসতে পারে ₹${leanMonthIncome.toLocaleString('en-IN')}-এ। জরুরি তহবিল সরিয়ে রাখুন।`,
                  `कम काम वाले महीने में (5 दिन कम काम होने पर) आय ₹${leanMonthIncome.toLocaleString('en-IN')} तक कम हो सकती है। इसके लिए थोड़ा बफर अलग रखें।`,
                  `Low-work month cushion (5 fewer work days): ₹${leanMonthIncome.toLocaleString('en-IN')}. Keep a buffer for lean weeks.`
                )}
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-[#F2DCC1] space-y-3.5">
            <p className="text-xs font-semibold text-[#454545]">
              {tr(language, 'মাসিক ব্যয়ের খাতসমূহ (₹)', 'मासिक खर्च का विवरण (₹)', 'Monthly Expense Breakdown (₹)')}
            </p>
            {(
              [
                ['food', tr(language, 'খাদ্য ও বাজার', 'खाद्य और राशन', 'Food & Groceries')],
                ['housing', tr(language, 'বাড়ি ভাড়া ও বিদ্যুৎ', 'घर का किराया और बिजली', 'Housing & Utilities')],
                ['education', tr(language, 'পড়াশোনা', 'पढ़ाई-लिखाई', 'Education')],
                ['healthcare', tr(language, 'চিকিৎসা ও ওষুধ', 'इलाज और दवाइयां', 'Healthcare & Medicine')],
                ['transport', tr(language, 'যাতায়াত ও মোবাইল', 'यातायात और मोबाइल', 'Transport & Mobile')],
                ['other', tr(language, 'অন্যান্য খরচ', 'अन्य खर्च', 'Other Expenses')],
              ] as [keyof typeof expenses, string][]
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <label className="text-sm text-[#26364B]">{label}</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={expenses[key]}
                  onChange={(e) => updateExp(key, e.target.value)}
                  className="w-32 rounded-lg border border-[#F2DCC1] px-3 py-1.5 text-sm font-mono tabular-nums text-right"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Outputs & Charts */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">{tr(language, 'মোট ব্যয়', 'कुल खर्च', 'Total Expenses')}</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#26364B]">
                ₹{totalExpense.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">
                {netBalance >= 0
                  ? tr(language, 'মাসিক উদ্বৃত্ত / সঞ্চয়', 'मासिक बचत', 'Monthly Surplus / Savings')
                  : tr(language, 'মাসিক ঘাটতি', 'मासिक घाटा', 'Monthly Deficit')}
              </p>
              <p
                className={`mt-1.5 text-2xl font-bold font-mono tabular-nums ${
                  netBalance >= 0 ? 'text-[#27845B] dark:text-[#45B884]' : 'text-red-700'
                }`}
              >
                {netBalance < 0 ? '-' : ''}₹{Math.abs(netBalance).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">{tr(language, 'সঞ্চয়ের হার', 'बचत दर', 'Savings Rate')}</p>
              <p
                className={`mt-1.5 text-2xl font-bold font-mono tabular-nums ${
                  savingsRate >= 20 ? 'text-[#A85B0A] dark:text-[#FFD19A]' : savingsRate > 0 ? 'text-[#A85B0A]' : 'text-red-700'
                }`}
              >
                {savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <h3 className="text-sm font-bold text-[#26364B] mb-3">
                {tr(language, 'খরচের বিভাজন চিত্র', 'खर्च विभाजन चार्ट', 'Expense Breakdown Visualizer')}
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <h3 className="text-sm font-bold text-[#26364B] mb-3">
                {tr(language, 'আয় বনাম ব্যয় তুলনা', 'आय बनाम खर्च तुलना', 'Income vs. Expense Overview')}
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summaryBars}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2DCC1" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                    <Bar dataKey="amount" fill="#F4A340" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFE5C2] border border-[#F4A340]/20 text-sm text-[#26364B] dark:text-[#FFD19A]">
            {netBalance < 0
              ? tr(
                  language,
                  'সতর্কতা: আপনার বর্তমান ব্যয় মাসিক আয়ের চেয়ে বেশি। চড়া সুদের ধার এড়াতে অপ্রয়োজনীয় খরচগুলি পর্যালোচনা করুন।',
                  'चेतावनी: आपका वर्तमान खर्च आपकी मासिक आय से अधिक है। ऊंचे ब्याज वाले कर्ज से बचने के लिए गैर-जरूरी खर्च कम करें।',
                  'Warning: Your expenses currently exceed your monthly income. Review non-essential items to avoid high-interest borrowing.'
                )
              : savingsRate >= 20
                ? tr(
                    language,
                    'চমৎকার শৃঙ্খলা: মাসিক আয়ের ২০% বা তার বেশি সঞ্চয় করলে পরিবারের জন্য শক্তিশালী জরুরি তহবিল তৈরি হয়।',
                    'उत्कृष्ट अनुशासन: मासिक आय का 20% या अधिक बचाना परिवार के लिए मजबूत आपातकालीन फंड बनाता है।',
                    'Strong discipline: Saving 20%+ of monthly income helps build a reliable household emergency reserve.'
                  )
                : tr(
                    language,
                    'ভালো শুরু: ব্যাংক বা পোস্ট অফিসে নিয়মিত ১০%–১৫% সঞ্চয় করলেও ১২–২৪ মাসে ভালো আর্থিক সুরক্ষা তৈরি হয়।',
                    'अच्छी शुरुआत: बैंक या पोस्ट ऑफिस में नियमित रूप से 10%–15% बचाने से भी 12–24 महीनों में मजबूत सुरक्षा बनती है।',
                    'Good start: Even saving 10%–15% regularly in a bank or post office account builds strong resilience over 12–24 months.'
                  )}
          </div>
        </div>
      </div>

      <EducationalDisclaimer />
    </div>
  );
}

export function SavingsCalculatorPage() {
  const { language, user, token, navigate, showToast } = useApp();
  const [initialAmount, setInitialAmount] = useState(5000);
  const [monthlyDeposit, setMonthlyDeposit] = useState(1500);
  const [annualRate, setAnnualRate] = useState(6.7);
  const [years, setYears] = useState(5);

  // Persistent savings goals
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('25000');
  const [goalSaved, setGoalSaved] = useState('3000');
  const [goalMonthly] = useState('1500');
  const [goalDate] = useState('2027-12-31');

  useEffect(() => {
    if (!user || !token) return;
    apiFetch<{ goals: SavingsGoal[] }>('/api/savings-goals', {}, token)
      .then((res) => setGoals(res.goals))
      .catch(() => {});
  }, [user, token]);

  // Accurate monthly compounding projection
  const projection = useMemo(() => {
    const r = annualRate / 100 / 12;
    const rows: { year: string; invested: number; totalValue: number }[] = [];
    let balance = initialAmount;
    let totalInvested = initialAmount;

    rows.push({
      year: tr(language, 'শুরু', 'शुरुआत', 'Start'),
      invested: Math.round(totalInvested),
      totalValue: Math.round(balance),
    });

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        balance = (balance + monthlyDeposit) * (1 + r);
        totalInvested += monthlyDeposit;
      }
      rows.push({
        year: tr(language, `বছর ${y}`, `वर्ष ${y}`, `Yr ${y}`),
        invested: Math.round(totalInvested),
        totalValue: Math.round(balance),
      });
    }
    const finalRow = rows[rows.length - 1];
    return {
      rows,
      totalInvested: finalRow.invested,
      maturityValue: finalRow.totalValue,
      interestEarned: Math.max(0, finalRow.totalValue - finalRow.invested),
    };
  }, [initialAmount, monthlyDeposit, annualRate, years, language]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      showToast(
        tr(
          language,
          'ব্যক্তিগত সঞ্চয়ের লক্ষ্য ড্যাশবোর্ডে সেভ করতে অনুগ্রহ করে সাইন ইন করুন।',
          'अपने डैशबोर्ड में व्यक्तिगत बचत लक्ष्य सेव करने के लिए कृपया साइन इन करें।',
          'Please sign in to save personal savings goals to your dashboard.'
        )
      );
      navigate('/auth');
      return;
    }
    try {
      const res = await apiFetch<{ goal: SavingsGoal }>(
        '/api/savings-goals',
        {
          method: 'POST',
          body: JSON.stringify({
            title: goalTitle,
            targetAmount: Number(goalTarget),
            savedAmount: Number(goalSaved),
            monthlyContribution: Number(goalMonthly),
            targetDate: goalDate,
          }),
        },
        token
      );
      setGoals((prev) => [res.goal, ...prev]);
      setGoalTitle('');
      showToast(
        tr(
          language,
          'সঞ্চয়ের লক্ষ্য আপনার ড্যাশবোর্ডে যোগ হয়েছে।',
          'बचत लक्ष्य आपके डैशबोर्ड में जोड़ दिया गया है।',
          'Savings goal added to your dashboard.'
        )
      );
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : tr(language, 'লক্ষ্য সংরক্ষণ করা যায়নি।', 'लक्ष्य सेव नहीं हो सका।', 'Failed to save goal.')
      );
    }
  };

  const handleIncrementGoal = async (goal: SavingsGoal, add: number) => {
    if (!token) return;
    const nextAmount = Math.min(goal.targetAmount * 2, goal.savedAmount + add);
    try {
      const res = await apiFetch<{ goal: SavingsGoal }>(
        `/api/savings-goals/${goal.id}`,
        { method: 'PATCH', body: JSON.stringify({ savedAmount: nextAmount }) },
        token
      );
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? res.goal : g)));
    } catch {
      // ignore
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/api/savings-goals/${id}`, { method: 'DELETE' }, token);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(
          language,
          'সঞ্চয় ক্যালকুলেটর ও লক্ষ্য ট্র্যাকার',
          'बचत कैलकुलेटर और लक्ष्य ट्रैकर',
          'Savings Calculator & Goal Tracker'
        )}
        subtitle={tr(
          language,
          'মাসিক নিয়মিত সঞ্চয়ে সময়ের সাথে কত তহবিল তৈরি হবে তা হিসাব করুন এবং পরিবারের সঞ্চয়ের লক্ষ্য ট্র্যাক করুন।',
          'अनुमान लगाएं कि मासिक चक्रवृद्धि के साथ नियमित जमा राशि कैसे बढ़ती है, और परिवार के बचत लक्ष्यों को ट्रैक करें।',
          'Estimate how steady monthly deposits grow with monthly compounding, and track real household savings goals.'
        )}
      />

      <FinanceTabs active="savings" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              {tr(language, 'প্রাথমিক সঞ্চিত অর্থ (₹)', 'प्रारंभिक बचत राशि (₹)', 'Initial Saved Amount (₹)')}
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={initialAmount}
              onChange={(e) => setInitialAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              {tr(language, 'মাসিক সঞ্চয়ের পরিমাণ (₹)', 'मासिक बचत योगदान (₹)', 'Monthly Savings Contribution (₹)')}
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label>{tr(language, 'আনুমানিক বার্ষিক সুদের হার (%)', 'अनुमानित वार्षिक ब्याज दर (%)', 'Illustrative Annual Rate (%)')}</label>
              <span className="font-mono tabular-nums text-[#A85B0A] dark:text-[#FFD19A]">{annualRate}%</span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              step={0.1}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-[#F4A340]"
            />
            <p className="text-[11px] text-[#665B4F] mt-1">
              {tr(
                language,
                'শুধুমাত্র ধারণার জন্য (ব্যাংক/পোস্ট অফিস RD-র সুদের হার সরকারি বিজ্ঞপ্তি অনুযায়ী পরিবর্তিত হয়)।',
                'केवल अनुमान के लिए (बैंक/पोस्ट ऑफिस RD की ब्याज दरें समय-समय पर बदलती हैं)।',
                'Illustrative only (e.g., Bank/Post Office RD rates vary by bank notification).'
              )}
            </p>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label>{tr(language, 'সময়কাল (বছর)', 'अवधि (वर्ष)', 'Duration (Years)')}</label>
              <span className="font-mono tabular-nums text-[#A85B0A] dark:text-[#FFD19A]">
                {years} {tr(language, 'বছর', 'वर्ष', 'Years')}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-[#F4A340]"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">{tr(language, 'মোট জমার পরিমাণ', 'कुल जमा राशि', 'Total Deposited')}</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#26364B]">
                ₹{projection.totalInvested.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">{tr(language, 'আনুমানিক সুদ', 'अनुमानित ब्याज', 'Estimated Interest')}</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#A85B0A]">
                ₹{projection.interestEarned.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">{tr(language, 'মোট সম্ভাব্য তহবিল', 'अनुमानित कुल मूल्य', 'Projected Value')}</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#A85B0A] dark:text-[#FFD19A]">
                ₹{projection.maturityValue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
            <h3 className="text-sm font-bold text-[#26364B] mb-3">
              {tr(language, 'সঞ্চয় বৃদ্ধির গ্রাফ', 'बचत वृद्धि ग्राफ', 'Savings Growth Curve')}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2DCC1" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                  <Area
                    type="monotone"
                    dataKey="totalValue"
                    name={tr(language, 'মোট সম্ভাব্য তহবিল', 'अनुमानित कुल मूल्य', 'Projected Value')}
                    stroke="#27845B"
                    fill="#27845B"
                    fillOpacity={0.18}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    name={tr(language, 'মোট জমার পরিমাণ', 'कुल जमा राशि', 'Total Deposited')}
                    stroke="#F4A340"
                    fill="#F4A340"
                    fillOpacity={0.16}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goal Tracker */}
      <section className="p-6 rounded-xl bg-white border border-[#F2DCC1] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F2DCC1] mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#26364B]">
              {tr(language, 'ব্যক্তিগত সঞ্চয়ের লক্ষ্য ট্র্যাকার', 'व्यक्तिगत बचत लक्ष्य ट्रैकर', 'Personal Savings Goal Tracker')}
            </h2>
            <p className="text-xs text-[#454545]">
              {tr(
                language,
                'জরুরি তহবিল, স্কুলের ফি বা ছোট ব্যবসার মূলধন সঞ্চয় ট্র্যাক করুন।',
                'आपातकालीन फंड, स्कूल फीस या छोटे व्यवसाय की शुरुआती पूंजी के लक्ष्य ट्रैक करें।',
                'Track emergency funds, school fees, or small business seed savings.'
              )}
            </p>
          </div>
          {!user && (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
            >
              {tr(language, 'লক্ষ্য স্থায়ীভাবে সেভ করতে সাইন ইন করুন →', 'लक्ष्य स्थायी रूप से सेव करने के लिए साइन इन करें →', 'Sign in to save goals permanently →')}
            </button>
          )}
        </div>

        <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
          <input
            required
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            placeholder={tr(language, 'লক্ষ্য (যেমন: সেলাই মেশিন)', 'लक्ष्य (जैसे: सिलाई मशीन)', 'Goal (e.g. Sewing Machine)')}
            className="sm:col-span-2 rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={100}
            value={goalTarget}
            onChange={(e) => setGoalTarget(e.target.value)}
            placeholder={tr(language, 'লক্ষ্যমাত্রা ₹', 'लक्ष्य राशि ₹', 'Target ₹')}
            className="rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
          />
          <input
            type="number"
            min={0}
            value={goalSaved}
            onChange={(e) => setGoalSaved(e.target.value)}
            placeholder={tr(language, 'জমা হয়েছে ₹', 'बचाई राशि ₹', 'Saved ₹')}
            className="rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold jenova-saffron-btn rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{tr(language, 'লক্ষ্য যোগ করুন', 'लक्ष्य जोड़ें', 'Add Goal')}</span>
          </button>
        </form>

        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.savedAmount / Math.max(1, g.targetAmount)) * 100));
              return (
                <div key={g.id} className="p-4 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm text-[#26364B]">{g.title}</p>
                    <p className="font-mono text-xs tabular-nums text-[#A85B0A] dark:text-[#FFD19A] font-semibold">
                      ₹{g.savedAmount.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')} ({pct}%)
                    </p>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#FFE5C2] dark:bg-white/10 overflow-hidden mb-3">
                    <div
                      className="h-full bg-[#F4A340] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleIncrementGoal(g, 500)}
                      className="px-3 py-1 rounded-md bg-white border border-[#F2DCC1] text-[#A85B0A] dark:text-[#FFD19A] font-semibold hover:bg-[#FFE5C2] cursor-pointer"
                    >
                      {tr(language, '+ ₹৫০০ সঞ্চয় যোগ করুন', '+ ₹500 बचत जोड़ें', '+ Log ₹500 Saved')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-[#665B4F] hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {tr(language, 'মুছুন', 'हटाएं', 'Remove')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#665B4F]">
            {user
              ? tr(
                  language,
                  'এখনো কোনো সঞ্চয়ের লক্ষ্য যোগ করা হয়নি। উপরে আপনার প্রথম লক্ষ্য তৈরি করুন।',
                  'अभी तक कोई बचत लक्ष्य नहीं जोड़ा गया है। ऊपर अपना पहला लक्ष्य बनाएं।',
                  'No savings goals added yet. Create your first target above.'
                )
              : tr(
                  language,
                  'সঞ্চয়ের লক্ষ্য সংরক্ষণ ও আপডেট করতে বিনামূল্যের কমিউনিটি অ্যাকাউন্টে সাইন ইন করুন।',
                  'बचत लक्ष्यों को सेव और अपडेट करने के लिए निःशुल्क सामुदायिक खाते से साइन इन करें।',
                  'Sign in with a free community account to store and update savings goals.'
                )}
          </p>
        )}
      </section>

      <EducationalDisclaimer />
    </div>
  );
}

export function EmiCalculatorPage() {
  const { language } = useApp();
  const [principal, setPrincipal] = useState(100000);
  const [annualInterest, setAnnualInterest] = useState(11);
  const [tenureMonths, setTenureMonths] = useState(24);

  // Standard reducing-balance EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const result = useMemo(() => {
    const P = Math.max(0, principal);
    const n = Math.max(1, tenureMonths);
    const r = annualInterest / 12 / 100;

    if (r === 0) {
      const emi = P / n;
      return { emi, totalPayable: P, totalInterest: 0 };
    }
    const factor = Math.pow(1 + r, n);
    const emi = (P * r * factor) / (factor - 1);
    const totalPayable = emi * n;
    const totalInterest = Math.max(0, totalPayable - P);
    return { emi, totalPayable, totalInterest };
  }, [principal, annualInterest, tenureMonths]);

  const breakdown = [
    { name: tr(language, 'আসল টাকা', 'मूलधन राशि', 'Principal Amount'), value: Math.round(principal) },
    { name: tr(language, 'মোট সুদ', 'कुल ब्याज', 'Total Interest'), value: Math.round(result.totalInterest) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(
          language,
          'ইএমআই (EMI) ও ঋণ ক্যালকুলেটর',
          'ईएमआई (EMI) और ऋण कैलकुलेटर',
          'Loan EMI & Interest Calculator'
        )}
        subtitle={tr(
          language,
          'যেকোনো ঋণ নেওয়ার আগে মাসিক কিস্তি (EMI), মোট সুদ এবং মোট পরিশোধযোগ্য টাকার সঠিক হিসাব জানুন।',
          'किसी भी औपचारिक बैंक लोन से पहले सटीक मासिक किस्त (EMI), कुल ब्याज और कुल देय राशि की गणना करें।',
          'Calculate exact Equated Monthly Instalments (reducing-balance formula) and total interest before committing to any formal bank loan.'
        )}
      />

      <FinanceTabs active="emi" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              {tr(language, 'ঋণের পরিমাণ (আসল ₹)', 'लोन राशि (मूलधन ₹)', 'Loan Amount (Principal ₹)')}
            </label>
            <input
              type="number"
              min={1000}
              step={5000}
              value={principal}
              onChange={(e) => setPrincipal(Math.max(1000, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label>{tr(language, 'বার্ষিক সুদের হার (%)', 'वार्षिक ब्याज दर (%)', 'Annual Interest Rate (%)')}</label>
              <span className="font-mono tabular-nums text-[#A85B0A] dark:text-[#FFD19A]">{annualInterest}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={0.25}
              value={annualInterest}
              onChange={(e) => setAnnualInterest(Number(e.target.value))}
              className="w-full accent-[#F4A340]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label>{tr(language, 'পরিশোধের মেয়াদ (মাস)', 'भुगतान अवधि (महीने)', 'Repayment Tenure (Months)')}</label>
              <span className="font-mono tabular-nums text-[#A85B0A] dark:text-[#FFD19A]">
                {tenureMonths} {tr(language, 'মাস', 'महीने', 'Months')} ({(tenureMonths / 12).toFixed(1)}{' '}
                {tr(language, 'বছর', 'वर्ष', 'yrs')})
              </span>
            </div>
            <input
              type="range"
              min={6}
              max={120}
              step={6}
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full accent-[#F4A340]"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-[#FEF4E6] border border-[#F4A340]/40 text-xs text-[#6B3F06] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#A85B0A] shrink-0 mt-0.5" />
            <span>
              {tr(
                language,
                'দায়িত্বশীল ঋণ নিয়ম: আপনার সমস্ত মাসিক কিস্তি (EMI) যেন পরিবারের নিয়মিত মাসিক আয়ের ৩০%-এর নিচে থাকে।',
                'ज़िम्मेदार कर्ज नियम: अपनी कुल मासिक EMI को परिवार की नियमित मासिक आय के 30% से कम रखें।',
                'Responsible borrowing check: Keep your total monthly EMI under 30% of your household’s reliable monthly income.'
              )}
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">{tr(language, 'মাসিক কিস্তি (EMI)', 'मासिक ईएमआई (EMI)', 'Monthly EMI')}</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#A85B0A] dark:text-[#FFD19A]">
                ₹{Math.round(result.emi).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">{tr(language, 'মোট সুদ', 'कुल ब्याज', 'Total Interest')}</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#A85B0A]">
                ₹{Math.round(result.totalInterest).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">{tr(language, 'মোট পরিশোধযোগ্য টাকা', 'कुल देय राशि', 'Total Amount Payable')}</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#26364B]">
                ₹{Math.round(result.totalPayable).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#F2DCC1]">
            <h3 className="text-sm font-bold text-[#26364B] mb-3">
              {tr(language, 'আসল বনাম সুদের অংশ', 'मूलधन बनाम ब्याज हिस्सा', 'Principal vs. Interest Share')}
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    <Cell fill="#27845B" />
                    <Cell fill="#F4A340" />
                  </Pie>
                  <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <EducationalDisclaimer />
    </div>
  );
}
