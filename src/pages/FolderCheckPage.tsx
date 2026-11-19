import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  HelpCircle,
  MapPin,
  Printer,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  apiFetch,
  buildWhatsAppShareUrl,
  readOfflineCache,
  trackAnalyticsEvent,
  writeOfflineCache,
} from '../lib/api';
import { pickText } from '../i18n/translations';
import type { EligibilityVerdict, WelfareScheme } from '../types/platform';
import { PageHeader, SafetyNotice, VerificationLabel } from '../components/SharedUI';
import { ReadAloudButton } from '../components/VoiceAccessibility';

type DocState = 'ready' | 'missing' | 'not_applicable' | 'need_help';

interface ChecklistPreset {
  id: string;
  titleBn: string;
  titleEn: string;
  titleHi: string;
  summaryBn: string;
  summaryEn: string;
  summaryHi: string;
  officialPortalUrl: string;
  sourceName: string;
  lastVerifiedDate: string;
  documents: {
    bn: string;
    en: string;
    hi: string;
    tipBn: string;
    tipEn: string;
    optional?: boolean;
  }[];
  isScheme?: boolean;
  scheme?: WelfareScheme;
}

const EXTRA_PRESETS: ChecklistPreset[] = [
  {
    id: 'preset-udyam',
    titleBn: 'উদ্যম (Udyam) MSME নিবন্ধন',
    titleEn: 'Udyam MSME Registration (Free Govt Portal)',
    titleHi: 'उद्यम (Udyam) MSME पंजीकरण',
    summaryBn: 'ক্ষুদ্র ব্যবসা, দোকান বা স্বনির্ভর উদ্যোগের সরকারি নিবন্ধন — সম্পূর্ণ বিনামূল্যে।',
    summaryEn: 'Free official Government of India MSME registration for shops, workshops, and home businesses.',
    summaryHi: 'छोटे व्यवसाय या दुकान के लिए निःशुल्क आधिकारिक MSME पंजीकरण।',
    officialPortalUrl: 'https://udyamregistration.gov.in/',
    sourceName: 'Ministry of MSME, Govt. of India',
    lastVerifiedDate: '2026-03-01',
    documents: [
      {
        bn: 'আধার কার্ড (মোবাইল নম্বর লিঙ্ক করা)',
        en: 'Aadhaar Card linked with active mobile number',
        hi: 'मोबाइल नंबर से जुड़ा आधार कार्ड',
        tipBn: 'OTP পাওয়ার জন্য আধারে যুক্ত মোবাইলটি সঙ্গে রাখুন।',
        tipEn: 'Keep the Aadhaar-linked mobile phone with you for official portal OTP only.',
      },
      {
        bn: 'প্যান (PAN) কার্ড',
        en: 'PAN Card',
        hi: 'पैन (PAN) कार्ड',
        tipBn: 'আধার ও প্যান কার্ডের নামের বানান এক হওয়া দরকার।',
        tipEn: 'Ensure your name spelling matches between Aadhaar and PAN.',
      },
      {
        bn: 'ব্যবসা বা ব্যক্তিগত ব্যাংক অ্যাকাউন্ট নম্বর ও IFSC',
        en: 'Bank Account Number & IFSC Code',
        hi: 'बैंक खाता संख्या और IFSC कोड',
        tipBn: 'পাশবইয়ের প্রথম পাতার স্পষ্ট ফটোকপি রাখুন।',
        tipEn: 'Keep a clear photocopy of the bank passbook front page.',
      },
      {
        bn: 'ব্যবসার ঠিকানা ও কাজের বিবরণ (NIC কোড)',
        en: 'Business Address & Main Activity Description',
        hi: 'व्यवसाय का पता और मुख्य कार्य विवरण',
        tipBn: 'ব্যবসা শুরুর তারিখ ও দোকানের ঠিকানা লিখে রাখুন।',
        tipEn: 'Note your start date and shop/workshop address clearly.',
      },
    ],
  },
  {
    id: 'preset-employment-bank',
    titleBn: 'পশ্চিমবঙ্গ এমপ্লয়মেন্ট ব্যাংক নিবন্ধন',
    titleEn: 'WB Employment Bank Registration',
    titleHi: 'पश्चिम बंगाल एम्प्लॉयमेंट बैंक पंजीकरण',
    summaryBn: 'চাকরিপ্রার্থীদের জন্য পশ্চিমবঙ্গ শ্রম দপ্তরের অফিসিয়াল নিবন্ধন ও ভেরিফিকেশন।',
    summaryEn: 'Official Labour Department registration for job seekers in West Bengal.',
    summaryHi: 'पश्चिम बंगाल के नौकरी चाहने वालों के लिए आधिकारिक पंजीकरण।',
    officialPortalUrl: 'https://employmentbankwb.gov.in/',
    sourceName: 'Department of Labour, Govt. of West Bengal',
    lastVerifiedDate: '2026-03-01',
    documents: [
      {
        bn: 'আবাসিক প্রমাণপত্র (আধার / ভোটার / রেশন কার্ড)',
        en: 'West Bengal Residence Proof (Aadhaar / Voter / Ration Card)',
        hi: 'पश्चिम बंगाल निवास प्रमाण',
        tipBn: 'সব নথিতে ঠিকানা ও জন্মতারিখ মিল আছে কিনা দেখুন।',
        tipEn: 'Verify that address and date of birth match across documents.',
      },
      {
        bn: 'শিক্ষাগত যোগ্যতার মার্কশিট ও সার্টিফিকেট (মূল ও ফটোকপি)',
        en: 'Educational Marksheets & Certificates (Original + Photocopy)',
        hi: 'शैक्षणिक अंकपत्र और प्रमाणपत्र',
        tipBn: 'অনলাইন নিবন্ধনের ৬০ দিনের মধ্যে এক্সচেঞ্জ অফিসে মূল কপি দেখাতে হয়।',
        tipEn: 'Originals are verified at the Employment Exchange within 60 days of online signup.',
      },
      {
        bn: 'বয়সের প্রমাণপত্র (মাধ্যমিক অ্যাডমিট বা জন্ম সার্টিফিকেট)',
        en: 'Age Proof (Madhyamik Admit Card or Birth Certificate)',
        hi: 'आयु प्रमाण पत्र',
        tipBn: 'জন্মতারিখ স্পষ্টভাবে পড়া যাচ্ছে কিনা যাচাই করুন।',
        tipEn: 'Ensure date of birth is clearly legible.',
      },
      {
        bn: 'পাসপোর্ট সাইজ ছবি ও সক্রিয় মোবাইল নম্বর',
        en: 'Passport-size Photo & Active Mobile Number',
        hi: 'पासपोर्ट फोटो और सक्रिय मोबाइल नंबर',
        tipBn: 'সদ্য তোলা ২ কপি রঙিন পাসপোর্ট ছবি ফোল্ডারে রাখুন।',
        tipEn: 'Keep 2 recent color passport photos in your folder.',
      },
    ],
  },
];

function computeVerdict(
  preset: ChecklistPreset,
  answers: { wbResident: string; age: string; isGovtEmployee: string; applicantGroup: string }
): EligibilityVerdict {
  if (!answers.wbResident || !answers.age || !answers.isGovtEmployee) {
    return 'More Information Required';
  }
  const ageNum = Number(answers.age);
  if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 110) {
    return 'More Information Required';
  }

  const id = preset.id.toLowerCase();
  if (preset.scheme?.scope === 'West Bengal' && answers.wbResident === 'no') {
    return 'Important Requirements Not Met';
  }
  if (id.includes('annapurna')) {
    if (answers.wbResident === 'no' || answers.isGovtEmployee === 'yes') {
      return 'Important Requirements Not Met';
    }
    if (answers.applicantGroup === 'male') {
      return 'Important Requirements Not Met';
    }
    if (ageNum < 25 || ageNum > 60) {
      return 'Important Requirements Not Met';
    }
    if (answers.applicantGroup === 'woman') {
      return 'Potentially Eligible';
    }
    return 'Confirm With Official Authority';
  }
  if (id.includes('kanyashree')) {
    if (answers.wbResident === 'no' || answers.applicantGroup === 'male' || ageNum < 13 || ageNum > 19) {
      return 'Important Requirements Not Met';
    }
    return 'Potentially Eligible';
  }
  if (id.includes('swami-vivekananda') || id.includes('svmcm')) {
    if (answers.wbResident === 'no' || ageNum < 15 || ageNum > 35) {
      return 'Confirm With Official Authority';
    }
    return 'Potentially Eligible';
  }
  if (id.includes('student-credit')) {
    if (answers.wbResident === 'no' || ageNum > 40) {
      return 'Important Requirements Not Met';
    }
    return 'Potentially Eligible';
  }
  if (id.includes('svanidhi') || id.includes('udyam')) {
    return ageNum >= 18 ? 'Potentially Eligible' : 'Important Requirements Not Met';
  }
  return 'Confirm With Official Authority';
}

export function FolderCheckPage({ initialSchemeId }: { initialSchemeId?: string }) {
  const { language, navigate, showToast } = useApp();
  const [schemes, setSchemes] = useState<WelfareScheme[]>(() =>
    readOfflineCache<WelfareScheme[]>('schemes_list', [])
  );
  const [selectedId, setSelectedId] = useState<string>(initialSchemeId || '');
  const [answers, setAnswers] = useState({
    wbResident: '',
    age: '',
    isGovtEmployee: '',
    applicantGroup: '',
  });

  // Saved document check states per service ID in localStorage (zero PII stored!)
  const [docStatesMap, setDocStatesMap] = useState<Record<string, Record<string, DocState>>>(() =>
    readOfflineCache<Record<string, Record<string, DocState>>>('folder_check_states', {})
  );
  const [completedTracked, setCompletedTracked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiFetch<{ schemes: WelfareScheme[] }>('/api/schemes')
      .then((res) => {
        const list = res.schemes || [];
        setSchemes(list);
        writeOfflineCache('schemes_list', list);
        if (!selectedId && list.length > 0) {
          setSelectedId(initialSchemeId || list[0].id);
        }
      })
      .catch(() => {
        if (!selectedId) {
          setSelectedId(initialSchemeId || EXTRA_PRESETS[0].id);
        }
      });
  }, [initialSchemeId]);

  const presets: ChecklistPreset[] = useMemo(() => {
    const schemePresets: ChecklistPreset[] = schemes.map((s) => ({
      id: s.id,
      titleBn: s.officialName.bn,
      titleEn: s.officialName.en,
      titleHi: s.officialName.hi,
      summaryBn: s.description.bn,
      summaryEn: s.description.en,
      summaryHi: s.description.hi,
      officialPortalUrl: s.officialWebsite,
      sourceName: s.sourceName,
      lastVerifiedDate: s.dateVerified,
      isScheme: true,
      scheme: s,
      documents: [
        ...s.requiredDocuments.map((doc) => ({
          bn: doc,
          en: doc,
          hi: doc,
          tipBn: 'মূল কপি ও ২ সেট পরিষ্কার জেরক্স কপি সাথে রাখুন।',
          tipEn: 'Carry the original along with 2 clear photocopies.',
        })),
        {
          bn: 'সব নথিতে নামের বানান ও জন্মতারিখ মিল আছে কিনা যাচাই',
          en: 'Name spelling & Date of Birth match across Aadhaar and Bank Passbook',
          hi: 'सभी दस्तावेजों में नाम और जन्मतिथि का मिलान',
          tipBn: 'নামের বানানে অমিল থাকলে আবেদন আটকে যেতে পারে — আগেই BSK বা ব্যাংকে ঠিক করুন।',
          tipEn: 'Spelling mismatches are the #1 reason for rejection — verify before visiting.',
        },
        {
          bn: 'ব্যাংক অ্যাকাউন্টে Aadhaar DBT / NPCI লিঙ্ক সক্রিয় আছে',
          en: 'Bank account is active with Aadhaar DBT / NPCI seeding enabled',
          hi: 'बैंक खाते में आधार DBT / NPCI लिंक सक्रिय है',
          tipBn: 'সরাসরি সরকারি টাকা পাওয়ার জন্য সিঙ্গল অ্যাকাউন্ট ও DBT চালু থাকা জরুরি।',
          tipEn: 'Active single-holder account with Aadhaar DBT seeding prevents payment failure.',
        },
        {
          bn: 'কাস্ট সার্টিফিকেট / আয় সার্টিফিকেট / প্রযোজ্য ক্ষেত্রে বিশেষ প্রমাণপত্র (ঐচ্ছিক)',
          en: 'Caste / Income / Special Category Certificate (Optional — only if applicable)',
          hi: 'जाति / आय / विशेष श्रेणी प्रमाण पत्र (वैकल्पिक — यदि लागू हो)',
          tipBn: 'যদি আপনার জন্য প্রযোজ্য না হয় তবে "প্রযোজ্য নয়" নির্বাচন করুন।',
          tipEn: 'Mark "Not Applicable" if your category does not require this certificate.',
          optional: true,
        },
      ],
    }));
    return [...schemePresets, ...EXTRA_PRESETS];
  }, [schemes]);

  const activePreset = useMemo(() => {
    return presets.find((p) => p.id === selectedId) || presets[0] || null;
  }, [presets, selectedId]);

  const currentDocStates: Record<string, DocState> = activePreset
    ? docStatesMap[activePreset.id] || {}
    : {};

  const updateDocState = (docIdx: number, next: DocState) => {
    if (!activePreset) return;
    const key = `doc-${docIdx}`;
    const updated = {
      ...docStatesMap,
      [activePreset.id]: {
        ...currentDocStates,
        [key]: next,
      },
    };
    setDocStatesMap(updated);
    writeOfflineCache('folder_check_states', updated);

    const totalDocs = activePreset.documents.length;
    const markedCount = Object.keys(updated[activePreset.id]).length;
    if (markedCount >= totalDocs && !completedTracked[activePreset.id]) {
      setCompletedTracked((prev) => ({ ...prev, [activePreset.id]: true }));
      trackAnalyticsEvent('checklist_completed', activePreset.id);
    }
  };

  const verdict: EligibilityVerdict | null = activePreset
    ? computeVerdict(activePreset, answers)
    : null;

  const stats = useMemo(() => {
    if (!activePreset) return { total: 0, ready: 0, missing: 0, needHelp: 0, na: 0, unchecked: 0 };
    let ready = 0;
    let missing = 0;
    let needHelp = 0;
    let na = 0;
    activePreset.documents.forEach((_, idx) => {
      const st = currentDocStates[`doc-${idx}`];
      if (st === 'ready') ready++;
      else if (st === 'missing') missing++;
      else if (st === 'need_help') needHelp++;
      else if (st === 'not_applicable') na++;
    });
    const total = activePreset.documents.length;
    return { total, ready, missing, needHelp, na, unchecked: total - ready - missing - needHelp - na };
  }, [activePreset, currentDocStates]);

  const activeTitle = activePreset
    ? language === 'bn'
      ? activePreset.titleBn
      : language === 'hi'
        ? activePreset.titleHi
        : activePreset.titleEn
    : '';

  const activeSummary = activePreset
    ? language === 'bn'
      ? activePreset.summaryBn
      : language === 'hi'
        ? activePreset.summaryHi
        : activePreset.summaryEn
    : '';

  const buildChecklistText = () => {
    if (!activePreset) return '';
    const lines = [
      `JENOVA Checklist — Document Preparation Assistant`,
      `Service: ${activeTitle}`,
      `Preliminary Eligibility Status: ${verdict || 'Confirm With Official Authority'} (Not an official guarantee)`,
      `Official Portal: ${activePreset.officialPortalUrl}`,
      `Last Verified: ${activePreset.lastVerifiedDate}`,
      ``,
      `Document Readiness Checklist:`,
      ...activePreset.documents.map((d, i) => {
        const st = currentDocStates[`doc-${i}`] || 'unchecked';
        const label = language === 'bn' ? d.bn : language === 'hi' ? d.hi : d.en;
        return `[${st.toUpperCase()}] ${i + 1}. ${label}`;
      }),
      ``,
      `Important: Carry originals + 2 photocopies. Never share OTP or UPI PIN with anyone.`,
    ];
    return lines.join('\n');
  };

  const downloadChecklistTxt = () => {
    if (!activePreset) return;
    const blob = new Blob([buildChecklistText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jenova-checklist-${activePreset.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    trackAnalyticsEvent('checklist_completed', activePreset.id);
    showToast(
      language === 'bn' ? 'চেকলিস্ট ডাউনলোড হয়েছে!' : 'Checklist downloaded to your device.'
    );
  };

  const verdictConfig = (v: EligibilityVerdict) => {
    if (v === 'Potentially Eligible') {
      return {
        box: 'bg-[#EBF4F0] border-[#176B4D]/40 text-[#0F4D37]',
        label:
          language === 'bn'
            ? 'সম্ভাব্য যোগ্য (Potentially Eligible)'
            : language === 'hi'
              ? 'संभावित पात्र (Potentially Eligible)'
              : 'Potentially Eligible',
        note:
          language === 'bn'
            ? 'আপনার উত্তর অনুযায়ী আপনি আবেদন করার উপযুক্ত হতে পারেন। তবে চূড়ান্ত অনুমোদন কেবল অফিসিয়াল সরকারি দপ্তর দেয়।'
            : 'Based on your answers, you appear to meet basic criteria. Final eligibility is always confirmed only by the official authority.',
      };
    }
    if (v === 'Important Requirements Not Met') {
      return {
        box: 'bg-red-50 border-red-300 text-red-900',
        label:
          language === 'bn'
            ? 'গুরুত্বপূর্ণ শর্ত পূরণ হয়নি (Important Requirements Not Met)'
            : language === 'hi'
              ? 'महत्वपूर्ण शर्तें पूरी नहीं (Important Requirements Not Met)'
              : 'Important Requirements Not Met',
        note:
          language === 'bn'
            ? 'বর্তমান উত্তর অনুযায়ী প্রধান কোনো শর্ত (যেমন বয়স, আবাসিক অবস্থা বা সরকারি চাকরি) মিলছে না। ব্যতিক্রম জানতে BSK বা অফিসিয়াল পোর্টাল দেখুন।'
            : 'One or more key official criteria (such as residency, age band, or group) may not match. Please verify exceptions with the official authority.',
      };
    }
    if (v === 'More Information Required') {
      return {
        box: 'bg-[#FEF4E6] border-[#F4A340] text-[#6B3F06]',
        label:
          language === 'bn'
            ? 'আরও তথ্য প্রয়োজন (More Information Required)'
            : language === 'hi'
              ? 'अधिक जानकारी आवश्यक (More Information Required)'
              : 'More Information Required',
        note:
          language === 'bn'
            ? 'প্রাথমিক ধারণা পেতে উপরের ৩টি সহজ প্রশ্নের উত্তর দিন।'
            : 'Answer the quick qualifying questions above for a preliminary eligibility indicator.',
      };
    }
    return {
      box: 'bg-[#F5F4EF] border-[#D8D5CC] text-[#252525]',
      label:
        language === 'bn'
          ? 'অফিসিয়াল কর্তৃপক্ষের সাথে নিশ্চিত করুন (Confirm With Official Authority)'
          : language === 'hi'
            ? 'आधिकारिक प्राधिकरण से पुष्टि करें (Confirm With Official Authority)'
            : 'Confirm With Official Authority',
      note:
        language === 'bn'
          ? 'এই পরিষেবার চূড়ান্ত শর্ত আপনার স্থানীয় বাংলা সহায়তা কেন্দ্র (BSK) বা অফিসিয়াল পোর্টালে নিশ্চিত করুন।'
          : 'Please verify scheme-specific rules directly on the official portal or at your nearest Bangla Sahayata Kendra (BSK).',
    };
  };

  const activeVerdictUI = verdict ? verdictConfig(verdict) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title={
          language === 'bn'
            ? 'JENOVA Checklist — কাগজপত্র প্রস্তুতি সহায়ক'
            : language === 'hi'
              ? 'JENOVA Checklist — दस्तावेज़ तैयारी सहायक'
              : 'JENOVA Checklist — Document Preparation Assistant'
        }
        subtitle={
          language === 'bn'
            ? 'বিডিও অফিস, বাংলা সহায়তা কেন্দ্র (BSK) বা দুয়ারে সরকার ক্যাম্পে যাওয়ার আগে প্রতিটি কাগজ ঠিক আছে কিনা মিলিয়ে নিন — কোনো কাগজ আপলোড করতে হবে না।'
            : language === 'hi'
              ? 'BDO ऑफिस, BSK या कैंप जाने से पहले अपने सभी दस्तावेज़ जांच लें। कोई भी दस्तावेज़ अपलोड करने की आवश्यकता नहीं है।'
              : 'Prepare your complete document folder before visiting a BSK, BDO office, or official portal. Offline-saved on your phone — zero Aadhaar or document uploads required.'
        }
      />

      <SafetyNotice
        message={
          language === 'bn'
            ? 'গোপনীয়তা সুরক্ষা: এই চেকলিস্টে কোনো আধার নম্বর, ব্যাংক অ্যাকাউন্ট বা ছবি আপলোড করবেন না। আপনার টিক-চিহ্ন কেবল আপনার ফোনেই সেভ থাকে।'
            : 'Privacy Guarantee: Do not upload Aadhaar, bank passbooks, or photos here. Your checkmarks are stored locally on your device for offline viewing.'
        }
      />

      {/* Step 1: Select Service */}
      <section className="rounded-2xl bg-white border border-[#E5E3DC] p-5 sm:p-6 space-y-4 print:border-0 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-[#252525]">
            {language === 'bn'
              ? 'ধাপ ১: কোন প্রকল্প বা পরিষেবার জন্য প্রস্তুতি নিচ্ছেন?'
              : 'Step 1: Choose the Scheme or Service'}
          </h2>
          <span className="text-xs text-[#5C5C58]">
            {language === 'bn' ? 'অফলাইনেও সেভ থাকে' : 'Saved offline on device'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 print:hidden">
          {presets.map((p) => {
            const label =
              language === 'bn' ? p.titleBn : language === 'hi' ? p.titleHi : p.titleEn;
            const selected = activePreset?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer min-h-[52px] ${
                  selected
                    ? 'bg-[#176B4D] text-white border-[#176B4D] font-semibold'
                    : 'bg-[#FAF9F5] text-[#252525] border-[#E5E3DC] hover:bg-[#EBF4F0]'
                }`}
              >
                <span className="text-sm leading-snug block">{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {activePreset && (
        <>
          {/* Step 2: Plain-language overview */}
          <section className="rounded-2xl bg-white border border-[#E5E3DC] p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5C58]">
                  <VerificationLabel status="Officially Verified" />
                  <span>·</span>
                  <span>{activePreset.sourceName}</span>
                  <span>·</span>
                  <span>{activePreset.lastVerifiedDate}</span>
                </div>
                <h2 className="text-xl font-bold text-[#252525]">{activeTitle}</h2>
              </div>
              <ReadAloudButton
                lang={language}
                text={`${activeTitle}. ${activeSummary}. ${activePreset.documents
                  .map((d) => (language === 'bn' ? d.bn : d.en))
                  .join('. ')}`}
              />
            </div>
            <p className="text-sm sm:text-base text-[#4A4A46] leading-relaxed">{activeSummary}</p>
          </section>

          {/* Step 3: Minimal Qualifying Questions -> 4-verdict check */}
          <section className="rounded-2xl bg-white border border-[#E5E3DC] p-5 sm:p-6 space-y-4 print:hidden">
            <h2 className="text-base sm:text-lg font-bold text-[#252525]">
              {language === 'bn'
                ? 'ধাপ ২: প্রাথমিক যোগ্যতা যাচাই (ঐচ্ছিক, ৩টি সহজ প্রশ্ন)'
                : 'Step 2: Quick Preliminary Eligibility Check (No personal ID asked)'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C5C58] mb-1.5">
                  {language === 'bn' ? 'পশ্চিমবঙ্গের বাসিন্দা?' : 'West Bengal Resident?'}
                </label>
                <select
                  value={answers.wbResident}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, wbResident: e.target.value }))}
                  className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3 py-2.5 text-sm"
                >
                  <option value="">{language === 'bn' ? 'বেছে নিন' : 'Select'}</option>
                  <option value="yes">{language === 'bn' ? 'হ্যাঁ' : 'Yes'}</option>
                  <option value="no">{language === 'bn' ? 'না' : 'No'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C5C58] mb-1.5">
                  {language === 'bn' ? 'আবেদনকারীর বয়স (বছর)' : 'Applicant Age (Years)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={answers.age}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, age: e.target.value }))}
                  placeholder={language === 'bn' ? 'যেমন: ২৮' : 'e.g. 28'}
                  className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C5C58] mb-1.5">
                  {language === 'bn' ? 'আবেদনকারীর শ্রেণি' : 'Applicant Category'}
                </label>
                <select
                  value={answers.applicantGroup}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, applicantGroup: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3 py-2.5 text-sm"
                >
                  <option value="">{language === 'bn' ? 'বেছে নিন' : 'Select'}</option>
                  <option value="woman">{language === 'bn' ? 'মহিলা / ছাত্রী' : 'Woman / Girl Student'}</option>
                  <option value="male">{language === 'bn' ? 'পুরুষ / ছাত্র' : 'Man / Boy Student'}</option>
                  <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C5C58] mb-1.5">
                  {language === 'bn' ? 'স্থায়ী সরকারি চাকরি আছে?' : 'Regular Govt Employee?'}
                </label>
                <select
                  value={answers.isGovtEmployee}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, isGovtEmployee: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3 py-2.5 text-sm"
                >
                  <option value="">{language === 'bn' ? 'বেছে নিন' : 'Select'}</option>
                  <option value="no">{language === 'bn' ? 'না' : 'No'}</option>
                  <option value="yes">{language === 'bn' ? 'হ্যাঁ' : 'Yes'}</option>
                </select>
              </div>
            </div>

            {activeVerdictUI && (
              <div className={`rounded-xl border p-4 space-y-1 ${activeVerdictUI.box}`}>
                <p className="font-bold text-sm">{activeVerdictUI.label}</p>
                <p className="text-xs sm:text-sm leading-relaxed">{activeVerdictUI.note}</p>
              </div>
            )}
          </section>

          {/* Step 4 & 5: Interactive Document Checklist */}
          <section className="rounded-2xl bg-white border border-[#E5E3DC] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#252525] flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#176B4D]" />
                  {language === 'bn'
                    ? 'ধাপ ৩: প্রতিটি কাগজের অবস্থা চিহ্নিত করুন'
                    : 'Step 3: Mark Each Document in Your Folder'}
                </h2>
                <p className="text-xs sm:text-sm text-[#5C5C58] mt-0.5">
                  {language === 'bn'
                    ? 'প্রস্তুত / নেই / প্রযোজ্য নয় / সাহায্য দরকার — যেকোনো একটি বেছে নিন।'
                    : 'Mark each item as Ready, Missing, Not Applicable, or Need Help.'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-[#176B4D]">
                  {language === 'bn' ? `প্রস্তুত: ${stats.ready}/${stats.total}` : `Ready: ${stats.ready}/${stats.total}`}
                </span>
                {stats.missing > 0 && (
                  <span className="text-red-700">
                    {language === 'bn' ? `নেই: ${stats.missing}` : `Missing: ${stats.missing}`}
                  </span>
                )}
                {stats.needHelp > 0 && (
                  <span className="text-[#B56A10]">
                    {language === 'bn' ? `সাহায্য দরকার: ${stats.needHelp}` : `Need Help: ${stats.needHelp}`}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-[#EFECE3] overflow-hidden">
              <div
                className="h-full bg-[#176B4D] transition-all duration-300"
                style={{
                  width: `${stats.total > 0 ? Math.round(((stats.ready + stats.na) / stats.total) * 100) : 0}%`,
                }}
              />
            </div>

            <div className="space-y-3">
              {activePreset.documents.map((doc, idx) => {
                const state = currentDocStates[`doc-${idx}`];
                const docLabel =
                  language === 'bn' ? doc.bn : language === 'hi' ? doc.hi : doc.en;
                const tipText = language === 'bn' ? doc.tipBn : doc.tipEn;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 space-y-3 transition-colors ${
                      state === 'ready'
                        ? 'bg-[#EBF4F0]/60 border-[#176B4D]/40'
                        : state === 'missing'
                          ? 'bg-red-50/60 border-red-200'
                          : state === 'need_help'
                            ? 'bg-[#FEF4E6]/70 border-[#F4A340]/60'
                            : 'bg-[#FAF9F5] border-[#E5E3DC]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-[#5C5C58] mb-0.5">
                          {doc.optional
                            ? language === 'bn'
                              ? 'ঐচ্ছিক / শর্তসাপেক্ষ নথি'
                              : 'Optional / If Applicable'
                            : language === 'bn'
                              ? 'প্রয়োজনীয় নথি'
                              : 'Required Document'}
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-[#252525]">
                          {idx + 1}. {docLabel}
                        </p>
                        <p className="text-xs text-[#5C5C58] mt-1">{tipText}</p>
                      </div>
                      {state === 'ready' && (
                        <CheckCircle2 className="w-5 h-5 text-[#176B4D] shrink-0" />
                      )}
                      {state === 'missing' && (
                        <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
                      )}
                      {state === 'need_help' && (
                        <HelpCircle className="w-5 h-5 text-[#B56A10] shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 print:hidden">
                      {(
                        [
                          { id: 'ready', bn: 'প্রস্তুত আছে', en: 'Ready' },
                          { id: 'missing', bn: 'এখন নেই', en: 'Missing' },
                          { id: 'not_applicable', bn: 'প্রযোজ্য নয়', en: 'Not Applicable' },
                          { id: 'need_help', bn: 'সাহায্য দরকার', en: 'Need Help' },
                        ] as { id: DocState; bn: string; en: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateDocState(idx, opt.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[36px] ${
                            state === opt.id
                              ? opt.id === 'ready'
                                ? 'bg-[#176B4D] text-white border-[#176B4D]'
                                : opt.id === 'missing'
                                  ? 'bg-red-700 text-white border-red-700'
                                  : opt.id === 'need_help'
                                    ? 'bg-[#B56A10] text-white border-[#B56A10]'
                                    : 'bg-[#252525] text-white border-[#252525]'
                              : 'bg-white text-[#252525] border-[#D8D5CC] hover:bg-[#F5F4EF]'
                          }`}
                        >
                          {language === 'bn' ? opt.bn : opt.en}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 6 & 7: Structured "Before You Visit" Summary + Practical Actions */}
            <div className="rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] p-5 space-y-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#176B4D] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-[#252525]">
                    {language === 'bn'
                      ? 'যাওয়ার আগে প্রস্তুতি সারাংশ (Before You Visit Summary)'
                      : 'Before You Visit Summary'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C5C58] mt-1">
                    {stats.ready + stats.na === stats.total && stats.total > 0
                      ? language === 'bn'
                        ? 'অভিনন্দন! আপনার ফোল্ডার প্রস্তুতি সম্পন্ন হয়েছে। মূল কপি ও ২ সেট ফটোকপি নিয়ে বেরোন।'
                        : 'Great! Your folder checklist is complete. Carry originals and 2 clear photocopy sets.'
                      : language === 'bn'
                        ? `প্রস্তুত: ${stats.ready}টি · এখন নেই: ${stats.missing}টি · সাহায্য দরকার: ${stats.needHelp}টি · বাকি: ${stats.unchecked}টি`
                        : `Ready: ${stats.ready} · Missing: ${stats.missing} · Need Help: ${stats.needHelp} · Unmarked: ${stats.unchecked}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="rounded-xl bg-white border border-[#E5E3DC] p-4 space-y-2">
                  <p className="font-bold text-[#176B4D]">
                    {language === 'bn' ? 'সাথে নিয়ে যাওয়ার কাগজ (প্রস্তুত)' : 'Documents Ready to Carry'}
                  </p>
                  {stats.ready === 0 ? (
                    <p className="text-[#5C5C58]">
                      {language === 'bn'
                        ? 'এখনো কোনো কাগজ "প্রস্তুত আছে" চিহ্নিত করা হয়নি।'
                        : 'No documents marked Ready yet.'}
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[#252525] list-disc pl-4">
                      {activePreset.documents
                        .filter((_, i) => currentDocStates[`doc-${i}`] === 'ready')
                        .map((d, i) => (
                          <li key={i}>{language === 'bn' ? d.bn : language === 'hi' ? d.hi : d.en}</li>
                        ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl bg-white border border-[#E5E3DC] p-4 space-y-2">
                  <p className="font-bold text-[#B56A10]">
                    {language === 'bn'
                      ? 'যাওয়ার আগে যা ঠিক বা জোগাড় করতে হবে'
                      : 'Needs Completion / Help Before Visiting'}
                  </p>
                  {stats.missing + stats.needHelp === 0 ? (
                    <p className="text-[#5C5C58]">
                      {language === 'bn'
                        ? 'কোনো অনুপস্থিত নথি চিহ্নিত নেই। তবুও অফিসে যাওয়ার আগে কাউন্টারের সময় নিশ্চিত করুন।'
                        : 'No missing items flagged. Confirm office counter timings before travelling.'}
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[#252525] list-disc pl-4">
                      {activePreset.documents
                        .filter(
                          (_, i) =>
                            currentDocStates[`doc-${i}`] === 'missing' ||
                            currentDocStates[`doc-${i}`] === 'need_help'
                        )
                        .map((d, i) => (
                          <li key={i}>{language === 'bn' ? d.bn : language === 'hi' ? d.hi : d.en}</li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-white border border-[#E5E3DC] p-4 text-xs text-[#4A4A46] space-y-1">
                <p className="font-bold text-[#252525]">
                  {language === 'bn' ? 'যাত্রার আগে নিশ্চিত করুন:' : 'Details to Confirm Before Travelling:'}
                </p>
                <p>
                  {language === 'bn'
                    ? '১) স্থানীয় BSK বা BDO অফিস খোলা থাকার দিন ও সময় · ২) আধারে যুক্ত মোবাইল ফোন সাথে আছে · ৩) মূল নথি + ২ সেট জেরক্স ও পাসপোর্ট ছবি।'
                    : '1) Exact local BSK / BDO counter hours · 2) Carry your Aadhaar-linked mobile phone · 3) Carry originals + 2 photocopy sets & passport photos.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 print:hidden">
                <button
                  type="button"
                  onClick={() => {
                    trackAnalyticsEvent('checklist_completed', activePreset.id);
                    window.print();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#11533B] text-white text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
                >
                  <Printer className="w-4 h-4" />
                  {language === 'bn' ? 'প্রিন্ট / PDF সেভ করুন' : 'Print / Save PDF'}
                </button>
                <button
                  type="button"
                  onClick={downloadChecklistTxt}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#D8D5CC] hover:bg-[#EBF4F0] text-[#252525] text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
                >
                  <Download className="w-4 h-4 text-[#176B4D]" />
                  {language === 'bn' ? 'চেকলিস্ট ডাউনলোড (.txt)' : 'Download Checklist'}
                </button>
                <a
                  href={buildWhatsAppShareUrl(
                    `${activeTitle} — Folder Check`,
                    buildChecklistText(),
                    `/checklist/${activePreset.id}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#D8D5CC] hover:bg-[#EBF4F0] text-[#252525] text-xs sm:text-sm font-semibold min-h-[44px]"
                >
                  <Share2 className="w-4 h-4 text-[#176B4D]" />
                  {language === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান' : 'Share on WhatsApp'}
                </a>
                <a
                  href={activePreset.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackAnalyticsEvent('scheme_referral', activePreset.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FEF4E6] border border-[#F4A340]/60 text-[#6B3F06] hover:bg-[#FDE7C8] text-xs sm:text-sm font-semibold min-h-[44px]"
                >
                  {language === 'bn' ? 'অফিসিয়াল পোর্টাল' : 'Official Portal'}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/local-help')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#176B4D]/40 text-[#176B4D] hover:bg-[#EBF4F0] text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
                >
                  <MapPin className="w-4 h-4" />
                  {language === 'bn' ? 'নিকটস্থ BSK / স্থানীয় সহায়তা' : 'Find Nearest BSK / Local Help'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
