import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Compass,
  LocateFixed,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../i18n/translations';
import { apiFetch } from '../lib/api';
import { UDAAN_PROGRAMMES } from '../data/udaanCatalog';
import {
  generatePersonalisedRecommendations,
  hasCustomisedProfile,
  INDIA_STATES_DISTRICTS,
} from '../lib/personalisation';
import type {
  BusinessIdea,
  CourseListing,
  JobListing,
  UserLivelihoodProfile,
  WelfareScheme,
} from '../types/platform';

const GOAL_OPTIONS = [
  { id: 'find_job', bn: 'চাকরি ও ইন্টারভিউ প্রস্তুতি', hi: 'नौकरी और इंटरव्यू तैयारी', en: 'Find a Job & Interview Prep' },
  { id: 'start_business', bn: 'নিজের ছোট ব্যবসা শুরু', hi: 'अपना छोटा व्यवसाय शुरू करना', en: 'Start a Small Business' },
  { id: 'learn_skills', bn: 'নতুন কাজের দক্ষতা শেখা', hi: 'नए व्यावसायिक कौशल सीखना', en: 'Learn Practical Skills' },
  { id: 'explore_schemes', bn: 'সরকারি প্রকল্প ও সহায়তা', hi: 'सरकारी योजनाएं और सहायता', en: 'Explore Government Schemes' },
];

const INTEREST_OPTIONS = [
  { id: 'tailoring', bn: 'সেলাই ও পোশাক তৈরি', hi: 'सिलाई और परिधान', en: 'Tailoring & Garments' },
  { id: 'digital_skills', bn: 'কম্পিউটার ও ডিজিটাল কাজ', hi: 'कंप्यूटर और डिजिटल कार्य', en: 'Computer & Digital Work' },
  { id: 'food_tiffin', bn: 'খাবার ও টিফিন পরিষেবা', hi: 'भोजन और टिफिन सेवा', en: 'Food & Tiffin Business' },
  { id: 'retail_shop', bn: 'স্থানীয় দোকান ও পরিষেবা', hi: 'स्थानीय दुकान और सेवा', en: 'Local Retail & Service Shop' },
  { id: 'communication', bn: 'যোগাযোগ ও অফিস কাজ', hi: 'संवाद और ऑफिस कार्य', en: 'Communication & Office Work' },
  { id: 'agriculture', bn: 'কৃষি ও গ্রামীণ উদ্যোগ', hi: 'कृषि और ग्रामीण उद्यम', en: 'Agriculture & Rural Enterprise' },
];

export function PersonalisedForYouSection({
  compact = false,
  forceSaffron = false,
}: {
  compact?: boolean;
  forceSaffron?: boolean;
}) {
  const { language, route, navigate, profile, updateProfile, resetProfile, showToast } = useApp();
  const isHome = !forceSaffron && (route === '/' || route === '');
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<UserLivelihoodProfile>(profile);
  const [locating, setLocating] = useState(false);

  const [schemes, setSchemes] = useState<WelfareScheme[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [courses, setCourses] = useState<CourseListing[]>([]);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  useEffect(() => {
    Promise.all([
      apiFetch<{ schemes: WelfareScheme[] }>('/api/schemes'),
      apiFetch<{ jobs: JobListing[] }>('/api/jobs'),
      apiFetch<{ courses: CourseListing[] }>('/api/courses'),
      apiFetch<{ ideas: BusinessIdea[] }>('/api/msme/ideas'),
    ])
      .then(([s, j, c, i]) => {
        setSchemes(s.schemes || []);
        setJobs(j.jobs || []);
        setCourses(c.courses || []);
        setIdeas(i.ideas || []);
      })
      .catch(() => {});
  }, []);

  const recommendations = useMemo(
    () =>
      generatePersonalisedRecommendations({
        profile,
        language,
        udaanProgrammes: UDAAN_PROGRAMMES,
        schemes,
        jobs,
        courses,
        businessIdeas: ideas,
      }),
    [profile, language, schemes, jobs, courses, ideas]
  );

  const states = Object.keys(INDIA_STATES_DISTRICTS);
  const districts = INDIA_STATES_DISTRICTS[draft.location.state] || ['Other District'];

  const toggleArrayItem = (field: 'careerGoals' | 'businessInterests' | 'skills', value: string) => {
    setDraft((prev) => {
      const list = prev[field];
      const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(draft);
    setEditorOpen(false);
    showToast(
      tr(
        language,
        'আপনার ব্যক্তিগত সুপারিশ ও অবস্থান আপডেট হয়েছে।',
        'आपकी व्यक्तिगत सिफारिशें और स्थान अपडेट हो गए हैं।',
        'Your personalised guidance & location preferences have been updated.'
      )
    );
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast(
        tr(
          language,
          'এই ব্রাউজারে লোকেশন শনাক্তকরণ উপলব্ধ নয় — অনুগ্রহ করে তালিকা থেকে জেলা বেছে নিন।',
          'इस ब्राउज़र में लोकेशन उपलब्ध नहीं है — कृपया सूची से अपना जिला चुनें।',
          'Browser location is unavailable — please pick your state and district manually.'
        )
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Rough geographic check for Purba Medinipur / West Bengal without sending coordinates to third parties
        let detectedState = draft.location.state;
        let detectedDistrict = draft.location.district;
        if (latitude >= 21.5 && latitude <= 22.6 && longitude >= 87.3 && longitude <= 88.2) {
          detectedState = 'West Bengal';
          detectedDistrict = 'Purba Medinipur';
        } else if (latitude >= 22.4 && latitude <= 22.7 && longitude >= 88.2 && longitude <= 88.5) {
          detectedState = 'West Bengal';
          detectedDistrict = 'Kolkata';
        } else if (latitude >= 21.5 && latitude <= 27.2 && longitude >= 85.8 && longitude <= 89.9) {
          detectedState = 'West Bengal';
        }
        setDraft((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            state: detectedState,
            district: detectedDistrict,
            isGpsDerived: true,
          },
        }));
        setLocating(false);
        showToast(
          tr(
            language,
            `অবস্থান শনাক্ত হয়েছে: ${detectedDistrict}, ${detectedState} (আপনি চাইলে পরিবর্তন করতে পারেন)।`,
            `स्थान मिला: ${detectedDistrict}, ${detectedState} (आप इसे बदल सकते हैं)।`,
            `Location matched: ${detectedDistrict}, ${detectedState}. You can adjust manually anytime.`
          )
        );
      },
      () => {
        setLocating(false);
        showToast(
          tr(
            language,
            'লোকেশন অনুমতি দেওয়া হয়নি — আপনি ম্যানুয়ালি রাজ্য ও জেলা নির্বাচন করতে পারেন।',
            'लोकेशन अनुमति नहीं मिली — आप मैन्युअल रूप से राज्य और जिला चुन सकते हैं।',
            'Location permission declined — you can select your state and district manually.'
          )
        );
      },
      { timeout: 6000 }
    );
  };

  const customised = hasCustomisedProfile(profile);
  const shownRecs = compact ? recommendations.slice(0, 3) : recommendations;

  return (
    <section
      className={`rounded-2xl border p-5 sm:p-6 space-y-5 shadow-sm ${
        isHome
          ? 'bg-white dark:bg-[#0B2242] border-[#E5E3DC] dark:border-white/15'
          : 'bg-white dark:bg-[#241B13] border-[#F2DCC1] dark:border-[#3F2E1E]'
      }`}
    >
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${
          isHome ? 'border-[#E5E3DC] dark:border-white/10' : 'border-[#F2DCC1] dark:border-[#3F2E1E]'
        }`}
      >
        <div className="space-y-1">
          <div
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${
              isHome ? 'text-[#176B4D] dark:text-[#36E7F2]' : 'text-[#A85B0A] dark:text-[#FFD19A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {tr(
                language,
                'JENOVA ব্যক্তিগত দিকনির্দেশনা ইঞ্জিন',
                'JENOVA व्यक्तिगत मार्गदर्शन इंजन',
                'JENOVA Personalised Guidance Engine'
              )}
            </span>
          </div>
          <h2
            className={`text-lg sm:text-xl font-bold ${
              isHome ? 'text-[#252525] dark:text-white' : 'text-[#26364B] dark:text-[#FFF5E8]'
            }`}
          >
            {tr(
              language,
              `আপনার জন্য প্রাসঙ্গিক পথ (${profile.location.district || profile.location.state})`,
              `आपके लिए प्रासंगिक सुझाव (${profile.location.district || profile.location.state})`,
              `Recommended for Your Goals (${profile.location.district || profile.location.state})`
            )}
          </h2>
          <p
            className={`text-xs ${
              isHome ? 'text-[#5C5C58] dark:text-[#B9D8F7]' : 'text-[#454545] dark:text-[#DDD2C5]'
            }`}
          >
            {customised
              ? tr(
                  language,
                  'আপনার নির্বাচিত জেলা, লক্ষ্য ও আগ্রহ অনুযায়ী প্রতিটি পরামর্শের কারণ নিচে দেখানো হয়েছে।',
                  'आपके चुने हुए जिले, लक्ष्य और रुचि के आधार पर हर सुझाव का कारण नीचे दिया गया है।',
                  'Tailored to your selected district, goals, and interests — every card explains why it is shown.'
                )
              : tr(
                  language,
                  'ঐচ্ছিকভাবে আপনার জেলা, শিক্ষা ও লক্ষ্য সেট করুন — কোনো সংবেদনশীল তথ্য ছাড়াই আরও সঠিক সুপারিশ পান।',
                  'वैकल्पिक रूप से अपना जिला, शिक्षा और लक्ष्य चुनें — बिना किसी संवेदनशील डेटा के सटीक सुझाव पाएं।',
                  'Optionally set your district, education, and goals for tailored guidance — no sensitive personal data required.'
                )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              isHome
                ? 'bg-[#FAF9F5] dark:bg-[#071A34] border-[#E5E3DC] dark:border-white/15 text-[#252525] dark:text-[#DCEEFF]'
                : 'bg-[#FFF1DF] dark:bg-[#221911] border-[#F2DCC1] dark:border-[#3F2E1E] text-[#26364B] dark:text-[#FFF5E8]'
            }`}
          >
            <MapPin
              className={`w-3.5 h-3.5 ${
                isHome ? 'text-[#176B4D] dark:text-[#36E7F2]' : 'text-[#A85B0A] dark:text-[#FFD19A]'
              }`}
            />
            <span>
              {profile.location.district ? `${profile.location.district}, ` : ''}
              {profile.location.state}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setEditorOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
              isHome ? 'bg-[#176B4D] hover:bg-[#11533B] text-white' : 'jenova-saffron-btn'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {editorOpen
                ? tr(language, 'বন্ধ করুন', 'बंद करें', 'Close')
                : tr(language, 'প্রোফাইল ও জেলা সেট করুন', 'प्रोफ़ाइल और जिला चुनें', 'Personalise Goals & Location')}
            </span>
          </button>
        </div>
      </div>

      {/* Optional Non-Sensitive Profile & Location Editor */}
      {editorOpen && (
        <form
          onSubmit={handleSave}
          className={`p-4 sm:p-5 rounded-xl border space-y-4 ${
            isHome
              ? 'bg-[#FAF9F5] dark:bg-[#071A34] border-[#E5E3DC] dark:border-white/15'
              : 'bg-[#FFF1DF] dark:bg-[#221911] border-[#F2DCC1] dark:border-[#3F2E1E]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-xs font-bold ${
                isHome ? 'text-[#252525] dark:text-white' : 'text-[#26364B] dark:text-[#FFF5E8]'
              }`}
            >
              {tr(
                language,
                'ঐচ্ছিক জীবিকা ও অবস্থান প্রোফাইল (কখনোই আধার বা ব্যাংক তথ্য দেবেন না)',
                'वैकल्पिक आजीविका और स्थान प्रोफ़ाइल (कभी आधार या बैंक जानकारी न दें)',
                'Optional Livelihood & Location Profile (No sensitive IDs or financial data collected)'
              )}
            </p>
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className={`p-1 cursor-pointer ${
                isHome
                  ? 'text-[#5C5C58] hover:text-[#252525] dark:text-[#B9D8F7]'
                  : 'text-[#454545] hover:text-[#26364B] dark:text-[#DDD2C5]'
              }`}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Location Intelligence Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label
                className={`block text-[11px] font-semibold mb-1 ${
                  isHome ? 'text-[#252525] dark:text-[#DCEEFF]' : 'text-[#26364B] dark:text-[#F5E6D3]'
                }`}
              >
                {tr(language, 'রাজ্য (State)', 'राज्य (State)', 'State')}
              </label>
              <select
                value={draft.location.state}
                onChange={(e) => {
                  const nextState = e.target.value;
                  const firstDist = INDIA_STATES_DISTRICTS[nextState]?.[0] || '';
                  setDraft((prev) => ({
                    ...prev,
                    location: { ...prev.location, state: nextState, district: firstDist, isGpsDerived: false },
                  }));
                }}
                className={`w-full rounded-lg border px-2.5 py-2 text-xs ${
                  isHome
                    ? 'border-[#E5E3DC] dark:border-white/15 bg-white dark:bg-[#0B2242]'
                    : 'border-[#F2DCC1] dark:border-[#4A3522] bg-white dark:bg-[#241B13]'
                }`}
              >
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-[11px] font-semibold mb-1 ${
                  isHome ? 'text-[#252525] dark:text-[#DCEEFF]' : 'text-[#26364B] dark:text-[#F5E6D3]'
                }`}
              >
                {tr(language, 'জেলা (District)', 'जिला (District)', 'District')}
              </label>
              <select
                value={draft.location.district}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    location: { ...prev.location, district: e.target.value, isGpsDerived: false },
                  }))
                }
                className={`w-full rounded-lg border px-2.5 py-2 text-xs ${
                  isHome
                    ? 'border-[#E5E3DC] dark:border-white/15 bg-white dark:bg-[#0B2242]'
                    : 'border-[#F2DCC1] dark:border-[#4A3522] bg-white dark:bg-[#241B13]'
                }`}
              >
                {districts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-[11px] font-semibold mb-1 ${
                  isHome ? 'text-[#252525] dark:text-[#DCEEFF]' : 'text-[#26364B] dark:text-[#F5E6D3]'
                }`}
              >
                {tr(language, 'শহর / ব্লক (ঐচ্ছিক)', 'शहर / ब्लॉक (वैकल्पिक)', 'Town / Block (Optional)')}
              </label>
              <input
                type="text"
                value={draft.location.city}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value },
                  }))
                }
                placeholder={tr(language, 'যেমন: তমলুক, হলদিয়া', 'जैसे: तमलुक, हल्दिया', 'e.g. Tamluk, Haldia')}
                className={`w-full rounded-lg border px-2.5 py-2 text-xs ${
                  isHome
                    ? 'border-[#E5E3DC] dark:border-white/15 bg-white dark:bg-[#0B2242]'
                    : 'border-[#F2DCC1] dark:border-[#4A3522] bg-white dark:bg-[#241B13]'
                }`}
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                  isHome
                    ? 'border-[#176B4D]/40 text-[#176B4D] dark:text-[#36E7F2] bg-white dark:bg-[#0B2242] hover:bg-[#EBF4F0]'
                    : 'border-[#F4A340] text-[#26364B] dark:text-[#FFD19A] bg-white dark:bg-[#241B13] hover:bg-[#FFE5C2] dark:hover:bg-[#382616]'
                }`}
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>
                  {locating
                    ? tr(language, 'খোঁজা হচ্ছে...', 'खोजा जा रहा है...', 'Detecting...')
                    : tr(language, 'GPS ব্যবহার করুন', 'GPS का उपयोग करें', 'Use GPS (Optional)')}
                </span>
              </button>
            </div>
          </div>

          {/* Education & Employment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-[11px] font-semibold mb-1 ${
                  isHome ? 'text-[#252525] dark:text-[#DCEEFF]' : 'text-[#26364B] dark:text-[#F5E6D3]'
                }`}
              >
                {tr(language, 'শিক্ষাগত যোগ্যতা', 'शैक्षणिक योग्यता', 'Education Level')}
              </label>
              <select
                value={draft.education}
                onChange={(e) => setDraft((prev) => ({ ...prev, education: e.target.value }))}
                className={`w-full rounded-lg border px-2.5 py-2 text-xs ${
                  isHome
                    ? 'border-[#E5E3DC] dark:border-white/15 bg-white dark:bg-[#0B2242]'
                    : 'border-[#F2DCC1] dark:border-[#4A3522] bg-white dark:bg-[#241B13]'
                }`}
              >
                <option value="">{tr(language, 'নির্বাচন করুন (ঐচ্ছিক)', 'चुनें (वैकल्पिक)', 'Select (Optional)')}</option>
                <option value="up_to_10th">{tr(language, 'মাধ্যমিক / ১০ম শ্রেণি পর্যন্ত', '10वीं तक', 'Up to Class 10')}</option>
                <option value="12th_pass">{tr(language, 'উচ্চমাধ্যমিক / ১২শ পাস', '12वीं पास', 'Class 12 Pass')}</option>
                <option value="iti_diploma">{tr(language, 'ITI / ডিপ্লোমা / বৃত্তিমূলক', 'ITI / डिप्लोमा', 'ITI / Vocational Diploma')}</option>
                <option value="graduate">{tr(language, 'স্নাতক বা তদূর্ধ্ব', 'स्नातक या उच्चतर', 'Graduate & Above')}</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-[11px] font-semibold mb-1 ${
                  isHome ? 'text-[#252525] dark:text-[#DCEEFF]' : 'text-[#26364B] dark:text-[#F5E6D3]'
                }`}
              >
                {tr(language, 'বর্তমান কাজের অবস্থা', 'वर्तमान स्थिति', 'Current Employment Status')}
              </label>
              <select
                value={draft.employmentStatus}
                onChange={(e) => setDraft((prev) => ({ ...prev, employmentStatus: e.target.value }))}
                className={`w-full rounded-lg border px-2.5 py-2 text-xs ${
                  isHome
                    ? 'border-[#E5E3DC] dark:border-white/15 bg-white dark:bg-[#0B2242]'
                    : 'border-[#F2DCC1] dark:border-[#4A3522] bg-white dark:bg-[#241B13]'
                }`}
              >
                <option value="">{tr(language, 'নির্বাচন করুন (ঐচ্ছিক)', 'चुनें (वैकल्पिक)', 'Select (Optional)')}</option>
                <option value="student">{tr(language, 'ছাত্র / ছাত্রী', 'छात्र / छात्रा', 'Student')}</option>
                <option value="seeking_job">{tr(language, 'কাজ বা চাকরি খুঁজছি', 'नौकरी की तलाश में', 'Seeking Employment')}</option>
                <option value="self_employed">{tr(language, 'ক্ষুদ্র ব্যবসা / স্ব-নিযুক্ত', 'स्वरोजगार / छोटा व्यवसाय', 'Self-Employed / Micro-Business')}</option>
                <option value="homemaker">{tr(language, 'গৃহবধূ (গৃহভিত্তিক আয় আগ্রহী)', 'गृहिणी (घरेलू आय में रुचि)', 'Homemaker (Home-Based Income)')}</option>
                <option value="worker">{tr(language, 'কর্মী / কারিগর / দৈনিক মজুরি', 'कर्मचारी / कारीगर', 'Worker / Artisan')}</option>
              </select>
            </div>
          </div>

          {/* Primary Goals */}
          <div>
            <p
              className={`text-[11px] font-semibold mb-1.5 ${
                isHome ? 'text-[#252525] dark:text-[#DCEEFF]' : 'text-[#26364B] dark:text-[#F5E6D3]'
              }`}
            >
              {tr(language, 'আপনার মূল লক্ষ্য (একাধিক বাছতে পারেন)', 'आपके मुख्य लक्ष्य (एक या अधिक चुनें)', 'Your Main Goals (Select one or more)')}
            </p>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => {
                const active = draft.careerGoals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleArrayItem('careerGoals', g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? isHome
                          ? 'bg-[#176B4D] text-white border-[#176B4D]'
                          : 'jenova-saffron-btn border-[#F4A340]'
                        : isHome
                          ? 'bg-white dark:bg-[#0B2242] text-[#5C5C58] dark:text-[#DCEEFF] border-[#E5E3DC] dark:border-white/15'
                          : 'bg-white dark:bg-[#241B13] text-[#454545] dark:text-[#E5D3BE] border-[#F2DCC1] dark:border-[#4A3522] hover:bg-[#FFE5C2]'
                    }`}
                  >
                    {tr(language, g.bn, g.hi, g.en)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills / Business Interests */}
          <div>
            <p
              className={`text-[11px] font-semibold mb-1.5 ${
                isHome ? 'text-[#252525] dark:text-[#DCEEFF]' : 'text-[#26364B] dark:text-[#F5E6D3]'
              }`}
            >
              {tr(language, 'আগ্রহ বা দক্ষতার ক্ষেত্র', 'रुचि या कौशल क्षेत्र', 'Skills or Business Interests')}
            </p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((item) => {
                const active = draft.businessInterests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleArrayItem('businessInterests', item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? isHome
                          ? 'bg-[#092B55] dark:bg-[#36E7F2] text-white dark:text-[#092B55] border-[#092B55]'
                          : 'bg-[#FFD19A] dark:bg-[#F4A340] text-[#26364B] border-[#F4A340]'
                        : isHome
                          ? 'bg-white dark:bg-[#0B2242] text-[#5C5C58] dark:text-[#DCEEFF] border-[#E5E3DC] dark:border-white/15'
                          : 'bg-white dark:bg-[#241B13] text-[#454545] dark:text-[#E5D3BE] border-[#F2DCC1] dark:border-[#4A3522] hover:bg-[#FFE5C2]'
                    }`}
                  >
                    {tr(language, item.bn, item.hi, item.en)}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`flex flex-wrap items-center justify-between gap-3 pt-2 border-t ${
              isHome ? 'border-[#E5E3DC] dark:border-white/10' : 'border-[#F2DCC1] dark:border-[#3F2E1E]'
            }`}
          >
            <button
              type="button"
              onClick={async () => {
                await resetProfile();
                setEditorOpen(false);
                showToast(
                  tr(language, 'প্রোফাইল রিসেট হয়েছে।', 'प्रोफ़ाइल रीसेट हो गई।', 'Preferences reset to defaults.')
                );
              }}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:text-red-700 cursor-pointer ${
                isHome ? 'text-[#5C5C58]' : 'text-[#454545] dark:text-[#DDD2C5]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{tr(language, 'রিসেট করুন', 'रीसेट करें', 'Reset Preferences')}</span>
            </button>

            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                isHome ? 'bg-[#176B4D] hover:bg-[#11533B] text-white' : 'jenova-saffron-btn'
              }`}
            >
              {tr(language, 'সুপারিশ আপডেট করুন', 'सिफारिशें अपडेट करें', 'Save & Personalise')}
            </button>
          </div>
        </form>
      )}

      {/* Explainable Personalised Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shownRecs.map((rec) => (
          <button
            key={rec.id}
            type="button"
            onClick={() => navigate(rec.path)}
            className={`text-left p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 cursor-pointer group ${
              isHome
                ? 'bg-[#FAF9F5] dark:bg-[#071A34] border-[#E5E3DC] dark:border-white/15 hover:border-[#176B4D] dark:hover:border-[#36E7F2]'
                : 'bg-[#FFF1DF] dark:bg-[#221911] border-[#F2DCC1] dark:border-[#3F2E1E] hover:border-[#F4A340]'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    isHome
                      ? 'bg-[#EBF4F0] dark:bg-[#176B4D]/30 text-[#11533B] dark:text-[#6CF4FC]'
                      : 'bg-[#FFE5C2] dark:bg-[#382616] text-[#26364B] dark:text-[#FFD19A]'
                  }`}
                >
                  {rec.badge}
                </span>
                <Compass className="w-3.5 h-3.5 text-[#85847C]" />
              </div>
              <h3
                className={`text-sm font-bold line-clamp-2 ${
                  isHome
                    ? 'text-[#252525] dark:text-white group-hover:text-[#176B4D] dark:group-hover:text-[#36E7F2]'
                    : 'text-[#26364B] dark:text-[#FFF5E8] group-hover:text-[#A85B0A] dark:group-hover:text-[#FFD19A]'
                }`}
              >
                {rec.title}
              </h3>
              <p
                className={`text-xs line-clamp-2 ${
                  isHome ? 'text-[#5C5C58] dark:text-[#B9D8F7]' : 'text-[#454545] dark:text-[#DDD2C5]'
                }`}
              >
                {rec.subtitle}
              </p>
            </div>

            <div
              className={`pt-2.5 border-t space-y-1.5 ${
                isHome ? 'border-[#E5E3DC] dark:border-white/10' : 'border-[#F2DCC1] dark:border-[#3F2E1E]'
              }`}
            >
              <p
                className={`text-[11px] font-medium leading-snug ${
                  isHome ? 'text-[#176B4D] dark:text-[#FFC45C]' : 'text-[#A85B0A] dark:text-[#FFD19A]'
                }`}
              >
                <span className="font-bold">
                  {tr(language, 'কেন এটি দেখানো হয়েছে:', 'क्यों सुझाया गया:', 'Why for you:')}{' '}
                </span>
                {rec.reason}
              </p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold ${
                  isHome ? 'text-[#092B55] dark:text-[#36E7F2]' : 'text-[#26364B] dark:text-[#FFD19A]'
                }`}
              >
                {tr(language, 'এগিয়ে যান', 'आगे बढ़ें', 'Explore')}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
