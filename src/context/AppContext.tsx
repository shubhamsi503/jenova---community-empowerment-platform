import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type {
  ActionPassportCategory,
  ActionPassportGoal,
  ActionPassportStatus,
  BookmarkItem,
  Language,
  SavedBusinessPlan,
  UdaanEnrolment,
  UserAccount,
  UserLivelihoodProfile,
} from '../types/platform';
import { TRANSLATIONS, tr, type UIStrings } from '../i18n/translations';
import {
  apiFetch,
  getStoredToken,
  getVisitorSessionId,
  setStoredToken,
  trackAnalyticsEvent,
} from '../lib/api';
import {
  createDefaultProfile,
  loadLocalProfile,
  saveLocalProfile,
} from '../lib/personalisation';

export interface ReportTarget {
  targetType: 'job' | 'course' | 'scheme' | 'business' | 'assistance' | 'general';
  targetId: string;
  targetTitle: string;
}

const GUEST_UDAAN_KEY = 'jenova_guest_udaan_v1';
const GUEST_PASSPORT_KEY = 'jenova_guest_passport_v1';
const GUEST_BPLANS_KEY = 'jenova_guest_bplans_v1';

function readGuestJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeGuestJson<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
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
  // Personalisation & Location Intelligence
  profile: UserLivelihoodProfile;
  updateProfile: (next: UserLivelihoodProfile) => Promise<void>;
  resetProfile: () => Promise<void>;
  // JENOVA UDAAN Enrolments & Progress
  udaanEnrolments: UdaanEnrolment[];
  enrolUdaan: (programmeId: string) => Promise<UdaanEnrolment>;
  updateUdaanProgress: (
    programmeId: string,
    patch: {
      completedLessonIds?: string[];
      quizScore?: number;
      quizTotal?: number;
      assignmentResponse?: string;
      assignmentFeedback?: string;
    }
  ) => Promise<UdaanEnrolment>;
  // JENOVA Action Passport
  passportGoals: ActionPassportGoal[];
  addPassportGoal: (payload: {
    title: string;
    category: ActionPassportCategory;
    linkedPath?: string;
    officialUrl?: string;
    steps: { id: string; title: string; done: boolean; officialUrl?: string }[];
    documentsChecklist?: { id: string; label: string; ready: boolean }[];
    notes?: string;
    reminderDate?: string;
  }) => Promise<ActionPassportGoal>;
  updatePassportGoal: (
    goalId: string,
    patch: Partial<
      Pick<
        ActionPassportGoal,
        'title' | 'status' | 'steps' | 'documentsChecklist' | 'notes' | 'reminderDate'
      >
    >
  ) => Promise<void>;
  deletePassportGoal: (goalId: string) => Promise<void>;
  // Saved Business Plans
  businessPlans: SavedBusinessPlan[];
  saveBusinessPlan: (
    payload: Omit<SavedBusinessPlan, 'id' | 'userId' | 'updatedAt'>
  ) => Promise<SavedBusinessPlan>;
  deleteBusinessPlan: (planId: string) => Promise<void>;
  // Modals & Toast
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
  const [profile, setProfile] = useState<UserLivelihoodProfile>(() => loadLocalProfile());
  const [udaanEnrolments, setUdaanEnrolments] = useState<UdaanEnrolment[]>(() =>
    readGuestJson<UdaanEnrolment[]>(GUEST_UDAAN_KEY, [])
  );
  const [passportGoals, setPassportGoals] = useState<ActionPassportGoal[]>(() =>
    readGuestJson<ActionPassportGoal[]>(GUEST_PASSPORT_KEY, [])
  );
  const [businessPlans, setBusinessPlans] = useState<SavedBusinessPlan[]>(() =>
    readGuestJson<SavedBusinessPlan[]>(GUEST_BPLANS_KEY, [])
  );
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

  // Hydrate authenticated user, bookmarks, profile, UDAAN enrolments, Action Passport & Business Plans
  useEffect(() => {
    if (!token) {
      setUser(null);
      setBookmarks([]);
      setProfile(loadLocalProfile());
      setUdaanEnrolments(readGuestJson<UdaanEnrolment[]>(GUEST_UDAAN_KEY, []));
      setPassportGoals(readGuestJson<ActionPassportGoal[]>(GUEST_PASSPORT_KEY, []));
      setBusinessPlans(readGuestJson<SavedBusinessPlan[]>(GUEST_BPLANS_KEY, []));
      setAuthLoading(false);
      return;
    }
    let cancelled = false;
    setAuthLoading(true);
    Promise.all([
      apiFetch<{ user: UserAccount }>('/api/auth/me', {}, token),
      apiFetch<{ bookmarks: BookmarkItem[] }>('/api/bookmarks', {}, token),
      apiFetch<{ profile: UserLivelihoodProfile | null }>('/api/profile', {}, token).catch(() => ({
        profile: null,
      })),
      apiFetch<{ enrolments: UdaanEnrolment[] }>('/api/udaan/enrolments', {}, token).catch(() => ({
        enrolments: [],
      })),
      apiFetch<{ goals: ActionPassportGoal[] }>('/api/passport', {}, token).catch(() => ({
        goals: [],
      })),
      apiFetch<{ plans: SavedBusinessPlan[] }>('/api/business-plans', {}, token).catch(() => ({
        plans: [],
      })),
    ])
      .then(([meRes, bmRes, profRes, udRes, passRes, bpRes]) => {
        if (cancelled) return;
        setUser(meRes.user);
        setBookmarks(bmRes.bookmarks || []);
        if (profRes.profile) {
          setProfile(profRes.profile);
          saveLocalProfile(profRes.profile);
        }
        setUdaanEnrolments(udRes.enrolments || []);
        setPassportGoals(passRes.goals || []);
        setBusinessPlans(bpRes.plans || []);
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

  const updateProfile = useCallback(
    async (next: UserLivelihoodProfile) => {
      const stamped: UserLivelihoodProfile = { ...next, updatedAt: new Date().toISOString() };
      setProfile(stamped);
      saveLocalProfile(stamped);
      if (user && token) {
        await apiFetch(
          '/api/profile',
          { method: 'PUT', body: JSON.stringify(stamped) },
          token
        ).catch(() => {});
      }
    },
    [user, token]
  );

  const resetProfile = useCallback(async () => {
    const fresh = createDefaultProfile();
    setProfile(fresh);
    saveLocalProfile(fresh);
    if (user && token) {
      await apiFetch(
        '/api/profile',
        { method: 'PUT', body: JSON.stringify(fresh) },
        token
      ).catch(() => {});
    }
  }, [user, token]);

  const enrolUdaan = useCallback(
    async (programmeId: string): Promise<UdaanEnrolment> => {
      if (user && token) {
        const res = await apiFetch<{ enrolment: UdaanEnrolment }>(
          '/api/udaan/enrol',
          { method: 'POST', body: JSON.stringify({ programmeId }) },
          token
        );
        setUdaanEnrolments((prev) => {
          const exists = prev.some((e) => e.programmeId === programmeId);
          return exists
            ? prev.map((e) => (e.programmeId === programmeId ? res.enrolment : e))
            : [res.enrolment, ...prev];
        });
        return res.enrolment;
      }

      const existing = udaanEnrolments.find((e) => e.programmeId === programmeId);
      if (existing) return existing;
      const now = new Date().toISOString();
      const created: UdaanEnrolment = {
        id: `udn-guest-${Date.now()}`,
        userId: 'guest',
        programmeId,
        enrolledAt: now,
        updatedAt: now,
        completedLessonIds: [],
      };
      const nextList = [created, ...udaanEnrolments];
      setUdaanEnrolments(nextList);
      writeGuestJson(GUEST_UDAAN_KEY, nextList);
      trackAnalyticsEvent('udaan_enrol', programmeId);
      return created;
    },
    [user, token, udaanEnrolments]
  );

  const updateUdaanProgress = useCallback(
    async (
      programmeId: string,
      patch: {
        completedLessonIds?: string[];
        quizScore?: number;
        quizTotal?: number;
        assignmentResponse?: string;
        assignmentFeedback?: string;
      }
    ): Promise<UdaanEnrolment> => {
      if (user && token) {
        const res = await apiFetch<{ enrolment: UdaanEnrolment }>(
          '/api/udaan/progress',
          { method: 'PATCH', body: JSON.stringify({ programmeId, ...patch }) },
          token
        );
        setUdaanEnrolments((prev) => {
          const exists = prev.some((e) => e.programmeId === programmeId);
          return exists
            ? prev.map((e) => (e.programmeId === programmeId ? res.enrolment : e))
            : [res.enrolment, ...prev];
        });
        return res.enrolment;
      }

      const now = new Date().toISOString();
      let updated: UdaanEnrolment | null = null;
      const prevExisting = udaanEnrolments.find((e) => e.programmeId === programmeId);
      const base: UdaanEnrolment = prevExisting || {
        id: `udn-guest-${Date.now()}`,
        userId: 'guest',
        programmeId,
        enrolledAt: now,
        updatedAt: now,
        completedLessonIds: [],
      };
      updated = {
        ...base,
        completedLessonIds: patch.completedLessonIds ?? base.completedLessonIds,
        quizScore: patch.quizScore !== undefined ? patch.quizScore : base.quizScore,
        quizTotal: patch.quizTotal !== undefined ? patch.quizTotal : base.quizTotal,
        quizCompletedAt: patch.quizScore !== undefined ? now : base.quizCompletedAt,
        assignmentResponse:
          patch.assignmentResponse !== undefined ? patch.assignmentResponse : base.assignmentResponse,
        assignmentFeedback:
          patch.assignmentFeedback !== undefined ? patch.assignmentFeedback : base.assignmentFeedback,
        assignmentUpdatedAt:
          patch.assignmentResponse !== undefined ? now : base.assignmentUpdatedAt,
        updatedAt: now,
      };

      const nextList = prevExisting
        ? udaanEnrolments.map((e) => (e.programmeId === programmeId ? updated! : e))
        : [updated, ...udaanEnrolments];
      setUdaanEnrolments(nextList);
      writeGuestJson(GUEST_UDAAN_KEY, nextList);

      if (patch.completedLessonIds && patch.completedLessonIds.length > base.completedLessonIds.length) {
        trackAnalyticsEvent('udaan_lesson_complete', programmeId);
      }
      if (patch.quizScore !== undefined) {
        trackAnalyticsEvent('udaan_quiz_submit', programmeId);
      }
      return updated;
    },
    [user, token, udaanEnrolments]
  );

  const addPassportGoal = useCallback(
    async (payload: {
      title: string;
      category: ActionPassportCategory;
      linkedPath?: string;
      officialUrl?: string;
      steps: { id: string; title: string; done: boolean; officialUrl?: string }[];
      documentsChecklist?: { id: string; label: string; ready: boolean }[];
      notes?: string;
      reminderDate?: string;
    }): Promise<ActionPassportGoal> => {
      if (user && token) {
        const res = await apiFetch<{ goal: ActionPassportGoal }>(
          '/api/passport',
          { method: 'POST', body: JSON.stringify(payload) },
          token
        );
        setPassportGoals((prev) => [res.goal, ...prev]);
        showToast(
          tr(
            language,
            'JENOVA অ্যাকশন পাসপোর্টে যোগ করা হয়েছে!',
            'JENOVA एक्शन पासपोर्ट में जोड़ा गया!',
            'Added to your JENOVA Action Passport!'
          )
        );
        return res.goal;
      }

      const now = new Date().toISOString();
      const created: ActionPassportGoal = {
        id: `pass-guest-${Date.now()}`,
        userId: 'guest',
        title: payload.title,
        category: payload.category,
        status: 'Not Started' as ActionPassportStatus,
        linkedPath: payload.linkedPath || '',
        officialUrl: payload.officialUrl || '',
        steps: payload.steps,
        documentsChecklist: payload.documentsChecklist || [],
        notes: payload.notes || '',
        reminderDate: payload.reminderDate || '',
        createdAt: now,
        updatedAt: now,
      };
      const nextList = [created, ...passportGoals];
      setPassportGoals(nextList);
      writeGuestJson(GUEST_PASSPORT_KEY, nextList);
      trackAnalyticsEvent('passport_goal_created', created.id);
      showToast(
        tr(
          language,
          'JENOVA অ্যাকশন পাসপোর্টে সেভ হয়েছে!',
          'JENOVA एक्शन पासपोर्ट में सहेजा गया!',
          'Saved to your JENOVA Action Passport!'
        )
      );
      return created;
    },
    [user, token, passportGoals, language, showToast]
  );

  const updatePassportGoal = useCallback(
    async (
      goalId: string,
      patch: Partial<
        Pick<
          ActionPassportGoal,
          'title' | 'status' | 'steps' | 'documentsChecklist' | 'notes' | 'reminderDate'
        >
      >
    ) => {
      if (user && token) {
        const res = await apiFetch<{ goal: ActionPassportGoal }>(
          `/api/passport/${goalId}`,
          { method: 'PATCH', body: JSON.stringify(patch) },
          token
        );
        setPassportGoals((prev) => prev.map((g) => (g.id === goalId ? res.goal : g)));
        return;
      }
      const nextList = passportGoals.map((g) =>
        g.id === goalId ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g
      );
      setPassportGoals(nextList);
      writeGuestJson(GUEST_PASSPORT_KEY, nextList);
    },
    [user, token, passportGoals]
  );

  const deletePassportGoal = useCallback(
    async (goalId: string) => {
      if (user && token) {
        await apiFetch(`/api/passport/${goalId}`, { method: 'DELETE' }, token);
        setPassportGoals((prev) => prev.filter((g) => g.id !== goalId));
        return;
      }
      const nextList = passportGoals.filter((g) => g.id !== goalId);
      setPassportGoals(nextList);
      writeGuestJson(GUEST_PASSPORT_KEY, nextList);
    },
    [user, token, passportGoals]
  );

  const saveBusinessPlan = useCallback(
    async (
      payload: Omit<SavedBusinessPlan, 'id' | 'userId' | 'updatedAt'>
    ): Promise<SavedBusinessPlan> => {
      if (user && token) {
        const res = await apiFetch<{ plan: SavedBusinessPlan }>(
          '/api/business-plans',
          { method: 'POST', body: JSON.stringify(payload) },
          token
        );
        setBusinessPlans((prev) => [res.plan, ...prev]);
        return res.plan;
      }
      const created: SavedBusinessPlan = {
        ...payload,
        id: `bplan-guest-${Date.now()}`,
        userId: 'guest',
        updatedAt: new Date().toISOString(),
      };
      const nextList = [created, ...businessPlans];
      setBusinessPlans(nextList);
      writeGuestJson(GUEST_BPLANS_KEY, nextList);
      trackAnalyticsEvent('business_plan_created', created.id);
      return created;
    },
    [user, token, businessPlans]
  );

  const deleteBusinessPlan = useCallback(
    async (planId: string) => {
      if (user && token) {
        await apiFetch(`/api/business-plans/${planId}`, { method: 'DELETE' }, token);
        setBusinessPlans((prev) => prev.filter((p) => p.id !== planId));
        return;
      }
      const nextList = businessPlans.filter((p) => p.id !== planId);
      setBusinessPlans(nextList);
      writeGuestJson(GUEST_BPLANS_KEY, nextList);
    },
    [user, token, businessPlans]
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
        profile,
        updateProfile,
        resetProfile,
        udaanEnrolments,
        enrolUdaan,
        updateUdaanProgress,
        passportGoals,
        addPassportGoal,
        updatePassportGoal,
        deletePassportGoal,
        businessPlans,
        saveBusinessPlan,
        deleteBusinessPlan,
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

