import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { UserAccount, UserRole } from '../src/types/platform.ts';
import { store } from './storage.ts';
import type { StoredUser } from './seed.ts';

const TOKEN_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update('mecheda-disha-local-secret-v1').digest('hex');

interface TokenPayload {
  uid: string;
  role: UserRole;
  exp: number;
}

export function sanitizeUser(u: StoredUser): UserAccount {
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

export function createSessionToken(user: StoredUser): string {
  const payload: TokenPayload = {
    uid: user.id,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as TokenPayload;
    if (!payload.uid || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export interface AuthedRequest extends Request {
  authUser?: StoredUser;
}

export function attachOptionalUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const payload = verifySessionToken(token);
    if (payload) {
      const user = store.getState().users.find((u) => u.id === payload.uid);
      if (user) {
        req.authUser = user;
      }
    }
  }
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  attachOptionalUser(req, res, () => {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    next();
  });
}

const ROLE_WEIGHT: Record<UserRole, number> = {
  user: 0,
  content_reviewer: 1,
  content_admin: 2,
  super_admin: 3,
};

export function requireMinRole(minRole: UserRole) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      if (!req.authUser) return;
      if (ROLE_WEIGHT[req.authUser.role] < ROLE_WEIGHT[minRole]) {
        return res.status(403).json({
          error: 'Forbidden: Your account role does not have permission for this administrative action.',
        });
      }
      next();
    });
  };
}

// Simple in-memory sliding-window rate limiter
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip || 'local'}:${req.path}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment and try again.',
      });
    }
    bucket.count += 1;
    return next();
  };
}

export function cleanText(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}
