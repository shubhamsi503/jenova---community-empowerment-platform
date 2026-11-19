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
}

export interface WelfareScheme extends VerificationMeta {
  id: string;
  officialName: LocalizedText;
  department: LocalizedText;
  scope: 'West Bengal' | 'Central India';
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

