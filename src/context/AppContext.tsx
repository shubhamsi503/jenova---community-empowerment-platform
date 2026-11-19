import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { BookmarkItem, Language, UserAccount } from '../types/platform';
import { TRANSLATIONS, type UIStrings } from '../i18n/translations';
import { apiFetch, getStoredToken, getVisitorSessionId, setStoredToken } from '../lib/api';

export interface ReportTarget {
  targetType: 'job' | 'course' | 'scheme' | 'business' | 'assistance' | 'general';
  targetId: string;
  targetTitle: string;
}

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  t: UIStrings;
  route: string;
  navigate: (to: string) => void;
  user: UserAccount | null;
  token: string | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<UserAccount>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    town: string;
    preferredLanguage: Language;
  }) => Promise<UserAccount>;
  logout: () => void;
  bookmarks: BookmarkItem[];
  isBookmarked: (itemType: BookmarkItem['itemType'], itemId: string) => boolean;
  toggleBookmark: (itemType: BookmarkItem['itemType'], itemId: string) => Promise<boolean>;
  reportTarget: ReportTarget | null;
  openReportModal: (target: ReportTarget) => void;
  closeReportModal: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('jenova_lang');
      if (saved === 'en' || saved === 'hi' || saved === 'bn') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('jenova_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore
    }
    return 'light';
  });

  const [route, setRoute] = useState<string>(() => window.location.pathname || '/');
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(Boolean(getStoredToken()));
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('jenova_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('jenova_lang', lang);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', to);
    setRoute(to);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Record real visit once per browser session
  useEffect(() => {
    const sessionId = getVisitorSessionId();
    apiFetch('/api/analytics/visit', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
  }, []);

  // Hydrate authenticated user & bookmarks
  useEffect(() => {
    if (!token) {
      setUser(null);
      setBookmarks([]);
      setAuthLoading(false);
      return;
    }
    let cancelled = false;
    setAuthLoading(true);
    Promise.all([
      apiFetch<{ user: UserAccount }>('/api/auth/me', {}, token),
      apiFetch<{ bookmarks: BookmarkItem[] }>('/api/bookmarks', {}, token),
    ])
      .then(([meRes, bmRes]) => {
        if (cancelled) return;
        setUser(meRes.user);
        setBookmarks(bmRes.bookmarks || []);
      })
      .catch(() => {
        if (cancelled) return;
        setStoredToken(null);
        setToken(null);
        setUser(null);
        setBookmarks([]);
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: UserAccount }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      town: string;
      preferredLanguage: Language;
    }) => {
      const res = await apiFetch<{ token: string; user: UserAccount }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
    setBookmarks([]);
    showToast(TRANSLATIONS[language].nav.logout);
  }, [language, showToast]);

  const isBookmarked = useCallback(
    (itemType: BookmarkItem['itemType'], itemId: string) => {
      return bookmarks.some((b) => b.itemType === itemType && b.itemId === itemId);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (itemType: BookmarkItem['itemType'], itemId: string) => {
      if (!user || !token) {
        showToast(TRANSLATIONS[language].common.loginToSave);
        navigate('/auth');
        return false;
      }
      const res = await apiFetch<{ bookmarked: boolean }>(
        '/api/bookmarks/toggle',
        {
          method: 'POST',
          body: JSON.stringify({ itemType, itemId }),
        },
        token
      );
      if (res.bookmarked) {
        setBookmarks((prev) => [
          {
            id: `bm-local-${Date.now()}`,
            userId: user.id,
            itemType,
            itemId,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        showToast(TRANSLATIONS[language].common.bookmarked);
      } else {
        setBookmarks((prev) =>
          prev.filter((b) => !(b.itemType === itemType && b.itemId === itemId))
        );
      }
      return res.bookmarked;
    },
    [user, token, language, navigate, showToast]
  );

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        t: TRANSLATIONS[language],
        route,
        navigate,
        user,
        token,
        authLoading,
        login,
        register,
        logout,
        bookmarks,
        isBookmarked,
        toggleBookmark,
        reportTarget,
        openReportModal: setReportTarget,
        closeReportModal: () => setReportTarget(null),
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
