import React from 'react';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flag,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import type { VerificationStatus } from '../types/platform';
import { useApp } from '../context/AppContext';
import { buildWhatsAppShareUrl } from '../lib/api';

export function VerificationLabel({
  status,
  isDemo,
}: {
  status: VerificationStatus;
  isDemo?: boolean;
}) {
  const { t, language } = useApp();

  const statusText =
    status === 'Officially Verified'
      ? language === 'bn'
        ? 'অফিসিয়ালি যাচাইকৃত'
        : language === 'hi'
          ? 'आधिकारिक रूप से सत्यापित'
          : 'Officially Verified'
      : status === 'Independently Verified'
        ? language === 'bn'
          ? 'স্বতন্ত্রভাবে যাচাইকৃত'
          : language === 'hi'
            ? 'स्वतंत्र रूप से सत्यापित'
            : 'Independently Verified'
        : status === 'Community Submitted'
          ? language === 'bn'
            ? 'কমিউনিটি জমাকৃত'
            : language === 'hi'
              ? 'समुदाय द्वारा प्रस्तुत'
              : 'Community Submitted'
          : status === 'Verified'
            ? t.common.verified
            : status === 'Pending Verification'
              ? t.common.pending
              : status === 'Needs Review'
                ? t.common.needsReview
                : status === 'Expired'
                  ? t.common.expired
                  : t.common.rejected;

  const isVerified =
    status === 'Verified' ||
    status === 'Officially Verified' ||
    status === 'Independently Verified';
  const isDanger = status === 'Rejected' || status === 'Expired';

  void isDemo;

  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap">
      <span
        className={`inline-flex items-center gap-1 ${
          isVerified
            ? 'text-[#27845B] dark:text-[#45B884]'
            : isDanger
              ? 'text-red-700 dark:text-red-400'
              : 'text-[#A85B0A] dark:text-[#FFD19A]'
        }`}
      >
        {isVerified ? (
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <Clock className="w-3.5 h-3.5 shrink-0" />
        )}
        {statusText}
      </span>
    </span>
  );
}

export function ActionToolbar({
  itemType,
  itemId,
  title,
  shareSummary,
  sharePath,
  externalUrl,
  externalLabel,
  onExternalClick,
}: {
  itemType: 'job' | 'course' | 'scheme' | 'business';
  itemId: string;
  title: string;
  shareSummary: string;
  sharePath: string;
  externalUrl?: string;
  externalLabel?: string;
  onExternalClick?: () => void;
}) {
  const { t, isBookmarked, toggleBookmark, openReportModal } = useApp();
  const saved = isBookmarked(itemType, itemId);
  const waHref = buildWhatsAppShareUrl(title, shareSummary, sharePath);

  return (
    <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#F2DCC1] dark:border-[#3F2E1E]">
      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onExternalClick}
          className="jenova-saffron-btn inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0"
        >
          <span>{externalLabel || t.common.officialPortal}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      <button
        type="button"
        onClick={() => toggleBookmark(itemType, itemId)}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          saved
            ? 'bg-[#FFE5C2] dark:bg-[#382616] border-[#F4A340]/60 dark:border-[#F4A340]/50 text-[#26364B] dark:text-[#FFD19A]'
            : 'bg-white dark:bg-[#241B13] border-[#F2DCC1] dark:border-[#3F2E1E] text-[#26364B] dark:text-[#FFF5E8] hover:bg-[#FFF1DF] dark:hover:bg-[#382616]'
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current text-[#A85B0A] dark:text-[#FFD19A]' : ''}`} />
        <span>{saved ? t.common.bookmarked : t.common.bookmark}</span>
      </button>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#F2DCC1] dark:border-[#3F2E1E] bg-white dark:bg-[#241B13] text-[#26364B] dark:text-[#FFF5E8] hover:bg-[#FFF1DF] dark:hover:bg-[#382616] transition-colors whitespace-nowrap shrink-0"
      >
        <Share2 className="w-3.5 h-3.5 text-[#27845B] dark:text-[#45B884]" />
        <span>{t.common.shareWhatsApp}</span>
      </a>

      <button
        type="button"
        onClick={() => openReportModal({ targetType: itemType, targetId: itemId, targetTitle: title })}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#665B4F] dark:text-[#B6A695] hover:text-red-700 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ml-auto"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>{t.common.reportIssue}</span>
      </button>
    </div>
  );
}

export function SafetyNotice({ message }: { message?: string }) {
  const { t } = useApp();
  return (
    <div className="rounded-xl bg-[#FEF4E6] dark:bg-amber-950/40 border border-[#F4A340]/45 dark:border-amber-500/35 px-4 py-3 flex items-start gap-3 text-sm text-[#6B3F06] dark:text-amber-200">
      <ShieldAlert className="w-5 h-5 text-[#B56A10] dark:text-[#FFC45C] shrink-0 mt-0.5" />
      <p className="leading-relaxed">{message || t.common.safetyBanner}</p>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#F2DCC1] dark:border-[#3F2E1E] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#26364B] dark:text-[#FFF5E8]">{title}</h1>
        <p className="mt-2 text-sm sm:text-base text-[#454545] dark:text-[#DDD2C5] leading-relaxed">{subtitle}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function ResilientImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  eager = false,
  fallbackLabel,
  objectFit = 'cover',
}: {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  eager?: boolean;
  fallbackLabel?: string;
  objectFit?: 'cover' | 'contain';
}) {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#FFF1DF] dark:bg-[#2A1E14] text-[#A85B0A] dark:text-[#FFD19A] p-4 text-center ${containerClassName}`}
      >
        <CheckCircle2 className="w-6 h-6 opacity-70 mb-1.5" />
        <span className="text-xs font-medium text-[#26364B] dark:text-[#FFF5E8] max-w-[200px]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  const defaultBgClass = /\bbg-/.test(containerClassName) ? '' : 'bg-[#FFF1DF] dark:bg-[#221911]';
  const fitClass = objectFit === 'contain' ? 'object-contain object-center' : 'object-cover';

  return (
    <div className={`overflow-hidden ${defaultBgClass} ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`w-full h-full ${fitClass} ${className}`}
      />
    </div>
  );
}

