import { handleLocalApiRequest } from './localApiFallback';

const TOKEN_STORAGE_KEY = 'jenova_session_v2';
const VISITOR_KEY = 'jenova_visitor_v2';

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in private browsing
  }
}

export function getVisitorSessionId(): string {
  try {
    let id = sessionStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = `v-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'v-anon';
  }
}

function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get('content-type') || '';
  return ct.toLowerCase().includes('application/json');
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const activeToken = token !== undefined ? token : getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (activeToken) {
    headers.Authorization = `Bearer ${activeToken}`;
  }

  // If the current session was created in local-fallback mode, stay consistent with local store
  if (activeToken && activeToken.startsWith('jenova-local.') && url.startsWith('/api/')) {
    return handleLocalApiRequest<T>(url, options, activeToken);
  }

  try {
    const res = await fetch(url, { ...options, headers });

    // Static deployments often return 200 OK text/html (index.html) or 404/405/502/503 for /api/*
    const hasJson = isJsonResponse(res);
    if (!hasJson || res.status === 502 || res.status === 503 || res.status === 504) {
      if (url.startsWith('/api/')) {
        return handleLocalApiRequest<T>(url, options, activeToken);
      }
      throw new Error(`Unexpected response (${res.status})`);
    }

    const data = await res.json();
    if (!res.ok) {
      // Static hosts may also return JSON 404 for unknown API paths — fallback only on generic gateway/route miss
      if (res.status === 404 && !data?.error && url.startsWith('/api/')) {
        return handleLocalApiRequest<T>(url, options, activeToken);
      }
      throw new Error(data?.error || `Request failed (${res.status})`);
    }
    return data as T;
  } catch (err) {
    // Network offline / CORS / connection refused -> seamlessly use built-in persistent local database
    if (err instanceof TypeError && url.startsWith('/api/')) {
      return handleLocalApiRequest<T>(url, options, activeToken);
    }
    throw err;
  }
}

export function trackAnalyticsEvent(
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
    | 'voice_assistant_use',
  entityId?: string
) {
  apiFetch('/api/analytics/event', {
    method: 'POST',
    body: JSON.stringify({ eventType, entityId }),
  }).catch(() => {});
}

export function buildWhatsAppShareUrl(title: string, details: string, pathSuffix: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrl = `${origin}${pathSuffix}`;
  const text = `${title}\n${details}\n\n${fullUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Non-sensitive offline cache (never store Aadhaar, OTPs, PINs, or tokens here)
export function readOfflineCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`jenova_cache_v3_${key}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    // Never hydrate an empty array from stale cache over a non-empty fallback
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function writeOfflineCache<T>(key: string, value: T): void {
  try {
    if (Array.isArray(value) && value.length === 0) return;
    localStorage.setItem(`jenova_cache_v3_${key}`, JSON.stringify(value));
  } catch {
    // Ignore quota or private-mode errors
  }
}
