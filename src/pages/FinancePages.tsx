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
import type { SavingsGoal } from '../types/platform';
import { PageHeader, ResilientImage, SafetyNotice } from '../components/SharedUI';
import { VISUAL_ASSETS } from '../lib/visualAssets';

const CHART_COLORS = ['#176B4D', '#F4A340', '#2E8B6C', '#D97706', '#5C7C70', '#8C6239'];

interface LiteracyTopic {
  id: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  summaryEn: string;
  points: { bn: string; en: string }[];
}

const LITERACY_TOPICS: LiteracyTopic[] = [
  {
    id: 'budgeting',
    titleBn: '১. সংসারের মাসিক বাজেট (Household Budgeting)',
    titleEn: '1. Household Budgeting',
    summaryBn: 'প্রতি মাসে কত টাকা আয় হচ্ছে এবং কোন খাতে কত খরচ হচ্ছে তা লিখে রাখলে অপ্রয়োজনীয় খরচ কমানো সহজ হয়।',
    summaryEn: 'Tracking monthly income against essential household spending helps prevent month-end shortages.',
    points: [
      { bn: 'প্রথমে প্রয়োজনীয় খরচ (চাল-ডাল, বাড়ি ভাড়া, বিদ্যুৎ, চিকিৎসা, পড়াশোনা) আলাদা করুন।', en: 'Separate Needs (food, rent, utilities, healthcare, education) before Wants.' },
      { bn: 'আয় হাতে পাওয়ার পরই প্রথমে অল্প হলেও সঞ্চয়ের টাকা আলাদা সরিয়ে রাখুন।', en: 'Set aside a small savings amount first whenever wages or income arrive.' },
    ],
  },
  {
    id: 'saving',
    titleBn: '২. নিয়মিত সঞ্চয়ের অভ্যাস (Saving Habits)',
    titleEn: '2. Saving Habits',
    summaryBn: 'অল্প পরিমাণ হলেও প্রতি সপ্তাহে বা মাসে নিয়মিত সঞ্চয় করলে বিপদের সময় চড়া সুদের ধার নিতে হয় না।',
    summaryEn: 'Consistent small savings build an emergency cushion so families avoid high-interest informal borrowing.',
    points: [
      { bn: 'লক্ষ্য রাখুন অন্তত ৩ মাসের সংসার খরচের সমান জরুরি তহবিল (Emergency Fund) তৈরি করার।', en: 'Aim gradually for an emergency reserve covering 3 months of essential household expenses.' },
      { bn: 'ব্যাংক বা পোস্ট অফিসের রেকারিং ডিপোজিট (RD) নিয়মিত সঞ্চয়ে সাহায্য করে।', en: 'Bank or Post Office Recurring Deposits (RD) encourage steady monthly savings.' },
    ],
  },
  {
    id: 'banking',
    titleBn: '৩. ব্যাংকিং সচেতনতা (Banking Awareness)',
    titleEn: '3. Banking Awareness',
    summaryBn: 'নিজস্ব ব্যাংক অ্যাকাউন্ট, পাসবুক আপডেট এবং নমিনি (Nominee) যুক্ত রাখা প্রতিটি পরিবারের জন্য জরুরি।',
    summaryEn: 'Maintaining an active bank account with updated KYC and a registered nominee protects family savings.',
    points: [
      { bn: 'সরকারি প্রকল্পের সরাসরি টাকা (DBT) পেতে আধার সিডিং ও চালু ব্যাংক অ্যাকাউন্ট প্রয়োজন।', en: 'Keep your bank passbook updated and verify DBT seeding for official welfare transfers.' },
      { bn: 'ব্যাংক অ্যাকাউন্টে অবশ্যই পরিবারের একজন নমিনি (Nominee) যুক্ত করে রাখুন।', en: 'Always register a Nominee on every bank and post office account.' },
    ],
  },
  {
    id: 'interest',
    titleBn: '৪. সুদ ও চক্রবৃদ্ধি সুদ বোঝা (Understanding Interest)',
    titleEn: '4. Understanding Interest',
    summaryBn: 'সঞ্চয়ে চক্রবৃদ্ধি সুদ আপনার টাকা বাড়ায়, আর ঋণে উচ্চ সুদ আপনার বোঝা দ্রুত বাড়িয়ে দেয়।',
    summaryEn: 'Compound interest grows savings over time, while high interest on debt multiplies repayment burden.',
    points: [
      { bn: 'মাসে ৫% সুদ মানে বছরে ৬০% সুদ — এটি ব্যাংক ঋণের তুলনায় অনেক বেশি।', en: 'An informal rate of 5% per month equals 60% per year — far steeper than formal bank loans.' },
      { bn: 'ঋণের আগে বার্ষিক সুদের হার (Annual Interest Rate) ও মোট ফেরতযোগ্য টাকা হিসাব করুন।', en: 'Always compare the Annual Percentage Rate (APR) and total repayment before borrowing.' },
    ],
  },
  {
    id: 'borrowing',
    titleBn: '৫. দায়িত্বশীল ঋণ গ্রহণ (Responsible Borrowing)',
    titleEn: '5. Responsible Borrowing',
    summaryBn: 'শুধুমাত্র প্রয়োজনীয় উদ্দেশ্যে (শিক্ষা, চিকিৎসা বা আয়-বর্ধক কাজ) এবং পরিশোধের ক্ষমতা বুঝে ঋণ নিন।',
    summaryEn: 'Borrow only for productive or essential needs, strictly within your verified monthly repayment capacity.',
    points: [
      { bn: 'অনিবন্ধিত ঋণ অ্যাপ (Fake Loan Apps) থেকে কখনোই ঋণ নেবেন না।', en: 'Avoid unverified mobile loan apps; use only RBI-regulated banks, cooperatives, or NBFCs.' },
      { bn: 'সমস্ত মাসিক কিস্তি যেন আপনার মোট আয়ের ৩০%–৩৫%-এর বেশি না হয়।', en: 'Keep total monthly EMIs below 30%–35% of stable household income.' },
    ],
  },
  {
    id: 'emi',
    titleBn: '৬. ইএমআই (EMI) কীভাবে কাজ করে',
    titleEn: '6. Understanding EMIs',
    summaryBn: 'EMI-এর মধ্যে আসল (Principal) ও সুদ (Interest) দুইই থাকে। মেয়াদ যত বেশি, মোট সুদ তত বেশি।',
    summaryEn: 'Each Equated Monthly Instalment combines principal and interest; longer tenure lowers monthly EMI but increases total interest.',
    points: [
      { bn: 'লুকানো প্রসেসিং ফি বা লেট পেমেন্ট চার্জ আগে জেনে নিন।', en: 'Check processing fees, late charges, and prepayment terms in writing before signing.' },
    ],
  },
  {
    id: 'digital-payments',
    titleBn: '৭. ডিজিটাল পেমেন্ট ও রসিদ সংরক্ষণ',
    titleEn: '7. Digital Payments',
    summaryBn: 'ইউপিআই বা ব্যাংক ট্রান্সফারের মাধ্যমে লেনদেন করলে প্রতিটি টাকার ডিজিটাল প্রমাণ থাকে।',
    summaryEn: 'UPI and bank transfers create verifiable transaction histories useful for household tracking and small businesses.',
    points: [
      { bn: 'টাকা পাঠানোর আগে প্রাপকের নাম স্ক্রিনে ভালোভাবে মিলিয়ে নিন।', en: 'Always double-check the verified recipient name displayed on screen before confirming payment.' },
    ],
  },
  {
    id: 'upi-safety',
    titleBn: '৮. ইউপিআই (UPI) নিরাপত্তা নিয়ম',
    titleEn: '8. UPI Safety Rules',
    summaryBn: 'টাকা পাওয়ার জন্য কখনোই UPI PIN দিতে হয় না বা QR কোড স্ক্যান করতে হয় না!',
    summaryEn: 'You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money.',
    points: [
      { bn: 'UPI PIN শুধুমাত্র অ্যাকাউন্ট থেকে টাকা কাটার (পাঠানোর) সময় লাগে।', en: 'Entering your UPI PIN ALWAYS deducts money from your bank account.' },
      { bn: 'অচেনা ব্যক্তির পাঠানো “Collect Request” বা লিঙ্কে ক্লিক করবেন না।', en: 'Decline unknown UPI Collect Requests immediately.' },
    ],
  },
  {
    id: 'fraud',
    titleBn: '৯. আর্থিক প্রতারণা প্রতিরোধ (Fraud Prevention)',
    titleEn: '9. Financial Fraud Prevention',
    summaryBn: 'ফোনে লটারি, কেওয়াইসি আপডেট, বা সরকারি ভাতার নামে ওটিপি বা স্ক্রিন-শেয়ার অ্যাপ চাইলে তা প্রতারণা।',
    summaryEn: 'Beware of KYC update threats, fake lottery calls, job registration fees, and screen-sharing apps.',
    points: [
      { bn: 'প্রতারণার শিকার হলে দ্রুত জাতীয় সাইবার ক্রাইম হেল্পলাইন ১৯৩০ (1930) বা cybercrime.gov.in-এ অভিযোগ করুন।', en: 'Report financial cyber fraud immediately on National Helpline 1930 or cybercrime.gov.in.' },
    ],
  },
  {
    id: 'investment',
    titleBn: '১০. মৌলিক বিনিয়োগ সচেতনতা (Basic Investment Awareness)',
    titleEn: '10. Basic Investment Awareness',
    summaryBn: '“অল্প দিনে টাকা দ্বিগুণ” বলা স্কিমগুলি প্রতারণা (Chit Fund / Ponzi)। নিরাপদ সরকারি সঞ্চয় প্রকল্প আগে বুঝুন।',
    summaryEn: 'Treat “double your money fast” offers as fraud. Understand regulated options like Post Office schemes, PPF, Sukanya Samriddhi, and bank FDs before exploring market products.',
    points: [
      { bn: 'শিক্ষামূলক বার্তা: আমরা কোনো নির্দিষ্ট বিনিয়োগের সুপারিশ বা নিশ্চিত রিটার্নের প্রতিশ্রুতি দিই না।', en: 'Educational note: We do not give personalized investment advice or promise guaranteed returns.' },
    ],
  },
];

function FinanceTabs({ active }: { active: 'hub' | 'budget' | 'savings' | 'emi' }) {
  const { navigate, language } = useApp();
  const tabs = [
    { id: 'hub', path: '/finance', label: language === 'bn' ? 'আর্থিক শিক্ষা গাইড' : 'Literacy Guides' },
    { id: 'budget', path: '/finance/budget', label: language === 'bn' ? 'বাজেট ক্যালকুলেটর' : 'Budget Calculator' },
    { id: 'savings', path: '/finance/savings', label: language === 'bn' ? 'সঞ্চয় ও লক্ষ্য' : 'Savings & Goals' },
    { id: 'emi', path: '/finance/emi', label: language === 'bn' ? 'ইএমআই ক্যালকুলেটর' : 'EMI Calculator' },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-white border border-[#E5E3DC] mb-8 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => navigate(tab.path)}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            active === tab.id
              ? 'bg-[#176B4D] text-white'
              : 'text-[#5C5C58] hover:text-[#252525] hover:bg-[#FAF9F5]'
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
    <p className="text-xs text-[#5C5C58] bg-[#F2F0E8] border border-[#E5E3DC] rounded-lg px-4 py-3 leading-relaxed">
      {language === 'bn'
        ? 'শিক্ষামূলক দাবিত্যাগ: এই ক্যালকুলেটর ও তথ্য কেবলমাত্র সাধারণ আর্থিক সচেতনতা ও ব্যক্তিগত পরিকল্পনার জন্য। এটি কোনো বিনিয়োগ পরামর্শ, নিশ্চিত মুনাফা বা ঋণের প্রতিশ্রুতি নয়। চূড়ান্ত হার ও শর্তের জন্য সংশ্লিষ্ট ব্যাংক বা পোস্ট অফিসে যাচাই করুন।'
        : 'Educational Disclaimer: All calculators and literacy guides on this platform are for general financial education and personal planning only. They do not constitute personalized investment advice, guaranteed returns, or a loan offer.'}
    </p>
  );
}

export function FinancialLiteracyHubPage() {
  const { language, navigate } = useApp();
  const [openTopic, setOpenTopic] = useState<string>('budgeting');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={
          language === 'bn'
            ? 'আর্থিক শিক্ষা ও সচেতনতা কেন্দ্র'
            : language === 'hi'
              ? 'वित्तीय साक्षरता और जागरूकता केंद्र'
              : 'Financial Literacy Centre'
        }
        subtitle={
          language === 'bn'
            ? 'সহজ বাংলা ও ইংরেজিতে সংসারের বাজেট, সঞ্চয়, ব্যাংকিং, সুদের হিসাব, ইএমআই এবং ইউপিআই প্রতারণা থেকে সুরক্ষার ১০টি জরুরি পাঠ ও ইন্টারেক্টিভ টুল।'
            : 'Ten essential money-management topics in simple Bengali & English paired with accurate interactive calculators for household budgeting, savings, and EMIs.'
        }
      />

      <FinanceTabs active="hub" />

      <div className="mb-8">
        <SafetyNotice />
      </div>

      {/* 3D Financial Literacy & UPI Safety Visual Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-7 rounded-xl overflow-hidden bg-white border border-[#E5E3DC] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.financeSavingsGrowth.src}
            alt={VISUAL_ASSETS.financeSavingsGrowth.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-4 border-t border-[#E5E3DC]">
            <h2 className="text-base font-bold text-[#252525]">
              {language === 'bn'
                ? 'নিয়মিত সঞ্চয়, বাজেট ও নিরাপদ ব্যাংকিং অভ্যাস'
                : 'Steady Savings, Household Budgeting & Regulated Banking'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5C58] mt-1">
              Build an emergency cushion step by step through transparent calculations — without relying on high-interest informal loans.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl bg-white border border-[#E5E3DC] p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-4">
            <ResilientImage
              src={VISUAL_ASSETS.financeUpiSecurity.src}
              alt={VISUAL_ASSETS.financeUpiSecurity.alt}
              containerClassName="w-full sm:w-40 lg:w-full aspect-[4/3] lg:aspect-[16/10] rounded-lg border border-[#E5E3DC]"
            />
            <div>
              <h2 className="text-base font-bold text-[#252525] inline-flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#B56A10] shrink-0" />
                <span>
                  {language === 'bn' ? 'ইউপিআই ও ডিজিটাল সুরক্ষা নিয়ম' : 'UPI & Digital Payment Safety'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5C58] mt-1.5 leading-relaxed">
                {language === 'bn'
                  ? 'টাকা পাওয়ার জন্য কখনোই UPI PIN দিতে হয় না বা QR কোড স্ক্যান করতে হয় না। প্রতারণার শিকার হলে ১৯৩০ নম্বরে ফোন করুন।'
                  : 'Never enter your UPI PIN or scan a QR code to receive money. Report financial cyber fraud immediately at National Helpline 1930.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/scam-check')}
              className="px-3.5 py-2 rounded-lg bg-[#176B4D] hover:bg-[#11533B] text-white text-xs font-semibold cursor-pointer"
            >
              {language === 'bn' ? 'সন্দেহজনক মেসেজ যাচাই করুন' : 'Check a Suspicious Message'}
            </button>
            <button
              type="button"
              onClick={() => setOpenTopic('upi-safety')}
              className="text-xs font-semibold text-[#176B4D] hover:underline cursor-pointer"
            >
              {language === 'bn' ? 'ইউপিআই সুরক্ষা পাঠ পড়ুন →' : 'Read UPI Safety Lesson →'}
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
            title: language === 'bn' ? 'মাসিক বাজেট ও ব্যয় বিশ্লেষণ' : 'Monthly Budget & Expense Chart',
            desc: 'Income vs. expense breakdown with interactive visual charts.',
          },
          {
            icon: PiggyBank,
            path: '/finance/savings',
            title: language === 'bn' ? 'সঞ্চয় ক্যালকুলেটর ও গোল ট্র্যাকার' : 'Savings Calculator & Goal Tracker',
            desc: 'Project recurring deposit growth and track family savings targets.',
          },
          {
            icon: Calculator,
            path: '/finance/emi',
            title: language === 'bn' ? 'ঋণের ইএমআই (EMI) ক্যালকুলেটর' : 'Loan EMI Calculator',
            desc: 'Compute accurate monthly EMI and total interest before borrowing.',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.path}
              type="button"
              onClick={() => navigate(card.path)}
              className="text-left p-6 rounded-xl bg-white border border-[#E5E3DC] hover:border-[#176B4D] transition-colors flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <Icon className="w-6 h-6 text-[#176B4D] mb-3" />
                <h2 className="text-base font-bold text-[#252525] group-hover:text-[#176B4D]">
                  {card.title}
                </h2>
                <p className="text-xs text-[#5C5C58] mt-1.5">{card.desc}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#176B4D]">
                Open Calculator <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      {/* 10 Bilingual Financial Literacy Modules */}
      <h2 className="text-xl sm:text-2xl font-bold text-[#252525] mb-5">
        {language === 'bn'
          ? '১০টি মৌলিক আর্থিক শিক্ষা পাঠ (বাংলা ও ইংরেজি)'
          : '10 Essential Financial Literacy Lessons (Bengali & English)'}
      </h2>

      <div className="space-y-3 mb-8">
        {LITERACY_TOPICS.map((topic) => {
          const isOpen = openTopic === topic.id;
          return (
            <div key={topic.id} className="rounded-xl bg-white border border-[#E5E3DC] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenTopic(isOpen ? '' : topic.id)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#FAF9F5] cursor-pointer"
              >
                <div>
                  <p className="text-base font-bold text-[#252525]">
                    {language === 'bn' ? topic.titleBn : topic.titleEn}
                  </p>
                  <p className="text-xs text-[#5C5C58] mt-0.5">
                    {language === 'bn' ? topic.titleEn : topic.titleBn}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-[#176B4D] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#85847C] shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-[#E5E3DC] space-y-3 bg-[#FAF9F5]/60">
                  <p className="text-sm text-[#252525] leading-relaxed">{topic.summaryBn}</p>
                  <p className="text-sm text-[#5C5C58] leading-relaxed">{topic.summaryEn}</p>
                  <ul className="space-y-2 pt-2">
                    {topic.points.map((pt, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-[#252525] pl-3 border-l border-[#176B4D]/40">
                        <span className="block font-medium">{pt.bn}</span>
                        <span className="block text-[#5C5C58] mt-0.5">{pt.en}</span>
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
    { name: language === 'bn' ? 'খাদ্য ও বাজার' : 'Food & Groceries', value: expenses.food },
    { name: language === 'bn' ? 'বাড়ি ও বিদ্যুৎ' : 'Housing & Utilities', value: expenses.housing },
    { name: language === 'bn' ? 'শিক্ষা' : 'Education', value: expenses.education },
    { name: language === 'bn' ? 'চিকিৎসা' : 'Healthcare', value: expenses.healthcare },
    { name: language === 'bn' ? 'যাতায়াত ও ফোন' : 'Transport & Mobile', value: expenses.transport },
    { name: language === 'bn' ? 'অন্যান্য' : 'Other Needs', value: expenses.other },
  ].filter((d) => d.value > 0);

  const summaryBars = [
    { name: language === 'bn' ? 'মাসিক আয়' : 'Est. Income', amount: monthlyIncome },
    { name: language === 'bn' ? 'মোট ব্যয়' : 'Total Expenses', amount: totalExpense },
    { name: language === 'bn' ? 'মাসিক সঞ্চয়' : 'Net Savings', amount: Math.max(0, netBalance) },
  ];

  const updateExp = (key: keyof typeof expenses, val: string) => {
    setExpenses((prev) => ({ ...prev, [key]: Math.max(0, Number(val) || 0) }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={
          language === 'bn'
            ? 'মাসিক ও দৈনিক মজুরি বাজেট ক্যালকুলেটর'
            : 'Household & Daily-Wage Budget Calculator'
        }
        subtitle={
          language === 'bn'
            ? 'নিয়মিত মাসিক বেতন অথবা দৈনিক মজুরি (অনিয়মিত আয়) — দুভাবেই আপনার সংসারের বাজেট ও জরুরি সঞ্চয় হিসাব করুন।'
            : 'Switch between Fixed Monthly Income and Daily-Wage / Irregular Income mode to plan safe household spending even during low-work weeks.'
        }
      />

      <FinanceTabs active="budget" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Inputs */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-5">
          {/* Income Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC]">
            <button
              type="button"
              onClick={() => setIncomeMode('monthly')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                incomeMode === 'monthly'
                  ? 'bg-[#176B4D] text-white'
                  : 'text-[#5C5C58] hover:text-[#252525]'
              }`}
            >
              {language === 'bn' ? 'মাসিক নির্দিষ্ট আয়' : 'Fixed Monthly Income'}
            </button>
            <button
              type="button"
              onClick={() => setIncomeMode('daily_wage')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                incomeMode === 'daily_wage'
                  ? 'bg-[#176B4D] text-white'
                  : 'text-[#5C5C58] hover:text-[#252525]'
              }`}
            >
              {language === 'bn' ? 'দৈনিক মজুরি / অনিয়মিত আয়' : 'Daily-Wage / Irregular'}
            </button>
          </div>

          {incomeMode === 'monthly' ? (
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                {language === 'bn' ? 'মোট মাসিক আয় (₹)' : 'Total Monthly Household Income (₹)'}
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={fixedMonthlyIncome}
                onChange={(e) => setFixedMonthlyIncome(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#E5E3DC] px-3.5 py-2.5 text-base font-mono font-semibold tabular-nums"
              />
            </div>
          ) : (
            <div className="space-y-3 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    {language === 'bn' ? 'দৈনিক মজুরি (₹)' : 'Daily Wage (₹)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={dailyWage}
                    onChange={(e) => setDailyWage(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-lg border border-[#D8D5CC] bg-white px-3 py-2 text-sm font-mono font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    {language === 'bn' ? 'মাসে গড় কাজের দিন' : 'Avg Work Days / Month'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={workDaysPerMonth}
                    onChange={(e) =>
                      setWorkDaysPerMonth(Math.min(31, Math.max(0, Number(e.target.value) || 0)))
                    }
                    className="w-full rounded-lg border border-[#D8D5CC] bg-white px-3 py-2 text-sm font-mono font-semibold tabular-nums"
                  />
                </div>
              </div>
              <div className="text-xs text-[#11533B] flex items-center justify-between pt-2 border-t border-[#E5E3DC]">
                <span>{language === 'bn' ? 'আনুমানিক মাসিক আয়:' : 'Estimated Monthly Income:'}</span>
                <span className="font-mono font-bold text-sm">
                  ₹{monthlyIncome.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-[#6B3F06] bg-[#FEF4E6] px-2.5 py-1.5 rounded-lg">
                {language === 'bn'
                  ? `বর্ষা বা কম কাজের মাসে (৫ দিন কম কাজ হলে) আয় নেমে আসতে পারে ₹${leanMonthIncome.toLocaleString('en-IN')}-এ। জরুরি তহবিল সরিয়ে রাখুন।`
                  : `Low-work month cushion (5 fewer work days): ₹${leanMonthIncome.toLocaleString('en-IN')}. Keep a buffer for lean weeks.`}
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-[#E5E3DC] space-y-3.5">
            <p className="text-xs font-semibold text-[#5C5C58]">
              {language === 'bn' ? 'মাসিক ব্যয়ের খাতসমূহ (₹)' : 'Monthly Expense Breakdown (₹)'}
            </p>
            {(
              [
                ['food', language === 'bn' ? 'খাদ্য ও বাজার (Food & Groceries)' : 'Food & Groceries'],
                ['housing', language === 'bn' ? 'বাড়ি ভাড়া ও বিদ্যুৎ (Housing & Bills)' : 'Housing & Utilities'],
                ['education', language === 'bn' ? 'পড়াশোনা (Education)' : 'Education'],
                ['healthcare', language === 'bn' ? 'চিকিৎসা ও ওষুধ (Healthcare)' : 'Healthcare & Medicine'],
                ['transport', language === 'bn' ? 'যাতায়াত ও মোবাইল (Transport & Phone)' : 'Transport & Mobile'],
                ['other', language === 'bn' ? 'অন্যান্য খরচ (Other Expenses)' : 'Other Expenses'],
              ] as [keyof typeof expenses, string][]
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <label className="text-sm text-[#252525]">{label}</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={expenses[key]}
                  onChange={(e) => updateExp(key, e.target.value)}
                  className="w-32 rounded-lg border border-[#E5E3DC] px-3 py-1.5 text-sm font-mono tabular-nums text-right"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Outputs & Charts */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Total Expenses</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#252525]">
                ₹{totalExpense.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">
                {netBalance >= 0 ? 'Monthly Surplus / Savings' : 'Monthly Deficit'}
              </p>
              <p
                className={`mt-1.5 text-2xl font-bold font-mono tabular-nums ${
                  netBalance >= 0 ? 'text-[#176B4D]' : 'text-red-700'
                }`}
              >
                {netBalance < 0 ? '-' : ''}₹{Math.abs(netBalance).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Savings Rate</p>
              <p
                className={`mt-1.5 text-2xl font-bold font-mono tabular-nums ${
                  savingsRate >= 20 ? 'text-[#176B4D]' : savingsRate > 0 ? 'text-[#B56A10]' : 'text-red-700'
                }`}
              >
                {savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <h3 className="text-sm font-bold text-[#252525] mb-3">Expense Breakdown Visualizer</h3>
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

            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <h3 className="text-sm font-bold text-[#252525] mb-3">Income vs. Expense Overview</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summaryBars}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DC" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                    <Bar dataKey="amount" fill="#176B4D" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#EBF4F0] border border-[#176B4D]/20 text-sm text-[#11533B]">
            {netBalance < 0
              ? 'Warning: Your expenses currently exceed your monthly income. Review non-essential items to avoid high-interest borrowing.'
              : savingsRate >= 20
                ? 'Strong discipline: Saving 20%+ of monthly income helps build a reliable household emergency reserve.'
                : 'Good start: Even saving 10%–15% regularly in a bank or post office account builds strong resilience over 12–24 months.'}
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
  const [goalMonthly, setGoalMonthly] = useState('1500');
  const [goalDate, setGoalDate] = useState('2027-12-31');

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

    rows.push({ year: 'Start', invested: Math.round(totalInvested), totalValue: Math.round(balance) });

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        balance = (balance + monthlyDeposit) * (1 + r);
        totalInvested += monthlyDeposit;
      }
      rows.push({
        year: `Yr ${y}`,
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
  }, [initialAmount, monthlyDeposit, annualRate, years]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      showToast('Please sign in to save personal savings goals to your dashboard.');
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
      showToast('Savings goal added to your dashboard.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save goal.');
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
        title={language === 'bn' ? 'সঞ্চয় ক্যালকুলেটর ও লক্ষ্য ট্র্যাকার' : 'Savings Calculator & Goal Tracker'}
        subtitle={
          language === 'bn'
            ? 'মাসিক নিয়মিত সঞ্চয়ে সময়ের সাথে কত তহবিল তৈরি হবে তা হিসাব করুন এবং পরিবারের সঞ্চয়ের লক্ষ্য ট্র্যাক করুন।'
            : 'Estimate how steady monthly deposits grow with monthly compounding, and track real household savings goals.'
        }
      />

      <FinanceTabs active="savings" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Initial Saved Amount (₹)
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={initialAmount}
              onChange={(e) => setInitialAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Monthly Savings Contribution (₹)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label>Illustrative Annual Rate (%)</label>
              <span className="font-mono tabular-nums text-[#176B4D]">{annualRate}%</span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              step={0.1}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-[#176B4D]"
            />
            <p className="text-[11px] text-[#85847C] mt-1">
              Illustrative only (e.g., Bank/Post Office RD rates vary by bank notification).
            </p>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label>Duration (Years)</label>
              <span className="font-mono tabular-nums text-[#176B4D]">{years} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-[#176B4D]"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Total Deposited</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#252525]">
                ₹{projection.totalInvested.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Estimated Interest</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#B56A10]">
                ₹{projection.interestEarned.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Projected Value</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#176B4D]">
                ₹{projection.maturityValue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
            <h3 className="text-sm font-bold text-[#252525] mb-3">Savings Growth Curve</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DC" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                  <Area
                    type="monotone"
                    dataKey="totalValue"
                    name="Projected Value"
                    stroke="#176B4D"
                    fill="#176B4D"
                    fillOpacity={0.18}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    name="Total Deposited"
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
      <section className="p-6 rounded-xl bg-white border border-[#E5E3DC] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E3DC] mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#252525]">Personal Savings Goal Tracker</h2>
            <p className="text-xs text-[#5C5C58]">
              Track emergency funds, school fees, or small business seed savings.
            </p>
          </div>
          {!user && (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-xs font-semibold text-[#176B4D] hover:underline cursor-pointer"
            >
              Sign in to save goals permanently →
            </button>
          )}
        </div>

        <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
          <input
            required
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            placeholder="Goal (e.g. Sewing Machine)"
            className="sm:col-span-2 rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={100}
            value={goalTarget}
            onChange={(e) => setGoalTarget(e.target.value)}
            placeholder="Target ₹"
            className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
          />
          <input
            type="number"
            min={0}
            value={goalSaved}
            onChange={(e) => setGoalSaved(e.target.value)}
            placeholder="Saved ₹"
            className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </form>

        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.savedAmount / Math.max(1, g.targetAmount)) * 100));
              return (
                <div key={g.id} className="p-4 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm text-[#252525]">{g.title}</p>
                    <p className="font-mono text-xs tabular-nums text-[#176B4D] font-semibold">
                      ₹{g.savedAmount.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')} ({pct}%)
                    </p>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#E5E3DC] overflow-hidden mb-3">
                    <div
                      className="h-full bg-[#176B4D] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleIncrementGoal(g, 500)}
                      className="px-3 py-1 rounded-md bg-white border border-[#E5E3DC] text-[#176B4D] font-semibold hover:bg-[#EBF4F0] cursor-pointer"
                    >
                      + Log ₹500 Saved
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-[#85847C] hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#85847C]">
            {user
              ? 'No savings goals added yet. Create your first target above.'
              : 'Sign in with a free community account to store and update savings goals.'}
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
    { name: language === 'bn' ? 'আসল টাকা (Principal)' : 'Principal Amount', value: Math.round(principal) },
    { name: language === 'bn' ? 'মোট সুদ (Total Interest)' : 'Total Interest', value: Math.round(result.totalInterest) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={language === 'bn' ? 'ইএমআই (EMI) ও ঋণ ক্যালকুলেটর' : 'Loan EMI & Interest Calculator'}
        subtitle={
          language === 'bn'
            ? 'যেকোনো ঋণ নেওয়ার আগে মাসিক কিস্তি (EMI), মোট সুদ এবং মোট পরিশোধযোগ্য টাকার সঠিক হিসাব জানুন।'
            : 'Calculate exact Equated Monthly Instalments (reducing-balance formula) and total interest before committing to any formal bank loan.'
        }
      />

      <FinanceTabs active="emi" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Loan Amount (Principal ₹)</label>
            <input
              type="number"
              min={1000}
              step={5000}
              value={principal}
              onChange={(e) => setPrincipal(Math.max(1000, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label>Annual Interest Rate (%)</label>
              <span className="font-mono tabular-nums text-[#176B4D]">{annualInterest}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={0.25}
              value={annualInterest}
              onChange={(e) => setAnnualInterest(Number(e.target.value))}
              className="w-full accent-[#176B4D]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label>Repayment Tenure (Months)</label>
              <span className="font-mono tabular-nums text-[#176B4D]">
                {tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} yrs)
              </span>
            </div>
            <input
              type="range"
              min={6}
              max={120}
              step={6}
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full accent-[#176B4D]"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-[#FEF4E6] border border-[#F4A340]/40 text-xs text-[#6B3F06] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#B56A10] shrink-0 mt-0.5" />
            <span>
              Responsible borrowing check: Keep your total monthly EMI under 30% of your household’s
              reliable monthly income.
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Monthly EMI</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#176B4D]">
                ₹{Math.round(result.emi).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Total Interest</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#B56A10]">
                ₹{Math.round(result.totalInterest).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Total Amount Payable</p>
              <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#252525]">
                ₹{Math.round(result.totalPayable).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E5E3DC]">
            <h3 className="text-sm font-bold text-[#252525] mb-3">Principal vs. Interest Share</h3>
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
                    <Cell fill="#176B4D" />
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
