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
import { pickText } from '../i18n/translations';
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
        title={
          language === 'bn'
            ? 'দক্ষতা উন্নয়ন ও ফ্রি প্রশিক্ষণ কেন্দ্র'
            : language === 'hi'
              ? 'कौशल विकास और निःशुल्क प्रशिक्षण केंद्र'
              : 'Skill Development Centre'
        }
        subtitle={
          language === 'bn'
            ? 'বিনামূল্যে এবং স্বল্পমূল্যের যাচাইকৃত সরকারি ও স্বীকৃত প্রশিক্ষণ কোর্স — কম্পিউটার, ডিজিটাল সাক্ষরতা, সেলাই, ইলেকট্রিশিয়ান, প্রোগ্রামিং ও উদ্যোক্তা শিক্ষা।'
            : 'Free and affordable verified skill courses across digital literacy, computer education, vocational trades, programming, and entrepreneurship — prioritizing government-recognized programmes.'
        }
      />

      {/* Training Streams Visual Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="rounded-xl overflow-hidden bg-white border border-[#E5E3DC] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.educationDigitalSkills.src}
            alt={VISUAL_ASSETS.educationDigitalSkills.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-3.5 border-t border-[#E5E3DC]">
            <p className="text-sm font-bold text-[#252525]">
              {language === 'bn'
                ? 'কম্পিউটার, ডিজিটাল সাক্ষরতা ও প্রোগ্রামিং'
                : 'Computer, Digital Literacy & Programming Labs'}
            </p>
            <p className="text-xs text-[#5C5C58] mt-0.5">
              Free courses via IIT Bombay Spoken Tutorial, Skill India Digital, and SWAYAM.
            </p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-white border border-[#E5E3DC] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.educationVocationalTailoring.src}
            alt={VISUAL_ASSETS.educationVocationalTailoring.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-3.5 border-t border-[#E5E3DC]">
            <p className="text-sm font-bold text-[#252525]">
              {language === 'bn'
                ? 'সেলাই, ইলেকট্রিশিয়ান ও বৃত্তিমূলক প্রশিক্ষণ'
                : 'Vocational Trades, Tailoring & Entrepreneurship'}
            </p>
            <p className="text-xs text-[#5C5C58] mt-0.5">
              Hands-on livelihoods through Utkarsh Bangla and Purba Medinipur RSETI centres.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-5 rounded-xl bg-white border border-[#E5E3DC] mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center">
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
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as typeof modeFilter)}
            className="rounded-lg border border-[#E5E3DC] bg-[#FAF9F5] px-3 py-2.5 text-sm text-[#252525]"
          >
            <option value="ALL">All Modes (Online / Offline)</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline (Local Centres)</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <label className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[#E5E3DC] bg-[#FAF9F5] text-sm font-medium text-[#252525] cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="accent-[#176B4D] w-4 h-4"
            />
            <span>{language === 'bn' ? 'শুধু ফ্রি কোর্স' : 'Free Courses Only'}</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E5E3DC]">
          <button
            type="button"
            onClick={() => setCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              category === 'ALL'
                ? 'bg-[#176B4D] text-white'
                : 'bg-[#FAF9F5] text-[#5C5C58] hover:text-[#252525]'
            }`}
          >
            {t.common.all}
          </button>
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
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

      {/* Course Grid */}
      {loading ? (
        <p className="text-sm text-[#5C5C58] py-12 text-center">{t.common.loading}</p>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-xl bg-white border border-[#E5E3DC] text-center">
          <p className="text-sm text-[#5C5C58]">{t.common.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
          {filtered.map((course) => (
            <article
              key={course.id}
              className="p-6 rounded-xl bg-white border border-[#E5E3DC] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5C58] mb-2">
                  <span>
                    {course.category} · {course.mode} ·{' '}
                    <strong className="text-[#176B4D]">{course.fees}</strong>
                  </span>
                  <VerificationLabel status={course.verificationStatus} isDemo={course.isDemo} />
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/skills/${course.id}`)}
                  className="text-left text-lg font-bold text-[#252525] hover:text-[#176B4D] transition-colors cursor-pointer"
                >
                  {pickText(course.name, language)}
                </button>
                <p className="text-xs font-medium text-[#5C5C58] mt-1">{course.provider}</p>
                <p className="text-sm text-[#5C5C58] mt-3 leading-relaxed">
                  {pickText(course.description, language)}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C5C58]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#176B4D]" />
                    {course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#85847C]" />
                    {course.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#85847C]" />
                    {course.eligibility}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#B56A10]" />
                    {course.certification}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/skills/${course.id}`)}
                    className="text-xs font-semibold text-[#176B4D] hover:underline cursor-pointer"
                  >
                    Learning Resource Details →
                  </button>
                </div>
                <ActionToolbar
                  itemType="course"
                  itemId={course.id}
                  title={pickText(course.name, language)}
                  shareSummary={`${course.provider} | ${course.fees} | ${course.duration}`}
                  sharePath={`/skills/${course.id}`}
                  externalUrl={course.applicationUrl}
                  externalLabel="Open Learning Portal"
                  onExternalClick={() => trackAnalyticsEvent('training_referral', course.id)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Training Centre Directory */}
      <section className="pt-8 border-t border-[#E5E3DC]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#252525]">
          {language === 'bn'
            ? 'পূর্ব মেদিনীপুর ও মেচেদা প্রশিক্ষণ কেন্দ্র ডিরেক্টরি'
            : 'Purba Medinipur & Mecheda Training-Centre Directory'}
        </h2>
        <p className="text-sm text-[#5C5C58] mt-1 mb-6">
          Verified government training directories and clearly labeled local pilot samples.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {centres.map((tc) => (
            <div
              key={tc.id}
              className="p-5 rounded-xl bg-white border border-[#E5E3DC] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="mb-2">
                  <VerificationLabel status={tc.verificationStatus} isDemo={tc.isDemo} />
                </div>
                <h3 className="text-base font-bold text-[#252525]">{tc.name}</h3>
                <p className="text-xs text-[#5C5C58] mt-1">{tc.location}</p>
                <p className="text-xs text-[#252525] mt-3">
                  <span className="text-[#85847C]">Trades: </span>
                  {tc.coursesOffered.join(' · ')}
                </p>
              </div>
              <a
                href={tc.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B4D] hover:underline"
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
    return <div className="max-w-4xl mx-auto px-4 py-16 text-sm text-[#5C5C58]">{t.common.loading}</div>;
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <p className="font-semibold">Course resource not found.</p>
        <button
          type="button"
          onClick={() => navigate('/skills')}
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
        onClick={() => navigate('/skills')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C58] hover:text-[#176B4D] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.common.back}</span>
      </button>

      <div className="rounded-xl bg-white border border-[#E5E3DC] overflow-hidden">
        <ResilientImage
          src={
            course.category === 'Vocational Training' || course.category === 'Entrepreneurship'
              ? VISUAL_ASSETS.educationVocationalTailoring.src
              : VISUAL_ASSETS.educationDigitalSkills.src
          }
          alt={pickText(course.name, language)}
          containerClassName="aspect-[21/9] w-full border-b border-[#E5E3DC]"
        />
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5C58] mb-2">
              <span>
                {course.category} · {course.mode}
              </span>
              <VerificationLabel status={course.verificationStatus} isDemo={course.isDemo} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252525]">
              {pickText(course.name, language)}
            </h1>
            <p className="mt-1 text-base text-[#5C5C58]">{course.provider}</p>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC] text-sm">
          <div>
            <p className="text-xs text-[#85847C]">Fees</p>
            <p className="font-semibold text-[#176B4D] mt-0.5">{course.fees}</p>
          </div>
          <div>
            <p className="text-xs text-[#85847C]">Duration</p>
            <p className="font-medium text-[#252525] mt-0.5">{course.duration}</p>
          </div>
          <div>
            <p className="text-xs text-[#85847C]">Eligibility</p>
            <p className="font-medium text-[#252525] mt-0.5">{course.eligibility}</p>
          </div>
          <div>
            <p className="text-xs text-[#85847C]">Certification</p>
            <p className="font-medium text-[#252525] mt-0.5">{course.certification}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#252525]">Course Overview</h2>
          <p className="text-sm text-[#5C5C58] leading-relaxed">
            {pickText(course.description, language)}
          </p>
        </div>

        <div className="pt-4 border-t border-[#E5E3DC] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5C5C58]">
          <div>
            <span className="text-[#85847C]">{t.common.sourceLabel}: </span>
            <span className="font-medium text-[#252525]">{course.sourceName}</span>
          </div>
          <div>
            <span className="text-[#85847C]">{t.common.lastVerified}: </span>
            <span className="font-medium text-[#252525]">{course.dateVerified}</span>
          </div>
          <div>
            <span className="text-[#85847C]">Location / Mode: </span>
            <span className="font-medium text-[#252525]">{course.location}</span>
          </div>
        </div>

        <ActionToolbar
          itemType="course"
          itemId={course.id}
          title={pickText(course.name, language)}
          shareSummary={`${course.provider} | ${course.fees}`}
          sharePath={`/skills/${course.id}`}
          externalUrl={course.applicationUrl}
          externalLabel="Go to Official Course Website"
          onExternalClick={() => trackAnalyticsEvent('training_referral', course.id)}
        />
        </div>
      </div>
    </div>
  );
}
