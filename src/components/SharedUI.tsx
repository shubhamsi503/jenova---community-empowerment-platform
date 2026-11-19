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
            ? 'text-[#138A45] dark:text-emerald-300'
            : isDanger
              ? 'text-red-700 dark:text-red-400'
              : 'text-[#B56A10] dark:text-[#FFC45C]'
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
    <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#E5E3DC] dark:border-slate-700/70">
      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onExternalClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#138A45] hover:bg-[#0D6E36] rounded-lg transition-colors whitespace-nowrap shrink-0"
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
            ? 'bg-[#EBF4F0] dark:bg-emerald-950/60 border-[#138A45]/30 dark:border-emerald-500/40 text-[#138A45] dark:text-emerald-300'
            : 'bg-white dark:bg-slate-800/80 border-[#E5E3DC] dark:border-slate-700 text-[#252525] dark:text-slate-200 hover:bg-[#F5F4EF] dark:hover:bg-slate-700'
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
        <span>{saved ? t.common.bookmarked : t.common.bookmark}</span>
      </button>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#E5E3DC] dark:border-slate-700 bg-white dark:bg-slate-800/80 text-[#252525] dark:text-slate-200 hover:bg-[#F5F4EF] dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
      >
        <Share2 className="w-3.5 h-3.5 text-[#138A45] dark:text-emerald-400" />
        <span>{t.common.shareWhatsApp}</span>
      </a>

      <button
        type="button"
        onClick={() => openReportModal({ targetType: itemType, targetId: itemId, targetTitle: title })}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#5C5C58] dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ml-auto"
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
    <div className="border-b border-[#E5E3DC] dark:border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#092B55] dark:text-white">{title}</h1>
        <p className="mt-2 text-sm sm:text-base text-[#5C5C58] dark:text-slate-300 leading-relaxed">{subtitle}</p>
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
}: {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  eager?: boolean;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#EBF4F0] text-[#176B4D] p-4 text-center ${containerClassName}`}
      >
        <CheckCircle2 className="w-6 h-6 opacity-70 mb-1.5" />
        <span className="text-xs font-medium text-[#11533B] max-w-[200px]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-[#F2F0E8] ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    </div>
  );
}

