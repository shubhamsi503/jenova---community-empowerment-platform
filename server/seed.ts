import crypto from 'crypto';
import type { UserRole } from '../src/types/platform.ts';

export {
  SEED_ANNOUNCEMENTS,
  SEED_ASSISTANCE_CENTRES,
  SEED_BUSINESS_IDEAS,
  SEED_BUSINESSES,
  SEED_COURSES,
  SEED_FRAUD_ALERTS,
  SEED_JOBS,
  SEED_SCHEMES,
  SEED_TRAINING_CENTRES,
} from '../src/data/platformCatalog.ts';

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
    town: string
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
    };
  };

  return [
    makeUser('usr-super-1', 'superadmin@jenova.in', 'Super Admin (JENOVA Core Lead)', 'Admin@Jenova2026', 'super_admin', 'Kolkata, West Bengal'),
    makeUser('usr-content-1', 'editor@jenova.in', 'Content Admin (Community Editor)', 'Editor@Jenova2026', 'content_admin', 'New Delhi, India'),
    makeUser('usr-review-1', 'reviewer@jenova.in', 'Content Reviewer (Verification Desk)', 'Review@Jenova2026', 'content_reviewer', 'Bengaluru, Karnataka'),
    makeUser('usr-member-1', 'member@jenova.in', 'Ananya Sen (Community Member)', 'Member@2026', 'user', 'Kolkata, West Bengal'),
  ];
}
