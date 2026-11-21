import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Clock,
  ExternalLink,
  GraduationCap,
  MapPin,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { localizeMode, localizeSkillCategory, pickText, tr } from '../i18n/translations';
import { apiFetch, trackAnalyticsEvent } from '../lib/api';
import type { CourseListing, SkillCategory, TrainingCentre } from '../types/platform';
import {
  ActionToolbar,
  PageHeader,
  ResilientImage,
  VerificationLabel,
} from '../components/SharedUI';
import { VISUAL_ASSETS } from '../lib/visualAssets';

const SKILL_CATEGORIES: SkillCategory[] = [
  'Digital Literacy',
  'Computer Education',
  'Programming',
  'Graphic Design',
  'Digital Marketing',
  'Video Editing',
  'Communication Skills',
  'Vocational Training',
  'Entrepreneurship',
  'Professional Development',
];

export function SkillDevelopmentPage() {
  const { language, t, navigate } = useApp();
  const [courses, setCourses] = useState<CourseListing[]>([]);
  const [centres, setCentres] = useState<TrainingCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [freeOnly, setFreeOnly] = useState(false);
  const [modeFilter, setModeFilter] = useState<'ALL' | 'Online' | 'Offline' | 'Hybrid'>('ALL');

  useEffect(() => {
    setLoading(true);
    apiFetch<{ courses: CourseListing[]; trainingCentres: TrainingCentre[] }>('/api/courses')
      .then((res) => {
        setCourses(res.courses);
        setCentres(res.trainingCentres);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: courses.length };
    for (const cat of SKILL_CATEGORIES) counts[cat] = 0;
    for (const c of courses) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return counts;
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (category !== 'ALL' && c.category !== category) return false;
      if (freeOnly && !c.isFree) return false;
      if (modeFilter !== 'ALL' && c.mode !== modeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${c.name.en} ${c.name.bn} ${c.name.hi} ${c.provider} ${c.category} ${c.description.en}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [courses, category, freeOnly, modeFilter, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(
          language,
          'দক্ষতা উন্নয়ন ও ফ্রি প্রশিক্ষণ কেন্দ্র',
          'कौशल विकास और निःशुल्क प्रशिक्षण केंद्र',
          'Skill Development Centre'
        )}
        subtitle={tr(
          language,
          'বিনামূল্যে এবং স্বল্পমূল্যের যাচাইকৃত সরকারি ও স্বীকৃত প্রশিক্ষণ কোর্স — কম্পিউটার, ডিজিটাল সাক্ষরতা, সেলাই, ইলেকট্রিশিয়ান, প্রোগ্রামিং ও উদ্যোক্তা শিক্ষা।',
          'डिजिटल साक्षरता, कंप्यूटर शिक्षा, व्यावसायिक ट्रेड, प्रोग्रामिंग और उद्यमिता में निःशुल्क एवं किफायती सत्यापित सरकारी प्रशिक्षण पाठ्यक्रम।',
          'Free and affordable verified skill courses across digital literacy, computer education, vocational trades, programming, and entrepreneurship — prioritizing government-recognized programmes.'
        )}
      />

      {/* Training Streams Visual Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="rounded-xl overflow-hidden bg-white border border-[#F2DCC1] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.educationDigitalSkills.src}
            alt={VISUAL_ASSETS.educationDigitalSkills.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-3.5 border-t border-[#F2DCC1]">
            <p className="text-sm font-bold text-[#26364B]">
              {tr(
                language,
                'কম্পিউটার, ডিজিটাল সাক্ষরতা ও প্রোগ্রামিং',
                'कंप्यूटर, डिजिटल साक्षरता और प्रोग्रामिंग',
                'Computer, Digital Literacy & Programming Labs'
              )}
            </p>
            <p className="text-xs text-[#454545] mt-0.5">
              {tr(
                language,
                'IIT Bombay Spoken Tutorial, Skill India Digital এবং SWAYAM-এর মাধ্যমে ফ্রি কোর্স।',
                'IIT बॉम्बे स्पोकन ट्यूटोरियल, स्किल इंडिया डिजिटल और SWAYAM के निःशुल्क कोर्स।',
                'Free courses via IIT Bombay Spoken Tutorial, Skill India Digital, and SWAYAM.'
              )}
            </p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-white border border-[#F2DCC1] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.educationVocationalTailoring.src}
            alt={VISUAL_ASSETS.educationVocationalTailoring.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-3.5 border-t border-[#F2DCC1]">
            <p className="text-sm font-bold text-[#26364B]">
              {tr(
                language,
                'সেলাই, ইলেকট্রিশিয়ান ও বৃত্তিমূলক প্রশিক্ষণ',
                'सिलाई, इलेक्ट्रिशियन और व्यावसायिक प्रशिक्षण',
                'Vocational Trades, Tailoring & Entrepreneurship'
              )}
            </p>
            <p className="text-xs text-[#454545] mt-0.5">
              {tr(
                language,
                'উৎকর্ষ বাংলা, PMKVY এবং জাতীয় RSETI প্রশিক্ষণ কেন্দ্রের মাধ্যমে হাতে-কলমে জীবিকা প্রশিক্ষণ।',
                'उत्कर्ष बांग्ला, PMKVY और राष्ट्रीय RSETI प्रशिक्षण केंद्रों के माध्यम से व्यावहारिक प्रशिक्षण।',
                'Hands-on livelihoods through Utkarsh Bangla, PMKVY, and National RSETI training centres.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-5 rounded-xl bg-white border border-[#F2DCC1] mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center">
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
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as typeof modeFilter)}
            className="rounded-lg border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2.5 text-sm text-[#26364B]"
          >
            <option value="ALL">
              {tr(language, 'সব মাধ্যম (অনলাইন / অফলাইন)', 'सभी माध्यम (ऑनलाइन / ऑफलाइन)', 'All Modes (Online / Offline)')}
            </option>
            <option value="Online">{localizeMode('Online', language)}</option>
            <option value="Offline">
              {tr(language, 'অফলাইন (স্থানীয় কেন্দ্র)', 'ऑफलाइन (स्थानीय केंद्र)', 'Offline (Local Centres)')}
            </option>
            <option value="Hybrid">{localizeMode('Hybrid', language)}</option>
          </select>

          <label className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[#F2DCC1] bg-[#FFF1DF] text-sm font-medium text-[#26364B] cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="accent-[#F4A340] w-4 h-4"
            />
            <span>
              {tr(language, 'শুধু ফ্রি কোর্স', 'केवल निःशुल्क कोर्स', 'Free Courses Only')}
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F2DCC1]">
          <button
            type="button"
            onClick={() => setCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              category === 'ALL'
                ? 'jenova-saffron-btn'
                : 'bg-[#FFF1DF] text-[#454545] hover:text-[#26364B]'
            }`}
          >
            {t.common.all} ({categoryCounts.ALL || 0})
          </button>
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                category === cat
                  ? 'jenova-saffron-btn'
                  : 'bg-[#FFF1DF] text-[#454545] hover:text-[#26364B]'
              }`}
            >
              {localizeSkillCategory(cat, language)} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <p className="text-sm text-[#454545] py-12 text-center">{t.common.loading}</p>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-xl bg-white border border-[#F2DCC1] text-center space-y-3">
          <p className="text-sm text-[#454545]">{t.common.noResults}</p>
          <button
            type="button"
            onClick={() => {
              setCategory('ALL');
              setSearch('');
              setFreeOnly(false);
              setModeFilter('ALL');
            }}
            className="px-4 py-2 text-xs font-semibold jenova-saffron-btn rounded-lg cursor-pointer"
          >
            {tr(language, 'সব ফিল্টার রিসেট করুন', 'सभी फ़िल्टर रीसेट करें', 'Reset Filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
          {filtered.map((course) => (
            <article
              key={course.id}
              className="p-6 rounded-xl bg-white border border-[#F2DCC1] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#454545] mb-2">
                  <span>
                    {localizeSkillCategory(course.category, language)} ·{' '}
                    {localizeMode(course.mode, language)} ·{' '}
                    <strong className="text-[#A85B0A] dark:text-[#FFD19A]">{course.fees}</strong>
                  </span>
                  <VerificationLabel status={course.verificationStatus} isDemo={course.isDemo} />
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/skills/${course.id}`)}
                  className="text-left text-lg font-bold text-[#26364B] hover:text-[#A85B0A] dark:hover:text-[#FFD19A] transition-colors cursor-pointer"
                >
                  {pickText(course.name, language)}
                </button>
                <p className="text-xs font-medium text-[#454545] mt-1">{course.provider}</p>
                <p className="text-sm text-[#454545] mt-3 leading-relaxed">
                  {pickText(course.description, language)}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#454545]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A85B0A] dark:text-[#FFD19A]" />
                    {course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#665B4F]" />
                    {course.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#665B4F]" />
                    {course.eligibility}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#A85B0A]" />
                    {course.certification}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/skills/${course.id}`)}
                    className="text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
                  >
                    {tr(
                      language,
                      'প্রশিক্ষণের সম্পূর্ণ বিবরণ →',
                      'प्रशिक्षण का पूरा विवरण →',
                      'Learning Resource Details →'
                    )}
                  </button>
                </div>
                <ActionToolbar
                  itemType="course"
                  itemId={course.id}
                  title={pickText(course.name, language)}
                  shareSummary={`${course.provider} | ${course.fees} | ${course.duration}`}
                  sharePath={`/skills/${course.id}`}
                  externalUrl={course.applicationUrl}
                  externalLabel={tr(
                    language,
                    'লার্নিং পোর্টাল খুলুন',
                    'लर्निंग पोर्टल खोलें',
                    'Open Learning Portal'
                  )}
                  onExternalClick={() => trackAnalyticsEvent('training_referral', course.id)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Training Centre Directory */}
      <section className="pt-8 border-t border-[#F2DCC1]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#26364B]">
          {tr(
            language,
            'যাচাইকৃত সরকারি ও স্বীকৃত প্রশিক্ষণ কেন্দ্র ডিরেক্টরি',
            'सत्यापित सरकारी और मान्यता प्राप्त प्रशिक्षण केंद्र निर्देशिका',
            'Verified National & State Training-Centre Directory'
          )}
        </h2>
        <p className="text-sm text-[#454545] mt-1 mb-6">
          {tr(
            language,
            'দেশজুড়ে বিনামূল্যে বৃত্তিমূলক, ডিজিটাল ও উদ্যোক্তা প্রশিক্ষণের অফিসিয়াল কেন্দ্র ডিরেক্টরি।',
            'देशभर में निःशुल्क व्यावसायिक, डिजिटल और उद्यमिता प्रशिक्षण के आधिकारिक केंद्र।',
            'Official government-accredited training networks offering free vocational, computer, and entrepreneurship batches across India.'
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {centres.map((tc) => (
            <div
              key={tc.id}
              className="p-5 rounded-xl bg-white border border-[#F2DCC1] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="mb-2">
                  <VerificationLabel status={tc.verificationStatus} isDemo={tc.isDemo} />
                </div>
                <h3 className="text-base font-bold text-[#26364B]">{tc.name}</h3>
                <p className="text-xs text-[#454545] mt-1">{tc.location}</p>
                <p className="text-xs text-[#26364B] mt-3">
                  <span className="text-[#665B4F]">
                    {tr(language, 'প্রশিক্ষণ বিষয়:', 'प्रशिक्षण विषय:', 'Trades:')}{' '}
                  </span>
                  {tc.coursesOffered.join(' · ')}
                </p>
              </div>
              <a
                href={tc.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline"
              >
                <span>{tc.contact}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function CourseDetailsPage({ courseId }: { courseId: string }) {
  const { language, t, navigate } = useApp();
  const [course, setCourse] = useState<CourseListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ course: CourseListing }>(`/api/courses/${courseId}`)
      .then((res) => {
        setCourse(res.course);
        trackAnalyticsEvent('course_view', res.course.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-sm text-[#454545]">{t.common.loading}</div>;
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <p className="font-semibold">
          {tr(language, 'কোর্সের তথ্য পাওয়া যায়নি।', 'पाठ्यक्रम संसाधन नहीं मिला।', 'Course resource not found.')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/skills')}
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
        onClick={() => navigate('/skills')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#454545] hover:text-[#A85B0A] dark:hover:text-[#FFD19A] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.common.back}</span>
      </button>

      <div className="rounded-xl bg-white border border-[#F2DCC1] overflow-hidden">
        <ResilientImage
          src={
            course.category === 'Vocational Training' || course.category === 'Entrepreneurship'
              ? VISUAL_ASSETS.educationVocationalTailoring.src
              : VISUAL_ASSETS.educationDigitalSkills.src
          }
          alt={pickText(course.name, language)}
          containerClassName="aspect-[21/9] w-full border-b border-[#F2DCC1]"
        />
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#454545] mb-2">
              <span>
                {localizeSkillCategory(course.category, language)} ·{' '}
                {localizeMode(course.mode, language)}
              </span>
              <VerificationLabel status={course.verificationStatus} isDemo={course.isDemo} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#26364B]">
              {pickText(course.name, language)}
            </h1>
            <p className="mt-1 text-base text-[#454545]">{course.provider}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] text-sm">
            <div>
              <p className="text-xs text-[#665B4F]">{tr(language, 'ফি', 'शुल्क', 'Fees')}</p>
              <p className="font-semibold text-[#A85B0A] dark:text-[#FFD19A] mt-0.5">{course.fees}</p>
            </div>
            <div>
              <p className="text-xs text-[#665B4F]">
                {tr(language, 'সময়কাল', 'अवधि', 'Duration')}
              </p>
              <p className="font-medium text-[#26364B] mt-0.5">{course.duration}</p>
            </div>
            <div>
              <p className="text-xs text-[#665B4F]">
                {tr(language, 'যোগ্যতা', 'पात्रता', 'Eligibility')}
              </p>
              <p className="font-medium text-[#26364B] mt-0.5">{course.eligibility}</p>
            </div>
            <div>
              <p className="text-xs text-[#665B4F]">
                {tr(language, 'সার্টিফিকেশন', 'प्रमाणपत्र', 'Certification')}
              </p>
              <p className="font-medium text-[#26364B] mt-0.5">{course.certification}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[#26364B]">
              {tr(language, 'কোর্স পরিচিতি', 'पाठ्यक्रम विवरण', 'Course Overview')}
            </h2>
            <p className="text-sm text-[#454545] leading-relaxed">
              {pickText(course.description, language)}
            </p>
          </div>

          <div className="pt-4 border-t border-[#F2DCC1] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#454545]">
            <div>
              <span className="text-[#665B4F]">{t.common.sourceLabel}: </span>
              <span className="font-medium text-[#26364B]">{course.sourceName}</span>
            </div>
            <div>
              <span className="text-[#665B4F]">{t.common.lastVerified}: </span>
              <span className="font-medium text-[#26364B]">{course.dateVerified}</span>
            </div>
            <div>
              <span className="text-[#665B4F]">
                {tr(language, 'স্থান / মাধ্যম:', 'स्थान / माध्यम:', 'Location / Mode:')}{' '}
              </span>
              <span className="font-medium text-[#26364B]">{course.location}</span>
            </div>
          </div>

          <ActionToolbar
            itemType="course"
            itemId={course.id}
            title={pickText(course.name, language)}
            shareSummary={`${course.provider} | ${course.fees}`}
            sharePath={`/skills/${course.id}`}
            externalUrl={course.applicationUrl}
            externalLabel={tr(
              language,
              'অফিসিয়াল কোর্স ওয়েবসাইটে যান',
              'आधिकारिक पाठ्यक्रम वेबसाइट पर जाएं',
              'Go to Official Course Website'
            )}
            onExternalClick={() => trackAnalyticsEvent('training_referral', course.id)}
          />
        </div>
      </div>
    </div>
  );
}
