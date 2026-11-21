import type { UdaanProgramme } from '../types/platform';

export const UDAAN_PROGRAMMES: UdaanProgramme[] = [
  {
    id: 'udaan-interview-prep',
    slug: 'interview-preparation',
    category: 'Interview Preparation',
    level: 'Beginner',
    estimatedMinutes: 45,
    formatNote: {
      bn: 'স্ব-গতিতে অনলাইন অনুশীলন মডিউল (বিনামূল্যে)',
      hi: 'स्व-गति ऑनलाइन अभ्यास मॉड्यूल (निःशुल्क)',
      en: 'Self-paced online practice module (Free)',
    },
    title: {
      bn: 'ইন্টারভিউ প্রস্তুতি প্রশিক্ষণ',
      hi: 'इंटरव्यू तैयारी प्रशिक्षण',
      en: 'Interview Preparation Training',
    },
    tagline: {
      bn: 'প্রথম চাকরির ইন্টারভিউয়ে আত্মবিশ্বাসের সাথে নিজেকে উপস্থাপন করুন',
      hi: 'अपने पहले जॉब इंटरव्यू में आत्मविश्वास से खुद को प्रस्तुत करें',
      en: 'Present your abilities clearly and calmly in local or private-sector job interviews',
    },
    summary: {
      bn: 'নিজের পরিচয় দেওয়া, সাধারণ প্রশ্নের উত্তর, শালীন আচরণ, বায়োডাটা মিলিয়ে প্রস্তুতি এবং ভুয়া ইন্টারভিউ চেনার বাস্তব কৌশল শিখুন।',
      hi: 'अपना परिचय देना, सामान्य प्रश्नों के उत्तर, शिष्ट व्यवहार, बायोडाटा मिलान और नकली इंटरव्यू पहचानने की व्यावहारिक तकनीक सीखें।',
      en: 'Learn structured self-introduction, practical answers to common employer questions, professional etiquette, biodata readiness, and how to spot fake fee-based interviews.',
    },
    targetAudience: ['student', 'unemployed', 'job_seeker', 'worker'],
    skillTags: ['interview', 'communication', 'jobs', 'biodata', 'confidence'],
    relatedRoutes: [
      { path: '/jobs/biodata', label: { bn: '১-মিনিট বায়োডাটা তৈরি', hi: '1-मिनट बायोडाटा बनाएं', en: '1-Minute Biodata Builder' } },
      { path: '/jobs', label: { bn: 'যাচাইকৃত চাকরি দেখুন', hi: 'सत्यापित नौकरियां देखें', en: 'Browse Verified Jobs' } },
    ],
    lessons: [
      {
        id: 'int-l1',
        durationMinutes: 12,
        title: {
          bn: 'ধাপ ১: ৬০ সেকেন্ডে নিজের সঠিক পরিচয় (Self-Introduction)',
          hi: 'पाठ 1: 60 सेकंड में अपना स्पष्ट परिचय (Self-Introduction)',
          en: 'Lesson 1: Clear 60-Second Self-Introduction',
        },
        content: {
          bn: 'ইন্টারভিউয়ের প্রথম প্রশ্ন প্রায়ই হয় — “নিজের সম্পর্কে বলুন”। দীর্ঘ ব্যক্তিগত গল্প না বলে চারটি ছোট অংশে উত্তর দিন: (১) আপনার নাম ও এলাকা, (২) আপনার শিক্ষা বা প্রশিক্ষণ, (৩) আপনার ১–২টি কাজের দক্ষতা বা অভিজ্ঞতা, এবং (৪) আপনি কেন এই কাজটি মনোযোগ দিয়ে করতে চান। উত্তরটি আগে ২–৩ বার জোরে উচ্চারণ করে অনুশীলন করুন।',
          hi: 'इंटरव्यू का पहला सवाल अक्सर होता है — "अपने बारे में बताइए"। लंबी निजी कहानी के बजाय चार छोटे भागों में उत्तर दें: (1) आपका नाम और स्थान, (2) आपकी शिक्षा या प्रशिक्षण, (3) आपके 1–2 व्यावहारिक कौशल या अनुभव, और (4) आप इस काम को गंभीरता से क्यों करना चाहते हैं। जवाब को 2–3 बार बोलकर अभ्यास करें।',
          en: 'Almost every interview starts with "Tell me about yourself." Instead of reciting your life story, follow a simple 4-part structure: (1) Your name and town/district, (2) Your education or vocational training, (3) One or two practical skills or hands-on tasks you can perform reliably, and (4) Why this role fits your goals. Practise saying it aloud calmly in under 60 seconds.',
        },
        keyTakeaways: [
          {
            bn: 'নাম, শিক্ষা, বাস্তব দক্ষতা ও কাজের আগ্রহ — এই ৪টি বিষয় গুছিয়ে বলুন।',
            hi: 'नाम, शिक्षा, व्यावहारिक कौशल और काम में रुचि — इन 4 बिंदुओं को क्रम से बताएं।',
            en: 'Cover 4 essentials in order: Name/place, education, practical skills, and work motivation.',
          },
          {
            bn: 'যা জানেন না তা বানিয়ে বলবেন না; শেখার আগ্রহ স্পষ্টভাবে প্রকাশ করুন।',
            hi: 'जो नहीं जानते उसे बढ़ा-चढ़ाकर न बताएं; सीखने की तत्परता स्पष्ट दिखाएं।',
            en: 'Never exaggerate skills; express honest willingness to learn on the job.',
          },
        ],
      },
      {
        id: 'int-l2',
        durationMinutes: 15,
        title: {
          bn: 'ধাপ ২: সাধারণ ইন্টারভিউ প্রশ্ন ও বাস্তবসম্মত উত্তর',
          hi: 'पाठ 2: सामान्य इंटरव्यू प्रश्न और व्यावहारिक उत्तर',
          en: 'Lesson 2: Answering Common Employer Questions Practically',
        },
        content: {
          bn: 'নিয়োগকর্তারা মূলত তিনটি বিষয় জানতে চান: আপনি কি কাজটি করতে পারবেন? আপনি কি সময়মতো আসবেন ও দায়িত্বশীল হবেন? আপনি কি দলের সাথে মিলে কাজ করতে পারবেন? “আপনার দুর্বলতা কী?” বা “কেন আপনাকে নেব?” — এসব প্রশ্নে ছোট উদাহরণ দিন। যেমন: “আমি আগে একটি দোকানে হিসাব রাখতাম এবং প্রতিদিন সময়মতো কাজ শেষ করতাম।”',
          hi: 'नियोक्ता मुख्य रूप से तीन बातें जानना चाहते हैं: क्या आप काम कर पाएंगे? क्या आप समय के पाबंद और जिम्मेदार हैं? क्या आप टीम के साथ काम कर सकते हैं? "हम आपको क्यों चुनें?" जैसे सवालों का जवाब किसी छोटे वास्तविक उदाहरण के साथ दें।',
          en: 'Employers mostly evaluate three qualities: capability, reliability, and teamwork. When asked "Why should we hire you?" or "What are your strengths?", back up your answer with a small real example from school, home business, community work, or previous jobs rather than vague adjectives.',
        },
        keyTakeaways: [
          {
            bn: 'প্রতিটি দাবির সাথে একটি ছোট বাস্তব উদাহরণ যোগ করুন।',
            hi: 'अपने हर गुण के साथ एक छोटा वास्तविक उदाहरण जोड़ें।',
            en: 'Pair every claimed strength with one short real-life example.',
          },
          {
            bn: 'বেতন ও কাজের সময় সম্পর্কে ভদ্রভাবে ও স্পষ্টভাবে জেনে নিন।',
            hi: 'वेतन और कार्य समय के बारे में विनम्रता और स्पष्टता से पूछें।',
            en: 'Politely confirm work hours, role duties, and monthly pay terms before joining.',
          },
        ],
      },
      {
        id: 'int-l3',
        durationMinutes: 18,
        title: {
          bn: 'ধাপ ৩: নথি প্রস্তুতি ও ভুয়া ইন্টারভিউ থেকে সুরক্ষা',
          hi: 'पाठ 3: दस्तावेज़ तैयारी और नकली इंटरव्यू से सुरक्षा',
          en: 'Lesson 3: Document Readiness & Spotting Fake Job Interviews',
        },
        content: {
          bn: 'ইন্টারভিউয়ে যাওয়ার আগে ১টি পরিষ্কার ফোল্ডারে বায়োডাটার ২ কপি, শিক্ষাগত সার্টিফিকেটের ফটোকপি ও ২ কপি পাসপোর্ট ছবি রাখুন। আসল সার্টিফিকেট কখনোই কারও কাছে জমা রাখবেন না এবং চাকরির জন্য “রেজিস্ট্রেশন ফি”, “ইউনিফর্ম ফি” বা “সিকিউরিটি ডিপোজিট” চাইলে সাথে সাথে সতর্ক হন — প্রকৃত নিয়োগকর্তা ইন্টারভিউয়ের আগে টাকা চান না।',
          hi: 'इंटरव्यू से पहले एक साफ फाइल में बायोडाटा की 2 प्रतियां, शिक्षा प्रमाणपत्र की फोटोकॉपी और 2 पासपोर्ट फोटो रखें। मूल दस्तावेज़ किसी के पास जमा न करें और यदि कोई "रजिस्ट्रेशन शुल्क" या "सिक्योरिटी डिपॉजिट" मांगे तो तुरंत सतर्क हो जाएं।',
          en: 'Carry a clean folder with 2 copies of your biodata, photocopies of education certificates, and 2 passport photos. Never hand over original certificates to keep, and never pay upfront "registration", "joining", or "interview" fees — genuine employers do not charge candidates to apply.',
        },
        keyTakeaways: [
          {
            bn: 'আসল কাগজ কেবল দেখানোর জন্য — জমা রাখার জন্য নয়।',
            hi: 'मूल दस्तावेज़ केवल दिखाने के लिए होते हैं, जमा करने के लिए नहीं।',
            en: 'Show original documents only for verification; submit photocopies only.',
          },
          {
            bn: 'কোনো সন্দেহজনক চাকরির অফার পেলে JENOVA Protect-এ যাচাই করুন।',
            hi: 'संदिग्ध जॉब ऑफर मिलने पर JENOVA Protect में तुरंत जांच करें।',
            en: 'Check any suspicious job offer or WhatsApp message in JENOVA Protect first.',
          },
        ],
      },
    ],
    assignment: {
      title: {
        bn: 'ব্যবহারিক অনুশীলন: আপনার ৬০ সেকেন্ডের ইন্টারভিউ পরিচয় লিখুন',
        hi: 'व्यावहारिक अभ्यास: अपना 60 सेकंड का इंटरव्यू परिचय लिखें',
        en: 'Practical Practice: Draft Your 60-Second Interview Introduction',
      },
      prompt: {
        bn: 'আপনি যে কাজের জন্য আবেদন করতে চান (যেমন: অফিস অ্যাসিস্ট্যান্ট, রিটেইল স্টাফ, টেকনিশিয়ান বা ডেটা এন্ট্রি) তা উল্লেখ করে ৪–৫ বাক্যে আপনার নিজের পরিচয় লিখুন। (কখনোই ফোন নম্বর, আধার বা ঠিকানা লিখবেন না।)',
        hi: 'आप जिस पद के लिए आवेदन करना चाहते हैं (जैसे: ऑफिस असिस्टेंट, रिटेल स्टाफ, टेक्नीशियन या डेटा एंट्री) उसका उल्लेख करते हुए 4–5 वाक्यों में अपना परिचय लिखें। (कभी फोन नंबर, आधार या निजी पता न लिखें।)',
        en: 'Write a 4–5 sentence self-introduction for a role you want to apply for (e.g. office assistant, retail staff, technician, or data entry). Do NOT include phone numbers, Aadhaar, or home addresses.',
      },
      rubricPoints: [
        { bn: 'নাম/জেলা, শিক্ষা, ১–২টি দক্ষতা ও কাজের আগ্রহ স্পষ্ট আছে কি না', hi: 'नाम/जिला, शिक्षा, 1–2 कौशल और काम में रुचि स्पष्ट है या नहीं', en: 'Includes role focus, education, 1–2 practical skills, and work readiness' },
        { bn: 'ভাষা ভদ্র, সংক্ষিপ্ত ও আত্মবিশ্বাসী কি না', hi: 'भाषा विनम्र, संक्षिप्त और आत्मविश्वासपूर्ण है या नहीं', en: 'Tone is polite, concise, and easy to speak aloud' },
      ],
    },
    quiz: [
      {
        id: 'int-q1',
        question: {
          bn: 'ইন্টারভিউয়ের আগে কোনো সংস্থা যদি “রেজিস্ট্রেশন ফি” হিসেবে ₹১,৫০০ UPI করতে বলে, তাহলে সঠিক পদক্ষেপ কী?',
          hi: 'यदि इंटरव्यू से पहले कोई संस्था "रजिस्ट्रेशन शुल्क" के रूप में ₹1,500 UPI करने को कहे, तो सही कदम क्या है?',
          en: 'If an agency asks for ₹1,500 via UPI as a "registration fee" before an interview, what should you do?',
        },
        options: [
          { bn: 'দ্রুত টাকা পাঠিয়ে সিট নিশ্চিত করা', hi: 'तुरंत पैसे भेजकर सीट पक्की करना', en: 'Pay immediately to secure the seat' },
          { bn: 'টাকা না দেওয়া এবং অফিসিয়াল উৎস/JENOVA Protect-এ যাচাই করা', hi: 'पैसे न देना और आधिकारिक स्रोत / JENOVA Protect से जांच करना', en: 'Refuse payment and verify via official sources / JENOVA Protect' },
          { bn: 'আসল আধার কার্ড কুরিয়ার করে পাঠানো', hi: 'मूल आधार कार्ड कूरियर करना', en: 'Courier original Aadhaar card instead' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'প্রকৃত নিয়োগকর্তা বা সরকারি পোর্টাল কখনোই ইন্টারভিউয়ের জন্য অগ্রিম UPI ফি চায় না।',
          hi: 'वास्तविक नियोक्ता या सरकारी पोर्टल कभी भी इंटरव्यू के लिए अग्रिम UPI शुल्क नहीं मांगते।',
          en: 'Genuine employers and official portals do not demand upfront UPI registration fees for interviews.',
        },
      },
      {
        id: 'int-q2',
        question: {
          bn: '“নিজের সম্পর্কে বলুন” প্রশ্নের সবচেয়ে কার্যকর কাঠামো কোনটি?',
          hi: '"अपने बारे में बताइए" प्रश्न का सबसे प्रभावी ढांचा कौन सा है?',
          en: 'What is the most effective structure for "Tell me about yourself"?',
        },
        options: [
          { bn: 'শৈশব থেকে সম্পূর্ণ পারিবারিক ইতিহাস বলা', hi: 'बचपन से पूरा पारिवारिक इतिहास सुनाना', en: 'Reciting your full family history from childhood' },
          { bn: 'নাম/অবস্থান + শিক্ষা + বাস্তব দক্ষতা + কাজের আগ্রহ (৬০ সেকেন্ডে)', hi: 'नाम/स्थान + शिक्षा + व्यावहारिक कौशल + काम की रुचि (60 सेकंड में)', en: 'Name/place + education + practical skills + work interest (under 60s)' },
          { bn: 'শুধু নিজের নাম বলে চুপ থাকা', hi: 'केवल नाम बताकर चुप हो जाना', en: 'Saying only your name and stopping' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'সংক্ষিপ্ত ৪-অংশের পরিচয় নিয়োগকর্তাকে দ্রুত আপনার যোগ্যতা বুঝতে সাহায্য করে।',
          hi: 'संक्षिप्त 4-भाग परिचय नियोक्ता को आपकी उपयुक्तता तुरंत समझने में मदद करता है।',
          en: 'A concise 4-part structure immediately shows your fit for the job.',
        },
      },
      {
        id: 'int-q3',
        question: {
          bn: 'ইন্টারভিউয়ে কোনো প্রশ্নের উত্তর জানা না থাকলে কী করা উচিত?',
          hi: 'इंटरव्यू में किसी सवाल का जवाब न आने पर क्या करना चाहिए?',
          en: 'What should you do if you do not know the answer to a technical question in an interview?',
        },
        options: [
          { bn: 'সততার সাথে স্বীকার করে দ্রুত শেখার আগ্রহ জানানো', hi: 'ईमानदारी से स्वीकार कर सीखने की तत्परता बताना', en: 'Honestly acknowledge it and express readiness to learn' },
          { bn: 'ভুল তথ্য বানিয়ে বলা', hi: 'गलत जानकारी बनाकर बोलना', en: 'Make up a false answer confidently' },
          { bn: 'রাগ করে ঘর থেকে বেরিয়ে যাওয়া', hi: 'नाराज़ होकर कमरे से निकल जाना', en: 'Walk out of the room immediately' },
        ],
        correctIndex: 0,
        explanation: {
          bn: 'সততা ও শেখার মানসিকতা নিয়োগকর্তাদের কাছে বিশ্বাসযোগ্যতা তৈরি করে।',
          hi: 'ईमानदारी और सीखने की इच्छा नियोक्ताओं का भरोसा जीतती है।',
          en: 'Honesty and willingness to learn build far more trust than guessing.',
        },
      },
    ],
  },

  {
    id: 'udaan-business-plan',
    slug: 'business-plan-executive',
    category: 'Business Plan Executive',
    level: 'Intermediate',
    estimatedMinutes: 55,
    formatNote: {
      bn: 'স্ব-গতিতে অনলাইন অনুশীলন মডিউল (বিনামূল্যে)',
      hi: 'स्व-गति ऑनलाइन अभ्यास मॉड्यूल (निःशुल्क)',
      en: 'Self-paced online practice module (Free)',
    },
    title: {
      bn: 'বিজনেস প্ল্যান এক্সিকিউটিভ প্রশিক্ষণ',
      hi: 'बिज़नेस प्लान एग्जीक्यूटिव प्रशिक्षण',
      en: 'Business Plan Executive Training',
    },
    tagline: {
      bn: 'অনুমান নয় — বাস্তব হিসাব ও চাহিদার ভিত্তিতে ১-পাতার ব্যবসায়িক পরিকল্পনা তৈরি করুন',
      hi: 'अनुमान नहीं — वास्तविक लागत और मांग के आधार पर 1-पेज बिज़नेस प्लान बनाएं',
      en: 'Turn a small business idea into a realistic, numbers-backed 1-page business plan',
    },
    summary: {
      bn: 'কোন পণ্য বা পরিষেবার স্থানীয় চাহিদা আছে, শুরুতে কত পুঁজি লাগবে, দাম কীভাবে ঠিক করবেন এবং কত বিক্রি হলে খরচ উঠবে তা ধাপে ধাপে শিখুন।',
      hi: 'स्थानीय मांग की जांच, शुरुआती पूंजी का अनुमान, सही कीमत तय करना और ब्रेक-ईवन गणना चरण-दर-चरण सीखें।',
      en: 'Step-by-step training on validating real local demand, estimating startup & working capital, setting sustainable prices, and calculating break-even honestly.',
    },
    targetAudience: ['entrepreneur', 'small_business', 'homemaker', 'worker'],
    skillTags: ['business', 'business_plan', 'pricing', 'startup', 'msme', 'tailoring'],
    relatedRoutes: [
      { path: '/msme/planner', label: { bn: 'বিজনেস প্ল্যান বিল্ডার খুলুন', hi: 'बिज़नेस प्लान बिल्डर खोलें', en: 'Open Business Plan Builder' } },
      { path: '/msme', label: { bn: 'লাভ ও ব্রেক-ইভেন ক্যালকুলেটর', hi: 'लाभ और ब्रेक-ईवन कैलकुलेटर', en: 'Profit & Break-Even Calculator' } },
    ],
    lessons: [
      {
        id: 'bp-l1',
        durationMinutes: 18,
        title: {
          bn: 'ধাপ ১: বড় বিনিয়োগের আগে গ্রাহকের চাহিদা যাচাই',
          hi: 'पाठ 1: बड़े निवेश से पहले ग्राहक की मांग सत्यापित करें',
          en: 'Lesson 1: Validating Real Customer Demand Before Investing',
        },
        content: {
          bn: 'নতুন ব্যবসা শুরু করার সবচেয়ে বড় ভুল হলো গ্রাহকের সাথে কথা না বলেই দামি যন্ত্র বা মালপত্র কিনে ফেলা। শুরু করার আগে আপনার এলাকার ১০–১৫ জন সম্ভাব্য গ্রাহকের সাথে কথা বলুন: তারা এখন এই পণ্য/পরিষেবা কোথা থেকে নেন, কত টাকা দেন, এবং কোন সমস্যায় পড়েন (যেমন: দেরি, মানের অভাব বা দূরত্ব)?',
          hi: 'नया व्यवसाय शुरू करते समय सबसे बड़ी गलती ग्राहकों से बात किए बिना महंगी मशीन या स्टॉक खरीद लेना है। पहले अपने क्षेत्र के 10–15 संभावित ग्राहकों से पूछें: वे अभी यह सेवा कहां से लेते हैं, कितना भुगतान करते हैं, और उन्हें क्या परेशानी होती है?',
          en: 'The biggest mistake new founders make is buying expensive stock or machinery before speaking to customers. Before spending capital, interview 10–15 prospective local buyers: where do they buy today, what price do they pay, and what frustrates them (quality, waiting time, or distance)?',
        },
        keyTakeaways: [
          {
            bn: 'পণ্য কেনার আগে অন্তত ১০ জন স্থানীয় মানুষের মতামত নিন।',
            hi: 'निवेश से पहले कम से कम 10 स्थानीय संभावित ग्राहकों से बात करें।',
            en: 'Talk to at least 10 real prospective buyers before buying inventory or tools.',
          },
          {
            bn: 'ছোট ট্রায়াল অর্ডার দিয়ে শুরু করুন — এতে ঝুঁকি অনেক কমে।',
            hi: 'छोटे ट्रायल ऑर्डर से शुरुआत करें — इससे वित्तीय जोखिम कम रहता है।',
            en: 'Start with a small pilot batch to test real willingness to pay with low risk.',
          },
        ],
      },
      {
        id: 'bp-l2',
        durationMinutes: 20,
        title: {
          bn: 'ধাপ ২: প্রাথমিক পুঁজি (Startup Cost) ও মাসিক চলতি খরচ (Working Capital)',
          hi: 'पाठ 2: शुरुआती लागत (Startup Cost) और मासिक कार्यशील पूंजी',
          en: 'Lesson 2: Separating One-Time Startup Cost from Monthly Working Capital',
        },
        content: {
          bn: 'ব্যবসার খরচ দুই ভাগে লিখুন: (১) এককালীন খরচ (যেমন সেলাই মেশিন, টেবিল, সাইনবোর্ড বা প্রথম কাঁচামাল) এবং (২) মাসিক স্থায়ী খরচ (দোকান ভাড়া, বিদ্যুৎ, যাতায়াত, ইন্টারনেট)। প্রথম ৩ মাসের স্থায়ী খরচ হাতে আলাদা করে রাখুন যাতে প্রথম মাসে বিক্রি কম হলেও ব্যবসা বন্ধ না হয়।',
          hi: 'व्यवसाय के खर्च को दो भागों में लिखें: (1) एकमुश्त शुरुआती खर्च (जैसे सिलाई मशीन, टेबल, शुरुआती कच्चा माल) और (2) मासिक निश्चित खर्च (किराया, बिजली, परिवहन)। पहले 3 महीनों का खर्च अलग रखें ताकि धीमी शुरुआत में भी व्यवसाय चलता रहे।',
          en: 'Always divide expenses into two buckets: (1) One-time startup setup costs (machines, tools, initial stock) and (2) Recurring monthly fixed costs (rent, electricity, transport, phone). Keep a 2–3 month buffer so a slow first month does not force closure.',
        },
        keyTakeaways: [
          {
            bn: 'এককালীন খরচ আর মাসিক খরচ কখনোই একসাথে গুলিয়ে ফেলবেন না।',
            hi: 'एकमुश्त लागत और मासिक खर्च को हमेशा अलग-अलग लिखें।',
            en: 'Track one-time setup costs separately from monthly fixed costs.',
          },
          {
            bn: 'ব্যক্তিগত সংসারের টাকা আর ব্যবসার টাকা আলাদা খাতায় রাখুন।',
            hi: 'घरेलू पैसे और व्यवसाय के पैसे का हिसाब अलग खाते में रखें।',
            en: 'Never mix household cash with business cash; keep a simple separate ledger.',
          },
        ],
      },
      {
        id: 'bp-l3',
        durationMinutes: 17,
        title: {
          bn: 'ধাপ ৩: সঠিক মূল্য নির্ধারণ (Pricing) ও ব্রেক-ইভেন হিসাব',
          hi: 'पाठ 3: सही मूल्य निर्धारण (Pricing) और ब्रेक-ईवन गणना',
          en: 'Lesson 3: Sustainable Pricing & Break-Even Reality Check',
        },
        content: {
          bn: 'শুধু পাশের দোকানের চেয়ে সস্তা দাম রাখলে লাভ থাকে না। প্রতিটি পণ্যের কাঁচামাল + প্যাকেজিং + নিজের শ্রম + মাসিক খরচের অংশ যোগ করে ন্যূনতম দাম হিসাব করুন। তারপর দেখুন মাসে কতটি বিক্রি করলে আপনার “কোনো লোকসান নেই” (Break-even) পর্যায়ে পৌঁছাবেন।',
          hi: 'केवल पड़ोसी दुकान से कम दाम रखने से लाभ नहीं होता। हर वस्तु के कच्चे माल + पैकेजिंग + अपने श्रम + मासिक खर्च का हिस्सा जोड़कर न्यूनतम कीमत निकालें और जानें कि खर्च निकालने के लिए हर माह कितनी बिक्री जरूरी है।',
          en: 'Pricing purely below competitors often leads to losses. Add material cost + packaging + fair value for your time + a share of fixed rent/utilities to find your true cost per unit. Then calculate how many monthly sales you need just to break even.',
        },
        keyTakeaways: [
          {
            bn: 'বিক্রয়মূল্য অবশ্যই সরাসরি কাঁচামাল খরচের চেয়ে যথেষ্ট বেশি হতে হবে।',
            hi: 'विक्रय मूल्य कच्चे माल की लागत और मासिक खर्च को कवर करने योग्य होना चाहिए।',
            en: 'Unit price must comfortably exceed direct material cost to cover monthly fixed bills.',
          },
          {
            bn: 'কোনো ব্যবসায় নিশ্চিত লাভের গ্যারান্টি হয় না — কম চাহিদার মাস ধরেও হিসাব করুন।',
            hi: 'किसी व्यवसाय में निश्चित मुनाफे की गारंटी नहीं होती — मंदी के महीनों का भी आकलन करें।',
            en: 'Profit is never guaranteed; always test your numbers under conservative sales assumptions.',
          },
        ],
      },
    ],
    assignment: {
      title: {
        bn: 'ব্যবহারিক অনুশীলন: আপনার ১-পাতার ব্যবসার সারাংশ লিখুন',
        hi: 'व्यावहारिक अभ्यास: अपने 1-पेज व्यवसाय का सारांश लिखें',
        en: 'Practical Practice: Write Your 1-Page Business Idea Summary',
      },
      prompt: {
        bn: 'আপনি যে ছোট ব্যবসাটি শুরু বা বড় করতে চান তার নাম, কারা আপনার গ্রাহক হবেন, শুরুতে আনুমানিক কত টাকা লাগবে এবং আপনার এলাকার মানুষের কোন সমস্যার সমাধান হবে — তা ৫–৬ বাক্যে লিখুন।',
        hi: 'आप जो छोटा व्यवसाय शुरू या बड़ा करना चाहते हैं उसका प्रकार, आपके ग्राहक कौन होंगे, अनुमानित शुरुआती लागत और इससे स्थानीय लोगों की कौन-सी जरूरत पूरी होगी — 5–6 वाक्यों में लिखें।',
        en: 'Describe in 5–6 sentences the small business you want to start or grow: what you will sell, who your local customers are, your rough startup budget, and what problem it solves.',
      },
      rubricPoints: [
        { bn: 'নির্দিষ্ট গ্রাহক ও স্থানীয় চাহিদা উল্লেখ আছে কি না', hi: 'स्पष्ट ग्राहक वर्ग और स्थानीय मांग का उल्लेख है या नहीं', en: 'Clearly defines target customers and local need' },
        { bn: 'খরচ ও আয়ের বাস্তবসম্মত ধারণা আছে কি না', hi: 'लागत और आय का व्यावहारिक आकलन है या नहीं', en: 'Includes realistic cost and pricing awareness' },
      ],
    },
    quiz: [
      {
        id: 'bp-q1',
        question: {
          bn: 'যদি আপনার মাসিক স্থায়ী খরচ ₹৪,০০০ হয় এবং প্রতিটি পণ্যে (দাম − কাঁচামাল) লাভ ₹১০০ হয়, তবে খরচ তুলতে মাসে ন্যূনতম কতটি বিক্রি দরকার?',
          hi: 'यदि आपका मासिक निश्चित खर्च ₹4,000 है और प्रति वस्तु मार्जिन ₹100 है, तो ब्रेक-ईवन के लिए मासिक कितनी बिक्री चाहिए?',
          en: 'If your fixed monthly cost is ₹4,000 and your margin per item (price minus material) is ₹100, how many monthly sales are needed to break even?',
        },
        options: [
          { bn: '২০টি', hi: '20 यूनिट', en: '20 units' },
          { bn: '৪০টি', hi: '40 यूनिट', en: '40 units' },
          { bn: '১০০টি', hi: '100 यूनिट', en: '100 units' },
        ],
        correctIndex: 1,
        explanation: {
          bn: '₹৪,০০০ ÷ ₹১০০ = ৪০টি। ৪০টির বেশি বিক্রি হলে তবেই প্রকৃত নিট লাভ শুরু হয়।',
          hi: '₹4,000 ÷ ₹100 = 40 यूनिट। 40 से अधिक बिक्री होने पर ही वास्तविक शुद्ध लाभ शुरू होता है।',
          en: '₹4,000 ÷ ₹100 = 40 units. Net profit begins only after you pass 40 sales in the month.',
        },
      },
      {
        id: 'bp-q2',
        question: {
          bn: 'নতুন ব্যবসা শুরু করার আগে সবচেয়ে কম ঝুঁকির প্রথম ধাপ কোনটি?',
          hi: 'नया व्यवसाय शुरू करने से पहले सबसे कम जोखिम वाला पहला कदम कौन सा है?',
          en: 'What is the lowest-risk first step before investing in a new business?',
        },
        options: [
          { bn: 'চড়া সুদে অনানুষ্ঠানিক ঋণ নিয়ে বড় দোকান ভাড়া করা', hi: 'ऊंचे ब्याज पर कर्ज लेकर बड़ी दुकान किराए पर लेना', en: 'Taking a high-interest informal loan to rent a large shop' },
          { bn: '১০–১৫ জন সম্ভাব্য গ্রাহকের সাথে কথা বলা ও ছোট ট্রায়াল চালানো', hi: '10–15 संभावित ग्राहकों से बात करना और छोटा ट्रायल चलाना', en: 'Speaking with 10–15 prospective buyers and running a small trial' },
          { bn: 'কোনো হিসাব ছাড়াই পুরো সঞ্চয় মালপত্রে খরচ করা', hi: 'बिना हिसाब के पूरी बचत स्टॉक में लगाना', en: 'Spending all family savings on stock without costing' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'গ্রাহকের চাহিদা আগে যাচাই করলে অপ্রয়োজনীয় ক্ষতির ঝুঁকি অনেক কমে।',
          hi: 'ग्राहकों की वास्तविक मांग पहले समझने से अनावश्यक नुकसान का जोखिम काफी घटता है।',
          en: 'Validating real customer demand first prevents costly inventory mistakes.',
        },
      },
      {
        id: 'bp-q3',
        question: {
          bn: 'ব্যবসার আর্থিক হিসাব পরিষ্কার রাখার মূল নিয়ম কোনটি?',
          hi: 'व्यवसाय का वित्तीय हिसाब साफ रखने का मुख्य नियम क्या है?',
          en: 'What is the core habit for keeping small-business finances healthy?',
        },
        options: [
          { bn: 'সংসারের খরচ ও ব্যবসার টাকা আলাদা খাতায় বা অ্যাকাউন্টে রাখা', hi: 'घरेलू खर्च और व्यवसाय के पैसे को अलग खाते में रखना', en: 'Keeping household spending and business cash in separate records' },
          { bn: 'মাসের শেষে কেবল আন্দাজ করে লাভ ধরা', hi: 'महीने के अंत में केवल अंदाजे से लाभ मानना', en: 'Guessing profit at month-end without writing expenses' },
          { bn: 'ছোট খরচগুলো খাতায় না লেখা', hi: 'छोटे खर्चों को खाते में न लिखना', en: 'Ignoring small daily transport or utility costs' },
        ],
        correctIndex: 0,
        explanation: {
          bn: 'প্রতিদিনের আয়-ব্যয় আলাদা রাখলে ব্যবসার আসল লাভ-লোকসান পরিষ্কার বোঝা যায়।',
          hi: 'दैनिक आय-व्यय अलग रखने से व्यवसाय के वास्तविक लाभ-हानि की सही तस्वीर मिलती है।',
          en: 'Separating personal and business cash shows whether the enterprise is truly profitable.',
        },
      },
    ],
  },

  {
    id: 'udaan-soft-skills',
    slug: 'personality-soft-skills',
    category: 'Personality & Soft Skills',
    level: 'Beginner',
    estimatedMinutes: 40,
    formatNote: {
      bn: 'স্ব-গতিতে অনলাইন অনুশীলন মডিউল (বিনামূল্যে)',
      hi: 'स्व-गति ऑनलाइन अभ्यास मॉड्यूल (निःशुल्क)',
      en: 'Self-paced online practice module (Free)',
    },
    title: {
      bn: 'ব্যক্তিত্ব বিকাশ ও সফট স্কিল প্রশিক্ষণ',
      hi: 'व्यक्तित्व विकास और सॉफ्ट स्किल्स प्रशिक्षण',
      en: 'Personality & Soft Skills Training',
    },
    tagline: {
      bn: 'কর্মক্ষেত্র ও গ্রাহকদের সাথে ভদ্র, স্পষ্ট ও আত্মবিশ্বাসী যোগাযোগ গড়ে তুলুন',
      hi: 'कार्यस्थल और ग्राहकों के साथ विनम्र, स्पष्ट और आत्मविश्वासपूर्ण संवाद विकसित करें',
      en: 'Build everyday confidence, respectful communication, customer trust, and workplace discipline',
    },
    summary: {
      bn: 'মনোযোগ দিয়ে শোনা, ভদ্রভাবে কথা বলা, সময়ের মূল্য দেওয়া, রাগ নিয়ন্ত্রণ এবং গ্রাহকের আস্থা অর্জনের সহজ অভ্যাস শিখুন।',
      hi: 'ध्यान से सुनना, विनम्र संवाद, समय प्रबंधन, तनाव नियंत्रण और ग्राहकों का विश्वास जीतने की सरल आदतें सीखें।',
      en: 'Practical habits for active listening, clear speaking, punctuality, handling difficult customers calmly, and earning long-term trust at work or in business.',
    },
    targetAudience: ['student', 'unemployed', 'worker', 'entrepreneur', 'homemaker'],
    skillTags: ['communication', 'confidence', 'soft_skills', 'customer_service'],
    relatedRoutes: [
      { path: '/udaan/udaan-interview-prep', label: { bn: 'ইন্টারভিউ প্রস্তুতি মডিউল', hi: 'इंटरव्यू तैयारी मॉड्यूल', en: 'Interview Preparation Module' } },
      { path: '/passport', label: { bn: 'অ্যাকশন পাসপোর্টে লক্ষ্য যোগ করুন', hi: 'एक्शन पासपोर्ट में लक्ष्य जोड़ें', en: 'Add Goal to Action Passport' } },
    ],
    lessons: [
      {
        id: 'ss-l1',
        durationMinutes: 12,
        title: {
          bn: 'ধাপ ১: স্পষ্ট যোগাযোগ ও মনোযোগ দিয়ে শোনার কৌশল',
          hi: 'पाठ 1: स्पष्ट संवाद और ध्यान से सुनने की कला',
          en: 'Lesson 1: Active Listening & Clear Everyday Communication',
        },
        content: {
          bn: 'ভালো যোগাযোগ মানেই ইংরেজি জানা নয় — যেকোনো ভাষায় (বাংলা, হিন্দি বা ইংরেজি) স্পষ্ট, শান্ত ও ভদ্রভাবে কথা বলা। অন্যের কথা মাঝপথে না কেটে পুরোটা শুনুন এবং প্রয়োজনে সংক্ষেপে নিশ্চিত করুন: “আমি কি ঠিক বুঝলাম যে আপনি আগামীকাল সকাল ১০টার মধ্যে এটি চাইছেন?”',
          hi: 'अच्छा संवाद केवल अंग्रेजी बोलना नहीं है — किसी भी भाषा में स्पष्ट, शांत और विनम्रता से बात करना है। सामने वाले की बात पूरी सुनें और जरूरत पड़ने पर संक्षेप में पुष्टि करें।',
          en: 'Strong communication does not require fancy English — it means speaking calmly, respectfully, and clearly in Bengali, Hindi, or English. Listen without interrupting and confirm key details aloud ("Just to confirm, you need this ready by 10 AM tomorrow?").',
        },
        keyTakeaways: [
          {
            bn: 'আগে পুরো কথা শুনুন, তারপর উত্তর দিন।',
            hi: 'पहले पूरी बात ध्यान से सुनें, फिर उत्तर दें।',
            en: 'Listen fully before replying to avoid misunderstandings.',
          },
          {
            bn: 'সময়, দাম বা কাজের শর্ত পরিষ্কারভাবে নিশ্চিত করে নিন।',
            hi: 'समय, कीमत या काम की शर्तें हमेशा स्पष्ट रूप से पुष्टि करें।',
            en: 'Confirm deadlines, prices, and expectations clearly upfront.',
          },
        ],
      },
      {
        id: 'ss-l2',
        durationMinutes: 14,
        title: {
          bn: 'ধাপ ২: সময়ানুবর্তিতা, দায়িত্ববোধ ও পেশাদার আচরণ',
          hi: 'पाठ 2: समय की पाबंदी, जिम्मेदारी और पेशेवर व्यवहार',
          en: 'Lesson 2: Punctuality, Reliability & Workplace Etiquette',
        },
        content: {
          bn: 'চাকরি হোক বা নিজের দোকান — যে মানুষ কথা দিয়ে কথা রাখেন, সবাই তাকেই বারবার কাজ দেন। কোনো কারণে দেরি হলে আগে থেকেই ফোন বা মেসেজ করে জানিয়ে দিন। পরিচ্ছন্ন পোশাক, হাসিমুখে অভিবাদন এবং কাজের জায়গা গুছিয়ে রাখা প্রথম দিন থেকেই ভালো ছাপ ফেলে।',
          hi: 'नौकरी हो या खुद का व्यवसाय — जो व्यक्ति समय और वादे का पक्का होता है, लोग उसी पर भरोसा करते हैं। यदि किसी कारण देरी हो, तो पहले ही सूचित कर दें।',
          en: 'Whether employed or self-employed, people who arrive on time and keep commitments earn repeat work and promotions. If an unavoidable delay happens, inform your manager or customer early rather than staying silent.',
        },
        keyTakeaways: [
          {
            bn: 'দেরি হওয়ার সম্ভাবনা থাকলে আগে থেকেই জানিয়ে দেওয়া পেশাদারিত্ব।',
            hi: 'संभावित देरी की सूचना पहले देना पेशेवर व्यवहार की पहचान है।',
            en: 'Communicating delays early protects trust far better than excuses afterward.',
          },
        ],
      },
      {
        id: 'ss-l3',
        durationMinutes: 14,
        title: {
          bn: 'ধাপ ৩: অসন্তুষ্ট গ্রাহক বা কঠিন পরিস্থিতি শান্তভাবে সামলানো',
          hi: 'पाठ 3: नाराज़ ग्राहक या कठिन स्थिति को शांत तरीके से संभालना',
          en: 'Lesson 3: Handling Upset Customers or Workplace Conflicts Calmly',
        },
        content: {
          bn: 'কেউ রেগে কথা বললে পাল্টা তর্ক করলে সম্পর্ক নষ্ট হয়। ৩-ধাপের নিয়ম মানুন: (১) শান্ত থাকুন ও শুনুন, (২) অসুবিধার জন্য দুঃখ প্রকাশ করুন, এবং (৩) বাস্তব সমাধান দিন (যেমন ঠিক করে দেওয়া বা নির্দিষ্ট সময় বলা)।',
          hi: 'यदि कोई ग्राहक या सहकर्मी नाराज़ हो, तो बहस करने के बजाय 3-चरणीय नियम अपनाएं: (1) शांत रहकर सुनें, (2) असुविधा के लिए खेद व्यक्त करें, और (3) व्यावहारिक समाधान बताएं।',
          en: 'When someone is upset, arguing escalates the conflict. Follow the 3-step calm response: (1) Pause and listen without reacting angrily, (2) Acknowledge the inconvenience respectfully, and (3) Offer a clear next step to fix it.',
        },
        keyTakeaways: [
          {
            bn: 'তর্ক জেতার চেয়ে বিশ্বাস বজায় রাখা দীর্ঘমেয়াদে বেশি লাভজনক।',
            hi: 'बहस जीतने से ज्यादा जरूरी लंबे समय का भरोसा बनाए रखना है।',
            en: 'Preserving trust and reputation matters more than winning an argument.',
          },
        ],
      },
    ],
    assignment: {
      title: {
        bn: 'ব্যবহারিক অনুশীলন: অসন্তুষ্ট গ্রাহককে শান্ত উত্তর লেখা',
        hi: 'व्यावहारिक अभ्यास: नाराज़ ग्राहक को शांत उत्तर लिखना',
        en: 'Practical Practice: Responding Calmly to an Unhappy Customer',
      },
      prompt: {
        bn: 'ধরুন আপনার দোকানে বা অফিসে একটি কাজ ১ দিন দেরি হওয়ায় একজন গ্রাহক রেগে গেছেন। ভদ্র ও সমাধানমুখী ভাষায় ৩–৪ বাক্যে আপনি তাকে কী বলবেন তা লিখুন।',
        hi: 'मान लीजिए किसी काम में 1 दिन की देरी होने से एक ग्राहक नाराज़ है। विनम्र और समाधान-केंद्रित भाषा में 3–4 वाक्यों में आप क्या कहेंगे, लिखें।',
        en: 'Suppose a customer is upset because an order or service was delayed by one day. Write a calm, polite 3–4 sentence response offering a clear solution.',
      },
      rubricPoints: [
        { bn: 'তর্ক না করে অসুবিধা স্বীকার করেছে কি না', hi: 'बहस किए बिना असुविधा को स्वीकार किया है या नहीं', en: 'Acknowledges the inconvenience without being defensive' },
        { bn: 'নির্দিষ্ট সময় বা সমাধান উল্লেখ করেছে কি না', hi: 'स्पष्ट समय या समाधान बताया है या नहीं', en: 'Offers a concrete timeline or fix' },
      ],
    },
    quiz: [
      {
        id: 'ss-q1',
        question: {
          bn: 'যদি জরুরি কারণে কাজে ১৫ মিনিট দেরি হওয়ার সম্ভাবনা থাকে, তবে সবচেয়ে ভালো আচরণ কী?',
          hi: 'यदि किसी जरूरी कारण से काम पर 15 मिनट की देरी होने वाली है, तो सबसे सही व्यवहार क्या है?',
          en: 'If an emergency will make you 15 minutes late to work or a client meeting, what is the best action?',
        },
        options: [
          { bn: 'কিছু না বলে দেরিতে পৌঁছানো', hi: 'बिना बताए देर से पहुंचना', en: 'Arrive late without informing anyone' },
          { bn: 'আগে থেকেই সংক্ষিপ্ত ফোন/মেসেজ করে জানিয়ে দেওয়া', hi: 'पहले ही संक्षिप्त कॉल या संदेश देकर सूचित करना', en: 'Call or message beforehand with a clear updated time' },
          { bn: 'সেদিন আর কাজেই না যাওয়া', hi: 'उस दिन काम पर ही न जाना', en: 'Skip the entire day' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'আগে জানালে অন্যরা পরিকল্পনা ঠিক রাখতে পারেন এবং আপনার দায়িত্ববোধের প্রমাণ মেলে।',
          hi: 'पहले सूचित करने से सामने वाला अपनी योजना समायोजित कर पाता है और आप पर भरोसा बढ़ता है।',
          en: 'Advance notice shows professionalism and allows others to plan smoothly.',
        },
      },
      {
        id: 'ss-q2',
        question: {
          bn: 'ভালো যোগাযোগ দক্ষতার আসল পরিচয় কোনটি?',
          hi: 'अच्छे संवाद कौशल की असली पहचान क्या है?',
          en: 'What truly defines strong workplace communication?',
        },
        options: [
          { bn: 'কঠিন ইংরেজি শব্দ ব্যবহার করা', hi: 'कठिन अंग्रेजी शब्दों का उपयोग करना', en: 'Using complicated English vocabulary' },
          { bn: 'মনোযোগ দিয়ে শোনা এবং যেকোনো ভাষায় স্পষ্ট ও ভদ্রভাবে কথা বলা', hi: 'ध्यान से सुनना और किसी भी भाषा में स्पष्ट व विनम्रता से बात करना', en: 'Listening carefully and speaking clearly and respectfully in any language' },
          { bn: 'অন্যের কথা শেষ হওয়ার আগেই উত্তর দেওয়া', hi: 'दूसरे की बात पूरी होने से पहले ही टोक देना', en: 'Interrupting quickly to show confidence' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'স্পষ্টতা, শালীনতা ও মনোযোগ দিয়ে শোনাই যেকোনো ভাষায় সেরা যোগাযোগ।',
          hi: 'स्पष्टता, विनम्रता और ध्यान से सुनना किसी भी भाषा में श्रेष्ठ संवाद है।',
          en: 'Clarity, respect, and active listening matter in every language.',
        },
      },
      {
        id: 'ss-q3',
        question: {
          bn: 'অসন্তুষ্ট গ্রাহকের সাথে কথা বলার সময় প্রথম ধাপ কী হওয়া উচিত?',
          hi: 'नाराज़ ग्राहक से बात करते समय पहला कदम क्या होना चाहिए?',
          en: 'What should be your first step when speaking with an upset customer?',
        },
        options: [
          { bn: 'জোরে পাল্টা তর্ক করা', hi: 'तेज़ आवाज़ में बहस करना', en: 'Argue louder to defend yourself' },
          { bn: 'শান্ত হয়ে তাদের পুরো অভিযোগ শোনা', hi: 'शांत रहकर उनकी पूरी शिकायत सुनना', en: 'Stay calm and listen to their full concern' },
          { bn: 'অন্য কর্মীর ঘাড়ে দোষ চাপানো', hi: 'दूसरे कर्मचारी पर दोष डालना', en: 'Blame another coworker immediately' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'শান্ত হয়ে শুনলে রাগ কমে এবং সমস্যার আসল সমাধান বের করা সহজ হয়।',
          hi: 'शांत रहकर सुनने से तनाव कम होता है और सही समाधान निकलता है।',
          en: 'Listening calmly de-escalates tension and uncovers the real fix.',
        },
      },
    ],
  },

  {
    id: 'udaan-digital-pro',
    slug: 'professional-digital-training',
    category: 'Professional Digital',
    level: 'Beginner',
    estimatedMinutes: 45,
    formatNote: {
      bn: 'স্ব-গতিতে অনলাইন অনুশীলন মডিউল (বিনামূল্যে)',
      hi: 'स्व-गति ऑनलाइन अभ्यास मॉड्यूल (निःशुल्क)',
      en: 'Self-paced online practice module (Free)',
    },
    title: {
      bn: 'প্রফেশনাল ডিজিটাল প্রশিক্ষণ',
      hi: 'प्रोफेशनल डिजिटल प्रशिक्षण',
      en: 'Professional Digital Training',
    },
    tagline: {
      bn: 'স্মার্টফোন, ইমেইল, ডিজিটাল ডকুমেন্ট ও নিরাপদ অনলাইন লেনদেন দক্ষতার সাথে ব্যবহার করুন',
      hi: 'स्मार्टफोन, ईमेल, डिजिटल दस्तावेज़ और सुरक्षित ऑनलाइन लेनदेन कुशलता से उपयोग करें',
      en: 'Use smartphones, email, PDF documents, and safe UPI/digital tools professionally',
    },
    summary: {
      bn: 'পেশাদার ইমেইল ও হোয়াটসঅ্যাপ মেসেজ লেখা, মোবাইল থেকে পরিষ্কার PDF/ফোল্ডার তৈরি, এবং ডিজিটাল প্রতারণা থেকে অ্যাকাউন্ট সুরক্ষিত রাখার ব্যবহারিক শিক্ষা।',
      hi: 'पेशेवर ईमेल व व्हाट्सएप संदेश लिखना, मोबाइल से साफ PDF बनाना और डिजिटल धोखाधड़ी से खाते सुरक्षित रखने का व्यावहारिक प्रशिक्षण।',
      en: 'Learn professional email & WhatsApp writing, organizing clean digital documents/PDFs on mobile, and protecting bank/UPI accounts against cyber traps.',
    },
    targetAudience: ['student', 'unemployed', 'worker', 'entrepreneur', 'homemaker'],
    skillTags: ['digital', 'computer', 'smartphone', 'email', 'safety', 'upi'],
    relatedRoutes: [
      { path: '/scam-check', label: { bn: 'JENOVA Protect (নিরাপত্তা যাচাই)', hi: 'JENOVA Protect (सुरक्षा जांच)', en: 'Open JENOVA Protect' } },
      { path: '/checklist', label: { bn: 'JENOVA Checklist (নথি ফোল্ডার)', hi: 'JENOVA Checklist (दस्तावेज़ जांच)', en: 'Open JENOVA Checklist' } },
    ],
    lessons: [
      {
        id: 'dig-l1',
        durationMinutes: 15,
        title: {
          bn: 'ধাপ ১: পেশাদার ইমেইল ও হোয়াটসঅ্যাপ মেসেজ লেখার নিয়ম',
          hi: 'पाठ 1: पेशेवर ईमेल और व्हाट्सएप संदेश लिखने के नियम',
          en: 'Lesson 1: Professional Email & Business WhatsApp Etiquette',
        },
        content: {
          bn: 'কাজের বা ব্যবসার জন্য মেসেজ পাঠানোর সময় একটি পরিষ্কার বিষয় (Subject) লিখুন, ভদ্র অভিবাদন দিন (নমস্কার / Hello), মূল কথা ২–৩ লাইনে পরিষ্কার লিখুন এবং শেষে আপনার নাম লিখুন। রাত ১১টায় কাজের মেসেজ পাঠানো বা অজানা ফরোয়ার্ড লিঙ্ক পাঠানো এড়িয়ে চলুন।',
          hi: 'काम या व्यवसाय के लिए ईमेल/संदेश भेजते समय स्पष्ट विषय (Subject) लिखें, विनम्र अभिवादन करें, मुख्य बात 2–3 पंक्तियों में लिखें और अंत में अपना नाम लिखें। देर रात कार्य संदेश या अज्ञात फॉरवर्ड भेजने से बचें।',
          en: 'When writing for work or business, include a clear subject line, polite greeting, 2–3 concise sentences explaining the purpose, and your name at the end. Avoid sending work messages late at night or forwarding unverified chain links.',
        },
        keyTakeaways: [
          {
            bn: 'নিজের নাম দিয়ে একটি পরিষ্কার ইমেইল আইডি তৈরি রাখুন।',
            hi: 'अपने नाम के साथ एक साफ-सुथरी ईमेल आईडी बनाकर रखें।',
            en: 'Maintain one clean personal email address using your real name.',
          },
        ],
      },
      {
        id: 'dig-l2',
        durationMinutes: 15,
        title: {
          bn: 'ধাপ ২: মোবাইলে পরিষ্কার নথি স্ক্যান ও ফাইল নামকরণ',
          hi: 'पाठ 2: मोबाइल पर साफ दस्तावेज़ स्कैन और फाइल नामकरण',
          en: 'Lesson 2: Clean Mobile Document Scans & Naming Files Properly',
        },
        content: {
          bn: 'সরকারি ফর্ম বা চাকরির আবেদনে অস্পষ্ট বা বাঁকা ছবি দিলে আবেদন বাতিল হতে পারে। ভালো আলোয় কাগজের চার কোণা পরিষ্কার রেখে ছবি তুলুন, PDF হিসেবে সেভ করুন এবং অর্থপূর্ণ নাম দিন (যেমন: Ananya_Biodata_2026.pdf — IMG_99482.jpg নয়)।',
          hi: 'सरकारी फॉर्म या नौकरी के आवेदन में धुंधली फोटो से आवेदन अस्वीकार हो सकता है। अच्छी रोशनी में चारों कोने साफ रखते हुए स्कैन करें और स्पष्ट फाइल नाम रखें (जैसे: Ravi_Biodata_2026.pdf)।',
          en: 'Blurry or cropped document photos often cause portal rejections. Scan documents in good daylight with all four corners visible, export as PDF, and name files clearly (e.g., Ananya_Biodata_2026.pdf instead of IMG_4839.jpg).',
        },
        keyTakeaways: [
          {
            bn: 'নথির ছবি কখনোই পাবলিক গ্রুপে বা অজানা নম্বরে পাঠাবেন না।',
            hi: 'पहचान दस्तावेज़ कभी भी पब्लिक ग्रुप या अनजान नंबर पर न भेजें।',
            en: 'Never share identity document PDFs in public groups or with unverified contacts.',
          },
        ],
      },
      {
        id: 'dig-l3',
        durationMinutes: 15,
        title: {
          bn: 'ধাপ ৩: নিরাপদ UPI ও ডিজিটাল প্রতারণা প্রতিরোধ',
          hi: 'पाठ 3: सुरक्षित UPI और डिजिटल धोखाधड़ी से बचाव',
          en: 'Lesson 3: Safe UPI Operations & Cyber Hygiene',
        },
        content: {
          bn: 'মনে রাখুন: টাকা গ্রহণ (Receive) করার জন্য কখনোই UPI PIN দিতে হয় না বা QR কোড স্ক্যান করতে হয় না। কেবল টাকা পাঠানোর সময়ই PIN লাগে। অজানা APK ফাইল বা স্ক্রিন-শেয়ারিং অ্যাপ (AnyDesk/QuickSupport) কখনোই কারও কথায় ইনস্টল করবেন না। প্রতারণা হলে দ্রুত 1930 নম্বরে কল করুন।',
          hi: 'याद रखें: पैसे प्राप्त (Receive) करने के लिए कभी भी UPI PIN नहीं डालना होता और न ही QR कोड स्कैन करना होता है। अज्ञात APK या स्क्रीन-शेयरिंग ऐप कभी इंस्टॉल न करें। धोखाधड़ी होने पर तुरंत 1930 पर कॉल करें।',
          en: 'Remember the golden rule: You NEVER enter a UPI PIN or scan a QR code to RECEIVE money — PIN is strictly for sending money. Never install unknown APK files or remote screen-sharing apps on a caller’s instructions. Report cyber fraud immediately on helpline 1930.',
        },
        keyTakeaways: [
          {
            bn: 'টাকা নিতে কখনোই UPI PIN বা OTP লাগে না।',
            hi: 'पैसे लेने के लिए कभी UPI PIN या OTP नहीं लगता।',
            en: 'Receiving money never requires entering a UPI PIN or sharing an OTP.',
          },
        ],
      },
    ],
    assignment: {
      title: {
        bn: 'ব্যবহারিক অনুশীলন: কাজের আবেদনের একটি সংক্ষিপ্ত ইমেইল লিখুন',
        hi: 'व्यावहारिक अभ्यास: नौकरी के आवेदन के लिए संक्षिप्त ईमेल लिखें',
        en: 'Practical Practice: Draft a Short Job or Service Inquiry Email',
      },
      prompt: {
        bn: 'কোনো স্থানীয় অফিস বা প্রতিষ্ঠানে চাকরির খোঁজ বা বায়োডাটা পাঠানোর জন্য Subject লাইনসহ ৪–৫ লাইনের একটি ভদ্র ইমেইল লিখুন।',
        hi: 'किसी स्थानीय कार्यालय या संस्थान को बायोडाटा भेजने के लिए Subject लाइन सहित 4–5 पंक्तियों का विनम्र ईमेल लिखें।',
        en: 'Write a polite 4–5 line email (including a clear Subject line) to send your biodata or inquire about an opening at a local office or enterprise.',
      },
      rubricPoints: [
        { bn: 'স্পষ্ট Subject লাইন ও ভদ্র অভিবাদন আছে কি না', hi: 'स्पष्ट Subject और विनम्र अभिवादन शामिल है या नहीं', en: 'Has a clear Subject line and polite greeting' },
        { bn: 'সংক্ষিপ্ত ও কাজের প্রাসঙ্গিক তথ্য আছে কি না', hi: 'संक्षिप्त और प्रासंगिक जानकारी है या नहीं', en: 'States purpose concisely without unnecessary clutter' },
      ],
    },
    quiz: [
      {
        id: 'dig-q1',
        question: {
          bn: 'ক্রেতার কাছ থেকে UPI-তে টাকা গ্রহণ (Receive) করার জন্য কি আপনার UPI PIN দিতে হয়?',
          hi: 'क्या ग्राहक से UPI द्वारा पैसे प्राप्त (Receive) करने के लिए आपका UPI PIN डालना जरूरी है?',
          en: 'Do you ever need to enter your UPI PIN to RECEIVE money from a buyer?',
        },
        options: [
          { bn: 'হ্যাঁ, সব সময় দিতে হয়', hi: 'हां, हमेशा डालना होता है', en: 'Yes, always required' },
          { bn: 'না, কখনোই না — PIN কেবল টাকা পাঠানোর সময় লাগে', hi: 'नहीं, कभी नहीं — PIN केवल पैसे भेजने के लिए होता है', en: 'No, never — UPI PIN is only for sending money' },
          { bn: 'শুধুমাত্র ₹৫,০০০-এর বেশি হলে', hi: 'केवल ₹5,000 से अधिक होने पर', en: 'Only for amounts above ₹5,000' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'টাকা পাঠানোর “Collect Request”-এ PIN দিলে আপনার অ্যাকাউন্ট থেকেই টাকা কেটে যাবে।',
          hi: 'किसी "Collect Request" पर PIN डालने से आपके खाते से पैसे कट जाएंगे।',
          en: 'Entering your PIN on a collect request deducts money from your own account.',
        },
      },
      {
        id: 'dig-q2',
        question: {
          bn: 'অনলাইন চাকরির আবেদনের জন্য নিচের কোন ফাইলের নামটি সবচেয়ে পেশাদার?',
          hi: 'ऑनलाइन नौकरी आवेदन के लिए इनमें से कौन सा फाइल नाम सबसे पेशेवर है?',
          en: 'Which file name is most professional when uploading your biodata?',
        },
        options: [
          { bn: 'IMG_20261119_WA0012.jpg', hi: 'IMG_20261119_WA0012.jpg', en: 'IMG_20261119_WA0012.jpg' },
          { bn: 'new_doc_final_final2.pdf', hi: 'new_doc_final_final2.pdf', en: 'new_doc_final_final2.pdf' },
          { bn: 'Suman_Das_Biodata_2026.pdf', hi: 'Suman_Das_Biodata_2026.pdf', en: 'Suman_Das_Biodata_2026.pdf' },
        ],
        correctIndex: 2,
        explanation: {
          bn: 'নাম ও নথির ধরন পরিষ্কার থাকলে নিয়োগকর্তা সহজে আপনার ফাইল খুঁজে পান।',
          hi: 'नाम और दस्तावेज़ का प्रकार स्पष्ट होने से नियोक्ता आपकी फाइल आसानी से पहचान सकते हैं।',
          en: 'Clear names make your application easy for employers to identify and open.',
        },
      },
      {
        id: 'dig-q3',
        question: {
          bn: 'কোনো সরকারি প্রকল্পের অফিসিয়াল ওয়েবসাইট চেনার সবচেয়ে নিরাপদ উপায় কী?',
          hi: 'किसी सरकारी योजना की आधिकारिक वेबसाइट पहचानने का सबसे सुरक्षित तरीका क्या है?',
          en: 'What is the safest way to verify an official Indian government scheme portal?',
        },
        options: [
          { bn: 'WhatsApp ফরোয়ার্ডে আসা যেকোনো শর্ট লিঙ্কে ক্লিক করা', hi: 'WhatsApp फॉरवर्ड में आए किसी भी शॉर्ट लिंक पर क्लिक करना', en: 'Clicking any shortened WhatsApp forward link' },
          { bn: 'সঠিক .gov.in বা .nic.in ডোমেইন যাচাই করা', hi: 'आधिकारिक .gov.in या .nic.in डोमेन की जांच करना', en: 'Verifying the authentic .gov.in or .nic.in domain' },
          { bn: 'অজানা অ্যাপ ডাউনলোড করা', hi: 'अज्ञात ऐप डाउनलोड करना', en: 'Downloading an APK file sent over chat' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'সরকারি পোর্টাল সাধারণত .gov.in বা .nic.in ডোমেইনে থাকে — বানান ভালো করে মিলিয়ে নিন।',
          hi: 'सरकारी पोर्टल .gov.in या .nic.in डोमेन पर होते हैं — स्पेलिंग ध्यान से जांचें।',
          en: 'Official government websites end in .gov.in or .nic.in — always check exact spelling.',
        },
      },
    ],
  },

  {
    id: 'udaan-msme-entrepreneur',
    slug: 'msme-entrepreneurship',
    category: 'MSME & Entrepreneurship',
    level: 'Intermediate',
    estimatedMinutes: 50,
    formatNote: {
      bn: 'স্ব-গতিতে অনলাইন অনুশীলন মডিউল (বিনামূল্যে)',
      hi: 'स्व-गति ऑनलाइन अभ्यास मॉड्यूल (निःशुल्क)',
      en: 'Self-paced online practice module (Free)',
    },
    title: {
      bn: 'MSME ও উদ্যোক্তা উন্নয়ন প্রশিক্ষণ',
      hi: 'MSME और उद्यमिता विकास प्रशिक्षण',
      en: 'MSME & Entrepreneurship Training',
    },
    tagline: {
      bn: 'দালাল ছাড়া ফ্রি উদ্যম নিবন্ধন, সরকারি ঋণ সহায়তা ও ক্ষুদ্র ব্যবসা গঠনের সঠিক পথ জানুন',
      hi: 'बिचौलियों के बिना निःशुल्क उद्यम पंजीकरण, सरकारी सहायता और लघु व्यवसाय निर्माण सीखें',
      en: 'Understand free Udyam registration, genuine MSME schemes, and building a resilient micro-enterprise',
    },
    summary: {
      bn: 'udyamregistration.gov.in-এ বিনামূল্যে নিবন্ধন, PMEGP / PM SVANidhi / MUDRA প্রকল্পের মৌলিক ধারণা, এবং স্থানীয় বাজার থেকে নিয়মিত গ্রাহক তৈরির উপায় শিখুন।',
      hi: 'udyamregistration.gov.in पर निःशुल्क पंजीकरण, PMEGP / PM SVANidhi / MUDRA योजनाओं की समझ और स्थानीय ग्राहक बनाने के तरीके सीखें।',
      en: 'Learn how free Udyam registration works, how to research official entrepreneurship schemes (PMEGP, PM SVANidhi, MUDRA) without agents, and how to grow local customers.',
    },
    targetAudience: ['entrepreneur', 'small_business', 'homemaker', 'worker'],
    skillTags: ['msme', 'udyam', 'entrepreneurship', 'business', 'schemes', 'tailoring'],
    relatedRoutes: [
      { path: '/msme', label: { bn: 'MSME সহায়তা কেন্দ্র', hi: 'MSME सहायता केंद्र', en: 'Open MSME Support Hub' } },
      { path: '/schemes', label: { bn: 'উদ্যোক্তা সরকারি প্রকল্প', hi: 'उद्यमिता सरकारी योजनाएं', en: 'Explore Government Schemes' } },
    ],
    lessons: [
      {
        id: 'msme-l1',
        durationMinutes: 16,
        title: {
          bn: 'ধাপ ১: ফ্রি উদ্যম (Udyam) নিবন্ধন ও কেন এটি গুরুত্বপূর্ণ',
          hi: 'पाठ 1: निःशुल्क उद्यम (Udyam) पंजीकरण और इसका महत्व',
          en: 'Lesson 1: Free Udyam Registration & Avoiding Paid Middlemen',
        },
        content: {
          bn: 'ভারত সরকারের MSME মন্ত্রকের একমাত্র অফিসিয়াল উদ্যম পোর্টাল হলো udyamregistration.gov.in — এখানে নিবন্ধন সম্পূর্ণ বিনামূল্যে (₹০)। অনেক ভুয়া ওয়েবসাইট ₹১,৫০০–₹৩,০০০ দাবি করে; সেগুলো এড়িয়ে চলুন। উদ্যম সার্টিফিকেট থাকলে ব্যাংকের ব্যবসা অ্যাকাউন্ট ও সরকারি MSME প্রকল্পে আবেদন সহজ হয়।',
          hi: 'भारत सरकार के MSME मंत्रालय का एकमात्र आधिकारिक पोर्टल udyamregistration.gov.in है — यहां पंजीकरण पूरी तरह निःशुल्क (₹0) है। कई नकली वेबसाइट ₹1,500–₹3,000 मांगती हैं; उनसे बचें।',
          en: 'The ONLY official Government of India portal for MSME registration is udyamregistration.gov.in, and registration is 100% free (₹0). Avoid third-party sites charging ₹1,500–₹3,000. Udyam helps micro-businesses open business accounts and explore official MSME support.',
        },
        keyTakeaways: [
          {
            bn: 'উদ্যম নিবন্ধনের সরকারি ফি ₹০ — কখনোই এজেন্টকে টাকা দেবেন না।',
            hi: 'उद्यम पंजीकरण शुल्क ₹0 है — किसी एजेंट या नकली साइट को पैसे न दें।',
            en: 'Official Udyam registration costs ₹0 on udyamregistration.gov.in.',
          },
        ],
      },
      {
        id: 'msme-l2',
        durationMinutes: 18,
        title: {
          bn: 'ধাপ ২: সরকারি ব্যবসা সহায়তা প্রকল্প (PMEGP, PM SVANidhi, MUDRA)',
          hi: 'पाठ 2: सरकारी व्यवसाय सहायता योजनाएं (PMEGP, PM SVANidhi, MUDRA)',
          en: 'Lesson 2: Navigating Official Entrepreneurship Support Schemes',
        },
        content: {
          bn: 'রাস্তার হকারদের জন্য PM SVANidhi, নতুন উৎপাদন/পরিষেবা ইউনিটের জন্য PMEGP, এবং ক্ষুদ্র ব্যবসার জন্য MUDRA (Shishu/Kishore/Tarun) প্রকল্প রয়েছে। মনে রাখুন: কোনো প্রকল্পই ঋণ অনুমোদনের ১০০% গ্যারান্টি দেয় না — ব্যাংক ও সরকারি বিভাগ আপনার পরিকল্পনা, KYC ও পরিশোধ ক্ষমতা যাচাই করে সিদ্ধান্ত নেয়।',
          hi: 'स्ट्रीट वेंडर्स के लिए PM SVANidhi, नई इकाइयों के लिए PMEGP और लघु व्यवसायों के लिए MUDRA योजनाएं हैं। ध्यान रखें: कोई भी योजना 100% ऋण स्वीकृति की गारंटी नहीं देती — बैंक और विभाग आपके प्लान व KYC के आधार पर निर्णय लेते हैं।',
          en: 'Explore PM SVANidhi (street vendors), PMEGP (new micro-enterprises), and PMMY/MUDRA via official .gov.in portals or nationalized banks. Important: No platform or agent can guarantee loan approval — banks evaluate your plan, KYC, and repayment capacity.',
        },
        keyTakeaways: [
          {
            bn: 'ঋণ নেওয়ার আগে মাসিক কিস্তি (EMI) শোধ করার ক্ষমতা ক্যালকুলেটরে যাচাই করুন।',
            hi: 'ऋण लेने से पहले मासिक EMI चुकाने की क्षमता कैलकुलेटर में जांचें।',
            en: 'Always check monthly EMI affordability before applying for any business loan.',
          },
        ],
      },
      {
        id: 'msme-l3',
        durationMinutes: 16,
        title: {
          bn: 'ধাপ ৩: স্থানীয় বিপণন ও বারবার আসা গ্রাহক তৈরি',
          hi: 'पाठ 3: स्थानीय विपणन और स्थायी ग्राहक बनाना',
          en: 'Lesson 3: Low-Cost Local Marketing & Repeat Customers',
        },
        content: {
          bn: 'শুরুতে দামি বিজ্ঞাপনের দরকার নেই। পরিষ্কার মান, ন্যায্য দাম, Google Maps-এ দোকানের সঠিক তথ্য, WhatsApp Business ক্যাটালগ এবং সন্তুষ্ট গ্রাহকদের সুপারিশ (Word of Mouth) ক্ষুদ্র ব্যবসার সবচেয়ে শক্তিশালী প্রচার।',
          hi: 'शुरुआत में महंगे विज्ञापन की जरूरत नहीं है। अच्छी गुणवत्ता, सही कीमत, Google Maps लिस्टिंग, WhatsApp Business कैटलॉग और संतुष्ट ग्राहकों की सिफारिश सबसे असरदार प्रचार है।',
          en: 'Micro-businesses rarely need expensive ads at the start. Consistent quality, fair pricing, a verified Google Maps pin, a simple WhatsApp Business catalogue, and word-of-mouth referrals from happy neighbours drive the most reliable growth.',
        },
        keyTakeaways: [
          {
            bn: 'নতুন গ্রাহক খোঁজার পাশাপাশি পুরনো গ্রাহকের সাথে ভালো সম্পর্ক রাখুন।',
            hi: 'नए ग्राहकों के साथ-साथ पुराने ग्राहकों से बेहतर संबंध बनाए रखें।',
            en: 'Retaining repeat local customers costs far less than finding new ones every week.',
          },
        ],
      },
    ],
    assignment: {
      title: {
        bn: 'ব্যবহারিক অনুশীলন: প্রথম ৩০ দিনের স্থানীয় মার্কেটিং পরিকল্পনা',
        hi: 'व्यावहारिक अभ्यास: पहले 30 दिनों की स्थानीय मार्केटिंग योजना',
        en: 'Practical Practice: Your First 30-Day Low-Cost Marketing Plan',
      },
      prompt: {
        bn: 'কোনো বড় বিজ্ঞাপন খরচ ছাড়াই আপনার জেলায় প্রথম ২০ জন গ্রাহকের কাছে পৌঁছানোর ৩টি বাস্তব উপায় লিখুন।',
        hi: 'बिना किसी बड़े विज्ञापन खर्च के अपने क्षेत्र के पहले 20 ग्राहकों तक पहुंचने के 3 व्यावहारिक तरीके लिखें।',
        en: 'List 3 practical, low-cost ways you will reach your first 20 customers in your town or district without spending heavily on ads.',
      },
      rubricPoints: [
        { bn: 'বাস্তবসম্মত ও কম খরচের স্থানীয় উপায় আছে কি না', hi: 'व्यावहारिक और कम लागत वाले स्थानीय उपाय हैं या नहीं', en: 'Uses realistic, low-cost local outreach channels' },
        { bn: 'মান ও গ্রাহক বিশ্বাসের কথা উল্লেখ আছে কি না', hi: 'गुणवत्ता और ग्राहक विश्वास पर ध्यान है या नहीं', en: 'Focuses on service quality and trust-building' },
      ],
    },
    quiz: [
      {
        id: 'msme-q1',
        question: {
          bn: 'ভারত সরকারের অফিসিয়াল পোর্টাল udyamregistration.gov.in-এ উদ্যম নিবন্ধনের ফি কত?',
          hi: 'भारत सरकार के आधिकारिक पोर्टल udyamregistration.gov.in पर उद्यम पंजीकरण का शुल्क कितना है?',
          en: 'What is the official fee for Udyam registration on udyamregistration.gov.in?',
        },
        options: [
          { bn: '₹২,৫০০', hi: '₹2,500', en: '₹2,500' },
          { bn: '₹০ (সম্পূর্ণ বিনামূল্যে)', hi: '₹0 (पूर्णतः निःशुल्क)', en: '₹0 (Completely Free)' },
          { bn: '₹৯৯৯ প্রতি বছর', hi: '₹999 प्रति वर्ष', en: '₹999 per year' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'উদ্যম নিবন্ধন সম্পূর্ণ বিনামূল্যে এবং অনলাইনে নিজে থেকেই করা যায়।',
          hi: 'उद्यम पंजीकरण पूरी तरह निःशुल्क है और सीधे आधिकारिक पोर्टल पर किया जा सकता है।',
          en: 'Udyam registration is completely free on the official government portal.',
        },
      },
      {
        id: 'msme-q2',
        question: {
          bn: 'যদি কোনো এজেন্ট “১০০% নিশ্চিত সরকারি ঋণ পাস” করার জন্য অগ্রিম ₹৩,০০০ চায়, তাহলে কী করবেন?',
          hi: 'यदि कोई एजेंट "100% पक्का सरकारी ऋण पास" कराने के लिए ₹3,000 अग्रिम मांगे, तो क्या करें?',
          en: 'If an agent asks for ₹3,000 upfront promising "100% guaranteed government loan approval", what should you do?',
        },
        options: [
          { bn: 'টাকা দেবেন না — সরাসরি ব্যাংক শাখা বা অফিসিয়াল .gov.in পোর্টালে যোগাযোগ করুন', hi: 'पैसे न दें — सीधे बैंक शाखा या आधिकारिक .gov.in पोर्टल से संपर्क करें', en: 'Refuse payment — apply directly through official .gov.in portals or bank branches' },
          { bn: 'অগ্রিম টাকা দিয়ে দিন', hi: 'अग्रिम पैसे दे दें', en: 'Pay the advance quickly' },
          { bn: 'ব্যাংক OTP শেয়ার করুন', hi: 'बैंक OTP साझा करें', en: 'Share your bank OTP with the agent' },
        ],
        correctIndex: 0,
        explanation: {
          bn: 'কোনো ব্যক্তি বা এজেন্ট ঋণ অনুমোদনের গ্যারান্টি দিতে পারে না।',
          hi: 'कोई भी व्यक्ति या एजेंट ऋण स्वीकृति की गारंटी नहीं दे सकता।',
          en: 'No third party can guarantee loan approval; always deal directly with official portals and banks.',
        },
      },
      {
        id: 'msme-q3',
        question: {
          bn: 'ক্ষুদ্র ব্যবসার জন্য ঋণ নেওয়ার আগে কোনটি যাচাই করা সবচেয়ে জরুরি?',
          hi: 'लघु व्यवसाय के लिए ऋण लेने से पहले क्या जांचना सबसे जरूरी है?',
          en: 'Before taking any business loan, what must you verify first?',
        },
        options: [
          { bn: 'মাসিক EMI আপনার ব্যবসার বাস্তব আয়ের মধ্যে পরিশোধযোগ্য কি না', hi: 'क्या मासिक EMI आपके व्यवसाय की वास्तविक आय से चुकाई जा सकती है', en: 'Whether the monthly EMI is comfortably affordable from conservative monthly sales' },
          { bn: 'সর্বাধিক কত টাকা ঋণ পাওয়া যাচ্ছে', hi: 'अधिकतम कितना ऋण मिल सकता है', en: 'Taking the maximum possible loan regardless of need' },
          { bn: 'অন্য দোকানি কত ঋণ নিয়েছে', hi: 'पड़ोसी दुकानदार ने कितना ऋण लिया है', en: 'Copying whatever loan amount a neighbour took' },
        ],
        correctIndex: 0,
        explanation: {
          bn: 'অতিরিক্ত ঋণ ছোট ব্যবসাকে ঝুঁকিতে ফেলে — সর্বদা EMI ক্যালকুলেটর দিয়ে হিসাব করুন।',
          hi: 'अत्यधिक ऋण छोटे व्यवसाय को जोखिम में डालता है — हमेशा EMI कैलकुलेटर से आकलन करें।',
          en: 'Over-borrowing puts small businesses at risk; test repayment with an EMI calculator first.',
        },
      },
    ],
  },

  {
    id: 'udaan-practical-exec',
    slug: 'practical-executive-training',
    category: 'Practical Executive',
    level: 'Intermediate',
    estimatedMinutes: 45,
    formatNote: {
      bn: 'স্ব-গতিতে অনলাইন অনুশীলন মডিউল (বিনামূল্যে)',
      hi: 'स्व-गति ऑनलाइन अभ्यास मॉड्यूल (निःशुल्क)',
      en: 'Self-paced online practice module (Free)',
    },
    title: {
      bn: 'প্র্যাকটিক্যাল এক্সিকিউটিভ প্রশিক্ষণ',
      hi: 'प्रैक्टिकल एग्जीक्यूटिव प्रशिक्षण',
      en: 'Practical Executive Training',
    },
    tagline: {
      bn: 'দৈনন্দিন কাজ পরিচালনা, খাতা-হিসাব, সময় ব্যবস্থাপনা ও কাজের মান বজায় রাখার ব্যবহারিক দক্ষতা',
      hi: 'दैनिक कार्य संचालन, बही-खाता, समय प्रबंधन और सेवा गुणवत्ता बनाए रखने के व्यावहारिक कौशल',
      en: 'Daily execution habits: record-keeping, vendor coordination, quality checklists, and steady growth',
    },
    summary: {
      bn: 'প্রতিদিনের কাজের রুটিন, সহজ আয়-ব্যয়ের খাতা, সরবরাহকারীর সাথে দরদাম, কাজের মান যাচাই এবং লক্ষ্য পূরণের সাপ্তাহিক পর্যালোচনা শিখুন।',
      hi: 'दैनिक कार्य रूटीन, सरल आय-व्यय खाता, सप्लायर से बातचीत, गुणवत्ता जांच और साप्ताहिक समीक्षा सीखें।',
      en: 'Learn practical daily operations: maintaining simple daily cashbooks, managing suppliers, using quality checklists, and reviewing weekly goals.',
    },
    targetAudience: ['worker', 'entrepreneur', 'small_business', 'job_seeker'],
    skillTags: ['operations', 'management', 'bookkeeping', 'business', 'productivity'],
    relatedRoutes: [
      { path: '/passport', label: { bn: 'JENOVA অ্যাকশন পাসপোর্ট', hi: 'JENOVA एक्शन पासपोर्ट', en: 'Open Action Passport' } },
      { path: '/finance/budget', label: { bn: 'বাজেট ও ক্যাশফ্লো টুল', hi: 'बजट और कैशफ्लो टूल', en: 'Budget & Cashflow Tool' } },
    ],
    lessons: [
      {
        id: 'pe-l1',
        durationMinutes: 15,
        title: {
          bn: 'ধাপ ১: প্রতিদিন ১০ মিনিটের ক্যাশবুক ও স্টক হিসাব',
          hi: 'पाठ 1: प्रतिदिन 10 मिनट का कैशबुक और स्टॉक रिकॉर्ड',
          en: 'Lesson 1: The 10-Minute Daily Cashbook & Stock Habit',
        },
        content: {
          bn: 'প্রতিদিন কাজ শেষে মাত্র ১০ মিনিট সময় নিয়ে ৩টি সংখ্যা লিখুন: (১) আজ মোট কত টাকা এল, (২) আজ কী কী খরচ হলো, এবং (৩) কোন জিনিস শেষ হয়ে আসছে। সপ্তাহ শেষে এই খাতা আপনাকে দেখাবে কোথায় অপ্রয়োজনীয় খরচ হচ্ছে এবং কোন কাজ থেকে সবচেয়ে বেশি লাভ আসছে।',
          hi: 'रोज़ काम खत्म होने पर सिर्फ 10 मिनट में 3 बातें लिखें: (1) आज कुल कितनी आय हुई, (2) आज कौन-से खर्च हुए, और (3) कौन-सा सामान खत्म होने वाला है। सप्ताह के अंत में यह रिकॉर्ड सही निर्णय लेने में मदद करता है।',
          en: 'Spend 10 minutes at the end of every workday writing down three numbers: (1) Total money received today, (2) Every expense paid today, and (3) Supplies running low. Reviewing this weekly immediately reveals leaks and your best-performing work.',
        },
        keyTakeaways: [
          {
            bn: 'ছোট-বড় সব খরচ প্রতিদিন রাতেই লিখে রাখুন, পরের সপ্তাহের জন্য ফেলে রাখবেন না।',
            hi: 'हर छोटे-बड़े खर्च को उसी दिन लिख लें, बाद के लिए न टालें।',
            en: 'Log expenses the same day while amounts and bills are fresh.',
          },
        ],
      },
      {
        id: 'pe-l2',
        durationMinutes: 15,
        title: {
          bn: 'ধাপ ২: কাজের মান যাচাই চেকলিস্ট ও সময়মতো ডেলিভারি',
          hi: 'पाठ 2: गुणवत्ता चेकलिस्ट और समय पर डिलीवरी',
          en: 'Lesson 2: Quality Checklists & On-Time Delivery Discipline',
        },
        content: {
          bn: 'দর্জি কাজ, খাবার ডেলিভারি, মেরামতি বা অফিস রিপোর্ট — প্রতিটি কাজ গ্রাহক বা ম্যানেজারকে দেওয়ার আগে ৫-দফা ছোট চেকলিস্ট মিলিয়ে নিন (সঠিক মাপ/তথ্য, পরিচ্ছন্নতা, সময়সীমা, বিল/রসিদ, পরবর্তী যোগাযোগ)। এতে ভুল কমে ও সুনাম বাড়ে।',
          hi: 'सिलाई, टिफिन सेवा, मरम्मत या ऑफिस रिपोर्ट — हर काम सौंपने से पहले एक छोटी 5-बिंदु गुणवत्ता जांच करें। इससे गलतियां कम होती हैं और विश्वसनीयता बढ़ती है।',
          en: 'Whether delivering tailored garments, food orders, repairs, or office reports, run a quick 5-point quality check before handover (accuracy, cleanliness, deadline, receipt/bill, follow-up). Consistent execution builds strong local reputation.',
        },
        keyTakeaways: [
          {
            bn: 'প্রতিবার একই মান বজায় রাখলে গ্রাহক নিজেই অন্যদের কাছে আপনার নাম বলবেন।',
            hi: 'हर बार समान गुणवत्ता देने से ग्राहक स्वयं दूसरों को आपका नाम सुझाते हैं।',
            en: 'Consistent quality turns first-time buyers into long-term referrers.',
          },
        ],
      },
      {
        id: 'pe-l3',
        durationMinutes: 15,
        title: {
          bn: 'ধাপ ৩: সাপ্তাহিক লক্ষ্য পর্যালোচনা ও ধারাবাহিক উন্নতি',
          hi: 'पाठ 3: साप्ताहिक लक्ष्य समीक्षा और निरंतर सुधार',
          en: 'Lesson 3: Weekly Progress Review & Continuous Improvement',
        },
        content: {
          bn: 'প্রতি রবিবার ১৫ মিনিট বসে নিজেকে ৩টি প্রশ্ন করুন: (১) এই সপ্তাহে কোন কাজটি সবচেয়ে ভালো হয়েছে? (২) কোন জায়গায় সময় বা টাকা নষ্ট হয়েছে? (৩) আগামী সপ্তাহে কোন ১টি নির্দিষ্ট পদক্ষেপ নেব? এই লক্ষ্যটি আপনার JENOVA অ্যাকশন পাসপোর্টে লিখে ট্র্যাক করুন।',
          hi: 'हर रविवार 15 मिनट बैठकर खुद से 3 सवाल पूछें: (1) इस सप्ताह क्या सबसे अच्छा रहा? (2) समय या पैसा कहां बर्बाद हुआ? (3) अगले सप्ताह कौन-सा 1 ठोस कदम उठाना है? इसे अपने JENOVA एक्शन पासपोर्ट में दर्ज करें।',
          en: 'Spend 15 minutes every Sunday asking three questions: (1) What worked well this week? (2) Where did time or money leak? (3) What is ONE concrete action I will complete next week? Track that action inside your JENOVA Action Passport.',
        },
        keyTakeaways: [
          {
            bn: 'ছোট কিন্তু নিয়মিত সাপ্তাহিক উন্নতি বড় পরিবর্তন আনে।',
            hi: 'छोटे लेकिन नियमित साप्ताहिक सुधार बड़े परिणाम लाते हैं।',
            en: 'Small, steady weekly improvements compound into major career and income growth.',
          },
        ],
      },
    ],
    assignment: {
      title: {
        bn: 'ব্যবহারিক অনুশীলন: আপনার সাপ্তাহিক কর্মপরিকল্পনা তৈরি করুন',
        hi: 'व्यावहारिक अभ्यास: अपनी साप्ताहिक कार्य योजना बनाएं',
        en: 'Practical Practice: Draft Your Next 7-Day Action Plan',
      },
      prompt: {
        bn: 'আগামী ৭ দিনে আপনার কাজ, শেখা বা ছোট ব্যবসা এগিয়ে নেওয়ার জন্য ৩টি নির্দিষ্ট ও বাস্তব কাজ লিখুন (যেমন: বায়োডাটা আপডেট, ৫ জন সম্ভাব্য গ্রাহকের সাথে কথা, বা দৈনিক হিসাবের খাতা শুরু)।',
        hi: 'अगले 7 दिनों में अपने काम, कौशल या छोटे व्यवसाय को आगे बढ़ाने के लिए 3 ठोस और व्यावहारिक कार्य लिखें।',
        en: 'Write 3 specific, realistic actions you will complete in the next 7 days to advance your job readiness, skill growth, or small business.',
      },
      rubricPoints: [
        { bn: 'কাজগুলো নির্দিষ্ট ও ৭ দিনের মধ্যে করা সম্ভব কি না', hi: 'कार्य स्पष्ट और 7 दिनों में पूर्ण करने योग्य हैं या नहीं', en: 'Actions are specific and achievable within 7 days' },
        { bn: 'বাস্তব ফলাফল বা অভ্যাস তৈরির সাথে যুক্ত কি না', hi: 'वास्तविक परिणाम या आदत निर्माण से जुड़े हैं या नहीं', en: 'Tied to tangible progress or daily habits' },
      ],
    },
    quiz: [
      {
        id: 'pe-q1',
        question: {
          bn: 'দৈনিক আয়-ব্যয়ের হিসাব কখন লেখা সবচেয়ে কার্যকর?',
          hi: 'दैनिक आय-व्यय का हिसाब कब लिखना सबसे प्रभावी होता है?',
          en: 'When is the best time to update your daily income and expense log?',
        },
        options: [
          { bn: 'মাসের শেষে স্মৃতি থেকে', hi: 'महीने के अंत में याददाश्त से', en: 'At the end of the month from memory' },
          { bn: 'প্রতিদিন কাজ শেষে ১০ মিনিট সময় নিয়ে', hi: 'प्रतिदिन काम के अंत में 10 मिनट निकालकर', en: 'For 10 minutes at the end of every workday' },
          { bn: 'কেবল বড় খরচ হলে', hi: 'केवल बड़े खर्च होने पर', en: 'Only for large purchases' },
        ],
        correctIndex: 1,
        explanation: {
          bn: 'প্রতিদিন লিখলে ছোট খরচ বাদ পড়ে না এবং হিসাব নির্ভুল থাকে।',
          hi: 'रोज़ लिखने से छोटे खर्च छूटते नहीं हैं और हिसाब सटीक रहता है।',
          en: 'Daily logging prevents forgotten small costs and keeps records accurate.',
        },
      },
      {
        id: 'pe-q2',
        question: {
          bn: 'কাজ ডেলিভারি দেওয়ার আগে ৫-দফা চেকলিস্ট ব্যবহারের প্রধান সুবিধা কী?',
          hi: 'काम सौंपने से पहले 5-बिंदु गुणवत्ता चेकलिस्ट का मुख्य लाभ क्या है?',
          en: 'What is the main benefit of using a 5-point quality checklist before handover?',
        },
        options: [
          { bn: 'ভুল কমে এবং গ্রাহক বা নিয়োগকর্তার আস্থা বাড়ে', hi: 'गलतियां कम होती हैं और ग्राहक/नियोक्ता का विश्वास बढ़ता है', en: 'Reduces preventable mistakes and builds reliability' },
          { bn: 'কাজের সময় অকারণে দ্বিগুণ হয়', hi: 'काम का समय बेवजह दोगुना हो जाता है', en: 'Doubles delivery time needlessly' },
          { bn: 'দাম বাড়ানোর অজুহাত তৈরি হয়', hi: 'कीमत बढ़ाने का बहाना मिलता है', en: 'Allows charging hidden extra fees' },
        ],
        correctIndex: 0,
        explanation: {
          bn: 'সঠিক মান বজায় রাখাই পুনরায় কাজ পাওয়ার সবচেয়ে বড় চাবিকাঠি।',
          hi: 'गुणवत्ता बनाए रखना दोबारा काम मिलने की सबसे बड़ी कुंजी है।',
          en: 'Consistent quality is the most reliable driver of repeat work.',
        },
      },
      {
        id: 'pe-q3',
        question: {
          bn: 'সাপ্তাহিক পর্যালোচনার মূল উদ্দেশ্য কী?',
          hi: 'साप्ताहिक समीक्षा का मुख्य उद्देश्य क्या है?',
          en: 'What is the core purpose of a 15-minute weekly review?',
        },
        options: [
          { bn: 'কী ভালো হয়েছে তা বোঝা, ভুল শুধরে নেওয়া ও পরের সপ্তাহের ১টি স্পষ্ট লক্ষ্য ঠিক করা', hi: 'क्या अच्छा रहा यह समझना, कमियां सुधारना और अगले सप्ताह का 1 स्पष्ट लक्ष्य तय करना', en: 'Seeing what worked, fixing leaks, and picking concrete next-week actions' },
          { bn: 'শুধু পুরনো ভুল নিয়ে দুশ্চিন্তা করা', hi: 'केवल पुरानी गलतियों पर चिंता करना', en: 'Worrying about past mistakes without taking action' },
          { bn: 'অন্যদের সাথে তুলনা করা', hi: 'दूसरों से तुलना करना', en: 'Comparing yourself to others online' },
        ],
        correctIndex: 0,
        explanation: {
          bn: 'সাপ্তাহিক পর্যালোচনা আপনাকে তথ্যকে বাস্তব পদক্ষেপে রূপান্তর করতে সাহায্য করে।',
          hi: 'साप्ताहिक समीक्षा जानकारी को वास्तविक प्रगति में बदलने में मदद करती है।',
          en: 'Weekly reflection turns information into steady, measurable action.',
        },
      },
    ],
  },
];
