import React, { useState } from 'react';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Info,
  Plus,
  Trash2,
  UserX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch, readOfflineCache, writeOfflineCache } from '../lib/api';
import { PageHeader, SafetyNotice } from '../components/SharedUI';

interface PersonalReminder {
  id: string;
  title: string;
  dueDate: string;
  note: string;
  done: boolean;
}

const TOPIC_OPTIONS = [
  { id: 'local_jobs', bn: 'স্থানীয় চাকরির সুযোগ', en: 'Verified Local Jobs', hi: 'स्थानीय नौकरी के अवसर' },
  { id: 'free_training', bn: 'বিনামূল্যে দক্ষতা প্রশিক্ষণ', en: 'Free Skill Training', hi: 'निःशुल्क कौशल प्रशिक्षण' },
  { id: 'welfare_schemes', bn: 'সরকারি প্রকল্প ও ভাতা', en: 'Government Welfare Schemes', hi: 'सरकारी योजनाएं' },
  { id: 'deadlines', bn: 'আবেদনের শেষ তারিখ', en: 'Application Deadlines', hi: 'आवेदन की अंतिम तिथि' },
  { id: 'fraud_warnings', bn: 'প্রতারণা সতর্কতা (Fraud Alerts)', en: 'Fraud & Scam Warnings', hi: 'धोखाधड़ी चेतावनी' },
  { id: 'local_help', bn: 'স্থানীয় সহায়তা ও ক্যাম্প আপডেট', en: 'Local Assistance Updates', hi: 'स्थानीय सहायता अपडेट' },
];

export function UpdatesRemindersPage() {
  const { language, showToast } = useApp();

  // Opt-in subscription state
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'web' | 'email' | 'whatsapp_ready'>('web');
  const [contactValue, setContactValue] = useState('');
  const [topics, setTopics] = useState<string[]>(['welfare_schemes', 'fraud_warnings']);
  const [frequency, setFrequency] = useState<'weekly' | 'urgent_only' | 'monthly'>('weekly');
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subResult, setSubResult] = useState<{
    deliveryStatus: string;
  } | null>(null);
  const [subError, setSubError] = useState<string | null>(null);

  // Unsubscribe state
  const [unsubContact, setUnsubContact] = useState('');
  const [unsubMsg, setUnsubMsg] = useState<string | null>(null);

  // Personal offline reminders (stored strictly on user's own device)
  const [reminders, setReminders] = useState<PersonalReminder[]>(() =>
    readOfflineCache<PersonalReminder[]>('personal_reminders', [
      {
        id: 'rem-sample-1',
        title:
          language === 'bn'
            ? 'ব্যাংক পাশবইতে Aadhaar DBT লিঙ্ক আছে কিনা যাচাই'
            : 'Verify Bank Passbook Aadhaar DBT Seeding',
        dueDate: '',
        note:
          language === 'bn'
            ? 'আবেদনের আগে নিজের ব্যাংকে গিয়ে স্ট্যাটাস জেনে নিন।'
            : 'Check with your bank branch before submitting any scheme form.',
        done: false,
      },
    ])
  );
  const [remTitle, setRemTitle] = useState('');
  const [remDate, setRemDate] = useState('');
  const [remNote, setRemNote] = useState('');

  const toggleTopic = (id: string) => {
    setTopics((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError(null);
    setSubResult(null);

    if (!consentGiven) {
      setSubError(
        language === 'bn'
          ? 'এগিয়ে যেতে অনুগ্রহ করে স্পষ্ট সম্মতির ঘরে টিক দিন।'
          : 'Please check the explicit consent box before subscribing.'
      );
      return;
    }
    if (topics.length === 0) {
      setSubError(
        language === 'bn'
          ? 'অন্তত একটি বিষয় বেছে নিন।'
          : 'Please select at least one update topic.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<{
        deliveryStatus: string;
      }>('/api/updates/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim() || 'Community Member',
          channel,
          contactValue: contactValue.trim() || 'in-app-web',
          topics,
          frequency,
          consentGiven,
        }),
      });
      setSubResult({ deliveryStatus: res.deliveryStatus });
      showToast(language === 'bn' ? 'আপডেট পছন্দ সংরক্ষিত হয়েছে!' : 'Update preferences saved!');
    } catch (err) {
      setSubError(err instanceof Error ? err.message : 'Unable to save subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unsubContact.trim()) return;
    setUnsubMsg(null);
    try {
      const res = await apiFetch<{ unsubscribedCount: number }>('/api/updates/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ contactValue: unsubContact.trim() }),
      });
      setUnsubMsg(
        res.unsubscribedCount > 0
          ? language === 'bn'
            ? 'সফলভাবে আনসাবস্ক্রাইব করা হয়েছে। আর কোনো আপডেট পাঠানো হবে না।'
            : 'Successfully unsubscribed. You will no longer receive updates.'
          : language === 'bn'
            ? 'এই নম্বরে বা ইমেইলে কোনো সক্রিয় সাবস্ক্রিপশন পাওয়া যায়নি।'
            : 'No active subscription found for that contact.'
      );
      setUnsubContact('');
    } catch (err) {
      setUnsubMsg(err instanceof Error ? err.message : 'Failed to unsubscribe.');
    }
  };

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;
    const next: PersonalReminder[] = [
      {
        id: `rem-${Date.now()}`,
        title: remTitle.trim(),
        dueDate: remDate,
        note: remNote.trim(),
        done: false,
      },
      ...reminders,
    ];
    setReminders(next);
    writeOfflineCache('personal_reminders', next);
    setRemTitle('');
    setRemDate('');
    setRemNote('');
  };

  const toggleReminderDone = (id: string) => {
    const next = reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r));
    setReminders(next);
    writeOfflineCache('personal_reminders', next);
  };

  const removeReminder = (id: string) => {
    const next = reminders.filter((r) => r.id !== id);
    setReminders(next);
    writeOfflineCache('personal_reminders', next);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title={
          language === 'bn'
            ? 'কমিউনিটি আপডেট ও ব্যক্তিগত রিমাইন্ডার'
            : language === 'hi'
              ? 'सामुदायिक अपडेट और व्यक्तिगत रिमाइंडर'
              : 'Consent-Based Community Updates & Personal Reminders'
        }
        subtitle={
          language === 'bn'
            ? 'আপনার অনুমতি ছাড়া কোনো মেসেজ পাঠানো হয় না। নিজের পছন্দের বিষয় বেছে নিন, যেকোনো সময় আনসাবস্ক্রাইব করুন এবং ফোনে অফলাইন রিমাইন্ডার সেভ রাখুন।'
            : 'Opt in only to the local updates you want, control frequency, unsubscribe in one click, and keep private offline deadline reminders on your own device.'
        }
      />

      <SafetyNotice
        message={
          language === 'bn'
            ? 'স্বচ্ছতা বার্তা: WhatsApp Business API ও ইমেইল ডেলিভারি বর্তমানে ইন্টিগ্রেশন-রেডি অবস্থায় রয়েছে। আমরা কখনোই আপনার নম্বর তৃতীয় পক্ষের কাছে বিক্রি করি না এবং কখনোই OTP বা টাকা চাই না।'
            : 'Honest Integration Status: WhatsApp Business API and automated SMTP email dispatch are integration-ready and await production API credentials. Preferences are stored securely with full consent logging.'
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consent-Based Updates Form */}
        <section className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#176B4D]" />
            <h2 className="text-lg font-bold text-[#252525]">
              {language === 'bn' ? 'সাপ্তাহিক কমিউনিটি আপডেট (ঐচ্ছিক)' : 'Opt-In Community Updates'}
            </h2>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                {language === 'bn' ? 'আপনার নাম (ঐচ্ছিক)' : 'Your Name (Optional)'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: সুমনা দাস' : 'e.g. Sumana Das'}
                className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1.5">
                {language === 'bn' ? 'কোন মাধ্যমে আপডেট চান?' : 'Preferred Channel'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: 'web', bn: 'ওয়েবসাইট (সক্রিয়)', en: 'Website Feed (Active)' },
                    { id: 'email', bn: 'ইমেইল (রেডি)', en: 'Email (Ready)' },
                    { id: 'whatsapp_ready', bn: 'হোয়াটসঅ্যাপ (API বাকি)', en: 'WhatsApp (API Pending)' },
                  ] as const
                ).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      channel === ch.id
                        ? 'bg-[#176B4D] text-white border-[#176B4D]'
                        : 'bg-[#FAF9F5] text-[#252525] border-[#E5E3DC]'
                    }`}
                  >
                    {language === 'bn' ? ch.bn : ch.en}
                  </button>
                ))}
              </div>
            </div>

            {channel !== 'web' && (
              <div>
                <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                  {channel === 'email'
                    ? language === 'bn'
                      ? 'আপনার ইমেইল ঠিকানা'
                      : 'Email Address'
                    : language === 'bn'
                      ? 'হোয়াটসঅ্যাপ নম্বর (১০ সংখ্যা)'
                      : 'WhatsApp Number (10 digits)'}
                </label>
                <input
                  type={channel === 'email' ? 'email' : 'tel'}
                  required
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={channel === 'email' ? 'name@example.com' : '98XXXXXXXX'}
                  className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-2">
                {language === 'bn' ? 'কোন বিষয়ের খবর পেতে চান?' : 'Topics of Interest'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOPIC_OPTIONS.map((topic) => {
                  const checked = topics.includes(topic.id);
                  return (
                    <label
                      key={topic.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${
                        checked
                          ? 'bg-[#EBF4F0] border-[#176B4D]/40 text-[#0F4D37] font-semibold'
                          : 'bg-[#FAF9F5] border-[#E5E3DC] text-[#252525]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTopic(topic.id)}
                        className="accent-[#176B4D]"
                      />
                      <span>{language === 'bn' ? topic.bn : language === 'hi' ? topic.hi : topic.en}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                {language === 'bn' ? 'কত ঘন ঘন আপডেট চান?' : 'Update Frequency'}
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as 'weekly' | 'urgent_only' | 'monthly')
                }
                className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
              >
                <option value="weekly">
                  {language === 'bn' ? 'সাপ্তাহিক সংক্ষিপ্ত তালিকা (প্রস্তাবিত)' : 'Weekly Digest (Recommended)'}
                </option>
                <option value="urgent_only">
                  {language === 'bn' ? 'শুধু জরুরি সতর্কতা ও শেষ তারিখ' : 'Urgent Fraud Warnings & Deadlines Only'}
                </option>
                <option value="monthly">
                  {language === 'bn' ? 'মাসিক সারাংশ' : 'Monthly Summary'}
                </option>
              </select>
            </div>

            <label className="flex items-start gap-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] p-3.5 text-xs text-[#252525] cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 accent-[#176B4D]"
              />
              <span>
                {language === 'bn'
                  ? 'আমি স্বেচ্ছায় JENOVA থেকে নির্বাচিত বিষয়ের তথ্যমূলক আপডেট পাওয়ার সম্মতি দিচ্ছি এবং জানি যে আমি যেকোনো সময় আনসাবস্ক্রাইব করতে পারব।'
                  : 'I explicitly consent to receive selected informational community updates from JENOVA and understand I can unsubscribe at any time.'}
              </span>
            </label>

            {subError && <p className="text-xs font-medium text-red-700">{subError}</p>}

            {subResult && (
              <div className="rounded-xl bg-[#EBF4F0] border border-[#176B4D]/40 p-4 text-xs text-[#0F4D37] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'bn' ? 'আপনার পছন্দ সংরক্ষিত হয়েছে!' : 'Subscription Saved!'}
                </p>
                <p className="flex items-start gap-1.5 pt-0.5 leading-relaxed">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{subResult.deliveryStatus}</span>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#176B4D] hover:bg-[#11533B] text-white font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer min-h-[46px]"
            >
              {submitting
                ? language === 'bn'
                  ? 'সংরক্ষণ হচ্ছে...'
                  : 'Saving...'
                : language === 'bn'
                  ? 'সম্মতিসহ আপডেট চালু করুন'
                  : 'Save Update Preferences'}
            </button>
          </form>

          {/* Unsubscribe Box */}
          <div className="pt-4 border-t border-[#E5E3DC] space-y-2.5">
            <h3 className="text-sm font-bold text-[#252525] flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-[#5C5C58]" />
              {language === 'bn' ? 'এক ক্লিকে আনসাবস্ক্রাইব করুন' : 'One-Click Unsubscribe'}
            </h3>
            <form onSubmit={handleUnsubscribe} className="flex gap-2">
              <input
                type="text"
                value={unsubContact}
                onChange={(e) => setUnsubContact(e.target.value)}
                placeholder={
                  language === 'bn' ? 'ইমেইল বা ফোন নম্বর লিখুন' : 'Enter subscribed email or phone'
                }
                className="flex-1 rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3 py-2 text-xs sm:text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl border border-[#D8D5CC] text-xs font-semibold text-[#252525] hover:bg-[#F5F4EF] cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Unsubscribe'}
              </button>
            </form>
            {unsubMsg && <p className="text-xs text-[#176B4D] font-medium">{unsubMsg}</p>}
          </div>
        </section>

        {/* Offline Personal Deadline Reminders */}
        <section className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="w-5 h-5 text-[#176B4D]" />
            <div>
              <h2 className="text-lg font-bold text-[#252525]">
                {language === 'bn'
                  ? 'আমার ব্যক্তিগত রিমাইন্ডার (অফলাইন)'
                  : 'Personal Deadline Reminders (Offline)'}
              </h2>
              <p className="text-xs text-[#5C5C58]">
                {language === 'bn'
                  ? 'এগুলি কেবল আপনার নিজের ফোনেই সেভ থাকে — সার্ভার বা অন্য কারো কাছে যায় না।'
                  : 'Stored privately on your browser/phone — works offline with zero server tracking.'}
              </p>
            </div>
          </div>

          <form onSubmit={addReminder} className="space-y-3 bg-[#FAF9F5] p-4 rounded-xl border border-[#E5E3DC]">
            <input
              type="text"
              required
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'রিমাইন্ডার লিখুন (যেমন: BSK-তে অন্নপূর্ণা যোজনা ফর্ম জমা)'
                  : 'Reminder title (e.g. Visit BSK for scholarship renewal)'
              }
              className="w-full rounded-lg border border-[#D8D5CC] bg-white px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="date"
                value={remDate}
                onChange={(e) => setRemDate(e.target.value)}
                className="rounded-lg border border-[#D8D5CC] bg-white px-3 py-2 text-xs sm:text-sm"
              />
              <input
                type="text"
                value={remNote}
                onChange={(e) => setRemNote(e.target.value)}
                placeholder={language === 'bn' ? 'ছোট নোট (ঐচ্ছিক)' : 'Short note (optional)'}
                className="rounded-lg border border-[#D8D5CC] bg-white px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#176B4D] hover:bg-[#11533B] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'রিমাইন্ডার যোগ করুন' : 'Add Personal Reminder'}
            </button>
          </form>

          <div className="space-y-2.5">
            {reminders.length === 0 ? (
              <p className="text-xs text-[#5C5C58] text-center py-6">
                {language === 'bn'
                  ? 'কোনো ব্যক্তিগত রিমাইন্ডার নেই।'
                  : 'No personal reminders added yet.'}
              </p>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 ${
                    rem.done
                      ? 'bg-[#EBF4F0]/50 border-[#176B4D]/30 opacity-80'
                      : 'bg-white border-[#E5E3DC]'
                  }`}
                >
                  <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={rem.done}
                      onChange={() => toggleReminderDone(rem.id)}
                      className="mt-1 accent-[#176B4D]"
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          rem.done ? 'line-through text-[#5C5C58]' : 'text-[#252525]'
                        }`}
                      >
                        {rem.title}
                      </p>
                      {rem.dueDate && (
                        <p className="text-xs text-[#176B4D] font-medium mt-0.5">{rem.dueDate}</p>
                      )}
                      {rem.note && <p className="text-xs text-[#5C5C58] mt-0.5">{rem.note}</p>}
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeReminder(rem.id)}
                    aria-label="Delete reminder"
                    className="p-1.5 text-[#5C5C58] hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
