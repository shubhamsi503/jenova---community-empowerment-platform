import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  Plus,
  Printer,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../i18n/translations';
import type {
  ActionPassportCategory,
  ActionPassportGoal,
  ActionPassportStatus,
} from '../types/platform';
import { PageHeader, SafetyNotice } from '../components/SharedUI';

const STATUS_OPTIONS: ActionPassportStatus[] = [
  'Not Started',
  'In Progress',
  'Ready for Next Step',
  'Action Taken',
  'User Reported Completed',
];

function localizeStatus(status: ActionPassportStatus, language: 'bn' | 'hi' | 'en'): string {
  switch (status) {
    case 'Not Started':
      return tr(language, 'শুরু হয়নি', 'शुरू नहीं हुआ', 'Not Started');
    case 'In Progress':
      return tr(language, 'চলমান', 'प्रगति पर', 'In Progress');
    case 'Ready for Next Step':
      return tr(language, 'পরবর্তী ধাপের জন্য প্রস্তুত', 'अगले कदम के लिए तैयार', 'Ready for Next Step');
    case 'Action Taken':
      return tr(language, 'পদক্ষেপ নেওয়া হয়েছে', 'कदम उठाया गया', 'Action Taken');
    case 'User Reported Completed':
      return tr(language, 'সম্পন্ন (ব্যবহারকারী চিহ্নিত)', 'पूर्ण (उपयोगकर्ता द्वारा)', 'User Reported Completed');
  }
}

interface GoalTemplate {
  id: string;
  category: ActionPassportCategory;
  title: { bn: string; hi: string; en: string };
  linkedPath: string;
  officialUrl?: string;
  steps: { bn: string; hi: string; en: string }[];
  docs: { bn: string; hi: string; en: string }[];
}

const TEMPLATES: GoalTemplate[] = [
  {
    id: 'tpl-tailoring',
    category: 'business',
    title: {
      bn: 'গৃহভিত্তিক সেলাই ও পোশাক ব্যবসা শুরু',
      hi: 'घरेलू सिलाई और परिधान व्यवसाय की शुरुआत',
      en: 'Start a Home-Based Tailoring & Garment Business',
    },
    linkedPath: '/msme/planner',
    officialUrl: 'https://udyamregistration.gov.in/',
    steps: [
      { bn: 'কাছাকাছি ১০–১৫ জন প্রতিবেশীর সাথে চাহিদা ও দাম নিয়ে কথা বলুন', hi: 'आसपास के 10–15 ग्राहकों से मांग और दरों पर बात करें', en: 'Speak with 10–15 local neighbours about stitching needs & fair rates' },
      { bn: 'MSME প্ল্যানারে সেলাই মেশিন, সুতো ও মাসিক খরচের হিসাব তৈরি করুন', hi: 'MSME प्लानर में मशीन, सामग्री और मासिक लागत की गणना करें', en: 'Calculate machine, fabric supplies & break-even in Business Plan Builder' },
      { bn: 'JENOVA UDAAN-এর বিজনেস প্ল্যান ও MSME মডিউল অনুশীলন করুন', hi: 'JENOVA UDAAN का बिज़नेस प्लान और MSME मॉड्यूल पूरा करें', en: 'Complete JENOVA UDAAN Business Plan & MSME modules' },
      { bn: 'udyamregistration.gov.in-এ বিনামূল্যে (₹০) উদ্যম নিবন্ধন যাচাই করুন', hi: 'udyamregistration.gov.in पर निःशुल्क उद्यम पंजीकरण समझें', en: 'Explore free (₹0) Udyam registration on udyamregistration.gov.in' },
      { bn: 'সরকারি PMEGP / PMMY সহায়তা ও নিকটস্থ BSK/ব্যাংক শাখায় যাচাই করুন', hi: 'PMEGP / PMMY सहायता के लिए आधिकारिक पोर्टल या बैंक से जानकारी लें', en: 'Verify official PMEGP / MUDRA eligibility with bank or official portal' },
    ],
    docs: [
      { bn: 'আধার ও প্যান কার্ড (উদ্যম ও ব্যাংক KYC-র জন্য)', hi: 'आधार और पैन कार्ड (उद्यम व बैंक KYC के लिए)', en: 'Aadhaar & PAN Card (for free Udyam & bank KYC)' },
      { bn: 'সক্রিয় ব্যাংক পাসবুক', hi: 'सक्रिय बैंक पासबुक', en: 'Active Bank Passbook' },
      { bn: '১-পাতার ব্যবসার খরচের হিসাব (JENOVA থেকে প্রিন্ট)', hi: '1-पेज व्यवसाय लागत योजना (JENOVA से प्रिंट)', en: '1-Page Startup Cost & Pricing Sheet (printed from JENOVA)' },
    ],
  },
  {
    id: 'tpl-job-ready',
    category: 'job',
    title: {
      bn: 'চাকরি ও ইন্টারভিউ প্রস্তুতি পরিকল্পনা',
      hi: 'नौकरी और इंटरव्यू तैयारी कार्य योजना',
      en: 'Job Readiness & Interview Action Plan',
    },
    linkedPath: '/udaan/udaan-interview-prep',
    officialUrl: 'https://employmentbankwb.gov.in/',
    steps: [
      { bn: '১-মিনিট বায়োডাটা বিল্ডার দিয়ে পরিষ্কার CV তৈরি ও প্রিন্ট করুন', hi: '1-मिनट बायोडाटा बिल्डर से साफ बायोडाटा बनाएं', en: 'Build and print a clean resume in 1-Minute Biodata Builder' },
      { bn: 'JENOVA UDAAN ইন্টারভিউ প্রস্তুতি মডিউল ও AI অনুশীলন সম্পন্ন করুন', hi: 'JENOVA UDAAN इंटरव्यू तैयारी मॉड्यूल और अभ्यास पूरा करें', en: 'Complete JENOVA UDAAN Interview Prep module & practice intro' },
      { bn: 'পশ্চিমবঙ্গ Employment Bank (employmentbankwb.gov.in) বা NCS-এ নাম নথিভুক্ত করুন', hi: 'Employment Bank या NCS (ncs.gov.in) पर पंजीकरण जांचें', en: 'Check registration on Employment Bank WB or National Career Service (ncs.gov.in)' },
      { bn: 'কোনো চাকরির অফারে অগ্রিম ফি চাইলে JENOVA Protect-এ যাচাই করুন', hi: 'किसी ऑफर में अग्रिम शुल्क मांगने पर JENOVA Protect में जांच करें', en: 'Verify any suspicious job call/message in JENOVA Protect' },
    ],
    docs: [
      { bn: 'বায়োডাটার ২টি প্রিন্ট কপি', hi: 'बायोडाटा की 2 प्रिंट कॉपी', en: '2 Printed Copies of Biodata' },
      { bn: 'শিক্ষাগত ও দক্ষতা সার্টিফিকেটের ফটোকপি', hi: 'शैक्षणिक व कौशल प्रमाणपत्र की फोटोकॉपी', en: 'Photocopies of Education & Skill Certificates' },
      { bn: '২ কপি পাসপোর্ট সাইজ ছবি', hi: '2 पासपोर्ट साइज फोटो', en: '2 Passport-Size Photographs' },
    ],
  },
  {
    id: 'tpl-scheme',
    category: 'scheme',
    title: {
      bn: 'সরকারি প্রকল্প আবেদন প্রস্তুতি',
      hi: 'सरकारी योजना आवेदन तैयारी',
      en: 'Government Welfare Scheme Application Prep',
    },
    linkedPath: '/schemes',
    officialUrl: 'https://myscheme.gov.in/',
    steps: [
      { bn: 'JENOVA Schemes-এ প্রকল্পের যোগ্যতা ও অফিসিয়াল পোর্টাল পড়ুন', hi: 'JENOVA Schemes में पात्रता और आधिकारिक पोर्टल पढ़ें', en: 'Review eligibility criteria and official .gov.in portal on JENOVA Schemes' },
      { bn: 'JENOVA Checklist-এ সমস্ত প্রয়োজনীয় কাগজপত্র মিলিয়ে নিন', hi: 'JENOVA Checklist में सभी आवश्यक दस्तावेज़ जांचें', en: 'Verify every required paper in JENOVA Checklist' },
      { bn: 'নিকটস্থ বাংলা সহায়তা কেন্দ্র (BSK) বা BDO অফিসে অফিসিয়াল আবেদন জমা দিন', hi: 'निकटतम BSK / CSC या आधिकारिक पोर्टल से आवेदन करें', en: 'Apply via official portal or verified local BSK / CSC helpdesk' },
    ],
    docs: [
      { bn: 'আধার ও ঠিকানার প্রমাণপত্র', hi: 'आधार और पते का प्रमाण', en: 'Aadhaar & Address Proof' },
      { bn: 'DBT-সংযুক্ত ব্যাংক পাসবুক', hi: 'DBT-लिंक बैंक पासबुक', en: 'DBT-Linked Bank Passbook' },
      { bn: 'প্রয়োজনীয় আয় / জাতি / বয়সের শংসাপত্র', hi: 'आवश्यक आय / जाति / आयु प्रमाणपत्र', en: 'Applicable Income / Category / Age Certificate' },
    ],
  },
];

export function ActionPassportPage() {
  const {
    language,
    navigate,
    passportGoals,
    addPassportGoal,
    updatePassportGoal,
    deletePassportGoal,
  } = useApp();

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<ActionPassportCategory>('skill');
  const [customStepsText, setCustomStepsText] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customReminder, setCustomReminder] = useState('');

  const handleCreateFromTemplate = async (tpl: GoalTemplate) => {
    await addPassportGoal({
      title: tr(language, tpl.title.bn, tpl.title.hi, tpl.title.en),
      category: tpl.category,
      linkedPath: tpl.linkedPath,
      officialUrl: tpl.officialUrl,
      steps: tpl.steps.map((s, idx) => ({
        id: `st-${idx + 1}`,
        title: tr(language, s.bn, s.hi, s.en),
        done: false,
      })),
      documentsChecklist: tpl.docs.map((d, idx) => ({
        id: `doc-${idx + 1}`,
        label: tr(language, d.bn, d.hi, d.en),
        ready: false,
      })),
    });
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    const steps = customStepsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((line, idx) => ({ id: `st-${idx + 1}`, title: line, done: false }));

    await addPassportGoal({
      title: customTitle.trim(),
      category: customCategory,
      steps:
        steps.length > 0
          ? steps
          : [
              {
                id: 'st-1',
                title: tr(
                  language,
                  'প্রথম বাস্তব পদক্ষেপ নির্ধারণ করুন',
                  'पहला व्यावहारिक कदम तय करें',
                  'Define your first practical action step'
                ),
                done: false,
              },
            ],
      notes: customNotes.trim(),
      reminderDate: customReminder,
    });
    setCustomTitle('');
    setCustomStepsText('');
    setCustomNotes('');
    setCustomReminder('');
    setShowCustomForm(false);
  };

  const toggleStep = async (goal: ActionPassportGoal, stepId: string) => {
    const nextSteps = goal.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
    const doneCount = nextSteps.filter((s) => s.done).length;
    const nextStatus: ActionPassportStatus =
      doneCount === 0
        ? 'Not Started'
        : doneCount === nextSteps.length
          ? 'Ready for Next Step'
          : 'In Progress';
    await updatePassportGoal(goal.id, { steps: nextSteps, status: nextStatus });
  };

  const toggleDoc = async (goal: ActionPassportGoal, docId: string) => {
    const nextDocs = goal.documentsChecklist.map((d) =>
      d.id === docId ? { ...d, ready: !d.ready } : d
    );
    await updatePassportGoal(goal.id, { documentsChecklist: nextDocs });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title={tr(
          language,
          'JENOVA অ্যাকশন পাসপোর্ট',
          'JENOVA एक्शन पासपोर्ट',
          'JENOVA Action Passport'
        )}
        subtitle={tr(
          language,
          'তথ্যকে বাস্তব পদক্ষেপে রূপান্তর করুন — দক্ষতা শেখা, UDAAN প্রশিক্ষণ, ছোট ব্যবসা, চাকরি বা সরকারি প্রকল্পের প্রতিটি ধাপ, নথি ও নোট এক জায়গায় ট্র্যাক করুন।',
          'जानकारी को वास्तविक कदमों में बदलें — कौशल, UDAAN प्रशिक्षण, लघु व्यवसाय, नौकरी या सरकारी योजना के हर चरण व दस्तावेज़ को एक जगह ट्रैक करें।',
          'Turn information into structured real-world action — track step-by-step tasks, document readiness, official links, personal notes, and honest progress statuses for every goal.'
        )}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-[#F2DCC1] text-[#26364B] hover:border-[#F4A340] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{tr(language, 'প্রিন্ট করুন', 'प्रिंट करें', 'Print Plan')}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCustomForm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold jenova-saffron-btn cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{tr(language, 'নতুন লক্ষ্য তৈরি করুন', 'नया लक्ष्य बनाएं', 'New Action Goal')}</span>
            </button>
          </div>
        }
      />

      <SafetyNotice
        message={tr(
          language,
          'সততা ও গোপনীয়তা নোট: অ্যাকশন পাসপোর্ট আপনার ব্যক্তিগত পরিকল্পনার খাতা। এখানে কখনোই আধার নম্বর, ব্যাংক অ্যাকাউন্ট নম্বর বা OTP লিখবেন না। সরকারি আবেদন কেবল অফিসিয়াল .gov.in পোর্টাল বা BSK-তে সম্পন্ন হয়।',
          'गोपनीयता सूचना: एक्शन पासपोर्ट आपकी व्यक्तिगत योजना डायरी है। यहां कभी आधार, बैंक नंबर या OTP न लिखें। सरकारी आवेदन केवल आधिकारिक .gov.in पोर्टल या BSK पर जमा होते हैं।',
          'Honest Status & Privacy Note: Action Passport is your private execution tracker. Never enter Aadhaar numbers, bank numbers, or OTPs in notes. Official applications happen only on verified .gov.in portals or citizen centres.'
        )}
      />

      {/* Ready-to-Use Action Plan Templates */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-[#26364B] dark:text-white uppercase tracking-wide">
          {tr(
            language,
            '১-ক্লিকে প্রস্তুত অ্যাকশন প্ল্যান শুরু করুন',
            '1-क्लिक में तैयार कार्य योजना शुरू करें',
            'Start a Guided Action Plan in One Click'
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-white/15 flex flex-col justify-between gap-3"
            >
              <div>
                <p className="text-[11px] font-bold uppercase text-[#A85B0A] dark:text-[#FFD19A]">
                  {tpl.steps.length} {tr(language, 'ধাপ', 'चरण', 'Steps')} · {tpl.docs.length}{' '}
                  {tr(language, 'নথি', 'दस्तावेज़', 'Docs')}
                </p>
                <h3 className="text-sm font-bold text-[#26364B] dark:text-white mt-1">
                  {tr(language, tpl.title.bn, tpl.title.hi, tpl.title.en)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleCreateFromTemplate(tpl)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#FFE5C2] dark:bg-[#382616] text-[#26364B] dark:text-[#FFD19A] hover:bg-[#F4A340] hover:text-[#26364B] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tr(language, 'পাসপোর্টে যোগ করুন', 'पासपोर्ट में जोड़ें', 'Add to My Passport')}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Goal Form */}
      {showCustomForm && (
        <form
          onSubmit={handleCreateCustom}
          className="p-6 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F4A340]/40 space-y-4"
        >
          <h2 className="text-base font-bold text-[#26364B] dark:text-white">
            {tr(language, 'নিজের অ্যাকশন প্ল্যান তৈরি করুন', 'अपनी कार्य योजना बनाएं', 'Create a Custom Action Plan')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">
                {tr(language, 'লক্ষ্যের নাম *', 'लक्ष्य का शीर्षक *', 'Goal Title *')}
              </label>
              <input
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={tr(
                  language,
                  'যেমন: কম্পিউটার কোর্স শেষ করে ডেটা এন্ট্রি কাজ খোঁজা',
                  'जैसे: कंप्यूटर कोर्स पूरा कर डेटा एंट्री नौकरी पाना',
                  'e.g. Complete computer course & apply for office assistant roles'
                )}
                className="w-full rounded-lg border border-[#F2DCC1] dark:border-white/15 bg-[#FFF1DF] dark:bg-[#18120C] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(language, 'বিভাগ', 'श्रेणी', 'Category')}
              </label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as ActionPassportCategory)}
                className="w-full rounded-lg border border-[#F2DCC1] dark:border-white/15 bg-[#FFF1DF] dark:bg-[#18120C] px-3 py-2 text-sm"
              >
                <option value="skill">{tr(language, 'দক্ষতা শেখা', 'कौशल सीखना', 'Learn a Skill')}</option>
                <option value="training">{tr(language, 'UDAAN প্রশিক্ষণ', 'UDAAN प्रशिक्षण', 'Training Programme')}</option>
                <option value="business">{tr(language, 'ছোট ব্যবসা', 'छोटा व्यवसाय', 'Small Business')}</option>
                <option value="scheme">{tr(language, 'সরকারি প্রকল্প', 'सरकारी योजना', 'Government Scheme')}</option>
                <option value="job">{tr(language, 'চাকরি ও ইন্টারভিউ', 'नौकरी तैयारी', 'Job Application')}</option>
                <option value="documents">{tr(language, 'ব্যবসা/প্রকল্প নথি', 'दस्तावेज़ तैयारी', 'Business / Official Documents')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {tr(language, 'ধাপসমূহ (প্রতি লাইনে একটি ধাপ লিখুন)', 'चरण (प्रति पंक्ति एक कदम लिखें)', 'Action Steps (one per line)')}
            </label>
            <textarea
              rows={3}
              value={customStepsText}
              onChange={(e) => setCustomStepsText(e.target.value)}
              placeholder={tr(
                language,
                'ধাপ ১: ...\nধাপ ২: ...\nধাপ ৩: ...',
                'चरण 1: ...\nचरण 2: ...\nचरण 3: ...',
                'Step 1: ...\nStep 2: ...\nStep 3: ...'
              )}
              className="w-full rounded-lg border border-[#F2DCC1] dark:border-white/15 bg-[#FFF1DF] dark:bg-[#18120C] px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(language, 'ব্যক্তিগত নোট (ঐচ্ছিক)', 'व्यक्तिगत नोट्स (वैकल्पिक)', 'Personal Notes (Optional)')}
              </label>
              <input
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full rounded-lg border border-[#F2DCC1] dark:border-white/15 bg-[#FFF1DF] dark:bg-[#18120C] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(language, 'পরবর্তী রিমাইন্ডার তারিখ (ঐচ্ছিক)', 'रिमाइंडर तिथि (वैकल्पिक)', 'Target Review Date (Optional)')}
              </label>
              <input
                type="date"
                value={customReminder}
                onChange={(e) => setCustomReminder(e.target.value)}
                className="w-full rounded-lg border border-[#F2DCC1] dark:border-white/15 bg-[#FFF1DF] dark:bg-[#18120C] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-4 py-2 text-xs font-semibold text-[#454545] cursor-pointer"
            >
              {tr(language, 'বাতিল', 'रद्द करें', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold jenova-saffron-btn cursor-pointer"
            >
              {tr(language, 'লক্ষ্য সংরক্ষণ করুন', 'लक्ष्य सहेजें', 'Save Action Goal')}
            </button>
          </div>
        </form>
      )}

      {/* Active Action Passport Goals */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#26364B] dark:text-white inline-flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A]" />
          <span>
            {tr(
              language,
              `আমার সক্রিয় অ্যাকশন প্ল্যান (${passportGoals.length})`,
              `मेरी सक्रिय कार्य योजनाएं (${passportGoals.length})`,
              `My Active Action Plans (${passportGoals.length})`
            )}
          </span>
        </h2>

        {passportGoals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-white/15 text-center space-y-2">
            <p className="text-sm font-semibold text-[#26364B] dark:text-white">
              {tr(
                language,
                'এখনো কোনো অ্যাকশন প্ল্যান যোগ করা হয়নি।',
                'अभी तक कोई कार्य योजना नहीं जोड़ी गई है।',
                'No Action Passport goals yet.'
              )}
            </p>
            <p className="text-xs text-[#454545] dark:text-[#DDD2C5]">
              {tr(
                language,
                'উপরের যেকোনো টেমপ্লেট বেছে নিন অথবা UDAAN, প্রকল্প বা বিজনেস প্ল্যান পেজ থেকে এক ক্লিকে যোগ করুন।',
                'ऊपर दिए किसी भी टेम्पलेट को चुनें या UDAAN, योजना या बिज़नेस प्लान से जोड़ें।',
                'Pick one of the ready templates above, or add a goal directly from JENOVA UDAAN or the Business Plan Builder.'
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {passportGoals.map((goal) => {
              const totalSteps = Math.max(1, goal.steps.length);
              const doneSteps = goal.steps.filter((s) => s.done).length;
              const pct = Math.round((doneSteps / totalSteps) * 100);

              return (
                <article
                  key={goal.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-white/15 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#FFE5C2] dark:bg-[#382616] text-[#26364B] dark:text-[#FFD19A]">
                          {goal.category}
                        </span>
                        {goal.reminderDate && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#454545] dark:text-[#A8CBEB]">
                            <Calendar className="w-3 h-3" />
                            {goal.reminderDate}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#26364B] dark:text-white">
                        {goal.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={goal.status}
                        onChange={(e) =>
                          updatePassportGoal(goal.id, {
                            status: e.target.value as ActionPassportStatus,
                          })
                        }
                        aria-label="Action status"
                        className="rounded-lg border border-[#F2DCC1] dark:border-white/15 bg-[#FFF1DF] dark:bg-[#18120C] px-2.5 py-1.5 text-xs font-semibold"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {localizeStatus(st, language)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => deletePassportGoal(goal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                        aria-label={tr(language, 'মুছে ফেলুন', 'हटाएं', 'Delete goal')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#454545] dark:text-[#DDD2C5]">
                        {doneSteps}/{goal.steps.length} {tr(language, 'ধাপ সম্পন্ন', 'चरण पूर्ण', 'steps completed')}
                      </span>
                      <span className="font-mono text-[#A85B0A] dark:text-[#FFD19A]">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FFE5C2] dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#F4A340]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Steps & Documents */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-7 space-y-2">
                      <p className="text-xs font-bold text-[#26364B] dark:text-white">
                        {tr(language, 'ধাপে ধাপে কাজ', 'चरण-दर-चरण कार्य', 'Step-by-Step Tasks')}
                      </p>
                      {goal.steps.map((step) => (
                        <label
                          key={step.id}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FFF1DF] dark:bg-[#18120C] border border-[#F2DCC1] dark:border-white/10 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={step.done}
                            onChange={() => toggleStep(goal, step.id)}
                            className="mt-0.5 accent-[#F4A340]"
                          />
                          <span className={step.done ? 'line-through text-[#665B4F]' : 'text-[#26364B] dark:text-[#DCEEFF]'}>
                            {step.title}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="lg:col-span-5 space-y-3">
                      {goal.documentsChecklist.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-[#26364B] dark:text-white inline-flex items-center gap-1.5">
                            <FileCheck2 className="w-3.5 h-3.5 text-[#A85B0A] dark:text-[#FFD19A]" />
                            <span>{tr(language, 'নথির প্রস্তুতি', 'दस्तावेज़ तैयारी', 'Document Checklist')}</span>
                          </p>
                          {goal.documentsChecklist.map((doc) => (
                            <label
                              key={doc.id}
                              className="flex items-start gap-2 text-xs cursor-pointer text-[#454545] dark:text-[#DDD2C5]"
                            >
                              <input
                                type="checkbox"
                                checked={doc.ready}
                                onChange={() => toggleDoc(goal, doc.id)}
                                className="mt-0.5 accent-[#F4A340]"
                              />
                              <span className={doc.ready ? 'line-through text-[#27845B] dark:text-[#45B884]' : ''}>
                                {doc.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-[#26364B] dark:text-white mb-1">
                          {tr(language, 'আমার নোট', 'मेरे नोट्स', 'Personal Notes')}
                        </label>
                        <textarea
                          rows={2}
                          value={goal.notes}
                          onChange={(e) => updatePassportGoal(goal.id, { notes: e.target.value })}
                          placeholder={tr(language, 'কাজের নোট লিখুন...', 'अपना नोट लिखें...', 'Add progress notes...')}
                          className="w-full rounded-lg border border-[#F2DCC1] dark:border-white/15 bg-[#FFF1DF] dark:bg-[#18120C] px-2.5 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Links Footer */}
                  <div className="pt-3 border-t border-[#F2DCC1] dark:border-white/10 flex flex-wrap items-center gap-3 text-xs">
                    {goal.linkedPath && (
                      <button
                        type="button"
                        onClick={() => navigate(goal.linkedPath!)}
                        className="inline-flex items-center gap-1 font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{tr(language, 'সম্পর্কিত JENOVA টুল খুলুন', 'संबंधित JENOVA टूल खोलें', 'Open Related JENOVA Tool')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {goal.officialUrl && /^https?:\/\//i.test(goal.officialUrl) && (
                      <a
                        href={goal.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#26364B] dark:text-[#FFD19A] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{tr(language, 'অফিসিয়াল পোর্টাল', 'आधिकारिक पोर्टल', 'Official Portal')}</span>
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
