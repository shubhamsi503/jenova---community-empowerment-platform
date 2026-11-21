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
import { localizeVerdict, tr } from '../i18n/translations';
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
    tipHi: string;
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
        tipHi: 'आधिकारिक पोर्टल OTP के लिए आधार से जुड़ा मोबाइल फोन साथ रखें।',
        tipEn: 'Keep the Aadhaar-linked mobile phone with you for official portal OTP only.',
      },
      {
        bn: 'প্যান (PAN) কার্ড',
        en: 'PAN Card',
        hi: 'पैन (PAN) कार्ड',
        tipBn: 'আধার ও প্যান কার্ডের নামের বানান এক হওয়া দরকার।',
        tipHi: 'सुनिश्चित करें कि आधार और पैन कार्ड में नाम की वर्तनी एक जैसी हो।',
        tipEn: 'Ensure your name spelling matches between Aadhaar and PAN.',
      },
      {
        bn: 'ব্যবসা বা ব্যক্তিগত ব্যাংক অ্যাকাউন্ট নম্বর ও IFSC',
        en: 'Bank Account Number & IFSC Code',
        hi: 'बैंक खाता संख्या और IFSC कोड',
        tipBn: 'পাশবইয়ের প্রথম পাতার স্পষ্ট ফটোকপি রাখুন।',
        tipHi: 'बैंक पासबुक के पहले पन्ने की साफ़ फोटोकॉपी साथ रखें।',
        tipEn: 'Keep a clear photocopy of the bank passbook front page.',
      },
      {
        bn: 'ব্যবসার ঠিকানা ও কাজের বিবরণ (NIC কোড)',
        en: 'Business Address & Main Activity Description',
        hi: 'व्यवसाय का पता और मुख्य कार्य विवरण',
        tipBn: 'ব্যবসা শুরুর তারিখ ও দোকানের ঠিকানা লিখে রাখুন।',
        tipHi: 'व्यवसाय शुरू होने की तारीख और दुकान/कार्यस्थल का पता लिखकर रखें।',
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
        hi: 'पश्चिम बंगाल निवास प्रमाण (आधार / वोटर / राशन कार्ड)',
        tipBn: 'সব নথিতে ঠিকানা ও জন্মতারিখ মিল আছে কিনা দেখুন।',
        tipHi: 'जांच लें कि सभी दस्तावेजों में पता और जन्मतिथि एक जैसी हो।',
        tipEn: 'Verify that address and date of birth match across documents.',
      },
      {
        bn: 'শিক্ষাগত যোগ্যতার মার্কশিট ও সার্টিফিকেট (মূল ও ফটোকপি)',
        en: 'Educational Marksheets & Certificates (Original + Photocopy)',
        hi: 'शैक्षणिक अंकपत्र और प्रमाणपत्र (मूल व फोटोकॉपी)',
        tipBn: 'অনলাইন নিবন্ধনের ৬০ দিনের মধ্যে এক্সচেঞ্জ অফিসে মূল কপি দেখাতে হয়।',
        tipHi: 'ऑनलाइन पंजीकरण के 60 दिनों के भीतर एम्प्लॉयमेंट एक्सचेंज में मूल दस्तावेज दिखाने होते हैं।',
        tipEn: 'Originals are verified at the Employment Exchange within 60 days of online signup.',
      },
      {
        bn: 'বয়সের প্রমাণপত্র (মাধ্যমিক অ্যাডমিট বা জন্ম সার্টিফিকেট)',
        en: 'Age Proof (Madhyamik Admit Card or Birth Certificate)',
        hi: 'आयु प्रमाण पत्र (माध्यमिक एडमिट कार्ड या जन्म प्रमाण पत्र)',
        tipBn: 'জন্মতারিখ স্পষ্টভাবে পড়া যাচ্ছে কিনা যাচাই করুন।',
        tipHi: 'सुनिश्चित करें कि जन्मतिथि स्पष्ट रूप से पढ़ी जा सके।',
        tipEn: 'Ensure date of birth is clearly legible.',
      },
      {
        bn: 'পাসপোর্ট সাইজ ছবি ও সক্রিয় মোবাইল নম্বর',
        en: 'Passport-size Photo & Active Mobile Number',
        hi: 'पासपोर्ट साइज फोटो और सक्रिय मोबाइल नंबर',
        tipBn: 'সদ্য তোলা ২ কপি রঙিন পাসপোর্ট ছবি ফোল্ডারে রাখুন।',
        tipHi: 'हाल ही में खिंचवाई गई 2 रंगीन पासपोर्ट फोटो फ़ोल्डर में रखें।',
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
          tipHi: 'मूल दस्तावेज के साथ 2 साफ़ फोटोकॉपी सेट रखें।',
          tipEn: 'Carry the original along with 2 clear photocopies.',
        })),
        {
          bn: 'সব নথিতে নামের বানান ও জন্মতারিখ মিল আছে কিনা যাচাই',
          en: 'Name spelling & Date of Birth match across Aadhaar and Bank Passbook',
          hi: 'सभी दस्तावेजों में नाम और जन्मतिथि का मिलान',
          tipBn: 'নামের বানানে অমিল থাকলে আবেদন আটকে যেতে পারে — আগেই BSK বা ব্যাংকে ঠিক করুন।',
          tipHi: 'नाम की वर्तनी में अंतर होने पर आवेदन अटक सकता है — पहले BSK या बैंक में सुधार करवाएं।',
          tipEn: 'Spelling mismatches are the #1 reason for rejection — verify before visiting.',
        },
        {
          bn: 'ব্যাংক অ্যাকাউন্টে Aadhaar DBT / NPCI লিঙ্ক সক্রিয় আছে',
          en: 'Bank account is active with Aadhaar DBT / NPCI seeding enabled',
          hi: 'बैंक खाते में आधार DBT / NPCI लिंक सक्रिय है',
          tipBn: 'সরাসরি সরকারি টাকা পাওয়ার জন্য সিঙ্গল অ্যাকাউন্ট ও DBT চালু থাকা জরুরি।',
          tipHi: 'सीधा सरकारी लाभ पाने के लिए सक्रिय एकल बैंक खाता और आधार DBT चालू होना आवश्यक है।',
          tipEn: 'Active single-holder account with Aadhaar DBT seeding prevents payment failure.',
        },
        {
          bn: 'কাস্ট সার্টিফিকেট / আয় সার্টিফিকেট / প্রযোজ্য ক্ষেত্রে বিশেষ প্রমাণপত্র (ঐচ্ছিক)',
          en: 'Caste / Income / Special Category Certificate (Optional — only if applicable)',
          hi: 'जाति / आय / विशेष श्रेणी प्रमाण पत्र (वैकल्पिक — यदि लागू हो)',
          tipBn: 'যদি আপনার জন্য প্রযোজ্য না হয় তবে "প্রযোজ্য নয়" নির্বাচন করুন।',
          tipHi: 'यदि यह आपके लिए लागू नहीं है तो "लागू नहीं" चुनें।',
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
    ? tr(language, activePreset.titleBn, activePreset.titleHi, activePreset.titleEn)
    : '';

  const activeSummary = activePreset
    ? tr(language, activePreset.summaryBn, activePreset.summaryHi, activePreset.summaryEn)
    : '';

  const stateLabel = (st?: DocState) => {
    if (st === 'ready') return tr(language, 'প্রস্তুত', 'तैयार', 'READY');
    if (st === 'missing') return tr(language, 'নেই', 'अनुपस्थित', 'MISSING');
    if (st === 'not_applicable') return tr(language, 'প্রযোজ্য নয়', 'लागू नहीं', 'N/A');
    if (st === 'need_help') return tr(language, 'সাহায্য দরকার', 'सहायता चाहिए', 'NEED HELP');
    return tr(language, 'চিহ্নিত নয়', 'अचिह्नित', 'UNCHECKED');
  };

  const buildChecklistText = () => {
    if (!activePreset) return '';
    const lines = [
      tr(
        language,
        'JENOVA Checklist — কাগজপত্র প্রস্তুতি সহায়ক',
        'JENOVA Checklist — दस्तावेज़ तैयारी सहायक',
        'JENOVA Checklist — Document Preparation Assistant'
      ),
      `${tr(language, 'পরিষেবা', 'सेवा', 'Service')}: ${activeTitle}`,
      `${tr(language, 'প্রাথমিক যোগ্যতা', 'प्रारंभिक पात्रता', 'Preliminary Eligibility Status')}: ${
        verdict ? localizeVerdict(verdict, language) : localizeVerdict('Confirm With Official Authority', language)
      }`,
      `${tr(language, 'অফিসিয়াল পোর্টাল', 'आधिकारिक पोर्टल', 'Official Portal')}: ${activePreset.officialPortalUrl}`,
      `${tr(language, 'সর্বশেষ যাচাই', 'अंतिम सत्यापन', 'Last Verified')}: ${activePreset.lastVerifiedDate}`,
      '',
      tr(language, 'নথি প্রস্তুতি তালিকা:', 'दस्तावेज़ तैयारी सूची:', 'Document Readiness Checklist:'),
      ...activePreset.documents.map((d, i) => {
        const st = currentDocStates[`doc-${i}`];
        const label = tr(language, d.bn, d.hi, d.en);
        return `[${stateLabel(st)}] ${i + 1}. ${label}`;
      }),
      '',
      tr(
        language,
        'গুরুত্বপূর্ণ: মূল কপি ও ২ সেট জেরক্স সাথে রাখুন। কখনোই কাউকে OTP বা UPI PIN দেবেন না।',
        'महत्वपूर्ण: मूल दस्तावेज़ व 2 फोटोकॉपी सेट साथ रखें। कभी किसी से OTP या UPI PIN साझा न करें।',
        'Important: Carry originals + 2 photocopies. Never share OTP or UPI PIN with anyone.'
      ),
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
      tr(
        language,
        'চেকলিস্ট আপনার ডিভাইসে ডাউনলোড হয়েছে!',
        'चेकलिस्ट आपके डिवाइस पर डाउनलोड हो गई है!',
        'Checklist downloaded to your device.'
      )
    );
  };

  const verdictConfig = (v: EligibilityVerdict) => {
    if (v === 'Potentially Eligible') {
      return {
        box: 'bg-[#E9F5EF] dark:bg-[#143022] border-[#27845B]/40 text-[#1F6A49] dark:text-[#7DE0B0]',
        label: localizeVerdict(v, language),
        note: tr(
          language,
          'আপনার উত্তর অনুযায়ী আপনি আবেদন করার উপযুক্ত হতে পারেন। তবে চূড়ান্ত অনুমোদন কেবল অফিসিয়াল সরকারি দপ্তর দেয়।',
          'आपके उत्तरों के अनुसार आप बुनियादी शर्तें पूरी करते प्रतीत होते हैं। अंतिम पात्रता की पुष्टि केवल आधिकारिक विभाग द्वारा की जाती है।',
          'Based on your answers, you appear to meet basic criteria. Final eligibility is always confirmed only by the official authority.'
        ),
      };
    }
    if (v === 'Important Requirements Not Met') {
      return {
        box: 'bg-red-50 border-red-300 text-red-900',
        label: localizeVerdict(v, language),
        note: tr(
          language,
          'বর্তমান উত্তর অনুযায়ী প্রধান কোনো শর্ত (যেমন বয়স, আবাসিক অবস্থা বা সরকারি চাকরি) মিলছে না। ব্যতিক্রম জানতে BSK বা অফিসিয়াল পোর্টাল দেখুন।',
          'आपके उत्तरों के अनुसार एक या अधिक प्रमुख शर्तें (जैसे निवास, आयु सीमा या श्रेणी) मेल नहीं खातीं। अपवाद जानने के लिए आधिकारिक पोर्टल या BSK से पुष्टि करें।',
          'One or more key official criteria (such as residency, age band, or group) may not match. Please verify exceptions with the official authority.'
        ),
      };
    }
    if (v === 'More Information Required') {
      return {
        box: 'bg-[#FEF4E6] border-[#F4A340] text-[#6B3F06]',
        label: localizeVerdict(v, language),
        note: tr(
          language,
          'প্রাথমিক ধারণা পেতে উপরের সহজ প্রশ্নগুলির উত্তর দিন।',
          'प्रारंभिक पात्रता का अनुमान पाने के लिए ऊपर दिए गए सरल प्रश्नों के उत्तर दें।',
          'Answer the quick qualifying questions above for a preliminary eligibility indicator.'
        ),
      };
    }
    return {
      box: 'bg-[#FFF1DF] border-[#F2DCC1] text-[#26364B]',
      label: localizeVerdict(v, language),
      note: tr(
        language,
        'এই পরিষেবার চূড়ান্ত শর্ত আপনার স্থানীয় বাংলা সহায়তা কেন্দ্র (BSK) বা অফিসিয়াল পোর্টালে নিশ্চিত করুন।',
        'कृपया इस योजना के विशेष नियमों की पुष्टि सीधे आधिकारिक पोर्टल या नजदीकी सहायता केंद्र पर करें।',
        'Please verify scheme-specific rules directly on the official portal or at your nearest Bangla Sahayata Kendra (BSK).'
      ),
    };
  };

  const activeVerdictUI = verdict ? verdictConfig(verdict) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title={tr(
          language,
          'JENOVA Checklist — কাগজপত্র প্রস্তুতি সহায়ক',
          'JENOVA Checklist — दस्तावेज़ तैयारी सहायक',
          'JENOVA Checklist — Document Preparation Assistant'
        )}
        subtitle={tr(
          language,
          'বিডিও অফিস, বাংলা সহায়তা কেন্দ্র (BSK) বা ক্যাম্পে যাওয়ার আগে প্রতিটি কাগজ ঠিক আছে কিনা মিলিয়ে নিন — কোনো কাগজ আপলোড করতে হবে না।',
          'BDO ऑफिस, BSK या कैंप जाने से पहले अपने सभी दस्तावेज़ जांच लें। कोई भी दस्तावेज़ अपलोड करने की आवश्यकता नहीं है।',
          'Prepare your complete document folder before visiting a BSK, BDO office, or official portal. Offline-saved on your phone — zero Aadhaar or document uploads required.'
        )}
      />

      <SafetyNotice
        message={tr(
          language,
          'গোপনীয়তা সুরক্ষা: এই চেকলিস্টে কোনো আধার নম্বর, ব্যাংক অ্যাকাউন্ট বা ছবি আপলোড করবেন না। আপনার টিক-চিহ্ন কেবল আপনার ফোনেই সেভ থাকে।',
          'गोपनीयता सुरक्षा: इस चेकलिस्ट में आधार, बैंक पासबुक या फोटो अपलोड न करें। आपके टिक-मार्क केवल आपके डिवाइस पर ऑफलाइन सेव रहते हैं।',
          'Privacy Guarantee: Do not upload Aadhaar, bank passbooks, or photos here. Your checkmarks are stored locally on your device for offline viewing.'
        )}
      />

      {/* Step 1: Select Service */}
      <section className="rounded-2xl bg-white border border-[#F2DCC1] p-5 sm:p-6 space-y-4 print:border-0 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-[#26364B]">
            {tr(
              language,
              'ধাপ ১: কোন প্রকল্প বা পরিষেবার জন্য প্রস্তুতি নিচ্ছেন?',
              'चरण 1: किस योजना या सेवा की तैयारी कर रहे हैं?',
              'Step 1: Choose the Scheme or Service'
            )}
          </h2>
          <span className="text-xs text-[#454545]">
            {tr(language, 'অফলাইনেও সেভ থাকে', 'डिवाइस पर ऑफलाइन सेव रहता है', 'Saved offline on device')}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 print:hidden">
          {presets.map((p) => {
            const label = tr(language, p.titleBn, p.titleHi, p.titleEn);
            const selected = activePreset?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer min-h-[52px] ${
                  selected
                    ? 'jenova-saffron-btn border-[#E69228] font-semibold'
                    : 'bg-[#FFF1DF] text-[#26364B] border-[#F2DCC1] hover:bg-[#FFE5C2]'
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
          <section className="rounded-2xl bg-white border border-[#F2DCC1] p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#454545]">
                  <VerificationLabel status="Officially Verified" />
                  <span>·</span>
                  <span>{activePreset.sourceName}</span>
                  <span>·</span>
                  <span>{activePreset.lastVerifiedDate}</span>
                </div>
                <h2 className="text-xl font-bold text-[#26364B]">{activeTitle}</h2>
              </div>
              <ReadAloudButton
                lang={language}
                text={`${activeTitle}. ${activeSummary}. ${activePreset.documents
                  .map((d) => tr(language, d.bn, d.hi, d.en))
                  .join('. ')}`}
              />
            </div>
            <p className="text-sm sm:text-base text-[#454545] leading-relaxed">{activeSummary}</p>
          </section>

          {/* Step 3: Minimal Qualifying Questions -> 4-verdict check */}
          <section className="rounded-2xl bg-white border border-[#F2DCC1] p-5 sm:p-6 space-y-4 print:hidden">
            <h2 className="text-base sm:text-lg font-bold text-[#26364B]">
              {tr(
                language,
                'ধাপ ২: প্রাথমিক যোগ্যতা যাচাই (ঐচ্ছিক, সহজ প্রশ্ন)',
                'चरण 2: प्रारंभिक पात्रता जांच (कोई व्यक्तिगत आईडी नहीं मांगी जाती)',
                'Step 2: Quick Preliminary Eligibility Check (No personal ID asked)'
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1.5">
                  {tr(language, 'পশ্চিমবঙ্গের বাসিন্দা?', 'पश्चिम बंगाल के निवासी?', 'West Bengal Resident?')}
                </label>
                <select
                  value={answers.wbResident}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, wbResident: e.target.value }))}
                  className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2.5 text-sm"
                >
                  <option value="">{tr(language, 'বেছে নিন', 'चुनें', 'Select')}</option>
                  <option value="yes">{tr(language, 'হ্যাঁ', 'हाँ', 'Yes')}</option>
                  <option value="no">{tr(language, 'না', 'नहीं', 'No')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1.5">
                  {tr(language, 'আবেদনকারীর বয়স (বছর)', 'आवेदक की आयु (वर्ष)', 'Applicant Age (Years)')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={answers.age}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, age: e.target.value }))}
                  placeholder={tr(language, 'যেমন: ২৮', 'जैसे: 28', 'e.g. 28')}
                  className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1.5">
                  {tr(language, 'আবেদনকারীর শ্রেণি', 'आवेदक की श्रेणी', 'Applicant Category')}
                </label>
                <select
                  value={answers.applicantGroup}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, applicantGroup: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2.5 text-sm"
                >
                  <option value="">{tr(language, 'বেছে নিন', 'चुनें', 'Select')}</option>
                  <option value="woman">{tr(language, 'মহিলা / ছাত্রী', 'महिला / छात्रा', 'Woman / Girl Student')}</option>
                  <option value="male">{tr(language, 'পুরুষ / ছাত্র', 'पुरुष / छात्र', 'Man / Boy Student')}</option>
                  <option value="other">{tr(language, 'অন্যান্য', 'अन्य', 'Other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1.5">
                  {tr(language, 'স্থায়ী সরকারি চাকরি আছে?', 'नियमित सरकारी कर्मचारी?', 'Regular Govt Employee?')}
                </label>
                <select
                  value={answers.isGovtEmployee}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, isGovtEmployee: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2.5 text-sm"
                >
                  <option value="">{tr(language, 'বেছে নিন', 'चुनें', 'Select')}</option>
                  <option value="no">{tr(language, 'না', 'नहीं', 'No')}</option>
                  <option value="yes">{tr(language, 'হ্যাঁ', 'हाँ', 'Yes')}</option>
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
          <section className="rounded-2xl bg-white border border-[#F2DCC1] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#26364B] flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A]" />
                  {tr(
                    language,
                    'ধাপ ৩: প্রতিটি কাগজের অবস্থা চিহ্নিত করুন',
                    'चरण 3: अपने फ़ोल्डर में हर दस्तावेज़ की स्थिति चिह्नित करें',
                    'Step 3: Mark Each Document in Your Folder'
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-[#454545] mt-0.5">
                  {tr(
                    language,
                    'প্রস্তুত / নেই / প্রযোজ্য নয় / সাহায্য দরকার — যেকোনো একটি বেছে নিন।',
                    'प्रत्येक दस्तावेज़ को तैयार, अनुपस्थित, लागू नहीं या सहायता चाहिए के रूप में चिह्नित करें।',
                    'Mark each item as Ready, Missing, Not Applicable, or Need Help.'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-[#A85B0A] dark:text-[#FFD19A]">
                  {tr(language, `প্রস্তুত: ${stats.ready}/${stats.total}`, `तैयार: ${stats.ready}/${stats.total}`, `Ready: ${stats.ready}/${stats.total}`)}
                </span>
                {stats.missing > 0 && (
                  <span className="text-red-700">
                    {tr(language, `নেই: ${stats.missing}`, `अनुपस्थित: ${stats.missing}`, `Missing: ${stats.missing}`)}
                  </span>
                )}
                {stats.needHelp > 0 && (
                  <span className="text-[#A85B0A]">
                    {tr(language, `সাহায্য দরকার: ${stats.needHelp}`, `सहायता चाहिए: ${stats.needHelp}`, `Need Help: ${stats.needHelp}`)}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-[#EFECE3] overflow-hidden">
              <div
                className="h-full bg-[#F4A340] transition-all duration-300"
                style={{
                  width: `${stats.total > 0 ? Math.round(((stats.ready + stats.na) / stats.total) * 100) : 0}%`,
                }}
              />
            </div>

            <div className="space-y-3">
              {activePreset.documents.map((doc, idx) => {
                const state = currentDocStates[`doc-${idx}`];
                const docLabel = tr(language, doc.bn, doc.hi, doc.en);
                const tipText = tr(language, doc.tipBn, doc.tipHi, doc.tipEn);

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 space-y-3 transition-colors ${
                      state === 'ready'
                        ? 'bg-[#E9F5EF]/75 dark:bg-[#143022]/60 border-[#27845B]/40'
                        : state === 'missing'
                          ? 'bg-red-50/60 border-red-200'
                          : state === 'need_help'
                            ? 'bg-[#FEF4E6]/70 border-[#F4A340]/60'
                            : 'bg-[#FFF1DF] border-[#F2DCC1]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-[#454545] mb-0.5">
                          {doc.optional
                            ? tr(language, 'ঐচ্ছিক / শর্তসাপেক্ষ নথি', 'वैकल्पिक / यदि लागू हो', 'Optional / If Applicable')
                            : tr(language, 'প্রয়োজনীয় নথি', 'आवश्यक दस्तावेज़', 'Required Document')}
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-[#26364B]">
                          {idx + 1}. {docLabel}
                        </p>
                        <p className="text-xs text-[#454545] mt-1">{tipText}</p>
                      </div>
                      {state === 'ready' && (
                        <CheckCircle2 className="w-5 h-5 text-[#27845B] dark:text-[#45B884] shrink-0" />
                      )}
                      {state === 'missing' && (
                        <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
                      )}
                      {state === 'need_help' && (
                        <HelpCircle className="w-5 h-5 text-[#A85B0A] shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 print:hidden">
                      {(
                        [
                          { id: 'ready', bn: 'প্রস্তুত আছে', hi: 'तैयार है', en: 'Ready' },
                          { id: 'missing', bn: 'এখন নেই', hi: 'अभी नहीं है', en: 'Missing' },
                          { id: 'not_applicable', bn: 'প্রযোজ্য নয়', hi: 'लागू नहीं', en: 'Not Applicable' },
                          { id: 'need_help', bn: 'সাহায্য দরকার', hi: 'सहायता चाहिए', en: 'Need Help' },
                        ] as { id: DocState; bn: string; hi: string; en: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateDocState(idx, opt.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[36px] ${
                            state === opt.id
                              ? opt.id === 'ready'
                                ? 'bg-[#27845B] text-white border-[#27845B]'
                                : opt.id === 'missing'
                                  ? 'bg-red-700 text-white border-red-700'
                                  : opt.id === 'need_help'
                                    ? 'bg-[#FFD19A] text-[#26364B] border-[#F4A340]'
                                    : 'bg-[#26364B] text-white border-[#26364B]'
                              : 'bg-white text-[#26364B] border-[#F2DCC1] hover:bg-[#FFF1DF]'
                          }`}
                        >
                          {tr(language, opt.bn, opt.hi, opt.en)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 6 & 7: Structured "Before You Visit" Summary + Practical Actions */}
            <div className="rounded-xl bg-[#FFF1DF] border border-[#F2DCC1] p-5 space-y-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#27845B] dark:text-[#45B884] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-[#26364B]">
                    {tr(language, 'যাওয়ার আগে প্রস্তুতি সারাংশ', 'कार्यालय जाने से पहले तैयारी सारांश', 'Before You Visit Summary')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#454545] mt-1">
                    {stats.ready + stats.na === stats.total && stats.total > 0
                      ? tr(
                          language,
                          'অভিনন্দন! আপনার ফোল্ডার প্রস্তুতি সম্পন্ন হয়েছে। মূল কপি ও ২ সেট ফটোকপি নিয়ে বেরোন।',
                          'बधाई हो! आपकी फ़ोल्डर चेकलिस्ट पूरी हो गई है। मूल दस्तावेज़ और 2 साफ़ फोटोकॉपी सेट साथ लेकर जाएं।',
                          'Great! Your folder checklist is complete. Carry originals and 2 clear photocopy sets.'
                        )
                      : tr(
                          language,
                          `প্রস্তুত: ${stats.ready}টি · এখন নেই: ${stats.missing}টি · সাহায্য দরকার: ${stats.needHelp}টি · বাকি: ${stats.unchecked}টি`,
                          `तैयार: ${stats.ready} · अनुपस्थित: ${stats.missing} · सहायता चाहिए: ${stats.needHelp} · शेष: ${stats.unchecked}`,
                          `Ready: ${stats.ready} · Missing: ${stats.missing} · Need Help: ${stats.needHelp} · Unmarked: ${stats.unchecked}`
                        )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="rounded-xl bg-white border border-[#F2DCC1] p-4 space-y-2">
                  <p className="font-bold text-[#A85B0A] dark:text-[#FFD19A]">
                    {tr(language, 'সাথে নিয়ে যাওয়ার কাগজ (প্রস্তুত)', 'साथ ले जाने के लिए तैयार दस्तावेज़', 'Documents Ready to Carry')}
                  </p>
                  {stats.ready === 0 ? (
                    <p className="text-[#454545]">
                      {tr(
                        language,
                        'এখনো কোনো কাগজ "প্রস্তুত আছে" চিহ্নিত করা হয়নি।',
                        'अभी तक कोई भी दस्तावेज़ "तैयार है" चिह्नित नहीं किया गया है।',
                        'No documents marked Ready yet.'
                      )}
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[#26364B] list-disc pl-4">
                      {activePreset.documents
                        .filter((_, i) => currentDocStates[`doc-${i}`] === 'ready')
                        .map((d, i) => (
                          <li key={i}>{tr(language, d.bn, d.hi, d.en)}</li>
                        ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl bg-white border border-[#F2DCC1] p-4 space-y-2">
                  <p className="font-bold text-[#A85B0A]">
                    {tr(
                      language,
                      'যাওয়ার আগে যা ঠিক বা জোগাড় করতে হবে',
                      'जाने से पहले जिन्हें पूरा करना या मदद लेना जरूरी है',
                      'Needs Completion / Help Before Visiting'
                    )}
                  </p>
                  {stats.missing + stats.needHelp === 0 ? (
                    <p className="text-[#454545]">
                      {tr(
                        language,
                        'কোনো অনুপস্থিত নথি চিহ্নিত নেই। তবুও অফিসে যাওয়ার আগে কাউন্টারের সময় নিশ্চিত করুন।',
                        'कोई अनुपस्थित दस्तावेज़ चिह्नित नहीं है। फिर भी जाने से पहले कार्यालय का समय सुनिश्चित कर लें।',
                        'No missing items flagged. Confirm office counter timings before travelling.'
                      )}
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[#26364B] list-disc pl-4">
                      {activePreset.documents
                        .filter(
                          (_, i) =>
                            currentDocStates[`doc-${i}`] === 'missing' ||
                            currentDocStates[`doc-${i}`] === 'need_help'
                        )
                        .map((d, i) => (
                          <li key={i}>{tr(language, d.bn, d.hi, d.en)}</li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-white border border-[#F2DCC1] p-4 text-xs text-[#454545] space-y-1">
                <p className="font-bold text-[#26364B]">
                  {tr(language, 'যাত্রার আগে নিশ্চিত করুন:', 'जाने से पहले सुनिश्चित करें:', 'Details to Confirm Before Travelling:')}
                </p>
                <p>
                  {tr(
                    language,
                    '১) স্থানীয় BSK বা BDO অফিস খোলা থাকার দিন ও সময় · ২) আধারে যুক্ত মোবাইল ফোন সাথে আছে · ৩) মূল নথি + ২ সেট জেরক্স ও পাসপোর্ট ছবি।',
                    '1) स्थानीय BSK / BDO कार्यालय का सही समय · 2) आधार से जुड़ा मोबाइल फोन साथ रखें · 3) मूल दस्तावेज़ + 2 फोटोकॉपी सेट और पासपोर्ट फोटो साथ लें।',
                    '1) Exact local BSK / BDO counter hours · 2) Carry your Aadhaar-linked mobile phone · 3) Carry originals + 2 photocopy sets & passport photos.'
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 print:hidden">
                <button
                  type="button"
                  onClick={() => {
                    trackAnalyticsEvent('checklist_completed', activePreset.id);
                    window.print();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl jenova-saffron-btn text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
                >
                  <Printer className="w-4 h-4" />
                  {tr(language, 'প্রিন্ট / PDF সেভ করুন', 'प्रिंट / PDF सेव करें', 'Print / Save PDF')}
                </button>
                <button
                  type="button"
                  onClick={downloadChecklistTxt}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#F2DCC1] hover:bg-[#FFE5C2] text-[#26364B] text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
                >
                  <Download className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
                  {tr(language, 'চেকলিস্ট ডাউনলোড (.txt)', 'चेकलिस्ट डाउनलोड करें (.txt)', 'Download Checklist')}
                </button>
                <a
                  href={buildWhatsAppShareUrl(
                    `${activeTitle} — JENOVA Checklist`,
                    buildChecklistText(),
                    `/checklist/${activePreset.id}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#F2DCC1] hover:bg-[#FFE5C2] text-[#26364B] text-xs sm:text-sm font-semibold min-h-[44px]"
                >
                  <Share2 className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
                  {tr(language, 'হোয়াটসঅ্যাপে পাঠান', 'व्हाट्सएप पर शेयर करें', 'Share on WhatsApp')}
                </a>
                <a
                  href={activePreset.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackAnalyticsEvent('scheme_referral', activePreset.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FEF4E6] border border-[#F4A340]/60 text-[#6B3F06] hover:bg-[#FDE7C8] text-xs sm:text-sm font-semibold min-h-[44px]"
                >
                  {tr(language, 'অফিসিয়াল পোর্টাল', 'आधिकारिक पोर्टल', 'Official Portal')}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/local-help')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#F4A340]/40 text-[#A85B0A] dark:text-[#FFD19A] hover:bg-[#FFE5C2] text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
                >
                  <MapPin className="w-4 h-4" />
                  {tr(language, 'নিকটস্থ BSK / স্থানীয় সহায়তা', 'नज़दीकी BSK / स्थानीय सहायता', 'Find Nearest BSK / Local Help')}
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
