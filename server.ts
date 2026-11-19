import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type {
  Announcement,
  BusinessProfile,
  CourseListing,
  FraudAlert,
  JobListing,
  LocalAssistanceCentre,
  UpdateSubscription,
  UserRole,
  VerificationStatus,
  WelfareScheme,
} from './src/types/platform.ts';
import { isPubliclyVerifiedStatus, store } from './server/storage.ts';
import { hashPassword, verifyPassword } from './server/seed.ts';
import {
  attachOptionalUser,
  cleanText,
  createSessionToken,
  rateLimit,
  requireAuth,
  requireMinRole,
  sanitizeUser,
  type AuthedRequest,
} from './server/auth.ts';
import {
  askCommunityAssistant,
  explainFraudWithAI,
  explainSchemeWithAI,
  synthesizeSpeechWithAI,
} from './server/gemini.ts';
import { analyzeFraudRisk } from './server/fraudAnalyzer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_STATUSES: VerificationStatus[] = [
  'Pending Verification',
  'Verified',
  'Officially Verified',
  'Independently Verified',
  'Community Submitted',
  'Needs Review',
  'Expired',
  'Rejected',
];

function isValidHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '512kb' }));

  // Basic security headers (iframe-safe) & never cache API JSON responses
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=()');
    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    const s = store.getState();
    res.json({
      ok: true,
      service: 'jenova-platform',
      counts: {
        jobs: s.jobs.filter((j) => isPubliclyVerifiedStatus(j.verificationStatus)).length,
        courses: s.courses.filter((c) => isPubliclyVerifiedStatus(c.verificationStatus)).length,
        schemes: s.schemes.filter((sc) => isPubliclyVerifiedStatus(sc.verificationStatus)).length,
        businesses: s.businesses.filter((b) => isPubliclyVerifiedStatus(b.verificationStatus)).length,
        assistanceCentres: s.assistanceCentres.filter((a) => isPubliclyVerifiedStatus(a.verificationStatus)).length,
        announcements: s.announcements.filter((a) => a.isActive).length,
        fraudAlerts: s.fraudAlerts.filter((f) => f.isActive).length,
      },
    });
  });

  // ── AUTHENTICATION ROUTES ──────────────────────────────────────────────────
  app.post('/api/auth/register', rateLimit(15, 60_000), (req, res) => {
    const email = cleanText(req.body?.email, 120).toLowerCase();
    const name = cleanText(req.body?.name, 80);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const town = cleanText(req.body?.town, 100) || 'India';
    const preferredLanguage =
      req.body?.preferredLanguage === 'en' || req.body?.preferredLanguage === 'hi'
        ? req.body.preferredLanguage
        : 'bn';

    if (!email || !email.includes('@') || name.length < 2 || password.length < 6) {
      return res.status(400).json({
        error: 'Please provide a valid name (2+ chars), email address, and password (6+ chars).',
      });
    }

    const state = store.getState();
    if (state.users.some((u) => u.email.toLowerCase() === email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const { hash, salt } = hashPassword(password);
    const newUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      email,
      name,
      passwordHash: hash,
      salt,
      role: 'user' as UserRole,
      town,
      preferredLanguage: preferredLanguage as 'bn' | 'en' | 'hi',
      createdAt: new Date().toISOString(),
    };

    state.users.push(newUser);
    store.save();

    const token = createSessionToken(newUser);
    res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  app.post('/api/auth/login', rateLimit(20, 60_000), (req, res) => {
    const email = cleanText(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const user = store.getState().users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createSessionToken(user);
    res.json({ token, user: sanitizeUser(user) });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res) => {
    res.json({ user: sanitizeUser(req.authUser!) });
  });

  app.delete('/api/auth/account', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.authUser!.id;
    if (req.authUser!.role === 'super_admin') {
      return res.status(400).json({ error: 'Super Administrator account cannot be self-deleted.' });
    }
    const state = store.getState();
    state.users = state.users.filter((u) => u.id !== uid);
    state.bookmarks = state.bookmarks.filter((b) => b.userId !== uid);
    state.savingsGoals = state.savingsGoals.filter((g) => g.userId !== uid);
    store.save();
    res.json({ deleted: true });
  });

  // ── ANALYTICS & PUBLIC SUMMARY ─────────────────────────────────────────────
  app.post('/api/analytics/visit', (req, res) => {
    const sessionId = cleanText(req.body?.sessionId, 64);
    store.recordVisit(sessionId || undefined);
    res.json({ ok: true });
  });

  app.post('/api/analytics/event', (req, res) => {
    const eventType = req.body?.eventType;
    const entityId = cleanText(req.body?.entityId, 80);
    const allowed = [
      'job_view',
      'job_referral',
      'course_view',
      'training_referral',
      'scheme_referral',
      'business_visit',
      'workshop_interest',
      'checklist_completed',
      'fraud_check_completed',
      'local_help_click',
      'voice_assistant_use',
    ];
    if (!allowed.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid analytics event type.' });
    }
    store.recordEvent(eventType, entityId || undefined);
    res.json({ ok: true });
  });

  app.get('/api/public/stats', (_req, res) => {
    const summary = store.getAnalyticsSummary();
    res.json({
      totalVisits: summary.totalVisits,
      verifiedCounts: summary.verifiedCounts,
      schemeReferrals: summary.schemeReferrals,
      trainingReferrals: summary.trainingReferrals,
      jobReferrals: summary.jobReferrals,
      checklistsCompleted: summary.checklistsCompleted,
      fraudChecksCompleted: summary.fraudChecksCompleted,
      localHelpClicks: summary.localHelpClicks,
      voiceAssistantUses: summary.voiceAssistantUses,
      updateSubscribersCount: summary.updateSubscribersCount,
      feedbackCount: summary.feedbackCount,
    });
  });

  // ── MODULE A: EMPLOYMENT PORTAL ────────────────────────────────────────────
  app.get('/api/jobs', attachOptionalUser, (req: AuthedRequest, res) => {
    const includeAll =
      req.query.includeAll === 'true' &&
      req.authUser &&
      req.authUser.role !== 'user';

    let jobs = store.getState().jobs;
    if (!includeAll) {
      jobs = jobs.filter((j) => isPubliclyVerifiedStatus(j.verificationStatus));
    }
    res.json({ jobs });
  });

  app.get('/api/jobs/:id', attachOptionalUser, (req: AuthedRequest, res) => {
    const job = store.getState().jobs.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: 'Job listing not found.' });
    const isAdmin = req.authUser && req.authUser.role !== 'user';
    if (!isPubliclyVerifiedStatus(job.verificationStatus) && !isAdmin) {
      return res.status(404).json({ error: 'Job listing is not publicly verified yet.' });
    }
    res.json({ job });
  });

  // Public/Member job submission -> strictly enters "Pending Verification"
  app.post('/api/jobs/submit', rateLimit(10, 60_000), attachOptionalUser, (req: AuthedRequest, res) => {
    const titleEn = cleanText(req.body?.title, 140);
    const employerName = cleanText(req.body?.employerName, 120);
    const descriptionEn = cleanText(req.body?.description, 1200);
    const location = cleanText(req.body?.location, 120);
    const category = cleanText(req.body?.category, 60) as JobListing['category'];
    const qualification = cleanText(req.body?.qualification, 140);
    const salaryMin = Math.max(0, Number(req.body?.salaryMin) || 0);
    const salaryMax = Math.max(salaryMin, Number(req.body?.salaryMax) || salaryMin);
    const applicationUrl = cleanText(req.body?.applicationUrl, 240);
    const contactInfo = cleanText(req.body?.contactInfo, 140);

    if (!titleEn || !employerName || !descriptionEn || !location) {
      return res.status(400).json({ error: 'Title, employer name, location, and description are required.' });
    }
    if (!isValidHttpUrl(applicationUrl)) {
      return res.status(400).json({ error: 'Application URL must start with http:// or https://.' });
    }

    const now = new Date().toISOString().slice(0, 10);
    const newJob: JobListing = {
      id: `job-${crypto.randomUUID().slice(0, 8)}`,
      title: { bn: titleEn, en: titleEn, hi: titleEn },
      employerName,
      description: { bn: descriptionEn, en: descriptionEn, hi: descriptionEn },
      salaryMin,
      salaryMax,
      salaryUnit: req.body?.salaryUnit === 'daily' ? 'daily' : req.body?.salaryUnit === 'stipend' ? 'stipend' : 'monthly',
      salaryDisplay: {
        bn: salaryMin ? `₹${salaryMin.toLocaleString('en-IN')} – ₹${salaryMax.toLocaleString('en-IN')}` : 'আলোচনা সাপেক্ষে',
        en: salaryMin ? `₹${salaryMin.toLocaleString('en-IN')} – ₹${salaryMax.toLocaleString('en-IN')}` : 'As per employer norms',
        hi: salaryMin ? `₹${salaryMin.toLocaleString('en-IN')} – ₹${salaryMax.toLocaleString('en-IN')}` : 'नियोक्ता मानदंड के अनुसार',
      },
      location,
      category: category || 'Local',
      qualification: qualification || 'As specified',
      experience: cleanText(req.body?.experience, 80) || 'Freshers / Experienced',
      workingHours: cleanText(req.body?.workingHours, 80) || 'Day Shift',
      applicationInstructions: {
        bn: cleanText(req.body?.applicationInstructions, 400) || 'অনুগ্রহ করে সরাসরি নিয়োগকর্তার সাথে যোগাযোগ করুন। কোনো ফি দেবেন না।',
        en: cleanText(req.body?.applicationInstructions, 400) || 'Contact employer directly. Never pay application fees.',
        hi: cleanText(req.body?.applicationInstructions, 400) || 'सीधे नियोक्ता से संपर्क करें। कोई शुल्क न दें।',
      },
      contactInfo: contactInfo || 'Verified upon admin review',
      applicationUrl: applicationUrl || '',
      deadline: cleanText(req.body?.deadline, 30) || '2026-12-31',
      isDemo: Boolean(req.body?.isDemo),
      sourceName: `Community Submission (${employerName})`,
      sourceUrl: applicationUrl || '',
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: now,
      reviewer: 'Awaiting Admin Verification',
      expiryDate: cleanText(req.body?.deadline, 30) || '2026-12-31',
      submittedBy: req.authUser?.email || 'Public Contributor',
      viewsCount: 0,
      referralsCount: 0,
    };

    store.getState().jobs.unshift(newJob);
    store.save();

    res.status(201).json({
      message: 'Job submitted for administrator verification. It will appear publicly only after approval.',
      job: newJob,
    });
  });

  // ── MODULE B: SKILL DEVELOPMENT ────────────────────────────────────────────
  app.get('/api/courses', attachOptionalUser, (req: AuthedRequest, res) => {
    const includeAll =
      req.query.includeAll === 'true' &&
      req.authUser &&
      req.authUser.role !== 'user';

    let courses = store.getState().courses;
    if (!includeAll) {
      courses = courses.filter((c) => isPubliclyVerifiedStatus(c.verificationStatus));
    }
    res.json({
      courses,
      trainingCentres: store.getState().trainingCentres,
    });
  });

  app.get('/api/courses/:id', (req, res) => {
    const course = store.getState().courses.find((c) => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json({ course });
  });

  // ── MODULE D: GOVERNMENT WELFARE SCHEMES ───────────────────────────────────
  app.get('/api/schemes', attachOptionalUser, (req: AuthedRequest, res) => {
    const includeAll =
      req.query.includeAll === 'true' &&
      req.authUser &&
      req.authUser.role !== 'user';

    let schemes = store.getState().schemes;
    if (!includeAll) {
      schemes = schemes.filter((s) => isPubliclyVerifiedStatus(s.verificationStatus));
    }
    res.json({ schemes });
  });

  app.get('/api/schemes/:id', (req, res) => {
    const scheme = store.getState().schemes.find((s) => s.id === req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found.' });
    res.json({ scheme });
  });

  // ── MODULE E: MSME & LOCAL BUSINESS DIRECTORY ──────────────────────────────
  app.get('/api/msme/ideas', (_req, res) => {
    res.json({ ideas: store.getState().businessIdeas });
  });

  app.get('/api/businesses', attachOptionalUser, (req: AuthedRequest, res) => {
    const includeAll =
      req.query.includeAll === 'true' &&
      req.authUser &&
      req.authUser.role !== 'user';

    let businesses = store.getState().businesses;
    if (!includeAll) {
      businesses = businesses.filter((b) => isPubliclyVerifiedStatus(b.verificationStatus));
    }
    res.json({ businesses });
  });

  app.post('/api/businesses/submit', rateLimit(10, 60_000), attachOptionalUser, (req: AuthedRequest, res) => {
    const businessName = cleanText(req.body?.businessName, 120);
    const category = cleanText(req.body?.category, 80);
    const location = cleanText(req.body?.location, 140);
    const description = cleanText(req.body?.description, 1000);
    const servicesRaw = cleanText(req.body?.services, 400);
    const contactInfo = cleanText(req.body?.contactInfo, 140);
    const operatingHours = cleanText(req.body?.operatingHours, 100);
    const websiteOrSocial = cleanText(req.body?.websiteOrSocial, 200);
    const consentToPublish = Boolean(req.body?.consentToPublish);

    if (!businessName || !category || !location || !description) {
      return res.status(400).json({ error: 'Business name, category, location, and description are required.' });
    }
    if (!consentToPublish) {
      return res.status(400).json({
        error: 'Explicit consent is required before submitting business contact details for public listing.',
      });
    }
    if (!isValidHttpUrl(websiteOrSocial)) {
      return res.status(400).json({ error: 'Website or social link must start with http:// or https://.' });
    }

    const now = new Date().toISOString().slice(0, 10);
    const profile: BusinessProfile = {
      id: `biz-${crypto.randomUUID().slice(0, 8)}`,
      businessName,
      category,
      location,
      description: { bn: description, en: description, hi: description },
      services: servicesRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10),
      contactInfo: contactInfo || 'Contact via local listing',
      operatingHours: operatingHours || '10:00 AM – 7:00 PM',
      websiteOrSocial,
      isDemo: false,
      sourceName: 'Owner Self-Submission',
      sourceUrl: websiteOrSocial || '',
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: now,
      reviewer: 'Awaiting Admin Approval',
      expiryDate: '2027-12-31',
      submittedBy: req.authUser?.email || 'Local Business Owner',
      visitsCount: 0,
    };

    store.getState().businesses.unshift(profile);
    store.save();

    res.status(201).json({
      message: 'Business profile submitted for administrator review. It will appear publicly after approval.',
      business: profile,
    });
  });

  // ── BOOKMARKS & SAVINGS GOALS (USER DASHBOARD) ─────────────────────────────
  app.get('/api/bookmarks', requireAuth, (req: AuthedRequest, res) => {
    const list = store.getState().bookmarks.filter((b) => b.userId === req.authUser!.id);
    res.json({ bookmarks: list });
  });

  app.post('/api/bookmarks/toggle', requireAuth, (req: AuthedRequest, res) => {
    const itemType = req.body?.itemType;
    const itemId = cleanText(req.body?.itemId, 80);
    if (!['job', 'course', 'scheme', 'business'].includes(itemType) || !itemId) {
      return res.status(400).json({ error: 'Invalid bookmark payload.' });
    }
    const state = store.getState();
    const existingIdx = state.bookmarks.findIndex(
      (b) => b.userId === req.authUser!.id && b.itemType === itemType && b.itemId === itemId
    );
    if (existingIdx >= 0) {
      state.bookmarks.splice(existingIdx, 1);
      store.save();
      return res.json({ bookmarked: false });
    }
    state.bookmarks.unshift({
      id: `bm-${crypto.randomUUID().slice(0, 8)}`,
      userId: req.authUser!.id,
      itemType,
      itemId,
      createdAt: new Date().toISOString(),
    });
    store.save();
    res.json({ bookmarked: true });
  });

  app.get('/api/savings-goals', requireAuth, (req: AuthedRequest, res) => {
    const goals = store.getState().savingsGoals.filter((g) => g.userId === req.authUser!.id);
    res.json({ goals });
  });

  app.post('/api/savings-goals', requireAuth, (req: AuthedRequest, res) => {
    const title = cleanText(req.body?.title, 100);
    const targetAmount = Math.max(100, Number(req.body?.targetAmount) || 0);
    const savedAmount = Math.max(0, Number(req.body?.savedAmount) || 0);
    const monthlyContribution = Math.max(0, Number(req.body?.monthlyContribution) || 0);
    const targetDate = cleanText(req.body?.targetDate, 20) || '2027-12-31';

    if (!title) {
      return res.status(400).json({ error: 'Goal title is required.' });
    }

    const goal = {
      id: `goal-${crypto.randomUUID().slice(0, 8)}`,
      userId: req.authUser!.id,
      title,
      targetAmount,
      savedAmount,
      monthlyContribution,
      targetDate,
      updatedAt: new Date().toISOString(),
    };
    store.getState().savingsGoals.unshift(goal);
    store.save();
    res.status(201).json({ goal });
  });

  app.patch('/api/savings-goals/:id', requireAuth, (req: AuthedRequest, res) => {
    const goal = store
      .getState()
      .savingsGoals.find((g) => g.id === req.params.id && g.userId === req.authUser!.id);
    if (!goal) return res.status(404).json({ error: 'Savings goal not found.' });
    if (typeof req.body?.savedAmount === 'number' && req.body.savedAmount >= 0) {
      goal.savedAmount = req.body.savedAmount;
    }
    if (typeof req.body?.targetAmount === 'number' && req.body.targetAmount > 0) {
      goal.targetAmount = req.body.targetAmount;
    }
    goal.updatedAt = new Date().toISOString();
    store.save();
    res.json({ goal });
  });

  app.delete('/api/savings-goals/:id', requireAuth, (req: AuthedRequest, res) => {
    const state = store.getState();
    const before = state.savingsGoals.length;
    state.savingsGoals = state.savingsGoals.filter(
      (g) => !(g.id === req.params.id && g.userId === req.authUser!.id)
    );
    if (state.savingsGoals.length === before) {
      return res.status(404).json({ error: 'Savings goal not found.' });
    }
    store.save();
    res.json({ deleted: true });
  });

  // ── COMMUNITY SUPPORT: REPORTS, FEEDBACK, ANNOUNCEMENTS ────────────────────
  app.get('/api/announcements', (_req, res) => {
    const active = store.getState().announcements.filter((a) => a.isActive);
    res.json({ announcements: active });
  });

  app.post('/api/reports', rateLimit(10, 60_000), (req, res) => {
    const targetType = req.body?.targetType;
    const targetId = cleanText(req.body?.targetId, 80);
    const targetTitle = cleanText(req.body?.targetTitle, 140);
    const reportType = req.body?.reportType;
    const details = cleanText(req.body?.details, 800);
    const reporterContact = cleanText(req.body?.reporterContact, 100);

    if (
      !['job', 'course', 'scheme', 'business', 'assistance', 'general'].includes(targetType) ||
      !['suspicious', 'incorrect', 'expired', 'other'].includes(reportType) ||
      details.length < 5
    ) {
      return res.status(400).json({ error: 'Please select a valid report reason and provide details.' });
    }

    const report = {
      id: `rep-${crypto.randomUUID().slice(0, 8)}`,
      targetType,
      targetId: targetId || 'general',
      targetTitle: targetTitle || 'Platform Listing',
      reportType,
      details,
      reporterContact,
      status: 'Open' as const,
      createdAt: new Date().toISOString(),
    };
    store.getState().reports.unshift(report);
    store.save();
    res.status(201).json({ report });
  });

  // ── P0 FEATURE: LOCAL HELP FINDER (VERIFIED ASSISTANCE CENTRES) ────────────
  app.get('/api/assistance', attachOptionalUser, (req: AuthedRequest, res) => {
    const includeAll =
      req.query.includeAll === 'true' &&
      req.authUser &&
      req.authUser.role !== 'user';

    let centres = store.getState().assistanceCentres;
    if (!includeAll) {
      centres = centres.filter((c) => isPubliclyVerifiedStatus(c.verificationStatus));
    }
    res.json({ centres });
  });

  // ── P0 FEATURE: PRATARONA JACHAI (DIGITAL FRAUD RISK ASSESSMENT) ───────────
  app.get('/api/fraud/alerts', (_req, res) => {
    const alerts = store.getState().fraudAlerts.filter((a) => a.isActive);
    res.json({ alerts });
  });

  app.post('/api/fraud/analyze', rateLimit(20, 60_000), async (req, res) => {
    const content = cleanText(req.body?.content, 2000);
    const inputType = cleanText(req.body?.inputType, 40) || 'message';
    const language =
      req.body?.language === 'en' || req.body?.language === 'hi' ? req.body.language : 'bn';
    const includeAi = Boolean(req.body?.includeAi ?? true);

    if (!content || content.length < 4) {
      return res.status(400).json({
        error: 'Please paste a suspicious message, offer, phone note, or link to analyze.',
      });
    }

    // Never execute external links or store sensitive credentials
    const result = analyzeFraudRisk(content, inputType, language);
    if (includeAi) {
      const aiOutcome = await explainFraudWithAI(content, result, language);
      result.aiExplanation = aiOutcome.explanation;
      result.analysisPipeline = {
        staticEngineUsed: true,
        aiStatus: aiOutcome.aiStatus,
        aiLimitationNote: aiOutcome.limitationNote,
      };
    } else {
      result.analysisPipeline = {
        staticEngineUsed: true,
        aiStatus: 'unavailable',
      };
    }

    store.recordEvent('fraud_check_completed');
    res.json({ result });
  });

  // ── CONSENT-BASED COMMUNITY UPDATES & REMINDERS ────────────────────────────
  app.post('/api/updates/subscribe', rateLimit(10, 60_000), (req, res) => {
    const name = cleanText(req.body?.name, 80) || 'Community Member';
    const channel =
      req.body?.channel === 'email' || req.body?.channel === 'whatsapp_ready'
        ? req.body.channel
        : 'web';
    const contactValue = cleanText(req.body?.contactValue, 120);
    const frequency =
      req.body?.frequency === 'urgent_only' || req.body?.frequency === 'monthly'
        ? req.body.frequency
        : 'weekly';
    const consentGiven = Boolean(req.body?.consentGiven);
    const topics = Array.isArray(req.body?.topics)
      ? req.body.topics.map((t: unknown) => cleanText(t, 40)).filter(Boolean).slice(0, 8)
      : [];

    if (!consentGiven) {
      return res.status(400).json({
        error: 'Explicit user consent is required before saving update preferences.',
      });
    }
    if (topics.length === 0) {
      return res.status(400).json({ error: 'Please select at least one update topic.' });
    }
    if (channel !== 'web' && contactValue.length < 5) {
      return res.status(400).json({
        error: 'Please enter a valid email or WhatsApp contact, or select Website Notifications.',
      });
    }

    const sub: UpdateSubscription = {
      id: `sub-${crypto.randomUUID().slice(0, 8)}`,
      name,
      channel,
      contactValue: channel === 'web' ? 'On-site browser notifications' : contactValue,
      topics,
      frequency,
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      active: true,
    };

    store.getState().updateSubscriptions.unshift(sub);
    store.save();

    const whatsappConfigured = Boolean(process.env.WHATSAPP_API_TOKEN);
    const emailConfigured = Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);

    res.status(201).json({
      subscription: sub,
      deliveryStatus:
        channel === 'whatsapp_ready' && !whatsappConfigured
          ? 'Preference saved with consent. WhatsApp notifications will activate once the WhatsApp Business gateway is linked — updates remain live on-site.'
          : channel === 'email' && !emailConfigured
            ? 'Preference saved with consent. On-site alerts are active immediately, and email digests will activate once mail delivery is connected.'
            : 'Update preferences saved with your explicit consent. You can unsubscribe anytime.',
    });
  });

  app.post('/api/updates/unsubscribe', rateLimit(15, 60_000), (req, res) => {
    const id = cleanText(req.body?.id, 60);
    const contactValue = cleanText(req.body?.contactValue, 120).toLowerCase();
    const subs = store.getState().updateSubscriptions;
    let updated = 0;

    for (const s of subs) {
      if (
        (id && s.id === id) ||
        (contactValue && s.contactValue.toLowerCase() === contactValue)
      ) {
        if (s.active) {
          s.active = false;
          updated += 1;
        }
      }
    }

    if (updated > 0) store.save();
    res.json({ unsubscribedCount: updated });
  });

  app.post('/api/feedback', rateLimit(10, 60_000), (req, res) => {
    const type = ['contact', 'feedback', 'assistance'].includes(req.body?.type)
      ? req.body.type
      : 'feedback';
    const name = cleanText(req.body?.name, 80);
    const contact = cleanText(req.body?.contact, 120);
    const subject = cleanText(req.body?.subject, 140);
    const message = cleanText(req.body?.message, 1200);

    if (!name || message.length < 5) {
      return res.status(400).json({ error: 'Name and a message (at least 5 characters) are required.' });
    }

    const submission = {
      id: `fb-${crypto.randomUUID().slice(0, 8)}`,
      type,
      name,
      contact: contact || 'Not provided',
      subject: subject || 'Community Inquiry',
      message,
      status: 'New' as const,
      createdAt: new Date().toISOString(),
    };
    store.getState().feedback.unshift(submission);
    store.save();
    res.status(201).json({ submission });
  });

  // ── AI COMMUNITY ASSISTANT (SERVER-SIDE GEMINI) ────────────────────────────
  app.post('/api/ai/assistant', rateLimit(15, 60_000), async (req, res) => {
    const message = cleanText(req.body?.message, 800);
    const language =
      req.body?.language === 'en' || req.body?.language === 'hi' ? req.body.language : 'bn';
    const history = Array.isArray(req.body?.history)
      ? req.body.history
          .slice(-6)
          .map((h: { role?: string; text?: string }) => ({
            role: h.role === 'assistant' ? ('assistant' as const) : ('user' as const),
            text: cleanText(h.text, 500),
          }))
      : [];

    if (!message || message.length < 2) {
      return res.status(400).json({ error: 'Please type a question for the Community Assistant.' });
    }

    // Refuse sensitive data before sending anywhere
    const sensitivePattern = /\b(upi\s*pin|atm\s*pin|cvv|otp\s*is|password\s*is|\d{4}\s?\d{4}\s?\d{4})\b/i;
    if (sensitivePattern.test(message)) {
      return res.json({
        reply:
          language === 'bn'
            ? 'নিরাপত্তা সতর্কতা: অনুগ্রহ করে কখনোই আপনার আধার নম্বর, OTP, UPI PIN, পাসওয়ার্ড বা কার্ডের তথ্য এখানে বা কোথাও শেয়ার করবেন না। আপনি আপনার প্রশ্নটি ব্যক্তিগত তথ্য ছাড়াই আবার জিজ্ঞাসা করুন।'
            : language === 'hi'
              ? 'सुरक्षा चेतावनी: कृपया अपना आधार नंबर, OTP, UPI PIN, पासवर्ड या कार्ड विवरण कभी साझा न करें। कृपया निजी जानकारी के बिना अपना प्रश्न पूछें।'
              : 'Safety Warning: Never share your Aadhaar number, OTP, UPI PIN, password, or bank card details here or with anyone online. Please rephrase your question without sensitive numbers.',
        modelUsed: 'safety-guard',
      });
    }

    try {
      const result = await askCommunityAssistant(message, language, history);
      res.json(result);
    } catch (err: unknown) {
      console.error('Gemini assistant error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unable to reach AI Community Assistant.';
      res.status(502).json({ error: errMsg });
    }
  });

  app.post('/api/ai/scheme-explain', rateLimit(20, 60_000), async (req, res) => {
    const schemeId = cleanText(req.body?.schemeId, 80);
    const question = cleanText(req.body?.question, 400);
    const language =
      req.body?.language === 'en' || req.body?.language === 'hi' ? req.body.language : 'bn';

    if (!schemeId || question.length < 3) {
      return res.status(400).json({ error: 'Scheme ID and a brief question are required.' });
    }

    try {
      const result = await explainSchemeWithAI(schemeId, question, language);
      res.json(result);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : 'AI Scheme Explanation is currently unavailable.';
      res.status(503).json({ error: errMsg });
    }
  });

  app.post('/api/ai/tts', rateLimit(25, 60_000), async (req, res) => {
    const text = cleanText(req.body?.text, 900);
    const language =
      req.body?.language === 'en' || req.body?.language === 'hi' ? req.body.language : 'bn';

    if (!text || text.length < 2) {
      return res.status(400).json({ error: 'Text is required for speech synthesis.' });
    }

    try {
      const result = await synthesizeSpeechWithAI(text, language);
      res.json(result);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Speech synthesis unavailable.';
      res.status(503).json({ error: errMsg });
    }
  });

  // ── ADMIN ROUTES (STRICT ROLE-BASED ACCESS CONTROL) ────────────────────────
  app.get('/api/admin/overview', requireMinRole('content_reviewer'), (_req, res) => {
    const state = store.getState();
    res.json({
      analytics: store.getAnalyticsSummary(),
      jobs: state.jobs,
      courses: state.courses,
      schemes: state.schemes,
      businesses: state.businesses,
      assistanceCentres: state.assistanceCentres,
      fraudAlerts: state.fraudAlerts,
      reports: state.reports,
      feedback: state.feedback,
      announcements: state.announcements,
      verificationLogs: state.verificationLogs.slice(0, 80),
      users: state.users.map(sanitizeUser),
    });
  });

  // Content Reviewer+ can update verification status of jobs, courses, schemes, businesses, assistance
  app.patch('/api/admin/verify', requireMinRole('content_reviewer'), (req: AuthedRequest, res) => {
    const { entityType, entityId, newStatus, note } = req.body || {};
    if (
      !['job', 'course', 'scheme', 'business', 'assistance'].includes(entityType) ||
      !VALID_STATUSES.includes(newStatus)
    ) {
      return res.status(400).json({ error: 'Invalid verification request.' });
    }

    const state = store.getState();
    const today = new Date().toISOString().slice(0, 10);
    let itemTitle = '';
    let prevStatus: VerificationStatus = 'Pending Verification';

    if (entityType === 'job') {
      const item = state.jobs.find((x) => x.id === entityId);
      if (!item) return res.status(404).json({ error: 'Job not found.' });
      prevStatus = item.verificationStatus;
      itemTitle = item.title.en;
      item.verificationStatus = newStatus;
      item.lastUpdated = today;
      item.reviewer = req.authUser!.name;
      if (isPubliclyVerifiedStatus(newStatus)) item.dateVerified = today;
    } else if (entityType === 'course') {
      const item = state.courses.find((x) => x.id === entityId);
      if (!item) return res.status(404).json({ error: 'Course not found.' });
      prevStatus = item.verificationStatus;
      itemTitle = item.name.en;
      item.verificationStatus = newStatus;
      item.lastUpdated = today;
      item.reviewer = req.authUser!.name;
      if (isPubliclyVerifiedStatus(newStatus)) item.dateVerified = today;
    } else if (entityType === 'scheme') {
      const item = state.schemes.find((x) => x.id === entityId);
      if (!item) return res.status(404).json({ error: 'Scheme not found.' });
      prevStatus = item.verificationStatus;
      itemTitle = item.officialName.en;
      item.verificationStatus = newStatus;
      item.lastUpdated = today;
      item.reviewer = req.authUser!.name;
      if (isPubliclyVerifiedStatus(newStatus)) item.dateVerified = today;
    } else if (entityType === 'business') {
      const item = state.businesses.find((x) => x.id === entityId);
      if (!item) return res.status(404).json({ error: 'Business not found.' });
      prevStatus = item.verificationStatus;
      itemTitle = item.businessName;
      item.verificationStatus = newStatus;
      item.lastUpdated = today;
      item.reviewer = req.authUser!.name;
      if (isPubliclyVerifiedStatus(newStatus)) item.dateVerified = today;
    } else if (entityType === 'assistance') {
      const item = state.assistanceCentres.find((x) => x.id === entityId);
      if (!item) return res.status(404).json({ error: 'Assistance centre not found.' });
      prevStatus = item.verificationStatus;
      itemTitle = item.name.en;
      item.verificationStatus = newStatus;
      item.lastUpdated = today;
      item.reviewer = req.authUser!.name;
      if (isPubliclyVerifiedStatus(newStatus)) item.dateVerified = today;
    }

    state.verificationLogs.unshift({
      id: `vlog-${crypto.randomUUID().slice(0, 8)}`,
      entityType,
      entityId,
      entityTitle: itemTitle,
      previousStatus: prevStatus,
      newStatus,
      reviewerName: req.authUser!.name,
      reviewerRole: req.authUser!.role,
      note: cleanText(note, 300) || `Status changed to ${newStatus}`,
      timestamp: new Date().toISOString(),
    });
    store.save();

    res.json({ updated: true, newStatus });
  });

  // Content Admin+ can add Local Assistance Centres and Fraud Alerts
  app.post('/api/admin/assistance', requireMinRole('content_admin'), (req: AuthedRequest, res) => {
    const nameEn = cleanText(req.body?.nameEn, 140);
    const nameBn = cleanText(req.body?.nameBn, 140) || nameEn;
    const category = cleanText(req.body?.category, 60) as LocalAssistanceCentre['category'];
    const address = cleanText(req.body?.address, 220);
    const locationArea = cleanText(req.body?.locationArea, 120) || 'Pan-India / Local District';
    const descriptionEn = cleanText(req.body?.descriptionEn, 600);
    const officialPortalUrl = cleanText(req.body?.officialPortalUrl, 240);
    const publicContact = cleanText(req.body?.publicContact, 160) || 'Verify via official source';

    if (!nameEn || !address || !descriptionEn || !isValidHttpUrl(officialPortalUrl)) {
      return res.status(400).json({
        error: 'Centre name, address/note, description, and valid source URL are required.',
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const centre: LocalAssistanceCentre = {
      id: `help-${crypto.randomUUID().slice(0, 8)}`,
      name: { bn: nameBn, en: nameEn, hi: nameEn },
      category: category || 'Community Assistance',
      description: { bn: descriptionEn, en: descriptionEn, hi: descriptionEn },
      address,
      locationArea,
      servicesOffered: cleanText(req.body?.servicesOffered, 400)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      publicContact,
      timingsNote: cleanText(req.body?.timingsNote, 180) || 'Confirm timings before visiting',
      needsLocalFieldVerification: Boolean(req.body?.needsLocalFieldVerification ?? true),
      officialPortalUrl: officialPortalUrl || '',
      sourceName: cleanText(req.body?.sourceName, 140) || 'Administrator Entry',
      sourceUrl: officialPortalUrl || '',
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: today,
      reviewer: req.authUser!.name,
      expiryDate: '2027-06-30',
      referralsCount: 0,
    };

    store.getState().assistanceCentres.unshift(centre);
    store.save();
    res.status(201).json({ centre });
  });

  app.post('/api/admin/fraud-alerts', requireMinRole('content_admin'), (req: AuthedRequest, res) => {
    const titleEn = cleanText(req.body?.titleEn, 140);
    const titleBn = cleanText(req.body?.titleBn, 140) || titleEn;
    const summaryEn = cleanText(req.body?.summaryEn, 600);
    const safetyTipEn = cleanText(req.body?.safetyTipEn, 300);
    const scamType = (cleanText(req.body?.scamType, 40) as FraudAlert['scamType']) || 'Impersonation';

    if (!titleEn || !summaryEn) {
      return res.status(400).json({ error: 'Alert title and summary are required.' });
    }

    const alert: FraudAlert = {
      id: `fa-${crypto.randomUUID().slice(0, 8)}`,
      title: { bn: titleBn, en: titleEn, hi: titleEn },
      summary: { bn: summaryEn, en: summaryEn, hi: summaryEn },
      scamType,
      safetyTip: {
        bn: safetyTipEn || 'কখনোই OTP, UPI PIN বা অগ্রিম টাকা দেবেন না।',
        en: safetyTipEn || 'Never share OTP, UPI PIN, or pay advance fees.',
        hi: safetyTipEn || 'कभी भी OTP, UPI PIN या अग्रिम शुल्क न दें।',
      },
      publishedAt: new Date().toISOString().slice(0, 10),
      isActive: true,
      createdBy: req.authUser!.name,
    };

    store.getState().fraudAlerts.unshift(alert);
    store.save();
    res.status(201).json({ alert });
  });

  // Content Reviewer+ can resolve reports
  app.patch('/api/admin/reports/:id', requireMinRole('content_reviewer'), (req: AuthedRequest, res) => {
    const status = req.body?.status;
    if (!['Open', 'Reviewed', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid report status.' });
    }
    const report = store.getState().reports.find((r) => r.id === req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    report.status = status;
    report.reviewedBy = req.authUser!.name;
    store.save();
    res.json({ report });
  });

  // Content Admin+ can manage feedback, announcements, and add courses/schemes
  app.patch('/api/admin/feedback/:id', requireMinRole('content_admin'), (req, res) => {
    const status = req.body?.status;
    if (!['New', 'Reviewed', 'Closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid feedback status.' });
    }
    const fb = store.getState().feedback.find((f) => f.id === req.params.id);
    if (!fb) return res.status(404).json({ error: 'Feedback not found.' });
    fb.status = status;
    store.save();
    res.json({ feedback: fb });
  });

  app.post('/api/admin/announcements', requireMinRole('content_admin'), (req: AuthedRequest, res) => {
    const titleEn = cleanText(req.body?.titleEn, 140);
    const titleBn = cleanText(req.body?.titleBn, 140) || titleEn;
    const bodyEn = cleanText(req.body?.bodyEn, 600);
    const bodyBn = cleanText(req.body?.bodyBn, 600) || bodyEn;
    const category = cleanText(req.body?.category, 60) || 'Community Notice';

    if (!titleEn || !bodyEn) {
      return res.status(400).json({ error: 'Announcement title and message are required.' });
    }

    const ann: Announcement = {
      id: `ann-${crypto.randomUUID().slice(0, 8)}`,
      title: { bn: titleBn, en: titleEn, hi: titleEn },
      body: { bn: bodyBn, en: bodyEn, hi: bodyEn },
      category,
      locationScope: cleanText(req.body?.locationScope, 80) || 'Pan-India',
      publishedAt: new Date().toISOString().slice(0, 10),
      isActive: true,
      createdBy: req.authUser!.name,
    };
    store.getState().announcements.unshift(ann);
    store.save();
    res.status(201).json({ announcement: ann });
  });

  app.post('/api/admin/courses', requireMinRole('content_admin'), (req: AuthedRequest, res) => {
    const nameEn = cleanText(req.body?.name, 140);
    const provider = cleanText(req.body?.provider, 120);
    const category = cleanText(req.body?.category, 60) as CourseListing['category'];
    const descriptionEn = cleanText(req.body?.description, 800);
    const applicationUrl = cleanText(req.body?.applicationUrl, 240);

    if (!nameEn || !provider || !descriptionEn || !isValidHttpUrl(applicationUrl)) {
      return res.status(400).json({ error: 'Valid course name, provider, description, and URL are required.' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const course: CourseListing = {
      id: `crs-${crypto.randomUUID().slice(0, 8)}`,
      name: { bn: nameEn, en: nameEn, hi: nameEn },
      provider,
      category: category || 'Digital Literacy',
      description: { bn: descriptionEn, en: descriptionEn, hi: descriptionEn },
      duration: cleanText(req.body?.duration, 60) || 'Self-Paced',
      fees: cleanText(req.body?.fees, 60) || 'Free',
      isFree: Boolean(req.body?.isFree ?? true),
      eligibility: cleanText(req.body?.eligibility, 120) || 'Open to learners',
      mode: req.body?.mode === 'Offline' ? 'Offline' : req.body?.mode === 'Hybrid' ? 'Hybrid' : 'Online',
      location: cleanText(req.body?.location, 120) || 'Online',
      applicationUrl,
      certification: cleanText(req.body?.certification, 120) || 'Completion Certificate',
      isDemo: Boolean(req.body?.isDemo),
      sourceName: provider,
      sourceUrl: applicationUrl,
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: today,
      reviewer: req.authUser!.name,
      expiryDate: '2027-06-30',
      viewsCount: 0,
      referralsCount: 0,
    };
    store.getState().courses.unshift(course);
    store.save();
    res.status(201).json({ course });
  });

  app.post('/api/admin/schemes', requireMinRole('content_admin'), (req: AuthedRequest, res) => {
    const officialName = cleanText(req.body?.officialName, 140);
    const department = cleanText(req.body?.department, 140);
    const officialWebsite = cleanText(req.body?.officialWebsite, 240);
    const description = cleanText(req.body?.description, 900);
    const benefits = cleanText(req.body?.benefits, 500);
    const eligibilityRequirements = cleanText(req.body?.eligibilityRequirements, 500);

    if (!officialName || !department || !officialWebsite || !isValidHttpUrl(officialWebsite)) {
      return res.status(400).json({
        error: 'Official scheme name, government department, and valid official government URL are required.',
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const scheme: WelfareScheme = {
      id: `sch-${crypto.randomUUID().slice(0, 8)}`,
      officialName: { bn: officialName, en: officialName, hi: officialName },
      department: { bn: department, en: department, hi: department },
      scope: req.body?.scope === 'Central India' ? 'Central India' : 'West Bengal',
      category: (cleanText(req.body?.category, 60) as WelfareScheme['category']) || 'Social Security',
      description: { bn: description, en: description, hi: description },
      benefits: { bn: benefits, en: benefits, hi: benefits },
      eligibilityRequirements: {
        bn: eligibilityRequirements,
        en: eligibilityRequirements,
        hi: eligibilityRequirements,
      },
      requiredDocuments: cleanText(req.body?.requiredDocuments, 400)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      applicationProcess: {
        bn: cleanText(req.body?.applicationProcess, 500) || 'Apply via official government portal.',
        en: cleanText(req.body?.applicationProcess, 500) || 'Apply via official government portal.',
        hi: cleanText(req.body?.applicationProcess, 500) || 'आधिकारिक सरकारी पोर्टल से आवेदन करें।',
      },
      officialWebsite,
      sourceName: department,
      sourceUrl: officialWebsite,
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: today,
      reviewer: req.authUser!.name,
      expiryDate: '2027-03-31',
      eligibilityProfile: {
        genders: ['all'],
        occupations: ['all'],
        lowIncomeFocused: true,
        westBengalResidentOnly: req.body?.scope !== 'Central India',
      },
      referralsCount: 0,
    };
    store.getState().schemes.unshift(scheme);
    store.save();
    res.status(201).json({ scheme });
  });

  app.patch('/api/admin/schemes/:id', requireMinRole('content_admin'), (req: AuthedRequest, res) => {
    const scheme = store.getState().schemes.find((s) => s.id === req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found.' });

    const today = new Date().toISOString().slice(0, 10);
    const officialWebsite = cleanText(req.body?.officialWebsite, 240);
    if (officialWebsite && !isValidHttpUrl(officialWebsite)) {
      return res.status(400).json({ error: 'Official website must start with http:// or https://.' });
    }

    if (req.body?.benefits) {
      const b = cleanText(req.body.benefits, 500);
      scheme.benefits = { bn: b, en: b, hi: b };
    }
    if (req.body?.eligibilityRequirements) {
      const e = cleanText(req.body.eligibilityRequirements, 600);
      scheme.eligibilityRequirements = { bn: e, en: e, hi: e };
    }
    if (req.body?.requiredDocuments) {
      scheme.requiredDocuments = cleanText(req.body.requiredDocuments, 500)
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
    }
    if (officialWebsite) {
      scheme.officialWebsite = officialWebsite;
    }
    if (req.body?.expiryDate) {
      scheme.expiryDate = cleanText(req.body.expiryDate, 20);
    }
    scheme.lastUpdated = today;
    scheme.reviewer = req.authUser!.name;

    store.getState().verificationLogs.unshift({
      id: `vlog-${crypto.randomUUID().slice(0, 8)}`,
      entityType: 'scheme',
      entityId: scheme.id,
      entityTitle: scheme.officialName.en,
      previousStatus: scheme.verificationStatus,
      newStatus: scheme.verificationStatus,
      reviewerName: req.authUser!.name,
      reviewerRole: req.authUser!.role,
      note: 'Updated scheme details / review schedule',
      timestamp: new Date().toISOString(),
    });
    store.save();
    res.json({ scheme });
  });

  app.post('/api/admin/jobs', requireMinRole('content_admin'), (req: AuthedRequest, res) => {
    const titleEn = cleanText(req.body?.title, 140);
    const employerName = cleanText(req.body?.employerName, 120);
    const location = cleanText(req.body?.location, 120) || 'Pan-India / Remote';
    const descriptionEn = cleanText(req.body?.description, 1000);
    const applicationUrl = cleanText(req.body?.applicationUrl, 240);
    const category = (cleanText(req.body?.category, 60) as JobListing['category']) || 'Local';
    const salaryDisplayText = cleanText(req.body?.salaryDisplay, 100) || 'As per official notification';
    const expiryDate = cleanText(req.body?.expiryDate, 20) || '2026-12-31';

    if (!titleEn || !employerName || !descriptionEn || !isValidHttpUrl(applicationUrl)) {
      return res.status(400).json({
        error: 'Job title, employer, description, and valid URL (if provided) are required.',
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const status: VerificationStatus =
      req.body?.publishDirectly && req.authUser!.role !== 'content_reviewer'
        ? 'Independently Verified'
        : 'Pending Verification';

    const job: JobListing = {
      id: `job-${crypto.randomUUID().slice(0, 8)}`,
      title: { bn: cleanText(req.body?.titleBn, 140) || titleEn, en: titleEn, hi: titleEn },
      employerName,
      description: { bn: descriptionEn, en: descriptionEn, hi: descriptionEn },
      salaryMin: Math.max(0, Number(req.body?.salaryMin) || 0),
      salaryMax: Math.max(0, Number(req.body?.salaryMax) || 0),
      salaryUnit: 'monthly',
      salaryDisplay: { bn: salaryDisplayText, en: salaryDisplayText, hi: salaryDisplayText },
      location,
      category,
      qualification: cleanText(req.body?.qualification, 140) || 'As specified',
      experience: cleanText(req.body?.experience, 80) || 'Freshers / Experienced',
      workingHours: cleanText(req.body?.workingHours, 80) || 'Day Shift',
      applicationInstructions: {
        bn: 'সরাসরি অফিসিয়াল পোর্টাল বা যাচাইকৃত নিয়োগকর্তার মাধ্যমে আবেদন করুন। কোনো ফি দেবেন না।',
        en: 'Apply via the official portal or verified employer contact only. Never pay registration fees.',
        hi: 'केवल आधिकारिक पोर्टल या सत्यापित नियोक्ता के माध्यम से आवेदन करें।',
      },
      contactInfo: cleanText(req.body?.contactInfo, 140) || 'Official portal / verified contact',
      applicationUrl,
      deadline: expiryDate,
      isDemo: Boolean(req.body?.isDemo),
      sourceName: cleanText(req.body?.sourceName, 140) || employerName,
      sourceUrl: applicationUrl,
      verificationStatus: status,
      dateVerified: isPubliclyVerifiedStatus(status) ? today : '',
      lastUpdated: today,
      reviewer: req.authUser!.name,
      expiryDate,
      submittedBy: req.authUser!.email,
      viewsCount: 0,
      referralsCount: 0,
    };

    store.getState().jobs.unshift(job);
    store.getState().verificationLogs.unshift({
      id: `vlog-${crypto.randomUUID().slice(0, 8)}`,
      entityType: 'job',
      entityId: job.id,
      entityTitle: job.title.en,
      previousStatus: 'Pending Verification',
      newStatus: status,
      reviewerName: req.authUser!.name,
      reviewerRole: req.authUser!.role,
      note: 'Published via Admin Content Manager',
      timestamp: new Date().toISOString(),
    });
    store.save();
    res.status(201).json({ job });
  });

  app.patch('/api/admin/expiry', requireMinRole('content_reviewer'), (req: AuthedRequest, res) => {
    const { entityType, entityId, expiryDate } = req.body || {};
    const cleanDate = cleanText(expiryDate, 20);
    if (
      !['job', 'course', 'scheme', 'business', 'assistance'].includes(entityType) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)
    ) {
      return res.status(400).json({ error: 'Valid entity type and YYYY-MM-DD expiry date required.' });
    }

    const state = store.getState();
    const listMap = {
      job: state.jobs,
      course: state.courses,
      scheme: state.schemes,
      business: state.businesses,
      assistance: state.assistanceCentres,
    } as const;

    const item = listMap[entityType as keyof typeof listMap].find((x) => x.id === entityId);
    if (!item) return res.status(404).json({ error: 'Listing not found.' });

    item.expiryDate = cleanDate;
    item.lastUpdated = new Date().toISOString().slice(0, 10);
    item.reviewer = req.authUser!.name;

    const title =
      'officialName' in item
        ? item.officialName.en
        : 'businessName' in item
          ? item.businessName
          : 'title' in item
            ? item.title.en
            : item.name.en;

    state.verificationLogs.unshift({
      id: `vlog-${crypto.randomUUID().slice(0, 8)}`,
      entityType,
      entityId,
      entityTitle: title,
      previousStatus: item.verificationStatus,
      newStatus: item.verificationStatus,
      reviewerName: req.authUser!.name,
      reviewerRole: req.authUser!.role,
      note: `Expiry / review date updated to ${cleanDate}`,
      timestamp: new Date().toISOString(),
    });
    store.save();
    res.json({ updated: true, expiryDate: cleanDate });
  });

  // Super Admin ONLY: change user role & download backup snapshot
  app.patch('/api/admin/users/:id/role', requireMinRole('super_admin'), (req: AuthedRequest, res) => {
    const newRole = req.body?.role as UserRole;
    if (!['user', 'content_reviewer', 'content_admin', 'super_admin'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    const user = store.getState().users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.role = newRole;
    store.save();
    res.json({ user: sanitizeUser(user) });
  });

  app.get('/api/admin/backup', requireMinRole('super_admin'), (_req, res) => {
    const state = store.getState();
    const safeBackup = {
      exportedAt: new Date().toISOString(),
      usersCount: state.users.length,
      jobs: state.jobs,
      courses: state.courses,
      schemes: state.schemes,
      businesses: state.businesses,
      assistanceCentres: state.assistanceCentres,
      fraudAlerts: state.fraudAlerts,
      announcements: state.announcements,
      verificationLogs: state.verificationLogs,
      analytics: store.getAnalyticsSummary(),
    };
    res.json(safeBackup);
  });

  // Explicit JSON 404 for unknown API routes so they never fall through to SPA HTML
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // ── VITE / STATIC FRONTEND SERVING ─────────────────────────────────────────
  const distPath = path.resolve(__dirname, 'dist');
  const hasDistBuild = fs.existsSync(path.join(distPath, 'index.html'));
  const isDevLifecycle =
    process.env.npm_lifecycle_event === 'dev' ||
    process.env.DISABLE_HMR === 'true' ||
    process.env.VITE_DEV === 'true';
  const isProd = process.env.NODE_ENV === 'production' || (hasDistBuild && !isDevLifecycle);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa',
    });

    // In single-port proxied dev environments where HMR is disabled, Vite 8's
    // /@vite/client still calls transport.connect() against port 24678, causing
    // "Error: WebSocket closed without opened." Serve a lightweight client shim
    // with the exact exports Vite dev transforms expect (updateStyle, etc.)
    // without opening any WebSocket.
    app.get('/@vite/client', (_req, res) => {
      res.type('application/javascript').send(`
const sheetsMap = new Map();
export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    style.remove();
    sheetsMap.delete(id);
  }
}
export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}
export function injectQuery(url, queryToInject) {
  if (!url || (url[0] !== '.' && url[0] !== '/')) return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return pathname + '?' + queryToInject + (search ? '&' + search.slice(1) : '') + (hash || '');
}
export class ErrorOverlay extends HTMLElement {}
`);
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JENOVA server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
