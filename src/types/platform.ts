export type Language = 'bn' | 'en' | 'hi';

export type VerificationStatus =
  | 'Pending Verification'
  | 'Verified'
  | 'Officially Verified'
  | 'Independently Verified'
  | 'Community Submitted'
  | 'Needs Review'
  | 'Expired'
  | 'Rejected';

export type EligibilityVerdict =
  | 'Potentially Eligible'
  | 'More Information Required'
  | 'Important Requirements Not Met'
  | 'Confirm With Official Authority';

export type FraudRiskLevel =
  | 'HIGH RISK'
  | 'NEEDS VERIFICATION'
  | 'NO MAJOR RED FLAGS FOUND';

export type AssistanceCentreCategory =
  | 'Bangla Sahayata Kendra'
  | 'Government Office'
  | 'Skill & Training Centre'
  | 'Employment Support'
  | 'Cyber & Legal Safety'
  | 'Community Assistance';

export interface LocalAssistanceCentre extends VerificationMeta {
  id: string;
  name: LocalizedText;
  category: AssistanceCentreCategory;
  description: LocalizedText;
  address: string;
  locationArea: string;
  servicesOffered: string[];
  publicContact: string;
  timingsNote: string;
  needsLocalFieldVerification: boolean;
  officialPortalUrl: string;
  referralsCount: number;
  state?: string;
  district?: string;
  lat?: number;
  lng?: number;
}

export interface FraudAlert {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  scamType:
    | 'OTP / UPI Trap'
    | 'Advance-Fee Job'
    | 'Fake Scheme Link'
    | 'Loan App Trap'
    | 'Remote Access App'
    | 'Impersonation';
  safetyTip: LocalizedText;
  publishedAt: string;
  isActive: boolean;
  createdBy: string;
}

export interface FraudIndicator {
  code: string;
  severity: 'high' | 'medium';
  title: string;
  explanation: string;
}

export interface FraudAnalysisResult {
  riskLevel: FraudRiskLevel;
  headline: string;
  summary: string;
  indicators: FraudIndicator[];
  safeNextSteps: string[];
  whatToAvoid: string[];
  officialReporting: {
    name: string;
    detail: string;
    url?: string;
  }[];
  aiExplanation?: string;
  analysisPipeline: {
    staticEngineUsed: boolean;
    aiStatus: 'completed' | 'unavailable';
    aiLimitationNote?: string;
  };
  disclaimer: string;
}

export interface UpdateSubscription {
  id: string;
  name: string;
  channel: 'web' | 'email' | 'whatsapp_ready';
  contactValue: string;
  topics: string[];
  frequency: 'weekly' | 'urgent_only' | 'monthly';
  consentGiven: boolean;
  consentTimestamp: string;
  active: boolean;
}

export type UserRole =
  | 'user'
  | 'regional_contributor'
  | 'training_manager'
  | 'content_reviewer'
  | 'content_admin'
  | 'super_admin';

export interface LocalizedText {
  bn: string;
  en: string;
  hi: string;
}

export interface VerificationMeta {
  sourceName: string;
  sourceUrl: string;
  verificationStatus: VerificationStatus;
  dateVerified: string;
  lastUpdated: string;
  reviewer: string;
  expiryDate: string;
}

export type JobCategory =
  | 'Local'
  | 'Part-Time'
  | 'Full-Time'
  | 'Work From Home'
  | 'Government Notification'
  | 'Private Sector'
  | 'Internship'
  | 'Daily Wage';

export interface JobListing extends VerificationMeta {
  id: string;
  title: LocalizedText;
  employerName: string;
  description: LocalizedText;
  salaryMin: number;
  salaryMax: number;
  salaryUnit: 'monthly' | 'daily' | 'stipend';
  salaryDisplay: LocalizedText;
  location: string;
  category: JobCategory;
  qualification: string;
  experience: string;
  workingHours: string;
  applicationInstructions: LocalizedText;
  contactInfo: string;
  applicationUrl: string;
  deadline: string;
  isDemo: boolean;
  submittedBy?: string;
  viewsCount: number;
  referralsCount: number;
  state?: string;
  district?: string;
  lat?: number;
  lng?: number;
  isRemote?: boolean;
  skillsRequired?: string[];
}

export type SkillCategory =
  | 'Digital Literacy'
  | 'Computer Education'
  | 'Programming'
  | 'Graphic Design'
  | 'Digital Marketing'
  | 'Video Editing'
  | 'Communication Skills'
  | 'Vocational Training'
  | 'Entrepreneurship'
  | 'Professional Development';

export interface CourseListing extends VerificationMeta {
  id: string;
  name: LocalizedText;
  provider: string;
  category: SkillCategory;
  description: LocalizedText;
  duration: string;
  fees: string;
  isFree: boolean;
  eligibility: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  location: string;
  applicationUrl: string;
  certification: string;
  isDemo: boolean;
  viewsCount: number;
  referralsCount: number;
}

export interface TrainingCentre {
  id: string;
  name: string;
  location: string;
  coursesOffered: string[];
  contact: string;
  website: string;
  isDemo: boolean;
  verificationStatus: VerificationStatus;
}

export type SchemeCategory =
  | 'Education'
  | 'Scholarships'
  | 'Women Empowerment'
  | 'Employment'
  | 'Healthcare'
  | 'Housing'
  | 'Agriculture'
  | 'Social Security'
  | 'Skill Development'
  | 'MSME Support';

export interface SchemeEligibilityProfile {
  genders: ('all' | 'female' | 'male')[];
  minAge?: number;
  maxAge?: number;
  occupations: (
    | 'all'
    | 'student'
    | 'unemployed'
    | 'farmer'
    | 'daily_wage'
    | 'small_business'
    | 'homemaker'
    | 'worker'
  )[];
  lowIncomeFocused: boolean;
  westBengalResidentOnly: boolean;
  applicableStates?: string[];
}

export interface WelfareScheme extends VerificationMeta {
  id: string;
  officialName: LocalizedText;
  department: LocalizedText;
  scope: string;
  applicableState?: string;
  schemeLevel?: 'Central' | 'State' | 'District';
  eligibleGeography?: string;
  targetBeneficiaries?: string[];
  ageCriteria?: string;
  incomeCriteria?: LocalizedText;
  importantDates?: string;
  category: SchemeCategory;
  description: LocalizedText;
  benefits: LocalizedText;
  eligibilityRequirements: LocalizedText;
  requiredDocuments: string[];
  applicationProcess: LocalizedText;
  officialWebsite: string;
  eligibilityProfile: SchemeEligibilityProfile;
  referralsCount: number;
}

export interface BusinessProfile extends VerificationMeta {
  id: string;
  businessName: string;
  category: string;
  location: string;
  description: LocalizedText;
  services: string[];
  contactInfo: string;
  operatingHours: string;
  websiteOrSocial: string;
  isDemo: boolean;
  submittedBy?: string;
  visitsCount: number;
}

export interface BusinessIdea {
  id: string;
  title: LocalizedText;
  category: string;
  isHomeBased: boolean;
  estimatedStartupRange: string;
  skillsNeeded: string[];
  description: LocalizedText;
  localRelevance: LocalizedText;
  firstSteps: string[];
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  town: string;
  preferredLanguage: Language;
  createdAt: string;
}

export interface BookmarkItem {
  id: string;
  userId: string;
  itemType: 'job' | 'course' | 'scheme' | 'business';
  itemId: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  targetDate: string;
  updatedAt: string;
}

export interface ContentReport {
  id: string;
  targetType: 'job' | 'course' | 'scheme' | 'business' | 'assistance' | 'general';
  targetId: string;
  targetTitle: string;
  reportType: 'suspicious' | 'incorrect' | 'expired' | 'other';
  details: string;
  reporterContact?: string;
  status: 'Open' | 'Reviewed' | 'Resolved';
  createdAt: string;
  reviewedBy?: string;
}

export interface FeedbackSubmission {
  id: string;
  type: 'contact' | 'feedback' | 'assistance';
  name: string;
  contact: string;
  subject: string;
  message: string;
  status: 'New' | 'Reviewed' | 'Closed';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
  category: string;
  locationScope: string;
  publishedAt: string;
  isActive: boolean;
  createdBy: string;
}

export interface VerificationLog {
  id: string;
  entityType: 'job' | 'course' | 'scheme' | 'business' | 'assistance';
  entityId: string;
  entityTitle: string;
  previousStatus: VerificationStatus;
  newStatus: VerificationStatus;
  reviewerName: string;
  reviewerRole: UserRole;
  note: string;
  timestamp: string;
}

export interface UserLocationPreference {
  country: string;
  state: string;
  district: string;
  city: string;
  locality: string;
  isGpsDerived?: boolean;
}

export interface UserLivelihoodProfile {
  education: string;
  skills: string[];
  interests: string[];
  careerGoals: string[];
  employmentStatus: string;
  businessInterests: string[];
  preferredOpportunityTypes: string[];
  learningPreference: 'self_paced' | 'guided_practice' | 'voice_assisted';
  location: UserLocationPreference;
  updatedAt: string;
}

export type RadiusMode = '5' | '10' | '25' | '50' | '100' | 'custom' | 'nationwide' | 'remote';

export interface ActiveLocation {
  country?: string;
  state: string;
  district: string;
  cityOrLocality?: string;
  lat?: number;
  lng?: number;
  radiusMode: RadiusMode;
  customRadiusKm?: number;
  isGpsDerived?: boolean;
  source?: 'manual' | 'gps' | string;
}

export interface UserPersonalisationProfile {
  preferredName?: string;
  state?: string;
  district?: string;
  cityOrLocality?: string;
  educationLevel?: string;
  employmentStatus?: string;
  ageGroup?: string;
  gender?: string;
  skills?: string[];
  careerInterests?: string[];
  preferredJobCategory?: string;
  preferredTravelRadiusKm?: number;
  radiusMode?: RadiusMode;
  assistancePreferences?: string[];
}

export type UdaanCategory =
  | 'Interview Preparation'
  | 'Business Plan Executive'
  | 'Personality & Soft Skills'
  | 'Professional Digital'
  | 'MSME & Entrepreneurship'
  | 'Practical Executive';

export interface UdaanLesson {
  id: string;
  durationMinutes: number;
  title: LocalizedText;
  content: LocalizedText;
  keyTakeaways: LocalizedText[];
}

export interface UdaanQuizQuestion {
  id: string;
  question: LocalizedText;
  options: LocalizedText[];
  correctIndex: number;
  explanation: LocalizedText;
}

export interface UdaanAssignment {
  title: LocalizedText;
  prompt: LocalizedText;
  rubricPoints: LocalizedText[];
}

export interface UdaanProgramme {
  id: string;
  slug: string;
  category: UdaanCategory;
  level: 'Beginner' | 'Intermediate';
  estimatedMinutes: number;
  formatNote: LocalizedText;
  title: LocalizedText;
  tagline: LocalizedText;
  summary: LocalizedText;
  targetAudience: string[];
  skillTags: string[];
  relatedRoutes: { path: string; label: LocalizedText }[];
  lessons: UdaanLesson[];
  assignment: UdaanAssignment;
  quiz: UdaanQuizQuestion[];
}

export interface UdaanEnrolment {
  id: string;
  userId: string;
  programmeId: string;
  enrolledAt: string;
  updatedAt: string;
  completedLessonIds: string[];
  quizScore?: number;
  quizTotal?: number;
  quizCompletedAt?: string;
  assignmentResponse?: string;
  assignmentFeedback?: string;
  assignmentUpdatedAt?: string;
}

export type ActionPassportStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Ready for Next Step'
  | 'Action Taken'
  | 'User Reported Completed';

export type ActionPassportCategory =
  | 'skill'
  | 'training'
  | 'business'
  | 'scheme'
  | 'job'
  | 'documents';

export interface ActionPassportStep {
  id: string;
  title: string;
  done: boolean;
  officialUrl?: string;
}

export interface ActionPassportGoal {
  id: string;
  userId: string;
  title: string;
  category: ActionPassportCategory;
  status: ActionPassportStatus;
  linkedPath?: string;
  officialUrl?: string;
  steps: ActionPassportStep[];
  documentsChecklist: { id: string; label: string; ready: boolean }[];
  notes: string;
  reminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessStartupCostItem {
  id: string;
  item: string;
  amount: number;
}

export interface SavedBusinessPlan {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  location: string;
  targetCustomers: string;
  valueProposition: string;
  startupCosts: BusinessStartupCostItem[];
  unitPrice: number;
  unitCost: number;
  expectedMonthlyUnits: number;
  fixedMonthlyCost: number;
  customerResearchChecks: { id: string; label: string; done: boolean }[];
  marketingSteps: string[];
  readinessChecks: { id: string; label: string; done: boolean }[];
  notes: string;
  updatedAt: string;
}

export interface PlatformAnalytics {
  totalVisits: number;
  uniqueVisitorSessions: number;
  registeredUsers: number;
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
  udaanEnrolments?: number;
  udaanLessonsCompleted?: number;
  udaanAssessmentsTaken?: number;
  businessPlansCreated?: number;
  passportGoalsCreated?: number;
  updateSubscribersCount: number;
  feedbackCount: number;
  openReportsCount: number;
  verifiedCounts: {
    jobs: number;
    demoJobs: number;
    courses: number;
    schemes: number;
    businesses: number;
    assistanceCentres: number;
  };
  dailyEngagement: {
    date: string;
    visits: number;
    referrals: number;
  }[];
}


