import fs from 'fs';
import os from 'os';
import path from 'path';
import type {
  ActionPassportGoal,
  Announcement,
  BookmarkItem,
  BusinessIdea,
  BusinessProfile,
  ContentReport,
  CourseListing,
  FeedbackSubmission,
  FraudAlert,
  JobListing,
  LocalAssistanceCentre,
  PlatformAnalytics,
  SavedBusinessPlan,
  SavingsGoal,
  TrainingCentre,
  UdaanEnrolment,
  UpdateSubscription,
  UserLivelihoodProfile,
  VerificationLog,
  WelfareScheme,
} from '../src/types/platform.ts';
import {
  createSeedUsers,
  SEED_ANNOUNCEMENTS,
  SEED_ASSISTANCE_CENTRES,
  SEED_BUSINESS_IDEAS,
  SEED_BUSINESSES,
  SEED_COURSES,
  SEED_FRAUD_ALERTS,
  SEED_JOBS,
  SEED_SCHEMES,
  SEED_TRAINING_CENTRES,
  type StoredUser,
} from './seed.ts';

export interface DatabaseState {
  seedVersion?: number;
  users: StoredUser[];
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
  userProfiles: Record<string, UserLivelihoodProfile>;
  udaanEnrolments: UdaanEnrolment[];
  passportGoals: ActionPassportGoal[];
  businessPlans: SavedBusinessPlan[];
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
    udaanEnrolments: number;
    udaanLessonsCompleted: number;
    udaanAssessmentsTaken: number;
    businessPlansCreated: number;
    passportGoalsCreated: number;
    dailyEngagement: Record<string, { visits: number; referrals: number }>;
  };
}

function resolveWritableDataDir(): string {
  const candidates = [
    path.resolve(process.cwd(), 'data'),
    path.join(os.tmpdir(), 'jenova-platform-data'),
  ];
  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const probe = path.join(dir, '.write-probe');
      fs.writeFileSync(probe, 'ok', 'utf-8');
      fs.unlinkSync(probe);
      return dir;
    } catch {
      // Try next writable directory (e.g. read-only cloud container filesystem)
    }
  }
  return candidates[1];
}

const DATA_DIR = resolveWritableDataDir();
const DATA_FILE = path.join(DATA_DIR, 'platform-store.json');

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isPubliclyVerifiedStatus(status: string): boolean {
  return (
    status === 'Verified' ||
    status === 'Officially Verified' ||
    status === 'Independently Verified'
  );
}

const CURRENT_SEED_VERSION = 5;

function createInitialState(): DatabaseState {
  const today = todayKey();
  return {
    seedVersion: CURRENT_SEED_VERSION,
    users: createSeedUsers(),
    jobs: SEED_JOBS,
    courses: SEED_COURSES,
    trainingCentres: SEED_TRAINING_CENTRES,
    schemes: SEED_SCHEMES,
    businessIdeas: SEED_BUSINESS_IDEAS,
    businesses: SEED_BUSINESSES,
    assistanceCentres: SEED_ASSISTANCE_CENTRES,
    fraudAlerts: SEED_FRAUD_ALERTS,
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
    userProfiles: {},
    udaanEnrolments: [],
    passportGoals: [],
    businessPlans: [],
    reports: [],
    feedback: [],
    announcements: SEED_ANNOUNCEMENTS,
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
      {
        id: 'vlog-init-2',
        entityType: 'assistance',
        entityId: 'help-bsk-wb',
        entityTitle: 'Bangla Sahayata Kendra (BSK)',
        previousStatus: 'Pending Verification',
        newStatus: 'Officially Verified',
        reviewerName: 'Verification Desk',
        reviewerRole: 'content_reviewer',
        note: 'Verified official West Bengal BSK portal bsk.wb.gov.in.',
        timestamp: '2026-11-15T10:15:00.000Z',
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
      udaanEnrolments: 0,
      udaanLessonsCompleted: 0,
      udaanAssessmentsTaken: 0,
      businessPlansCreated: 0,
      passportGoalsCreated: 0,
      dailyEngagement: {
        [today]: { visits: 1, referrals: 0 },
      },
    },
  };
}

class PlatformStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DatabaseState>;
        if (parsed && Array.isArray(parsed.schemes) && Array.isArray(parsed.users)) {
          const needsSeedUpgrade = (parsed.seedVersion ?? 1) < CURRENT_SEED_VERSION;
          const base = createInitialState();

          if (needsSeedUpgrade) {
            const customUsers = parsed.users.filter(
              (u) => !u.email.toLowerCase().endsWith('@mechedadisha.org') && !u.email.toLowerCase().endsWith('@jenova.in')
            );
            const upgraded: DatabaseState = {
              ...base,
              seedVersion: CURRENT_SEED_VERSION,
              users: [...createSeedUsers(), ...customUsers],
              updateSubscriptions: Array.isArray(parsed.updateSubscriptions) ? parsed.updateSubscriptions : [],
              bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
              savingsGoals: Array.isArray(parsed.savingsGoals) && parsed.savingsGoals.length > 0
                ? parsed.savingsGoals
                : base.savingsGoals,
              userProfiles: parsed.userProfiles && typeof parsed.userProfiles === 'object' ? parsed.userProfiles : {},
              udaanEnrolments: Array.isArray(parsed.udaanEnrolments) ? parsed.udaanEnrolments : [],
              passportGoals: Array.isArray(parsed.passportGoals) ? parsed.passportGoals : [],
              businessPlans: Array.isArray(parsed.businessPlans) ? parsed.businessPlans : [],
              reports: Array.isArray(parsed.reports) ? parsed.reports : [],
              feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
              analytics: {
                ...base.analytics,
                ...(parsed.analytics || {}),
                checklistsCompleted: parsed.analytics?.checklistsCompleted ?? 0,
                fraudChecksCompleted: parsed.analytics?.fraudChecksCompleted ?? 0,
                localHelpClicks: parsed.analytics?.localHelpClicks ?? 0,
                voiceAssistantUses: parsed.analytics?.voiceAssistantUses ?? 0,
                udaanEnrolments: parsed.analytics?.udaanEnrolments ?? 0,
                udaanLessonsCompleted: parsed.analytics?.udaanLessonsCompleted ?? 0,
                udaanAssessmentsTaken: parsed.analytics?.udaanAssessmentsTaken ?? 0,
                businessPlansCreated: parsed.analytics?.businessPlansCreated ?? 0,
                passportGoalsCreated: parsed.analytics?.passportGoalsCreated ?? 0,
              },
            };
            this.persist(upgraded);
            return upgraded;
          }

          // Non-destructive backward-compatible hydration + self-healing if any collection is empty
          const hydrated: DatabaseState = {
            ...base,
            ...parsed,
            seedVersion: CURRENT_SEED_VERSION,
            jobs: Array.isArray(parsed.jobs) && parsed.jobs.length > 0 ? parsed.jobs : SEED_JOBS,
            courses: Array.isArray(parsed.courses) && parsed.courses.length > 0 ? parsed.courses : SEED_COURSES,
            trainingCentres:
              Array.isArray(parsed.trainingCentres) && parsed.trainingCentres.length > 0
                ? parsed.trainingCentres
                : SEED_TRAINING_CENTRES,
            schemes: Array.isArray(parsed.schemes) && parsed.schemes.length > 0 ? parsed.schemes : SEED_SCHEMES,
            businessIdeas:
              Array.isArray(parsed.businessIdeas) && parsed.businessIdeas.length > 0
                ? parsed.businessIdeas
                : SEED_BUSINESS_IDEAS,
            businesses:
              Array.isArray(parsed.businesses) && parsed.businesses.length > 0 ? parsed.businesses : SEED_BUSINESSES,
            announcements:
              Array.isArray(parsed.announcements) && parsed.announcements.length > 0
                ? parsed.announcements
                : SEED_ANNOUNCEMENTS,
            assistanceCentres:
              Array.isArray(parsed.assistanceCentres) && parsed.assistanceCentres.length > 0
                ? parsed.assistanceCentres
                : SEED_ASSISTANCE_CENTRES,
            fraudAlerts:
              Array.isArray(parsed.fraudAlerts) && parsed.fraudAlerts.length > 0
                ? parsed.fraudAlerts
                : SEED_FRAUD_ALERTS,
            updateSubscriptions: Array.isArray(parsed.updateSubscriptions)
              ? parsed.updateSubscriptions
              : [],
            userProfiles: parsed.userProfiles && typeof parsed.userProfiles === 'object' ? parsed.userProfiles : {},
            udaanEnrolments: Array.isArray(parsed.udaanEnrolments) ? parsed.udaanEnrolments : [],
            passportGoals: Array.isArray(parsed.passportGoals) ? parsed.passportGoals : [],
            businessPlans: Array.isArray(parsed.businessPlans) ? parsed.businessPlans : [],
            analytics: {
              ...base.analytics,
              ...(parsed.analytics || {}),
              checklistsCompleted: parsed.analytics?.checklistsCompleted ?? 0,
              fraudChecksCompleted: parsed.analytics?.fraudChecksCompleted ?? 0,
              localHelpClicks: parsed.analytics?.localHelpClicks ?? 0,
              voiceAssistantUses: parsed.analytics?.voiceAssistantUses ?? 0,
              udaanEnrolments: parsed.analytics?.udaanEnrolments ?? 0,
              udaanLessonsCompleted: parsed.analytics?.udaanLessonsCompleted ?? 0,
              udaanAssessmentsTaken: parsed.analytics?.udaanAssessmentsTaken ?? 0,
              businessPlansCreated: parsed.analytics?.businessPlansCreated ?? 0,
              passportGoalsCreated: parsed.analytics?.passportGoalsCreated ?? 0,
            },
          };
          this.persist(hydrated);
          return hydrated;
        }
      }
    } catch (err) {
      console.error('Failed to read store file, initializing fresh store:', err);
    }
    const fresh = createInitialState();
    this.persist(fresh);
    return fresh;
  }

  private persist(nextState: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmp = `${DATA_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(nextState, null, 2), 'utf-8');
      fs.renameSync(tmp, DATA_FILE);
    } catch (err) {
      console.error('Failed to persist database state:', err);
    }
  }

  getState(): DatabaseState {
    return this.state;
  }

  save() {
    this.persist(this.state);
  }

  recordVisit(sessionId?: string) {
    const today = todayKey();
    this.state.analytics.totalVisits += 1;
    if (sessionId && !this.state.analytics.visitorSessionIds.includes(sessionId)) {
      if (this.state.analytics.visitorSessionIds.length < 5000) {
        this.state.analytics.visitorSessionIds.push(sessionId);
      }
    }
    if (!this.state.analytics.dailyEngagement[today]) {
      this.state.analytics.dailyEngagement[today] = { visits: 0, referrals: 0 };
    }
    this.state.analytics.dailyEngagement[today].visits += 1;
    this.save();
  }

  recordEvent(
    eventType:
      | 'job_view'
      | 'job_referral'
      | 'course_view'
      | 'training_referral'
      | 'scheme_referral'
      | 'business_visit'
      | 'workshop_interest'
      | 'checklist_completed'
      | 'fraud_check_completed'
      | 'local_help_click'
      | 'voice_assistant_use'
      | 'udaan_enrol'
      | 'udaan_lesson_complete'
      | 'udaan_quiz_submit'
      | 'business_plan_created'
      | 'passport_goal_created',
    entityId?: string
  ) {
    const today = todayKey();
    if (!this.state.analytics.dailyEngagement[today]) {
      this.state.analytics.dailyEngagement[today] = { visits: 0, referrals: 0 };
    }

    switch (eventType) {
      case 'job_view': {
        this.state.analytics.jobsViewed += 1;
        const j = this.state.jobs.find((x) => x.id === entityId);
        if (j) j.viewsCount += 1;
        break;
      }
      case 'job_referral': {
        this.state.analytics.jobReferrals += 1;
        this.state.analytics.dailyEngagement[today].referrals += 1;
        const j = this.state.jobs.find((x) => x.id === entityId);
        if (j) j.referralsCount += 1;
        break;
      }
      case 'course_view': {
        this.state.analytics.coursesViewed += 1;
        const c = this.state.courses.find((x) => x.id === entityId);
        if (c) c.viewsCount += 1;
        break;
      }
      case 'training_referral': {
        this.state.analytics.trainingReferrals += 1;
        this.state.analytics.dailyEngagement[today].referrals += 1;
        const c = this.state.courses.find((x) => x.id === entityId);
        if (c) c.referralsCount += 1;
        break;
      }
      case 'scheme_referral': {
        this.state.analytics.schemeReferrals += 1;
        this.state.analytics.dailyEngagement[today].referrals += 1;
        const s = this.state.schemes.find((x) => x.id === entityId);
        if (s) s.referralsCount += 1;
        break;
      }
      case 'business_visit': {
        this.state.analytics.businessDirectoryVisits += 1;
        const b = this.state.businesses.find((x) => x.id === entityId);
        if (b) b.visitsCount += 1;
        break;
      }
      case 'workshop_interest': {
        this.state.analytics.workshopInterestCount += 1;
        break;
      }
      case 'checklist_completed': {
        this.state.analytics.checklistsCompleted += 1;
        break;
      }
      case 'fraud_check_completed': {
        this.state.analytics.fraudChecksCompleted += 1;
        break;
      }
      case 'local_help_click': {
        this.state.analytics.localHelpClicks += 1;
        this.state.analytics.dailyEngagement[today].referrals += 1;
        const h = this.state.assistanceCentres.find((x) => x.id === entityId);
        if (h) h.referralsCount += 1;
        break;
      }
      case 'voice_assistant_use': {
        this.state.analytics.voiceAssistantUses += 1;
        break;
      }
      case 'udaan_enrol': {
        this.state.analytics.udaanEnrolments = (this.state.analytics.udaanEnrolments || 0) + 1;
        break;
      }
      case 'udaan_lesson_complete': {
        this.state.analytics.udaanLessonsCompleted = (this.state.analytics.udaanLessonsCompleted || 0) + 1;
        break;
      }
      case 'udaan_quiz_submit': {
        this.state.analytics.udaanAssessmentsTaken = (this.state.analytics.udaanAssessmentsTaken || 0) + 1;
        break;
      }
      case 'business_plan_created': {
        this.state.analytics.businessPlansCreated = (this.state.analytics.businessPlansCreated || 0) + 1;
        break;
      }
      case 'passport_goal_created': {
        this.state.analytics.passportGoalsCreated = (this.state.analytics.passportGoalsCreated || 0) + 1;
        break;
      }
    }
    this.save();
  }

  getAnalyticsSummary(): PlatformAnalytics {
    const s = this.state;
    const verifiedJobs = s.jobs.filter((j) => isPubliclyVerifiedStatus(j.verificationStatus));
    const verifiedCourses = s.courses.filter((c) => isPubliclyVerifiedStatus(c.verificationStatus));
    const verifiedSchemes = s.schemes.filter((sc) => isPubliclyVerifiedStatus(sc.verificationStatus));
    const verifiedBusinesses = s.businesses.filter((b) => isPubliclyVerifiedStatus(b.verificationStatus));
    const verifiedAssistance = s.assistanceCentres.filter((a) =>
      isPubliclyVerifiedStatus(a.verificationStatus)
    );

    const dailyEntries = Object.entries(s.analytics.dailyEngagement)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, val]) => ({ date, visits: val.visits, referrals: val.referrals }));

    return {
      totalVisits: s.analytics.totalVisits,
      uniqueVisitorSessions: Math.max(1, s.analytics.visitorSessionIds.length),
      registeredUsers: s.users.length,
      jobsViewed: s.analytics.jobsViewed,
      jobReferrals: s.analytics.jobReferrals,
      coursesViewed: s.analytics.coursesViewed,
      trainingReferrals: s.analytics.trainingReferrals,
      schemeReferrals: s.analytics.schemeReferrals,
      businessDirectoryVisits: s.analytics.businessDirectoryVisits,
      workshopInterestCount: s.analytics.workshopInterestCount,
      checklistsCompleted: s.analytics.checklistsCompleted,
      fraudChecksCompleted: s.analytics.fraudChecksCompleted,
      localHelpClicks: s.analytics.localHelpClicks,
      voiceAssistantUses: s.analytics.voiceAssistantUses,
      udaanEnrolments: Math.max(s.analytics.udaanEnrolments || 0, s.udaanEnrolments.length),
      udaanLessonsCompleted: s.analytics.udaanLessonsCompleted || 0,
      udaanAssessmentsTaken: s.analytics.udaanAssessmentsTaken || 0,
      businessPlansCreated: Math.max(s.analytics.businessPlansCreated || 0, s.businessPlans.length),
      passportGoalsCreated: Math.max(s.analytics.passportGoalsCreated || 0, s.passportGoals.length),
      updateSubscribersCount: s.updateSubscriptions.filter((u) => u.active).length,
      feedbackCount: s.feedback.length,
      openReportsCount: s.reports.filter((r) => r.status === 'Open').length,
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
}

export const store = new PlatformStore();

