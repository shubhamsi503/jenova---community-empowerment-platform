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

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
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
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    const raw = localStorage.getItem(`jenova_cache_v2_${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeOfflineCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`jenova_cache_v2_${key}`, JSON.stringify(value));
  } catch {
    // Ignore quota or private-mode errors
  }
}

