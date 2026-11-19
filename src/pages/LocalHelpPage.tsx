import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  ExternalLink,
  Flag,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  apiFetch,
  readOfflineCache,
  trackAnalyticsEvent,
  writeOfflineCache,
} from '../lib/api';
import { pickText } from '../i18n/translations';
import type { AssistanceCentreCategory, LocalAssistanceCentre } from '../types/platform';
import { PageHeader, SafetyNotice, VerificationLabel } from '../components/SharedUI';
import { ReadAloudButton } from '../components/VoiceAccessibility';

const CATEGORIES: { id: 'all' | AssistanceCentreCategory; bn: string; en: string; hi: string }[] = [
  { id: 'all', bn: 'সব কেন্দ্র', en: 'All Centres', hi: 'सभी केंद्र' },
  { id: 'Bangla Sahayata Kendra', bn: 'বাংলা সহায়তা কেন্দ্র (BSK)', en: 'Bangla Sahayata Kendra (BSK)', hi: 'बांग्ला सहायता केंद्र (BSK)' },
  { id: 'Government Office', bn: 'সরকারি দপ্তর ও BDO', en: 'Government & BDO Offices', hi: 'सरकारी और BDO कार्यालय' },
  { id: 'Skill & Training Centre', bn: 'দক্ষতা ও RSETI প্রশিক্ষণ', en: 'Skill & RSETI Training', hi: 'कौशल और RSETI प्रशिक्षण' },
  { id: 'Employment Support', bn: 'কর্মসংস্থান সহায়তা', en: 'Employment Support', hi: 'रोजगार सहायता' },
  { id: 'Cyber & Legal Safety', bn: 'সাইবার সুরক্ষা (1930)', en: 'Cyber & Legal Safety', hi: 'साइबर सुरक्षा (1930)' },
];

export function LocalHelpPage() {
  const { language, navigate, openReportModal } = useApp();
  const [centres, setCentres] = useState<LocalAssistanceCentre[]>(() =>
    readOfflineCache<LocalAssistanceCentre[]>('assistance_centres', [])
  );
  const [loading, setLoading] = useState(centres.length === 0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | AssistanceCentreCategory>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch<{ centres: LocalAssistanceCentre[] }>('/api/assistance')
      .then((res) => {
        const list = res.centres || [];
        setCentres(list);
        writeOfflineCache('assistance_centres', list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return centres.filter((c) => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (!q) return true;
      const hay = [
        c.name.bn,
        c.name.en,
        c.name.hi,
        c.locationArea,
        c.address,
        c.description.bn,
        c.description.en,
        ...c.servicesOffered,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [centres, selectedCategory, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title={
          language === 'bn'
            ? 'JENOVA Local — যাচাইকৃত স্থানীয় সহায়তা কেন্দ্র'
            : language === 'hi'
              ? 'JENOVA Local — सत्यापित स्थानीय सहायता केंद्र'
              : 'JENOVA Local — Verified Local Assistance Directory'
        }
        subtitle={
          language === 'bn'
            ? 'বাংলা সহায়তা কেন্দ্র (BSK), পূর্ব মেদিনীপুর জেলা ও বিডিও ডিরেক্টরি, দুয়ারে সরকার, উৎকর্ষ বাংলা ও জাতীয় সাইবার হেল্পলাইন (১৯৩০) — শুধুমাত্র যাচাইকৃত সরকারি সূত্র।'
            : 'Verified official portals for Bangla Sahayata Kendra (BSK), Purba Medinipur District/BDO directory, Duare Sarkar, PBSSD/RSETI, Employment Bank, and Cyber Crime Helpline 1930.'
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/checklist')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#11533B] text-white text-sm font-semibold cursor-pointer"
          >
            {language === 'bn' ? 'JENOVA Checklist খুলুন' : 'Open JENOVA Checklist'}
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      <SafetyNotice
        message={
          language === 'bn'
            ? 'স্বচ্ছতা নীতি: আমরা কখনোই অনুমান করে কোনো রাস্তার ঠিকানা, ব্যক্তিগত ফোন নম্বর বা ক্যাম্পের তারিখ লিখি না। যেসব অফিসের স্থানীয় কাউন্টারের সময় মাঠে যাচাই বাকি আছে, সেগুলি স্পষ্টভাবে চিহ্নিত করা হয়েছে।'
            : 'Honesty Guarantee: We never invent local counter addresses, personal phone numbers, or camp dates. Entries requiring local field timing confirmation are clearly marked.'
        }
      />

      {/* Search & Filter */}
      <div className="rounded-2xl bg-white border border-[#E5E3DC] p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5C5C58] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'কেন্দ্রের নাম, BSK, BDO, RSETI বা পরিষেবা খুঁজুন...'
                : 'Search BSK, BDO, Duare Sarkar, RSETI, Cyber Helpline...'
            }
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer min-h-[40px] ${
                selectedCategory === cat.id
                  ? 'bg-[#176B4D] text-white border-[#176B4D]'
                  : 'bg-[#FAF9F5] text-[#252525] border-[#E5E3DC] hover:bg-[#EBF4F0]'
              }`}
            >
              {language === 'bn' ? cat.bn : language === 'hi' ? cat.hi : cat.en}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="py-12 text-center text-sm text-[#5C5C58]">
          {language === 'bn' ? 'তথ্য লোড হচ্ছে...' : 'Loading verified local assistance centres...'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-10 text-center text-sm text-[#5C5C58]">
          {language === 'bn'
            ? 'এই ফিল্টারে কোনো সহায়তা কেন্দ্র পাওয়া যায়নি।'
            : 'No assistance centres match your current filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((centre) => {
            const nameText = pickText(centre.name, language);
            const descText = pickText(centre.description, language);

            return (
              <article
                key={centre.id}
                className="rounded-2xl bg-white border border-[#E5E3DC] p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#176B4D]">{centre.category}</span>
                    <VerificationLabel status={centre.verificationStatus} />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-[#252525] leading-snug">{nameText}</h2>
                    <ReadAloudButton
                      compact
                      lang={language}
                      text={`${nameText}. ${descText}. ${centre.address}. ${centre.servicesOffered.join(', ')}. ${centre.timingsNote}`}
                    />
                  </div>

                  <p className="text-xs sm:text-sm text-[#5C5C58] leading-relaxed">{descText}</p>

                <div className="space-y-1.5 text-xs sm:text-sm text-[#4A4A46]">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#252525]">{centre.locationArea}:</strong>{' '}
                        {centre.address ||
                          (language === 'bn' ? 'যাচাই বাকি (Verification pending)' : 'Verification pending')}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" />
                      <span>
                        {centre.timingsNote ||
                          (language === 'bn' ? 'যাচাই বাকি (Verification pending)' : 'Verification pending')}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" />
                      <span>
                        {centre.publicContact ||
                          (language === 'bn' ? 'যাচাই বাকি (Verification pending)' : 'Verification pending')}
                      </span>
                    </p>
                  </div>

                  {centre.needsLocalFieldVerification && (
                    <div className="rounded-xl bg-[#FEF4E6] border border-[#F4A340]/50 px-3.5 py-2.5 text-xs text-[#6B3F06] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#B56A10] shrink-0 mt-0.5" />
                      <span>
                        {language === 'bn'
                          ? 'যাচাই বাকি (Verification pending): স্থানীয় কাউন্টারের ঠিকানা ও সময় যাওয়ার আগে অফিসিয়াল পোর্টালে দেখে নিন।'
                          : 'Verification pending (local field check): Confirm exact ward/panchayat counter timings on the official portal before travelling.'}
                      </span>
                    </div>
                  )}

                  <div className="pt-1">
                    <p className="text-xs font-semibold text-[#5C5C58] mb-1.5">
                      {language === 'bn' ? 'প্রধান পরিষেবা:' : 'Services Available:'}
                    </p>
                    <ul className="space-y-1 text-xs sm:text-sm text-[#252525]">
                      {centre.servicesOffered.map((srv, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#176B4D] shrink-0 mt-1" />
                          <span>{srv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E3DC] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5C5C58]">
                    <span>
                      {language === 'bn' ? 'সূত্র:' : 'Source:'} {centre.sourceName}
                    </span>
                    <span>
                      {language === 'bn' ? 'যাচাই:' : 'Verified:'} {centre.dateVerified || centre.lastUpdated} ·{' '}
                      {language === 'bn' ? 'পর্যালোচনা:' : 'Review:'} {centre.expiryDate || '—'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {centre.officialPortalUrl && (
                      <a
                        href={centre.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackAnalyticsEvent('local_help_click', centre.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#11533B] text-white text-xs font-semibold transition-colors min-h-[40px]"
                      >
                        {language === 'bn' ? 'অফিসিয়াল পোর্টাল' : 'Official Portal'}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${centre.name.en} ${centre.locationArea} West Bengal`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackAnalyticsEvent('local_help_click', centre.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] hover:border-[#176B4D] text-[#252525] text-xs font-semibold min-h-[40px]"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#176B4D]" />
                      {language === 'bn' ? 'দিকনির্দেশ (Map)' : 'Directions'}
                    </a>
                    {(() => {
                      const phoneMatch = centre.publicContact.match(/\b(\d{4}|\+?\d[\d\s-]{8,13}\d)\b/);
                      if (!phoneMatch) return null;
                      const telNum = phoneMatch[1].replace(/[\s-]/g, '');
                      return (
                        <a
                          href={`tel:${telNum}`}
                          onClick={() => trackAnalyticsEvent('local_help_click', centre.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FEF4E6] border border-[#F4A340]/60 text-[#6B3F06] text-xs font-semibold min-h-[40px]"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {language === 'bn' ? `কল করুন (${telNum})` : `Call ${telNum}`}
                        </a>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={() =>
                        openReportModal({
                          targetType: 'assistance',
                          targetId: centre.id,
                          targetTitle: nameText,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs text-[#5C5C58] hover:text-red-700 ml-auto cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'ভুল তথ্য রিপোর্ট' : 'Report Update'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
