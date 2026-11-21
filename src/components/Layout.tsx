import React, { useState } from 'react';
import {
  Bot,
  ChevronDown,
  FileText,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  User,
  X,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { tr } from '../i18n/translations';
import type { Language } from '../types/platform';
import { apiFetch } from '../lib/api';
import { OfflineIndicator, PWAInstallButton } from './PWAControls';
import { JenovaLogo } from './JenovaLogo';
import {
  Checklist3DIcon,
  LocalPin3DIcon,
  Schemes3DIcon,
  Shield3DIcon,
  Voice3DIcon,
} from './JenovaIcons3D';

function ReportModal() {
  const { reportTarget, closeReportModal, showToast, t, language, route } = useApp();
  const isHome = route === '/' || route === '';
  const [reportType, setReportType] = useState<'suspicious' | 'incorrect' | 'expired' | 'other'>(
    'incorrect'
  );
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!reportTarget) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (details.trim().length < 5) {
      setError(
        tr(
          language,
          'অনুগ্রহ করে সমস্যাটি সংক্ষেপে লিখুন (কমপক্ষে ৫ অক্ষর)।',
          'कृपया समस्या का संक्षिप्त विवरण लिखें (कम से कम 5 अक्षर)।',
          'Please describe the issue briefly (at least 5 characters).'
        )
      );
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          targetType: reportTarget.targetType,
          targetId: reportTarget.targetId,
          targetTitle: reportTarget.targetTitle,
          reportType,
          details,
          reporterContact: contact,
        }),
      });
      showToast(
        tr(
          language,
          'যাচাইকরণ ডেস্কে রিপোর্ট জমা হয়েছে। কমিউনিটিকে নিরাপদ রাখতে সাহায্য করার জন্য ধন্যবাদ।',
          'सत्यापन डेस्क पर रिपोर्ट जमा हो गई है। समुदाय को सुरक्षित रखने में मदद के लिए धन्यवाद।',
          'Report submitted to the Verification Desk. Thank you for helping keep the community safe.'
        )
      );
      setDetails('');
      setContact('');
      closeReportModal();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : tr(language, 'রিপোর্ট জমা দেওয়া ব্যর্থ হয়েছে।', 'रिपोर्ट जमा करना विफल रहा।', 'Failed to submit report.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#041227]/65 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div
        className={`rounded-2xl border w-full max-w-lg p-6 shadow-2xl ${
          isHome
            ? 'bg-white dark:bg-[#0B2242] border-[#D6E6F5] dark:border-white/15 text-[#092B55] dark:text-white'
            : 'bg-white dark:bg-[#241B13] border-[#F2DCC1] dark:border-[#3F2E1E] text-[#26364B] dark:text-[#FFF5E8]'
        }`}
      >
        <div
          className={`flex items-start justify-between gap-4 pb-4 border-b ${
            isHome
              ? 'border-[#D6E6F5] dark:border-white/15'
              : 'border-[#F2DCC1] dark:border-[#3F2E1E]'
          }`}
        >
          <div>
            <h2 id="report-modal-title" className="text-lg font-bold">
              {t.common.reportIssue}
            </h2>
            <p
              className={`text-xs mt-1 ${
                isHome
                  ? 'text-[#46607E] dark:text-[#B9D8F7]'
                  : 'text-[#665B4F] dark:text-[#B6A695]'
              }`}
            >
              {reportTarget.targetTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={closeReportModal}
            className={`p-1.5 rounded-lg cursor-pointer ${
              isHome
                ? 'text-[#46607E] dark:text-[#B9D8F7] hover:text-[#092B55] dark:hover:text-white'
                : 'text-[#665B4F] dark:text-[#B6A695] hover:text-[#26364B] dark:hover:text-white'
            }`}
            aria-label={tr(language, 'বন্ধ করুন', 'बंद करें', 'Close modal')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              {tr(language, 'সমস্যার ধরন', 'समस्या की श्रेणी', 'Issue Category')}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as typeof reportType)}
              className="w-full rounded-lg border border-[#D6E6F5] dark:border-white/15 bg-white dark:bg-[#071A34] px-3 py-2.5 text-sm"
            >
              <option value="suspicious">
                {tr(
                  language,
                  'সন্দেহজনক / সম্ভাব্য প্রতারণা বা ফি দাবি',
                  'संदिग्ध / संभावित धोखाधड़ी या शुल्क की मांग',
                  'Suspicious / Potential Scam or Fee Demand'
                )}
              </option>
              <option value="incorrect">
                {tr(
                  language,
                  'ভুল তথ্য বা অকার্যকর অফিসিয়াল লিঙ্ক',
                  'गलत जानकारी या टूटा हुआ आधिकारिक लिंक',
                  'Incorrect Information or Broken Official Link'
                )}
              </option>
              <option value="expired">
                {tr(
                  language,
                  'মেয়াদোত্তীর্ণ তারিখ বা বন্ধ হয়ে যাওয়া সুযোগ',
                  'समाप्त अंतिम तिथि या बंद अवसर',
                  'Expired Deadline or Closed Opportunity'
                )}
              </option>
              <option value="other">
                {tr(language, 'অন্যান্য সমস্যা', 'अन्य समस्या', 'Other Concern')}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              {tr(language, 'বিস্তারিত *', 'विवरण *', 'Details *')}
            </label>
            <textarea
              required
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={tr(
                language,
                'কী ভুল, মেয়াদোত্তীর্ণ বা সন্দেহজনক মনে হয়েছে তা ব্যাখ্যা করুন...',
                'बताएं कि क्या गलत, पुराना या संदिग्ध लगा...',
                'Explain what looks incorrect, expired, or suspicious...'
              )}
              className="w-full rounded-lg border border-[#D6E6F5] dark:border-white/15 bg-white dark:bg-[#071A34] px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              {tr(
                language,
                'ঐচ্ছিক যোগাযোগ (ইমেইল বা ফোন — কখনোই OTP/PIN লিখবেন না)',
                'वैकल्पिक संपर्क (ईमेल या फोन — कभी OTP/PIN न लिखें)',
                'Optional Contact (Email or Phone — never enter OTP/PIN)'
              )}
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={tr(language, 'ঐচ্ছিক', 'वैकल्पिक', 'Optional')}
              className="w-full rounded-lg border border-[#D6E6F5] dark:border-white/15 bg-white dark:bg-[#071A34] px-3 py-2.5 text-sm"
            />
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeReportModal}
              className={`px-4 py-2 text-xs font-medium cursor-pointer ${
                isHome
                  ? 'text-[#46607E] dark:text-[#B9D8F7] hover:text-[#092B55] dark:hover:text-white'
                  : 'text-[#665B4F] dark:text-[#B6A695] hover:text-[#26364B] dark:hover:text-white'
              }`}
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-xs font-semibold rounded-lg disabled:opacity-60 cursor-pointer ${
                isHome
                  ? 'text-white bg-[#138A45] hover:bg-[#0D6B34]'
                  : 'jenova-saffron-btn'
              }`}
            >
              {submitting ? t.common.loading : t.common.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    t,
    route,
    navigate,
    user,
    logout,
    toastMessage,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isAdmin = user && user.role !== 'user';
  const isHome = route === '/' || route === '';

  const serviceLinks: Array<{
    path: string;
    label: string;
    sub: string;
    icon?: React.ReactNode;
  }> = [
    {
      path: '/scam-check',
      label: 'JENOVA Protect',
      sub:
        language === 'bn'
          ? 'প্রতারণা ও ভুয়া অফার যাচাই'
          : language === 'hi'
            ? 'धोखाधड़ी और संदिग्ध ऑफर जांच'
            : 'Fraud & scam detection',
      icon: <Shield3DIcon size={28} />,
    },
    {
      path: '/schemes',
      label: 'JENOVA Schemes',
      sub:
        language === 'bn'
          ? 'সরকারি কল্যাণমূলক প্রকল্প নির্দেশিকা'
          : language === 'hi'
            ? 'सरकारी कल्याणकारी योजना निर्देशिका'
            : 'Government welfare directory',
      icon: <Schemes3DIcon size={28} />,
    },
    {
      path: '/checklist',
      label: 'JENOVA Checklist',
      sub:
        language === 'bn'
          ? 'অফলাইন কাগজপত্র প্রস্তুতি যাচাই'
          : language === 'hi'
            ? 'ऑफ़लाइन दस्तावेज़ तैयारी सूची'
            : 'Offline document folder check',
      icon: <Checklist3DIcon size={28} />,
    },
    {
      path: '/assistant',
      label: 'JENOVA Voice',
      sub:
        language === 'bn'
          ? 'বাংলা-বান্ধব AI ভয়েস সহায়ক'
          : language === 'hi'
            ? 'सरल भाषा में AI वॉइस सहायक'
            : 'Bengali-first AI voice guide',
      icon: <Voice3DIcon size={28} />,
    },
    {
      path: '/local-help',
      label: 'JENOVA Local',
      sub:
        language === 'bn'
          ? 'যাচাইকৃত BSK ও BDO সহায়তা কেন্দ্র'
          : language === 'hi'
            ? 'सत्यापित BSK और BDO सहायता केंद्र'
            : 'Verified BSK & BDO directory',
      icon: <LocalPin3DIcon size={28} />,
    },
    {
      path: '/udaan',
      label: 'JENOVA UDAAN',
      sub:
        language === 'bn'
          ? 'প্রশিক্ষণ, অনুশীলন ও পেশাদার বিকাশ'
          : language === 'hi'
            ? 'प्रशिक्षण, अभ्यास और पेशेवर विकास'
            : 'Training, practice & career growth',
    },
    {
      path: '/passport',
      label: 'Action Passport',
      sub:
        language === 'bn'
          ? 'ধাপে ধাপে লক্ষ্য ও অগ্রগতি ট্র্যাকার'
          : language === 'hi'
            ? 'चरणबद्ध लक्ष्य और प्रगति ट्रैकर'
            : 'Step-by-step goal & action tracker',
    },
    {
      path: '/jobs',
      label: t.nav.jobs,
      sub:
        language === 'bn'
          ? 'চাকরি ও ১-মিনিট বায়োডাটা'
          : language === 'hi'
            ? 'रोजगार और 1-मिनट बायोडाटा'
            : 'Employment & 1-min Biodata',
    },
    {
      path: '/skills',
      label: t.nav.skills,
      sub:
        language === 'bn'
          ? 'বিনামূল্যে বৃত্তিমূলক প্রশিক্ষণ'
          : language === 'hi'
            ? 'निःशुल्क कौशल प्रशिक्षण कोर्स'
            : 'Free vocational courses',
    },
    {
      path: '/finance',
      label: t.nav.finance,
      sub:
        language === 'bn'
          ? 'বাজেট, সঞ্চয় ও EMI ক্যালকুলেটর'
          : language === 'hi'
            ? 'बजट, बचत और EMI कैलकुलेटर'
            : 'Budget, Savings & EMI tools',
    },
    {
      path: '/msme',
      label: t.nav.msme,
      sub:
        language === 'bn'
          ? 'উদ্যম ও ক্ষুদ্র ব্যবসা সহায়তা'
          : language === 'hi'
            ? 'उद्यम और लघु व्यवसाय सहायता'
            : 'Udyam & small business hub',
    },
    {
      path: '/updates',
      label: t.nav.updates,
      sub:
        language === 'bn'
          ? 'কমিউনিটি সতর্কতা ও রিমাইন্ডার'
          : language === 'hi'
            ? 'सामुदायिक अलर्ट और रिमाइंडर'
            : 'Community alerts & reminders',
    },
  ];

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
    setAccountMenuOpen(false);
    navigate(path);
  };

  const handleFaqsNav = () => {
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
    setAccountMenuOpen(false);
    if (route === '/') {
      document.getElementById('jenova-faqs')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById('jenova-faqs')?.scrollIntoView({ behavior: 'smooth' });
      }, 180);
    }
  };

  const isServiceRoute = ['/scam-check', '/schemes', '/checklist', '/udaan', '/passport', '/jobs', '/skills', '/finance', '/msme', '/updates'].some(
    (p) => route === p || route.startsWith(`${p}/`)
  );

  return (
    <div
      data-jenova-theme={isHome ? 'home' : 'saffron'}
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isHome
          ? 'bg-[#F3F8FD] dark:bg-[#06152B] text-[#092B55] dark:text-[#EFF7FF]'
          : 'jenova-saffron-theme bg-[#FFF9F0] dark:bg-[#18120C] text-[#454545] dark:text-[#DDD2C5]'
      }`}
    >
      {/* Floating Glassmorphism Top Navigation Bar (Homepage locked; Light Saffron-Cream on subpages) */}
      <header
        className={`sticky top-0 z-40 transition-colors duration-200 ${
          isHome
            ? 'bg-gradient-to-r from-[#EFF6FF]/82 via-[#52A9F2]/75 to-[#1E82E0]/82 dark:from-[#041227]/95 dark:via-[#071D3C]/90 dark:to-[#041227]/95 backdrop-blur-md'
            : 'bg-[#FFF9F0]/95 dark:bg-[#1E160F]/95 border-b border-[#F2DCC1] dark:border-[#3F2E1E] backdrop-blur-md shadow-[0_2px_14px_-8px_rgba(186,112,32,0.18)]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: JENOVA Logo + Tagline */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="inline-flex items-center min-w-0 shrink cursor-pointer focus:outline-none"
            aria-label="JENOVA Home"
          >
            <JenovaLogo
              variant={theme === 'dark' ? 'dark' : 'light'}
              size="sm"
              showTagline
              tagline={
                language === 'bn'
                  ? 'নতুন সম্ভাবনা, সবার জন্য।'
                  : language === 'hi'
                    ? 'एक साथ बढ़ने का नया तरीका।'
                    : 'A New Way to Grow Together.'
              }
            />
          </button>

          {/* Center: Floating Rounded Glass Navigation Pill (Homepage locked; Warm Saffron-Cream on subpages) */}
          <nav
            aria-label="Primary Navigation"
            className={`hidden lg:flex items-center gap-0.5 xl:gap-1 px-1.5 xl:px-2 py-1.5 rounded-full shrink-0 ${
              isHome
                ? 'bg-white/50 dark:bg-[#0B2242]/80 border border-white/80 dark:border-[#36E7F2]/40 shadow-[0_8px_28px_-8px_rgba(9,43,85,0.25),0_0_18px_rgba(120,240,255,0.35)]'
                : 'bg-white/92 dark:bg-[#241B13]/92 border border-[#F2DCC1] dark:border-[#4A3522] shadow-[0_8px_24px_-10px_rgba(244,163,64,0.26)]'
            }`}
            style={{ backdropFilter: 'blur(16px)' }}
          >
            {/* Home */}
            <button
              type="button"
              onClick={() => handleNav('/')}
              className={`inline-flex items-center gap-1.5 px-3 xl:px-4 py-1.5 rounded-full text-[11.5px] xl:text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isHome
                  ? 'bg-gradient-to-r from-[#073B35] via-[#0B5443] to-[#117148] text-white shadow-[0_0_16px_rgba(54,231,242,0.55)] border border-[#5EF2FC]/70'
                  : 'text-[#26364B] dark:text-[#F5EFE6] hover:bg-[#FFE5C2]/70 dark:hover:bg-[#382616]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.nav.home}</span>
            </button>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setServicesMenuOpen((v) => !v);
                  setAccountMenuOpen(false);
                }}
                aria-expanded={servicesMenuOpen}
                className={`inline-flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11.5px] xl:text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isServiceRoute
                    ? isHome
                      ? 'bg-gradient-to-r from-[#09403A] to-[#138A45] text-white shadow-[0_0_12px_rgba(54,231,242,0.4)]'
                      : 'jenova-saffron-btn font-bold'
                    : isHome
                      ? 'text-[#092B55] dark:text-[#DCEEFF] hover:bg-white/60 dark:hover:bg-white/10'
                      : 'text-[#26364B] dark:text-[#F5EFE6] hover:bg-[#FFE5C2]/70 dark:hover:bg-[#382616]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পরিষেবা' : language === 'hi' ? 'सेवाएं' : 'Services'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${servicesMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {servicesMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setServicesMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className={`absolute left-0 mt-3 w-[330px] sm:w-[365px] rounded-2xl border shadow-2xl p-2.5 z-40 grid grid-cols-1 gap-0.5 max-h-[75vh] overflow-y-auto ${
                      isHome
                        ? 'bg-white/97 dark:bg-[#0A2040]/98 border-[#36E7F2]/45'
                        : 'bg-white dark:bg-[#241B13] border-[#F2DCC1] dark:border-[#4A3522]'
                    }`}
                  >
                    {serviceLinks.map((svc) => (
                      <button
                        key={svc.path}
                        type="button"
                        onClick={() => handleNav(svc.path)}
                        className={`w-full px-3 py-2 rounded-xl text-left transition-colors cursor-pointer flex items-center justify-between gap-2.5 ${
                          isHome
                            ? 'hover:bg-[#EAF5FF] dark:hover:bg-white/10'
                            : 'hover:bg-[#FFF1DF] dark:hover:bg-[#382616]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {svc.icon && (
                            <span
                              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                isHome
                                  ? 'bg-[#EAF5FF] dark:bg-white/10'
                                  : 'bg-[#FFF1DF] dark:bg-[#382616]'
                              }`}
                            >
                              {svc.icon}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold truncate ${
                                isHome ? 'text-[#092B55] dark:text-white' : 'text-[#26364B] dark:text-[#FFF5E8]'
                              }`}
                            >
                              {svc.label}
                            </p>
                            <p
                              className={`text-[11px] truncate ${
                                isHome
                                  ? 'text-[#46607E] dark:text-[#A8CBEB]'
                                  : 'text-[#665B4F] dark:text-[#B6A695]'
                              }`}
                            >
                              {svc.sub}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs shrink-0 ${
                            isHome ? 'text-[#138A45] dark:text-[#36E7F2]' : 'text-[#A85B0A] dark:text-[#FFD19A]'
                          }`}
                        >
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* AI Assistant */}
            <button
              type="button"
              onClick={() => handleNav('/assistant')}
              className={`inline-flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11.5px] xl:text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                route === '/assistant'
                  ? isHome
                    ? 'bg-gradient-to-r from-[#09403A] to-[#138A45] text-white shadow-[0_0_12px_rgba(54,231,242,0.4)]'
                    : 'jenova-saffron-btn font-bold'
                  : isHome
                    ? 'text-[#092B55] dark:text-[#DCEEFF] hover:bg-white/60 dark:hover:bg-white/10'
                    : 'text-[#26364B] dark:text-[#F5EFE6] hover:bg-[#FFE5C2]/70 dark:hover:bg-[#382616]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>
                {language === 'bn' ? 'AI সহায়ক' : language === 'hi' ? 'AI सहायक' : 'AI Assistant'}
              </span>
            </button>

            {/* Local Support */}
            <button
              type="button"
              onClick={() => handleNav('/local-help')}
              className={`inline-flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11.5px] xl:text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                route === '/local-help'
                  ? isHome
                    ? 'bg-gradient-to-r from-[#09403A] to-[#138A45] text-white shadow-[0_0_12px_rgba(54,231,242,0.4)]'
                    : 'jenova-saffron-btn font-bold'
                  : isHome
                    ? 'text-[#092B55] dark:text-[#DCEEFF] hover:bg-white/60 dark:hover:bg-white/10'
                    : 'text-[#26364B] dark:text-[#F5EFE6] hover:bg-[#FFE5C2]/70 dark:hover:bg-[#382616]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {language === 'bn'
                  ? 'স্থানীয় সহায়তা'
                  : language === 'hi'
                    ? 'स्थानीय सहायता'
                    : 'Local Support'}
              </span>
            </button>

            {/* About */}
            <button
              type="button"
              onClick={() => handleNav('/about')}
              className={`inline-flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11.5px] xl:text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                route === '/about'
                  ? isHome
                    ? 'bg-gradient-to-r from-[#09403A] to-[#138A45] text-white shadow-[0_0_12px_rgba(54,231,242,0.4)]'
                    : 'jenova-saffron-btn font-bold'
                  : isHome
                    ? 'text-[#092B55] dark:text-[#DCEEFF] hover:bg-white/60 dark:hover:bg-white/10'
                    : 'text-[#26364B] dark:text-[#F5EFE6] hover:bg-[#FFE5C2]/70 dark:hover:bg-[#382616]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{t.nav.about}</span>
            </button>

            {/* FAQs */}
            <button
              type="button"
              onClick={handleFaqsNav}
              className={`hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isHome
                  ? 'text-[#092B55] dark:text-[#DCEEFF] hover:bg-white/60 dark:hover:bg-white/10'
                  : 'text-[#26364B] dark:text-[#F5EFE6] hover:bg-[#FFE5C2]/70 dark:hover:bg-[#382616]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রশ্নোত্তর' : language === 'hi' ? 'सामान्य प्रश्न' : 'FAQs'}</span>
            </button>

            {/* Contact */}
            <button
              type="button"
              onClick={() => handleNav('/contact')}
              className={`inline-flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11.5px] xl:text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                route === '/contact'
                  ? isHome
                    ? 'bg-gradient-to-r from-[#09403A] to-[#138A45] text-white shadow-[0_0_12px_rgba(54,231,242,0.4)]'
                    : 'jenova-saffron-btn font-bold'
                  : isHome
                    ? 'text-[#092B55] dark:text-[#DCEEFF] hover:bg-white/60 dark:hover:bg-white/10'
                    : 'text-[#26364B] dark:text-[#F5EFE6] hover:bg-[#FFE5C2]/70 dark:hover:bg-[#382616]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{t.nav.contact}</span>
            </button>
          </nav>

          {/* Right: Language Switcher + Theme Toggle + Login Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Compact Multilingual Switcher (Preserves Bengali/English/Hindi support) */}
            <div
              className={`hidden sm:flex items-center rounded-full border p-0.5 text-[11px] font-semibold ${
                isHome
                  ? 'border-[#36E7F2]/50 bg-white/70 dark:bg-[#0B2242]/80'
                  : 'border-[#F2DCC1] dark:border-[#4A3522] bg-[#FFF1DF] dark:bg-[#241B13]'
              }`}
              role="group"
              aria-label="Language switcher"
            >
              {(
                [
                  { code: 'bn', label: 'বাং' },
                  { code: 'en', label: 'EN' },
                  { code: 'hi', label: 'हिं' },
                ] as { code: Language; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code)}
                  className={`px-2 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                    language === opt.code
                      ? isHome
                        ? 'bg-[#092B55] dark:bg-[#36E7F2] text-white dark:text-[#092B55]'
                        : 'bg-[#26364B] dark:bg-[#F4A340] text-white dark:text-[#26364B]'
                      : isHome
                        ? 'text-[#092B55] dark:text-[#B9D8F7] hover:bg-white/60 dark:hover:bg-white/10'
                        : 'text-[#26364B] dark:text-[#DDD2C5] hover:bg-[#FFE5C2]/70 dark:hover:bg-[#382616]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              className={`w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer ${
                isHome
                  ? 'bg-[#092B55]/80 dark:bg-[#10386B] text-[#FFC45C] border border-[#36E7F2]/70 shadow-[0_0_12px_rgba(54,231,242,0.35)]'
                  : 'bg-[#FFF1DF] dark:bg-[#2A1E14] text-[#A85B0A] dark:text-[#FFD19A] border border-[#F2DCC1] dark:border-[#4A3522] hover:bg-[#FFE5C2] dark:hover:bg-[#382616]'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Login / Account Button */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen((v) => !v);
                    setServicesMenuOpen(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isHome
                      ? 'text-white bg-gradient-to-r from-[#092B55] via-[#0B4650] to-[#138A45] border border-[#36E7F2]/65 shadow-[0_0_16px_rgba(54,231,242,0.35)] hover:brightness-110'
                      : 'jenova-saffron-btn font-bold'
                  }`}
                >
                  <User className={`w-3.5 h-3.5 ${isHome ? 'text-[#36E7F2]' : 'text-[#26364B]'}`} />
                  <span className="max-w-[96px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {accountMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setAccountMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      className={`absolute right-0 mt-2.5 w-52 rounded-2xl border shadow-2xl py-2 z-40 text-sm ${
                        isHome
                          ? 'bg-white dark:bg-[#0A2040] border-[#36E7F2]/40'
                          : 'bg-white dark:bg-[#241B13] border-[#F2DCC1] dark:border-[#4A3522]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleNav('/dashboard')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 cursor-pointer ${
                          isHome
                            ? 'text-[#092B55] dark:text-white hover:bg-[#EAF5FF] dark:hover:bg-white/10'
                            : 'text-[#26364B] dark:text-[#FFF5E8] hover:bg-[#FFF1DF] dark:hover:bg-[#382616]'
                        }`}
                      >
                        <LayoutDashboard
                          className={`w-4 h-4 ${isHome ? 'text-[#138A45] dark:text-[#36E7F2]' : 'text-[#A85B0A] dark:text-[#FFD19A]'}`}
                        />
                        <span>{t.nav.dashboard}</span>
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleNav('/admin')}
                          className={`w-full px-4 py-2 text-left flex items-center gap-2.5 font-semibold cursor-pointer ${
                            isHome
                              ? 'text-[#FF8A18] hover:bg-[#EAF5FF] dark:hover:bg-white/10'
                              : 'text-[#A85B0A] dark:text-[#FFD19A] hover:bg-[#FFF1DF] dark:hover:bg-[#382616]'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{t.nav.admin}</span>
                        </button>
                      )}
                      <div
                        className={`my-1.5 border-t ${
                          isHome ? 'border-[#D6E6F5] dark:border-white/15' : 'border-[#F2DCC1] dark:border-[#3F2E1E]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('/auth')}
                className={`hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isHome
                    ? 'text-white bg-gradient-to-r from-[#092B55] via-[#0B4650] to-[#0D6A4E] border border-[#36E7F2]/70 shadow-[0_0_18px_rgba(54,231,242,0.4)] hover:brightness-115'
                    : 'jenova-saffron-btn'
                }`}
              >
                <User className={`w-3.5 h-3.5 ${isHome ? 'text-[#36E7F2]' : 'text-[#26364B]'}`} />
                <span>{t.nav.login}</span>
              </button>
            )}

            {/* Mobile / Tablet Menu Button (Hidden once lg floating pill appears) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={`lg:hidden p-2 rounded-full border cursor-pointer ${
                isHome
                  ? 'bg-white/85 dark:bg-[#0B2242] border-[#36E7F2]/55 text-[#092B55] dark:text-white'
                  : 'bg-[#FFF1DF] dark:bg-[#2A1E14] border-[#F2DCC1] dark:border-[#4A3522] text-[#26364B] dark:text-[#FFF5E8]'
              }`}
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Responsive Drawer */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden border-t px-4 py-4 space-y-1.5 max-h-[78vh] overflow-y-auto shadow-2xl ${
              isHome
                ? 'border-[#36E7F2]/30 bg-white/98 dark:bg-[#071A34]/98'
                : 'border-[#F2DCC1] dark:border-[#3F2E1E] bg-[#FFF9F0]/98 dark:bg-[#1E160F]/98'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 mb-2 border-b sm:hidden ${
                isHome ? 'border-[#D6E6F5] dark:border-white/10' : 'border-[#F2DCC1] dark:border-[#3F2E1E]'
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  isHome ? 'text-[#46607E] dark:text-[#B9D8F7]' : 'text-[#665B4F] dark:text-[#B6A695]'
                }`}
              >
                {tr(language, 'ভাষা', 'भाषा', 'Language')}
              </span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { code: 'bn', label: 'বাং' },
                    { code: 'en', label: 'EN' },
                    { code: 'hi', label: 'हिं' },
                  ] as { code: Language; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setLanguage(opt.code)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      language === opt.code
                        ? isHome
                          ? 'bg-[#092B55] dark:bg-[#36E7F2] text-white dark:text-[#092B55]'
                          : 'bg-[#26364B] dark:bg-[#F4A340] text-white dark:text-[#26364B]'
                        : isHome
                          ? 'bg-[#EAF4FD] dark:bg-white/10 text-[#092B55] dark:text-white'
                          : 'bg-[#FFF1DF] dark:bg-[#2A1E14] text-[#26364B] dark:text-[#FFF5E8]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { path: '/', label: t.nav.home },
              { path: '/scam-check', label: 'JENOVA Protect' },
              { path: '/schemes', label: 'JENOVA Schemes' },
              { path: '/checklist', label: 'JENOVA Checklist' },
              {
                path: '/assistant',
                label: tr(
                  language,
                  'JENOVA Voice (এআই সহায়ক)',
                  'JENOVA Voice (एआई सहायक)',
                  'JENOVA Voice (AI Assistant)'
                ),
              },
              {
                path: '/local-help',
                label: tr(
                  language,
                  'JENOVA Local (স্থানীয় সহায়তা)',
                  'JENOVA Local (स्थानीय सहायता)',
                  'JENOVA Local (Local Support)'
                ),
              },
              { path: '/udaan', label: 'JENOVA UDAAN' },
              {
                path: '/passport',
                label: tr(
                  language,
                  'JENOVA Action Passport',
                  'JENOVA Action Passport',
                  'JENOVA Action Passport'
                ),
              },
              { path: '/jobs', label: t.nav.jobs },
              { path: '/skills', label: t.nav.skills },
              { path: '/finance', label: t.nav.finance },
              { path: '/msme', label: t.nav.msme },
              { path: '/updates', label: t.nav.updates },
              { path: '/dashboard', label: t.nav.dashboard },
              ...(isAdmin ? [{ path: '/admin', label: t.nav.admin }] : []),
              { path: '/about', label: t.nav.about },
              { path: '/contact', label: t.nav.contact },
            ].map((item) => {
              const active =
                item.path === '/' ? route === '/' : route === item.path || route.startsWith(`${item.path}/`);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
                    active
                      ? isHome
                        ? 'bg-[#092B55] dark:bg-[#36E7F2] text-white dark:text-[#092B55]'
                        : 'jenova-saffron-btn font-bold'
                      : isHome
                        ? 'text-[#092B55] dark:text-[#DCEEFF] hover:bg-[#EAF4FD] dark:hover:bg-white/10'
                        : 'text-[#26364B] dark:text-[#F5EFE6] hover:bg-[#FFF1DF] dark:hover:bg-[#382616]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleFaqsNav}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
                isHome
                  ? 'text-[#092B55] dark:text-[#DCEEFF] hover:bg-[#EAF4FD] dark:hover:bg-white/10'
                  : 'text-[#26364B] dark:text-[#F5EFE6] hover:bg-[#FFF1DF] dark:hover:bg-[#382616]'
              }`}
            >
              {tr(language, 'প্রশ্নোত্তর (FAQs)', 'सवाल-जवाब (FAQs)', 'FAQs')}
            </button>

            <div
              className={`pt-3 border-t space-y-2 ${
                isHome ? 'border-[#D6E6F5] dark:border-white/10' : 'border-[#F2DCC1] dark:border-[#3F2E1E]'
              }`}
            >
              <div className="px-1">
                <PWAInstallButton />
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                >
                  {t.nav.logout} ({user.name})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav('/auth')}
                  className={`w-full text-center px-4 py-2.5 rounded-full text-sm font-bold cursor-pointer ${
                    isHome ? 'text-white bg-gradient-to-r from-[#092B55] to-[#138A45]' : 'jenova-saffron-btn'
                  }`}
                >
                  {t.nav.login}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        <motion.div
          key={route}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer: Consistent Light Saffron-Cream Portal Footer (outside the locked Homepage hero/screenshot portion) */}
      <footer
        className={`${
          isHome ? 'mt-0' : 'mt-14 sm:mt-16'
        } pb-20 md:pb-0 border-t bg-[#FFF1DF] dark:bg-[#140F0A] text-[#26364B] dark:text-[#F5EFE6] border-[#F2DCC1] dark:border-[#3F2E1E]`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[#F2DCC1] dark:border-[#3F2E1E]">
            <div className="sm:col-span-2 lg:col-span-5 space-y-3.5">
              <JenovaLogo
                variant={theme === 'dark' ? 'dark' : 'light'}
                size="md"
                showTagline
                tagline={
                  language === 'bn'
                    ? 'নতুন সম্ভাবনা, সবার জন্য।'
                    : language === 'hi'
                      ? 'नई संभावनाएं, सभी के लिए।'
                      : 'A New Way to Grow Together.'
                }
              />
              <p className="text-sm leading-relaxed max-w-md text-[#454545] dark:text-[#DDD2C5]">
                {t.footer.tagline}
              </p>
              <p className="text-xs font-medium text-[#665B4F] dark:text-[#B6A695]">
                {t.footer.pilotCredit}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <PWAInstallButton compact forceSaffron />
                <a
                  href="/assets/aistudio/community_financial_empowerment_project_note_8c729351.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline text-[#A85B0A] dark:text-[#FFD19A]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {tr(
                      language,
                      'কমিউনিটি ক্ষমতায়ন ব্লুপ্রিন্ট পড়ুন (PDF)',
                      'सामुदायिक सशक्तिकरण ब्लूप्रिंट पढ़ें (PDF)',
                      'Read Community Empowerment Blueprint (PDF)'
                    )}
                  </span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-2 text-sm">
              <p className="font-semibold mb-3 text-[#26364B] dark:text-[#FFF5E8]">
                {language === 'bn' ? 'প্রধান পরিষেবা' : language === 'hi' ? 'मुख्य सेवाएं' : 'Core Modules'}
              </p>
              {[
                { path: '/jobs', label: t.nav.jobs },
                { path: '/skills', label: t.nav.skills },
                { path: '/finance', label: t.nav.finance },
                { path: '/schemes', label: t.nav.schemes },
                { path: '/msme', label: t.nav.msme },
              ].map((l) => (
                <button
                  key={l.path}
                  type="button"
                  onClick={() => handleNav(l.path)}
                  className="block transition-colors cursor-pointer text-[#454545] dark:text-[#DDD2C5] hover:text-[#A85B0A] dark:hover:text-[#FFD19A]"
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="lg:col-span-2 space-y-2 text-sm">
              <p className="font-semibold mb-3 text-[#26364B] dark:text-[#FFF5E8]">
                {language === 'bn' ? 'JENOVA টুলস' : language === 'hi' ? 'JENOVA टूल्स' : 'JENOVA Suite'}
              </p>
              {[
                { path: '/scam-check', label: 'JENOVA Protect' },
                { path: '/schemes', label: 'JENOVA Schemes' },
                { path: '/checklist', label: 'JENOVA Checklist' },
                { path: '/assistant', label: 'JENOVA Voice' },
                { path: '/local-help', label: 'JENOVA Local' },
                { path: '/udaan', label: 'JENOVA UDAAN' },
                { path: '/passport', label: 'Action Passport' },
                {
                  path: '/msme/planner',
                  label: tr(language, 'ব্যবসা প্ল্যান বিল্ডার', 'व्यवसाय प्लान बिल्डर', 'Business Plan Builder'),
                },
                {
                  path: '/jobs/biodata',
                  label: tr(language, 'বায়োডাটা বিল্ডার', 'बायोडाटा बिल्डर', 'Biodata Builder'),
                },
              ].map((l) => (
                <button
                  key={`${l.path}-${l.label}`}
                  type="button"
                  onClick={() => handleNav(l.path)}
                  className="block transition-colors cursor-pointer text-[#454545] dark:text-[#DDD2C5] hover:text-[#A85B0A] dark:hover:text-[#FFD19A]"
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="sm:col-span-2 lg:col-span-3 space-y-2 text-sm">
              <p className="font-semibold mb-2 text-[#26364B] dark:text-[#FFF5E8]">
                {t.footer.privacyTitle}
              </p>
              <p className="text-xs leading-relaxed text-[#454545] dark:text-[#DDD2C5]">
                {t.footer.privacyNote}
              </p>
              <div className="pt-2 flex flex-wrap gap-3 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handleNav('/auth')}
                  className="hover:underline cursor-pointer text-[#A85B0A] dark:text-[#FFD19A] font-semibold"
                >
                  {user ? t.nav.dashboard : t.nav.login}
                </button>
                <span className="text-[#E6C195] dark:text-[#59412A]">·</span>
                <button
                  type="button"
                  onClick={() => handleNav('/admin')}
                  className="cursor-pointer text-[#454545] dark:text-[#DDD2C5] hover:text-[#26364B] dark:hover:text-white"
                >
                  {t.nav.admin}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-2">
            <p className="text-xs leading-relaxed text-[#454545] dark:text-[#DDD2C5]">
              {t.footer.disclaimer}
            </p>
            <p className="text-xs text-[#665B4F] dark:text-[#B6A695]">
              © {new Date().getFullYear()} JENOVA ·{' '}
              {language === 'bn'
                ? 'নতুন সম্ভাবনা, সবার জন্য।'
                : language === 'hi'
                  ? 'नई संभावनाएं, सभी के लिए।'
                  : 'A New Way to Grow Together.'}
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Thumb-Friendly Quick-Access Dock (< md) */}
      <nav
        aria-label="Mobile Quick Navigation"
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t px-2 py-1.5 ${
          isHome
            ? 'bg-white/95 dark:bg-[#071D3C]/95 border-[#36E7F2]/35 shadow-[0_-8px_24px_rgba(4,18,39,0.18)]'
            : 'bg-[#FFF9F0]/96 dark:bg-[#1E160F]/96 border-[#F2DCC1] dark:border-[#3F2E1E] shadow-[0_-8px_24px_rgba(186,112,32,0.14)]'
        }`}
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {[
            {
              path: '/',
              label: language === 'bn' ? 'হোম' : language === 'hi' ? 'होम' : 'Home',
              Icon: Home,
            },
            {
              path: '/scam-check',
              label: language === 'bn' ? 'নিরাপদ' : language === 'hi' ? 'सुरक्षा' : 'Protect',
              Icon: ShieldCheck,
            },
            {
              path: '/schemes',
              label: language === 'bn' ? 'প্রকল্প' : language === 'hi' ? 'योजनाएं' : 'Schemes',
              Icon: LayoutGrid,
            },
            {
              path: '/assistant',
              label: language === 'bn' ? 'ভয়েস' : language === 'hi' ? 'आवाज़' : 'Voice',
              Icon: Bot,
            },
            {
              path: '/local-help',
              label: language === 'bn' ? 'সহায়তা' : language === 'hi' ? 'स्थानीय' : 'Local',
              Icon: MapPin,
            },
          ].map(({ path, label, Icon }) => {
            const active = path === '/' ? route === '/' : route === path || route.startsWith(`${path}/`);
            return (
              <button
                key={path}
                type="button"
                onClick={() => handleNav(path)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                  active
                    ? isHome
                      ? 'bg-[#092B55] dark:bg-[#36E7F2] text-white dark:text-[#092B55]'
                      : 'jenova-saffron-btn'
                    : isHome
                      ? 'text-[#355576] dark:text-[#B9D8F7]'
                      : 'text-[#454545] dark:text-[#DDD2C5]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-full">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <ReportModal />
      <OfflineIndicator />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-20 md:bottom-5 right-4 sm:right-5 z-50 max-w-sm rounded-xl border px-4 py-3 text-xs font-medium shadow-2xl ${
            isHome
              ? 'bg-[#092B55] border-[#36E7F2]/50 text-white'
              : 'bg-[#26364B] border-[#F4A340]/60 text-[#FFF9F0]'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
