import type { Language, LocalizedText } from '../types/platform';

export function pickText(text: LocalizedText, lang: Language): string {
  return text[lang] || text.en || text.bn;
}

export interface UIStrings {
  brandName: string;
  locationLabel: string;
  nav: {
    home: string;
    jobs: string;
    skills: string;
    finance: string;
    schemes: string;
    msme: string;
    assistant: string;
    scamCheck: string;
    folderCheck: string;
    localHelp: string;
    updates: string;
    about: string;
    contact: string;
    dashboard: string;
    admin: string;
    login: string;
    logout: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    pilotNotice: string;
  };
  home: {
    servicesTitle: string;
    servicesSubtitle: string;
    howTitle: string;
    howSteps: { num: string; title: string; desc: string }[];
    localTitle: string;
    localSubtitle: string;
    financeTitle: string;
    financeSubtitle: string;
    schemesTitle: string;
    schemesSubtitle: string;
    impactTitle: string;
    impactDisclaimer: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    viewAll: string;
    openTool: string;
  };
  common: {
    demoTag: string;
    verified: string;
    pending: string;
    needsReview: string;
    expired: string;
    rejected: string;
    shareWhatsApp: string;
    bookmark: string;
    bookmarked: string;
    reportIssue: string;
    officialPortal: string;
    back: string;
    searchPlaceholder: string;
    all: string;
    submit: string;
    cancel: string;
    loading: string;
    noResults: string;
    loginToSave: string;
    free: string;
    safetyBanner: string;
    sourceLabel: string;
    lastVerified: string;
  };
  footer: {
    tagline: string;
    disclaimer: string;
    privacyTitle: string;
    privacyNote: string;
    pilotCredit: string;
  };
}

export const TRANSLATIONS: Record<Language, UIStrings> = {
  bn: {
    brandName: 'JENOVA',
    locationLabel: 'মেচেদা, পূর্ব মেদিনীপুর, পশ্চিমবঙ্গ',
    nav: {
      home: 'হোম',
      jobs: 'কর্মসংস্থান',
      skills: 'দক্ষতা উন্নয়ন',
      finance: 'আর্থিক শিক্ষা',
      schemes: 'JENOVA Schemes',
      msme: 'ক্ষুদ্র ব্যবসা',
      assistant: 'JENOVA Voice',
      scamCheck: 'JENOVA Protect',
      folderCheck: 'JENOVA Checklist',
      localHelp: 'JENOVA Local',
      updates: 'আপডেট ও রিমাইন্ডার',
      about: 'আমাদের সম্পর্কে',
      contact: 'যোগাযোগ',
      dashboard: 'আমার ড্যাশবোর্ড',
      admin: 'অ্যাডমিন প্যানেল',
      login: 'লগইন',
      logout: 'লগআউট',
    },
    hero: {
      kicker: 'JENOVA · নতুন সম্ভাবনা, সবার জন্য।',
      headline: 'আপনার কমিউনিটি। আপনার সুযোগ। আপনার ভবিষ্যৎ।',
      subtitle:
        'আপনার প্রয়োজনীয় তথ্য, সরকারি পরিষেবা, ডিজিটাল নিরাপত্তা এবং নতুন সুযোগ — সবকিছু এবার এক প্ল্যাটফর্মে।',
      primaryCta: 'পরিষেবাগুলি দেখুন',
      secondaryCta: 'JENOVA কীভাবে কাজ করে',
      pilotNotice:
        'স্বচ্ছতা বার্তা: JENOVA কোনো সরকারি দপ্তর, ব্যাংক বা ঋণদাতা নয় এবং কোনো ভাতা বা চাকরির নিশ্চয়তা দেয় না। এটি কেবল যাচাইকৃত তথ্য ও অফিসিয়াল সরকারি পোর্টালে পৌঁছাতে সাহায্য করে।',
    },
    home: {
      servicesTitle: 'পাঁচটি প্রধান কমিউনিটি পরিষেবা',
      servicesSubtitle:
        'ছাত্রছাত্রী, যুবক-যুবতী, মহিলা, দৈনিক মজুরি কর্মী ও ক্ষুদ্র ব্যবসায়ীদের জন্য সহজ ও নির্ভরযোগ্য দিকনির্দেশনা।',
      howTitle: 'কীভাবে কাজ করে',
      howSteps: [
        {
          num: '০১',
          title: 'সঠিক সুযোগ খুঁজুন',
          desc: 'কোনো নিবন্ধন ছাড়াই স্থানীয় কাজ, ফ্রি প্রশিক্ষণ ও সরকারি প্রকল্পের তথ্য সহজ বাংলায় দেখুন।',
        },
        {
          num: '০২',
          title: 'দক্ষতা ও আর্থিক জ্ঞান বাড়ান',
          desc: 'বাজেট, সঞ্চয় ও ইএমআই ক্যালকুলেটর ব্যবহার করুন এবং বিনামূল্যে কম্পিউটার বা কারিগরি কোর্স শিখুন।',
        },
        {
          num: '০৩',
          title: 'অফিসিয়াল পথে এগিয়ে যান',
          desc: 'সরাসরি অফিসিয়াল সরকারি পোর্টাল বা যাচাইকৃত প্রতিষ্ঠানে নিরাপদে আবেদন করুন।',
        },
      ],
      localTitle: 'স্থানীয় সুযোগ ও প্রশিক্ষণ',
      localSubtitle:
        'যাচাইকৃত সরকারি পোর্টাল, ফ্রি কোর্স এবং স্পষ্টভাবে চিহ্নিত পাইলট নমুনা (DEMO DATA) তালিকা।',
      financeTitle: 'ইন্টারেক্টিভ আর্থিক শিক্ষা ও ক্যালকুলেটর',
      financeSubtitle:
        'সংসারের মাসিক বাজেট, সঞ্চয়ের লক্ষ্য, ঋণের ইএমআই এবং ইউপিআই প্রতারণা থেকে বাঁচার উপায় শিখুন।',
      schemesTitle: 'যাচাইকৃত সরকারি কল্যাণমূলক প্রকল্প',
      schemesSubtitle:
        'পশ্চিমবঙ্গ ও ভারত সরকারের প্রধান প্রকল্পগুলির সরাসরি অফিসিয়াল লিঙ্ক ও নথির তালিকা।',
      impactTitle: 'পাইলট পরিকল্পনা ও প্রকৃত প্ল্যাটফর্ম পরিসংখ্যান',
      impactDisclaimer:
        'নিচের সংখ্যাগুলি এই প্ল্যাটফর্মের প্রকৃত লাইভ ডাটাবেস থেকে সংগৃহীত। প্রস্তাবিত পাইলট লক্ষ্যমাত্রা (১০০ পরিবার, ৫০ জন ব্যক্তি, ৩ মাস) এখনও অর্জিত ফলাফল নয়।',
      ctaTitle: 'আপনার পরবর্তী সুযোগ শুরু হোক এখান থেকেই।',
      ctaSubtitle:
        'কোনো প্রশ্ন আছে? আমাদের এআই কমিউনিটি সহায়ককে বাংলায় জিজ্ঞাসা করুন বা সরাসরি সুযোগগুলি ঘুরে দেখুন।',
      ctaButton: 'এআই সহায়ককে জিজ্ঞাসা করুন',
      viewAll: 'সব দেখুন',
      openTool: 'টুল খুলুন',
    },
    common: {
      demoTag: 'DEMO DATA (নমুনা)',
      verified: 'যাচাইকৃত',
      pending: 'যাচাই বাকি',
      needsReview: 'পুনর্বিবেচনা প্রয়োজন',
      expired: 'মেয়াদোত্তীর্ণ',
      rejected: 'প্রত্যাখ্যাত',
      shareWhatsApp: 'হোয়াটসঅ্যাপে শেয়ার',
      bookmark: 'সেভ করুন',
      bookmarked: 'সেভ করা হয়েছে',
      reportIssue: 'সমস্যা রিপোর্ট করুন',
      officialPortal: 'অফিসিয়াল পোর্টালে যান',
      back: 'ফিরে যান',
      searchPlaceholder: 'নাম, এলাকা বা বিষয় লিখুন...',
      all: 'সবগুলো',
      submit: 'জমা দিন',
      cancel: 'বাতিল',
      loading: 'লোড হচ্ছে...',
      noResults: 'এই ফিল্টারে কোনো তথ্য পাওয়া যায়নি।',
      loginToSave: 'বুকমার্ক সেভ করতে অনুগ্রহ করে লগইন করুন।',
      free: 'বিনামূল্যে',
      safetyBanner:
        'নিরাপত্তা নির্দেশিকা: কখনোই কাউকে আপনার UPI PIN, OTP, পাসওয়ার্ড, ডেবিট কার্ড নম্বর বা চাকরির নামে অগ্রিম টাকা দেবেন না।',
      sourceLabel: 'তথ্যসূত্র',
      lastVerified: 'সর্বশেষ যাচাই',
    },
    footer: {
      tagline:
        'একটি সহজ, বুদ্ধিমত্তাসম্পন্ন ও অন্তর্ভুক্তিমূলক ডিজিটাল প্ল্যাটফর্মের মাধ্যমে সবার জন্য প্রয়োজনীয় তথ্য, সরকারি সহায়তা, ডিজিটাল নিরাপত্তা, কর্মসংস্থান ও স্থানীয় সহায়তা পৌঁছে দেওয়াই JENOVA-র লক্ষ্য।',
      disclaimer:
        'দাবিত্যাগ: JENOVA কোনো সরকারি ওয়েবসাইট নয়, কোনো ব্যাংক নয় এবং কোনো ঋণ বা চাকরির গ্যারান্টি দেয় না। সরকারি প্রকল্পের সর্বশেষ নিয়ম ও আবেদনের জন্য সর্বদা অফিসিয়াল .gov.in / .nic.in পোর্টাল যাচাই করুন।',
      privacyTitle: 'গোপনীয়তা ও তথ্য সুরক্ষা',
      privacyNote:
        'আমরা অপ্রয়োজনীয় আধার নম্বর, ব্যাংক অ্যাকাউন্ট, ওটিপি বা ইউপিআই পিন সংগ্রহ করি না। লগইন ছাড়াই সমস্ত পাবলিক তথ্য দেখা যায়।',
      pilotCredit: 'JENOVA · নতুন সম্ভাবনা, সবার জন্য। · মেচেদা, পূর্ব মেদিনীপুর, পশ্চিমবঙ্গ',
    },
  },
  en: {
    brandName: 'JENOVA',
    locationLabel: 'Mecheda, Purba Medinipur, West Bengal',
    nav: {
      home: 'Home',
      jobs: 'Jobs',
      skills: 'Skills',
      finance: 'Finance',
      schemes: 'JENOVA Schemes',
      msme: 'MSME',
      assistant: 'JENOVA Voice',
      scamCheck: 'JENOVA Protect',
      folderCheck: 'JENOVA Checklist',
      localHelp: 'JENOVA Local',
      updates: 'Updates',
      about: 'About',
      contact: 'Contact',
      dashboard: 'Dashboard',
      admin: 'Admin',
      login: 'Sign In',
      logout: 'Sign Out',
    },
    hero: {
      kicker: 'JENOVA · A New Way to Grow Together.',
      headline: 'Your Community. Your Opportunities. Your Future.',
      subtitle:
        'JENOVA helps you understand government schemes, identify digital fraud, prepare important documents, discover local assistance and access opportunities — all through one simple platform.',
      primaryCta: 'Explore Services',
      secondaryCta: 'How JENOVA Works',
      pilotNotice:
        'Transparency Notice: JENOVA is NOT a bank, lender, government department, or placement agency. It provides verified plain-language guidance and official portal links only.',
    },
    home: {
      servicesTitle: 'Five Core Community Modules',
      servicesSubtitle:
        'Practical, plain-language resources for youth, low-income families, women, daily-wage workers, students, and local entrepreneurs.',
      howTitle: 'How It Works',
      howSteps: [
        {
          num: '01',
          title: 'Discover Opportunities',
          desc: 'Browse local employment portals, free skill courses, and welfare schemes openly without mandatory registration.',
        },
        {
          num: '02',
          title: 'Learn & Build Skills',
          desc: 'Use interactive budget, savings, and EMI calculators and enrol in free government-recognized skill programmes.',
        },
        {
          num: '03',
          title: 'Take Informed Steps',
          desc: 'Apply safely through official government portals and verified local institutions without paying middlemen.',
        },
      ],
      localTitle: 'Local Opportunities & Training',
      localSubtitle:
        'Verified public employment portals, free training programmes, and clearly labeled pilot sample listings (DEMO DATA).',
      financeTitle: 'Financial Literacy & Interactive Tools',
      financeSubtitle:
        'Plan household budgets, calculate savings growth and EMIs accurately, and learn how to prevent UPI and job scams.',
      schemesTitle: 'Verified Government Welfare Schemes',
      schemesSubtitle:
        'Direct official portal links, document checklists, and plain-language guidance for West Bengal and India schemes.',
      impactTitle: 'Pilot Planning & Live Platform Statistics',
      impactDisclaimer:
        'Numbers below reflect real database records and live platform visits only. Proposed 3-month Mecheda pilot targets (~100 families, ~50 individuals) are planning estimates, not achieved results.',
      ctaTitle: 'Your next opportunity starts here.',
      ctaSubtitle:
        'Have a question in Bengali, English, or Hindi? Ask our grounded Community Assistant or explore verified resources now.',
      ctaButton: 'Ask AI Assistant',
      viewAll: 'View All',
      openTool: 'Open Tool',
    },
    common: {
      demoTag: 'DEMO DATA',
      verified: 'Verified',
      pending: 'Pending Verification',
      needsReview: 'Needs Review',
      expired: 'Expired',
      rejected: 'Rejected',
      shareWhatsApp: 'Share on WhatsApp',
      bookmark: 'Bookmark',
      bookmarked: 'Saved',
      reportIssue: 'Report Issue',
      officialPortal: 'Visit Official Portal',
      back: 'Go Back',
      searchPlaceholder: 'Search by keyword, location, or topic...',
      all: 'All',
      submit: 'Submit',
      cancel: 'Cancel',
      loading: 'Loading...',
      noResults: 'No matching records found for the selected filters.',
      loginToSave: 'Sign in to save bookmarks to your dashboard.',
      free: 'Free',
      safetyBanner:
        'Safety Alert: Never share your UPI PIN, bank OTP, password, debit card details, or pay registration fees for jobs or government schemes.',
      sourceLabel: 'Official Source',
      lastVerified: 'Last Verified',
    },
    footer: {
      tagline:
        'To make essential information, government assistance, digital safety, employment opportunities and local support accessible to everyone through one simple, intelligent and inclusive digital platform.',
      disclaimer:
        'Disclaimer: JENOVA is an independent community information platform — not a government agency or lender. Always verify eligibility, benefit rates, and deadlines directly on official government websites.',
      privacyTitle: 'Privacy & Data Minimization',
      privacyNote:
        'We never collect Aadhaar numbers, UPI PINs, OTPs, or banking credentials. Public browsing requires no account.',
      pilotCredit: 'JENOVA · A New Way to Grow Together. · Serving Mecheda & Purba Medinipur',
    },
  },
  hi: {
    brandName: 'JENOVA',
    locationLabel: 'मेचेदा, पूर्व मेदिनीपुर, पश्चिम बंगाल',
    nav: {
      home: 'होम',
      jobs: 'रोजगार',
      skills: 'कौशल विकास',
      finance: 'वित्तीय शिक्षा',
      schemes: 'JENOVA Schemes',
      msme: 'लघु व्यवसाय',
      assistant: 'JENOVA Voice',
      scamCheck: 'JENOVA Protect',
      folderCheck: 'JENOVA Checklist',
      localHelp: 'JENOVA Local',
      updates: 'अपडेट और रिमाइंडर',
      about: 'हमारे बारे में',
      contact: 'संपर्क करें',
      dashboard: 'मेरा डैशबोर्ड',
      admin: 'एडमिन पैनल',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
    },
    hero: {
      kicker: 'JENOVA · एक साथ बढ़ने का नया तरीका।',
      headline: 'आपका समुदाय। आपके अवसर। आपका भविष्य।',
      subtitle:
        'JENOVA आपको सरकारी योजनाएं समझने, डिजिटल धोखाधड़ी पहचानने, आवश्यक दस्तावेज़ तैयार करने और सत्यापित स्थानीय सहायता खोजने में मदद करता है — सब कुछ एक सरल प्लेटफॉर्म पर।',
      primaryCta: 'सेवाएं देखें',
      secondaryCta: 'JENOVA कैसे काम करता है',
      pilotNotice:
        'पारदर्शिता सूचना: JENOVA कोई सरकारी विभाग, बैंक या ऋणदाता नहीं है और न ही नौकरी या लाभ की गारंटी देता है। यह केवल सत्यापित जानकारी और आधिकारिक पोर्टल से जोड़ता है।',
    },
    home: {
      servicesTitle: 'पांच प्रमुख सामुदायिक सेवाएं',
      servicesSubtitle:
        'युवाओं, महिलाओं, दैनिक मजदूरों, छात्रों और छोटे व्यवसायियों के लिए सरल व विश्वसनीय मार्गदर्शन।',
      howTitle: 'यह कैसे काम करता है',
      howSteps: [
        {
          num: '01',
          title: 'अवसर खोजें',
          desc: 'बिना अनिवार्य पंजीकरण के स्थानीय रोजगार पोर्टल, निःशुल्क प्रशिक्षण और सरकारी योजनाओं की जानकारी देखें।',
        },
        {
          num: '02',
          title: 'कौशल और वित्तीय समझ बढ़ाएं',
          desc: 'बजट, बचत और ईएमआई कैलकुलेटर का उपयोग करें और निःशुल्क प्रशिक्षण पाठ्यक्रम सीखें।',
        },
        {
          num: '03',
          title: 'सही कदम उठाएं',
          desc: 'बिचौलियों से बचकर सीधे आधिकारिक सरकारी पोर्टल और सत्यापित संस्थाओं से आवेदन करें।',
        },
      ],
      localTitle: 'स्थानीय अवसर और प्रशिक्षण',
      localSubtitle:
        'सत्यापित सरकारी पोर्टल, निःशुल्क प्रशिक्षण और स्पष्ट रूप से चिह्नित पायलट नमूना (DEMO DATA) सूचियां।',
      financeTitle: 'वित्तीय शिक्षा और इंटरैक्टिव टूल्स',
      financeSubtitle:
        'घरेलू बजट बनाएं, बचत और ईएमआई की सटीक गणना करें और यूपीआई धोखाधड़ी से बचाव सीखें।',
      schemesTitle: 'सत्यापित सरकारी कल्याणकारी योजनाएं',
      schemesSubtitle:
        'पश्चिम बंगाल और भारत सरकार की योजनाओं के सीधे आधिकारिक लिंक और आवश्यक दस्तावेज़।',
      impactTitle: 'पायलट योजना और वास्तविक प्लेटफॉर्म आंकड़े',
      impactDisclaimer:
        'नीचे दिए गए आंकड़े वास्तविक डेटाबेस से हैं। प्रस्तावित पायलट लक्ष्य (100 परिवार, 50 व्यक्ति, 3 महीने) योजना अनुमान हैं, प्राप्त परिणाम नहीं।',
      ctaTitle: 'आपका अगला अवसर यहीं से शुरू होता है।',
      ctaSubtitle:
        'कोई सवाल है? हमारे एआई सामुदायिक सहायक से पूछें या सत्यापित संसाधन देखें।',
      ctaButton: 'एआई सहायक से पूछें',
      viewAll: 'सभी देखें',
      openTool: 'टूल खोलें',
    },
    common: {
      demoTag: 'DEMO DATA (नमूना)',
      verified: 'सत्यापित',
      pending: 'सत्यापन लंबित',
      needsReview: 'समीक्षा आवश्यक',
      expired: 'समाप्त',
      rejected: 'अस्वीकृत',
      shareWhatsApp: 'व्हाट्सएप शेयर',
      bookmark: 'सहेजें',
      bookmarked: 'सहेजा गया',
      reportIssue: 'रिपोर्ट करें',
      officialPortal: 'आधिकारिक पोर्टल खोलें',
      back: 'वापस जाएं',
      searchPlaceholder: 'कीवर्ड, स्थान या विषय खोजें...',
      all: 'सभी',
      submit: 'जमा करें',
      cancel: 'रद्द करें',
      loading: 'लोड हो रहा है...',
      noResults: 'चुने गए फ़िल्टर के लिए कोई जानकारी नहीं मिली।',
      loginToSave: 'बुकमार्क सहेजने के लिए कृपया लॉगिन करें।',
      free: 'निःशुल्क',
      safetyBanner:
        'सुरक्षा चेतावनी: कभी भी अपना UPI PIN, OTP, पासवर्ड, डेबिट कार्ड विवरण या नौकरी के नाम पर अग्रिम पैसे न दें।',
      sourceLabel: 'आधिकारिक स्रोत',
      lastVerified: 'अंतिम सत्यापन',
    },
    footer: {
      tagline:
        'एक सरल, स्मार्ट और समावेशी डिजिटल प्लेटफॉर्म के माध्यम से सभी के लिए आवश्यक जानकारी, सरकारी सहायता, डिजिटल सुरक्षा और स्थानीय सहयोग उपलब्ध कराना ही JENOVA का मिशन है।',
      disclaimer:
        'अस्वीकरण: JENOVA एक स्वतंत्र सामुदायिक प्लेटफॉर्म है, कोई सरकारी वेबसाइट या ऋणदाता नहीं। कृपया सभी नियम आधिकारिक सरकारी पोर्टल पर जांचें।',
      privacyTitle: 'गोपनीयता और डेटा सुरक्षा',
      privacyNote:
        'हम आधार नंबर, बैंक ओटीपी या यूपीआई पिन एकत्र नहीं करते। सार्वजनिक जानकारी बिना लॉगिन के उपलब्ध है।',
      pilotCredit: 'JENOVA · एक साथ बढ़ने का नया तरीका · मेचेदा, पूर्व मेदिनीपुर, पश्चिम बंगाल',
    },
  },
};
