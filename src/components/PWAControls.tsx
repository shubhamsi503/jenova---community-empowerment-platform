import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../i18n/translations';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function PWAInstallButton({
  compact = false,
  forceSaffron = false,
}: {
  compact?: boolean;
  forceSaffron?: boolean;
}) {
  const { language, route, showToast } = useApp();
  const isHome = !forceSaffron && (route === '/' || route === '');
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  const label =
    language === 'bn'
      ? 'ফোনে অ্যাপ ইনস্টল করুন'
      : language === 'hi'
        ? 'फोन में ऐप इंस्टॉल करें'
        : 'Install App';

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        showToast(
          tr(
            language,
            'JENOVA আপনার হোম স্ক্রিনে যোগ হয়েছে!',
            'JENOVA आपकी होम स्क्रीन पर इंस्टॉल हो गया है!',
            'JENOVA has been installed on your home screen.'
          )
        );
      }
      return;
    }
    setShowGuide(true);
  };

  const buttonClasses = isHome
    ? compact
      ? 'px-3 py-2 text-xs text-[#176B4D] bg-[#EBF4F0] border border-[#176B4D]/25 hover:bg-[#DDECE5]'
      : 'px-4 py-2.5 text-xs text-[#176B4D] bg-[#EBF4F0] border border-[#176B4D]/30 hover:bg-[#DDECE5] min-h-[42px]'
    : compact
      ? 'px-3 py-2 text-xs text-[#26364B] dark:text-[#FFF5E8] bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#4A3522] hover:bg-[#FFE5C2] dark:hover:bg-[#382616]'
      : 'px-4 py-2.5 text-xs text-[#26364B] dark:text-[#FFF5E8] bg-white dark:bg-[#241B13] border border-[#F2DCC1] dark:border-[#4A3522] hover:bg-[#FFE5C2] dark:hover:bg-[#382616] min-h-[42px]';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${buttonClasses}`}
      >
        {isIOS ? <Smartphone className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
        <span>{label}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4 border ${
              isHome
                ? 'bg-white border-[#E5E3DC]'
                : 'bg-white dark:bg-[#241B13] border-[#F2DCC1] dark:border-[#4A3522]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3
                className={`text-base font-bold ${
                  isHome ? 'text-[#252525]' : 'text-[#26364B] dark:text-[#FFF5E8]'
                }`}
              >
                {tr(
                  language,
                  'হোম স্ক্রিনে JENOVA যোগ করুন',
                  'होम स्क्रीन पर JENOVA इंस्टॉल करें',
                  'Install JENOVA on Your Phone'
                )}
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className={`p-1 cursor-pointer ${
                  isHome
                    ? 'text-[#5C5C58] hover:text-[#252525]'
                    : 'text-[#454545] dark:text-[#DCC8B0] hover:text-[#26364B] dark:hover:text-white'
                }`}
                aria-label={tr(language, 'বন্ধ করুন', 'बंद करें', 'Close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {isIOS ? (
              <ol
                className={`text-sm space-y-2 list-decimal pl-4 ${
                  isHome ? 'text-[#4A4A46]' : 'text-[#454545] dark:text-[#E5D3BE]'
                }`}
              >
                <li>
                  {tr(
                    language,
                    'Safari ব্রাউজারের নিচে Share বোতামে ট্যাপ করুন।',
                    'Safari टूलबार में Share बटन पर टैप करें।',
                    'Tap the Share button in the Safari toolbar.'
                  )}
                </li>
                <li>
                  {tr(
                    language,
                    'নিচে স্ক্রল করে "Add to Home Screen" বেছে নিন।',
                    'नीचे स्क्रॉल करें और "Add to Home Screen" चुनें।',
                    'Scroll down and tap "Add to Home Screen".'
                  )}
                </li>
              </ol>
            ) : (
              <ol
                className={`text-sm space-y-2 list-decimal pl-4 ${
                  isHome ? 'text-[#4A4A46]' : 'text-[#454545] dark:text-[#E5D3BE]'
                }`}
              >
                <li>
                  {tr(
                    language,
                    'আপনার Chrome/Android ব্রাউজারের উপরের মেনু (⋮) ট্যাপ করুন।',
                    'अपने Chrome या Edge ब्राउज़र का मेनू (⋮) खोलें।',
                    'Open your browser menu (⋮) in Chrome or Edge.'
                  )}
                </li>
                <li>
                  {tr(
                    language,
                    '"Install app" বা "Add to Home screen" নির্বাচন করুন — এটি অফলাইনেও সেভ করা চেকলিস্ট ও প্রকল্প দেখাতে সাহায্য করে।',
                    '"Install app" या "Add to Home screen" चुनें — इससे ऑफलाइन सहेजी गई चेकलिस्ट और योजनाएं भी खुलती हैं।',
                    'Tap "Install app" or "Add to Home screen" for quick one-tap access and offline cached checklists.'
                  )}
                </li>
              </ol>
            )}
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
                isHome
                  ? 'bg-[#176B4D] hover:bg-[#11533B] text-white'
                  : 'jenova-saffron-btn'
              }`}
            >
              {tr(language, 'বুঝেছি', 'समझ गया', 'Got It')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function OfflineIndicator() {
  const { language, route } = useApp();
  const isHome = route === '/' || route === '';
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-lg ${
        isHome
          ? 'bg-[#B56A10] text-white'
          : 'bg-[#FFD19A] text-[#26364B] border border-[#F4A340]'
      }`}
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {language === 'bn'
          ? 'অফলাইন মোড — সংরক্ষিত প্রকল্প ও ফোল্ডার চেকলিস্ট দেখানো হচ্ছে।'
          : language === 'hi'
            ? 'ऑफ़लाइन मोड — सहेजी गई योजनाएं और चेकलिस्ट उपलब्ध हैं।'
            : 'Offline Mode — Showing cached public guides & saved checklists.'}
      </span>
    </div>
  );
}
