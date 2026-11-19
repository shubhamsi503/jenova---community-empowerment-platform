import {
  SEED_ANNOUNCEMENTS,
  SEED_ASSISTANCE_CENTRES,
  SEED_BUSINESS_IDEAS,
  SEED_BUSINESSES,
  SEED_COURSES,
  SEED_FRAUD_ALERTS,
  SEED_JOBS,
  SEED_SCHEMES,
  SEED_TRAINING_CENTRES,
} from '../data/platformCatalog';
import { analyzeFraudRisk } from './fraudAnalyzer';
import type {
  Announcement,
  BookmarkItem,
  BusinessIdea,
  BusinessProfile,
  ContentReport,
  CourseListing,
  FeedbackSubmission,
  FraudAlert,
  JobListing,
  Language,
  LocalAssistanceCentre,
  PlatformAnalytics,
  SavingsGoal,
  TrainingCentre,
  UpdateSubscription,
  UserAccount,
  UserRole,
  VerificationLog,
  VerificationStatus,
  WelfareScheme,
} from '../types/platform';

interface LocalUser extends UserAccount {
  password: string;
}

interface LocalDbState {
  version: number;
  users: LocalUser[];
  jobs: JobListing[];
  courses: CourseListing[];
  trainingCentres: TrainingCentre[];
  schemes: WelfareScheme[];
  businessIdeas: BusinessIdea[];
  businesses: BusinessProfile[];
  assistanceCentres: LocalAssistanceCentre[];
  fraudAlerts: FraudAlert[];
  updateSubscriptions: UpdateSubscription[];
  bookmarks: BookmarkItem[];
  savingsGoals: SavingsGoal[];
  reports: ContentReport[];
  feedback: FeedbackSubmission[];
  announcements: Announcement[];
  verificationLogs: VerificationLog[];
  analytics: {
    totalVisits: number;
    visitorSessionIds: string[];
    jobsViewed: number;
    jobReferrals: number;
    coursesViewed: number;
    trainingReferrals: number;
    schemeReferrals: number;
    businessDirectoryVisits: number;
    workshopInterestCount: number;
    checklistsCompleted: number;
    fraudChecksCompleted: number;
    localHelpClicks: number;
    voiceAssistantUses: number;
    dailyEngagement: Record<string, { visits: number; referrals: number }>;
  };
}

const DB_STORAGE_KEY = 'jenova_local_db_v4';
const DB_VERSION = 4;

const ROLE_RANK: Record<UserRole, number> = {
  user: 1,
  content_reviewer: 2,
  content_admin: 3,
  super_admin: 4,
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function isPubliclyVerifiedStatus(status: string): boolean {
  return (
    status === 'Verified' ||
    status === 'Officially Verified' ||
    status === 'Independently Verified'
  );
}

function sanitizeUser(u: LocalUser): UserAccount {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    town: u.town,
    preferredLanguage: u.preferredLanguage,
    createdAt: u.createdAt,
  };
}

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createInitialUsers(): LocalUser[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'usr-super-1',
      email: 'superadmin@jenova.in',
      name: 'Super Admin (JENOVA Core Lead)',
      password: 'Admin@Jenova2026',
      role: 'super_admin',
      town: 'Kolkata, West Bengal',
      preferredLanguage: 'bn',
      createdAt: now,
    },
    {
      id: 'usr-content-1',
      email: 'editor@jenova.in',
      name: 'Content Admin (Community Editor)',
      password: 'Editor@Jenova2026',
      role: 'content_admin',
      town: 'New Delhi, India',
      preferredLanguage: 'bn',
      createdAt: now,
    },
    {
      id: 'usr-review-1',
      email: 'reviewer@jenova.in',
      name: 'Content Reviewer (Verification Desk)',
      password: 'Review@Jenova2026',
      role: 'content_reviewer',
      town: 'Bengaluru, Karnataka',
      preferredLanguage: 'bn',
      createdAt: now,
    },
    {
      id: 'usr-member-1',
      email: 'member@jenova.in',
      name: 'Ananya Sen (Community Member)',
      password: 'Member@2026',
      role: 'user',
      town: 'Kolkata, West Bengal',
      preferredLanguage: 'bn',
      createdAt: now,
    },
  ];
}

function createInitialDb(): LocalDbState {
  const today = todayKey();
  return {
    version: DB_VERSION,
    users: createInitialUsers(),
    jobs: cloneData(SEED_JOBS),
    courses: cloneData(SEED_COURSES),
    trainingCentres: cloneData(SEED_TRAINING_CENTRES),
    schemes: cloneData(SEED_SCHEMES),
    businessIdeas: cloneData(SEED_BUSINESS_IDEAS),
    businesses: cloneData(SEED_BUSINESSES),
    assistanceCentres: cloneData(SEED_ASSISTANCE_CENTRES),
    fraudAlerts: cloneData(SEED_FRAUD_ALERTS),
    updateSubscriptions: [],
    bookmarks: [],
    savingsGoals: [
      {
        id: 'goal-seed-1',
        userId: 'usr-member-1',
        title: 'Emergency Household Reserve (3 Months)',
        targetAmount: 24000,
        savedAmount: 6500,
        monthlyContribution: 1500,
        targetDate: '2027-11-01',
        updatedAt: new Date().toISOString(),
      },
    ],
    reports: [],
    feedback: [],
    announcements: cloneData(SEED_ANNOUNCEMENTS),
    verificationLogs: [
      {
        id: 'vlog-init-1',
        entityType: 'scheme',
        entityId: 'sch-annapurna-yojana',
        entityTitle: 'Annapurna Yojana',
        previousStatus: 'Pending Verification',
        newStatus: 'Officially Verified',
        reviewerName: 'Verification Desk',
        reviewerRole: 'content_reviewer',
        note: 'Verified official URL socialsecurity.wb.gov.in and department details.',
        timestamp: '2026-11-12T09:30:00.000Z',
      },
    ],
    analytics: {
      totalVisits: 1,
      visitorSessionIds: [],
      jobsViewed: 0,
      jobReferrals: 0,
      coursesViewed: 0,
      trainingReferrals: 0,
      schemeReferrals: 0,
      businessDirectoryVisits: 0,
      workshopInterestCount: 0,
      checklistsCompleted: 0,
      fraudChecksCompleted: 0,
      localHelpClicks: 0,
      voiceAssistantUses: 0,
      dailyEngagement: {
        [today]: { visits: 1, referrals: 0 },
      },
    },
  };
}

let memoryDb: LocalDbState | null = null;

function loadDb(): LocalDbState {
  if (memoryDb) return memoryDb;
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalDbState>;
      if (parsed && parsed.version === DB_VERSION && Array.isArray(parsed.users)) {
        const base = createInitialDb();
        memoryDb = {
          ...base,
          ...parsed,
          jobs: Array.isArray(parsed.jobs) && parsed.jobs.length > 0 ? parsed.jobs : base.jobs,
          courses: Array.isArray(parsed.courses) && parsed.courses.length > 0 ? parsed.courses : base.courses,
          trainingCentres:
            Array.isArray(parsed.trainingCentres) && parsed.trainingCentres.length > 0
              ? parsed.trainingCentres
              : base.trainingCentres,
          schemes: Array.isArray(parsed.schemes) && parsed.schemes.length > 0 ? parsed.schemes : base.schemes,
          businessIdeas:
            Array.isArray(parsed.businessIdeas) && parsed.businessIdeas.length > 0
              ? parsed.businessIdeas
              : base.businessIdeas,
          businesses:
            Array.isArray(parsed.businesses) && parsed.businesses.length > 0
              ? parsed.businesses
              : base.businesses,
          assistanceCentres:
            Array.isArray(parsed.assistanceCentres) && parsed.assistanceCentres.length > 0
              ? parsed.assistanceCentres
              : base.assistanceCentres,
          fraudAlerts:
            Array.isArray(parsed.fraudAlerts) && parsed.fraudAlerts.length > 0
              ? parsed.fraudAlerts
              : base.fraudAlerts,
          announcements:
            Array.isArray(parsed.announcements) && parsed.announcements.length > 0
              ? parsed.announcements
              : base.announcements,
          analytics: { ...base.analytics, ...(parsed.analytics || {}) },
        };
        return memoryDb;
      }
    }
  } catch {
    // Ignore localStorage parsing errors and re-initialize
  }
  memoryDb = createInitialDb();
  saveDb(memoryDb);
  return memoryDb;
}

function saveDb(state: LocalDbState) {
  memoryDb = state;
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

function makeLocalToken(userId: string): string {
  return `jenova-local.${userId}`;
}

function resolveUserFromToken(db: LocalDbState, token?: string | null): LocalUser | null {
  if (!token) return null;
  if (token.startsWith('jenova-local.')) {
    const uid = token.slice('jenova-local.'.length);
    return db.users.find((u) => u.id === uid) || null;
  }
  // Also decode server-issued base64url payload if user logged in before switching offline
  try {
    const [payloadB64] = token.split('.');
    if (payloadB64) {
      const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
      const parsed = JSON.parse(atob(normalized)) as { uid?: string; email?: string };
      if (parsed.uid) {
        return db.users.find((u) => u.id === parsed.uid) || null;
      }
    }
  } catch {
    // Ignore invalid tokens
  }
  return null;
}

function getAnalyticsSummary(db: LocalDbState): PlatformAnalytics {
  const verifiedJobs = db.jobs.filter((j) => isPubliclyVerifiedStatus(j.verificationStatus));
  const verifiedCourses = db.courses.filter((c) => isPubliclyVerifiedStatus(c.verificationStatus));
  const verifiedSchemes = db.schemes.filter((s) => isPubliclyVerifiedStatus(s.verificationStatus));
  const verifiedBusinesses = db.businesses.filter((b) => isPubliclyVerifiedStatus(b.verificationStatus));
  const verifiedAssistance = db.assistanceCentres.filter((a) =>
    isPubliclyVerifiedStatus(a.verificationStatus)
  );
  const dailyEntries = Object.entries(db.analytics.dailyEngagement)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, val]) => ({ date, visits: val.visits, referrals: val.referrals }));

  return {
    totalVisits: db.analytics.totalVisits,
    uniqueVisitorSessions: Math.max(1, db.analytics.visitorSessionIds.length),
    registeredUsers: db.users.length,
    jobsViewed: db.analytics.jobsViewed,
    jobReferrals: db.analytics.jobReferrals,
    coursesViewed: db.analytics.coursesViewed,
    trainingReferrals: db.analytics.trainingReferrals,
    schemeReferrals: db.analytics.schemeReferrals,
    businessDirectoryVisits: db.analytics.businessDirectoryVisits,
    workshopInterestCount: db.analytics.workshopInterestCount,
    checklistsCompleted: db.analytics.checklistsCompleted,
    fraudChecksCompleted: db.analytics.fraudChecksCompleted,
    localHelpClicks: db.analytics.localHelpClicks,
    voiceAssistantUses: db.analytics.voiceAssistantUses,
    updateSubscribersCount: db.updateSubscriptions.filter((u) => u.active).length,
    feedbackCount: db.feedback.length,
    openReportsCount: db.reports.filter((r) => r.status === 'Open').length,
    verifiedCounts: {
      jobs: verifiedJobs.length,
      demoJobs: verifiedJobs.filter((j) => j.isDemo).length,
      courses: verifiedCourses.length,
      schemes: verifiedSchemes.length,
      businesses: verifiedBusinesses.length,
      assistanceCentres: verifiedAssistance.length,
    },
    dailyEngagement: dailyEntries,
  };
}

function buildGroundedAssistantReply(db: LocalDbState, message: string, language: Language) {
  const q = message.toLowerCase();
  const actions: { label: string; path: string }[] = [];

  if (/(scam|fraud|otp|upi|pin|fee|money|প্রতারণা|টাকা|ওটিপি|ধोख|धोखाधड़ी|शुल्क)/i.test(q)) {
    actions.push({
      label: language === 'bn' ? 'JENOVA Protect (প্রতারণা যাচাই)' : 'Open JENOVA Protect',
      path: '/scam-check',
    });
    actions.push({
      label: language === 'bn' ? 'প্রতারণা সুরক্ষা গাইড' : 'Fraud Safety Guide',
      path: '/finance/fraud-awareness',
    });
    return {
      reply:
        language === 'bn'
          ? 'সতর্কতা: প্রকৃত চাকরি, সরকারি প্রকল্প বা ব্যাংক কখনোই অগ্রিম ফি, OTP বা UPI PIN চায় না। সন্দেহজনক মেসেজ বা লিঙ্ক JENOVA Protect-এ পেস্ট করে যাচাই করুন। প্রতারণা হলে দ্রুত ১৯৩০ নম্বরে কল করুন বা cybercrime.gov.in-এ অভিযোগ জানান।'
          : language === 'hi'
            ? 'सावधान: कोई भी असली नौकरी, सरकारी योजना या बैंक कभी अग्रिम शुल्क, OTP या UPI PIN नहीं मांगता। संदिग्ध संदेश को JENOVA Protect में जांचें और ठगी होने पर तुरंत 1930 पर कॉल करें।'
            : 'Safety Alert: Genuine employers, welfare portals, and banks never ask for upfront registration fees, OTPs, or UPI PINs. Paste the message into JENOVA Protect to check warning signals, and report cyber fraud immediately via helpline 1930 or cybercrime.gov.in.',
      suggestedActions: actions,
    };
  }

  if (/(job|salary|work|hire|intern|biodata|cv|চাকরি|কাজ|বেতন|নৌকরি|नौकरी|रोजगार)/i.test(q)) {
    const sampleJobs = db.jobs
      .filter((j) => isPubliclyVerifiedStatus(j.verificationStatus))
      .slice(0, 3)
      .map((j) => `• ${language === 'bn' ? j.title.bn : language === 'hi' ? j.title.hi : j.title.en} (${j.category})`)
      .join('\n');
    actions.push({
      label: language === 'bn' ? 'কর্মসংস্থান পোর্টাল দেখুন' : 'Browse Verified Jobs',
      path: '/jobs',
    });
    actions.push({
      label: language === 'bn' ? '১-মিনিট বায়োডাটা তৈরি করুন' : '1-Minute Biodata Builder',
      path: '/jobs/biodata',
    });
    return {
      reply:
        language === 'bn'
          ? `JENOVA কর্মসংস্থান পোর্টালে সব ৮টি বিভাগে ${db.jobs.length}টি যাচাইকৃত সুযোগ রয়েছে:\n${sampleJobs}\n\nআপনি বিনামূল্যে ১-মিনিট বায়োডাটা তৈরি করে অফিসিয়াল পোর্টালে আবেদন করতে পারেন।`
          : language === 'hi'
            ? `JENOVA रोजगार पोर्टल पर सभी 8 श्रेणियों में ${db.jobs.length} सत्यापित अवसर उपलब्ध हैं:\n${sampleJobs}\n\nआप निःशुल्क 1-मिनट बायोडाटा बनाकर आधिकारिक पोर्टल पर आवेदन कर सकते हैं।`
            : `JENOVA lists ${db.jobs.length} verified opportunities across all 8 job categories:\n${sampleJobs}\n\nUse our 1-Minute Biodata Builder and apply directly through official portals with zero fees.`,
      suggestedActions: actions,
    };
  }

  if (/(skill|course|train|computer|tailor|দক্ষতা|প্রশিক্ষণ|কম্পিউটার|সেলাই|कौशल|प्रशिक्षण)/i.test(q)) {
    const sampleCourses = db.courses
      .filter((c) => isPubliclyVerifiedStatus(c.verificationStatus))
      .slice(0, 3)
      .map((c) => `• ${language === 'bn' ? c.name.bn : language === 'hi' ? c.name.hi : c.name.en} (${c.fees})`)
      .join('\n');
    actions.push({
      label: language === 'bn' ? 'বিনামূল্যে দক্ষতা ও কোর্স দেখুন' : 'Explore Free Courses',
      path: '/skills',
    });
    return {
      reply:
        language === 'bn'
          ? `উৎকর্ষ বাংলা, স্কিল ইন্ডিয়া ডিজিটাল ও SWAYAM-এর মাধ্যমে বিনামূল্যে প্রশিক্ষণের সুযোগ রয়েছে:\n${sampleCourses}`
          : language === 'hi'
            ? `स्किल इंडिया डिजिटल, उत्कर्ष बांग्ला और SWAYAM के माध्यम से निःशुल्क प्रशिक्षण उपलब्ध है:\n${sampleCourses}`
            : `Verified free and government-supported skill training pathways are available across all 10 categories:\n${sampleCourses}`,
      suggestedActions: actions,
    };
  }

  if (/(document|folder|checklist|paper|কাগজ|নথি|ফোল্ডার|दस्तावेज़)/i.test(q)) {
    actions.push({
      label: language === 'bn' ? 'JENOVA Checklist খুলুন' : 'Open JENOVA Checklist',
      path: '/checklist',
    });
    actions.push({
      label: language === 'bn' ? 'নিকটস্থ সহায়তা কেন্দ্র' : 'Find Local Assistance',
      path: '/local-help',
    });
    return {
      reply:
        language === 'bn'
          ? 'সরকারি প্রকল্পের আবেদনের আগে সাধারণত আধার কার্ড, ব্যাংক পাসবই (DBT সক্রিয়), পাসপোর্ট ছবি এবং আয়/বসবাসের প্রমাণপত্র প্রয়োজন হয়। JENOVA Checklist ব্যবহার করে যাওয়ার আগেই সব কাগজ মিলিয়ে নিন (কোনো নথি আপলোড করতে হয় না)।'
          : language === 'hi'
            ? 'आवेदन से पहले आमतौर पर आधार कार्ड, DBT-लिंक बैंक पासबुक, पासपोर्ट फोटो और आय/निवास प्रमाण पत्र की आवश्यकता होती है। जाने से पहले JENOVA Checklist से सभी कागज़ात जांच लें।'
            : 'Before visiting a BSK, CSC, or BDO office, verify your Aadhaar, DBT-seeded bank passbook, passport photos, and required certificates using JENOVA Checklist. Everything stays privately on your device.',
      suggestedActions: actions,
    };
  }

  // Default: Government Schemes & Local Support overview
  const matchedSchemes = db.schemes
    .filter((s) => isPubliclyVerifiedStatus(s.verificationStatus))
    .slice(0, 3)
    .map((s) => `• ${language === 'bn' ? s.officialName.bn : language === 'hi' ? s.officialName.hi : s.officialName.en} (${s.officialWebsite})`)
    .join('\n');
  actions.push({
    label: language === 'bn' ? 'সরকারি প্রকল্প দেখুন' : 'Explore Government Schemes',
    path: '/schemes',
  });
  actions.push({
    label: language === 'bn' ? 'JENOVA Checklist' : 'Open JENOVA Checklist',
    path: '/checklist',
  });
  actions.push({
    label: language === 'bn' ? 'স্থানীয় সহায়তা কেন্দ্র' : 'Local Assistance',
    path: '/local-help',
  });

  return {
    reply:
      language === 'bn'
        ? `JENOVA-তে যাচাইকৃত সরকারি প্রকল্প, বিনামূল্যে দক্ষতা কোর্স, নিরাপদ চাকরি ও প্রতারণা যাচাই একসাথে পাবেন। প্রধান কয়েকটি সরকারি প্রকল্প:\n${matchedSchemes}\n\nনিচের বাটন থেকে সরাসরি প্রকল্প, চেকলিস্ট বা সহায়তা কেন্দ্র খুলুন।`
        : language === 'hi'
          ? `JENOVA पर सत्यापित सरकारी योजनाएं, निःशुल्क कौशल पाठ्यक्रम, सुरक्षित रोजगार और धोखाधड़ी जांच एक ही स्थान पर उपलब्ध हैं। प्रमुख योजनाएं:\n${matchedSchemes}`
          : `JENOVA brings together verified government schemes, free skill courses, safe job pathways, and digital fraud checks in one place. Featured verified schemes:\n${matchedSchemes}\n\nUse the quick links below to open schemes, document checklists, or local support.`,
    suggestedActions: actions,
  };
}

function parseBody(options: RequestInit): Record<string, unknown> {
  if (!options.body || typeof options.body !== 'string') return {};
  try {
    return JSON.parse(options.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function handleLocalApiRequest<T>(
  url: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const db = loadDb();
  const method = (options.method || 'GET').toUpperCase();
  const parsedUrl = new URL(url, 'http://jenova.local');
  const pathname = parsedUrl.pathname;
  const body = parseBody(options);
  const authUser = resolveUserFromToken(db, token);

  const requireAuth = (): LocalUser => {
    if (!authUser) throw new Error('Please sign in to access this feature.');
    return authUser;
  };

  const requireMinRole = (minRole: UserRole): LocalUser => {
    const u = requireAuth();
    if (ROLE_RANK[u.role] < ROLE_RANK[minRole]) {
      throw new Error('You do not have permission for this administrative action.');
    }
    return u;
  };

  // ── AUTH ──────────────────────────────────────────────────────────────────
  if (pathname === '/api/auth/login' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = db.users.find((u) => u.email.toLowerCase() === email && u.password === password);
    if (!user) throw new Error('Invalid email or password.');
    return { token: makeLocalToken(user.id), user: sanitizeUser(user) } as T;
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const password = String(body.password || '');
    const town = String(body.town || '').trim() || 'India';
    const preferredLanguage =
      body.preferredLanguage === 'en' || body.preferredLanguage === 'hi'
        ? body.preferredLanguage
        : 'bn';
    if (!email || !email.includes('@') || name.length < 2 || password.length < 6) {
      throw new Error('Please provide a valid name (2+ chars), email address, and password (6+ chars).');
    }
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: LocalUser = {
      id: makeId('usr'),
      email,
      name,
      password,
      role: 'user',
      town,
      preferredLanguage,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDb(db);
    return { token: makeLocalToken(newUser.id), user: sanitizeUser(newUser) } as T;
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    const u = requireAuth();
    return { user: sanitizeUser(u) } as T;
  }

  if (pathname === '/api/auth/account' && method === 'DELETE') {
    const u = requireAuth();
    if (u.role === 'super_admin') {
      throw new Error('Super Administrator account cannot be self-deleted.');
    }
    db.users = db.users.filter((x) => x.id !== u.id);
    db.bookmarks = db.bookmarks.filter((b) => b.userId !== u.id);
    db.savingsGoals = db.savingsGoals.filter((g) => g.userId !== u.id);
    saveDb(db);
    return { deleted: true } as T;
  }

  // ── ANALYTICS & PUBLIC STATS ──────────────────────────────────────────────
  if (pathname === '/api/analytics/visit' && method === 'POST') {
    const sid = String(body.sessionId || '');
    const today = todayKey();
    db.analytics.totalVisits += 1;
    if (sid && !db.analytics.visitorSessionIds.includes(sid)) {
      db.analytics.visitorSessionIds.push(sid);
    }
    if (!db.analytics.dailyEngagement[today]) {
      db.analytics.dailyEngagement[today] = { visits: 0, referrals: 0 };
    }
    db.analytics.dailyEngagement[today].visits += 1;
    saveDb(db);
    return { ok: true } as T;
  }

  if (pathname === '/api/analytics/event' && method === 'POST') {
    const eventType = String(body.eventType || '');
    const entityId = String(body.entityId || '');
    const today = todayKey();
    if (!db.analytics.dailyEngagement[today]) {
      db.analytics.dailyEngagement[today] = { visits: 0, referrals: 0 };
    }
    if (eventType === 'job_view') {
      db.analytics.jobsViewed += 1;
      const item = db.jobs.find((x) => x.id === entityId);
      if (item) item.viewsCount += 1;
    } else if (eventType === 'job_referral') {
      db.analytics.jobReferrals += 1;
      db.analytics.dailyEngagement[today].referrals += 1;
      const item = db.jobs.find((x) => x.id === entityId);
      if (item) item.referralsCount += 1;
    } else if (eventType === 'course_view') {
      db.analytics.coursesViewed += 1;
      const item = db.courses.find((x) => x.id === entityId);
      if (item) item.viewsCount += 1;
    } else if (eventType === 'training_referral') {
      db.analytics.trainingReferrals += 1;
      db.analytics.dailyEngagement[today].referrals += 1;
      const item = db.courses.find((x) => x.id === entityId);
      if (item) item.referralsCount += 1;
    } else if (eventType === 'scheme_referral') {
      db.analytics.schemeReferrals += 1;
      db.analytics.dailyEngagement[today].referrals += 1;
      const item = db.schemes.find((x) => x.id === entityId);
      if (item) item.referralsCount += 1;
    } else if (eventType === 'business_visit') {
      db.analytics.businessDirectoryVisits += 1;
      const item = db.businesses.find((x) => x.id === entityId);
      if (item) item.visitsCount += 1;
    } else if (eventType === 'workshop_interest') {
      db.analytics.workshopInterestCount += 1;
    } else if (eventType === 'checklist_completed') {
      db.analytics.checklistsCompleted += 1;
    } else if (eventType === 'fraud_check_completed') {
      db.analytics.fraudChecksCompleted += 1;
    } else if (eventType === 'local_help_click') {
      db.analytics.localHelpClicks += 1;
      db.analytics.dailyEngagement[today].referrals += 1;
      const item = db.assistanceCentres.find((x) => x.id === entityId);
      if (item) item.referralsCount += 1;
    } else if (eventType === 'voice_assistant_use') {
      db.analytics.voiceAssistantUses += 1;
    }
    saveDb(db);
    return { ok: true } as T;
  }

  if (pathname === '/api/public/stats' && method === 'GET') {
    const s = getAnalyticsSummary(db);
    return {
      totalVisits: s.totalVisits,
      verifiedCounts: s.verifiedCounts,
      schemeReferrals: s.schemeReferrals,
      trainingReferrals: s.trainingReferrals,
      jobReferrals: s.jobReferrals,
      checklistsCompleted: s.checklistsCompleted,
      fraudChecksCompleted: s.fraudChecksCompleted,
      localHelpClicks: s.localHelpClicks,
      voiceAssistantUses: s.voiceAssistantUses,
      updateSubscribersCount: s.updateSubscribersCount,
      feedbackCount: s.feedbackCount,
    } as T;
  }

  // ── JOBS ──────────────────────────────────────────────────────────────────
  if (pathname === '/api/jobs' && method === 'GET') {
    const includeAll =
      parsedUrl.searchParams.get('includeAll') === 'true' &&
      authUser &&
      authUser.role !== 'user';
    const jobs = includeAll
      ? db.jobs
      : db.jobs.filter((j) => isPubliclyVerifiedStatus(j.verificationStatus));
    return { jobs } as T;
  }

  if (pathname === '/api/jobs/submit' && method === 'POST') {
    const titleEn = String(body.title || '').trim();
    const employerName = String(body.employerName || '').trim();
    const descriptionEn = String(body.description || '').trim();
    const location = String(body.location || '').trim();
    if (!titleEn || !employerName || !descriptionEn || !location) {
      throw new Error('Title, employer name, location, and description are required.');
    }
    const now = todayKey();
    const salaryMin = Math.max(0, Number(body.salaryMin) || 0);
    const salaryMax = Math.max(salaryMin, Number(body.salaryMax) || salaryMin);
    const salaryUnit =
      body.salaryUnit === 'daily' ? 'daily' : body.salaryUnit === 'stipend' ? 'stipend' : 'monthly';
    const unitLabel = salaryUnit === 'daily' ? '/ day' : '/ month';
    const displaySalary =
      salaryMin > 0 ? `₹${salaryMin.toLocaleString('en-IN')} – ₹${salaryMax.toLocaleString('en-IN')} ${unitLabel}` : 'As per official notification';
    const newJob: JobListing = {
      id: makeId('job'),
      title: { bn: titleEn, en: titleEn, hi: titleEn },
      employerName,
      description: { bn: descriptionEn, en: descriptionEn, hi: descriptionEn },
      salaryMin,
      salaryMax,
      salaryUnit,
      salaryDisplay: { bn: displaySalary, en: displaySalary, hi: displaySalary },
      location,
      category: (String(body.category || 'Local') as JobListing['category']) || 'Local',
      qualification: String(body.qualification || 'As specified'),
      experience: String(body.experience || 'Freshers / Experienced'),
      workingHours: String(body.workingHours || 'Day Shift'),
      applicationInstructions: {
        bn: 'সরাসরি যাচাইকৃত নিয়োগকর্তা বা অফিসিয়াল পোর্টালে আবেদন করুন। কখনোই অগ্রিম ফি দেবেন না।',
        en: 'Apply directly via the employer contact or official portal. Never pay upfront job fees.',
        hi: 'सीधे सत्यापित नियोक्ता या आधिकारिक पोर्टल के माध्यम से आवेदन करें। कभी अग्रिम शुल्क न दें।',
      },
      contactInfo: String(body.contactInfo || 'Employer contact pending review'),
      applicationUrl: String(body.applicationUrl || ''),
      deadline: String(body.deadline || '2026-12-31'),
      isDemo: false,
      sourceName: authUser ? `Community Submission (${authUser.name})` : 'Community Employer Submission',
      sourceUrl: String(body.applicationUrl || ''),
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: now,
      reviewer: 'Awaiting Verification Desk',
      expiryDate: '2026-12-31',
      viewsCount: 0,
      referralsCount: 0,
    };
    db.jobs.unshift(newJob);
    saveDb(db);
    return {
      job: newJob,
      message: 'Job submitted for Verification Desk review. It will appear publicly once verified.',
    } as T;
  }

  if (pathname.startsWith('/api/jobs/') && method === 'GET') {
    const id = pathname.slice('/api/jobs/'.length);
    const job = db.jobs.find((j) => j.id === id);
    if (!job) throw new Error('Job listing not found.');
    return { job } as T;
  }

  // ── COURSES & TRAINING ────────────────────────────────────────────────────
  if (pathname === '/api/courses' && method === 'GET') {
    const includeAll =
      parsedUrl.searchParams.get('includeAll') === 'true' &&
      authUser &&
      authUser.role !== 'user';
    const courses = includeAll
      ? db.courses
      : db.courses.filter((c) => isPubliclyVerifiedStatus(c.verificationStatus));
    return { courses, trainingCentres: db.trainingCentres } as T;
  }

  if (pathname.startsWith('/api/courses/') && method === 'GET') {
    const id = pathname.slice('/api/courses/'.length);
    const course = db.courses.find((c) => c.id === id);
    if (!course) throw new Error('Course not found.');
    return { course } as T;
  }

  // ── SCHEMES ───────────────────────────────────────────────────────────────
  if (pathname === '/api/schemes' && method === 'GET') {
    const includeAll =
      parsedUrl.searchParams.get('includeAll') === 'true' &&
      authUser &&
      authUser.role !== 'user';
    const schemes = includeAll
      ? db.schemes
      : db.schemes.filter((s) => isPubliclyVerifiedStatus(s.verificationStatus));
    return { schemes } as T;
  }

  if (pathname.startsWith('/api/schemes/') && method === 'GET') {
    const id = pathname.slice('/api/schemes/'.length);
    const scheme = db.schemes.find((s) => s.id === id);
    if (!scheme) throw new Error('Scheme not found.');
    return { scheme } as T;
  }

  // ── MSME & BUSINESSES ─────────────────────────────────────────────────────
  if (pathname === '/api/msme/ideas' && method === 'GET') {
    return { ideas: db.businessIdeas } as T;
  }

  if (pathname === '/api/businesses' && method === 'GET') {
    const includeAll =
      parsedUrl.searchParams.get('includeAll') === 'true' &&
      authUser &&
      authUser.role !== 'user';
    const businesses = includeAll
      ? db.businesses
      : db.businesses.filter((b) => isPubliclyVerifiedStatus(b.verificationStatus));
    return { businesses } as T;
  }

  if (pathname === '/api/businesses/submit' && method === 'POST') {
    const businessName = String(body.businessName || '').trim();
    const location = String(body.location || '').trim();
    const descriptionEn = String(body.description || body.services || '').trim();
    const servicesText = String(body.services || descriptionEn).trim();
    if (!businessName || !location || !descriptionEn) {
      throw new Error('Business name, location, and description are required.');
    }
    const today = todayKey();
    const biz: BusinessProfile = {
      id: makeId('biz'),
      businessName,
      category: String(body.category || 'Local Enterprise'),
      location,
      description: { bn: descriptionEn, en: descriptionEn, hi: descriptionEn },
      services: servicesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      contactInfo: String(body.contactInfo || body.contactDetails || 'Pending verification'),
      operatingHours: String(body.operatingHours || body.workingHours || '9:00 AM – 8:00 PM'),
      websiteOrSocial: String(body.websiteOrSocial || ''),
      isDemo: false,
      sourceName: 'Community Business Submission',
      sourceUrl: String(body.websiteOrSocial || ''),
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: today,
      reviewer: 'Awaiting Verification Desk',
      expiryDate: '2027-12-31',
      submittedBy: authUser?.name,
      visitsCount: 0,
    };
    db.businesses.unshift(biz);
    saveDb(db);
    return {
      business: biz,
      message: 'Business submitted for Verification Desk approval.',
    } as T;
  }

  // ── LOCAL ASSISTANCE, ANNOUNCEMENTS & FRAUD ───────────────────────────────
  if (pathname === '/api/assistance' && method === 'GET') {
    const includeAll =
      parsedUrl.searchParams.get('includeAll') === 'true' &&
      authUser &&
      authUser.role !== 'user';
    const centres = includeAll
      ? db.assistanceCentres
      : db.assistanceCentres.filter((c) => isPubliclyVerifiedStatus(c.verificationStatus));
    return { centres } as T;
  }

  if (pathname === '/api/announcements' && method === 'GET') {
    return { announcements: db.announcements.filter((a) => a.isActive) } as T;
  }

  if (pathname === '/api/fraud/alerts' && method === 'GET') {
    return { alerts: db.fraudAlerts.filter((a) => a.isActive) } as T;
  }

  if (pathname === '/api/fraud/analyze' && method === 'POST') {
    const content = String(body.content || '').trim();
    if (content.length < 4) {
      throw new Error('Please paste a message, link, job offer, or payment request to analyze.');
    }
    const language: Language =
      body.language === 'en' || body.language === 'hi' ? body.language : 'bn';
    const inputType = (String(body.inputType || 'message') as
      | 'message'
      | 'job'
      | 'loan'
      | 'link'
      | 'payment'
      | 'contact');
    const result = analyzeFraudRisk(content, inputType, language);
    db.analytics.fraudChecksCompleted += 1;
    saveDb(db);
    return { result } as T;
  }

  // ── AI ASSISTANT & SCHEME EXPLAINER (LOCAL GROUNDED MODE) ─────────────────
  if (pathname === '/api/ai/assistant' && method === 'POST') {
    const message = String(body.message || '').trim();
    if (!message) throw new Error('Please enter a question.');
    const language: Language =
      body.language === 'en' || body.language === 'hi' ? body.language : 'bn';
    return buildGroundedAssistantReply(db, message, language) as T;
  }

  if (pathname === '/api/ai/scheme-explain' && method === 'POST') {
    const schemeId = String(body.schemeId || '');
    const language: Language =
      body.language === 'en' || body.language === 'hi' ? body.language : 'bn';
    const scheme = db.schemes.find((s) => s.id === schemeId);
    if (!scheme) throw new Error('Scheme not found.');
    const name = language === 'bn' ? scheme.officialName.bn : language === 'hi' ? scheme.officialName.hi : scheme.officialName.en;
    const benefits = language === 'bn' ? scheme.benefits.bn : language === 'hi' ? scheme.benefits.hi : scheme.benefits.en;
    const elig = language === 'bn' ? scheme.eligibilityRequirements.bn : language === 'hi' ? scheme.eligibilityRequirements.hi : scheme.eligibilityRequirements.en;
    const proc = language === 'bn' ? scheme.applicationProcess.bn : language === 'hi' ? scheme.applicationProcess.hi : scheme.applicationProcess.en;
    return {
      explanation: `${name}\n\n• Key Benefits: ${benefits}\n• Who May Qualify: ${elig}\n• Required Documents: ${scheme.requiredDocuments.join(', ')}\n• How to Apply: ${proc}\n• Official Website: ${scheme.officialWebsite}`,
    } as T;
  }

  if (pathname === '/api/ai/tts' && method === 'POST') {
    return { audioBase64: null, fallback: 'browser-speech-synthesis' } as T;
  }

  // ── USER BOOKMARKS & SAVINGS GOALS ────────────────────────────────────────
  if (pathname === '/api/bookmarks' && method === 'GET') {
    const u = requireAuth();
    return { bookmarks: db.bookmarks.filter((b) => b.userId === u.id) } as T;
  }

  if (pathname === '/api/bookmarks/toggle' && method === 'POST') {
    const u = requireAuth();
    const itemType = String(body.itemType || '') as BookmarkItem['itemType'];
    const itemId = String(body.itemId || '');
    const existingIdx = db.bookmarks.findIndex(
      (b) => b.userId === u.id && b.itemType === itemType && b.itemId === itemId
    );
    let saved = false;
    if (existingIdx >= 0) {
      db.bookmarks.splice(existingIdx, 1);
      saved = false;
    } else {
      db.bookmarks.push({
        id: makeId('bm'),
        userId: u.id,
        itemType,
        itemId,
        createdAt: new Date().toISOString(),
      });
      saved = true;
    }
    saveDb(db);
    return { saved, bookmarks: db.bookmarks.filter((b) => b.userId === u.id) } as T;
  }

  if (pathname === '/api/savings-goals' && method === 'GET') {
    const u = requireAuth();
    return { goals: db.savingsGoals.filter((g) => g.userId === u.id) } as T;
  }

  if (pathname === '/api/savings-goals' && method === 'POST') {
    const u = requireAuth();
    const title = String(body.title || '').trim();
    const targetAmount = Math.max(100, Number(body.targetAmount) || 0);
    const savedAmount = Math.max(0, Number(body.savedAmount) || 0);
    const monthlyContribution = Math.max(0, Number(body.monthlyContribution) || 0);
    if (!title) throw new Error('Goal title is required.');
    const goal: SavingsGoal = {
      id: makeId('goal'),
      userId: u.id,
      title,
      targetAmount,
      savedAmount,
      monthlyContribution,
      targetDate: String(body.targetDate || '2027-12-31'),
      updatedAt: new Date().toISOString(),
    };
    db.savingsGoals.unshift(goal);
    saveDb(db);
    return { goal } as T;
  }

  if (pathname.startsWith('/api/savings-goals/') && method === 'PATCH') {
    const u = requireAuth();
    const id = pathname.slice('/api/savings-goals/'.length);
    const goal = db.savingsGoals.find((g) => g.id === id && g.userId === u.id);
    if (!goal) throw new Error('Savings goal not found.');
    if (body.savedAmount !== undefined) goal.savedAmount = Math.max(0, Number(body.savedAmount) || 0);
    if (body.targetAmount !== undefined) goal.targetAmount = Math.max(100, Number(body.targetAmount) || 100);
    if (body.monthlyContribution !== undefined) goal.monthlyContribution = Math.max(0, Number(body.monthlyContribution) || 0);
    goal.updatedAt = new Date().toISOString();
    saveDb(db);
    return { goal } as T;
  }

  if (pathname.startsWith('/api/savings-goals/') && method === 'DELETE') {
    const u = requireAuth();
    const id = pathname.slice('/api/savings-goals/'.length);
    db.savingsGoals = db.savingsGoals.filter((g) => !(g.id === id && g.userId === u.id));
    saveDb(db);
    return { deleted: true } as T;
  }

  // ── REPORTS, FEEDBACK & UPDATES ───────────────────────────────────────────
  if (pathname === '/api/reports' && method === 'POST') {
    const details = String(body.details || '').trim();
    if (details.length < 6) throw new Error('Please describe the issue briefly.');
    const report: ContentReport = {
      id: makeId('rep'),
      targetType: (String(body.targetType || 'general') as ContentReport['targetType']),
      targetId: String(body.targetId || 'general'),
      targetTitle: String(body.targetTitle || 'Platform Listing'),
      reportType: (String(body.reportType || 'Incorrect Information') as ContentReport['reportType']),
      details,
      reporterContact: String(body.reporterContact || 'Anonymous'),
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    db.reports.unshift(report);
    saveDb(db);
    return { report } as T;
  }

  if (pathname === '/api/feedback' && method === 'POST') {
    const name = String(body.name || '').trim();
    const message = String(body.message || '').trim();
    if (!name || !message) throw new Error('Name and message are required.');
    const fb: FeedbackSubmission = {
      id: makeId('fb'),
      type: (String(body.type || 'feedback') as FeedbackSubmission['type']),
      name,
      contact: String(body.contact || 'Not provided'),
      subject: String(body.subject || 'Community Inquiry'),
      message,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    db.feedback.unshift(fb);
    saveDb(db);
    return { feedback: fb } as T;
  }

  if (pathname === '/api/updates/subscribe' && method === 'POST') {
    const contactValue = String(body.contactValue || '').trim();
    if (!contactValue) throw new Error('Please enter an email address or phone number.');
    const topics = Array.isArray(body.topics) ? body.topics.map(String) : ['schemes'];
    const sub: UpdateSubscription = {
      id: makeId('sub'),
      name: String(body.name || 'Community Member').trim(),
      channel:
        body.channel === 'web' || body.channel === 'whatsapp_ready' ? body.channel : 'email',
      contactValue,
      topics,
      frequency:
        body.frequency === 'urgent_only' || body.frequency === 'monthly'
          ? body.frequency
          : 'weekly',
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      active: true,
    };
    db.updateSubscriptions.unshift(sub);
    saveDb(db);
    return {
      subscription: sub,
      message: 'Your JENOVA update alert preferences have been saved! You can unsubscribe at any time.',
    } as T;
  }

  if (pathname === '/api/updates/unsubscribe' && method === 'POST') {
    const contactValue = String(body.contactValue || '').trim().toLowerCase();
    let count = 0;
    for (const s of db.updateSubscriptions) {
      if (s.contactValue.toLowerCase() === contactValue && s.active) {
        s.active = false;
        count += 1;
      }
    }
    saveDb(db);
    return { unsubscribed: count > 0, count } as T;
  }

  // ── ADMIN CONSOLE ─────────────────────────────────────────────────────────
  if (pathname === '/api/admin/overview' && method === 'GET') {
    requireMinRole('content_reviewer');
    return {
      analytics: getAnalyticsSummary(db),
      jobs: db.jobs,
      courses: db.courses,
      schemes: db.schemes,
      businesses: db.businesses,
      assistanceCentres: db.assistanceCentres,
      fraudAlerts: db.fraudAlerts,
      reports: db.reports,
      feedback: db.feedback,
      announcements: db.announcements,
      verificationLogs: db.verificationLogs,
      users: db.users.map(sanitizeUser),
    } as T;
  }

  if (pathname === '/api/admin/verify' && method === 'PATCH') {
    const actor = requireMinRole('content_reviewer');
    const entityType = String(body.entityType || '');
    const entityId = String(body.entityId || '');
    const newStatus = String(body.newStatus || '') as VerificationStatus;
    const today = todayKey();
    let title = '';
    let prev: VerificationStatus = 'Pending Verification';
    const applyUpdate = <X extends { id: string; verificationStatus: VerificationStatus; lastUpdated: string; reviewer: string; dateVerified: string }>(
      list: X[],
      getTitle: (item: X) => string
    ) => {
      const item = list.find((x) => x.id === entityId);
      if (!item) throw new Error('Listing not found.');
      prev = item.verificationStatus;
      title = getTitle(item);
      item.verificationStatus = newStatus;
      item.lastUpdated = today;
      item.reviewer = actor.name;
      if (isPubliclyVerifiedStatus(newStatus)) item.dateVerified = today;
    };
    if (entityType === 'job') applyUpdate(db.jobs, (x) => x.title.en);
    else if (entityType === 'course') applyUpdate(db.courses, (x) => x.name.en);
    else if (entityType === 'scheme') applyUpdate(db.schemes, (x) => x.officialName.en);
    else if (entityType === 'business') applyUpdate(db.businesses, (x) => x.businessName);
    else if (entityType === 'assistance') applyUpdate(db.assistanceCentres, (x) => x.name.en);
    else throw new Error('Invalid entity type.');

    db.verificationLogs.unshift({
      id: makeId('vlog'),
      entityType: entityType as VerificationLog['entityType'],
      entityId,
      entityTitle: title,
      previousStatus: prev,
      newStatus,
      reviewerName: actor.name,
      reviewerRole: actor.role,
      note: String(body.note || `Status changed to ${newStatus}`),
      timestamp: new Date().toISOString(),
    });
    saveDb(db);
    return { updated: true, newStatus } as T;
  }

  if (pathname === '/api/admin/expiry' && method === 'PATCH') {
    const actor = requireMinRole('content_reviewer');
    const entityType = String(body.entityType || '');
    const entityId = String(body.entityId || '');
    const expiryDate = String(body.expiryDate || '');
    const listMap = {
      job: db.jobs,
      course: db.courses,
      scheme: db.schemes,
      business: db.businesses,
      assistance: db.assistanceCentres,
    } as const;
    const item = listMap[entityType as keyof typeof listMap]?.find((x) => x.id === entityId);
    if (!item) throw new Error('Listing not found.');
    item.expiryDate = expiryDate;
    item.lastUpdated = todayKey();
    item.reviewer = actor.name;
    saveDb(db);
    return { updated: true, expiryDate } as T;
  }

  if (pathname === '/api/admin/announcements' && method === 'POST') {
    const actor = requireMinRole('content_admin');
    const titleEn = String(body.titleEn || '').trim();
    const titleBn = String(body.titleBn || titleEn).trim();
    const bodyEn = String(body.bodyEn || '').trim();
    const bodyBn = String(body.bodyBn || bodyEn).trim();
    const ann: Announcement = {
      id: makeId('ann'),
      title: { bn: titleBn, en: titleEn, hi: titleEn },
      body: { bn: bodyBn, en: bodyEn, hi: bodyEn },
      category: String(body.category || 'Community Notice'),
      locationScope: 'Pan-India',
      publishedAt: todayKey(),
      isActive: true,
      createdBy: actor.name,
    };
    db.announcements.unshift(ann);
    saveDb(db);
    return { announcement: ann } as T;
  }

  if (pathname === '/api/admin/jobs' && method === 'POST') {
    const actor = requireMinRole('content_admin');
    const titleEn = String(body.title || '').trim();
    const employerName = String(body.employerName || '').trim();
    const descriptionEn = String(body.description || '').trim();
    const salaryDisplayText = String(body.salaryDisplay || 'As per official notification');
    const today = todayKey();
    const job: JobListing = {
      id: makeId('job'),
      title: { bn: titleEn, en: titleEn, hi: titleEn },
      employerName,
      description: { bn: descriptionEn, en: descriptionEn, hi: descriptionEn },
      salaryMin: Math.max(0, Number(body.salaryMin) || 0),
      salaryMax: Math.max(0, Number(body.salaryMax) || 0),
      salaryUnit: 'monthly',
      salaryDisplay: { bn: salaryDisplayText, en: salaryDisplayText, hi: salaryDisplayText },
      location: String(body.location || 'Pan-India / Remote'),
      category: (String(body.category || 'Local') as JobListing['category']),
      qualification: String(body.qualification || 'As specified'),
      experience: String(body.experience || 'Freshers / Experienced'),
      workingHours: String(body.workingHours || 'Day Shift'),
      applicationInstructions: {
        bn: 'সরাসরি অফিসিয়াল পোর্টাল বা যাচাইকৃত নিয়োগকর্তার মাধ্যমে আবেদন করুন।',
        en: 'Apply directly via the verified employer or official portal.',
        hi: 'सत्यापित नियोक्ता या आधिकारिक पोर्टल के माध्यम से आवेदन करें।',
      },
      contactInfo: String(body.contactInfo || 'Official Portal / Verified Desk'),
      applicationUrl: String(body.applicationUrl || ''),
      deadline: String(body.expiryDate || '2026-12-31'),
      isDemo: false,
      sourceName: employerName,
      sourceUrl: String(body.applicationUrl || ''),
      verificationStatus: body.publishDirectly ? 'Independently Verified' : 'Pending Verification',
      dateVerified: body.publishDirectly ? today : '',
      lastUpdated: today,
      reviewer: actor.name,
      expiryDate: String(body.expiryDate || '2026-12-31'),
      viewsCount: 0,
      referralsCount: 0,
    };
    db.jobs.unshift(job);
    saveDb(db);
    return { job } as T;
  }

  if (pathname === '/api/admin/courses' && method === 'POST') {
    const actor = requireMinRole('content_admin');
    const nameEn = String(body.name || '').trim();
    const provider = String(body.provider || '').trim();
    const descEn = String(body.description || '').trim();
    const today = todayKey();
    const course: CourseListing = {
      id: makeId('crs'),
      name: { bn: nameEn, en: nameEn, hi: nameEn },
      provider,
      category: (String(body.category || 'Digital Literacy') as CourseListing['category']),
      description: { bn: descEn, en: descEn, hi: descEn },
      duration: 'Self-Paced',
      fees: 'Free',
      isFree: true,
      eligibility: 'Open to learners',
      mode: body.mode === 'Offline' ? 'Offline' : body.mode === 'Hybrid' ? 'Hybrid' : 'Online',
      location: 'Online / District Hubs',
      applicationUrl: String(body.applicationUrl || ''),
      certification: 'Completion Certificate',
      isDemo: false,
      sourceName: provider,
      sourceUrl: String(body.applicationUrl || ''),
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: today,
      reviewer: actor.name,
      expiryDate: '2027-06-30',
      viewsCount: 0,
      referralsCount: 0,
    };
    db.courses.unshift(course);
    saveDb(db);
    return { course } as T;
  }

  if (pathname === '/api/admin/schemes' && method === 'POST') {
    const actor = requireMinRole('content_admin');
    const officialName = String(body.officialName || '').trim();
    const department = String(body.department || '').trim();
    const description = String(body.description || '').trim();
    const benefits = String(body.benefits || '').trim();
    const elig = String(body.eligibilityRequirements || '').trim();
    const today = todayKey();
    const scheme: WelfareScheme = {
      id: makeId('sch'),
      officialName: { bn: officialName, en: officialName, hi: officialName },
      department: { bn: department, en: department, hi: department },
      scope: body.scope === 'Central India' ? 'Central India' : 'West Bengal',
      category: (String(body.category || 'Social Security') as WelfareScheme['category']),
      description: { bn: description, en: description, hi: description },
      benefits: { bn: benefits, en: benefits, hi: benefits },
      eligibilityRequirements: { bn: elig, en: elig, hi: elig },
      requiredDocuments: String(body.requiredDocuments || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      applicationProcess: {
        bn: 'অফিসিয়াল সরকারি পোর্টালের মাধ্যমে আবেদন করুন।',
        en: 'Apply via the official government portal.',
        hi: 'आधिकारिक सरकारी पोर्टल के माध्यम से आवेदन करें।',
      },
      officialWebsite: String(body.officialWebsite || ''),
      sourceName: department,
      sourceUrl: String(body.officialWebsite || ''),
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: today,
      reviewer: actor.name,
      expiryDate: '2027-03-31',
      eligibilityProfile: {
        genders: ['all'],
        occupations: ['all'],
        lowIncomeFocused: true,
        westBengalResidentOnly: body.scope !== 'Central India',
      },
      referralsCount: 0,
    };
    db.schemes.unshift(scheme);
    saveDb(db);
    return { scheme } as T;
  }

  if (pathname.startsWith('/api/admin/schemes/') && method === 'PATCH') {
    const actor = requireMinRole('content_admin');
    const id = pathname.slice('/api/admin/schemes/'.length);
    const scheme = db.schemes.find((s) => s.id === id);
    if (!scheme) throw new Error('Scheme not found.');
    if (body.benefits) {
      const b = String(body.benefits);
      scheme.benefits = { bn: b, en: b, hi: b };
    }
    if (body.officialWebsite) scheme.officialWebsite = String(body.officialWebsite);
    if (body.expiryDate) scheme.expiryDate = String(body.expiryDate);
    scheme.lastUpdated = todayKey();
    scheme.reviewer = actor.name;
    saveDb(db);
    return { scheme } as T;
  }

  if (pathname === '/api/admin/assistance' && method === 'POST') {
    const actor = requireMinRole('content_admin');
    const nameEn = String(body.nameEn || '').trim();
    const nameBn = String(body.nameBn || nameEn).trim();
    const address = String(body.address || '').trim();
    const today = todayKey();
    const centre: LocalAssistanceCentre = {
      id: makeId('help'),
      name: { bn: nameBn, en: nameEn, hi: nameEn },
      category: (String(body.category || 'Community Assistance') as LocalAssistanceCentre['category']),
      description: { bn: address, en: address, hi: address },
      address,
      locationArea: String(body.locationArea || 'Pan-India / Local District'),
      servicesOffered: String(body.servicesOffered || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      publicContact: 'Verify via official source',
      timingsNote: 'Confirm timings before visiting',
      needsLocalFieldVerification: false,
      officialPortalUrl: String(body.officialPortalUrl || ''),
      sourceName: String(body.sourceName || 'Administrator Entry'),
      sourceUrl: String(body.officialPortalUrl || ''),
      verificationStatus: 'Pending Verification',
      dateVerified: '',
      lastUpdated: today,
      reviewer: actor.name,
      expiryDate: '2027-06-30',
      referralsCount: 0,
    };
    db.assistanceCentres.unshift(centre);
    saveDb(db);
    return { centre } as T;
  }

  if (pathname === '/api/admin/fraud-alerts' && method === 'POST') {
    const actor = requireMinRole('content_admin');
    const titleEn = String(body.titleEn || '').trim();
    const titleBn = String(body.titleBn || titleEn).trim();
    const summaryEn = String(body.summaryEn || '').trim();
    const safeEn = String(body.safetyTipEn || 'Never share OTP, UPI PIN, or pay advance fees.').trim();
    const alert: FraudAlert = {
      id: makeId('fa'),
      title: { bn: titleBn, en: titleEn, hi: titleEn },
      summary: { bn: summaryEn, en: summaryEn, hi: summaryEn },
      scamType: (String(body.scamType || 'Impersonation') as FraudAlert['scamType']),
      safetyTip: { bn: safeEn, en: safeEn, hi: safeEn },
      publishedAt: todayKey(),
      isActive: true,
      createdBy: actor.name,
    };
    db.fraudAlerts.unshift(alert);
    saveDb(db);
    return { alert } as T;
  }

  if (pathname.startsWith('/api/admin/reports/') && method === 'PATCH') {
    const actor = requireMinRole('content_reviewer');
    const id = pathname.slice('/api/admin/reports/'.length);
    const rep = db.reports.find((r) => r.id === id);
    if (!rep) throw new Error('Report not found.');
    rep.status = String(body.status || 'Reviewed') as ContentReport['status'];
    rep.reviewedBy = actor.name;
    saveDb(db);
    return { report: rep } as T;
  }

  if (pathname.startsWith('/api/admin/feedback/') && method === 'PATCH') {
    requireMinRole('content_admin');
    const id = pathname.slice('/api/admin/feedback/'.length);
    const fb = db.feedback.find((f) => f.id === id);
    if (!fb) throw new Error('Feedback not found.');
    fb.status = String(body.status || 'Reviewed') as FeedbackSubmission['status'];
    saveDb(db);
    return { feedback: fb } as T;
  }

  if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/role') && method === 'PATCH') {
    requireMinRole('super_admin');
    const id = pathname.slice('/api/admin/users/'.length, -'/role'.length);
    const target = db.users.find((u) => u.id === id);
    if (!target) throw new Error('User not found.');
    target.role = String(body.role || 'user') as UserRole;
    saveDb(db);
    return { user: sanitizeUser(target) } as T;
  }

  if (pathname === '/api/admin/backup' && method === 'GET') {
    requireMinRole('super_admin');
    return {
      exportedAt: new Date().toISOString(),
      usersCount: db.users.length,
      jobs: db.jobs,
      courses: db.courses,
      schemes: db.schemes,
      businesses: db.businesses,
      assistanceCentres: db.assistanceCentres,
      fraudAlerts: db.fraudAlerts,
      announcements: db.announcements,
      verificationLogs: db.verificationLogs,
      analytics: getAnalyticsSummary(db),
    } as T;
  }

  throw new Error(`Endpoint ${pathname} is unavailable.`);
}
