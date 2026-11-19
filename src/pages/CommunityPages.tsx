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
import { pickText } from '../i18n/translations';
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

export function AboutPage() {
  const { language, showToast } = useApp();
  const [workshopLogged, setWorkshopLogged] = useState(false);

  const registerWorkshopInterest = () => {
    if (workshopLogged) return;
    trackAnalyticsEvent('workshop_interest');
    setWorkshopLogged(true);
    showToast('Interest noted! Please share your preferred topic via the Contact page if you would like updates.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <PageHeader
        title={language === 'bn' ? 'JENOVA সম্পর্কে' : 'About JENOVA'}
        subtitle="A New Way to Grow Together — making essential information, government assistance, digital safety, employment opportunities, and local support accessible through one simple, inclusive platform."
      />

      <div className="rounded-2xl overflow-hidden bg-white border border-[#E5E3DC] grid grid-cols-1 md:grid-cols-12 items-center">
        <ResilientImage
          src={VISUAL_ASSETS.heroCommunityEmpowerment.src}
          alt={VISUAL_ASSETS.heroCommunityEmpowerment.alt}
          containerClassName="md:col-span-6 aspect-[16/10] w-full h-full"
        />
        <div className="md:col-span-6 p-6 sm:p-8 space-y-3">
          <JenovaLogo
            variant="light"
            size="sm"
            showTagline
            tagline={language === 'bn' ? 'নতুন সম্ভাবনা, সবার জন্য।' : 'A New Way to Grow Together.'}
          />
          <h2 className="text-xl font-bold text-[#252525] pt-1">
            A New Light of Hope, Guidance & Opportunity
          </h2>
          <p className="text-sm text-[#5C5C58] leading-relaxed">
            Built for first-time smartphone users, students, women, daily-wage workers, and
            neighbourhood shopkeepers across Mecheda, Purba Medinipur, and beyond to discover
            verified opportunities without jargon or middlemen.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-3">
          <h2 className="text-lg font-bold text-[#252525]">JENOVA Brand Mission</h2>
          <p className="text-sm text-[#5C5C58] leading-relaxed">
            To make essential information, government assistance, digital safety, employment
            opportunities and local support accessible to everyone through one simple, intelligent
            and inclusive digital platform in Bengali, English, and Hindi.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-3">
          <h2 className="text-lg font-bold text-[#252525]">What We Do Not Do</h2>
          <ul className="space-y-2 text-sm text-[#5C5C58]">
            <li>• We do NOT offer or sanction loans or promise guaranteed funding.</li>
            <li>• We do NOT guarantee employment or charge fees to job seekers.</li>
            <li>• We do NOT distribute government benefits or certify official scheme eligibility.</li>
            <li>• We NEVER collect Aadhaar numbers, bank OTPs, UPI PINs, or debit card details.</li>
          </ul>
        </div>
      </div>

      {/* Proposed 3-Month Pilot Roadmap (from Concept Note) */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-xl bg-white border border-[#E5E3DC] space-y-5">
        <img
          src={VISUAL_ASSETS.bgCreamAbstract.src}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative">
          <h2 className="text-xl font-bold text-[#252525]">
            Proposed 3-Month Pilot Plan (Mecheda, Purba Medinipur)
          </h2>
          <p className="text-xs text-[#5C5C58] mt-1">
            All figures and timelines below are proposed planning estimates from our concept note,
            not confirmed funding or achieved outcomes.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              month: 'Month 1',
              title: 'Community Survey & Listening',
              desc: 'Speak with Mecheda residents, youth, women’s SHGs, daily-wage workers, and local shopkeepers to map real information gaps.',
            },
            {
              month: 'Month 2',
              title: 'Prototype & Source Verification',
              desc: 'Refine mobile usability on entry-level Android phones and verify local training centres, employers, and official scheme links.',
            },
            {
              month: 'Month 3',
              title: 'User Testing & Awareness Workshop',
              desc: 'Conduct local digital/financial literacy sessions (planning target: ~100 families reached, ~50 individuals guided) and incorporate real feedback.',
            },
          ].map((m) => (
            <div key={m.month} className="p-4 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC]">
              <p className="font-mono text-xs font-semibold text-[#B56A10]">{m.month}</p>
              <h3 className="text-base font-bold text-[#252525] mt-1">{m.title}</h3>
              <p className="text-xs text-[#5C5C58] mt-2 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative pt-4 border-t border-[#E5E3DC] flex flex-wrap items-center justify-between gap-4">
          <a
            href="/assets/aistudio/community_financial_empowerment_project_note_8c729351.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#176B4D] hover:underline"
          >
            <FileText className="w-4 h-4" />
            <span>View Full Project Concept Note & Pilot Plan (PDF)</span>
          </a>

          <button
            type="button"
            onClick={registerWorkshopInterest}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#176B4D] text-white hover:bg-[#11533B] cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {workshopLogged
                ? 'Workshop Interest Recorded'
                : 'Express Interest in Mecheda Awareness Workshop'}
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
      showToast('Thank you! Your message has been received by the community coordination desk.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={language === 'bn' ? 'যোগাযোগ ও কমিউনিটি সহায়তা' : 'Contact & Community Support'}
        subtitle="Share feedback on the Mecheda pilot, request guidance navigating official portals, report suspicious or outdated information, or read community announcements."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-xl bg-white border border-[#E5E3DC]">
          <div className="flex flex-wrap gap-2 mb-6">
            {(
              [
                ['feedback', 'Share Feedback'],
                ['assistance', 'Request Assistance'],
                ['contact', 'General Contact'],
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
                    ? 'bg-[#176B4D] text-white'
                    : 'bg-[#FAF9F5] text-[#5C5C58] hover:text-[#252525]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {done && (
            <div className="mb-5 p-4 rounded-lg bg-[#EBF4F0] text-[#11533B] text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Submitted successfully! Our pilot coordinator will review it shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Your Name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Email or Phone (Optional — never share OTP/PIN)
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Suggestion for Mecheda training centre or scheme help"
                className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Message *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg disabled:opacity-60 cursor-pointer"
            >
              {submitting ? t.common.loading : t.common.submit}
            </button>
          </form>
        </div>

        {/* Announcements & Report Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-4">
            <h2 className="text-base font-bold text-[#252525] inline-flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#176B4D]" />
              <span>Community Announcements</span>
            </h2>
            <div className="space-y-4 divide-y divide-[#E5E3DC]">
              {announcements.map((a) => (
                <div key={a.id} className="pt-3 first:pt-0">
                  <p className="text-xs text-[#85847C]">
                    {a.category} · {a.publishedAt}
                  </p>
                  <h3 className="text-sm font-bold text-[#252525] mt-0.5">
                    {pickText(a.title, language)}
                  </h3>
                  <p className="text-xs text-[#5C5C58] mt-1 leading-relaxed">
                    {pickText(a.body, language)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-3">
            <h2 className="text-base font-bold text-[#252525]">
              Report Suspicious or Incorrect Listing
            </h2>
            <p className="text-xs text-[#5C5C58] leading-relaxed">
              Spotted an outdated government deadline, broken link, or someone asking for job fees?
              Report it directly to our verification desk.
            </p>
            <button
              type="button"
              onClick={() =>
                openReportModal({
                  targetType: 'general',
                  targetId: 'general',
                  targetTitle: 'General Platform Listing / Safety Report',
                })
              }
              className="px-4 py-2 text-xs font-semibold text-[#B56A10] bg-white border border-[#F4A340]/50 hover:bg-[#FEF4E6] rounded-lg cursor-pointer"
            >
              Open Report Form
            </button>
          </div>

          <SafetyNotice />
        </div>
      </div>
    </div>
  );
}

export function AuthPage() {
  const { language, login, register, navigate, user, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [town, setTown] = useState('Mecheda, Purba Medinipur');
  const [prefLang, setPrefLang] = useState<Language>(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#252525]">Signed in as {user.name}</h1>
        <p className="text-sm text-[#5C5C58]">
          {user.email} · Role: <span className="font-mono">{user.role}</span>
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#176B4D] rounded-lg cursor-pointer"
          >
            Go to Dashboard
          </button>
          {user.role !== 'user' && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-5 py-2.5 text-sm font-semibold text-[#176B4D] bg-[#EBF4F0] rounded-lg cursor-pointer"
            >
              Open Admin Panel
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
      showToast(`Welcome, ${account.name}!`);
      navigate(account.role !== 'user' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
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
      <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#E5E3DC]">
        <div className="flex justify-center mb-6">
          <JenovaLogo
            variant="light"
            size="md"
            animated
            showTagline
            tagline={language === 'bn' ? 'নতুন সম্ভাবনা, সবার জন্য।' : 'A New Way to Grow Together.'}
          />
        </div>
        <div className="flex gap-2 p-1 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC] mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md cursor-pointer ${
              mode === 'login' ? 'bg-[#176B4D] text-white' : 'text-[#5C5C58]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md cursor-pointer ${
              mode === 'register' ? 'bg-[#176B4D] text-white' : 'text-[#5C5C58]'
            }`}
          >
            Create Free Account
          </button>
        </div>

        <p className="text-xs text-[#5C5C58] mb-5">
          Registration is completely optional — all public jobs, skills, calculators, and government
          schemes are accessible without an account. Sign in to save bookmarks or track savings goals.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Village / Town</label>
                  <input
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Preferred Language</label>
                  <select
                    value={prefLang}
                    onChange={(e) => setPrefLang(e.target.value as Language)}
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2.5 text-sm bg-white"
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
            <label className="block text-xs font-semibold mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Password (min 6 characters) *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2.5 text-sm"
            />
          </div>

          {error && <p className="text-xs text-red-700 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Pilot RBAC Testing Helper */}
      <div className="p-5 rounded-xl bg-[#F2F0E8] border border-[#E5E3DC] space-y-3">
        <p className="text-xs font-bold text-[#252525] inline-flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#176B4D]" />
          <span>Pilot Evaluation Accounts (Click to Autofill)</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => quickFill('superadmin@mechedadisha.org', 'Admin@Mecheda2026')}
            className="p-2.5 rounded-lg bg-white border border-[#E5E3DC] hover:border-[#176B4D] text-left cursor-pointer"
          >
            <span className="font-semibold block text-[#252525]">Super Administrator</span>
            <span className="text-[#5C5C58]">Full RBAC + Analytics + Backup</span>
          </button>
          <button
            type="button"
            onClick={() => quickFill('editor@mechedadisha.org', 'Editor@Mecheda2026')}
            className="p-2.5 rounded-lg bg-white border border-[#E5E3DC] hover:border-[#176B4D] text-left cursor-pointer"
          >
            <span className="font-semibold block text-[#252525]">Content Administrator</span>
            <span className="text-[#5C5C58]">Manage listings & notices</span>
          </button>
          <button
            type="button"
            onClick={() => quickFill('reviewer@mechedadisha.org', 'Review@Mecheda2026')}
            className="p-2.5 rounded-lg bg-white border border-[#E5E3DC] hover:border-[#176B4D] text-left cursor-pointer"
          >
            <span className="font-semibold block text-[#252525]">Content Reviewer</span>
            <span className="text-[#5C5C58]">Verify queue & review reports</span>
          </button>
          <button
            type="button"
            onClick={() => quickFill('member@mechedadisha.org', 'Member@2026')}
            className="p-2.5 rounded-lg bg-white border border-[#E5E3DC] hover:border-[#176B4D] text-left cursor-pointer"
          >
            <span className="font-semibold block text-[#252525]">Community User</span>
            <span className="text-[#5C5C58]">Bookmarks & savings goals</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserDashboardPage() {
  const { user, token, bookmarks, language, navigate, logout, showToast } = useApp();
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
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#252525]">JENOVA Personal Dashboard</h1>
        <p className="text-sm text-[#5C5C58]">
          Sign in with a free JENOVA account to view your saved jobs, courses, schemes, and personal
          savings goals.
        </p>
        <button
          type="button"
          onClick={() => navigate('/auth')}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#176B4D] rounded-lg cursor-pointer"
        >
          Sign In or Register
        </button>
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
      showToast('Your account and personal bookmarks have been permanently deleted.');
      logout();
      navigate('/');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title={`Welcome to JENOVA, ${user.name}`}
        subtitle={`${user.town} · ${user.email} · Account Role: ${user.role}`}
        action={
          user.role !== 'user' ? (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#176B4D] rounded-lg cursor-pointer"
            >
              Open Admin Dashboard →
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Bookmarks */}
        <section className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-4">
          <h2 className="text-lg font-bold text-[#252525] inline-flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#176B4D]" />
            <span>Saved Bookmarks ({bookmarks.length})</span>
          </h2>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-[#5C5C58]">
              No saved items yet. Click “Bookmark” on any job, skill course, scheme, or business to
              save it here.
            </p>
          ) : (
            <div className="divide-y divide-[#E5E3DC]">
              {bookmarks.map((bm) => {
                const info = resolveBookmarkLabel(bm.itemType, bm.itemId);
                return (
                  <button
                    key={bm.id}
                    type="button"
                    onClick={() => navigate(info.path)}
                    className="w-full py-3 text-left flex items-center justify-between gap-3 hover:text-[#176B4D] cursor-pointer"
                  >
                    <div>
                      <p className="text-xs text-[#85847C] capitalize">{bm.itemType}</p>
                      <p className="text-sm font-semibold text-[#252525]">{info.title}</p>
                    </div>
                    <span className="text-xs text-[#176B4D]">Open →</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Savings Goals */}
        <section className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#252525]">My Savings Goals ({goals.length})</h2>
            <button
              type="button"
              onClick={() => navigate('/finance/savings')}
              className="text-xs font-semibold text-[#176B4D] hover:underline cursor-pointer"
            >
              Manage Goals →
            </button>
          </div>
          {goals.length === 0 ? (
            <p className="text-sm text-[#5C5C58]">
              Track emergency funds or education goals in the Savings Calculator.
            </p>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => {
                const pct = Math.min(
                  100,
                  Math.round((g.savedAmount / Math.max(1, g.targetAmount)) * 100)
                );
                return (
                  <div key={g.id} className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC]">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>{g.title}</span>
                      <span className="font-mono tabular-nums text-[#176B4D]">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E5E3DC] overflow-hidden">
                      <div className="h-full bg-[#176B4D]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Privacy & Data Deletion Control */}
      <section className="p-6 rounded-xl bg-white border border-[#E5E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#252525]">Privacy & Account Data Deletion</h2>
          <p className="text-xs text-[#5C5C58] mt-1">
            We store only your name, email, town, bookmarks, and savings goals. You may permanently
            delete your personal data at any time.
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
            <span>{deleting ? 'Deleting...' : 'Delete My Account & Data'}</span>
          </button>
        )}
      </section>
    </div>
  );
}
