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
import { pickText } from '../i18n/translations';
import { apiFetch, readOfflineCache, trackAnalyticsEvent, writeOfflineCache } from '../lib/api';
import type { EligibilityVerdict, SchemeCategory, WelfareScheme } from '../types/platform';
import {
  ActionToolbar,
  PageHeader,
  ResilientImage,
  VerificationLabel,
} from '../components/SharedUI';
import { ReadAloudButton } from '../components/VoiceAccessibility';
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
  const { language, t, navigate } = useApp();
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
            : 'This scheme generally requires West Bengal residency.',
      };
    }
    if (gender !== 'any' && !p.genders.includes('all') && !p.genders.includes(gender)) {
      return {
        verdict: 'Important Requirements Not Met',
        reason:
          language === 'bn'
            ? 'এই প্রকল্পটি নির্দিষ্ট আবেদনকারী শ্রেণির জন্য নির্ধারিত।'
            : 'Applicant group does not match the primary target category of this scheme.',
      };
    }
    if (hasAge && ((p.minAge && parsedAge < p.minAge) || (p.maxAge && parsedAge > p.maxAge))) {
      return {
        verdict: 'Important Requirements Not Met',
        reason:
          language === 'bn'
            ? `সাধারণ বয়সসীমা (${p.minAge || '—'}–${p.maxAge || '—'} বছর) এর সাথে বর্তমান বয়স মিলছে না।`
            : `Entered age (${parsedAge}) falls outside the typical scheme age band (${p.minAge || '—'}–${p.maxAge || '—'} yrs).`,
      };
    }
    if (!hasAge && (p.minAge || p.maxAge)) {
      return {
        verdict: 'More Information Required',
        reason:
          language === 'bn'
            ? 'সঠিক ধারণা পেতে অনুগ্রহ করে বয়স লিখুন।'
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
            : 'Occupation-specific rules may apply — confirm directly on the official portal or BSK.',
      };
    }
    return {
      verdict: 'Potentially Eligible',
      reason:
        language === 'bn'
          ? 'প্রাথমিক তথ্য অনুযায়ী আপনি যোগ্য হতে পারেন। চূড়ান্ত অনুমোদন কেবল সরকারি কর্তৃপক্ষ দেয়।'
          : 'Matches basic profile filters. Final eligibility is always decided by the official government authority.',
    };
  };

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
            : 'Verified West Bengal and Government of India public welfare schemes with official portal links, document checklists, and a scheme discovery helper.'
        }
      />

      {/* Neutral 3D Community Welfare Visual Banner */}
      <div className="rounded-xl bg-white border border-[#E5E3DC] overflow-hidden mb-8 grid grid-cols-1 lg:grid-cols-12 items-center">
        <ResilientImage
          src={VISUAL_ASSETS.schemesCommunityWelfare.src}
          alt={VISUAL_ASSETS.schemesCommunityWelfare.alt}
          containerClassName="lg:col-span-5 aspect-[16/9] lg:aspect-auto lg:h-full w-full"
        />
        <div className="lg:col-span-7 p-6 space-y-2.5">
          <p className="text-xs font-semibold text-[#176B4D]">
            {language === 'bn'
              ? 'শিক্ষা · স্বাস্থ্য · নারী ক্ষমতায়ন · কৃষক সহায়তা · আবাসন · সামাজিক সুরক্ষা'
              : 'Education · Healthcare · Women Empowerment · Farmers · Housing · Social Security'}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-[#252525]">
            {language === 'bn'
              ? 'সরকারি প্রকল্পের সহজ তথ্য, সরাসরি অফিসিয়াল পোর্টালে'
              : 'Clear Citizen Summaries Linking Directly to Official Portals'}
          </h2>
          <p className="text-sm text-[#5C5C58] leading-relaxed">
            Every entry lists commonly required documents and directs you straight to the official
            West Bengal or Government of India portal — never through unverified middlemen.
          </p>
        </div>
      </div>

      {/* Scheme Discovery Assistant */}
      <section className="rounded-xl bg-white border border-[#E5E3DC] mb-8 overflow-hidden">
        <div className="px-6 py-4 bg-[#EBF4F0] border-b border-[#176B4D]/15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#176B4D]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#11533B]">
                {language === 'bn'
                  ? 'প্রকল্প অনুসন্ধান সহায়ক (Scheme Discovery Assistant)'
                  : 'Scheme Discovery Assistant'}
              </h2>
              <p className="text-xs text-[#176B4D]">
                {language === 'bn'
                  ? 'সাধারণ তথ্য নির্বাচন করে সম্ভাব্য প্রাসঙ্গিক প্রকল্প দেখুন (এটি সরকারি যোগ্যতার চূড়ান্ত নিশ্চয়তা নয়)।'
                  : 'Filter potentially relevant schemes based on basic profile options. This tool does NOT determine official government eligibility.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAssistantOpen((v) => !v)}
            className="text-xs font-semibold text-[#176B4D] hover:underline whitespace-nowrap cursor-pointer"
          >
            {assistantOpen ? 'Hide' : 'Open'}
          </button>
        </div>

        {assistantOpen && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as typeof gender)}
                  className="w-full rounded-lg border border-[#E5E3DC] bg-[#FAF9F5] px-3 py-2 text-sm"
                >
                  <option value="any">Any</option>
                  <option value="female">Female / Woman</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">Age (Years)</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-full rounded-lg border border-[#E5E3DC] bg-[#FAF9F5] px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Primary Role / Occupation
                </label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E3DC] bg-[#FAF9F5] px-3 py-2 text-sm"
                >
                  <option value="any">Any</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Unemployed Youth</option>
                  <option value="homemaker">Homemaker / Woman</option>
                  <option value="daily_wage">Daily-Wage / Unorganised Worker</option>
                  <option value="farmer">Farmer / Sharecropper</option>
                  <option value="small_business">Small Business / Artisan</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="inline-flex items-center gap-2 text-sm text-[#252525] py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wbResident}
                    onChange={(e) => setWbResident(e.target.checked)}
                    className="accent-[#176B4D] w-4 h-4"
                  />
                  <span>West Bengal Resident</span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58] inline-flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
                <span>
                  Shows potentially relevant schemes only. Always verify official rules at the
                  linked government website or BDO / Duare Sarkar office.
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
                    className="px-3.5 py-2 text-xs font-medium text-[#5C5C58] hover:text-[#252525] cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAssistantApplied(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg cursor-pointer"
                >
                  Show Potentially Relevant Schemes
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Search & Category Filter */}
      <div className="p-5 rounded-xl bg-white border border-[#E5E3DC] mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#85847C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#E5E3DC] text-sm bg-[#FAF9F5] focus:bg-white"
            />
          </div>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
            className="rounded-lg border border-[#E5E3DC] bg-[#FAF9F5] px-3 py-2.5 text-sm"
          >
            <option value="ALL">West Bengal & Central India</option>
            <option value="West Bengal">West Bengal State Schemes</option>
            <option value="Central India">Central Government Schemes</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E5E3DC]">
          <button
            type="button"
            onClick={() => setCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
              category === 'ALL'
                ? 'bg-[#176B4D] text-white'
                : 'bg-[#FAF9F5] text-[#5C5C58] hover:text-[#252525]'
            }`}
          >
            {t.common.all}
          </button>
          {SCHEME_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
                category === cat
                  ? 'bg-[#176B4D] text-white'
                  : 'bg-[#FAF9F5] text-[#5C5C58] hover:text-[#252525]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Results */}
      {loading ? (
        <p className="text-sm text-[#5C5C58] py-12 text-center">{t.common.loading}</p>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-xl bg-white border border-[#E5E3DC] text-center">
          <p className="text-sm text-[#5C5C58]">{t.common.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((sch) => (
            <article
              key={sch.id}
              className="p-6 rounded-xl bg-white border border-[#E5E3DC] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5C58] mb-2">
                  <span>
                    {sch.scope} · {sch.category}
                  </span>
                  <VerificationLabel status={sch.verificationStatus} />
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/schemes/${sch.id}`)}
                  className="text-left text-lg font-bold text-[#252525] hover:text-[#176B4D] transition-colors cursor-pointer"
                >
                  {pickText(sch.officialName, language)}
                </button>
                <p className="text-xs text-[#5C5C58] mt-1">{pickText(sch.department, language)}</p>
                <p className="text-sm text-[#5C5C58] mt-3 leading-relaxed">
                  {pickText(sch.description, language)}
                </p>

                <div className="mt-4 p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC] text-xs space-y-1.5">
                  <p className="font-semibold text-[#252525]">Key Benefits:</p>
                  <p className="text-[#5C5C58] leading-relaxed">{pickText(sch.benefits, language)}</p>
                </div>

                {(() => {
                  const evalRes = evaluateScheme(sch);
                  if (!evalRes) return null;
                  const tone =
                    evalRes.verdict === 'Potentially Eligible'
                      ? 'bg-[#EBF4F0] border-[#176B4D]/35 text-[#0F4D37]'
                      : evalRes.verdict === 'Important Requirements Not Met'
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : 'bg-[#FEF4E6] border-[#F4A340]/50 text-[#6B3F06]';
                  return (
                    <div className={`mt-3 p-3 rounded-lg border text-xs space-y-0.5 ${tone}`}>
                      <p className="font-bold">{evalRes.verdict}</p>
                      <p className="leading-relaxed opacity-90">{evalRes.reason}</p>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#85847C]">
                  <span>
                    {t.common.lastVerified}: {sch.dateVerified}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/schemes/${sch.id}`)}
                    className="font-semibold text-[#176B4D] hover:underline cursor-pointer"
                  >
                    Documents & Process →
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
          : 'AI Scheme Explanation is currently unavailable. Please refer to the verified guide above.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-sm text-[#5C5C58]">{t.common.loading}</div>;
  }

  if (!scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <p className="font-semibold">Scheme information not found.</p>
        <button
          type="button"
          onClick={() => navigate('/schemes')}
          className="text-sm font-semibold text-[#176B4D] hover:underline cursor-pointer"
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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C58] hover:text-[#176B4D] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.common.back}</span>
      </button>

      {/* 9-Part Action-Oriented Scheme Guide */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E3DC] space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5C58] mb-2">
              <span>
                {scheme.scope} · {scheme.category}
              </span>
              <span>·</span>
              <VerificationLabel status={scheme.verificationStatus} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252525]">
              {pickText(scheme.officialName, language)}
            </h1>
            <p className="mt-1 text-sm text-[#5C5C58]">{pickText(scheme.department, language)}</p>
          </div>
          <ReadAloudButton
            lang={language}
            text={`${pickText(scheme.officialName, language)}. ${pickText(scheme.description, language)}. ${pickText(scheme.benefits, language)}. ${pickText(scheme.eligibilityRequirements, language)}`}
          />
        </div>

        {/* Immediate Practical Action Banner: JENOVA Checklist */}
        <div className="rounded-xl bg-[#EBF4F0] border border-[#176B4D]/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="w-6 h-6 text-[#176B4D] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm sm:text-base text-[#0F4D37]">
                {language === 'bn'
                  ? 'JENOVA Checklist — অফিস বা BSK যাওয়ার আগে কাগজপত্র চেক করুন'
                  : 'JENOVA Checklist — Check Your Documents Before Visiting Any Office'}
              </p>
              <p className="text-xs text-[#176B4D] mt-0.5">
                {language === 'bn'
                  ? 'কোন কাগজ প্রস্তুত আর কোনটি বাকি তা টিক দিয়ে সেভ করুন ও প্রিন্ট নিন।'
                  : 'Mark each document Ready or Missing, run a quick preliminary check, and print/share your checklist.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/checklist/${scheme.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#11533B] text-white text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer min-h-[44px]"
          >
            <span>{language === 'bn' ? 'JENOVA Checklist শুরু করুন' : 'Open JENOVA Checklist'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 1. What is this service? */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#252525]">
            {language === 'bn' ? '১. এই প্রকল্পটি কী ও কী সুবিধা পাওয়া যায়?' : '1. What Is This Scheme & Key Benefits'}
          </h2>
          <p className="text-sm text-[#4A4A46] leading-relaxed">
            {pickText(scheme.description, language)}
          </p>
          <p className="text-sm font-medium text-[#11533B] bg-[#FAF9F5] border border-[#E5E3DC] rounded-xl p-3.5 leading-relaxed">
            {pickText(scheme.benefits, language)}
          </p>
        </div>

        {/* 2. Who may qualify? */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#252525]">
            {language === 'bn' ? '২. কারা আবেদন করার উপযুক্ত হতে পারেন?' : '2. Who May Qualify? (Confirm With Official Authority)'}
          </h2>
          <p className="text-sm text-[#4A4A46] leading-relaxed">
            {pickText(scheme.eligibilityRequirements, language)}
          </p>
          <p className="text-xs text-[#6B3F06] bg-[#FEF4E6] border border-[#F4A340]/40 rounded-lg px-3.5 py-2">
            {language === 'bn'
              ? 'দ্রষ্টব্য: JENOVA কোনো সরকারি দপ্তর নয় এবং ভাতা অনুমোদনের নিশ্চয়তা দেয় না। চূড়ান্ত যোগ্যতা কেবল অফিসিয়াল কর্তৃপক্ষ যাচাই করে।'
              : 'Note: JENOVA provides plain-language guidance only and cannot guarantee approval. Final eligibility is decided strictly by the official authority.'}
          </p>
        </div>

        {/* 3. Documents Required */}
        <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-3">
          <h2 className="text-base font-bold text-[#252525] inline-flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#176B4D]" />
            <span>
              {language === 'bn' ? '৩. সাধারণত প্রয়োজনীয় কাগজপত্র' : '3. Commonly Required Documents'}
            </span>
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-[#252525]">
            {scheme.requiredDocuments.map((doc) => (
              <li key={doc} className="inline-flex items-start gap-2">
                <CheckSquare className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. What to prepare before visiting */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#252525]">
            {language === 'bn' ? '৪. যাওয়ার আগে যা অবশ্যই মিলিয়ে নেবেন' : '4. What to Prepare Before Applying'}
          </h2>
          <ul className="space-y-1.5 text-sm text-[#4A4A46] list-disc pl-5">
            <li>
              {language === 'bn'
                ? 'আধার কার্ড, ভোটার/রেশন কার্ড ও ব্যাংক পাশবইয়ে আপনার নামের বানান ও জন্মতারিখ একই আছে কিনা মিলিয়ে নিন।'
                : 'Check that your name spelling and date of birth match across Aadhaar, ID proof, and Bank Passbook.'}
            </li>
            <li>
              {language === 'bn'
                ? 'ব্যাংক অ্যাকাউন্টটি চালু (Active) আছে এবং Aadhaar DBT / NPCI সিডিং করা আছে কিনা নিশ্চিত করুন।'
                : 'Confirm your single-holder bank account is active and seeded with Aadhaar DBT / NPCI.'}
            </li>
            <li>
              {language === 'bn'
                ? 'মূল কপির সাথে অন্তত ২ সেট স্পষ্ট ফটোকপি ও সদ্য তোলা পাসপোর্ট ছবি রাখুন।'
                : 'Carry originals along with 2 clear photocopy sets and recent passport-size photographs.'}
            </li>
          </ul>
        </div>

        {/* 5 & 6. Next Step & Official Application Process */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#252525]">
            {language === 'bn' ? '৫ ও ৬. পরবর্তী ধাপ ও অফিসিয়াল আবেদন প্রক্রিয়া' : '5 & 6. Next Step & Where to Apply Officially'}
          </h2>
          <p className="text-sm text-[#4A4A46] leading-relaxed">
            {pickText(scheme.applicationProcess, language)}
          </p>
        </div>

        {/* 7. Where to receive local assistance */}
        <div className="rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-5 h-5 text-[#176B4D] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-[#252525]">
                {language === 'bn' ? '৭. স্থানীয় সহায়তা কোথায় পাবেন?' : '7. Where to Get Local Assistance'}
              </h2>
              <p className="text-xs text-[#5C5C58] mt-0.5">
                {language === 'bn'
                  ? 'বাংলা সহায়তা কেন্দ্র (BSK), পূর্ব মেদিনীপুর জেলা/বিডিও ডিরেক্টরি বা দুয়ারে সরকার পোর্টালে যান।'
                  : 'Find verified Bangla Sahayata Kendra (BSK), Purba Medinipur BDO directory, and Duare Sarkar links.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/local-help')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#176B4D]/40 bg-white text-xs font-semibold text-[#176B4D] hover:bg-[#EBF4F0] whitespace-nowrap cursor-pointer"
          >
            <span>{language === 'bn' ? 'JENOVA Local দেখুন' : 'Open JENOVA Local'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8. What to Avoid (Fraud & Middleman Warning) */}
        <div className="rounded-xl bg-[#FEF4E6] border border-[#F4A340]/50 p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#B56A10] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-[#6B3F06]">
            <p className="font-bold">
              {language === 'bn' ? '৮. কী এড়িয়ে চলবেন (প্রতারণা সতর্কতা)' : '8. What to Avoid (Scam Warning)'}
            </p>
            <p>
              {language === 'bn'
                ? 'সরকারি প্রকল্পের ফর্ম বা ভাতা পাইয়ে দেওয়ার নামে কখনোই কাউকে অগ্রিম টাকা, OTP বা UPI PIN দেবেন না। সন্দেহজনক মেসেজ পেলে আমাদের "JENOVA Protect" টুলে পরীক্ষা করুন।'
                : 'Never pay middlemen or share OTPs/UPI PINs for government welfare schemes. If you receive a suspicious scheme message or link, check it in JENOVA Protect.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/scam-check')}
              className="text-xs font-bold text-[#176B4D] hover:underline cursor-pointer"
            >
              {language === 'bn' ? 'JENOVA Protect খুলুন →' : 'Open JENOVA Protect →'}
            </button>
          </div>
        </div>

        {/* Interactive AI Scheme Explanation (Grounded in Official Record) */}
        <div className="rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] p-5 space-y-4">
          <div className="flex items-start gap-2.5">
            <Bot className="w-5 h-5 text-[#176B4D] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-[#252525]">
                {language === 'bn'
                  ? 'সহজ বাংলায় প্রকল্পটি বুঝুন (AI Scheme Guide)'
                  : language === 'hi'
                    ? 'सरल भाषा में योजना समझें (AI Scheme Guide)'
                    : 'Ask About This Scheme in Plain Language (AI Scheme Guide)'}
              </h2>
              <p className="text-xs text-[#5C5C58] mt-0.5">
                {language === 'bn'
                  ? 'যেকোনো প্রশ্নে ট্যাপ করুন বা নিজে লিখুন। উত্তরটি কেবল উপরের যাচাইকৃত সরকারি তথ্যের ওপর ভিত্তি করে দেওয়া হয়।'
                  : 'Tap a quick question or type your own. Answers are strictly grounded in this verified official record.'}
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
                className="px-3 py-2 rounded-lg bg-white border border-[#E5E3DC] hover:border-[#176B4D] hover:bg-[#EBF4F0] text-xs font-medium text-[#252525] cursor-pointer transition-colors"
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
              placeholder={
                language === 'bn'
                  ? 'এই প্রকল্প সম্পর্কে আপনার প্রশ্ন লিখুন...'
                  : 'Ask a specific question about this scheme...'
              }
              className="flex-1 rounded-xl border border-[#D8D5CC] bg-white px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={aiLoading || aiQuestion.trim().length < 3}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#11533B] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer whitespace-nowrap min-h-[42px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{aiLoading ? t.common.loading : language === 'bn' ? 'জিজ্ঞাসা করুন' : 'Ask'}</span>
            </button>
          </form>

          {aiError && (
            <div className="rounded-xl bg-[#FEF4E6] border border-[#F4A340]/50 px-4 py-3 text-xs text-[#6B3F06]">
              {aiError}
            </div>
          )}

          {aiAnswer && (
            <div className="rounded-xl bg-white border border-[#176B4D]/25 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#176B4D]">
                  {language === 'bn' ? 'যাচাইকৃত তথ্যের ভিত্তিতে উত্তর' : 'Grounded Plain-Language Answer'}
                </span>
                <ReadAloudButton compact lang={language} text={aiAnswer.reply} />
              </div>
              <p className="text-sm text-[#252525] leading-relaxed whitespace-pre-wrap">
                {aiAnswer.reply}
              </p>
              <p className="text-[11px] text-[#5C5C58] pt-2 border-t border-[#E5E3DC]">
                Source: {aiAnswer.sourceName} · {aiAnswer.officialWebsite}
              </p>
            </div>
          )}
        </div>

        {/* 9. Verification Source & Date */}
        <div className="pt-4 border-t border-[#E5E3DC] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5C5C58]">
          <div>
            <span className="text-[#85847C]">9. {t.common.sourceLabel}: </span>
            <a
              href={scheme.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#176B4D] hover:underline"
            >
              {scheme.sourceName}
            </a>
          </div>
          <div>
            <span className="text-[#85847C]">{t.common.lastVerified}: </span>
            <span className="font-medium text-[#252525]">{scheme.dateVerified}</span>
          </div>
          <div>
            <span className="text-[#85847C]">Next Scheduled Review: </span>
            <span className="font-medium text-[#252525]">{scheme.expiryDate}</span>
          </div>
        </div>

        <ActionToolbar
          itemType="scheme"
          itemId={scheme.id}
          title={pickText(scheme.officialName, language)}
          shareSummary={`${pickText(scheme.department, language)} | Official Website: ${scheme.officialWebsite}`}
          sharePath={`/schemes/${scheme.id}`}
          externalUrl={scheme.officialWebsite}
          externalLabel={
            language === 'bn' ? 'অফিসিয়াল সরকারি ওয়েবসাইট খুলুন' : 'Open Official Government Website'
          }
          onExternalClick={() => trackAnalyticsEvent('scheme_referral', scheme.id)}
        />
      </div>
    </div>
  );
}
