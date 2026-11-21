import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  MapPin,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { localizeJobCategory, pickText, tr } from '../i18n/translations';
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
  const [formLocation, setFormLocation] = useState('');
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: jobs.length };
    for (const cat of JOB_CATEGORIES) counts[cat] = 0;
    for (const j of jobs) {
      counts[j.category] = (counts[j.category] || 0) + 1;
    }
    return counts;
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (category !== 'ALL' && job.category !== category) return false;
      const comparableMax = job.salaryUnit === 'daily' ? job.salaryMax * 25 : job.salaryMax;
      if (minSalary > 0 && comparableMax > 0 && comparableMax < minSalary) return false;
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
      showToast(
        tr(
          language,
          'কাজের বিজ্ঞপ্তি যাচাইয়ের জন্য জমা হয়েছে। অনুমোদনের পর এটি প্রকাশিত হবে।',
          'नौकरी की सूचना सत्यापन के लिए जमा हो गई है। स्वीकृति के बाद यह प्रकाशित होगी।',
          res.message
        )
      );
      setShowSubmitModal(false);
      setFormTitle('');
      setFormEmployer('');
      setFormDesc('');
      setFormContact('');
      setFormUrl('');
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : tr(language, 'জমা দেওয়া ব্যর্থ হয়েছে।', 'सबमिट करना विफल रहा।', 'Submission failed.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(
          language,
          'কর্মসংস্থান পোর্টাল ও স্থানীয় কাজের তথ্য',
          'रोजगार पोर्टल और स्थानीय अवसर',
          'Employment Discovery Portal'
        )}
        subtitle={tr(
          language,
          'যাচাইকৃত সরকারি কর্মসংস্থান পোর্টাল, রিমোট ও স্থানীয় সুযোগ এবং স্বচ্ছ নিয়োগের পথ — কোনো অগ্রিম ফি বা দালাল ছাড়া আপনার ক্যারিয়ার গড়ুন।',
          'सत्यापित सरकारी रोजगार पोर्टल, वर्क-फ्रॉम-होम, निजी क्षेत्र और कौशल आधारित अवसर — बिना किसी अग्रिम शुल्क या बिचौलिए के अपना करियर बनाएं।',
          'Verified government recruitment portals, remote roles, private-sector pathways, and skilled trades across India — zero fees, zero middlemen, reviewed before publication.'
        )}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/jobs/biodata')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] bg-[#FFE5C2] border border-[#F4A340]/30 hover:bg-[#DDECE5] rounded-lg whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>
                {tr(
                  language,
                  '১-মিনিটে বায়োডাটা বানান',
                  '1-मिनट में बायोडाटा बनाएं',
                  '1-Minute Biodata Builder'
                )}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold jenova-saffron-btn rounded-lg whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {tr(
                  language,
                  'কাজের বিজ্ঞপ্তি জমা দিন',
                  'सत्यापन के लिए नौकरी जमा करें',
                  'Submit Job for Verification'
                )}
              </span>
            </button>
          </div>
        }
      />

      {/* Authentic Employment Pathways Visual Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl overflow-hidden bg-white border border-[#F2DCC1] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.employmentProfessionals.src}
            alt={VISUAL_ASSETS.employmentProfessionals.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-3.5 border-t border-[#F2DCC1]">
            <p className="text-sm font-bold text-[#26364B]">
              {tr(
                language,
                'অফিস, কম্পিউটার ও সরকারি কর্মসংস্থান পোর্টাল',
                'ऑफिस, डिजिटल और सरकारी रोजगार पोर्टल',
                'Office, Digital & Government Career Pathways'
              )}
            </p>
            <p className="text-xs text-[#454545] mt-0.5">
              {tr(
                language,
                'ন্যাশনাল ক্যারিয়ার সার্ভিস, পশ্চিমবঙ্গ এমপ্লয়মেন্ট ব্যাংক এবং যাচাইকৃত বেসরকারি সুযোগ।',
                'नेशनल करियर सर्विस, राज्य रोजगार पोर्टल और सत्यापित निजी क्षेत्र के अवसर।',
                'National Career Service, WB Employment Bank, and verified entry-level private roles.'
              )}
            </p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-white border border-[#F2DCC1] flex flex-col">
          <ResilientImage
            src={VISUAL_ASSETS.employmentTechnicians.src}
            alt={VISUAL_ASSETS.employmentTechnicians.alt}
            containerClassName="aspect-[16/9] w-full"
          />
          <div className="px-5 py-3.5 border-t border-[#F2DCC1]">
            <p className="text-sm font-bold text-[#26364B]">
              {tr(
                language,
                'দক্ষ কারিগরি, অ্যাপ্রেন্টিসশিপ ও স্থানীয় কাজ',
                'कुशल तकनीकी, अप्रेंटिसशिप और स्थानीय कार्य',
                'Skilled Technical, Apprenticeship & Local Trades'
              )}
            </p>
            <p className="text-xs text-[#454545] mt-0.5">
              {tr(
                language,
                'NAPS অ্যাপ্রেন্টিসশিপ, ITI কারিগরি ট্রেড, রিটেল, ডেলিভারি এবং স্থানীয় পরিষেবা।',
                'NAPS अप्रेंटिसशिप, ITI तकनीकी ट्रेड, रिटेल, डिलीवरी और स्थानीय सेवा कार्य।',
                'NAPS apprenticeships, ITI technical trades, retail, delivery, and local service roles.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Official Employment Bank — Government of West Bengal Initiative Spotlight */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#FFF1DF] via-white to-[#FFE5C2]/65 dark:from-[#261B12] dark:via-[#241B13] dark:to-[#2D1E12] border border-[#F2DCC1] dark:border-[#4A3522] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl jenova-saffron-btn flex items-center justify-center shrink-0 shadow-sm">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE5C2] dark:bg-[#382616] text-[#26364B] dark:text-[#FFD19A] border border-[#F4A340]/45">
                {tr(
                  language,
                  'পশ্চিমবঙ্গ সরকারের উদ্যোগ',
                  'पश्चिम बंगाल सरकार की पहल',
                  'Government of West Bengal Initiative'
                )}
              </span>
              <VerificationLabel status="Officially Verified" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#26364B] dark:text-[#FFF5E8] leading-snug">
              {tr(
                language,
                'এমপ্লয়মেন্ট ব্যাংক — পশ্চিমবঙ্গ সরকারের অফিসিয়াল কর্মসংস্থান পোর্টাল',
                'एम्प्लॉयमेंट बैंक — पश्चिम बंगाल सरकार का आधिकारिक रोजगार पोर्टल',
                'Employment Bank — Government of West Bengal Initiative'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#454545] dark:text-[#DDD2C5] mt-1 leading-relaxed">
              {tr(
                language,
                'শ্রম দপ্তরের অফিসিয়াল পোর্টালে বিনামূল্যে চাকরিপ্রার্থী নিবন্ধন করুন এবং পশ্চিমবঙ্গের সরকারি ও অনুমোদিত চাকরির বিজ্ঞপ্তি সরাসরি দেখুন।',
                'श्रम विभाग के आधिकारिक पोर्टल पर निःशुल्क पंजीकरण करें और पश्चिम बंगाल की सत्यापित नौकरी अधिसूचनाएं सीधे देखें।',
                'Register 100% free as a job seeker and access official recruitment notifications directly on the Department of Labour, Government of West Bengal portal.'
              )}
            </p>
          </div>
        </div>
        <a
          href="https://employmentbankwb.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAnalyticsEvent('job_referral', 'job-wb-employment-bank')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl jenova-saffron-btn text-xs sm:text-sm font-bold shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          <span>
            {tr(
              language,
              'employmentbankwb.gov.in খুলুন',
              'employmentbankwb.gov.in खोलें',
              'Visit Employment Bank'
            )}
          </span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="mb-6">
        <SafetyNotice />
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-xl bg-white border border-[#F2DCC1] mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#665B4F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#F2DCC1] text-sm bg-[#FFF1DF] focus:bg-white"
            />
          </div>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder={tr(
              language,
              'স্থান (যেমন: রিমোট, কলকাতা, সর্বভারতীয়)',
              'स्थान (जैसे: रिमोट, कोलकाता, अखिल भारतीय)',
              'Location (e.g. Remote, Kolkata, Pan-India)'
            )}
            className="w-full px-3 py-2.5 rounded-lg border border-[#F2DCC1] text-sm bg-[#FFF1DF] focus:bg-white"
          />
          <input
            type="text"
            value={qualFilter}
            onChange={(e) => setQualFilter(e.target.value)}
            placeholder={tr(
              language,
              'শিক্ষাগত যোগ্যতা (যেমন: দ্বাদশ, ITI)',
              'योग्यता (जैसे: 12वीं, ITI)',
              'Qualification (e.g. 12th, ITI)'
            )}
            className="w-full px-3 py-2.5 rounded-lg border border-[#F2DCC1] text-sm bg-[#FFF1DF] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#F2DCC1]">
          <div className="flex flex-wrap items-center gap-1.5">
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
            {JOB_CATEGORIES.map((cat) => (
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
                {localizeJobCategory(cat, language)} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#454545]">
            <label htmlFor="min-sal">
              {tr(language, 'ন্যূনতম বেতন:', 'न्यूनतम वेतन:', 'Min Salary:')}
            </label>
            <select
              id="min-sal"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="rounded-md border border-[#F2DCC1] bg-white px-2.5 py-1.5 text-xs text-[#26364B]"
            >
              <option value={0}>{tr(language, 'যেকোনো', 'कोई भी', 'Any')}</option>
              <option value={5000}>₹5,000+</option>
              <option value={8000}>₹8,000+</option>
              <option value={10000}>₹10,000+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Cards */}
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
              setLocationFilter('');
              setQualFilter('');
              setMinSalary(0);
            }}
            className="px-4 py-2 text-xs font-semibold jenova-saffron-btn rounded-lg cursor-pointer"
          >
            {tr(language, 'সব ফিল্টার রিসেট করুন', 'सभी फ़िल्टर रीसेट करें', 'Reset All Filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((job) => (
            <article
              key={job.id}
              className="p-6 rounded-xl bg-white border border-[#F2DCC1] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#454545] mb-2">
                  <span>
                    {localizeJobCategory(job.category, language)} · {job.workingHours}
                  </span>
                  <VerificationLabel status={job.verificationStatus} isDemo={job.isDemo} />
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="text-left text-lg font-bold text-[#26364B] hover:text-[#A85B0A] dark:hover:text-[#FFD19A] transition-colors cursor-pointer"
                >
                  {pickText(job.title, language)}
                </button>
                <p className="text-sm font-medium text-[#454545] mt-1">{job.employerName}</p>
                <p className="text-sm text-[#454545] mt-3 leading-relaxed line-clamp-3">
                  {pickText(job.description, language)}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#454545]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A85B0A] dark:text-[#FFD19A]" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
                    <Briefcase className="w-3.5 h-3.5" />
                    {pickText(job.salaryDisplay, language)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#665B4F]" />
                    {job.qualification}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#665B4F]" />
                    {tr(language, 'শেষ তারিখ:', 'अंतिम तिथि:', 'Deadline:')} {job.deadline}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#665B4F]">
                  <span>
                    {t.common.lastVerified}: {job.lastUpdated}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
                  >
                    {tr(language, 'সম্পূর্ণ বিবরণ →', 'पूरा विवरण →', 'Full Details →')}
                  </button>
                </div>

                <ActionToolbar
                  itemType="job"
                  itemId={job.id}
                  title={pickText(job.title, language)}
                  shareSummary={`${job.employerName} | ${job.location} | ${pickText(job.salaryDisplay, language)}`}
                  sharePath={`/jobs/${job.id}`}
                  externalUrl={job.applicationUrl || undefined}
                  externalLabel={tr(
                    language,
                    'আবেদন / অফিসিয়াল পোর্টাল',
                    'आवेदन / आधिकारिक पोर्टल',
                    'Apply / Official Portal'
                  )}
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
          <div className="bg-white rounded-xl border border-[#F2DCC1] w-full max-w-2xl p-6 my-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2DCC1]">
              <div>
                <h2 className="text-lg font-bold text-[#26364B]">
                  {tr(
                    language,
                    'স্থানীয় কর্মসংস্থানের বিজ্ঞপ্তি জমা দিন',
                    'स्थानीय रोजगार सूची जमा करें',
                    'Submit Local Employment Listing'
                  )}
                </h2>
                <p className="text-xs text-[#454545] mt-0.5">
                  {tr(
                    language,
                    'সমস্ত জমা দেওয়া বিজ্ঞপ্তি আগে যাচাইকরণ তালিকায় যায় এবং অ্যাডমিনদের অনুমোদনের পরই প্রকাশ করা হয়।',
                    'सभी प्रविष्टियां पहले सत्यापन लंबित सूची में जाती हैं और एडमिन समीक्षा के बाद ही प्रकाशित होती हैं।',
                    'All submissions enter Pending Verification and are reviewed by Administrators before appearing publicly.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 text-[#454545] hover:text-[#26364B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'পদের নাম *', 'पद का नाम *', 'Job Title *')}
                  </label>
                  <input
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={tr(
                      language,
                      'যেমন: দোকান বিলিং সহকারী',
                      'जैसे: शॉप बिलिंग असिस्टेंट',
                      'e.g. Shop Billing Assistant'
                    )}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'প্রতিষ্ঠান / দোকানের নাম *', 'नियोक्ता / दुकान का नाम *', 'Employer / Shop Name *')}
                  </label>
                  <input
                    required
                    value={formEmployer}
                    onChange={(e) => setFormEmployer(e.target.value)}
                    placeholder={tr(language, 'প্রতিষ্ঠানের নাম', 'संस्थान का नाम', 'Organization name')}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'স্থান *', 'स्थान *', 'Location *')}
                  </label>
                  <input
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder={tr(
                      language,
                      'যেমন: কলকাতা, বেঙ্গালুরু, রিমোট',
                      'जैसे: कोलकाता, बेंगलुरु, रिमोट',
                      'e.g. Kolkata, Bengaluru, Remote'
                    )}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'বিভাগ', 'श्रेणी', 'Category')}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as JobCategory)}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm bg-white"
                  >
                    {JOB_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {localizeJobCategory(c, language)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'ন্যূনতম বেতন / মজুরি (₹)', 'न्यूनतम वेतन / मजदूरी (₹)', 'Min Salary / Wage (₹)')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formSalaryMin}
                    onChange={(e) => setFormSalaryMin(e.target.value)}
                    placeholder={tr(language, 'যেমন: 8000', 'जैसे: 8000', 'e.g. 8000')}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'সর্বোচ্চ বেতন / মজুরি (₹)', 'अधिकतम वेतन / मजदूरी (₹)', 'Max Salary / Wage (₹)')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formSalaryMax}
                    onChange={(e) => setFormSalaryMax(e.target.value)}
                    placeholder={tr(language, 'যেমন: 12000', 'जैसे: 12000', 'e.g. 12000')}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'শিক্ষাগত যোগ্যতা', 'योग्यता', 'Qualification')}
                  </label>
                  <input
                    value={formQual}
                    onChange={(e) => setFormQual(e.target.value)}
                    placeholder={tr(
                      language,
                      'যেমন: মাধ্যমিক / উচ্চমাধ্যমিক পাস',
                      'जैसे: 10वीं / 12वीं पास',
                      'e.g. Madhyamik / 12th Pass'
                    )}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(
                      language,
                      'অফিসিয়াল আবেদন লিঙ্ক (ঐচ্ছিক)',
                      'आधिकारिक आवेदन लिंक (वैकल्पिक)',
                      'Official Application URL (Optional)'
                    )}
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {tr(
                    language,
                    'কাজের বিবরণ ও দায়িত্ব *',
                    'कार्य विवरण और जिम्मेदारियां *',
                    'Job Description & Responsibilities *'
                  )}
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {tr(
                    language,
                    'নিয়োগকর্তার যাচাই যোগাযোগ (সম্মতি ছাড়া প্রকাশিত হবে না)',
                    'नियोक्ता सत्यापन संपर्क (सहमति के बिना प्रकाशित नहीं होगा)',
                    'Employer Verification Contact (Not published without consent)'
                  )}
                </label>
                <input
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  placeholder={tr(
                    language,
                    'ব্যবসায়িক ইমেইল বা অফিসের ঠিকানা',
                    'व्यवसाय ईमेल या कार्यालय पता',
                    'Business email or office address'
                  )}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                />
              </div>

              {submitError && <p className="text-xs text-red-700 font-medium">{submitError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#454545] cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold jenova-saffron-btn rounded-lg disabled:opacity-60 cursor-pointer"
                >
                  {submitting
                    ? t.common.loading
                    : tr(
                        language,
                        'অ্যাডমিন যাচাইয়ের জন্য জমা দিন',
                        'एडमिन समीक्षा के लिए जमा करें',
                        'Submit for Admin Review'
                      )}
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
    return <div className="max-w-4xl mx-auto px-4 py-16 text-sm text-[#454545]">{t.common.loading}</div>;
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <p className="text-base font-semibold text-[#26364B]">
          {error || tr(language, 'কাজের তালিকা পাওয়া যায়নি।', 'नौकरी की सूची नहीं मिली।', 'Job listing not found.')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/jobs')}
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
        onClick={() => navigate('/jobs')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#454545] hover:text-[#A85B0A] dark:hover:text-[#FFD19A] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.common.back}</span>
      </button>

      <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#F2DCC1] space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#454545] mb-2">
              <span>
                {localizeJobCategory(job.category, language)} · {job.location}
              </span>
              <span>·</span>
              <VerificationLabel status={job.verificationStatus} isDemo={job.isDemo} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#26364B]">
              {pickText(job.title, language)}
            </h1>
            <p className="mt-1 text-base font-medium text-[#454545]">{job.employerName}</p>
          </div>
          <ReadAloudButton
            lang={language}
            text={`${pickText(job.title, language)}. ${job.employerName}. ${pickText(job.salaryDisplay, language)}. ${pickText(job.description, language)}. ${pickText(job.applicationInstructions, language)}`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-[#FFF1DF] border border-[#F2DCC1] text-sm">
          <div>
            <p className="text-xs text-[#665B4F]">
              {tr(language, 'বেতন / মজুরি', 'वेतन / मजदूरी', 'Salary / Wage')}
            </p>
            <p className="font-semibold text-[#A85B0A] dark:text-[#FFD19A] mt-0.5">
              {pickText(job.salaryDisplay, language)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#665B4F]">
              {tr(language, 'শিক্ষাগত যোগ্যতা', 'योग्यता', 'Qualification')}
            </p>
            <p className="font-medium text-[#26364B] mt-0.5">{job.qualification}</p>
          </div>
          <div>
            <p className="text-xs text-[#665B4F]">
              {tr(language, 'অভিজ্ঞতা', 'अनुभव', 'Experience')}
            </p>
            <p className="font-medium text-[#26364B] mt-0.5">{job.experience}</p>
          </div>
          <div>
            <p className="text-xs text-[#665B4F]">
              {tr(language, 'কাজের সময়', 'कार्य समय', 'Working Hours')}
            </p>
            <p className="font-medium text-[#26364B] mt-0.5 inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#665B4F]" />
              {job.workingHours}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#665B4F]">
              {tr(language, 'আবেদনের শেষ তারিখ', 'अंतिम तिथि', 'Deadline')}
            </p>
            <p className="font-medium text-[#26364B] mt-0.5">{job.deadline}</p>
          </div>
          <div>
            <p className="text-xs text-[#665B4F]">
              {tr(language, 'যোগাযোগ / ডেস্ক', 'संपर्क / डेस्क', 'Contact / Desk')}
            </p>
            <p className="font-medium text-[#26364B] mt-0.5">{job.contactInfo}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#26364B]">
            {tr(language, 'কাজের বিবরণ', 'कार्य विवरण', 'Job Description')}
          </h2>
          <p className="text-sm text-[#454545] leading-relaxed">
            {pickText(job.description, language)}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#26364B]">
            {tr(language, 'আবেদনের পদ্ধতি', 'आवेदन कैसे करें', 'How to Apply')}
          </h2>
          <p className="text-sm text-[#454545] leading-relaxed">
            {pickText(job.applicationInstructions, language)}
          </p>
        </div>

        <div className="pt-4 border-t border-[#F2DCC1] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#454545]">
          <div>
            <span className="text-[#665B4F]">{t.common.sourceLabel}: </span>
            <span className="font-medium text-[#26364B]">{job.sourceName}</span>
          </div>
          <div>
            <span className="text-[#665B4F]">{t.common.lastVerified}: </span>
            <span className="font-medium text-[#26364B]">{job.dateVerified || job.lastUpdated}</span>
          </div>
          <div>
            <span className="text-[#665B4F]">
              {tr(language, 'পর্যালোচক:', 'समीक्षक:', 'Reviewer:')}{' '}
            </span>
            <span className="font-medium text-[#26364B]">{job.reviewer}</span>
          </div>
        </div>

        <ActionToolbar
          itemType="job"
          itemId={job.id}
          title={pickText(job.title, language)}
          shareSummary={`${job.employerName} | ${job.location}`}
          sharePath={`/jobs/${job.id}`}
          externalUrl={job.applicationUrl || undefined}
          externalLabel={tr(
            language,
            'অফিসিয়াল উৎসের মাধ্যমে আবেদন করুন',
            'आधिकारिक स्रोत से आवेदन करें',
            'Apply via Official Source'
          )}
          onExternalClick={() => trackAnalyticsEvent('job_referral', job.id)}
        />
      </div>

      <SafetyNotice />
    </div>
  );
}
