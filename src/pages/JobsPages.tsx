import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  MapPin,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pickText } from '../i18n/translations';
import { apiFetch, trackAnalyticsEvent } from '../lib/api';
import type { JobCategory, JobListing } from '../types/platform';
import {
  ActionToolbar,
  PageHeader,
  ResilientImage,
  SafetyNotice,
  VerificationLabel,
} from '../components/SharedUI';
import { ReadAloudButton } from '../components/VoiceAccessibility';
import { VISUAL_ASSETS } from '../lib/visualAssets';

const JOB_CATEGORIES: JobCategory[] = [
  'Local',
  'Part-Time',
  'Full-Time',
  'Work From Home',
  'Government Notification',
  'Private Sector',
  'Internship',
  'Daily Wage',
];

export function FindJobsPage() {
  const { language, t, navigate, showToast } = useApp();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState('');
  const [qualFilter, setQualFilter] = useState('');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Job submission form state
  const [formTitle, setFormTitle] = useState('');
  const [formEmployer, setFormEmployer] = useState('');
  const [formLocation, setFormLocation] = useState('Mecheda, Purba Medinipur');
  const [formCategory, setFormCategory] = useState<JobCategory>('Local');
  const [formSalaryMin, setFormSalaryMin] = useState('');
  const [formSalaryMax, setFormSalaryMax] = useState('');
  const [formQual, setFormQual] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch<{ jobs: JobListing[] }>('/api/jobs')
      .then((res) => setJobs(res.jobs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (category !== 'ALL' && job.category !== category) return false;
      if (minSalary > 0 && job.salaryMax > 0 && job.salaryMax < minSalary) return false;
      if (
        locationFilter.trim() &&
        !job.location.toLowerCase().includes(locationFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        qualFilter.trim() &&
        !job.qualification.toLowerCase().includes(qualFilter.toLowerCase())
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${job.title.en} ${job.title.bn} ${job.title.hi} ${job.employerName} ${job.description.en} ${job.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, category, minSalary, locationFilter, qualFilter, search]);

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ message: string }>('/api/jobs/submit', {
        method: 'POST',
        body: JSON.stringify({
          title: formTitle,
          employerName: formEmployer,
          location: formLocation,
          category: formCategory,
          salaryMin: Number(formSalaryMin) || 0,
          salaryMax: Number(formSalaryMax) || Number(formSalaryMin) || 0,
          qualification: formQual,
          description: formDesc,
          contactInfo: formContact,
          applicationUrl: formUrl,
        }),
      });
      showToast(res.message);
      setShowSubmitModal(false);
      setFormTitle('');
      setFormEmployer('');
      setFormDesc('');
      setFormContact('');
      setFormUrl('');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={
          language === 'bn'
            ? 'কর্মসংস্থান পোর্টাল ও স্থানীয় কাজের তথ্য'
            : language === 'hi'
              ? 'रोजगार पोर्टल और स्थानीय अवसर'
              : 'Employment Discovery Portal'
        }
        subtitle={
          language === 'bn'
            ? 'যাচাইকৃত সরকারি কর্মসংস্থান পোর্টাল এবং মেচেদা পাইলটের স্পষ্টভাবে চিহ্নিত নমুনা (DEMO DATA) তালিকা। সমস্ত নতুন নিয়োগ বিজ্ঞপ্তি অ্যাডমিন যাচাইয়ের পর প্রকাশিত হয়।'
            : 'Official government employment portals plus clearly marked DEMO DATA pilot examples for Mecheda, Purba Medinipur. All community-submitted vacancies require Administrator verification before publication.'
        }
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/jobs/biodata')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#176B4D] bg-[#EBF4F0] border border-[#176B4D]/30 hover:bg-[#DDECE5] rounded-lg whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>
                {language === 'bn' ? '১-মিনিটে বায়োডাটা বানান' : '1-Minute Biodata Builder'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {language === 'bn' ? 'কাজের বিজ্ঞপ্তি জমা দিন' : 'Submit Job for Verification'}
              </span>
            </button>
          </div>
        }
      />

      {/* Authentic Employment Pathways Visual Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl overflow-hidden bg-white border border-[#E5E3DC] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.employmentProfessionals.src}
            alt={VISUAL_ASSETS.employmentProfessionals.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-3.5 border-t border-[#E5E3DC]">
            <p className="text-sm font-bold text-[#252525]">
              {language === 'bn'
                ? 'অফিস, কম্পিউটার ও সরকারি কর্মসংস্থান পোর্টাল'
                : 'Office, Digital & Government Career Pathways'}
            </p>
            <p className="text-xs text-[#5C5C58] mt-0.5">
              National Career Service, WB Employment Bank, and verified entry-level private roles.
            </p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-white border border-[#E5E3DC] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.employmentTechnicians.src}
            alt={VISUAL_ASSETS.employmentTechnicians.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-3.5 border-t border-[#E5E3DC]">
            <p className="text-sm font-bold text-[#252525]">
              {language === 'bn'
                ? 'দক্ষ কারিগরি, অ্যাপ্রেন্টিসশিপ ও স্থানীয় কাজ'
                : 'Skilled Technical, Apprenticeship & Local Trades'}
            </p>
            <p className="text-xs text-[#5C5C58] mt-0.5">
              NAPS apprenticeships, ITI technical trades, retail, delivery, and local service roles.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <SafetyNotice />
        <div className="rounded-lg bg-white border border-[#E5E3DC] px-4 py-3 text-xs text-[#5C5C58] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#B56A10] shrink-0 mt-0.5" />
          <p>
            <strong>Honesty Notice:</strong> Sample Mecheda listings marked{' '}
            <strong className="text-[#B56A10]">DEMO DATA</strong> are prototype illustrations only
            and not active vacancies. Verified government portals (National Career Service, WB
            Employment Bank, NAPS) connect directly to official government websites.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-xl bg-white border border-[#E5E3DC] mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#85847C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#E5E3DC] text-sm bg-[#FAF9F5] focus:bg-white"
            />
          </div>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Location (e.g. Mecheda, Haldia)"
            className="w-full px-3 py-2.5 rounded-lg border border-[#E5E3DC] text-sm bg-[#FAF9F5] focus:bg-white"
          />
          <input
            type="text"
            value={qualFilter}
            onChange={(e) => setQualFilter(e.target.value)}
            placeholder="Qualification (e.g. 12th, ITI)"
            className="w-full px-3 py-2.5 rounded-lg border border-[#E5E3DC] text-sm bg-[#FAF9F5] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E5E3DC]">
          <div className="flex flex-wrap items-center gap-1.5">
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
            {JOB_CATEGORIES.map((cat) => (
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

          <div className="flex items-center gap-2 text-xs text-[#5C5C58]">
            <label htmlFor="min-sal">Min Salary:</label>
            <select
              id="min-sal"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="rounded-md border border-[#E5E3DC] bg-white px-2.5 py-1.5 text-xs text-[#252525]"
            >
              <option value={0}>Any</option>
              <option value={5000}>₹5,000+</option>
              <option value={8000}>₹8,000+</option>
              <option value={10000}>₹10,000+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {loading ? (
        <p className="text-sm text-[#5C5C58] py-12 text-center">{t.common.loading}</p>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-xl bg-white border border-[#E5E3DC] text-center">
          <p className="text-sm text-[#5C5C58]">{t.common.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((job) => (
            <article
              key={job.id}
              className="p-6 rounded-xl bg-white border border-[#E5E3DC] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5C58] mb-2">
                  <span>
                    {job.category} · {job.workingHours}
                  </span>
                  <VerificationLabel status={job.verificationStatus} isDemo={job.isDemo} />
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="text-left text-lg font-bold text-[#252525] hover:text-[#176B4D] transition-colors cursor-pointer"
                >
                  {pickText(job.title, language)}
                </button>
                <p className="text-sm font-medium text-[#5C5C58] mt-1">{job.employerName}</p>
                <p className="text-sm text-[#5C5C58] mt-3 leading-relaxed line-clamp-3">
                  {pickText(job.description, language)}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C5C58]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#176B4D]" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#176B4D]">
                    <Briefcase className="w-3.5 h-3.5" />
                    {pickText(job.salaryDisplay, language)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#85847C]" />
                    {job.qualification}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#85847C]" />
                    Deadline: {job.deadline}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#85847C]">
                  <span>
                    {t.common.lastVerified}: {job.lastUpdated}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="font-semibold text-[#176B4D] hover:underline cursor-pointer"
                  >
                    Full Details →
                  </button>
                </div>

                <ActionToolbar
                  itemType="job"
                  itemId={job.id}
                  title={pickText(job.title, language)}
                  shareSummary={`${job.employerName} | ${job.location} | ${pickText(job.salaryDisplay, language)}`}
                  sharePath={`/jobs/${job.id}`}
                  externalUrl={job.applicationUrl || undefined}
                  externalLabel={job.isDemo ? 'Official Employment Portal' : 'Apply / Official Link'}
                  onExternalClick={() => trackAnalyticsEvent('job_referral', job.id)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Submit Job Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-[#E5E3DC] w-full max-w-2xl p-6 my-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E3DC]">
              <div>
                <h2 className="text-lg font-bold text-[#252525]">
                  Submit Local Employment Listing
                </h2>
                <p className="text-xs text-[#5C5C58] mt-0.5">
                  All submissions enter Pending Verification and are reviewed by Administrators
                  before appearing publicly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 text-[#5C5C58] hover:text-[#252525] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Job Title *</label>
                  <input
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Shop Billing Assistant"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Employer / Shop Name *</label>
                  <input
                    required
                    value={formEmployer}
                    onChange={(e) => setFormEmployer(e.target.value)}
                    placeholder="Organization name"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Location *</label>
                  <input
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as JobCategory)}
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm bg-white"
                  >
                    {JOB_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Min Salary / Wage (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formSalaryMin}
                    onChange={(e) => setFormSalaryMin(e.target.value)}
                    placeholder="e.g. 8000"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Max Salary / Wage (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formSalaryMax}
                    onChange={(e) => setFormSalaryMax(e.target.value)}
                    placeholder="e.g. 12000"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Qualification</label>
                  <input
                    value={formQual}
                    onChange={(e) => setFormQual(e.target.value)}
                    placeholder="e.g. Madhyamik / 12th Pass"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Official Application URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Job Description & Responsibilities *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Employer Verification Contact (Not published without consent)
                </label>
                <input
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  placeholder="Business email or office address"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
              </div>

              {submitError && <p className="text-xs text-red-700 font-medium">{submitError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5C5C58] cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? t.common.loading : 'Submit for Admin Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function JobDetailsPage({ jobId }: { jobId: string }) {
  const { language, t, navigate } = useApp();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch<{ job: JobListing }>(`/api/jobs/${jobId}`)
      .then((res) => {
        setJob(res.job);
        trackAnalyticsEvent('job_view', res.job.id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-sm text-[#5C5C58]">{t.common.loading}</div>;
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <p className="text-base font-semibold text-[#252525]">{error || 'Job listing not found.'}</p>
        <button
          type="button"
          onClick={() => navigate('/jobs')}
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
        onClick={() => navigate('/jobs')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C58] hover:text-[#176B4D] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.common.back}</span>
      </button>

      <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#E5E3DC] space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5C58] mb-2">
              <span>
                {job.category} · {job.location}
              </span>
              <span>·</span>
              <VerificationLabel status={job.verificationStatus} isDemo={job.isDemo} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252525]">
              {pickText(job.title, language)}
            </h1>
            <p className="mt-1 text-base font-medium text-[#5C5C58]">{job.employerName}</p>
          </div>
          <ReadAloudButton
            lang={language}
            text={`${pickText(job.title, language)}. ${job.employerName}. ${pickText(job.salaryDisplay, language)}. ${pickText(job.description, language)}. ${pickText(job.applicationInstructions, language)}`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC] text-sm">
          <div>
            <p className="text-xs text-[#85847C]">Salary / Wage</p>
            <p className="font-semibold text-[#176B4D] mt-0.5">
              {pickText(job.salaryDisplay, language)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#85847C]">Qualification</p>
            <p className="font-medium text-[#252525] mt-0.5">{job.qualification}</p>
          </div>
          <div>
            <p className="text-xs text-[#85847C]">Experience</p>
            <p className="font-medium text-[#252525] mt-0.5">{job.experience}</p>
          </div>
          <div>
            <p className="text-xs text-[#85847C]">Working Hours</p>
            <p className="font-medium text-[#252525] mt-0.5 inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#85847C]" />
              {job.workingHours}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#85847C]">Deadline</p>
            <p className="font-medium text-[#252525] mt-0.5">{job.deadline}</p>
          </div>
          <div>
            <p className="text-xs text-[#85847C]">Contact / Desk</p>
            <p className="font-medium text-[#252525] mt-0.5">{job.contactInfo}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#252525]">Job Description</h2>
          <p className="text-sm text-[#5C5C58] leading-relaxed">
            {pickText(job.description, language)}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#252525]">How to Apply</h2>
          <p className="text-sm text-[#5C5C58] leading-relaxed">
            {pickText(job.applicationInstructions, language)}
          </p>
        </div>

        <div className="pt-4 border-t border-[#E5E3DC] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5C5C58]">
          <div>
            <span className="text-[#85847C]">{t.common.sourceLabel}: </span>
            <span className="font-medium text-[#252525]">{job.sourceName}</span>
          </div>
          <div>
            <span className="text-[#85847C]">{t.common.lastVerified}: </span>
            <span className="font-medium text-[#252525]">{job.dateVerified || job.lastUpdated}</span>
          </div>
          <div>
            <span className="text-[#85847C]">Reviewer: </span>
            <span className="font-medium text-[#252525]">{job.reviewer}</span>
          </div>
        </div>

        <ActionToolbar
          itemType="job"
          itemId={job.id}
          title={pickText(job.title, language)}
          shareSummary={`${job.employerName} | ${job.location}`}
          sharePath={`/jobs/${job.id}`}
          externalUrl={job.applicationUrl || undefined}
          externalLabel={job.isDemo ? 'Open Official Employment Portal' : 'Apply via Official Source'}
          onExternalClick={() => trackAnalyticsEvent('job_referral', job.id)}
        />
      </div>

      <SafetyNotice />
    </div>
  );
}
