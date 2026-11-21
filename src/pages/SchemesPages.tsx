import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckSquare,
  ClipboardCheck,
  Compass,
  FileCheck2,
  Info,
  MapPin,
  Search,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  localizeSchemeCategory,
  localizeScope,
  localizeVerdict,
  pickText,
  tr,
} from '../i18n/translations';
import { apiFetch, readOfflineCache, trackAnalyticsEvent, writeOfflineCache } from '../lib/api';
import type { EligibilityVerdict, SchemeCategory, WelfareScheme } from '../types/platform';
import {
  ActionToolbar,
  PageHeader,
  ResilientImage,
  VerificationLabel,
} from '../components/SharedUI';
import { ReadAloudButton } from '../components/VoiceAccessibility';
import { JenovaSchemesLogo } from '../components/JenovaIcons3D';
import { VISUAL_ASSETS } from '../lib/visualAssets';

const SCHEME_CATEGORIES: SchemeCategory[] = [
  'Education',
  'Scholarships',
  'Women Empowerment',
  'Employment',
  'Healthcare',
  'Housing',
  'Agriculture',
  'Social Security',
  'Skill Development',
  'MSME Support',
];

export function SchemesDirectoryPage() {
  const { language, theme, t, navigate } = useApp();
  const [schemes, setSchemes] = useState<WelfareScheme[]>(() =>
    readOfflineCache<WelfareScheme[]>('schemes_list', [])
  );
  const [loading, setLoading] = useState(schemes.length === 0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [scope, setScope] = useState<'ALL' | 'West Bengal' | 'Central India'>('ALL');

  // Scheme Discovery Assistant state
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [gender, setGender] = useState<'any' | 'female' | 'male'>('any');
  const [age, setAge] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('any');
  const [wbResident, setWbResident] = useState<boolean>(true);
  const [assistantApplied, setAssistantApplied] = useState(false);

  useEffect(() => {
    apiFetch<{ schemes: WelfareScheme[] }>('/api/schemes')
      .then((res) => {
        setSchemes(res.schemes);
        writeOfflineCache('schemes_list', res.schemes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const evaluateScheme = (
    sch: WelfareScheme
  ): { verdict: EligibilityVerdict; reason: string } | null => {
    if (!assistantApplied) return null;
    const p = sch.eligibilityProfile;
    const parsedAge = Number(age);
    const hasAge = age.trim().length > 0 && !Number.isNaN(parsedAge);

    if (!wbResident && p.westBengalResidentOnly) {
      return {
        verdict: 'Important Requirements Not Met',
        reason:
          language === 'bn'
            ? 'এই প্রকল্পটি সাধারণত পশ্চিমবঙ্গের স্থায়ী বাসিন্দাদের জন্য প্রযোজ্য।'
            : language === 'hi'
              ? 'यह योजना सामान्यतः पश्चिम बंगाल के स्थायी निवासियों के लिए लागू है।'
              : 'This scheme generally requires West Bengal residency.',
      };
    }
    if (gender !== 'any' && !p.genders.includes('all') && !p.genders.includes(gender)) {
      return {
        verdict: 'Important Requirements Not Met',
        reason:
          language === 'bn'
            ? 'এই প্রকল্পটি নির্দিষ্ট আবেদনকারী শ্রেণির জন্য নির্ধারিত।'
            : language === 'hi'
              ? 'आवेदक वर्ग इस योजना की मुख्य पात्रता श्रेणी से मेल नहीं खाता।'
              : 'Applicant group does not match the primary target category of this scheme.',
      };
    }
    if (hasAge && ((p.minAge && parsedAge < p.minAge) || (p.maxAge && parsedAge > p.maxAge))) {
      return {
        verdict: 'Important Requirements Not Met',
        reason:
          language === 'bn'
            ? `সাধারণ বয়সসীমা (${p.minAge || '—'}–${p.maxAge || '—'} বছর) এর সাথে বর্তমান বয়স মিলছে না।`
            : language === 'hi'
              ? `दर्ज आयु (${parsedAge}) इस योजना की सामान्य आयु सीमा (${p.minAge || '—'}–${p.maxAge || '—'} वर्ष) से बाहर है।`
              : `Entered age (${parsedAge}) falls outside the typical scheme age band (${p.minAge || '—'}–${p.maxAge || '—'} yrs).`,
      };
    }
    if (!hasAge && (p.minAge || p.maxAge)) {
      return {
        verdict: 'More Information Required',
        reason:
          language === 'bn'
            ? 'সঠিক ধারণা পেতে অনুগ্রহ করে বয়স লিখুন।'
            : language === 'hi'
              ? 'सही जानकारी के लिए कृपया ऊपर अपनी आयु दर्ज करें।'
              : 'Enter age above to check the scheme age band.',
      };
    }
    if (
      occupation !== 'any' &&
      !p.occupations.includes('all') &&
      !p.occupations.includes(occupation as never)
    ) {
      return {
        verdict: 'Confirm With Official Authority',
        reason:
          language === 'bn'
            ? 'আপনার পেশার সাথে প্রকল্পের ব্যতিক্রম শর্ত অফিসিয়াল পোর্টালে যাচাই করুন।'
            : language === 'hi'
              ? 'पेशे से जुड़े विशेष नियम लागू हो सकते हैं — आधिकारिक पोर्टल या BSK पर जांचें।'
              : 'Occupation-specific rules may apply — confirm directly on the official portal or BSK.',
      };
    }
    return {
      verdict: 'Potentially Eligible',
      reason:
        language === 'bn'
          ? 'প্রাথমিক তথ্য অনুযায়ী আপনি যোগ্য হতে পারেন। চূড়ান্ত অনুমোদন কেবল সরকারি কর্তৃপক্ষ দেয়।'
          : language === 'hi'
            ? 'प्रारंभिक जानकारी के अनुसार आप पात्र हो सकते हैं। अंतिम निर्णय केवल सरकारी विभाग द्वारा किया जाता है।'
            : 'Matches basic profile filters. Final eligibility is always decided by the official government authority.',
    };
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: schemes.length };
    for (const cat of SCHEME_CATEGORIES) counts[cat] = 0;
    for (const sch of schemes) {
      counts[sch.category] = (counts[sch.category] || 0) + 1;
    }
    return counts;
  }, [schemes]);

  const filtered = useMemo(() => {
    return schemes.filter((sch) => {
      if (category !== 'ALL' && sch.category !== category) return false;
      if (scope !== 'ALL' && sch.scope !== scope) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${sch.officialName.en} ${sch.officialName.bn} ${sch.officialName.hi} ${sch.department.en} ${sch.category} ${sch.description.en}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [schemes, category, scope, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl bg-gradient-to-r from-[#FFF1DF] via-white to-[#FFE5C2]/65 dark:from-[#261B12] dark:via-[#241B13] dark:to-[#2D1E12] border border-[#F2DCC1] dark:border-[#4A3522] p-5 sm:p-6 shadow-sm mb-6">
        <JenovaSchemesLogo
          size="lg"
          theme={theme}
          subtitle={
            language === 'bn'
              ? 'সরকারি প্রকল্প অনুসন্ধান ও অফিসিয়াল পোর্টাল গাইড'
              : language === 'hi'
                ? 'सरकारी योजना खोज एवं आधिकारिक पोर्टल गाइड'
                : 'Verified Government Welfare & Eligibility Guide'
          }
        />
      </div>

      <PageHeader
        title={
          language === 'bn'
            ? 'JENOVA Schemes — সরকারি কল্যাণমূলক প্রকল্প নির্দেশিকা'
            : language === 'hi'
              ? 'JENOVA Schemes — सरकारी कल्याणकारी योजना निर्देशिका'
              : 'JENOVA Schemes — Government Scheme Discovery & Guidance'
        }
        subtitle={
          language === 'bn'
            ? 'পশ্চিমবঙ্গ ও ভারত সরকারের যাচাইকৃত প্রকল্পসমূহ। প্রতিটি প্রকল্প সরাসরি অফিসিয়াল সরকারি ওয়েবসাইটের সাথে যুক্ত।'
            : language === 'hi'
              ? 'पश्चिम बंगाल और भारत सरकार की सत्यापित जन-कल्याणकारी योजनाएं, सीधे आधिकारिक सरकारी पोर्टल लिंक और दस्तावेज़ सूची के साथ।'
              : 'Verified West Bengal and Government of India public welfare schemes with official portal links, document checklists, and a scheme discovery helper.'
        }
      />

      {/* Neutral 3D Community Welfare Visual Banner */}
      <div className="rounded-xl bg-white border border-[#F2DCC1] overflow-hidden mb-8 grid grid-cols-1 lg:grid-cols-12 items-center">
        <ResilientImage
          src={VISUAL_ASSETS.schemesCommunityWelfare.src}
          alt={VISUAL_ASSETS.schemesCommunityWelfare.alt}
          containerClassName="lg:col-span-5 aspect-[16/9] lg:aspect-auto lg:h-full w-full"
        />
        <div className="lg:col-span-7 p-6 space-y-2.5">
          <p className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
            {language === 'bn'
              ? 'শিক্ষা · স্বাস্থ্য · নারী ক্ষমতায়ন · কৃষক সহায়তা · আবাসন · সামাজিক সুরক্ষা'
              : language === 'hi'
                ? 'शिक्षा · स्वास्थ्य · महिला सशक्तिकरण · किसान सहायता · आवास · सामाजिक सुरक्षा'
                : 'Education · Healthcare · Women Empowerment · Farmers · Housing · Social Security'}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-[#26364B]">
            {language === 'bn'
              ? 'সরকারি প্রকল্পের সহজ তথ্য, সরাসরি অফিসিয়াল পোর্টালে'
              : language === 'hi'
                ? 'सरकारी योजनाओं की सरल जानकारी, सीधे आधिकारिक पोर्टल पर'
                : 'Clear Citizen Summaries Linking Directly to Official Portals'}
          </h2>
          <p className="text-sm text-[#454545] leading-relaxed">
            {language === 'bn'
              ? 'প্রতিটি প্রকল্পের সাথে প্রয়োজনীয় কাগজপত্রের তালিকা এবং সরাসরি পশ্চিমবঙ্গ বা ভারত সরকারের অফিসিয়াল পোর্টাল লিঙ্ক দেওয়া আছে — কোনো দালাল ছাড়া।'
              : language === 'hi'
                ? 'प्रत्येक योजना के साथ आवश्यक दस्तावेज़ों की सूची और सीधे पश्चिम बंगाल या भारत सरकार के आधिकारिक पोर्टल का लिंक दिया गया है — बिना किसी बिचौलिए के।'
                : 'Every entry lists commonly required documents and directs you straight to the official West Bengal or Government of India portal — never through unverified middlemen.'}
          </p>
        </div>
      </div>

      {/* Scheme Discovery Assistant */}
      <section className="rounded-xl bg-white border border-[#F2DCC1] mb-8 overflow-hidden">
        <div className="px-6 py-4 bg-[#FFE5C2] border-b border-[#F4A340]/15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#26364B] dark:text-[#FFD19A]">
                {language === 'bn'
                  ? 'প্রকল্প অনুসন্ধান সহায়ক (Scheme Discovery Assistant)'
                  : language === 'hi'
                    ? 'योजना खोज सहायक (Scheme Discovery Assistant)'
                    : 'Scheme Discovery Assistant'}
              </h2>
              <p className="text-xs text-[#A85B0A] dark:text-[#FFD19A]">
                {language === 'bn'
                  ? 'সাধারণ তথ্য নির্বাচন করে সম্ভাব্য প্রাসঙ্গিক প্রকল্প দেখুন (এটি সরকারি যোগ্যতার চূড়ান্ত নিশ্চয়তা নয়)।'
                  : language === 'hi'
                    ? 'अपनी सामान्य जानकारी चुनकर संभावित उपयुक्त योजनाएं देखें (यह अंतिम सरकारी पात्रता की गारंटी नहीं है)।'
                    : 'Filter potentially relevant schemes based on basic profile options. This tool does NOT determine official government eligibility.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAssistantOpen((v) => !v)}
            className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline whitespace-nowrap cursor-pointer"
          >
            {assistantOpen
              ? tr(language, 'লুকান', 'छिपाएं', 'Hide')
              : tr(language, 'খুলুন', 'खोलें', 'Open')}
          </button>
        </div>

        {assistantOpen && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#26364B] mb-1">
                  {tr(language, 'লিঙ্গ', 'लिंग', 'Gender')}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as typeof gender)}
                  className="w-full rounded-lg border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2 text-sm"
                >
                  <option value="any">{tr(language, 'যেকোনো', 'कोई भी', 'Any')}</option>
                  <option value="female">{tr(language, 'মহিলা / নারী', 'महिला', 'Female / Woman')}</option>
                  <option value="male">{tr(language, 'পুরুষ', 'पुरुष', 'Male')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#26364B] mb-1">
                  {tr(language, 'বয়স (বছর)', 'आयु (वर्ष)', 'Age (Years)')}
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={tr(language, 'যেমন: 24', 'जैसे: 24', 'e.g. 24')}
                  className="w-full rounded-lg border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#26364B] mb-1">
                  {tr(language, 'মূল পেশা / ভূমিকা', 'मुख्य व्यवसाय / भूमिका', 'Primary Role / Occupation')}
                </label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2 text-sm"
                >
                  <option value="any">{tr(language, 'যেকোনো', 'कोई भी', 'Any')}</option>
                  <option value="student">{tr(language, 'ছাত্র / ছাত্রী', 'छात्र / छात्रा', 'Student')}</option>
                  <option value="unemployed">{tr(language, 'কর্মপ্রার্থী যুবক/যুবতী', 'बेरोजगार युवा', 'Unemployed Youth')}</option>
                  <option value="homemaker">{tr(language, 'গৃহবধূ / মহিলা', 'गृहिणी / महिला', 'Homemaker / Woman')}</option>
                  <option value="daily_wage">
                    {tr(language, 'দৈনিক মজুরি / অসংগঠিত শ্রমিক', 'दैनिक मजदूर / असंगठित श्रमिक', 'Daily-Wage / Unorganised Worker')}
                  </option>
                  <option value="farmer">{tr(language, 'কৃষক / ভাগচাষি', 'किसान / बटाईदार', 'Farmer / Sharecropper')}</option>
                  <option value="small_business">
                    {tr(language, 'ক্ষুদ্র ব্যবসায়ী / কারিগর', 'छोटे व्यवसायी / कारीगर', 'Small Business / Artisan')}
                  </option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="inline-flex items-center gap-2 text-sm text-[#26364B] py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wbResident}
                    onChange={(e) => setWbResident(e.target.checked)}
                    className="accent-[#F4A340] w-4 h-4"
                  />
                  <span>
                    {tr(language, 'পশ্চিমবঙ্গের বাসিন্দা', 'पश्चिम बंगाल निवासी', 'West Bengal Resident')}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F2DCC1]">
              <p className="text-xs text-[#454545] inline-flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#A85B0A] dark:text-[#FFD19A] shrink-0" />
                <span>
                  {tr(
                    language,
                    'কেবল সম্ভাব্য প্রাসঙ্গিক প্রকল্প দেখানো হয়। অফিসিয়াল নিয়ম সর্বদা সংযুক্ত সরকারি ওয়েবসাইট বা BDO / দুয়ারে সরকার অফিসে যাচাই করুন।',
                    'केवल संभावित उपयुक्त योजनाएं दिखाई जाती हैं। आधिकारिक नियम हमेशा संबंधित सरकारी वेबसाइट या BDO / सहायता केंद्र पर जांचें।',
                    'Shows potentially relevant schemes only. Always verify official rules at the linked government website or BDO / Duare Sarkar office.'
                  )}
                </span>
              </p>
              <div className="flex items-center gap-2.5">
                {assistantApplied && (
                  <button
                    type="button"
                    onClick={() => {
                      setAssistantApplied(false);
                      setGender('any');
                      setAge('');
                      setOccupation('any');
                      setWbResident(true);
                    }}
                    className="px-3.5 py-2 text-xs font-medium text-[#454545] hover:text-[#26364B] cursor-pointer"
                  >
                    {tr(language, 'রিসেট', 'रीसेट', 'Reset')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAssistantApplied(true)}
                  className="px-4 py-2 text-xs font-semibold jenova-saffron-btn rounded-lg cursor-pointer"
                >
                  {tr(
                    language,
                    'সম্ভাব্য প্রাসঙ্গিক প্রকল্প দেখুন',
                    'संभावित उपयुक्त योजनाएं देखें',
                    'Show Potentially Relevant Schemes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Search & Category Filter */}
      <div className="p-5 rounded-xl bg-white border border-[#F2DCC1] mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#665B4F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#F2DCC1] text-sm bg-[#FFF1DF] focus:bg-white"
            />
          </div>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
            className="rounded-lg border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2.5 text-sm"
          >
            <option value="ALL">
              {tr(language, 'পশ্চিমবঙ্গ ও কেন্দ্রীয় সরকার', 'पश्चिम बंगाल एवं केंद्र सरकार', 'West Bengal & Central India')}
            </option>
            <option value="West Bengal">
              {tr(language, 'পশ্চিমবঙ্গ রাজ্য প্রকল্প', 'पश्चिम बंगाल राज्य योजनाएं', 'West Bengal State Schemes')}
            </option>
            <option value="Central India">
              {tr(language, 'কেন্দ্রীয় সরকারি প্রকল্প', 'केंद्र सरकार की योजनाएं', 'Central Government Schemes')}
            </option>
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F2DCC1]">
          <button
            type="button"
            onClick={() => setCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
              category === 'ALL'
                ? 'jenova-saffron-btn'
                : 'bg-[#FFF1DF] text-[#454545] hover:text-[#26364B]'
            }`}
          >
            {t.common.all} ({categoryCounts.ALL || 0})
          </button>
          {SCHEME_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
                category === cat
                  ? 'jenova-saffron-btn'
                  : 'bg-[#FFF1DF] text-[#454545] hover:text-[#26364B]'
              }`}
            >
              {localizeSchemeCategory(cat, language)} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Results */}
      {loading ? (
        <p className="text-sm text-[#454545] py-12 text-center">{t.common.loading}</p>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-xl bg-white border border-[#F2DCC1] text-center space-y-3">
          <p className="text-sm text-[#454545]">{t.common.noResults}</p>
          <button
            type="button"
            onClick={() => {
              setCategory('ALL');
              setScope('ALL');
              setSearch('');
            }}
            className="px-4 py-2 text-xs font-semibold jenova-saffron-btn rounded-lg cursor-pointer"
          >
            {tr(language, 'সব ফিল্টার রিসেট করুন', 'सभी फ़िल्टर रीसेट करें', 'Reset Filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((sch) => (
            <article
              key={sch.id}
              className="p-6 rounded-xl bg-white border border-[#F2DCC1] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#454545] mb-2">
                  <span>
                    {localizeScope(sch.scope, language)} · {localizeSchemeCategory(sch.category, language)}
                  </span>
                  <VerificationLabel status={sch.verificationStatus} />
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/schemes/${sch.id}`)}
                  className="text-left text-lg font-bold text-[#26364B] hover:text-[#A85B0A] dark:hover:text-[#FFD19A] transition-colors cursor-pointer"
                >
                  {pickText(sch.officialName, language)}
                </button>
                <p className="text-xs text-[#454545] mt-1">{pickText(sch.department, language)}</p>
                <p className="text-sm text-[#454545] mt-3 leading-relaxed">
                  {pickText(sch.description, language)}
                </p>

                <div className="mt-4 p-3.5 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] text-xs space-y-1.5">
                  <p className="font-semibold text-[#26364B]">
                    {tr(language, 'প্রধান সুবিধা:', 'मुख्य लाभ:', 'Key Benefits:')}
                  </p>
                  <p className="text-[#454545] leading-relaxed">{pickText(sch.benefits, language)}</p>
                </div>

                {(() => {
                  const evalRes = evaluateScheme(sch);
                  if (!evalRes) return null;
                  const tone =
                    evalRes.verdict === 'Potentially Eligible'
                      ? 'bg-[#E9F5EF] dark:bg-[#143022] border-[#27845B]/40 text-[#1F6A49] dark:text-[#7DE0B0]'
                      : evalRes.verdict === 'Important Requirements Not Met'
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : 'bg-[#FEF4E6] border-[#F4A340]/50 text-[#6B3F06]';
                  return (
                    <div className={`mt-3 p-3 rounded-lg border text-xs space-y-0.5 ${tone}`}>
                      <p className="font-bold">{localizeVerdict(evalRes.verdict, language)}</p>
                      <p className="leading-relaxed opacity-90">{evalRes.reason}</p>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#665B4F]">
                  <span>
                    {t.common.lastVerified}: {sch.dateVerified}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/schemes/${sch.id}`)}
                    className="font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
                  >
                    {tr(language, 'নথি ও আবেদন প্রক্রিয়া →', 'दस्तावेज़ और प्रक्रिया →', 'Documents & Process →')}
                  </button>
                </div>

                <ActionToolbar
                  itemType="scheme"
                  itemId={sch.id}
                  title={pickText(sch.officialName, language)}
                  shareSummary={`${pickText(sch.department, language)} | Official Portal: ${sch.officialWebsite}`}
                  sharePath={`/schemes/${sch.id}`}
                  externalUrl={sch.officialWebsite}
                  externalLabel={t.common.officialPortal}
                  onExternalClick={() => trackAnalyticsEvent('scheme_referral', sch.id)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function SchemeDetailsPage({ schemeId }: { schemeId: string }) {
  const { language, t, navigate } = useApp();
  const [scheme, setScheme] = useState<WelfareScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<{
    reply: string;
    sourceName: string;
    officialWebsite: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    setLoading(true);
    setAiAnswer(null);
    setAiError('');
    apiFetch<{ scheme: WelfareScheme }>(`/api/schemes/${schemeId}`)
      .then((res) => setScheme(res.scheme))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [schemeId]);

  const askSchemeAi = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || !scheme || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    setAiQuestion(trimmed);
    try {
      const res = await apiFetch<{
        reply: string;
        sourceName: string;
        officialWebsite: string;
      }>('/api/ai/scheme-explain', {
        method: 'POST',
        body: JSON.stringify({
          schemeId: scheme.id,
          question: trimmed,
          language,
        }),
      });
      setAiAnswer(res);
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : tr(
              language,
              'এই মুহূর্তে AI ব্যাখ্যা উপলব্ধ নয়। অনুগ্রহ করে উপরের যাচাইকৃত নির্দেশিকা দেখুন।',
              'इस समय AI योजना विवरण उपलब्ध नहीं है। कृपया ऊपर दिए गए सत्यापित विवरण को देखें।',
              'AI Scheme Explanation is currently unavailable. Please refer to the verified guide above.'
            )
      );
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-sm text-[#454545]">{t.common.loading}</div>;
  }

  if (!scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <p className="font-semibold">
          {tr(language, 'প্রকল্পের তথ্য পাওয়া যায়নি।', 'योजना की जानकारी नहीं मिली।', 'Scheme information not found.')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/schemes')}
          className="text-sm font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
        >
          ← {t.common.back}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <button
        type="button"
        onClick={() => navigate('/schemes')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#454545] hover:text-[#A85B0A] dark:hover:text-[#FFD19A] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.common.back}</span>
      </button>

      {/* 9-Part Action-Oriented Scheme Guide */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#F2DCC1] space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#454545] mb-2">
              <span>
                {localizeScope(scheme.scope, language)} ·{' '}
                {localizeSchemeCategory(scheme.category, language)}
              </span>
              <span>·</span>
              <VerificationLabel status={scheme.verificationStatus} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#26364B]">
              {pickText(scheme.officialName, language)}
            </h1>
            <p className="mt-1 text-sm text-[#454545]">{pickText(scheme.department, language)}</p>
          </div>
          <ReadAloudButton
            lang={language}
            text={`${pickText(scheme.officialName, language)}. ${pickText(scheme.description, language)}. ${pickText(scheme.benefits, language)}. ${pickText(scheme.eligibilityRequirements, language)}`}
          />
        </div>

        {/* Immediate Practical Action Banner: JENOVA Checklist */}
        <div className="rounded-xl bg-[#FFE5C2] border border-[#F4A340]/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="w-6 h-6 text-[#A85B0A] dark:text-[#FFD19A] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm sm:text-base text-[#26364B] dark:text-[#FFD19A]">
                {tr(
                  language,
                  'JENOVA Checklist — অফিস বা BSK যাওয়ার আগে কাগজপত্র চেক করুন',
                  'JENOVA Checklist — कार्यालय या BSK जाने से पहले दस्तावेज़ जांचें',
                  'JENOVA Checklist — Check Your Documents Before Visiting Any Office'
                )}
              </p>
              <p className="text-xs text-[#A85B0A] dark:text-[#FFD19A] mt-0.5">
                {tr(
                  language,
                  'কোন কাগজ প্রস্তুত আর কোনটি বাকি তা টিক দিয়ে সেভ করুন ও প্রিন্ট নিন।',
                  'हर दस्तावेज़ को तैयार या अधूरा चिह्नित करें, जांच करें और प्रिंट/शेयर करें।',
                  'Mark each document Ready or Missing, run a quick preliminary check, and print/share your checklist.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/checklist/${scheme.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl jenova-saffron-btn text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer min-h-[44px]"
          >
            <span>
              {tr(
                language,
                'JENOVA Checklist শুরু করুন',
                'JENOVA Checklist खोलें',
                'Open JENOVA Checklist'
              )}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 1. What is this service? */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#26364B]">
            {tr(
              language,
              '১. এই প্রকল্পটি কী ও কী সুবিধা পাওয়া যায়?',
              '1. यह योजना क्या है और इसके मुख्य लाभ क्या हैं?',
              '1. What Is This Scheme & Key Benefits'
            )}
          </h2>
          <p className="text-sm text-[#454545] leading-relaxed">
            {pickText(scheme.description, language)}
          </p>
          <p className="text-sm font-medium text-[#26364B] dark:text-[#FFD19A] bg-[#FFF1DF] border border-[#F2DCC1] rounded-xl p-3.5 leading-relaxed">
            {pickText(scheme.benefits, language)}
          </p>
        </div>

        {/* 2. Who may qualify? */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#26364B]">
            {tr(
              language,
              '২. কারা আবেদন করার উপযুক্ত হতে পারেন?',
              '2. कौन पात्र हो सकते हैं? (आधिकारिक प्राधिकरण से पुष्टि करें)',
              '2. Who May Qualify? (Confirm With Official Authority)'
            )}
          </h2>
          <p className="text-sm text-[#454545] leading-relaxed">
            {pickText(scheme.eligibilityRequirements, language)}
          </p>
          <p className="text-xs text-[#6B3F06] bg-[#FEF4E6] border border-[#F4A340]/40 rounded-lg px-3.5 py-2">
            {tr(
              language,
              'দ্রষ্টব্য: JENOVA কোনো সরকারি দপ্তর নয় এবং ভাতা অনুমোদনের নিশ্চয়তা দেয় না। চূড়ান্ত যোগ্যতা কেবল অফিসিয়াল কর্তৃপক্ষ যাচাই করে।',
              'नोट: JENOVA केवल सरल मार्गदर्शन देता है और स्वीकृति की गारंटी नहीं देता। अंतिम पात्रता केवल आधिकारिक विभाग तय करता है।',
              'Note: JENOVA provides plain-language guidance only and cannot guarantee approval. Final eligibility is decided strictly by the official authority.'
            )}
          </p>
        </div>

        {/* 3. Documents Required */}
        <div className="p-5 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1] space-y-3">
          <h2 className="text-base font-bold text-[#26364B] inline-flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
            <span>
              {tr(
                language,
                '৩. সাধারণত প্রয়োজনীয় কাগজপত্র',
                '3. सामान्यतः आवश्यक दस्तावेज़',
                '3. Commonly Required Documents'
              )}
            </span>
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-[#26364B]">
            {scheme.requiredDocuments.map((doc) => (
              <li key={doc} className="inline-flex items-start gap-2">
                <CheckSquare className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. What to prepare before visiting */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#26364B]">
            {tr(
              language,
              '৪. যাওয়ার আগে যা অবশ্যই মিলিয়ে নেবেন',
              '4. आवेदन से पहले क्या तैयार रखें',
              '4. What to Prepare Before Applying'
            )}
          </h2>
          <ul className="space-y-1.5 text-sm text-[#454545] list-disc pl-5">
            <li>
              {tr(
                language,
                'আধার কার্ড, ভোটার/রেশন কার্ড ও ব্যাংক পাশবইয়ে আপনার নামের বানান ও জন্মতারিখ একই আছে কিনা মিলিয়ে নিন।',
                'सुनिश्चित करें कि आधार, पहचान पत्र और बैंक पासबुक में आपके नाम की वर्तनी और जन्मतिथि एक जैसी हो।',
                'Check that your name spelling and date of birth match across Aadhaar, ID proof, and Bank Passbook.'
              )}
            </li>
            <li>
              {tr(
                language,
                'ব্যাংক অ্যাকাউন্টটি চালু (Active) আছে এবং Aadhaar DBT / NPCI সিডিং করা আছে কিনা নিশ্চিত করুন।',
                'सुनिश्चित करें कि आपका एकल बैंक खाता सक्रिय है और आधार DBT / NPCI से जुड़ा है।',
                'Confirm your single-holder bank account is active and seeded with Aadhaar DBT / NPCI.'
              )}
            </li>
            <li>
              {tr(
                language,
                'মূল কপির সাথে অন্তত ২ সেট স্পষ্ট ফটোকপি ও সদ্য তোলা পাসপোর্ট ছবি রাখুন।',
                'मूल दस्तावेज़ों के साथ कम से कम 2 स्पष्ट फोटोकॉपी सेट और हाल की पासपोर्ट फोटो रखें।',
                'Carry originals along with 2 clear photocopy sets and recent passport-size photographs.'
              )}
            </li>
          </ul>
        </div>

        {/* 5 & 6. Next Step & Official Application Process */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#26364B]">
            {tr(
              language,
              '৫ ও ৬. পরবর্তী ধাপ ও অফিসিয়াল আবেদন প্রক্রিয়া',
              '5 व 6. अगला कदम और आधिकारिक आवेदन प्रक्रिया',
              '5 & 6. Next Step & Where to Apply Officially'
            )}
          </h2>
          <p className="text-sm text-[#454545] leading-relaxed">
            {pickText(scheme.applicationProcess, language)}
          </p>
        </div>

        {/* 7. Where to receive local assistance */}
        <div className="rounded-xl bg-[#FFF1DF] border border-[#F2DCC1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-[#26364B]">
                {tr(
                  language,
                  '৭. স্থানীয় সহায়তা কোথায় পাবেন?',
                  '7. स्थानीय सहायता कहां से प्राप्त करें?',
                  '7. Where to Get Local Assistance'
                )}
              </h2>
              <p className="text-xs text-[#454545] mt-0.5">
                {tr(
                  language,
                  'বাংলা সহায়তা কেন্দ্র (BSK), কমন সার্ভিস সেন্টার (CSC), জেলা/বিডিও পোর্টাল বা দুয়ারে সরকার ডিরেক্টরি দেখুন।',
                  'सत्यापित CSC डिजिटल सेवा, बांग्ला सहायता केंद्र (BSK), जिला/BDO पोर्टल और आधिकारिक हेल्पडेस्क देखें।',
                  'Find verified Bangla Sahayata Kendra (BSK), CSC Digital Seva desks, District/BDO portals, and official helpdesks.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/local-help')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#F4A340]/40 bg-white text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:bg-[#FFE5C2] whitespace-nowrap cursor-pointer"
          >
            <span>
              {tr(language, 'JENOVA Local দেখুন', 'JENOVA Local खोलें', 'Open JENOVA Local')}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8. What to Avoid (Fraud & Middleman Warning) */}
        <div className="rounded-xl bg-[#FEF4E6] border border-[#F4A340]/50 p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#A85B0A] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-[#6B3F06]">
            <p className="font-bold">
              {tr(
                language,
                '৮. কী এড়িয়ে চলবেন (প্রতারণা সতর্কতা)',
                '8. किससे बचें (धोखाधड़ी चेतावनी)',
                '8. What to Avoid (Scam Warning)'
              )}
            </p>
            <p>
              {tr(
                language,
                'সরকারি প্রকল্পের ফর্ম বা ভাতা পাইয়ে দেওয়ার নামে কখনোই কাউকে অগ্রিম টাকা, OTP বা UPI PIN দেবেন না। সন্দেহজনক মেসেজ পেলে আমাদের "JENOVA Protect" টুলে পরীক্ষা করুন।',
                'सरकारी योजनाओं के नाम पर कभी भी बिचौलियों को पैसे, OTP या UPI PIN न दें। संदिग्ध संदेश या लिंक मिलने पर JENOVA Protect में जांच करें।',
                'Never pay middlemen or share OTPs/UPI PINs for government welfare schemes. If you receive a suspicious scheme message or link, check it in JENOVA Protect.'
              )}
            </p>
            <button
              type="button"
              onClick={() => navigate('/scam-check')}
              className="text-xs font-bold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
            >
              {tr(language, 'JENOVA Protect খুলুন →', 'JENOVA Protect खोलें →', 'Open JENOVA Protect →')}
            </button>
          </div>
        </div>

        {/* Interactive AI Scheme Explanation (Grounded in Official Record) */}
        <div className="rounded-2xl bg-[#FFF1DF] border border-[#F2DCC1] p-5 space-y-4">
          <div className="flex items-start gap-2.5">
            <Bot className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-[#26364B]">
                {tr(
                  language,
                  'সহজ বাংলায় প্রকল্পটি বুঝুন (AI Scheme Guide)',
                  'सरल हिंदी में योजना समझें (AI Scheme Guide)',
                  'Ask About This Scheme in Plain Language (AI Scheme Guide)'
                )}
              </h2>
              <p className="text-xs text-[#454545] mt-0.5">
                {tr(
                  language,
                  'যেকোনো প্রশ্নে ট্যাপ করুন বা নিজে লিখুন। উত্তরটি কেবল উপরের যাচাইকৃত সরকারি তথ্যের ওপর ভিত্তি করে দেওয়া হয়।',
                  'किसी त्वरित प्रश्न पर टैप करें या अपना प्रश्न लिखें। उत्तर केवल ऊपर दिए गए सत्यापित आधिकारिक रिकॉर्ड पर आधारित हैं।',
                  'Tap a quick question or type your own. Answers are strictly grounded in this verified official record.'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(language === 'bn'
              ? [
                  'এই প্রকল্পটি কী?',
                  'কারা আবেদন করতে পারবেন?',
                  'কী কী কাগজপত্র লাগবে?',
                  'কীভাবে আবেদন করব?',
                  'স্থানীয় সহায়তা কোথায় পাব?',
                ]
              : language === 'hi'
                ? [
                    'यह योजना क्या है?',
                    'कौन आवेदन कर सकता है?',
                    'कौन से दस्तावेज़ चाहिए?',
                    'आवेदन कैसे करें?',
                    'स्थानीय सहायता कहां मिलेगी?',
                  ]
                : [
                    'What is this scheme?',
                    'Who can apply?',
                    'What documents are required?',
                    'How can I apply?',
                    'Where can I get local assistance?',
                  ]
            ).map((q) => (
              <button
                key={q}
                type="button"
                disabled={aiLoading}
                onClick={() => askSchemeAi(q)}
                className="px-3 py-2 rounded-lg bg-white border border-[#F2DCC1] hover:border-[#F4A340] hover:bg-[#FFE5C2] text-xs font-medium text-[#26364B] cursor-pointer transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              askSchemeAi(aiQuestion);
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder={tr(
                language,
                'এই প্রকল্প সম্পর্কে আপনার প্রশ্ন লিখুন...',
                'इस योजना के बारे में अपना सवाल लिखें...',
                'Ask a specific question about this scheme...'
              )}
              className="flex-1 rounded-xl border border-[#F2DCC1] bg-white px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={aiLoading || aiQuestion.trim().length < 3}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl jenova-saffron-btn text-xs font-semibold disabled:opacity-50 cursor-pointer whitespace-nowrap min-h-[42px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {aiLoading ? t.common.loading : tr(language, 'জিজ্ঞাসা করুন', 'पूछें', 'Ask')}
              </span>
            </button>
          </form>

          {aiError && (
            <div className="rounded-xl bg-[#FEF4E6] border border-[#F4A340]/50 px-4 py-3 text-xs text-[#6B3F06]">
              {aiError}
            </div>
          )}

          {aiAnswer && (
            <div className="rounded-xl bg-white border border-[#F4A340]/25 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
                  {tr(
                    language,
                    'যাচাইকৃত তথ্যের ভিত্তিতে উত্তর',
                    'सत्यापित जानकारी के आधार पर उत्तर',
                    'Grounded Plain-Language Answer'
                  )}
                </span>
                <ReadAloudButton compact lang={language} text={aiAnswer.reply} />
              </div>
              <p className="text-sm text-[#26364B] leading-relaxed whitespace-pre-wrap">
                {aiAnswer.reply}
              </p>
              <p className="text-[11px] text-[#454545] pt-2 border-t border-[#F2DCC1]">
                {t.common.sourceLabel}: {aiAnswer.sourceName} · {aiAnswer.officialWebsite}
              </p>
            </div>
          )}
        </div>

        {/* 9. Verification Source & Date */}
        <div className="pt-4 border-t border-[#F2DCC1] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#454545]">
          <div>
            <span className="text-[#665B4F]">9. {t.common.sourceLabel}: </span>
            <a
              href={scheme.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#A85B0A] dark:text-[#FFD19A] hover:underline"
            >
              {scheme.sourceName}
            </a>
          </div>
          <div>
            <span className="text-[#665B4F]">{t.common.lastVerified}: </span>
            <span className="font-medium text-[#26364B]">{scheme.dateVerified}</span>
          </div>
          <div>
            <span className="text-[#665B4F]">
              {tr(language, 'পরবর্তী পর্যালোচনা:', 'अगली समीक्षा तिथि:', 'Next Scheduled Review:')}{' '}
            </span>
            <span className="font-medium text-[#26364B]">{scheme.expiryDate}</span>
          </div>
        </div>

        <ActionToolbar
          itemType="scheme"
          itemId={scheme.id}
          title={pickText(scheme.officialName, language)}
          shareSummary={`${pickText(scheme.department, language)} | ${t.common.officialPortal}: ${scheme.officialWebsite}`}
          sharePath={`/schemes/${scheme.id}`}
          externalUrl={scheme.officialWebsite}
          externalLabel={tr(
            language,
            'অফিসিয়াল সরকারি ওয়েবসাইট খুলুন',
            'आधिकारिक सरकारी वेबसाइट खोलें',
            'Open Official Government Website'
          )}
          onExternalClick={() => trackAnalyticsEvent('scheme_referral', scheme.id)}
        />
      </div>
    </div>
  );
}
