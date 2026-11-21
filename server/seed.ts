import crypto from 'crypto';
import type { UserPersonalisationProfile, UserRole } from '../src/types/platform.ts';
import {
  SEED_ANNOUNCEMENTS,
  SEED_ASSISTANCE_CENTRES as BASE_ASSISTANCE_CENTRES,
  SEED_BUSINESS_IDEAS,
  SEED_BUSINESSES,
  SEED_COURSES,
  SEED_FRAUD_ALERTS,
  SEED_JOBS as BASE_JOBS,
  SEED_SCHEMES as BASE_SCHEMES,
  SEED_TRAINING_CENTRES,
} from '../src/data/platformCatalog.ts';
import {
  MULTI_STATE_ASSISTANCE_CENTRES,
  MULTI_STATE_JOBS,
  MULTI_STATE_SCHEMES,
} from '../src/data/multiStateCatalog.ts';

export {
  SEED_ANNOUNCEMENTS,
  SEED_BUSINESS_IDEAS,
  SEED_BUSINESSES,
  SEED_COURSES,
  SEED_FRAUD_ALERTS,
  SEED_TRAINING_CENTRES,
};

export const SEED_JOBS = [...BASE_JOBS, ...MULTI_STATE_JOBS];
export const SEED_SCHEMES = [...BASE_SCHEMES, ...MULTI_STATE_SCHEMES];
export const SEED_ASSISTANCE_CENTRES = [
  ...BASE_ASSISTANCE_CENTRES,
  ...MULTI_STATE_ASSISTANCE_CENTRES,
];

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  town: string;
  preferredLanguage: 'bn' | 'en' | 'hi';
  createdAt: string;
  profile?: UserPersonalisationProfile;
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return { hash, salt: usedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(hash, 'hex'));
}

export function createSeedUsers(): StoredUser[] {
  const now = new Date().toISOString();
  const makeUser = (
    id: string,
    email: string,
    name: string,
    password: string,
    role: UserRole,
    town: string,
    profile?: UserPersonalisationProfile
  ): StoredUser => {
    const { hash, salt } = hashPassword(password);
    return {
      id,
      email,
      name,
      passwordHash: hash,
      salt,
      role,
      town,
      preferredLanguage: 'bn',
      createdAt: now,
      profile,
    };
  };

  return [
    makeUser(
      'usr-super-1',
      'superadmin@jenova.in',
      'Super Admin (JENOVA Core Lead)',
      'Admin@Jenova2026',
      'super_admin',
      'Kolkata, West Bengal',
      {
        state: 'West Bengal',
        district: 'Kolkata',
        cityOrLocality: 'Salt Lake',
        radiusMode: '50',
        preferredTravelRadiusKm: 50,
      }
    ),
    makeUser(
      'usr-content-1',
      'editor@jenova.in',
      'Content Admin (Community Editor)',
      'Editor@Jenova2026',
      'content_admin',
      'New Delhi, Delhi',
      {
        state: 'Delhi',
        district: 'New Delhi',
        cityOrLocality: 'Connaught Place',
        radiusMode: 'nationwide',
      }
    ),
    makeUser(
      'usr-review-1',
      'reviewer@jenova.in',
      'Content Reviewer (Verification Desk)',
      'Review@Jenova2026',
      'content_reviewer',
      'Bengaluru, Karnataka',
      {
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        cityOrLocality: 'Bengaluru Central',
        radiusMode: '25',
      }
    ),
    makeUser(
      'usr-contrib-1',
      'contributor@jenova.in',
      'Regional Contributor (Local Network)',
      'Contrib@Jenova2026',
      'regional_contributor',
      'Pune, Maharashtra',
      {
        state: 'Maharashtra',
        district: 'Pune',
        cityOrLocality: 'Pune City',
        radiusMode: '25',
      }
    ),
    makeUser(
      'usr-member-1',
      'member@jenova.in',
      'Ananya Sen (Community Member)',
      'Member@2026',
      'user',
      'Kolkata, West Bengal',
      {
        preferredName: 'Ananya',
        state: 'West Bengal',
        district: 'Kolkata',
        cityOrLocality: 'Jadavpur',
        educationLevel: 'Graduate',
        employmentStatus: 'unemployed',
        ageGroup: '18-25',
        gender: 'female',
        skills: ['MS Excel', 'Customer Handling', 'Typing'],
        careerInterests: ['Office Assistant', 'Digital Marketing'],
        preferredJobCategory: 'Local',
        preferredTravelRadiusKm: 25,
        radiusMode: '25',
        assistancePreferences: ['Government Schemes', 'Jobs', 'Free Skills'],
      }
    ),
  ];
}
