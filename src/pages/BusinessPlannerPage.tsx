import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  ExternalLink,
  FileText,
  FolderCheck,
  Megaphone,
  Plus,
  Printer,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../i18n/translations';
import { trackAnalyticsEvent } from '../lib/api';
import type { BusinessStartupCostItem, Language, SavedBusinessPlan } from '../types/platform';
import { PageHeader, SafetyNotice } from '../components/SharedUI';
import { MsmeTabs } from './MsmePages';

interface StarterTemplate {
  id: string;
  label: { bn: string; hi: string; en: string };
  businessName: { bn: string; hi: string; en: string };
  category: string;
  targetCustomers: { bn: string; hi: string; en: string };
  valueProposition: { bn: string; hi: string; en: string };
  startupCosts: { item: { bn: string; hi: string; en: string }; amount: number }[];
  unitPrice: number;
  unitCost: number;
  expectedMonthlyUnits: number;
  fixedMonthlyCost: number;
  marketingSteps: { bn: string; hi: string; en: string }[];
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'tailoring',
    label: {
      bn: 'সেলাই ও পোশাক স্টুডিও',
      hi: 'सिलाई और परिधान स्टूडियो',
      en: 'Tailoring & Garment Studio',
    },
    businessName: {
      bn: 'আমার গৃহভিত্তিক সেলাই ও ব্লাউজ স্টুডিও',
      hi: 'मेरा घरेलू सिलाई और ब्लाउज़ स्टूडियो',
      en: 'Home Tailoring & Alteration Studio',
    },
    category: 'Tailoring & Garments',
    targetCustomers: {
      bn: 'আশেপাশের পাড়ার মহিলা, স্কুলের পোশাকের অভিভাবক ও উৎসবের অর্ডার',
      hi: 'पड़ोस के परिवार, स्कूल यूनिफॉर्म के अभिभावक और त्योहारों के ग्राहक',
      en: 'Neighbourhood women, school uniform parents, and festive tailoring customers',
    },
    valueProposition: {
      bn: 'সঠিক মাপে, নির্দিষ্ট সময়ে ডেলিভারি এবং স্বচ্ছ রেট চার্ট',
      hi: 'सही फिटिंग, समय पर डिलीवरी और स्पष्ट रेट कार्ड',
      en: 'Accurate fitting, on-time delivery, and a transparent printed rate card',
    },
    startupCosts: [
      {
        item: { bn: 'সেলাই মেশিন (প্যাডেল / মোটর)', hi: 'सिलाई मशीन (पैडल / मोटर)', en: 'Sewing Machine (Pedal / Motor)' },
        amount: 9500,
      },
      {
        item: { bn: 'কাঁচি, ফিতে, ইস্ত্রি ও টেবিল', hi: 'कैंची, टेप, प्रेस और टेबल', en: 'Scissors, Tape, Iron & Work Table' },
        amount: 2500,
      },
      {
        item: { bn: 'সুতো, আস্তর, হুক ও প্রাথমিক সরঞ্জাম', hi: 'धागा, अस्तर, हुक और शुरुआती सामान', en: 'Threads, Lining, Hooks & Initial Stock' },
        amount: 2000,
      },
      {
        item: { bn: 'রেট কার্ড ও বোর্ড ছাপানো', hi: 'रेट कार्ड और साइनबोर्ड', en: 'Printed Rate Card & Small Signboard' },
        amount: 600,
      },
    ],
    unitPrice: 280,
    unitCost: 75,
    expectedMonthlyUnits: 45,
    fixedMonthlyCost: 1200,
    marketingSteps: [
      {
        bn: 'পাড়ার ১৫–২০ জন পরিবারের মধ্যে স্পষ্ট রেট কার্ড ও WhatsApp নম্বর শেয়ার করুন।',
        hi: 'पड़ोस के 15–20 परिवारों को स्पष्ट रेट कार्ड और WhatsApp नंबर दें।',
        en: 'Share a clear printed rate card and WhatsApp contact with 15–20 local families.',
      },
      {
        bn: 'প্রথম ৫টি তৈরি কাজের পরিষ্কার ছবি (গ্রাহকের অনুমতিসহ) WhatsApp স্ট্যাটাসে দিন।',
        hi: 'ग्राहक की अनुमति से पहले 5 कार्यों की साफ फोटो WhatsApp स्टेटस पर लगाएं।',
        en: 'Share clear photos of your first 5 finished pieces (with customer permission) on WhatsApp status.',
      },
      {
        bn: 'নিকটবর্তী কাপড়ের দোকানের সাথে অল্টারেশন রেফারেল সম্পর্ক গড়ে তুলুন।',
        hi: 'पास की कपड़ों की दुकानों से अल्टरेशन रेफरल के लिए बात करें।',
        en: 'Build an alteration referral relationship with 2 nearby fabric shops.',
      },
    ],
  },
  {
    id: 'food-tiffin',
    label: {
      bn: 'ঘরোয়া টিফিন ও খাবার পরিষেবা',
      hi: 'घरेलू टिफिन और भोजन सेवा',
      en: 'Home Food / Tiffin Service',
    },
    businessName: {
      bn: 'স্বাস্থ্যকর ঘরোয়া টিফিন পরিষেবা',
      hi: 'स्वास्थ्यकर घरेलू टिफिन सेवा',
      en: 'Hygienic Home Tiffin Service',
    },
    category: 'Food & Tiffin',
    targetCustomers: {
      bn: 'স্থানীয় অফিস কর্মী, কলেজ পড়ুয়া, দোকানদার ও প্রবীণ পরিবার',
      hi: 'स्थानीय ऑफिस कर्मचारी, छात्र, दुकानदार और वरिष्ठ नागरिक परिवार',
      en: 'Local office staff, students, shopkeepers, and senior citizen households',
    },
    valueProposition: {
      bn: 'পরিষ্কার-পরিচ্ছন্ন, কম তেলে তাজা ঘরোয়া রান্না ও সাপ্তাহিক মেনু',
      hi: 'स्वच्छ, कम तेल वाला ताज़ा घर का खाना और साप्ताहिक मेन्यू',
      en: 'Clean, low-oil fresh home-cooked meals with a predictable weekly menu',
    },
    startupCosts: [
      {
        item: { bn: 'বড় রান্নার বাসন ও হট-কেস টিফিন', hi: 'बड़े बर्तन और हॉट-केस टिफिन बॉक्स', en: 'Cooking Utensils & Insulated Tiffin Boxes' },
        amount: 5500,
      },
      {
        item: { bn: 'প্রথম সপ্তাহের চাল, ডাল, মশলা ও প্যাকেজিং', hi: 'पहले सप्ताह का राशन, मसाले और पैकेजिंग', en: 'First Week Groceries, Spices & Packaging' },
        amount: 3500,
      },
      {
        item: { bn: 'অফিসিয়াল FSSAI বেসিক রেজিস্ট্রেশন (সরকারি ফি)', hi: 'आधिकारिक FSSAI बेसिक पंजीकरण (सरकारी शुल्क)', en: 'Official FSSAI Basic Registration (Govt Fee)' },
        amount: 100,
      },
    ],
    unitPrice: 80,
    unitCost: 46,
    expectedMonthlyUnits: 320,
    fixedMonthlyCost: 2600,
    marketingSteps: [
      {
        bn: '৫ জন পরিচিত অফিস কর্মী বা ছাত্রকে ট্রায়াল মিল দিয়ে সৎ মতামত নিন।',
        hi: '5 परिचित ऑफिस कर्मचारियों या छात्रों को ट्रायल मील देकर ईमानदार फीडबैक लें।',
        en: 'Offer 5 trial meals to known local students or office staff and collect honest feedback.',
      },
      {
        bn: 'সাপ্তাহিক মেনু ও সময়সূচী ছাপিয়ে স্থানীয় কোচিং ও অফিস পাড়ায় দিন।',
        hi: 'साप्ताहिक मेन्यू और समय-सारिणी छपवाकर स्थानीय ऑफिस और कोचिंग के पास बांटें।',
        en: 'Share a clean weekly menu card around local coaching centres, clinics, and offices.',
      },
      {
        bn: 'পরিচ্ছন্ন রান্না ও সময়মতো ডেলিভারি নিশ্চিত করে মাসিক সাবস্ক্রিপশন অফার করুন।',
        hi: 'स्वच्छता और समय पर डिलीवरी के साथ मासिक सब्सक्रिप्शन विकल्प दें।',
        en: 'Maintain strict hygiene and punctuality to convert daily buyers into weekly/monthly regulars.',
      },
    ],
  },
  {
    id: 'digital-shop',
    label: {
      bn: 'ডিজিটাল সেবা ও প্রিন্ট কাউন্টার',
      hi: 'डिजिटल सेवा और प्रिंट काउंटर',
      en: 'Digital Seva & Print Counter',
    },
    businessName: {
      bn: 'স্থানীয় ডিজিটাল ফর্ম, প্রিন্ট ও ডকুমেন্ট কাউন্টার',
      hi: 'स्थानीय डिजिटल फॉर्म, प्रिंट और दस्तावेज़ काउंटर',
      en: 'Local Digital Form, Print & Document Desk',
    },
    category: 'Digital & Services',
    targetCustomers: {
      bn: 'ছাত্রছাত্রী, চাকরিপ্রার্থী ও এলাকার সাধারণ নাগরিক (প্রিন্ট, স্ক্যান, অনলাইন ফর্ম)',
      hi: 'छात्र, नौकरी के आवेदक और स्थानीय नागरिक (प्रिंट, स्कैन, ऑनलाइन फॉर्म)',
      en: 'Students, job seekers, and local citizens needing printing, scanning, and transparent form assistance',
    },
    valueProposition: {
      bn: 'স্বচ্ছ রসিদ, গোপনীয়তা রক্ষা এবং সরকারি পোর্টালে সঠিক ফর্ম পূরণ সহায়তা',
      hi: 'पारदर्शी रसीद, गोपनीयता सुरक्षा और आधिकारिक पोर्टल पर सही फॉर्म सहायता',
      en: 'Transparent printed fee chart, strict OTP/data privacy, and accurate form assistance',
    },
    startupCosts: [
      {
        item: { bn: 'ল্যাপটপ বা ডেস্কটপ কম্পিউটার', hi: 'लैपटॉप या डेस्कटॉप कंप्यूटर', en: 'Laptop or Desktop Computer' },
        amount: 26000,
      },
      {
        item: { bn: 'অল-ইন-ওয়ান প্রিন্টার ও স্ক্যানার', hi: 'ऑल-इन-वन प्रिंटर और स्कैनर', en: 'All-in-One Printer & Scanner' },
        amount: 13500,
      },
      {
        item: { bn: 'ল্যামিনেশন মেশিন, কাগজ ও কালি', hi: 'लैमिनेशन मशीन, पेपर और स्याही', en: 'Lamination Machine, Paper & Ink' },
        amount: 4500,
      },
      {
        item: { bn: 'ইন্টারনেট সংযোগ ও টেবিল-চেয়ার', hi: 'इंटरनेट कनेक्शन और फर्नीचर', en: 'Internet Setup & Basic Desk/Chairs' },
        amount: 4000,
      },
    ],
    unitPrice: 45,
    unitCost: 12,
    expectedMonthlyUnits: 380,
    fixedMonthlyCost: 5200,
    marketingSteps: [
      {
        bn: 'দোকানের বাইরে স্পষ্ট পরিষেবা ও ফিসের তালিকা (যেমন প্রিন্ট, স্ক্যান, বায়োডাটা) টাঙান।',
        hi: 'दुकान के बाहर स्पष्ट सेवा और शुल्क सूची (प्रिंट, स्कैन, बायोडाटा) लगाएं।',
        en: 'Display a transparent service & price board outside (printing, scanning, biodata, form help).',
      },
      {
        bn: 'কখনোই গ্রাহকের OTP বা পাসওয়ার্ড সংরক্ষণ করবেন না — এই সততাই স্থানীয় বিশ্বাস তৈরি করে।',
        hi: 'कभी भी ग्राहक का OTP या पासवर्ड सेव न करें — यही ईमानदारी स्थानीय विश्वास बनाती है।',
        en: 'Never store customer OTPs or passwords — visible digital ethics builds lasting community trust.',
      },
      {
        bn: 'স্কুল-কলেজ ভর্তি ও পরীক্ষার মরশুমে দ্রুত ও নির্ভুল ফর্ম পূরণ পরিষেবা দিন।',
        hi: 'स्कूल-कॉलेज प्रवेश और परीक्षा के समय तेज़ व सटीक फॉर्म सहायता दें।',
        en: 'Prepare in advance for school/college admission and exam application seasons.',
      },
    ],
  },
];

function defaultResearchChecks(language: Language) {
  return [
    {
      id: 'res-1',
      label: tr(
        language,
        'এলাকার অন্তত ১০–১৫ জন সম্ভাব্য গ্রাহকের সাথে তাদের চাহিদা ও দাম নিয়ে কথা বলেছি।',
        'अपने क्षेत्र के कम से कम 10–15 संभावित ग्राहकों से उनकी जरूरत और कीमत पर बात की है।',
        'Spoken with at least 10–15 potential local customers about their real need and budget.'
      ),
      done: false,
    },
    {
      id: 'res-2',
      label: tr(
        language,
        'কাছাকাছি ২–৩ জন বর্তমান দোকানদার বা পরিষেবা প্রদানকারীর দাম ও মান যাচাই করেছি।',
        'आस-पास के 2–3 मौजूदा विक्रेताओं की कीमत और सेवा गुणवत्ता की तुलना की है।',
        'Checked pricing and quality of 2–3 existing providers nearby.'
      ),
      done: false,
    },
    {
      id: 'res-3',
      label: tr(
        language,
        'কমপক্ষে ২ জন পাইকারি কাঁচামাল সরবরাহকারীর দর যাচাই করেছি।',
        'कम से कम 2 कच्चा माल आपूर्तिकर्ताओं से थोक दर की तुलना की है।',
        'Compared wholesale material prices from at least 2 suppliers.'
      ),
      done: false,
    },
    {
      id: 'res-4',
      label: tr(
        language,
        'বড় পুঁজি বিনিয়োগের আগে ছোট টেস্ট অর্ডার বা ট্রায়াল করার পরিকল্পনা করেছি।',
        'बड़ी पूंजी लगाने से पहले छोटे ट्रायल ऑर्डर से शुरुआत की योजना बनाई है।',
        'Planned a small pilot batch or trial order before committing full savings.'
      ),
      done: false,
    },
  ];
}

function defaultReadinessChecks(language: Language) {
  return [
    {
      id: 'rdy-1',
      label: tr(
        language,
        'ব্যবসা ও বাড়ির টাকার জন্য আলাদা খাতা (Cashbook) বা আলাদা ব্যাংক অ্যাকাউন্ট তৈরি।',
        'व्यवसाय और घर के खर्च के लिए अलग कैशबुक या अलग बैंक खाता तैयार।',
        'Separate cashbook or bank account ready for business vs. household money.'
      ),
      done: false,
    },
    {
      id: 'rdy-2',
      label: tr(
        language,
        'উদ্যম (Udyam) নিবন্ধন সম্পূর্ণ ফ্রি (₹০) — এজেন্ট ছাড়া udyamregistration.gov.in-এ করার প্রস্তুতি।',
        'उद्यम (Udyam) पंजीकरण पूर्णतः निःशुल्क (₹0) — बिना एजेंट के udyamregistration.gov.in पर करने की तैयारी।',
        'Prepared for free (₹0) Udyam Registration directly on udyamregistration.gov.in without paid agents.'
      ),
      done: false,
    },
    {
      id: 'rdy-3',
      label: tr(
        language,
        'প্রথম ৩ মাসের স্থায়ী খরচ (ভাড়া, বিদ্যুৎ, যাতায়াত) সামলানোর মতো জরুরি সঞ্চয় হিসাব করেছি।',
        'पहले 3 महीनों के स्थायी खर्च (किराया, बिजली) संभालने हेतु आपातकालीन बचत की गणना।',
        'Estimated an emergency buffer for the first 3 months of fixed operating costs.'
      ),
      done: false,
    },
    {
      id: 'rdy-4',
      label: tr(
        language,
        'চড়া সুদের অপ্রাতিষ্ঠানিক ঋণ এড়িয়ে চলব এবং কোনো ঋণ নিলে EMI আয়-ক্ষমতার মধ্যে রাখব।',
        'उच्च ब्याज वाले अनौपचारिक कर्ज से बचूंगा और ऋण लेने पर EMI अपनी क्षमता के अंदर रखूंगा।',
        'Committed to avoiding high-interest informal loans and checking EMI affordability first.'
      ),
      done: false,
    },
  ];
}

export function BusinessPlannerPage() {
  const {
    language,
    navigate,
    profile,
    businessPlans,
    saveBusinessPlan,
    deleteBusinessPlan,
    addPassportGoal,
    showToast,
  } = useApp();

  const initialTpl = STARTER_TEMPLATES[0];
  const defaultLocation = [profile.location.district, profile.location.state].filter(Boolean).join(', ');

  const [businessName, setBusinessName] = useState(initialTpl.businessName[language]);
  const [category, setCategory] = useState(initialTpl.category);
  const [location, setLocation] = useState(defaultLocation || 'Purba Medinipur, West Bengal');
  const [targetCustomers, setTargetCustomers] = useState(initialTpl.targetCustomers[language]);
  const [valueProposition, setValueProposition] = useState(initialTpl.valueProposition[language]);
  const [startupCosts, setStartupCosts] = useState<BusinessStartupCostItem[]>(() =>
    initialTpl.startupCosts.map((c, idx) => ({
      id: `sc-${idx + 1}`,
      item: c.item[language],
      amount: c.amount,
    }))
  );
  const [newCostItem, setNewCostItem] = useState('');
  const [newCostAmount, setNewCostAmount] = useState('');

  const [unitPrice, setUnitPrice] = useState(initialTpl.unitPrice);
  const [unitCost, setUnitCost] = useState(initialTpl.unitCost);
  const [expectedMonthlyUnits, setExpectedMonthlyUnits] = useState(initialTpl.expectedMonthlyUnits);
  const [fixedMonthlyCost, setFixedMonthlyCost] = useState(initialTpl.fixedMonthlyCost);

  const [customerResearchChecks, setCustomerResearchChecks] = useState(() =>
    defaultResearchChecks(language)
  );
  const [marketingSteps, setMarketingSteps] = useState<string[]>(() =>
    initialTpl.marketingSteps.map((m) => m[language])
  );
  const [newMarketingStep, setNewMarketingStep] = useState('');
  const [readinessChecks, setReadinessChecks] = useState(() => defaultReadinessChecks(language));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const applyTemplate = (tpl: StarterTemplate) => {
    setBusinessName(tpl.businessName[language]);
    setCategory(tpl.category);
    setTargetCustomers(tpl.targetCustomers[language]);
    setValueProposition(tpl.valueProposition[language]);
    setStartupCosts(
      tpl.startupCosts.map((c, idx) => ({
        id: `sc-${Date.now()}-${idx}`,
        item: c.item[language],
        amount: c.amount,
      }))
    );
    setUnitPrice(tpl.unitPrice);
    setUnitCost(tpl.unitCost);
    setExpectedMonthlyUnits(tpl.expectedMonthlyUnits);
    setFixedMonthlyCost(tpl.fixedMonthlyCost);
    setMarketingSteps(tpl.marketingSteps.map((m) => m[language]));
    setCustomerResearchChecks(defaultResearchChecks(language));
    setReadinessChecks(defaultReadinessChecks(language));
    showToast(
      tr(
        language,
        `"${tpl.label.bn}" টেমপ্লেট লোড হয়েছে। নিজের মতো পরিবর্তন করে সেভ করুন।`,
        `"${tpl.label.hi}" टेम्पलेट लोड हो गया है। अपने अनुसार बदलकर सहेजें।`,
        `Loaded "${tpl.label.en}" starter template. Customise numbers for your local area.`
      )
    );
  };

  const loadSavedPlan = (plan: SavedBusinessPlan) => {
    setBusinessName(plan.businessName);
    setCategory(plan.category);
    setLocation(plan.location);
    setTargetCustomers(plan.targetCustomers);
    setValueProposition(plan.valueProposition);
    setStartupCosts(plan.startupCosts);
    setUnitPrice(plan.unitPrice);
    setUnitCost(plan.unitCost);
    setExpectedMonthlyUnits(plan.expectedMonthlyUnits);
    setFixedMonthlyCost(plan.fixedMonthlyCost);
    setCustomerResearchChecks(plan.customerResearchChecks);
    setMarketingSteps(plan.marketingSteps);
    setReadinessChecks(plan.readinessChecks);
    setNotes(plan.notes);
    showToast(
      tr(language, 'সংরক্ষিত পরিকল্পনা লোড হয়েছে।', 'सहेजी गई योजना लोड हो गई।', 'Saved business plan loaded.')
    );
  };

  const financials = useMemo(() => {
    const totalStartupCapital = startupCosts.reduce((sum, item) => sum + Math.max(0, item.amount), 0);
    const marginPerUnit = unitPrice - unitCost;
    const monthlyRevenue = unitPrice * expectedMonthlyUnits;
    const monthlyVariable = unitCost * expectedMonthlyUnits;
    const totalMonthlyExpenses = monthlyVariable + fixedMonthlyCost;
    const estimatedMonthlySurplus = monthlyRevenue - totalMonthlyExpenses;
    const breakEvenUnits = marginPerUnit > 0 ? Math.ceil(fixedMonthlyCost / marginPerUnit) : null;
    const paybackMonths =
      estimatedMonthlySurplus > 0 && totalStartupCapital > 0
        ? Math.ceil(totalStartupCapital / estimatedMonthlySurplus)
        : null;
    return {
      totalStartupCapital,
      marginPerUnit,
      monthlyRevenue,
      totalMonthlyExpenses,
      estimatedMonthlySurplus,
      breakEvenUnits,
      paybackMonths,
    };
  }, [startupCosts, unitPrice, unitCost, expectedMonthlyUnits, fixedMonthlyCost]);

  const researchDone = customerResearchChecks.filter((c) => c.done).length;
  const readinessDone = readinessChecks.filter((c) => c.done).length;

  const addCostLine = () => {
    const label = newCostItem.trim();
    const amount = Number(newCostAmount);
    if (!label || !Number.isFinite(amount) || amount < 0) return;
    setStartupCosts((prev) => [...prev, { id: `sc-${Date.now()}`, item: label, amount }]);
    setNewCostItem('');
    setNewCostAmount('');
  };

  const addMarketingLine = () => {
    const txt = newMarketingStep.trim();
    if (!txt) return;
    setMarketingSteps((prev) => [...prev, txt]);
    setNewMarketingStep('');
  };

  const handleSavePlan = async () => {
    if (!businessName.trim() || saving) return;
    setSaving(true);
    try {
      await saveBusinessPlan({
        businessName: businessName.trim(),
        category: category.trim() || 'Micro Enterprise',
        location: location.trim() || defaultLocation || 'India',
        targetCustomers: targetCustomers.trim(),
        valueProposition: valueProposition.trim(),
        startupCosts,
        unitPrice,
        unitCost,
        expectedMonthlyUnits,
        fixedMonthlyCost,
        customerResearchChecks,
        marketingSteps,
        readinessChecks,
        notes: notes.trim(),
      });
      showToast(
        tr(
          language,
          'ব্যবসার পরিকল্পনা সংরক্ষিত হয়েছে!',
          'व्यवसाय योजना सहेजी गई है!',
          'Business plan saved to your profile!'
        )
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to save business plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendToPassport = async () => {
    try {
      await addPassportGoal({
        title: `${tr(language, 'ব্যবসা প্রস্তুতি:', 'व्यवसाय तैयारी:', 'Launch Plan:')} ${businessName.trim() || 'My Small Business'}`,
        category: 'business',
        linkedPath: '/msme/planner',
        officialUrl: 'https://udyamregistration.gov.in/',
        steps: [
          {
            id: 'bp-step-1',
            title: tr(
              language,
              'স্থানীয় ১০–১৫ জন সম্ভাব্য গ্রাহকের সাথে চাহিদা ও দাম যাচাই করুন',
              '10–15 स्थानीय संभावित ग्राहकों से मांग और कीमत जांचें',
              'Validate local demand and pricing with 10–15 potential customers'
            ),
            done: researchDone >= 2,
          },
          {
            id: 'bp-step-2',
            title: tr(
              language,
              `প্রাথমিক মূলধন (₹${financials.totalStartupCapital.toLocaleString('en-IN')}) ও ছোট ট্রায়াল ব্যাচ প্রস্তুত করুন`,
              `शुरुआती पूंजी (₹${financials.totalStartupCapital.toLocaleString('en-IN')}) और छोटे ट्रायल बैच की तैयारी करें`,
              `Prepare startup budget (₹${financials.totalStartupCapital.toLocaleString('en-IN')}) and run a small pilot batch`
            ),
            done: false,
          },
          {
            id: 'bp-step-3',
            title: tr(
              language,
              'JENOVA UDAAN-এ বিজনেস প্ল্যান ও MSME মডিউল সম্পূর্ণ করুন',
              'JENOVA UDAAN में बिजनेस प्लान और MSME मॉड्यूल पूरा करें',
              'Complete JENOVA UDAAN Business Plan & MSME modules'
            ),
            done: false,
          },
          {
            id: 'bp-step-4',
            title: tr(
              language,
              'অফিসিয়াল পোর্টাল (udyamregistration.gov.in) থেকে ফ্রি উদ্যম নিবন্ধন করুন',
              'आधिकारिक पोर्टल (udyamregistration.gov.in) पर निःशुल्क उद्यम पंजीकरण करें',
              'Register free (₹0) Udyam MSME directly on udyamregistration.gov.in'
            ),
            done: false,
            officialUrl: 'https://udyamregistration.gov.in/',
          },
        ],
        documentsChecklist: [
          { id: 'doc-1', label: tr(language, 'আধার কার্ড (মোবাইল সংযুক্ত)', 'आधार कार्ड (मोबाइल लिंक)', 'Aadhaar Card (Mobile-linked)'), ready: false },
          { id: 'doc-2', label: tr(language, 'ব্যাংক পাসবুক ও আলাদা ক্যাশবুক', 'बैंक पासबुक और अलग कैशबुक', 'Bank Passbook & Separate Cashbook'), ready: false },
          { id: 'doc-3', label: tr(language, '১-পৃষ্ঠার ব্যবসার বাজেট ও রেট কার্ড', '1-पृष्ठ व्यवसाय बजट और रेट कार्ड', '1-Page Business Budget & Rate Card'), ready: true },
        ],
        notes: `${tr(language, 'অবস্থান:', 'स्थान:', 'Location:')} ${location}. ${tr(language, 'ব্রেক-ইভেন:', 'ब्रेक-ईवन:', 'Break-even:')} ${financials.breakEvenUnits ?? '-'} ${tr(language, 'ইউনিট/মাস', 'यूनिट/माह', 'units/month')}.`,
      });
      showToast(
        tr(
          language,
          'ব্যবসার পরিকল্পনা JENOVA Action Passport-এ যোগ হয়েছে!',
          'व्यवसाय योजना JENOVA Action Passport में जोड़ी गई!',
          'Business plan added to your JENOVA Action Passport!'
        )
      );
      navigate('/passport');
    } catch {
      showToast(
        tr(language, 'অ্যাকশন পাসপোর্টে যোগ করা যায়নি।', 'एक्शन पासपोर्ट में नहीं जोड़ा जा सका।', 'Could not add to Action Passport.')
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title={tr(
          language,
          'স্ব-নিযুক্তি ও ক্ষুদ্র ব্যবসা পরিকল্পনা বিল্ডার',
          'स्वरोजगार और लघु व्यवसाय योजना बिल्डर',
          'Self-Employment & Micro-Business Plan Builder'
        )}
        subtitle={tr(
          language,
          'টাকা বিনিয়োগ করার আগে ধাপে ধাপে আপনার ক্ষুদ্র ব্যবসার প্রাথমিক পুঁজি, দাম, ব্রেক-ইভেন, গ্রাহক যাচাই ও প্রস্তুতি পরিকল্পনা তৈরি ও সংরক্ষণ করুন।',
          'पूंजी लगाने से पहले चरणबद्ध तरीके से अपने छोटे व्यवसाय की शुरुआती लागत, कीमत, ब्रेक-ईवन, ग्राहक जांच और तैयारी योजना बनाएं व सहेजें।',
          'Build and save a realistic 1-page business plan before spending savings: startup capital, pricing & break-even, customer validation, low-cost marketing, and launch readiness.'
        )}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSavePlan}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold jenova-saffron-btn rounded-lg cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {saving
                  ? tr(language, 'সেভ হচ্ছে...', 'सहेजा जा रहा है...', 'Saving...')
                  : tr(language, 'পরিকল্পনা সেভ করুন', 'योजना सहेजें', 'Save Business Plan')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#26364B] bg-white border border-[#F2DCC1] hover:border-[#F4A340] rounded-lg cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{tr(language, 'প্রিন্ট / PDF', 'प्रिंट / PDF', 'Print 1-Page Plan')}</span>
            </button>
          </div>
        }
      />

      <MsmeTabs active="planner" />

      {/* Starter Templates Bar */}
      <section className="p-5 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A85B0A]" />
            <h2 className="text-sm font-bold text-[#26364B]">
              {tr(
                language,
                '১-ক্লিকে উদাহরণ টেমপ্লেট দিয়ে শুরু করুন (নিজের এলাকা অনুযায়ী বদলে নিন)',
                '1-क्लिक शुरुआती टेम्पलेट चुनें (अपने क्षेत्र के अनुसार बदलें)',
                'Start with a 1-Click Starter Template (Customise for Your Local Area)'
              )}
            </h2>
          </div>
          <span className="text-[11px] text-[#454545]">
            {tr(
              language,
              'আনুমানিক উদাহরণ — নিশ্চিত আয়ের প্রতিশ্রুতি নয়',
              'अनुमानित उदाहरण — आय की गारंटी नहीं',
              'Illustrative planning estimates — not guaranteed income'
            )}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STARTER_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] text-[#26364B] hover:border-[#F4A340] hover:bg-[#FFE5C2] hover:text-[#26364B] dark:text-[#FFD19A] transition-colors cursor-pointer"
            >
              {tpl.label[language]}
            </button>
          ))}
        </div>
      </section>

      {/* Main 12-Column Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 columns: Guided Builder */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Business Core */}
          <section className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
            <h2 className="text-base font-bold text-[#26364B] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
              <span>
                {tr(
                  language,
                  'ধাপ ১: ব্যবসার মূল পরিচিতি ও গ্রাহক',
                  'चरण 1: व्यवसाय की मूल पहचान और ग्राहक',
                  'Step 1: Business Concept & Target Customers'
                )}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'ব্যবসার নাম *', 'व्यवसाय का नाम *', 'Business Name *')}
                </label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'বিভাগ', 'श्रेणी', 'Category')}
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'এলাকা / জেলা ও রাজ্য', 'क्षेत्र / जिला और राज्य', 'Target Locality / District & State')}
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'আপনার মূল গ্রাহক কারা?', 'आपके मुख्य ग्राहक कौन हैं?', 'Who are your target customers?')}
                </label>
                <input
                  value={targetCustomers}
                  onChange={(e) => setTargetCustomers(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(
                    language,
                    'গ্রাহকরা কেন আপনার কাছ থেকে নেবেন? (মূল সুবিধা)',
                    'ग्राहक आपसे क्यों खरीदेंगे? (मुख्य विशेषता)',
                    'Why will customers choose you? (Value Proposition)'
                  )}
                </label>
                <textarea
                  rows={2}
                  value={valueProposition}
                  onChange={(e) => setValueProposition(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Step 2: Startup Cost Calculator */}
          <section className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#26364B] flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
                <span>
                  {tr(
                    language,
                    'ধাপ ২: প্রাথমিক মূলধন (Startup Cost) হিসাব',
                    'चरण 2: शुरुआती पूंजी (Startup Cost) कैलकुलेटर',
                    'Step 2: Startup Cost Calculator'
                  )}
                </span>
              </h2>
              <span className="text-sm font-bold font-mono tabular-nums text-[#A85B0A] dark:text-[#FFD19A]">
                {tr(language, 'মোট:', 'कुल:', 'Total:')} ₹
                {financials.totalStartupCapital.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2">
              {startupCosts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1]"
                >
                  <span className="text-sm text-[#26364B] flex-1">{c.item}</span>
                  <input
                    type="number"
                    min={0}
                    value={c.amount}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setStartupCosts((prev) =>
                        prev.map((x) => (x.id === c.id ? { ...x, amount: val } : x))
                      );
                    }}
                    className="w-28 rounded-lg border border-[#F2DCC1] bg-white px-2.5 py-1 text-xs font-mono tabular-nums text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setStartupCosts((prev) => prev.filter((x) => x.id !== c.id))}
                    aria-label="Remove cost item"
                    className="p-1.5 text-[#665B4F] hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={newCostItem}
                onChange={(e) => setNewCostItem(e.target.value)}
                placeholder={tr(
                  language,
                  'নতুন খরচের নাম (যেমন টেবিল / স্টক)',
                  'नया खर्च जोड़ें (जैसे टेबल / स्टॉक)',
                  'Add cost item (e.g. Table / Initial Stock)'
                )}
                className="flex-1 rounded-lg border border-[#F2DCC1] px-3 py-2 text-xs"
              />
              <input
                type="number"
                min={0}
                value={newCostAmount}
                onChange={(e) => setNewCostAmount(e.target.value)}
                placeholder="₹ Amount"
                className="sm:w-32 rounded-lg border border-[#F2DCC1] px-3 py-2 text-xs font-mono"
              />
              <button
                type="button"
                onClick={addCostLine}
                className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] bg-[#FFE5C2] hover:bg-[#F4A340] hover:text-[#26364B] rounded-lg cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tr(language, 'যোগ করুন', 'जोड़ें', 'Add')}</span>
              </button>
            </div>
          </section>

          {/* Step 3: Pricing & Monthly Break-Even */}
          <section className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
            <h2 className="text-base font-bold text-[#26364B]">
              {tr(
                language,
                'ধাপ ৩: মূল্য নির্ধারণ ও মাসিক ব্রেক-ইভেন হিসাব',
                'चरण 3: मूल्य निर्धारण और मासिक ब्रेक-ईवन अनुमान',
                'Step 3: Pricing & Monthly Break-Even Estimator'
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'প্রতি পণ্য / পরিষেবার বিক্রয়মূল্য (₹)', 'प्रति यूनिट विक्रय मूल्य (₹)', 'Selling Price per Unit / Service (₹)')}
                </label>
                <input
                  type="number"
                  min={1}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'প্রতি ইউনিটে সরাসরি কাঁচামাল খরচ (₹)', 'प्रति यूनिट कच्चा माल लागत (₹)', 'Direct Material Cost per Unit (₹)')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={unitCost}
                  onChange={(e) => setUnitCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'সতর্ক আনুমানিক মাসিক বিক্রি (ইউনিট)', 'सावधानीपूर्ण मासिक बिक्री अनुमान (यूनिट)', 'Conservative Monthly Sales (Units)')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={expectedMonthlyUnits}
                  onChange={(e) => setExpectedMonthlyUnits(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'মাসিক স্থায়ী খরচ — ভাড়া, বিদ্যুৎ, ফোন (₹)', 'मासिक स्थायी खर्च — किराया, बिजली (₹)', 'Monthly Fixed Cost — Rent, Power, Phone (₹)')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={fixedMonthlyCost}
                  onChange={(e) => setFixedMonthlyCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1]">
                <p className="text-[11px] text-[#454545]">
                  {tr(language, 'মাসিক আয়', 'मासिक आय', 'Est. Revenue')}
                </p>
                <p className="text-base font-bold font-mono tabular-nums text-[#26364B] mt-0.5">
                  ₹{financials.monthlyRevenue.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1]">
                <p className="text-[11px] text-[#454545]">
                  {tr(language, 'আনুমানিক উদ্বৃত্ত', 'अनुमानित बचत', 'Est. Monthly Net')}
                </p>
                <p
                  className={`text-base font-bold font-mono tabular-nums mt-0.5 ${
                    financials.estimatedMonthlySurplus >= 0 ? 'text-[#27845B] dark:text-[#45B884]' : 'text-red-700'
                  }`}
                >
                  {financials.estimatedMonthlySurplus < 0 ? '-' : ''}₹
                  {Math.abs(financials.estimatedMonthlySurplus).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1]">
                <p className="text-[11px] text-[#454545]">
                  {tr(language, 'ব্রেক-ইভেন ইউনিট', 'ब्रेक-ईवन यूनिट', 'Break-Even Units')}
                </p>
                <p className="text-base font-bold font-mono tabular-nums text-[#A85B0A] mt-0.5">
                  {financials.breakEvenUnits !== null
                    ? `${financials.breakEvenUnits} / mo`
                    : tr(language, 'দাম বাড়ান', 'दाम जांचें', 'Price ≤ Cost')}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1]">
                <p className="text-[11px] text-[#454545]">
                  {tr(language, 'পুঁজি ফেরতের অনুমান', 'पूंजी वापसी अनुमान', 'Est. Payback')}
                </p>
                <p className="text-base font-bold font-mono tabular-nums text-[#26364B] mt-0.5">
                  {financials.paybackMonths !== null
                    ? `${financials.paybackMonths} ${tr(language, 'মাস', 'माह', 'mo')}`
                    : '—'}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[#665B4F]">
              {tr(
                language,
                'সতর্কতা: এগুলি কেবল আপনার দেওয়া সংখ্যার ওপর ভিত্তি করে গাণিতিক অনুমান। বাস্তব আয় স্থানীয় চাহিদা, মরশুম ও খরচের ওপর নির্ভর করে — কোনো লাভের গ্যারান্টি নয়।',
                'नोट: ये केवल आपके द्वारा दर्ज संख्याओं पर आधारित गणितीय अनुमान हैं। वास्तविक आय स्थानीय मांग और मौसम पर निर्भर करती है — लाभ की कोई गारंटी नहीं है।',
                'Note: These figures are mathematical estimates based solely on your inputs. Real earnings depend on local demand, seasonality, and costs — never a guarantee of profit.'
              )}
            </p>
          </section>

          {/* Step 4 & 5: Customer Research + Low-Cost Marketing + Readiness */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="p-5 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#26364B] flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
                  <span>
                    {tr(language, 'গ্রাহক যাচাই চেকলিস্ট', 'ग्राहक जांच चेकलिस्ट', 'Customer Research Checklist')}
                  </span>
                </h2>
                <span className="text-xs font-mono font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
                  {researchDone}/{customerResearchChecks.length}
                </span>
              </div>
              <div className="space-y-2">
                {customerResearchChecks.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] text-xs text-[#26364B] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        setCustomerResearchChecks((prev) =>
                          prev.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x))
                        )
                      }
                      className="mt-0.5 accent-[#F4A340]"
                    />
                    <span className={item.done ? 'line-through text-[#665B4F]' : ''}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="p-5 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#26364B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#27845B] dark:text-[#45B884]" />
                  <span>
                    {tr(language, 'ব্যবসা শুরুর প্রস্তুতি চেকলিস্ট', 'व्यवसाय तैयारी चेकलिस्ट', 'Business Readiness Checklist')}
                  </span>
                </h2>
                <span className="text-xs font-mono font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
                  {readinessDone}/{readinessChecks.length}
                </span>
              </div>
              <div className="space-y-2">
                {readinessChecks.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] text-xs text-[#26364B] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        setReadinessChecks((prev) =>
                          prev.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x))
                        )
                      }
                      className="mt-0.5 accent-[#F4A340]"
                    />
                    <span className={item.done ? 'line-through text-[#665B4F]' : ''}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Low-Cost Local Marketing Plan & Notes */}
          <section className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
            <h2 className="text-base font-bold text-[#26364B] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#A85B0A]" />
              <span>
                {tr(
                  language,
                  'কম খরচে স্থানীয় মার্কেটিং ও প্রথম গ্রাহক পরিকল্পনা',
                  'कम लागत स्थानीय मार्केटिंग और पहले ग्राहक की योजना',
                  'Low-Cost Local Marketing & First-Customer Plan'
                )}
              </span>
            </h2>
            <ul className="space-y-2">
              {marketingSteps.map((step, i) => (
                <li
                  key={`${step}-${i}`}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] text-xs text-[#26364B]"
                >
                  <span>
                    <strong>{i + 1}.</strong> {step}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMarketingSteps((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-[#665B4F] hover:text-red-600 cursor-pointer shrink-0"
                    aria-label="Remove marketing step"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={newMarketingStep}
                onChange={(e) => setNewMarketingStep(e.target.value)}
                placeholder={tr(
                  language,
                  'নিজের একটি মার্কেটিং ধাপ যোগ করুন...',
                  'अपना एक मार्केटिंग कदम जोड़ें...',
                  'Add your own local marketing step...'
                )}
                className="flex-1 rounded-lg border border-[#F2DCC1] px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={addMarketingLine}
                className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] bg-[#FFE5C2] hover:bg-[#F4A340] hover:text-[#26364B] rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tr(language, 'ধাপ যোগ করুন', 'कदम जोड़ें', 'Add Step')}</span>
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(language, 'ব্যক্তিগত নোট / পরবর্তী করণীয়', 'व्यक्तिगत नोट्स / अगले कदम', 'Personal Notes / Next Actions')}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tr(
                  language,
                  'সরবরাহকারীর নাম, এলাকার সময়সূচী বা গুরুত্বপূর্ণ রিমাইন্ডার লিখুন...',
                  'आपूर्तिकर्ता का नाम, समय या कोई महत्वपूर्ण नोट लिखें...',
                  'Write supplier notes, local timings, or key reminders...'
                )}
                className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
              />
            </div>
          </section>
        </div>

        {/* Right 4 columns: Action Bridge, Saved Plans & Connected Pillars */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Action Passport Bridge */}
          <div className="p-5 rounded-xl bg-[#FFE5C2] border border-[#F4A340]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#26364B] dark:text-[#FFD19A]">
              <Compass className="w-5 h-5" />
              <h3 className="text-sm font-bold">
                {tr(
                  language,
                  'পরিকল্পনাকে বাস্তব ধাপে পরিণত করুন',
                  'योजना को वास्तविक कदमों में बदलें',
                  'Turn This Plan into Tracked Action'
                )}
              </h3>
            </div>
            <p className="text-xs text-[#26364B] dark:text-[#FFD19A] leading-relaxed">
              {tr(
                language,
                'এই ব্যবসার পরিকল্পনাটি সরাসরি JENOVA Action Passport-এ পাঠান এবং ধাপে ধাপে কাগজপত্র ও প্রস্তুতি ট্র্যাক করুন।',
                'इस व्यवसाय योजना को सीधे JENOVA Action Passport में भेजें और दस्तावेज़ व चरण ट्रैक करें।',
                'Send this business plan straight into your JENOVA Action Passport to track customer checks, documents, and official Udyam steps.'
              )}
            </p>
            <button
              type="button"
              onClick={handleSendToPassport}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold jenova-saffron-btn rounded-lg cursor-pointer"
            >
              <span>
                {tr(
                  language,
                  'Action Passport-এ পাঠান',
                  'Action Passport में जोड़ें',
                  'Send to Action Passport'
                )}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Saved Plans */}
          <div className="p-5 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
            <h3 className="text-sm font-bold text-[#26364B] flex items-center gap-2">
              <FolderCheck className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
              <span>
                {tr(
                  language,
                  `সংরক্ষিত ব্যবসার পরিকল্পনা (${businessPlans.length})`,
                  `सहेजी गई व्यवसाय योजनाएं (${businessPlans.length})`,
                  `Saved Business Plans (${businessPlans.length})`
                )}
              </span>
            </h3>
            {businessPlans.length === 0 ? (
              <p className="text-xs text-[#454545] leading-relaxed">
                {tr(
                  language,
                  'এখনো কোনো পরিকল্পনা সেভ করা হয়নি। উপরের "পরিকল্পনা সেভ করুন" বোতামে ক্লিক করে সংরক্ষণ করুন।',
                  'अभी तक कोई योजना सहेजी नहीं गई है। सहेजने के लिए ऊपर "योजना सहेजें" पर क्लिक करें।',
                  'No plans saved yet. Click "Save Business Plan" above to keep your work across sessions.'
                )}
              </p>
            ) : (
              <div className="space-y-2.5">
                {businessPlans.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] space-y-1.5"
                  >
                    <p className="text-xs font-bold text-[#26364B]">{p.businessName}</p>
                    <p className="text-[11px] text-[#454545]">
                      {p.category} · {p.location}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => loadSavedPlan(p)}
                        className="text-[11px] font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
                      >
                        {tr(language, 'লোড করুন', 'लोड करें', 'Load Plan')}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBusinessPlan(p.id)}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        {tr(language, 'মুছুন', 'हटाएं', 'Delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connected UDAAN Training & Official Schemes */}
          <div className="p-5 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
            <h3 className="text-sm font-bold text-[#26364B] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#26364B]" />
              <span>
                {tr(
                  language,
                  'সম্পর্কিত প্রশিক্ষণ ও সরকারি সহায়তা',
                  'संबंधित प्रशिक्षण और सरकारी सहायता',
                  'Connected Training & Official Support'
                )}
              </span>
            </h3>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => navigate('/udaan/udaan-business-plan')}
                className="w-full text-left p-3 rounded-lg bg-[#FFF1DF] hover:bg-[#FFE5C2] border border-[#F2DCC1] font-semibold text-[#26364B] flex items-center justify-between cursor-pointer"
              >
                <span>
                  {tr(
                    language,
                    'JENOVA UDAAN: বিজনেস প্ল্যান মডিউল',
                    'JENOVA UDAAN: बिजनेस प्लान मॉड्यूल',
                    'JENOVA UDAAN: Business Plan Module'
                  )}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A85B0A] dark:text-[#FFD19A]" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/udaan/udaan-msme-entrepreneur')}
                className="w-full text-left p-3 rounded-lg bg-[#FFF1DF] hover:bg-[#FFE5C2] border border-[#F2DCC1] font-semibold text-[#26364B] flex items-center justify-between cursor-pointer"
              >
                <span>
                  {tr(
                    language,
                    'JENOVA UDAAN: MSME ও উদ্যোক্তা প্রস্তুতি',
                    'JENOVA UDAAN: MSME और उद्यमिता तैयारी',
                    'JENOVA UDAAN: MSME Entrepreneurship'
                  )}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A85B0A] dark:text-[#FFD19A]" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/finance/emi')}
                className="w-full text-left p-3 rounded-lg bg-[#FFF1DF] hover:bg-[#FFE5C2] border border-[#F2DCC1] font-semibold text-[#26364B] flex items-center justify-between cursor-pointer"
              >
                <span>
                  {tr(
                    language,
                    'ঋণ নেওয়ার আগে EMI সামর্থ্য যাচাই করুন',
                    'ऋण से पहले EMI क्षमता जांचें',
                    'Check Loan EMI Affordability First'
                  )}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A85B0A] dark:text-[#FFD19A]" />
              </button>
              <a
                href="https://udyamregistration.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAnalyticsEvent('scheme_referral', 'sch-udyam')}
                className="w-full p-3 rounded-lg bg-[#FFF1DF] hover:bg-[#FFE5C2] border border-[#F2DCC1] font-semibold text-[#A85B0A] dark:text-[#FFD19A] flex items-center justify-between"
              >
                <span>udyamregistration.gov.in (₹0 Official)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </aside>
      </div>

      <SafetyNotice
        message={tr(
          language,
          'স্বচ্ছতা বার্তা: এই টুলটি আপনাকে বাস্তবসম্মত ব্যবসার প্রস্তুতি নিতে সাহায্য করে। JENOVA কোনো ব্যবসা লাভের গ্যারান্টি বা ঋণ অনুমোদনের প্রতিশ্রুতি দেয় না।',
          'पारदर्शिता सूचना: यह टूल आपको व्यावहारिक व्यवसाय तैयारी में मदद करता है। JENOVA किसी मुनाफे या ऋण स्वीकृति की गारंटी नहीं देता।',
          'Transparency Notice: This planner helps you prepare realistically before investing savings. JENOVA never guarantees business profits or loan approvals.'
        )}
      />
    </div>
  );
}
