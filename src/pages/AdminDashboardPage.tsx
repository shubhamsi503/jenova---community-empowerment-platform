import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Download,
  FilePlus2,
  Flag,
  Lock,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import type {
  Announcement,
  AssistanceCentreCategory,
  BusinessProfile,
  ContentReport,
  CourseListing,
  FeedbackSubmission,
  FraudAlert,
  JobListing,
  LocalAssistanceCentre,
  PlatformAnalytics,
  UserAccount,
  UserRole,
  VerificationLog,
  VerificationStatus,
  WelfareScheme,
} from '../types/platform';
import { PageHeader, VerificationLabel } from '../components/SharedUI';

interface AdminOverview {
  analytics: PlatformAnalytics;
  jobs: JobListing[];
  courses: CourseListing[];
  schemes: WelfareScheme[];
  businesses: BusinessProfile[];
  assistanceCentres?: LocalAssistanceCentre[];
  fraudAlerts?: FraudAlert[];
  reports: ContentReport[];
  feedback: FeedbackSubmission[];
  announcements: Announcement[];
  verificationLogs: VerificationLog[];
  users: UserAccount[];
}

type AdminTab =
  | 'analytics'
  | 'moderation'
  | 'content_cms'
  | 'local_safety'
  | 'reports'
  | 'feedback'
  | 'announcements'
  | 'logs'
  | 'roles';

export function AdminDashboardPage() {
  const { user, token, navigate, showToast } = useApp();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [modEntity, setModEntity] = useState<'job' | 'course' | 'scheme' | 'business' | 'assistance'>('job');

  // Announcement form state (Content Admin+)
  const [annTitleEn, setAnnTitleEn] = useState('');
  const [annTitleBn, setAnnTitleBn] = useState('');
  const [annBodyEn, setAnnBodyEn] = useState('');
  const [annCategory, setAnnCategory] = useState('Community Notice');

  // Local Assistance Centre creation state (Content Admin+)
  const [acNameEn, setAcNameEn] = useState('');
  const [acNameBn, setAcNameBn] = useState('');
  const [acCategory, setAcCategory] = useState<AssistanceCentreCategory>('Bangla Sahayata Kendra');
  const [acArea, setAcArea] = useState('Mecheda, Purba Medinipur');
  const [acAddress, setAcAddress] = useState('');
  const [acOfficialUrl, setAcOfficialUrl] = useState('');
  const [acSourceName, setAcSourceName] = useState('');
  const [acServices, setAcServices] = useState('');

  // Community Fraud Alert creation state (Content Admin+)
  const [faTitleEn, setFaTitleEn] = useState('');
  const [faTitleBn, setFaTitleBn] = useState('');
  const [faSummaryEn, setFaSummaryEn] = useState('');
  const [faSafeEn, setFaSafeEn] = useState('');
  const [faScamType, setFaScamType] = useState<FraudAlert['scamType']>('OTP / UPI Trap');

  // Manage Content CMS forms (Schemes, Jobs, Courses)
  const [schName, setSchName] = useState('');
  const [schDept, setSchDept] = useState('');
  const [schScope, setSchScope] = useState<'West Bengal' | 'Central India'>('West Bengal');
  const [schCategory, setSchCategory] = useState<WelfareScheme['category']>('Social Security');
  const [schUrl, setSchUrl] = useState('');
  const [schDesc, setSchDesc] = useState('');
  const [schBenefits, setSchBenefits] = useState('');
  const [schEligibility, setSchEligibility] = useState('');
  const [schDocs, setSchDocs] = useState('');

  // Edit existing scheme state
  const [editSchemeId, setEditSchemeId] = useState('');
  const [editSchemeBenefits, setEditSchemeBenefits] = useState('');
  const [editSchemeUrl, setEditSchemeUrl] = useState('');
  const [editSchemeExpiry, setEditSchemeExpiry] = useState('');

  // Verified Job creation state
  const [jobTitle, setJobTitle] = useState('');
  const [jobEmployer, setJobEmployer] = useState('');
  const [jobLocation, setJobLocation] = useState('Mecheda, Purba Medinipur');
  const [jobSalary, setJobSalary] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExpiry, setJobExpiry] = useState('2026-12-31');

  // Training Course creation state
  const [crsName, setCrsName] = useState('');
  const [crsProvider, setCrsProvider] = useState('');
  const [crsUrl, setCrsUrl] = useState('');
  const [crsDesc, setCrsDesc] = useState('');
  const [crsMode, setCrsMode] = useState<'Online' | 'Offline' | 'Hybrid'>('Online');

  const isAuthorized = user && user.role !== 'user';
  const canEditContent = user && (user.role === 'content_admin' || user.role === 'super_admin');
  const isSuperAdmin = user?.role === 'super_admin';

  const loadOverview = useCallback(async () => {
    if (!token || !isAuthorized) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch<AdminOverview>('/api/admin/overview', {}, token);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load admin console.');
    } finally {
      setLoading(false);
    }
  }, [token, isAuthorized]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  if (!user || !isAuthorized) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <Lock className="w-8 h-8 text-[#B56A10] mx-auto" />
        <h1 className="text-2xl font-bold text-[#252525]">Restricted Administration Area</h1>
        <p className="text-sm text-[#5C5C58]">
          Public users cannot access administrative operations. Sign in with an authorized Content
          Reviewer, Content Administrator, or Super Administrator account.
        </p>
        <button
          type="button"
          onClick={() => navigate('/auth')}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#176B4D] rounded-lg cursor-pointer"
        >
          Sign In to Admin Account
        </button>
      </div>
    );
  }

  const updateVerificationStatus = async (
    entityType: 'job' | 'course' | 'scheme' | 'business' | 'assistance',
    entityId: string,
    newStatus: VerificationStatus
  ) => {
    try {
      await apiFetch(
        '/api/admin/verify',
        {
          method: 'PATCH',
          body: JSON.stringify({
            entityType,
            entityId,
            newStatus,
            note: `Updated to ${newStatus} via Admin Verification Queue`,
          }),
        },
        token
      );
      showToast(`Listing updated to ${newStatus}.`);
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const updateExpiryDate = async (
    entityType: 'job' | 'course' | 'scheme' | 'business' | 'assistance',
    entityId: string,
    expiryDate: string
  ) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return;
    try {
      await apiFetch(
        '/api/admin/expiry',
        {
          method: 'PATCH',
          body: JSON.stringify({ entityType, entityId, expiryDate }),
        },
        token
      );
      showToast(`Review/expiry date updated to ${expiryDate}.`);
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Expiry update failed.');
    }
  };

  const handleAddScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/admin/schemes',
        {
          method: 'POST',
          body: JSON.stringify({
            officialName: schName,
            department: schDept,
            scope: schScope,
            category: schCategory,
            officialWebsite: schUrl,
            description: schDesc,
            benefits: schBenefits,
            eligibilityRequirements: schEligibility,
            requiredDocuments: schDocs,
          }),
        },
        token
      );
      setSchName('');
      setSchDept('');
      setSchUrl('');
      setSchDesc('');
      setSchBenefits('');
      setSchEligibility('');
      setSchDocs('');
      showToast('Scheme added to Verification Queue.');
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to add scheme.');
    }
  };

  const handleEditScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSchemeId) return;
    try {
      await apiFetch(
        `/api/admin/schemes/${editSchemeId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            benefits: editSchemeBenefits || undefined,
            officialWebsite: editSchemeUrl || undefined,
            expiryDate: editSchemeExpiry || undefined,
          }),
        },
        token
      );
      showToast('Scheme details updated with audit log.');
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update scheme.');
    }
  };

  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/admin/jobs',
        {
          method: 'POST',
          body: JSON.stringify({
            title: jobTitle,
            employerName: jobEmployer,
            location: jobLocation,
            salaryDisplay: jobSalary,
            applicationUrl: jobUrl,
            description: jobDesc,
            expiryDate: jobExpiry,
            publishDirectly: true,
          }),
        },
        token
      );
      setJobTitle('');
      setJobEmployer('');
      setJobSalary('');
      setJobUrl('');
      setJobDesc('');
      showToast('Verified job listing published.');
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to publish job.');
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/admin/courses',
        {
          method: 'POST',
          body: JSON.stringify({
            name: crsName,
            provider: crsProvider,
            applicationUrl: crsUrl,
            description: crsDesc,
            mode: crsMode,
            isFree: true,
          }),
        },
        token
      );
      setCrsName('');
      setCrsProvider('');
      setCrsUrl('');
      setCrsDesc('');
      showToast('Training course added to Verification Queue.');
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to add training course.');
    }
  };

  const updateReportStatus = async (id: string, status: 'Open' | 'Reviewed' | 'Resolved') => {
    try {
      await apiFetch(`/api/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
      showToast(`Report marked ${status}.`);
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed.');
    }
  };

  const updateFeedbackStatus = async (id: string, status: 'New' | 'Reviewed' | 'Closed') => {
    try {
      await apiFetch(`/api/admin/feedback/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
      showToast(`Feedback marked ${status}.`);
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed.');
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/admin/announcements',
        {
          method: 'POST',
          body: JSON.stringify({
            titleEn: annTitleEn,
            titleBn: annTitleBn || annTitleEn,
            bodyEn: annBodyEn,
            bodyBn: annBodyEn,
            category: annCategory,
          }),
        },
        token
      );
      setAnnTitleEn('');
      setAnnTitleBn('');
      setAnnBodyEn('');
      showToast('Announcement published.');
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to publish announcement.');
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }, token);
      showToast('User role updated.');
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Role update failed.');
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const snap = await apiFetch<Record<string, unknown>>('/api/admin/backup', {}, token);
      const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jenova-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Database backup JSON downloaded.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Backup failed.');
    }
  };

  const handleAddAssistanceCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/admin/assistance',
        {
          method: 'POST',
          body: JSON.stringify({
            nameEn: acNameEn,
            nameBn: acNameBn || acNameEn,
            category: acCategory,
            locationArea: acArea,
            address: acAddress,
            descriptionEn: acAddress,
            officialPortalUrl: acOfficialUrl,
            sourceName: acSourceName || 'Verified Local Field Desk',
            servicesOffered: acServices,
          }),
        },
        token
      );
      setAcNameEn('');
      setAcNameBn('');
      setAcAddress('');
      setAcOfficialUrl('');
      setAcSourceName('');
      setAcServices('');
      showToast('Local Assistance Centre added.');
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to add assistance centre.');
    }
  };

  const handlePublishFraudAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/admin/fraud-alerts',
        {
          method: 'POST',
          body: JSON.stringify({
            titleEn: faTitleEn,
            titleBn: faTitleBn || faTitleEn,
            summaryEn: faSummaryEn,
            safetyTipEn: faSafeEn,
            scamType: faScamType,
          }),
        },
        token
      );
      setFaTitleEn('');
      setFaTitleBn('');
      setFaSummaryEn('');
      setFaSafeEn('');
      showToast('Community Fraud Alert published.');
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to publish fraud alert.');
    }
  };

  const tabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'moderation', label: 'Verification Queue', icon: ShieldCheck },
    ...(canEditContent
      ? [
          { id: 'content_cms' as AdminTab, label: 'Schemes, Jobs & Courses', icon: FilePlus2 },
          { id: 'local_safety' as AdminTab, label: 'Local Help & Fraud Alerts', icon: Megaphone },
        ]
      : []),
    { id: 'reports', label: `Reports (${data?.reports.filter((r) => r.status === 'Open').length || 0})`, icon: Flag },
    { id: 'feedback', label: `Feedback (${data?.feedback.length || 0})`, icon: MessageSquare },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'logs', label: 'Audit Logs', icon: CheckCircle2 },
    ...(isSuperAdmin ? [{ id: 'roles' as AdminTab, label: 'Roles & Backup', icon: Users }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="JENOVA Administration & Content Verification Console"
        subtitle={`Signed in as ${user.name} · Active RBAC Role: ${user.role.replace('_', ' ').toUpperCase()}`}
        action={
          isSuperAdmin ? (
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#176B4D] bg-white border border-[#176B4D]/30 hover:bg-[#EBF4F0] rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-white border border-[#E5E3DC] mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#176B4D] text-white'
                  : 'text-[#5C5C58] hover:text-[#252525] hover:bg-[#FAF9F5]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-[#5C5C58] py-12">Loading administration console...</p>
      ) : error || !data ? (
        <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error || 'Unable to load console data.'}
        </div>
      ) : (
        <>
          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="p-4 rounded-xl bg-[#FEF4E6] border border-[#F4A340]/40 text-xs text-[#6B3F06]">
                <strong>Measurement Honesty Principle:</strong> Metrics below track real website
                engagement and official portal referrals only. Website visits and outbound clicks do
                not by themselves prove employment placement or household income change — long-term
                outcomes require direct community follow-up research.
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Recorded Visits', val: data.analytics.totalVisits },
                  { label: 'Unique Sessions', val: data.analytics.uniqueVisitorSessions },
                  { label: 'Checklists Completed', val: data.analytics.checklistsCompleted ?? 0 },
                  { label: 'Fraud Checks Completed', val: data.analytics.fraudChecksCompleted ?? 0 },
                  { label: 'Local Help Clicks', val: data.analytics.localHelpClicks ?? 0 },
                  { label: 'Voice Assistant Uses', val: data.analytics.voiceAssistantUses ?? 0 },
                  { label: 'Opt-In Update Subscribers', val: data.analytics.updateSubscribersCount ?? 0 },
                  { label: 'Registered Accounts', val: data.analytics.registeredUsers },
                  { label: 'Job Referrals', val: data.analytics.jobReferrals },
                  { label: 'Training Referrals', val: data.analytics.trainingReferrals },
                  { label: 'Scheme Referrals', val: data.analytics.schemeReferrals },
                  { label: 'Open Safety Reports', val: data.analytics.openReportsCount },
                ].map((m) => (
                  <div key={m.label} className="p-4 rounded-xl bg-white border border-[#E5E3DC]">
                    <p className="text-xs text-[#5C5C58]">{m.label}</p>
                    <p className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#176B4D]">
                      {m.val}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-xl bg-white border border-[#E5E3DC]">
                <h2 className="text-base font-bold text-[#252525] mb-4">
                  Daily Platform Engagement (Visits vs. Official Referrals)
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.analytics.dailyEngagement}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DC" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="visits" name="Visits" fill="#176B4D" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="referrals" name="Referrals" fill="#F4A340" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* MODERATION & VERIFICATION QUEUE TAB */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['job', `Jobs (${data.jobs.length})`],
                    ['course', `Courses (${data.courses.length})`],
                    ['scheme', `Schemes (${data.schemes.length})`],
                    ['business', `Local Businesses (${data.businesses.length})`],
                    ['assistance', `Local Assistance (${data.assistanceCentres?.length || 0})`],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setModEntity(type)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                      modEntity === type
                        ? 'bg-[#176B4D] text-white'
                        : 'bg-white border border-[#E5E3DC] text-[#5C5C58]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl bg-white border border-[#E5E3DC] overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E3DC] bg-[#FAF9F5] text-xs text-[#5C5C58]">
                      <th className="py-3 px-4 font-semibold">Listing & Source</th>
                      <th className="py-3 px-4 font-semibold">Current Status</th>
                      <th className="py-3 px-4 font-semibold">Review / Expiry Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E3DC]">
                    {(modEntity === 'job'
                      ? data.jobs.map((j) => ({
                          id: j.id,
                          title: j.title.en,
                          sub: `${j.employerName} · ${j.sourceName}`,
                          status: j.verificationStatus,
                          isDemo: j.isDemo,
                          expiryDate: j.expiryDate || '2026-12-31',
                          meta: `${j.lastUpdated} (${j.reviewer})`,
                        }))
                      : modEntity === 'course'
                        ? data.courses.map((c) => ({
                            id: c.id,
                            title: c.name.en,
                            sub: `${c.provider} · ${c.fees}`,
                            status: c.verificationStatus,
                            isDemo: c.isDemo,
                            expiryDate: c.expiryDate || '2027-06-30',
                            meta: `${c.lastUpdated} (${c.reviewer})`,
                          }))
                        : modEntity === 'scheme'
                          ? data.schemes.map((s) => ({
                              id: s.id,
                              title: s.officialName.en,
                              sub: `${s.scope} · ${s.officialWebsite}`,
                              status: s.verificationStatus,
                              isDemo: false,
                              expiryDate: s.expiryDate || '2027-03-31',
                              meta: `${s.lastUpdated} (${s.reviewer})`,
                            }))
                          : modEntity === 'assistance'
                            ? (data.assistanceCentres || []).map((a) => ({
                                id: a.id,
                                title: a.name.en,
                                sub: `${a.category} · ${a.locationArea} · ${a.sourceName}`,
                                status: a.verificationStatus,
                                isDemo: false,
                                expiryDate: a.expiryDate || '2027-06-30',
                                meta: `${a.dateVerified || a.lastUpdated}${a.needsLocalFieldVerification ? ' (Needs field check)' : ''}`,
                              }))
                            : data.businesses.map((b) => ({
                                id: b.id,
                                title: b.businessName,
                                sub: `${b.category} · ${b.location}`,
                                status: b.verificationStatus,
                                isDemo: b.isDemo,
                                expiryDate: b.expiryDate || '2027-12-31',
                                meta: `${b.lastUpdated} (${b.reviewer})`,
                              }))
                    ).map((row) => (
                      <tr key={row.id} className="hover:bg-[#FAF9F5]">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#252525]">{row.title}</p>
                          <p className="text-xs text-[#5C5C58]">{row.sub}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <VerificationLabel status={row.status} isDemo={row.isDemo} />
                          <p className="text-[11px] text-[#85847C] mt-0.5">{row.meta}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            type="date"
                            aria-label={`Expiry date for ${row.title}`}
                            defaultValue={row.expiryDate}
                            onBlur={(e) => {
                              if (e.target.value && e.target.value !== row.expiryDate) {
                                updateExpiryDate(modEntity, row.id, e.target.value);
                              }
                            }}
                            className="rounded-lg border border-[#E5E3DC] bg-white px-2.5 py-1 text-xs font-mono text-[#252525]"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            aria-label={`Change verification status for ${row.title}`}
                            value={row.status}
                            onChange={(e) =>
                              updateVerificationStatus(
                                modEntity,
                                row.id,
                                e.target.value as VerificationStatus
                              )
                            }
                            className="rounded-lg border border-[#E5E3DC] bg-white px-2.5 py-1.5 text-xs font-medium text-[#252525]"
                          >
                            <option value="Officially Verified">Officially Verified</option>
                            <option value="Independently Verified">Independently Verified</option>
                            <option value="Verified">Verified</option>
                            <option value="Community Submitted">Community Submitted</option>
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="Needs Review">Needs Review</option>
                            <option value="Expired">Mark Expired</option>
                            <option value="Rejected">Reject</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MANAGE SCHEMES, VERIFIED JOBS & TRAINING COURSES TAB */}
          {activeTab === 'content_cms' && canEditContent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Government Scheme */}
              <form
                onSubmit={handleAddScheme}
                className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-3 h-fit"
              >
                <h2 className="text-base font-bold text-[#252525]">Add Government Scheme</h2>
                <input
                  required
                  value={schName}
                  onChange={(e) => setSchName(e.target.value)}
                  placeholder="Official Scheme Name *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <input
                  required
                  value={schDept}
                  onChange={(e) => setSchDept(e.target.value)}
                  placeholder="Government Department *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={schScope}
                    onChange={(e) => setSchScope(e.target.value as 'West Bengal' | 'Central India')}
                    className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm bg-white"
                  >
                    <option value="West Bengal">West Bengal</option>
                    <option value="Central India">Central India</option>
                  </select>
                  <select
                    value={schCategory}
                    onChange={(e) => setSchCategory(e.target.value as WelfareScheme['category'])}
                    className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm bg-white"
                  >
                    <option value="Social Security">Social Security</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Employment">Employment</option>
                    <option value="MSME Support">MSME Support</option>
                  </select>
                </div>
                <input
                  required
                  value={schUrl}
                  onChange={(e) => setSchUrl(e.target.value)}
                  placeholder="Official Government URL (https://...gov.in) *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <textarea
                  required
                  rows={2}
                  value={schDesc}
                  onChange={(e) => setSchDesc(e.target.value)}
                  placeholder="Plain-language explanation *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <input
                  required
                  value={schBenefits}
                  onChange={(e) => setSchBenefits(e.target.value)}
                  placeholder="Main benefits *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <input
                  required
                  value={schEligibility}
                  onChange={(e) => setSchEligibility(e.target.value)}
                  placeholder="Who may qualify *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <input
                  value={schDocs}
                  onChange={(e) => setSchDocs(e.target.value)}
                  placeholder="Required documents (comma-separated)"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg cursor-pointer"
                >
                  Save Scheme (Pending Verification)
                </button>
              </form>

              <div className="space-y-6">
                {/* Edit Existing Scheme */}
                <form
                  onSubmit={handleEditScheme}
                  className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-3"
                >
                  <h2 className="text-base font-bold text-[#252525]">Update Existing Scheme Details</h2>
                  <select
                    required
                    value={editSchemeId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setEditSchemeId(id);
                      const found = data.schemes.find((s) => s.id === id);
                      if (found) {
                        setEditSchemeBenefits(found.benefits.en);
                        setEditSchemeUrl(found.officialWebsite);
                        setEditSchemeExpiry(found.expiryDate);
                      }
                    }}
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Select a scheme to update...</option>
                    {data.schemes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.officialName.en}
                      </option>
                    ))}
                  </select>
                  <input
                    value={editSchemeBenefits}
                    onChange={(e) => setEditSchemeBenefits(e.target.value)}
                    placeholder="Updated benefits summary"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={editSchemeUrl}
                      onChange={(e) => setEditSchemeUrl(e.target.value)}
                      placeholder="Official URL (https://...)"
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={editSchemeExpiry}
                      onChange={(e) => setEditSchemeExpiry(e.target.value)}
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!editSchemeId}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    Update Scheme
                  </button>
                </form>

                {/* Publish Verified Job Listing */}
                <form
                  onSubmit={handlePublishJob}
                  className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-3"
                >
                  <h2 className="text-base font-bold text-[#252525]">Publish Verified Job Listing</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Job Title *"
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                    <input
                      required
                      value={jobEmployer}
                      onChange={(e) => setJobEmployer(e.target.value)}
                      placeholder="Employer / Department *"
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="Location"
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                    <input
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      placeholder="Salary / Wage"
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={jobExpiry}
                      onChange={(e) => setJobExpiry(e.target.value)}
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Official Application URL (optional https://...)"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                  <textarea
                    required
                    rows={2}
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Role responsibilities & eligibility *"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg cursor-pointer"
                  >
                    Publish Verified Job
                  </button>
                </form>

                {/* Add Training Course */}
                <form
                  onSubmit={handleAddCourse}
                  className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-3"
                >
                  <h2 className="text-base font-bold text-[#252525]">Add Skill Training Opportunity</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      value={crsName}
                      onChange={(e) => setCrsName(e.target.value)}
                      placeholder="Course Name *"
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                    <input
                      required
                      value={crsProvider}
                      onChange={(e) => setCrsProvider(e.target.value)}
                      placeholder="Provider (e.g. PBSSD / Skill India) *"
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      value={crsUrl}
                      onChange={(e) => setCrsUrl(e.target.value)}
                      placeholder="Official Course URL *"
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                    <select
                      value={crsMode}
                      onChange={(e) => setCrsMode(e.target.value as 'Online' | 'Offline' | 'Hybrid')}
                      className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm bg-white"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={crsDesc}
                    onChange={(e) => setCrsDesc(e.target.value)}
                    placeholder="Course description & learning outcome *"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg cursor-pointer"
                  >
                    Add Training Course
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* LOCAL HELP & FRAUD ALERTS MANAGEMENT TAB */}
          {activeTab === 'local_safety' && canEditContent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form
                onSubmit={handleAddAssistanceCentre}
                className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-3.5 h-fit"
              >
                <h2 className="text-base font-bold text-[#252525]">
                  Add Verified Local Assistance Centre
                </h2>
                <input
                  required
                  value={acNameEn}
                  onChange={(e) => setAcNameEn(e.target.value)}
                  placeholder="Centre Name (English) *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <input
                  value={acNameBn}
                  onChange={(e) => setAcNameBn(e.target.value)}
                  placeholder="Centre Name (Bengali)"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={acCategory}
                    onChange={(e) => setAcCategory(e.target.value as AssistanceCentreCategory)}
                    className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm bg-white"
                  >
                    <option value="Bangla Sahayata Kendra">Bangla Sahayata Kendra</option>
                    <option value="Government Office">Government Office</option>
                    <option value="Skill & Training Centre">Skill & Training Centre</option>
                    <option value="Employment Support">Employment Support</option>
                    <option value="Cyber & Legal Safety">Cyber & Legal Safety</option>
                    <option value="Community Assistance">Community Assistance</option>
                  </select>
                  <input
                    required
                    value={acArea}
                    onChange={(e) => setAcArea(e.target.value)}
                    placeholder="Area / Block *"
                    className="rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <input
                  required
                  value={acAddress}
                  onChange={(e) => setAcAddress(e.target.value)}
                  placeholder="Verified Location / Counter Note *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <input
                  value={acOfficialUrl}
                  onChange={(e) => setAcOfficialUrl(e.target.value)}
                  placeholder="Official URL (https://...)"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <input
                  required
                  value={acSourceName}
                  onChange={(e) => setAcSourceName(e.target.value)}
                  placeholder="Verification Source (e.g. Purba Medinipur District Portal) *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <input
                  value={acServices}
                  onChange={(e) => setAcServices(e.target.value)}
                  placeholder="Services (comma-separated, e.g. BSK form help, Caste certificate)"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg cursor-pointer"
                >
                  Save Assistance Centre
                </button>
              </form>

              <form
                onSubmit={handlePublishFraudAlert}
                className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-3.5 h-fit"
              >
                <h2 className="text-base font-bold text-[#252525]">
                  Publish Community Fraud Alert (JENOVA Protect)
                </h2>
                <input
                  required
                  value={faTitleEn}
                  onChange={(e) => setFaTitleEn(e.target.value)}
                  placeholder="Alert Title (English) *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <input
                  value={faTitleBn}
                  onChange={(e) => setFaTitleBn(e.target.value)}
                  placeholder="Alert Title (Bengali)"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <select
                  value={faScamType}
                  onChange={(e) =>
                    setFaScamType(e.target.value as FraudAlert['scamType'])
                  }
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm bg-white"
                >
                  <option value="OTP / UPI Trap">OTP / UPI Trap</option>
                  <option value="Advance-Fee Job">Advance-Fee Job</option>
                  <option value="Fake Scheme Link">Fake Scheme Link</option>
                  <option value="Loan App Trap">Loan App Trap</option>
                  <option value="Remote Access App">Remote Access App</option>
                  <option value="Impersonation">Impersonation</option>
                </select>
                <textarea
                  required
                  rows={3}
                  value={faSummaryEn}
                  onChange={(e) => setFaSummaryEn(e.target.value)}
                  placeholder="Describe the scam pattern clearly *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <textarea
                  required
                  rows={2}
                  value={faSafeEn}
                  onChange={(e) => setFaSafeEn(e.target.value)}
                  placeholder="How residents should stay safe *"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg cursor-pointer"
                >
                  Publish Fraud Alert
                </button>
              </form>
            </div>
          )}

          {/* USER REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="rounded-xl bg-white border border-[#E5E3DC] p-6">
              <h2 className="text-base font-bold text-[#252525] mb-4">
                Community Safety & Incorrect Information Reports
              </h2>
              {data.reports.length === 0 ? (
                <p className="text-sm text-[#5C5C58]">No user reports submitted yet.</p>
              ) : (
                <div className="divide-y divide-[#E5E3DC]">
                  {data.reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs text-[#85847C]">
                          {rep.targetType.toUpperCase()} · {rep.reportType} · {rep.createdAt.slice(0, 10)}
                        </p>
                        <p className="text-sm font-bold text-[#252525]">{rep.targetTitle}</p>
                        <p className="text-sm text-[#5C5C58] mt-1">{rep.details}</p>
                      </div>
                      <select
                        value={rep.status}
                        onChange={(e) =>
                          updateReportStatus(rep.id, e.target.value as ContentReport['status'])
                        }
                        className="rounded-lg border border-[#E5E3DC] bg-white px-3 py-1.5 text-xs font-semibold"
                      >
                        <option value="Open">Open</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <div className="rounded-xl bg-white border border-[#E5E3DC] p-6">
              <h2 className="text-base font-bold text-[#252525] mb-4">
                Feedback, Contact & Assistance Requests
              </h2>
              {data.feedback.length === 0 ? (
                <p className="text-sm text-[#5C5C58]">No feedback submissions received yet.</p>
              ) : (
                <div className="divide-y divide-[#E5E3DC]">
                  {data.feedback.map((fb) => (
                    <div
                      key={fb.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs text-[#85847C]">
                          {fb.type} · {fb.name} ({fb.contact}) · {fb.createdAt.slice(0, 10)}
                        </p>
                        <p className="text-sm font-bold text-[#252525]">{fb.subject}</p>
                        <p className="text-sm text-[#5C5C58] mt-1">{fb.message}</p>
                      </div>
                      {canEditContent && (
                        <select
                          value={fb.status}
                          onChange={(e) =>
                            updateFeedbackStatus(fb.id, e.target.value as FeedbackSubmission['status'])
                          }
                          className="rounded-lg border border-[#E5E3DC] bg-white px-3 py-1.5 text-xs font-semibold"
                        >
                          <option value="New">New</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Closed">Closed</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {canEditContent && (
                <form
                  onSubmit={handlePublishAnnouncement}
                  className="lg:col-span-5 p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-4 h-fit"
                >
                  <h2 className="text-base font-bold text-[#252525]">
                    Publish Community Announcement
                  </h2>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Title (English) *</label>
                    <input
                      required
                      value={annTitleEn}
                      onChange={(e) => setAnnTitleEn(e.target.value)}
                      className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Title (Bengali)</label>
                    <input
                      value={annTitleBn}
                      onChange={(e) => setAnnTitleBn(e.target.value)}
                      className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Category</label>
                    <input
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value)}
                      className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Announcement Body *</label>
                    <textarea
                      required
                      rows={3}
                      value={annBodyEn}
                      onChange={(e) => setAnnBodyEn(e.target.value)}
                      className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg cursor-pointer"
                  >
                    Publish Notice
                  </button>
                </form>
              )}

              <div className={`${canEditContent ? 'lg:col-span-7' : 'lg:col-span-12'} p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-4`}>
                <h2 className="text-base font-bold text-[#252525]">Published Announcements</h2>
                <div className="divide-y divide-[#E5E3DC]">
                  {data.announcements.map((a) => (
                    <div key={a.id} className="py-3.5">
                      <p className="text-xs text-[#85847C]">
                        {a.category} · {a.publishedAt} · By {a.createdBy}
                      </p>
                      <p className="text-sm font-bold text-[#252525] mt-0.5">{a.title.en}</p>
                      <p className="text-xs text-[#5C5C58] mt-1">{a.body.en}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="rounded-xl bg-white border border-[#E5E3DC] overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#E5E3DC] bg-[#FAF9F5] text-xs text-[#5C5C58]">
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Entity</th>
                    <th className="py-3 px-4 font-semibold">Transition</th>
                    <th className="py-3 px-4 font-semibold">Reviewer</th>
                    <th className="py-3 px-4 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3DC]">
                  {data.verificationLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 px-4 font-mono text-xs text-[#5C5C58] whitespace-nowrap">
                        {log.timestamp.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#252525]">
                        [{log.entityType}] {log.entityTitle}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {log.previousStatus} → <strong>{log.newStatus}</strong>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#5C5C58]">
                        {log.reviewerName} ({log.reviewerRole})
                      </td>
                      <td className="py-3 px-4 text-xs text-[#5C5C58]">{log.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUPER ADMIN ROLES TAB */}
          {activeTab === 'roles' && isSuperAdmin && (
            <div className="rounded-xl bg-white border border-[#E5E3DC] overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E3DC] bg-[#FAF9F5] text-xs text-[#5C5C58]">
                    <th className="py-3 px-4 font-semibold">User</th>
                    <th className="py-3 px-4 font-semibold">Town</th>
                    <th className="py-3 px-4 font-semibold text-right">Assigned RBAC Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3DC]">
                  {data.users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#252525]">{u.name}</p>
                        <p className="text-xs text-[#5C5C58]">{u.email}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#5C5C58]">{u.town}</td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={u.role}
                          disabled={u.id === user.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="rounded-lg border border-[#E5E3DC] bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                        >
                          <option value="user">Community User</option>
                          <option value="content_reviewer">Content Reviewer</option>
                          <option value="content_admin">Content Administrator</option>
                          <option value="super_admin">Super Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
