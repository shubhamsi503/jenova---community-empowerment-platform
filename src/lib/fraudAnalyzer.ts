import type { FraudAnalysisResult, FraudIndicator, Language } from '../types/platform';

interface RuleMatch {
  code: string;
  severity: 'high' | 'medium';
  weight: number;
  title: { bn: string; en: string; hi: string };
  explanation: { bn: string; en: string; hi: string };
}

const FRAUD_RULES: { regex: RegExp; match: RuleMatch }[] = [
  {
    regex: /\b(upi\s*pin|enter\s*pin|scan\s*qr\s*to\s*receive|receive\s*money.*qr|qr\s*code.*(receive|claim|prize|subsidy)|pay\s*(rs\.?|₹)?\s*\d+.*to\s*(receive|claim|unlock)|collect\s*request|পিন\s*দিন|কিউআর\s*কোড\s*স্ক্যান)\b/i,
    match: {
      code: 'UPI_PIN_QR_TRAP',
      severity: 'high',
      weight: 45,
      title: {
        bn: 'টাকা পাওয়ার জন্য UPI PIN বা QR কোড চাওয়া হয়েছে',
        en: 'UPI PIN or QR Code Requested to “Receive” Money',
        hi: 'पैसे प्राप्त करने के लिए UPI PIN या QR कोड मांगा गया',
      },
      explanation: {
        bn: 'টাকা পাওয়ার জন্য কখনোই UPI PIN দিতে হয় না বা QR কোড স্ক্যান করতে হয় না। পিন দিলে আপনার অ্যাকাউন্ট থেকে টাকা কেটে যাবে।',
        en: 'You NEVER need to enter a UPI PIN or scan a QR code to receive money. Doing so deducts money from your bank account.',
        hi: 'पैसे प्राप्त करने के लिए कभी UPI PIN या QR स्कैन की जरूरत नहीं होती। इससे आपके खाते से पैसे कट जाते हैं।',
      },
    },
  },
  {
    regex: /\b(share\s*otp|send\s*otp|tell\s*otp|verify\s*otp|cvv|atm\s*pin|debit\s*card\s*number|ওটিপি\s*দিন|ওটিপি\s*শেয়ার)\b/i,
    match: {
      code: 'OTP_CREDENTIAL_REQUEST',
      severity: 'high',
      weight: 45,
      title: {
        bn: 'OTP, CVV বা ব্যাংকিং পাসওয়ার্ড চাওয়া হয়েছে',
        en: 'OTP, CVV, or Banking Credentials Requested',
        hi: 'OTP, CVV या बैंकिंग पासवर्ड मांगा गया',
      },
      explanation: {
        bn: 'কোনো ব্যাংক, সরকারি দপ্তর বা কাস্টমার কেয়ার কখনো ফোনে বা মেসেজে OTP বা কার্ডের গোপন নম্বর চায় না।',
        en: 'No genuine bank, government office, or customer-care representative ever asks for your OTP, ATM PIN, or CVV.',
        hi: 'कोई भी असली बैंक या सरकारी विभाग कभी OTP, ATM PIN या CVV नहीं मांगता।',
      },
    },
  },
  {
    regex: /\b(anydesk|teamviewer|quicksupport|rustdesk|screen\s*share|remote\s*access|\.apk\b|install\s*apk)\b/i,
    match: {
      code: 'REMOTE_ACCESS_OR_APK',
      severity: 'high',
      weight: 45,
      title: {
        bn: 'রিমোট অ্যাক্সেস অ্যাপ বা অচেনা .APK ফাইল ইনস্টলের নির্দেশ',
        en: 'Remote-Access App or Unknown .APK File Mentioned',
        hi: 'रिमोट एक्सेस ऐप या अज्ञात .APK फाइल का निर्देश',
      },
      explanation: {
        bn: 'AnyDesk, TeamViewer বা হোয়াটসঅ্যাপে পাঠানো .apk ফাইল ইনস্টল করলে প্রতারকরা আপনার ফোনের স্ক্রিন ও ওটিপি দেখতে পায়।',
        en: 'Installing screen-sharing apps (AnyDesk, QuickSupport) or unknown .apk files gives strangers control over your phone and banking SMS.',
        hi: 'स्क्रीन-शेयरिंग ऐप या अज्ञात .apk फाइल इंस्टॉल करने से ठग आपके फोन और ओटीपी को देख सकते हैं।',
      },
    },
  },
  {
    regex: /\b(registration\s*fee|security\s*deposit|joining\s*fee|id\s*card\s*charge|uniform\s*fee|advance\s*fee|processing\s*fee|file\s*charge|রেজিস্ট্রেশন\s*ফি|অগ্রিম\s*টাকা|প্রসেসিং\s*ফি)\b/i,
    match: {
      code: 'ADVANCE_FEE_DEMAND',
      severity: 'high',
      weight: 38,
      title: {
        bn: 'চাকরি বা ঋণের আগে অগ্রিম ফি / ডিপোজিট চাওয়া হয়েছে',
        en: 'Upfront Registration, Security, or Processing Fee Demanded',
        hi: 'नौकरी या ऋण से पहले अग्रिम शुल्क मांगा गया',
      },
      explanation: {
        bn: 'প্রকৃত চাকরি, সরকারি প্রকল্প বা স্বীকৃত ব্যাংক কখনো ব্যক্তিগত নম্বরে আগে টাকা জমা দিতে বলে না।',
        en: 'Demanding upfront registration fees, uniform charges, or loan processing fees via personal UPI/transfer before approval is a major fraud indicator.',
        hi: 'नौकरी या ऋण से पहले निजी खाते में रजिस्ट्रेशन या प्रोसेसिंग शुल्क मांगना धोखाधड़ी का प्रमुख संकेत है।',
      },
    },
  },
  {
    regex: /\b(kyc\s*(expired|blocked|suspended|update\s*immediately)|account\s*will\s*be\s*blocked|sim\s*will\s*be\s*blocked|electricity\s*will\s*be\s*disconnected|কেওয়াইসি\s*আপডেট|অ্যাকাউন্ট\s*বন্ধ)\b/i,
    match: {
      code: 'URGENCY_THREAT_IMPERSONATION',
      severity: 'high',
      weight: 35,
      title: {
        bn: 'অ্যাকাউন্ট/বিদ্যুৎ/সিম বন্ধের ভয় দেখিয়ে তাড়াহুড়ো করা হচ্ছে',
        en: 'Urgency Threat (Account / KYC / Electricity / SIM Blocking)',
        hi: 'खाता/KYC/बिजली/सिम बंद होने की धमकी',
      },
      explanation: {
        bn: 'প্রতারকরা আতঙ্ক তৈরি করে যাতে আপনি যাচাই না করেই লিঙ্কে ক্লিক করেন বা কল করেন। সর্বদা অফিসিয়াল অ্যাপ বা শাখায় যাচাই করুন।',
        en: 'Scammers create artificial panic about blocked KYC, bank accounts, or utility bills to stop you from verifying calmly.',
        hi: 'ठग घबराहट पैदा करते हैं ताकि आप बिना जांच किए लिंक पर क्लिक करें या कॉल करें।',
      },
    },
  },
  {
    regex: /\b(double\s*your\s*money|guaranteed\s*return|earn\s*₹?\s*[3-9],?000\s*(daily|per\s*day)|lottery\s*won|kbc\s*winner|lucky\s*draw|pencil\s*packing\s*job|টাকা\s*দ্বিগুণ|লটারি\s*জিতেছেন)\b/i,
    match: {
      code: 'UNREALISTIC_PROMISE',
      severity: 'high',
      weight: 35,
      title: {
        bn: 'অবাস্তব আয়, লটারি বা নিশ্চিত মুনাফার লোভ দেখানো হয়েছে',
        en: 'Unrealistic Earnings, Lottery, or Guaranteed Returns Claim',
        hi: 'अवास्तविक कमाई, लॉटरी या गारंटीड रिटर्न का दावा',
      },
      explanation: {
        bn: 'ঘরে বসে পেন্সিল প্যাকিং, অজানা লটারি বা অল্প দিনে টাকা দ্বিগুণ হওয়ার প্রস্তাব সাধারণত প্রতারণার ফাঁদ।',
        en: 'Claims of guaranteed high daily income, home pencil-packing jobs, or unexpected lottery prizes are frequent scam lures.',
        hi: 'घर बैठे भारी दैनिक कमाई, लॉटरी या पैसे दोगुना करने के वादे अक्सर धोखाधड़ी के जाल होते हैं।',
      },
    },
  },
  {
    regex: /\b(bit\.ly|tinyurl\.com|cutt\.ly|t\.ly|rb\.gy|shorturl\.at|ngrok\.io)\b/i,
    match: {
      code: 'SHORTENED_OBSCURED_LINK',
      severity: 'medium',
      weight: 22,
      title: {
        bn: 'সংক্ষিপ্ত (Shortened) বা গোপন ওয়েবসাইট লিঙ্ক রয়েছে',
        en: 'Shortened / Masked Website Link Detected',
        hi: 'संक्षिप्त (Shortened) या छिपा हुआ वेब लिंक मिला',
      },
      explanation: {
        bn: 'সংক্ষিপ্ত লিঙ্কে আসল ওয়েবসাইটের ঠিকানা লুকানো থাকে। অচেনা সংক্ষিপ্ত লিঙ্কে ক্লিক করবেন না।',
        en: 'Shortened URLs hide the real destination website. Avoid clicking shortened links in unsolicited job, banking, or welfare messages.',
        hi: 'शॉर्ट लिंक असली वेबसाइट का पता छिपाते हैं। अनजान शॉर्ट लिंक पर क्लिक न करें।',
      },
    },
  },
  {
    regex: /(?:\b(?:annapurna|kanyashree|pm\s*kisan|pm\s*awas|swasthya\s*sathi|ration\s*card|scholarship)\b|সরকারি\s*প্রকল্প|ভাতা|অন্নপূর্ণা|अन्नपूर्णा)/i,
    match: {
      code: 'SCHEME_MENTION_CHECK_DOMAIN',
      severity: 'medium',
      weight: 10,
      title: {
        bn: 'সরকারি প্রকল্পের উল্লেখ রয়েছে — অফিসিয়াল ডোমেইন যাচাই জরুরি',
        en: 'Government Scheme Mentioned — Verify Official .gov.in Domain',
        hi: 'सरकारी योजना का उल्लेख — आधिकारिक .gov.in डोमेन जांचें',
      },
      explanation: {
        bn: 'সরকারি প্রকল্পের আসল ওয়েবসাইট সাধারণত .gov.in বা .nic.in দিয়ে শেষ হয়। ব্যক্তিগত হোয়াটসঅ্যাপ ফর্ম বা .blogspot/.xyz/.com লিঙ্ক বিশ্বাস করবেন না।',
        en: 'Official West Bengal & India portals end in .gov.in or .nic.in. Treat unofficial .com, .xyz, .in, or social-media application links with extreme caution.',
        hi: 'आधिकारिक सरकारी पोर्टल .gov.in या .nic.in पर समाप्त होते हैं। अनौपचारिक लिंक से बचें।',
      },
    },
  },
  {
    regex: /\b(direct\s*joining|without\s*interview|no\s*interview|100%\s*job\s*guarantee|whatsapp\s*typing\s*job|data\s*entry\s*from\s*home|সরাসরি\s*জয়েনিং|ইন্টারভিউ\s*ছাড়াই\s*চাকরি)\b/i,
    match: {
      code: 'FAKE_RECRUITMENT_CLAIM',
      severity: 'high',
      weight: 34,
      title: {
        bn: 'ভুয়া নিয়োগ বা ইন্টারভিউ ছাড়া নিশ্চিত চাকরির দাবি',
        en: 'Suspicious Recruitment Claim (No Interview / Guaranteed Joining)',
        hi: 'संदिग्ध भर्ती दावा (बिना इंटरव्यू सीधी नौकरी)',
      },
      explanation: {
        bn: 'সরকারি বা বৈধ সংস্থা কখনো ইন্টারভিউ বা যাচাই ছাড়া সরাসরি চাকরির গ্যারান্টি দেয় না।',
        en: 'Legitimate employers and government bodies do not promise guaranteed joining without proper screening or interviews.',
        hi: 'असली कंपनियां या सरकारी विभाग बिना प्रक्रिया के सीधी नौकरी की गारंटी नहीं देते।',
      },
    },
  },
  {
    regex: /\b(instant\s*loan\s*(in|within)\s*[0-9]+\s*min|loan\s*without\s*(cibil|documents|kyc)|aadhaar\s*card\s*loan\s*whatsapp|কম\s*সময়ে\s*লোন|হোয়াটসঅ্যাপে\s*লোন)\b/i,
    match: {
      code: 'PREDATORY_LOAN_OFFER',
      severity: 'high',
      weight: 36,
      title: {
        bn: 'সন্দেহজনক তাত্ক্ষণিক লোন বা অননুমোদিত ঋণের প্রস্তাব',
        en: 'Suspicious Instant Loan / Unregulated Lender Claim',
        hi: 'संदिग्ध तुरंत लोन / अनधिकृत ऋण प्रस्ताव',
      },
      explanation: {
        bn: 'কোনো RBI-নিবন্ধিত ব্যাংক হোয়াটসঅ্যাপে নথি ছাড়া ৫ মিনিটে লোন দেয় না। অচেনা লোন অ্যাপ আপনার ফোনের কন্টাক্ট ও ছবি চুরি করতে পারে।',
        en: 'RBI-regulated banks and NBFCs do not disburse loans purely over WhatsApp without verification. Unregulated loan apps often charge hidden fees or misuse phone contacts.',
        hi: 'RBI पंजीकृत बैंक व्हाट्सएप पर बिना जांच तुरंत लोन नहीं देते। अनजान लोन ऐप खतरनाक हो सकते हैं।',
      },
    },
  },
  {
    regex: /\b[a-z0-9._%+-]+@(gmail|yahoo|hotmail|rediffmail)\.com\b/i,
    match: {
      code: 'UNVERIFIED_FREE_EMAIL',
      severity: 'medium',
      weight: 16,
      title: {
        bn: 'অফিসিয়াল ঠিকানার বদলে ব্যক্তিগত Gmail/Yahoo ইমেইল ব্যবহৃত হয়েছে',
        en: 'Personal Free Email Used Instead of Official Organization Domain',
        hi: 'आधिकारिक पते के बजाय निजी Gmail/Yahoo ईमेल का उपयोग',
      },
      explanation: {
        bn: 'সরকারি দপ্তর, ব্যাংক বা বড় কোম্পানি সাধারণত ব্যক্তিগত @gmail.com বা @yahoo.com থেকে চাকরির চিঠি বা ভাতার নোটিশ পাঠায় না।',
        en: 'Government departments, banks, and established employers rarely send official recruitment or benefit notices from personal free email accounts.',
        hi: 'सरकारी विभाग और बड़े संस्थान निजी ईमेल से आधिकारिक नोटिस नहीं भेजते।',
      },
    },
  },
];

function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/gi);
  return matches ? matches.slice(0, 5) : [];
}

function inspectUrls(urls: string[], lang: Language): { indicators: FraudIndicator[]; score: number } {
  const indicators: FraudIndicator[] = [];
  let score = 0;

  for (const rawUrl of urls) {
    const normalized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    let hostname = '';
    try {
      hostname = new URL(normalized).hostname.toLowerCase();
    } catch {
      continue;
    }

    const isOfficialGov = hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in');
    const looksLikeGovImpersonation =
      !isOfficialGov &&
      /(gov|sarkar|yojana|kisan|annapurna|aadhaar|uidai|sbi|rbi|npci|epfo|udyam|eshram|india-post)/i.test(
        hostname
      );

    if (looksLikeGovImpersonation) {
      score += 45;
      indicators.push({
        code: 'FAKE_GOV_OR_BANK_DOMAIN',
        severity: 'high',
        title:
          lang === 'bn'
            ? `সন্দেহজনক ভুয়া সরকারি/ব্যাংক ডোমেইন (${hostname})`
            : lang === 'hi'
              ? `संदिग्ध नकली सरकारी/बैंक डोमेन (${hostname})`
              : `Possible Impersonation Domain (${hostname})`,
        explanation:
          lang === 'bn'
            ? 'এই লিঙ্কটি সরকারি বা ব্যাংকের নামের মতো দেখতে হলেও এটি অফিসিয়াল .gov.in বা .nic.in ওয়েবসাইট নয়।'
            : lang === 'hi'
              ? 'यह लिंक सरकारी या बैंक जैसा दिखता है, लेकिन आधिकारिक .gov.in या .nic.in वेबसाइट नहीं है।'
              : 'This domain resembles a government scheme or bank name, but it is NOT an official .gov.in or .nic.in portal.',
      });
    } else if (/\.(xyz|top|buzz|click|tk|ml|ga|cf|shop|club)$/i.test(hostname) || /\d+\.\d+\.\d+\.\d+/.test(hostname)) {
      score += 30;
      indicators.push({
        code: 'SUSPICIOUS_TLD_OR_IP',
        severity: 'high',
        title:
          lang === 'bn'
            ? `অবিশ্বস্ত ওয়েবসাইট ডোমেইন (${hostname})`
            : `High-Risk Unfamiliar Domain (${hostname})`,
        explanation:
          lang === 'bn'
            ? 'অপরিচিত এক্সটেনশন (.xyz, .top, .click বা সরাসরি IP) যুক্ত লিঙ্ক ফিশিং প্রতারণায় বেশি ব্যবহৃত হয়।'
            : 'Links using low-trust extensions (.xyz, .top, .click) or raw IP addresses are commonly associated with phishing pages.',
      });
    } else if (!isOfficialGov) {
      score += 12;
      indicators.push({
        code: 'UNVERIFIED_EXTERNAL_URL',
        severity: 'medium',
        title:
          lang === 'bn'
            ? `যাচাইবিহীন বাহ্যিক লিঙ্ক (${hostname})`
            : `Unverified External Website (${hostname})`,
        explanation:
          lang === 'bn'
            ? 'এই ওয়েবসাইটটি অফিসিয়াল সরকারি ডোমেইন নয়। কোনো ব্যক্তিগত তথ্য দেওয়ার আগে স্বাধীনভাবে যাচাই করুন।'
            : 'This link is not an official government domain. Do not enter personal details without independent verification.',
      });
    }
  }

  return { indicators, score };
}

export function analyzeFraudRisk(
  content: string,
  inputType: string,
  lang: Language
): FraudAnalysisResult {
  const indicators: FraudIndicator[] = [];
  let totalScore = 0;

  for (const rule of FRAUD_RULES) {
    if (rule.regex.test(content)) {
      // Only add SCHEME_MENTION_CHECK_DOMAIN if not paired with an official .gov.in URL
      const urls = extractUrls(content);
      const hasOfficialGovUrl = urls.some((u) => /\.(gov|nic)\.in(\/|$)/i.test(u));
      if (rule.match.code === 'SCHEME_MENTION_CHECK_DOMAIN' && hasOfficialGovUrl) {
        continue;
      }
      totalScore += rule.match.weight;
      indicators.push({
        code: rule.match.code,
        severity: rule.match.severity,
        title: rule.match.title[lang] || rule.match.title.en,
        explanation: rule.match.explanation[lang] || rule.match.explanation.en,
      });
    }
  }

  // Never fetch or execute URLs — inspect strings purely statically
  const urls = extractUrls(content);
  const urlAudit = inspectUrls(urls, lang);
  totalScore += urlAudit.score;
  indicators.push(...urlAudit.indicators);

  // Check for personal UPI handle or phone number requesting urgent payment
  if (/[a-zA-Z0-9._-]+@(okaxis|okhdfcbank|okicici|oksbi|ybl|paytm|ibl|axl)\b/i.test(content)) {
    totalScore += 22;
    indicators.push({
      code: 'PERSONAL_UPI_HANDLE',
      severity: 'medium',
      title:
        lang === 'bn'
          ? 'মেসেজে ব্যক্তিগত UPI আইডি রয়েছে'
          : lang === 'hi'
            ? 'संदेश में निजी UPI आईडी शामिल है'
            : 'Personal UPI ID Present in Message',
      explanation:
        lang === 'bn'
          ? 'সরকারি দপ্তর বা প্রতিষ্ঠিত নিয়োগকর্তা কখনো ব্যক্তিগত UPI আইডিতে ফি নিতে বলে না।'
          : 'Government departments and legitimate recruiters do not collect application fees on personal UPI IDs.',
    });
  }

  if ((inputType === 'payment' || inputType === 'payment_request') && totalScore < 20) {
    totalScore += 18;
    indicators.push({
      code: 'UNSOLICITED_PAYMENT_REQUEST',
      severity: 'medium',
      title:
        lang === 'bn'
          ? 'অচেনা পেমেন্ট রিকোয়েস্ট সাবধানে যাচাই করুন'
          : 'Verify Any Unsolicited Payment Request Independently',
      explanation:
        lang === 'bn'
          ? 'টাকা পাঠানোর আগে প্রাপককে সরাসরি পরিচিত নম্বরে ফোন করে নিশ্চিত হোন।'
          : 'Confirm the sender’s identity through an independent, trusted phone number before approving any payment.',
    });
  }

  const highCount = indicators.filter((i) => i.severity === 'high').length;
  let riskLevel: FraudAnalysisResult['riskLevel'] = 'NO MAJOR RED FLAGS FOUND';
  if (totalScore >= 35 || highCount >= 1) {
    riskLevel = 'HIGH RISK';
  } else if (totalScore >= 15 || indicators.length > 0 || content.trim().length < 20) {
    riskLevel = 'NEEDS VERIFICATION';
  }

  const headlineMap = {
    'HIGH RISK': {
      bn: 'উচ্চ ঝুঁকি (HIGH RISK) — গুরুতর প্রতারণার লক্ষণ পাওয়া গেছে',
      en: 'HIGH RISK — Multiple Serious Fraud Indicators Detected',
      hi: 'उच्च जोखिम (HIGH RISK) — धोखाधड़ी के गंभीर संकेत मिले हैं',
    },
    'NEEDS VERIFICATION': {
      bn: 'যাচাই প্রয়োজন (NEEDS VERIFICATION) — পর্যাপ্ত প্রমাণ নেই',
      en: 'NEEDS VERIFICATION — Insufficient Evidence to Confirm Legitimacy',
      hi: 'सत्यापन आवश्यक (NEEDS VERIFICATION) — वैधता की पुष्टि नहीं हुई',
    },
    'NO MAJOR RED FLAGS FOUND': {
      bn: 'বড় কোনো সতর্কতা চিহ্ন মেলেনি (তবে এটি নিরাপত্তার গ্যারান্টি নয়)',
      en: 'NO MAJOR RED FLAGS FOUND — Does Not Guarantee Safety',
      hi: 'कोई बड़ा खतरा संकेत नहीं मिला (यह सुरक्षा की गारंटी नहीं है)',
    },
  };

  const summaryMap = {
    'HIGH RISK': {
      bn: 'এই বার্তা বা লিঙ্কে ডিজিটাল প্রতারণার গুরুতর লক্ষণ রয়েছে। কোনো টাকা পাঠাবেন না, লিঙ্কে ক্লিক করবেন না এবং OTP/UPI PIN দেবেন না।',
      en: 'This input matches known digital fraud patterns. Do not click the link, install any app, transfer money, or share OTP/UPI PIN.',
      hi: 'इस संदेश में ऑनलाइन धोखाधड़ी के गंभीर संकेत हैं। किसी लिंक पर क्लिक न करें, पैसे न भेजें और OTP/UPI PIN साझा न करें।',
    },
    'NEEDS VERIFICATION': {
      bn: 'এই তথ্যটি আসল কি না তা নিশ্চিতভাবে বলা যাচ্ছে না। কোনো পদক্ষেপ নেওয়ার আগে অফিসিয়াল .gov.in ওয়েবসাইট বা নিকটবর্তী বাংলা সহায়তা কেন্দ্রে (BSK) যাচাই করুন।',
      en: 'There is not enough verified evidence to confirm whether this message is genuine. Independently verify with the official organization or BSK before acting.',
      hi: 'इसकी प्रामाणिकता की पुष्टि के लिए पर्याप्त जानकारी नहीं है। कोई कदम उठाने से पहले आधिकारिक वेबसाइट पर जांच करें।',
    },
    'NO MAJOR RED FLAGS FOUND': {
      bn: 'স্বয়ংক্রিয় পরীক্ষায় সাধারণ প্রতারণার বড় চিহ্ন পাওয়া যায়নি। তবুও এটি ১০০% নিরাপদ বলে ধরে নেবেন না — কখনোই অগ্রিম টাকা বা ওটিপি দেবেন না।',
      en: 'No obvious scam patterns were detected automatically. However, this does not guarantee safety — always double-check independently before paying or sharing personal info.',
      hi: 'स्वचालित जांच में कोई स्पष्ट धोखाधड़ी संकेत नहीं मिला, लेकिन यह 100% सुरक्षा की गारंटी नहीं है। हमेशा स्वतंत्र रूप से जांच करें।',
    },
  };

  const safeNextSteps =
    lang === 'bn'
      ? [
          'সন্দেহজনক লিঙ্কে ক্লিক করবেন না এবং হোয়াটসঅ্যাপের .apk ফাইল ডাউনলোড করবেন না।',
          'কখনোই OTP, UPI PIN, ATM PIN বা আধার ওটিপি কারো সাথে শেয়ার করবেন না।',
          'সরকারি প্রকল্প বা চাকরির দাবি হলে সরাসরি অফিসিয়াল .gov.in পোর্টাল বা বাংলা সহায়তা কেন্দ্রে (BSK) যাচাই করুন।',
          'ইতিমধ্যে টাকা কেটে গিয়ে থাকলে সাথে সাথে ১৯৩০ নম্বরে ফোন করুন এবং আপনার ব্যাংকে জানান।',
        ]
      : lang === 'hi'
        ? [
            'संदिग्ध लिंक पर क्लिक न करें और व्हाट्सएप से प्राप्त .apk फाइल इंस्टॉल न करें।',
            'कभी भी OTP, UPI PIN या बैंक पासवर्ड साझा न करें।',
            'सरकारी योजना या नौकरी की पुष्टि केवल आधिकारिक .gov.in पोर्टल से करें।',
            'यदि पैसे कट गए हैं, तो तुरंत 1930 पर कॉल करें और अपने बैंक को सूचित करें।',
          ]
        : [
            'Do NOT click suspicious links or install .apk / screen-sharing apps (AnyDesk, TeamViewer).',
            'NEVER share OTP, UPI PIN, ATM PIN, or banking passwords — receiving money never requires a PIN.',
            'Verify government schemes or jobs independently on official .gov.in portals or at a Bangla Sahayata Kendra (BSK).',
            'If money was already debited, immediately call National Helpline 1930 and alert your bank branch.',
          ];

  const whatToAvoid =
    lang === 'bn'
      ? [
          'চাকরি, লোন বা সরকারি প্রকল্পের নামে কোনো রেজিস্ট্রেশন ফি, সিকিউরিটি ডিপোজিট বা প্রসেসিং ফি পাঠাবেন না।',
          'টাকা পাওয়ার জন্য কখনোই UPI PIN দেবেন না বা অচেনা QR কোড স্ক্যান করবেন না।',
          'ফোনে বা মেসেজে OTP, আধার ওটিপি, CVV বা ব্যাংক পাসওয়ার্ড বলবেন না।',
          'অচেনা ব্যক্তির কথায় AnyDesk, TeamViewer বা হোয়াটসঅ্যাপের .apk ফাইল ইনস্টল করবেন না।',
        ]
      : lang === 'hi'
        ? [
            'नौकरी, लोन या सरकारी योजना के नाम पर कोई अग्रिम शुल्क या जमा राशि न भेजें।',
            'पैसे प्राप्त करने के लिए कभी भी UPI PIN न डालें या अनजान QR कोड स्कैन न करें।',
            'फ़ोन या संदेश पर OTP, आधार OTP, CVV या पासवर्ड साझा न करें।',
            'किसी अनजान के कहने पर AnyDesk, TeamViewer या .apk फाइल इंस्टॉल न करें।',
          ]
        : [
            'Do NOT pay advance registration fees, uniform charges, security deposits, or loan-processing fees to personal accounts.',
            'Do NOT scan a QR code or enter your UPI PIN to "receive" money.',
            'Do NOT share OTPs, Aadhaar OTPs, CVV numbers, or banking passwords over phone or chat.',
            'Do NOT install AnyDesk, QuickSupport, TeamViewer, or unknown .apk files sent via WhatsApp/SMS.',
          ];

  return {
    riskLevel,
    headline: headlineMap[riskLevel][lang],
    summary: summaryMap[riskLevel][lang],
    indicators,
    safeNextSteps,
    whatToAvoid,
    officialReporting: [
      {
        name: lang === 'bn' ? 'জাতীয় সাইবার ক্রাইম হেল্পলাইন ১৯৩০' : 'National Cyber Crime Helpline 1930',
        detail:
          lang === 'bn'
            ? 'আর্থিক প্রতারণা হলে দ্রুত ১৯৩০ নম্বরে কল করুন (২৪×৭)।'
            : 'Call 1930 immediately if you experience financial cyber fraud (24x7).',
      },
      {
        name: 'National Cyber Crime Reporting Portal',
        detail: 'cybercrime.gov.in — File an official online complaint',
        url: 'https://cybercrime.gov.in/',
      },
      {
        name: 'Sanchar Saathi — Chakshu (Dept. of Telecom)',
        detail: 'sancharsaathi.gov.in — Report suspected fraud calls, SMS, or WhatsApp messages',
        url: 'https://sancharsaathi.gov.in/',
      },
    ],
    analysisPipeline: {
      staticEngineUsed: true,
      aiStatus: 'unavailable',
    },
    disclaimer:
      lang === 'bn'
        ? 'সতর্কতা: JENOVA Protect (প্রতারণা যাচাই) একটি প্রাথমিক ঝুঁকি বিশ্লেষণ সহায়ক টুল। এটি কোনো ব্যক্তি বা সংস্থাকে চূড়ান্তভাবে প্রতারক বা ১০০% নিরাপদ ঘোষণা করে না।'
        : 'Disclaimer: JENOVA Protect is an automated risk-awareness helper. It cannot guarantee that a message is safe, nor does it make legal accusations against any person or business.',
  };
}
