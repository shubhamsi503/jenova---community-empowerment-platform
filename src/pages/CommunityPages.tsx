import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Calendar,
  CheckCircle2,
  FileText,
  Megaphone,
  Shield,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  localizeAnnouncementCategory,
  localizeBookmarkType,
  pickText,
  tr,
} from '../i18n/translations';
import { apiFetch, trackAnalyticsEvent } from '../lib/api';
import type {
  Announcement,
  BusinessProfile,
  CourseListing,
  JobListing,
  Language,
  SavingsGoal,
  WelfareScheme,
} from '../types/platform';
import { PageHeader, ResilientImage, SafetyNotice } from '../components/SharedUI';
import { JenovaLogo } from '../components/JenovaLogo';
import { VISUAL_ASSETS } from '../lib/visualAssets';
import { PersonalisedForYouSection } from '../components/PersonalisedForYouSection';
import { UDAAN_PROGRAMMES } from '../data/udaanCatalog';

export function AboutPage() {
  const { language, theme, showToast } = useApp();
  const [workshopLogged, setWorkshopLogged] = useState(false);

  const registerWorkshopInterest = () => {
    if (workshopLogged) return;
    trackAnalyticsEvent('workshop_interest');
    setWorkshopLogged(true);
    showToast(
      tr(
        language,
        'আপনার আগ্রহ নথিভুক্ত হয়েছে! আপডেট পেতে অনুগ্রহ করে যোগাযোগ পেজে আপনার পছন্দের বিষয় জানান।',
        'आपकी रुचि दर्ज कर ली गई है! अपडेट के लिए कृपया संपर्क पेज पर अपना पसंदीदा विषय साझा करें।',
        'Interest noted! Please share your preferred topic via the Contact page if you would like updates.'
      )
    );
  };

  const pillars = [
    {
      pillar: tr(language, 'স্তম্ভ ০১', 'स्तंभ 01', 'Pillar 01'),
      title: tr(
        language,
        'সহজ বহুভাষিক অনুসন্ধান',
        'आसान बहुभाषी खोज',
        'Accessible Multilingual Discovery'
      ),
      desc: tr(
        language,
        'বাংলা, হিন্দি ও ইংরেজিতে ভয়েস-বান্ধব নির্দেশনা যাতে প্রথমবার স্মার্টফোন ব্যবহারকারীরাও সহজে প্রকল্প, চাকরি ও প্রশিক্ষণ খুঁজে পান।',
        'बंगाली, हिंदी और अंग्रेजी में वॉयस-अनुकूल मार्गदर्शन ताकि पहली बार स्मार्टफोन उपयोगकर्ता भी आसानी से योजनाएं, नौकरियां और प्रशिक्षण खोज सकें।',
        'Voice-friendly guidance in Bengali, Hindi, and English so first-time smartphone users can explore schemes, jobs, and courses effortlessly.'
      ),
    },
    {
      pillar: tr(language, 'স্তম্ভ ০২', 'स्तंभ 02', 'Pillar 02'),
      title: tr(
        language,
        'যাচাইকৃত অফিসিয়াল উৎস ও প্রতারণা সুরক্ষা',
        'सत्यापित आधिकारिक स्रोत और धोखाधड़ी सुरक्षा',
        'Verified Official Sources & Scam Shield'
      ),
      desc: tr(
        language,
        'আসল .gov.in পোর্টালের সরাসরি লিঙ্ক এবং JENOVA Protect-এর মাধ্যমে ভুয়া চাকরির ফি, ফিশিং লিঙ্ক ও UPI প্রতারণা আগে থেকেই শনাক্ত করুন।',
        'असली .gov.in पोर्टल के सीधे लिंक और JENOVA Protect के साथ नकली नौकरी शुल्क, फिशिंग लिंक व UPI धोखाधड़ी को पहले ही पहचानें।',
        'Direct links to authentic .gov.in portals paired with JENOVA Protect to catch fake job fees, phishing URLs, and UPI traps before harm occurs.'
      ),
    },
    {
      pillar: tr(language, 'স্তম্ভ ০৩', 'स्तंभ 03', 'Pillar 03'),
      title: tr(
        language,
        'ডিজিটাল ও আর্থিক ক্ষমতায়ন',
        'डिजिटल और वित्तीय सशक्तिकरण',
        'Digital & Financial Empowerment'
      ),
      desc: tr(
        language,
        'সংসারের মাসিক বাজেট প্ল্যানার, সঞ্চয়ের লক্ষ্য ট্র্যাকার, অফলাইন নথির চেকলিস্ট এবং কমিউনিটি ডিজিটাল সাক্ষরতা কর্মশালা।',
        'घरेलू बजट प्लानर, बचत लक्ष्य ट्रैकर, ऑफलाइन दस्तावेज़ चेकलिस्ट और सामुदायिक डिजिटल साक्षरता कार्यशालाएं।',
        'Interactive household budget planners, savings goal trackers, offline document checklists, and community digital-literacy workshops.'
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <PageHeader
        title={tr(language, 'JENOVA সম্পর্কে', 'JENOVA के बारे में', 'About JENOVA')}
        subtitle={tr(
          language,
          'নতুন সম্ভাবনা, সবার জন্য — একটি সহজ ও অন্তর্ভুক্তিমূলক প্ল্যাটফর্মের মাধ্যমে প্রয়োজনীয় তথ্য, সরকারি সহায়তা, ডিজিটাল নিরাপত্তা, কর্মসংস্থান ও স্থানীয় সহায়তা সবার কাছে পৌঁছে দেওয়া।',
          'एक साथ बढ़ने का नया तरीका — एक सरल और समावेशी प्लेटफॉर्म के माध्यम से आवश्यक जानकारी, सरकारी सहायता, डिजिटल सुरक्षा, रोजगार अवसर और स्थानीय सहयोग सभी तक पहुंचाना।',
          'A New Way to Grow Together — making essential information, government assistance, digital safety, employment opportunities, and local support accessible through one simple, inclusive platform.'
        )}
      />

      <div className="rounded-2xl overflow-hidden bg-white border border-[#F2DCC1] grid grid-cols-1 md:grid-cols-12 items-center">
        <ResilientImage
          src={VISUAL_ASSETS.aboutPathwaysOpportunity.src}
          alt={VISUAL_ASSETS.aboutPathwaysOpportunity.alt}
          objectFit="contain"
          eager
          containerClassName="md:col-span-6 aspect-[16/10] w-full h-full bg-[#FFF7EE] flex items-center justify-center p-2 sm:p-3"
        />
        <div className="md:col-span-6 p-6 sm:p-8 space-y-3">
          <JenovaLogo
            variant={theme === 'dark' ? 'dark' : 'light'}
            size="sm"
            showTagline
            tagline={tr(
              language,
              'নতুন সম্ভাবনা, সবার জন্য।',
              'नई संभावनाएं, सभी के लिए।',
              'A New Way to Grow Together.'
            )}
          />
          <h2 className="text-xl font-bold text-[#26364B] pt-1">
            {tr(
              language,
              'আশা, দিকনির্দেশনা ও সুযোগের নতুন আলো',
              'आशा, मार्गदर्शन और अवसर की नई रोशनी',
              'A New Light of Hope, Guidance & Opportunity'
            )}
          </h2>
          <p className="text-sm text-[#454545] leading-relaxed">
            {tr(
              language,
              'ভারতের গ্রাম, মফস্বল ও শহরের প্রথমবার স্মার্টফোন ব্যবহারকারী, ছাত্রছাত্রী, মহিলা, দৈনিক মজুরি কর্মী ও স্থানীয় ক্ষুদ্র ব্যবসায়ীদের জন্য নির্মিত — যাতে কোনো জটিল ভাষা বা দালাল ছাড়াই যাচাইকৃত সুযোগ খুঁজে পাওয়া যায়।',
              'भारत के गांवों, कस्बों और शहरों में पहली बार स्मार्टफोन उपयोग करने वालों, छात्रों, महिलाओं, दैनिक वेतन भोगियों और छोटे व्यवसायियों के लिए निर्मित — ताकि बिना किसी कठिन भाषा या बिचौलिये के सत्यापित अवसर मिल सकें।',
              'Built for first-time smartphone users, students, women, daily-wage workers, and neighbourhood entrepreneurs across towns, villages, and cities throughout India to discover verified opportunities without jargon or middlemen.'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
          <h2 className="text-lg font-bold text-[#26364B]">
            {tr(language, 'JENOVA ব্র্যান্ড মিশন', 'JENOVA ब्रांड मिशन', 'JENOVA Brand Mission')}
          </h2>
          <p className="text-sm text-[#454545] leading-relaxed">
            {tr(
              language,
              'বাংলা, হিন্দি ও ইংরেজি ভাষায় একটি সহজ, বুদ্ধিমত্তাসম্পন্ন ও অন্তর্ভুক্তিমূলক ডিজিটাল প্ল্যাটফর্মের মাধ্যমে সবার কাছে প্রয়োজনীয় তথ্য, সরকারি সহায়তা, ডিজিটাল নিরাপত্তা, কর্মসংস্থান ও স্থানীয় সহায়তা পৌঁছে দেওয়াই আমাদের লক্ষ্য।',
              'बंगाली, हिंदी और अंग्रेजी में एक सरल, स्मार्ट और समावेशी डिजिटल प्लेटफॉर्म के माध्यम से हर व्यक्ति तक आवश्यक जानकारी, सरकारी सहायता, डिजिटल सुरक्षा, रोजगार अवसर और स्थानीय सहयोग पहुंचाना हमारा उद्देश्य है।',
              'To make essential information, government assistance, digital safety, employment opportunities and local support accessible to everyone through one simple, intelligent and inclusive digital platform in Bengali, English, and Hindi.'
            )}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
          <h2 className="text-lg font-bold text-[#26364B]">
            {tr(language, 'আমরা যা করি না', 'हम क्या नहीं करते', 'What We Do Not Do')}
          </h2>
          <ul className="space-y-2 text-sm text-[#454545]">
            <li>
              •{' '}
              {tr(
                language,
                'আমরা কোনো ঋণ প্রদান, অনুমোদন বা নিশ্চিত তহবিলের প্রতিশ্রুতি দিই না।',
                'हम कोई ऋण प्रदान या स्वीकृत नहीं करते और न ही गारंटीशुदा फंडिंग का वादा करते हैं।',
                'We do NOT offer or sanction loans or promise guaranteed funding.'
              )}
            </li>
            <li>
              •{' '}
              {tr(
                language,
                'আমরা চাকরির গ্যারান্টি দিই না এবং চাকরিপ্রার্থীদের কাছ থেকে কোনো ফি নিই না।',
                'हम नौकरी की गारंटी नहीं देते और न ही नौकरी खोजने वालों से कोई शुल्क लेते हैं।',
                'We do NOT guarantee employment or charge fees to job seekers.'
              )}
            </li>
            <li>
              •{' '}
              {tr(
                language,
                'আমরা সরকারি ভাতা বিতরণ বা অফিসিয়াল যোগ্যতা সার্টিফিকেট প্রদান করি না।',
                'हम सरकारी लाभ वितरित नहीं करते और न ही आधिकारिक योजना पात्रता प्रमाणित करते हैं।',
                'We do NOT distribute government benefits or certify official scheme eligibility.'
              )}
            </li>
            <li>
              •{' '}
              {tr(
                language,
                'আমরা কখনোই আধার নম্বর, ব্যাংক OTP, UPI PIN বা ডেবিট কার্ডের তথ্য সংগ্রহ করি না।',
                'हम कभी भी आधार नंबर, बैंक OTP, UPI PIN या डेबिट कार्ड विवरण एकत्र नहीं करते।',
                'We NEVER collect Aadhaar numbers, bank OTPs, UPI PINs, or debit card details.'
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* JENOVA 3-Pillar Community Growth Vision */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-xl bg-white border border-[#F2DCC1] space-y-5">
        <img
          src={VISUAL_ASSETS.bgCreamAbstract.src}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative">
          <h2 className="text-xl font-bold text-[#26364B]">
            {tr(
              language,
              'JENOVA-র ৩-স্তম্ভ বিশিষ্ট কমিউনিটি উন্নয়ন ভিশন',
              'JENOVA का 3-स्तंभ सामुदायिक विकास विज़न',
              'JENOVA 3-Pillar Community Growth Vision'
            )}
          </h2>
          <p className="text-xs text-[#454545] mt-1">
            {tr(
              language,
              'সাধারণ পরিবার যেভাবে সরকারি প্রকল্প খোঁজে, অফার যাচাই করে, দক্ষতা অর্জন করে ও সংসারের হিসাব করে — সেই বাস্তব চাহিদা অনুযায়ী নির্মিত প্রযুক্তি।',
              'परिवार जिस तरह वास्तव में योजनाएं खोजते हैं, ऑफर सत्यापित करते हैं, कौशल सीखते हैं और घरेलू वित्त की योजना बनाते हैं — उसी के अनुरूप निर्मित समावेशी तकनीक।',
              'Practical, inclusive technology designed around how families actually discover schemes, verify offers, build career skills, and plan household finances.'
            )}
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((m) => (
            <div key={m.pillar} className="p-4 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1]">
              <p className="font-mono text-xs font-semibold text-[#A85B0A]">{m.pillar}</p>
              <h3 className="text-base font-bold text-[#26364B] mt-1">{m.title}</h3>
              <p className="text-xs text-[#454545] mt-2 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative pt-4 border-t border-[#F2DCC1] flex flex-wrap items-center justify-between gap-4">
          <a
            href="/assets/aistudio/community_financial_empowerment_project_note_8c729351.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline"
          >
            <FileText className="w-4 h-4" />
            <span>
              {tr(
                language,
                'কমিউনিটি আর্থিক ক্ষমতায়ন ব্লুপ্রিন্ট দেখুন (PDF)',
                'सामुदायिक वित्तीय सशक्तिकरण ब्लूप्रिंट देखें (PDF)',
                'View Community Financial Empowerment Blueprint (PDF)'
              )}
            </span>
          </a>

          <button
            type="button"
            onClick={registerWorkshopInterest}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg jenova-saffron-btn cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {workshopLogged
                ? tr(
                    language,
                    'কর্মশালায় আগ্রহ নথিভুক্ত হয়েছে',
                    'कार्यशाला में रुचि दर्ज हो गई',
                    'Workshop Interest Recorded'
                  )
                : tr(
                    language,
                    'কমিউনিটি সাক্ষরতা কর্মশালায় আগ্রহ জানান',
                    'सामुदायिक साक्षरता कार्यशाला में रुचि जताएं',
                    'Express Interest in Community Literacy Workshop'
                  )}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

export function ContactSupportPage() {
  const { language, t, showToast, openReportModal } = useApp();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [formType, setFormType] = useState<'contact' | 'feedback' | 'assistance'>('feedback');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    apiFetch<{ announcements: Announcement[] }>('/api/announcements')
      .then((res) => setAnnouncements(res.announcements))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ type: formType, name, contact, subject, message }),
      });
      setDone(true);
      setName('');
      setContact('');
      setSubject('');
      setMessage('');
      showToast(
        tr(
          language,
          'ধন্যবাদ! আপনার বার্তা আমাদের কমিউনিটি সহায়তা ডেস্কে পৌঁছেছে।',
          'धन्यवाद! आपका संदेश हमारे सामुदायिक सहायता डेस्क को प्राप्त हो गया है।',
          'Thank you! Your message has been received by the community coordination desk.'
        )
      );
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : tr(language, 'জমা দেওয়া ব্যর্থ হয়েছে।', 'सबमिट करना विफल रहा।', 'Submission failed.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(
          language,
          'যোগাযোগ ও কমিউনিটি সহায়তা',
          'संपर्क और सामुदायिक सहायता',
          'Contact & Community Support'
        )}
        subtitle={tr(
          language,
          'JENOVA সম্পর্কে আপনার মতামত জানান, অফিসিয়াল পোর্টাল ব্যবহারে সহায়তা চান, সন্দেহজনক বা পুরনো তথ্য রিপোর্ট করুন, অথবা যাচাইকৃত কমিউনিটি ঘোষণা পড়ুন।',
          'JENOVA पर अपनी प्रतिक्रिया साझा करें, आधिकारिक पोर्टल समझने में सहायता मांगें, संदिग्ध या पुरानी जानकारी की रिपोर्ट करें, या सत्यापित सामुदायिक घोषणाएं पढ़ें।',
          'Share feedback on JENOVA, request guidance navigating official portals, report suspicious or outdated information, or read verified community announcements.'
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-xl bg-white border border-[#F2DCC1]">
          <div className="flex flex-wrap gap-2 mb-6">
            {(
              [
                ['feedback', tr(language, 'মতামত জানান', 'प्रतिक्रिया दें', 'Share Feedback')],
                ['assistance', tr(language, 'সহায়তা চান', 'सहायता मांगें', 'Request Assistance')],
                ['contact', tr(language, 'সাধারণ যোগাযোগ', 'सामान्य संपर्क', 'General Contact')],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setFormType(val);
                  setDone(false);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                  formType === val
                    ? 'jenova-saffron-btn'
                    : 'bg-[#FFF1DF] text-[#454545] hover:text-[#26364B]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {done && (
            <div className="mb-5 p-4 rounded-lg bg-[#E9F5EF] dark:bg-[#143022] border border-[#27845B]/35 text-[#27845B] dark:text-[#7DE0B0] text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {tr(
                  language,
                  'সফলভাবে জমা হয়েছে! আমাদের JENOVA কমিউনিটি ডেস্ক শীঘ্রই এটি পর্যালোচনা করবে।',
                  'सफलतापूर्वक जमा हो गया! हमारा JENOVA सामुदायिक डेस्क शीघ्र ही इसकी समीक्षा करेगा।',
                  'Submitted successfully! Our JENOVA community desk will review it shortly.'
                )}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {tr(language, 'আপনার নাম *', 'आपका नाम *', 'Your Name *')}
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {tr(
                    language,
                    'ইমেইল বা ফোন (ঐচ্ছিক — কখনোই OTP/PIN দেবেন না)',
                    'ईमेल या फोन (वैकल्पिक — कभी OTP/PIN न दें)',
                    'Email or Phone (Optional — never share OTP/PIN)'
                  )}
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(language, 'বিষয়', 'विषय', 'Subject')}
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={tr(
                  language,
                  'যেমন: কোনো দক্ষতা কোর্স, সরকারি প্রকল্প বা স্থানীয় কেন্দ্রের পরামর্শ',
                  'जैसे: किसी कौशल कोर्स, सरकारी योजना या स्थानीय केंद्र का सुझाव',
                  'e.g. Suggestion for a skill course, welfare scheme, or local centre'
                )}
                className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(language, 'বার্তা *', 'संदेश *', 'Message *')}
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold jenova-saffron-btn rounded-lg disabled:opacity-60 cursor-pointer"
            >
              {submitting ? t.common.loading : t.common.submit}
            </button>
          </form>
        </div>

        {/* Announcements & Report Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
            <h2 className="text-base font-bold text-[#26364B] inline-flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
              <span>
                {tr(language, 'কমিউনিটি ঘোষণা', 'सामुदायिक घोषणाएं', 'Community Announcements')}
              </span>
            </h2>
            <div className="space-y-4 divide-y divide-[#F2DCC1]">
              {announcements.map((a) => (
                <div key={a.id} className="pt-3 first:pt-0">
                  <p className="text-xs text-[#665B4F]">
                    {localizeAnnouncementCategory(a.category, language)} · {a.publishedAt}
                  </p>
                  <h3 className="text-sm font-bold text-[#26364B] mt-0.5">
                    {pickText(a.title, language)}
                  </h3>
                  <p className="text-xs text-[#454545] mt-1 leading-relaxed">
                    {pickText(a.body, language)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1] space-y-3">
            <h2 className="text-base font-bold text-[#26364B]">
              {tr(
                language,
                'সন্দেহজনক বা ভুল তালিকা রিপোর্ট করুন',
                'संदिग्ध या गलत सूची की रिपोर्ट करें',
                'Report Suspicious or Incorrect Listing'
              )}
            </h2>
            <p className="text-xs text-[#454545] leading-relaxed">
              {tr(
                language,
                'কোনো মেয়াদোত্তীর্ণ সরকারি তারিখ, অকার্যকর লিঙ্ক বা চাকরির নামে টাকা চাওয়ার ঘটনা দেখেছেন? সরাসরি আমাদের যাচাইকরণ ডেস্কে রিপোর্ট করুন।',
                'क्या आपने कोई समाप्त हो चुकी सरकारी तिथि, टूटा हुआ लिंक, या नौकरी के नाम पर पैसे मांगने की घटना देखी है? सीधे हमारे सत्यापन डेस्क पर रिपोर्ट करें।',
                'Spotted an outdated government deadline, broken link, or someone asking for job fees? Report it directly to our verification desk.'
              )}
            </p>
            <button
              type="button"
              onClick={() =>
                openReportModal({
                  targetType: 'general',
                  targetId: 'general',
                  targetTitle: tr(
                    language,
                    'সাধারণ প্ল্যাটফর্ম তালিকা / সুরক্ষা রিপোর্ট',
                    'सामान्य प्लेटफॉर्म सूची / सुरक्षा रिपोर्ट',
                    'General Platform Listing / Safety Report'
                  ),
                })
              }
              className="px-4 py-2 text-xs font-semibold text-[#A85B0A] bg-white border border-[#F4A340]/50 hover:bg-[#FEF4E6] rounded-lg cursor-pointer"
            >
              {tr(language, 'রিপোর্ট ফর্ম খুলুন', 'रिपोर्ट फॉर्म खोलें', 'Open Report Form')}
            </button>
          </div>

          <SafetyNotice />
        </div>
      </div>
    </div>
  );
}

export function AuthPage() {
  const { language, theme, login, register, navigate, user, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [prefLang, setPrefLang] = useState<Language>(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#26364B]">
          {tr(
            language,
            `${user.name} হিসেবে লগইন করা হয়েছে`,
            `${user.name} के रूप में लॉग इन हैं`,
            `Signed in as ${user.name}`
          )}
        </h1>
        <p className="text-sm text-[#454545]">
          {user.email} · {tr(language, 'ভূমিকা:', 'भूमिका:', 'Role:')}{' '}
          <span className="font-mono">{user.role}</span>
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 text-sm font-semibold jenova-saffron-btn rounded-lg cursor-pointer"
          >
            {tr(language, 'ড্যাশবোর্ডে যান', 'डैशबोर्ड पर जाएं', 'Go to Dashboard')}
          </button>
          {user.role !== 'user' && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-5 py-2.5 text-sm font-semibold text-[#A85B0A] dark:text-[#FFD19A] bg-[#FFE5C2] rounded-lg cursor-pointer"
            >
              {tr(language, 'অ্যাডমিন প্যানেল খুলুন', 'एडमिन पैनल खोलें', 'Open Admin Panel')}
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const account =
        mode === 'login'
          ? await login(email, password)
          : await register({ name, email, password, town, preferredLanguage: prefLang });
      showToast(
        tr(
          language,
          `স্বাগতম, ${account.name}!`,
          `स्वागत है, ${account.name}!`,
          `Welcome, ${account.name}!`
        )
      );
      navigate(account.role !== 'user' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : tr(language, 'লগইন ব্যর্থ হয়েছে।', 'लॉगिन विफल रहा।', 'Authentication failed.')
      );
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (em: string, pw: string) => {
    setMode('login');
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#F2DCC1]">
        <div className="flex justify-center mb-6">
          <JenovaLogo
            variant={theme === 'dark' ? 'dark' : 'light'}
            size="md"
            animated
            showTagline
            tagline={tr(
              language,
              'নতুন সম্ভাবনা, সবার জন্য।',
              'नई संभावनाएं, सभी के लिए।',
              'A New Way to Grow Together.'
            )}
          />
        </div>
        <div className="flex gap-2 p-1 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md cursor-pointer ${
              mode === 'login' ? 'jenova-saffron-btn' : 'text-[#454545]'
            }`}
          >
            {tr(language, 'লগইন করুন', 'लॉगिन करें', 'Sign In')}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md cursor-pointer ${
              mode === 'register' ? 'jenova-saffron-btn' : 'text-[#454545]'
            }`}
          >
            {tr(language, 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন', 'निःशुल्क खाता बनाएं', 'Create Free Account')}
          </button>
        </div>

        <p className="text-xs text-[#454545] mb-5">
          {tr(
            language,
            'অ্যাকাউন্ট তৈরি করা সম্পূর্ণ ঐচ্ছিক — সমস্ত পাবলিক চাকরি, দক্ষতা কোর্স, ক্যালকুলেটর এবং সরকারি প্রকল্প লগইন ছাড়াই দেখা যায়। বুকমার্ক সেভ বা সঞ্চয়ের লক্ষ্য ট্র্যাক করতে লগইন করুন।',
            'पंजीकरण पूरी तरह वैकल्पिक है — सभी सार्वजनिक नौकरियां, कौशल कोर्स, कैलकुलेटर और सरकारी योजनाएं बिना खाते के उपलब्ध हैं। बुकमार्क सहेजने या बचत लक्ष्य ट्रैक करने के लिए लॉगिन करें।',
            'Registration is completely optional — all public jobs, skills, calculators, and government schemes are accessible without an account. Sign in to save bookmarks or track savings goals.'
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {tr(language, 'পূর্ণ নাম *', 'पूरा नाम *', 'Full Name *')}
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'গ্রাম / শহর', 'गांव / शहर', 'Village / Town')}
                  </label>
                  <input
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    placeholder={tr(
                      language,
                      'যেমন: কলকাতা, শিলিগুড়ি, পাটনা',
                      'जैसे: कोलकाता, पटना, जयपुर',
                      'e.g. Kolkata, Patna, Jaipur'
                    )}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'পছন্দের ভাষা', 'पसंदीदा भाषा', 'Preferred Language')}
                  </label>
                  <select
                    value={prefLang}
                    onChange={(e) => setPrefLang(e.target.value as Language)}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2.5 text-sm bg-white"
                  >
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1">
              {tr(language, 'ইমেইল ঠিকানা *', 'ईमेल पता *', 'Email Address *')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {tr(
                language,
                'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *',
                'पासवर्ड (कम से कम 6 अक्षर) *',
                'Password (min 6 characters) *'
              )}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2.5 text-sm"
            />
          </div>

          {error && <p className="text-xs text-red-700 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold jenova-saffron-btn rounded-lg disabled:opacity-60 cursor-pointer"
          >
            {loading
              ? tr(language, 'অপেক্ষা করুন...', 'कृपया प्रतीक्षा करें...', 'Please wait...')
              : mode === 'login'
                ? tr(language, 'লগইন করুন', 'लॉगिन करें', 'Sign In')
                : tr(language, 'অ্যাকাউন্ট তৈরি করুন', 'खाता बनाएं', 'Create Account')}
          </button>
        </form>
      </div>

      {/* Quick Role Sign-In Helper */}
      <div className="p-5 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1] space-y-3">
        <p className="text-xs font-bold text-[#26364B] inline-flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
          <span>
            {tr(
              language,
              'দ্রুত ভূমিকা নির্বাচন (অটোফিল করতে ক্লিক করুন)',
              'त्वरित भूमिका लॉगिन (ऑटोफिल के लिए क्लिक करें)',
              'Quick Role Sign-In (Click to Autofill)'
            )}
          </span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => quickFill('superadmin@jenova.in', 'Admin@Jenova2026')}
            className="p-2.5 rounded-lg bg-white border border-[#F2DCC1] hover:border-[#F4A340] text-left cursor-pointer"
          >
            <span className="font-semibold block text-[#26364B]">
              {tr(language, 'সুপার অ্যাডমিনিস্ট্রেটর', 'सुपर एडमिनिस्ट्रेटर', 'Super Administrator')}
            </span>
            <span className="text-[#454545]">
              {tr(
                language,
                'সম্পূর্ণ RBAC + অ্যানালিটিক্স + ব্যাকআপ',
                'पूर्ण RBAC + एनालिटिक्स + बैकअप',
                'Full RBAC + Analytics + Backup'
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => quickFill('editor@jenova.in', 'Editor@Jenova2026')}
            className="p-2.5 rounded-lg bg-white border border-[#F2DCC1] hover:border-[#F4A340] text-left cursor-pointer"
          >
            <span className="font-semibold block text-[#26364B]">
              {tr(language, 'কনটেন্ট অ্যাডমিনিস্ট্রেটর', 'कंटेंट एडमिनिस्ट्रेटर', 'Content Administrator')}
            </span>
            <span className="text-[#454545]">
              {tr(
                language,
                'তালিকা ও বিজ্ঞপ্তি পরিচালনা করুন',
                'सूचियां और सूचनाएं प्रबंधित करें',
                'Manage listings & notices'
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => quickFill('reviewer@jenova.in', 'Review@Jenova2026')}
            className="p-2.5 rounded-lg bg-white border border-[#F2DCC1] hover:border-[#F4A340] text-left cursor-pointer"
          >
            <span className="font-semibold block text-[#26364B]">
              {tr(language, 'কনটেন্ট রিভিউয়ার', 'कंटेंट समीक्षक', 'Content Reviewer')}
            </span>
            <span className="text-[#454545]">
              {tr(
                language,
                'তথ্য যাচাই ও রিপোর্ট পর্যালোচনা',
                'सत्यापन कतार और रिपोर्ट समीक्षा',
                'Verify queue & review reports'
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => quickFill('member@jenova.in', 'Member@2026')}
            className="p-2.5 rounded-lg bg-white border border-[#F2DCC1] hover:border-[#F4A340] text-left cursor-pointer"
          >
            <span className="font-semibold block text-[#26364B]">
              {tr(language, 'কমিউনিটি ব্যবহারকারী', 'सामुदायिक उपयोगकर्ता', 'Community User')}
            </span>
            <span className="text-[#454545]">
              {tr(
                language,
                'বুকমার্ক ও সঞ্চয়ের লক্ষ্য',
                'बुकमार्क और बचत लक्ष्य',
                'Bookmarks & savings goals'
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserDashboardPage() {
  const {
    user,
    token,
    bookmarks,
    language,
    navigate,
    logout,
    showToast,
    udaanEnrolments,
    passportGoals,
    businessPlans,
  } = useApp();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [courses, setCourses] = useState<CourseListing[]>([]);
  const [schemes, setSchemes] = useState<WelfareScheme[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    Promise.all([
      apiFetch<{ goals: SavingsGoal[] }>('/api/savings-goals', {}, token),
      apiFetch<{ jobs: JobListing[] }>('/api/jobs'),
      apiFetch<{ courses: CourseListing[] }>('/api/courses'),
      apiFetch<{ schemes: WelfareScheme[] }>('/api/schemes'),
      apiFetch<{ businesses: BusinessProfile[] }>('/api/businesses'),
    ])
      .then(([g, j, c, s, b]) => {
        setGoals(g.goals);
        setJobs(j.jobs);
        setCourses(c.courses);
        setSchemes(s.schemes);
        setBusinesses(b.businesses);
      })
      .catch(() => {});
  }, [user, token]);

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#F2DCC1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-[#26364B]">
              {tr(language, 'JENOVA ব্যক্তিগত ড্যাশবোর্ড', 'JENOVA व्यक्तिगत डैशबोर्ड', 'JENOVA Personal Livelihood Dashboard')}
            </h1>
            <p className="text-sm text-[#454545] max-w-2xl">
              {tr(
                language,
                'আপনার UDAAN অগ্রগতি, Action Passport ও ব্যবসার পরিকল্পনা এই ডিভাইসে সংরক্ষিত আছে। অন্য ডিভাইস থেকেও সিঙ্ক করতে ও বুকমার্ক রাখতে বিনামূল্যে সাইন ইন করুন।',
                'आपकी UDAAN प्रगति, Action Passport और व्यवसाय योजनाएं इस डिवाइस पर सहेजी जाती हैं। सभी डिवाइस पर सिंक करने के लिए निःशुल्क साइन इन करें।',
                'Your UDAAN progress, Action Passport, and business plans are saved on this device. Sign in with a free JENOVA account to sync across devices and save bookmarks.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="px-6 py-2.5 text-sm font-semibold jenova-saffron-btn rounded-lg whitespace-nowrap cursor-pointer shrink-0"
          >
            {tr(language, 'লগইন বা রেজিস্টার করুন', 'लॉगिन या रजिस्टर करें', 'Sign In or Register')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => navigate('/udaan')}
            className="text-left p-5 rounded-xl bg-white border border-[#F2DCC1] hover:border-[#F4A340] cursor-pointer"
          >
            <p className="text-xs text-[#454545]">JENOVA UDAAN</p>
            <p className="text-2xl font-bold font-mono text-[#A85B0A] dark:text-[#FFD19A] mt-1">{udaanEnrolments.length}</p>
            <p className="text-xs text-[#454545] mt-1">
              {tr(language, 'নথিভুক্ত মডিউল →', 'नामांकित मॉड्यूल →', 'Enrolled Modules →')}
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/passport')}
            className="text-left p-5 rounded-xl bg-white border border-[#F2DCC1] hover:border-[#F4A340] cursor-pointer"
          >
            <p className="text-xs text-[#454545]">JENOVA Action Passport</p>
            <p className="text-2xl font-bold font-mono text-[#A85B0A] dark:text-[#FFD19A] mt-1">{passportGoals.length}</p>
            <p className="text-xs text-[#454545] mt-1">
              {tr(language, 'সক্রিয় লক্ষ্য →', 'सक्रिय लक्ष्य →', 'Tracked Action Goals →')}
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/msme/planner')}
            className="text-left p-5 rounded-xl bg-white border border-[#F2DCC1] hover:border-[#F4A340] cursor-pointer"
          >
            <p className="text-xs text-[#454545]">
              {tr(language, 'ব্যবসার পরিকল্পনা', 'व्यवसाय योजनाएं', 'Business Plans')}
            </p>
            <p className="text-2xl font-bold font-mono text-[#A85B0A] dark:text-[#FFD19A] mt-1">{businessPlans.length}</p>
            <p className="text-xs text-[#454545] mt-1">
              {tr(language, 'প্ল্যান বিল্ডার খুলুন →', 'प्लान बिल्डर खोलें →', 'Open Plan Builder →')}
            </p>
          </button>
        </div>

        <PersonalisedForYouSection />
      </div>
    );
  }

  const resolveBookmarkLabel = (type: string, id: string) => {
    if (type === 'job') {
      const item = jobs.find((x) => x.id === id);
      return { title: item ? pickText(item.title, language) : id, path: `/jobs/${id}` };
    }
    if (type === 'course') {
      const item = courses.find((x) => x.id === id);
      return { title: item ? pickText(item.name, language) : id, path: `/skills/${id}` };
    }
    if (type === 'scheme') {
      const item = schemes.find((x) => x.id === id);
      return { title: item ? pickText(item.officialName, language) : id, path: `/schemes/${id}` };
    }
    const biz = businesses.find((x) => x.id === id);
    return { title: biz ? biz.businessName : id, path: '/msme/directory' };
  };

  const handleDeleteAccount = async () => {
    if (!token || deleting) return;
    setDeleting(true);
    try {
      await apiFetch('/api/auth/account', { method: 'DELETE' }, token);
      showToast(
        tr(
          language,
          'আপনার অ্যাকাউন্ট এবং ব্যক্তিগত বুকমার্ক স্থায়ীভাবে মুছে ফেলা হয়েছে।',
          'आपका खाता और व्यक्तिगत बुकमार्क स्थायी रूप से हटा दिए गए हैं।',
          'Your account and personal bookmarks have been permanently deleted.'
        )
      );
      logout();
      navigate('/');
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : tr(language, 'অ্যাকাউন্ট মুছে ফেলা যায়নি।', 'खाता हटाया नहीं जा सका।', 'Unable to delete account.')
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title={tr(
          language,
          `JENOVA-তে স্বাগতম, ${user.name}`,
          `JENOVA में आपका स्वागत है, ${user.name}`,
          `Welcome to JENOVA, ${user.name}`
        )}
        subtitle={`${user.town} · ${user.email} · ${tr(language, 'অ্যাকাউন্ট ভূমিকা:', 'खाता भूमिका:', 'Account Role:')} ${user.role}`}
        action={
          user.role !== 'user' ? (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-xs font-semibold jenova-saffron-btn rounded-lg cursor-pointer"
            >
              {tr(language, 'অ্যাডমিন ড্যাশবোর্ড খুলুন →', 'एडमिन डैशबोर्ड खोलें →', 'Open Admin Dashboard →')}
            </button>
          ) : undefined
        }
      />

      {/* Personalised Recommendations & Location Engine */}
      <PersonalisedForYouSection />

      {/* JENOVA UDAAN, Action Passport & Saved Business Plans Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="p-5 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#26364B]">
              {tr(
                language,
                `JENOVA UDAAN (${udaanEnrolments.length})`,
                `JENOVA UDAAN (${udaanEnrolments.length})`,
                `JENOVA UDAAN (${udaanEnrolments.length})`
              )}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/udaan')}
              className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
            >
              {tr(language, 'খুলুন →', 'खोलें →', 'Open →')}
            </button>
          </div>
          {udaanEnrolments.length === 0 ? (
            <p className="text-xs text-[#454545]">
              {tr(
                language,
                'ইন্টারভিউ, বিজনেস প্ল্যান বা ডিজিটাল দক্ষতা শিখতে UDAAN-এ বিনামূল্যে যোগ দিন।',
                'इंटरव्यू, बिजनेस प्लान या डिजिटल कौशल सीखने के लिए UDAAN में जुड़ें।',
                'Enrol free in practical modules for Interview Prep, Business Plan, and Digital skills.'
              )}
            </p>
          ) : (
            <div className="space-y-2.5">
              {udaanEnrolments.slice(0, 3).map((enr) => {
                const mod = UDAAN_PROGRAMMES.find((p) => p.id === enr.programmeId);
                const totalLessons = mod?.lessons.length || 3;
                const pct = Math.min(100, Math.round((enr.completedLessonIds.length / totalLessons) * 100));
                return (
                  <button
                    key={enr.id}
                    type="button"
                    onClick={() => navigate(`/udaan/${enr.programmeId}`)}
                    className="w-full text-left p-3 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] hover:border-[#F4A340] cursor-pointer"
                  >
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="truncate pr-2">{mod ? pickText(mod.title, language) : enr.programmeId}</span>
                      <span className="font-mono text-[#A85B0A] dark:text-[#FFD19A]">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#FFE5C2] dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#F4A340]" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="p-5 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#26364B]">
              {tr(
                language,
                `Action Passport (${passportGoals.length})`,
                `Action Passport (${passportGoals.length})`,
                `Action Passport (${passportGoals.length})`
              )}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/passport')}
              className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
            >
              {tr(language, 'পরিচালনা করুন →', 'प्रबंधित करें →', 'Manage →')}
            </button>
          </div>
          {passportGoals.length === 0 ? (
            <p className="text-xs text-[#454545]">
              {tr(
                language,
                'যেকোনো লক্ষ্যকে ধাপে ধাপে চেকলিস্ট ও নোটসহ Action Passport-এ ট্র্যাক করুন।',
                'किसी भी लक्ष्य को चरणबद्ध चेकलिस्ट और नोट्स के साथ Action Passport में ट्रैक करें।',
                'Track any skill, business, scheme, or job goal step-by-step in your Action Passport.'
              )}
            </p>
          ) : (
            <div className="space-y-2">
              {passportGoals.slice(0, 3).map((g) => {
                const doneCount = g.steps.filter((s) => s.done).length;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => navigate('/passport')}
                    className="w-full text-left p-3 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] hover:border-[#F4A340] cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-[#26364B] truncate">{g.title}</p>
                    <p className="text-[11px] text-[#454545] mt-0.5">
                      {g.status} · {doneCount}/{g.steps.length} {tr(language, 'ধাপ', 'चरण', 'steps')}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="p-5 rounded-xl bg-white border border-[#F2DCC1] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#26364B]">
              {tr(
                language,
                `ব্যবসার পরিকল্পনা (${businessPlans.length})`,
                `व्यवसाय योजनाएं (${businessPlans.length})`,
                `Business Plans (${businessPlans.length})`
              )}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/msme/planner')}
              className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
            >
              {tr(language, 'বিল্ডার খুলুন →', 'बिल्डर खोलें →', 'Builder →')}
            </button>
          </div>
          {businessPlans.length === 0 ? (
            <p className="text-xs text-[#454545]">
              {tr(
                language,
                'ক্ষুদ্র ব্যবসা শুরুর আগে প্রাথমিক মূলধন ও ব্রেক-ইভেন হিসাব করে প্ল্যান সেভ করুন।',
                'छोटा व्यवसाय शुरू करने से पहले पूंजी और ब्रेक-ईवन की योजना बनाकर सहेजें।',
                'Plan startup costs, break-even volume, and customer checks before investing savings.'
              )}
            </p>
          ) : (
            <div className="space-y-2">
              {businessPlans.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate('/msme/planner')}
                  className="w-full text-left p-3 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] hover:border-[#F4A340] cursor-pointer"
                >
                  <p className="text-xs font-semibold text-[#26364B] truncate">{p.businessName}</p>
                  <p className="text-[11px] text-[#454545] mt-0.5">
                    {p.category} · {p.location}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Bookmarks */}
        <section className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
          <h2 className="text-lg font-bold text-[#26364B] inline-flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
            <span>
              {tr(
                language,
                `সেভ করা বুকমার্ক (${bookmarks.length})`,
                `सहेजे गए बुकमार्क (${bookmarks.length})`,
                `Saved Bookmarks (${bookmarks.length})`
              )}
            </span>
          </h2>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-[#454545]">
              {tr(
                language,
                'এখনো কোনো তথ্য সেভ করা হয়নি। যেকোনো চাকরি, কোর্স, সরকারি প্রকল্প বা ব্যবসায় “সেভ করুন” বোতামে ক্লিক করে এখানে সংরক্ষণ করুন।',
                'अभी तक कुछ भी सहेजा नहीं गया है। किसी भी नौकरी, कोर्स, योजना या व्यवसाय पर “सहेजें” पर क्लिक करें।',
                'No saved items yet. Click “Bookmark” on any job, skill course, scheme, or business to save it here.'
              )}
            </p>
          ) : (
            <div className="divide-y divide-[#F2DCC1]">
              {bookmarks.map((bm) => {
                const info = resolveBookmarkLabel(bm.itemType, bm.itemId);
                return (
                  <button
                    key={bm.id}
                    type="button"
                    onClick={() => navigate(info.path)}
                    className="w-full py-3 text-left flex items-center justify-between gap-3 hover:text-[#A85B0A] dark:hover:text-[#FFD19A] cursor-pointer"
                  >
                    <div>
                      <p className="text-xs text-[#665B4F]">
                        {localizeBookmarkType(bm.itemType, language)}
                      </p>
                      <p className="text-sm font-semibold text-[#26364B]">{info.title}</p>
                    </div>
                    <span className="text-xs text-[#A85B0A] dark:text-[#FFD19A]">
                      {tr(language, 'খুলুন →', 'खोलें →', 'Open →')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Savings Goals */}
        <section className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#26364B]">
              {tr(
                language,
                `আমার সঞ্চয়ের লক্ষ্য (${goals.length})`,
                `मेरे बचत लक्ष्य (${goals.length})`,
                `My Savings Goals (${goals.length})`
              )}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/finance/savings')}
              className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
            >
              {tr(language, 'লক্ষ্য পরিচালনা করুন →', 'लक्ष्य प्रबंधित करें →', 'Manage Goals →')}
            </button>
          </div>
          {goals.length === 0 ? (
            <p className="text-sm text-[#454545]">
              {tr(
                language,
                'সঞ্চয় ক্যালকুলেটরে জরুরি তহবিল বা শিক্ষার সঞ্চয়ের লক্ষ্য ট্র্যাক করুন।',
                'बचत कैलकुलेटर में आपातकालीन निधि या शिक्षा बचत लक्ष्य ट्रैक करें।',
                'Track emergency funds or education goals in the Savings Calculator.'
              )}
            </p>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => {
                const pct = Math.min(
                  100,
                  Math.round((g.savedAmount / Math.max(1, g.targetAmount)) * 100)
                );
                return (
                  <div key={g.id} className="p-3.5 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1]">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>{g.title}</span>
                      <span className="font-mono tabular-nums text-[#A85B0A] dark:text-[#FFD19A]">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FFE5C2] dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#F4A340]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Privacy & Data Deletion Control */}
      <section className="p-6 rounded-xl bg-white border border-[#F2DCC1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#26364B]">
            {tr(
              language,
              'গোপনীয়তা ও অ্যাকাউন্টের তথ্য মুছে ফেলা',
              'गोपनीयता और खाता डेटा हटाना',
              'Privacy & Account Data Deletion'
            )}
          </h2>
          <p className="text-xs text-[#454545] mt-1">
            {tr(
              language,
              'আমরা কেবল আপনার নাম, ইমেইল, শহর, বুকমার্ক এবং সঞ্চয়ের লক্ষ্য সংরক্ষণ করি। আপনি যেকোনো সময় স্থায়ীভাবে আপনার ব্যক্তিগত তথ্য মুছে ফেলতে পারেন।',
              'हम केवल आपका नाम, ईमेल, शहर, बुकमार्क और बचत लक्ष्य सहेजते हैं। आप किसी भी समय अपना व्यक्तिगत डेटा स्थायी रूप से हटा सकते हैं।',
              'We store only your name, email, town, bookmarks, and savings goals. You may permanently delete your personal data at any time.'
            )}
          </p>
        </div>
        {user.role !== 'super_admin' && (
          <button
            type="button"
            disabled={deleting}
            onClick={handleDeleteAccount}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {deleting
                ? tr(language, 'মুছে ফেলা হচ্ছে...', 'हटाया जा रहा है...', 'Deleting...')
                : tr(
                    language,
                    'আমার অ্যাকাউন্ট ও তথ্য মুছে ফেলুন',
                    'मेरा खाता और डेटा हटाएं',
                    'Delete My Account & Data'
                  )}
            </span>
          </button>
        )}
      </section>
    </div>
  );
}
