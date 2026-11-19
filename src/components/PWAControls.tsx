import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

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

export function PWAInstallButton({ compact = false }: { compact?: boolean }) {
  const { language, showToast } = useApp();
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
          language === 'bn'
            ? 'JENOVA আপনার হোম স্ক্রিনে যোগ হয়েছে!'
            : 'JENOVA has been installed on your home screen.'
        );
      }
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          compact
            ? 'px-3 py-2 text-xs text-[#176B4D] bg-[#EBF4F0] border border-[#176B4D]/25 hover:bg-[#DDECE5]'
            : 'px-4 py-2.5 text-xs text-[#176B4D] bg-[#EBF4F0] border border-[#176B4D]/30 hover:bg-[#DDECE5] min-h-[42px]'
        }`}
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
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E5E3DC] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-[#252525]">
                {language === 'bn'
                  ? 'হোম স্ক্রিনে JENOVA যোগ করুন'
                  : 'Install JENOVA on Your Phone'}
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1 text-[#5C5C58] hover:text-[#252525] cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {isIOS ? (
              <ol className="text-sm text-[#4A4A46] space-y-2 list-decimal pl-4">
                <li>
                  {language === 'bn'
                    ? 'Safari ব্রাউজারের নিচে Share বোতামে ট্যাপ করুন।'
                    : 'Tap the Share button in the Safari toolbar.'}
                </li>
                <li>
                  {language === 'bn'
                    ? 'নিচে স্ক্রল করে "Add to Home Screen" বেছে নিন।'
                    : 'Scroll down and tap "Add to Home Screen".'}
                </li>
              </ol>
            ) : (
              <ol className="text-sm text-[#4A4A46] space-y-2 list-decimal pl-4">
                <li>
                  {language === 'bn'
                    ? 'আপনার Chrome/Android ব্রাউজারের উপরের মেনু (⋮) ট্যাপ করুন।'
                    : 'Open your browser menu (⋮) in Chrome or Edge.'}
                </li>
                <li>
                  {language === 'bn'
                    ? '"Install app" বা "Add to Home screen" নির্বাচন করুন — এটি অফলাইনেও সেভ করা চেকলিস্ট ও প্রকল্প দেখাতে সাহায্য করে।'
                    : 'Tap "Install app" or "Add to Home screen" for quick one-tap access and offline cached checklists.'}
                </li>
              </ol>
            )}
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#11533B] text-white text-sm font-semibold cursor-pointer"
            >
              {language === 'bn' ? 'বুঝেছি' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function OfflineIndicator() {
  const { language } = useApp();
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#B56A10] px-4 py-2.5 text-xs font-semibold text-white shadow-lg"
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
