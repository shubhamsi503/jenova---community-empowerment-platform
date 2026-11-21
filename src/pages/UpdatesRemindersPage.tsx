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
import { tr } from '../i18n/translations';
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
  { id: 'fraud_warnings', bn: 'প্রতারণা সতর্কতা', en: 'Fraud & Scam Warnings', hi: 'धोखाधड़ी चेतावनी' },
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
        title: '__SAMPLE_DBT_TITLE__',
        dueDate: '',
        note: '__SAMPLE_DBT_NOTE__',
        done: false,
      },
    ])
  );
  const [remTitle, setRemTitle] = useState('');
  const [remDate, setRemDate] = useState('');
  const [remNote, setRemNote] = useState('');

  const renderReminderText = (text: string) => {
    if (text === '__SAMPLE_DBT_TITLE__') {
      return tr(
        language,
        'ব্যাংক পাশবইতে Aadhaar DBT লিঙ্ক আছে কিনা যাচাই',
        'बैंक पासबुक में आधार DBT सीडिंग की जांच करें',
        'Verify Bank Passbook Aadhaar DBT Seeding'
      );
    }
    if (text === '__SAMPLE_DBT_NOTE__') {
      return tr(
        language,
        'আবেদনের আগে নিজের ব্যাংকে গিয়ে স্ট্যাটাস জেনে নিন।',
        'किसी भी योजना का फॉर्म जमा करने से पहले अपनी बैंक शाखा से पुष्टि करें।',
        'Check with your bank branch before submitting any scheme form.'
      );
    }
    return text;
  };

  const toggleTopic = (id: string) => {
    setTopics((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError(null);
    setSubResult(null);

    if (!consentGiven) {
      setSubError(
        tr(
          language,
          'এগিয়ে যেতে অনুগ্রহ করে স্পষ্ট সম্মতির ঘরে টিক দিন।',
          'आगे बढ़ने के लिए कृपया स्पष्ट सहमति बॉक्स पर टिक करें।',
          'Please check the explicit consent box before subscribing.'
        )
      );
      return;
    }
    if (topics.length === 0) {
      setSubError(
        tr(
          language,
          'অন্তত একটি বিষয় বেছে নিন।',
          'कृपया कम से कम एक विषय चुनें।',
          'Please select at least one update topic.'
        )
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
      showToast(
        tr(language, 'আপডেট পছন্দ সংরক্ষিত হয়েছে!', 'अपडेट प्राथमिकताएं सेव हो गईं!', 'Update preferences saved!')
      );
    } catch (err) {
      setSubError(
        err instanceof Error
          ? err.message
          : tr(language, 'সাবস্ক্রিপশন সংরক্ষণ করা যায়নি।', 'सदस्यता सेव नहीं हो सकी।', 'Unable to save subscription.')
      );
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
          ? tr(
              language,
              'সফলভাবে আনসাবস্ক্রাইব করা হয়েছে। আর কোনো আপডেট পাঠানো হবে না।',
              'सफलतापूर्वक अनसब्सक्राइब हो गया है। अब आपको कोई अपडेट नहीं भेजा जाएगा।',
              'Successfully unsubscribed. You will no longer receive updates.'
            )
          : tr(
              language,
              'এই নম্বরে বা ইমেইলে কোনো সক্রিয় সাবস্ক্রিপশন পাওয়া যায়নি।',
              'इस ईमेल या फ़ोन नंबर के लिए कोई सक्रिय सदस्यता नहीं मिली।',
              'No active subscription found for that contact.'
            )
      );
      setUnsubContact('');
    } catch (err) {
      setUnsubMsg(
        err instanceof Error
          ? err.message
          : tr(language, 'আনসাবস্ক্রাইব ব্যর্থ হয়েছে।', 'अनसब्सक्राइब विफल रहा।', 'Failed to unsubscribe.')
      );
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
        title={tr(
          language,
          'কমিউনিটি আপডেট ও ব্যক্তিগত রিমাইন্ডার',
          'सामुदायिक अपडेट और व्यक्तिगत रिमाइंडर',
          'Consent-Based Community Updates & Personal Reminders'
        )}
        subtitle={tr(
          language,
          'আপনার অনুমতি ছাড়া কোনো মেসেজ পাঠানো হয় না। নিজের পছন্দের বিষয় বেছে নিন, যেকোনো সময় আনসাবস্ক্রাইব করুন এবং ফোনে অফলাইন রিমাইন্ডার সেভ রাখুন।',
          'केवल अपनी पसंद के स्थानीय अपडेट चुनें, आवृत्ति नियंत्रित करें, एक क्लिक में अनसब्सक्राइब करें और अपने डिवाइस पर निजी ऑफलाइन रिमाइंडर सेव रखें।',
          'Opt in only to the local updates you want, control frequency, unsubscribe in one click, and keep private offline deadline reminders on your own device.'
        )}
      />

      <SafetyNotice
        message={tr(
          language,
          'স্বচ্ছতা বার্তা: WhatsApp Business API ও ইমেইল ডেলিভারি বর্তমানে ইন্টিগ্রেশন-রেডি অবস্থায় রয়েছে। আমরা কখনোই আপনার নম্বর তৃতীয় পক্ষের কাছে বিক্রি করি না এবং কখনোই OTP বা টাকা চাই না।',
          'पारदर्शिता संदेश: WhatsApp Business API और स्वचालित ईमेल डिलीवरी वर्तमान में इंटीग्रेशन-रेडी हैं। हम कभी आपका नंबर किसी तीसरे पक्ष को नहीं बेचते और न ही कभी OTP या पैसे मांगते हैं।',
          'Honest Integration Status: WhatsApp Business API and automated SMTP email dispatch are integration-ready and await production API credentials. Preferences are stored securely with full consent logging.'
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consent-Based Updates Form */}
        <section className="rounded-2xl bg-white border border-[#F2DCC1] p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A]" />
            <h2 className="text-lg font-bold text-[#26364B]">
              {tr(language, 'সাপ্তাহিক কমিউনিটি আপডেট (ঐচ্ছিক)', 'ऐच्छिक सामुदायिक अपडेट', 'Opt-In Community Updates')}
            </h2>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(language, 'আপনার নাম (ঐচ্ছিক)', 'आपका नाम (वैकल्पिक)', 'Your Name (Optional)')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tr(language, 'যেমন: সুমনা দাস', 'जैसे: सुमन दास', 'e.g. Sumana Das')}
                className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1.5">
                {tr(language, 'কোন মাধ্যমে আপডেট চান?', 'अपडेट का पसंदीदा माध्यम', 'Preferred Channel')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: 'web', bn: 'ওয়েবসাইট (সক্রিয়)', hi: 'वेबसाइट फ़ीड (सक्रिय)', en: 'Website Feed (Active)' },
                    { id: 'email', bn: 'ইমেইল (রেডি)', hi: 'ईमेल (रेडी)', en: 'Email (Ready)' },
                    { id: 'whatsapp_ready', bn: 'হোয়াটসঅ্যাপ (API বাকি)', hi: 'व्हाट्सएप (API शेष)', en: 'WhatsApp (API Pending)' },
                  ] as const
                ).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      channel === ch.id
                        ? 'jenova-saffron-btn border-[#E69228]'
                        : 'bg-[#FFF1DF] text-[#26364B] border-[#F2DCC1]'
                    }`}
                  >
                    {tr(language, ch.bn, ch.hi, ch.en)}
                  </button>
                ))}
              </div>
            </div>

            {channel !== 'web' && (
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {channel === 'email'
                    ? tr(language, 'আপনার ইমেইল ঠিকানা', 'आपका ईमेल पता', 'Email Address')
                    : tr(language, 'হোয়াটসঅ্যাপ নম্বর (১০ সংখ্যা)', 'व्हाट्सएप नंबर (10 अंक)', 'WhatsApp Number (10 digits)')}
                </label>
                <input
                  type={channel === 'email' ? 'email' : 'tel'}
                  required
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={channel === 'email' ? 'name@example.com' : '98XXXXXXXX'}
                  className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-2">
                {tr(language, 'কোন বিষয়ের খবর পেতে চান?', 'रुचि के विषय चुनें', 'Topics of Interest')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOPIC_OPTIONS.map((topic) => {
                  const checked = topics.includes(topic.id);
                  return (
                    <label
                      key={topic.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${
                        checked
                          ? 'bg-[#FFE5C2] border-[#F4A340]/40 text-[#26364B] dark:text-[#FFD19A] font-semibold'
                          : 'bg-[#FFF1DF] border-[#F2DCC1] text-[#26364B]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTopic(topic.id)}
                        className="accent-[#F4A340]"
                      />
                      <span>{tr(language, topic.bn, topic.hi, topic.en)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(language, 'কত ঘন ঘন আপডেট চান?', 'अपडेट की आवृत्ति', 'Update Frequency')}
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as 'weekly' | 'urgent_only' | 'monthly')
                }
                className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
              >
                <option value="weekly">
                  {tr(language, 'সাপ্তাহিক সংক্ষিপ্ত তালিকা (প্রস্তাবিত)', 'साप्ताहिक सारांश (अनुशंसित)', 'Weekly Digest (Recommended)')}
                </option>
                <option value="urgent_only">
                  {tr(language, 'শুধু জরুরি সতর্কতা ও শেষ তারিখ', 'केवल जरूरी धोखाधड़ी अलर्ट और अंतिम तिथि', 'Urgent Fraud Warnings & Deadlines Only')}
                </option>
                <option value="monthly">
                  {tr(language, 'মাসিক সারাংশ', 'मासिक सारांश', 'Monthly Summary')}
                </option>
              </select>
            </div>

            <label className="flex items-start gap-2.5 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1] p-3.5 text-xs text-[#26364B] cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 accent-[#F4A340]"
              />
              <span>
                {tr(
                  language,
                  'আমি স্বেচ্ছায় JENOVA থেকে নির্বাচিত বিষয়ের তথ্যমূলক আপডেট পাওয়ার সম্মতি দিচ্ছি এবং জানি যে আমি যেকোনো সময় আনসাবস্ক্রাইব করতে পারব।',
                  'मैं स्वेच्छा से JENOVA से चुने गए विषयों के सूचनात्मक सामुदायिक अपडेट प्राप्त करने की सहमति देता/देती हूँ और जानता/जानती हूँ कि मैं कभी भी अनसब्सक्राइब कर सकता/सकती हूँ।',
                  'I explicitly consent to receive selected informational community updates from JENOVA and understand I can unsubscribe at any time.'
                )}
              </span>
            </label>

            {subError && <p className="text-xs font-medium text-red-700">{subError}</p>}

            {subResult && (
              <div className="rounded-xl bg-[#FFE5C2] border border-[#F4A340]/40 p-4 text-xs text-[#26364B] dark:text-[#FFD19A] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {tr(language, 'আপনার পছন্দ সংরক্ষিত হয়েছে!', 'आपकी प्राथमिकताएं सेव हो गई हैं!', 'Subscription Saved!')}
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
              className="w-full py-3 rounded-xl jenova-saffron-btn font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer min-h-[46px]"
            >
              {submitting
                ? tr(language, 'সংরক্ষণ হচ্ছে...', 'सेव हो रहा है...', 'Saving...')
                : tr(language, 'সম্মতিসহ আপডেট চালু করুন', 'सहमति के साथ अपडेट सेव करें', 'Save Update Preferences')}
            </button>
          </form>

          {/* Unsubscribe Box */}
          <div className="pt-4 border-t border-[#F2DCC1] space-y-2.5">
            <h3 className="text-sm font-bold text-[#26364B] flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-[#454545]" />
              {tr(language, 'এক ক্লিকে আনসাবস্ক্রাইব করুন', 'एक क्लिक में अनसब्सक्राइब करें', 'One-Click Unsubscribe')}
            </h3>
            <form onSubmit={handleUnsubscribe} className="flex gap-2">
              <input
                type="text"
                value={unsubContact}
                onChange={(e) => setUnsubContact(e.target.value)}
                placeholder={tr(language, 'ইমেইল বা ফোন নম্বর লিখুন', 'अपना ईमेल या फ़ोन नंबर लिखें', 'Enter subscribed email or phone')}
                className="flex-1 rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3 py-2 text-xs sm:text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl border border-[#F2DCC1] text-xs font-semibold text-[#26364B] hover:bg-[#FFF1DF] cursor-pointer"
              >
                {tr(language, 'বন্ধ করুন', 'बंद करें', 'Unsubscribe')}
              </button>
            </form>
            {unsubMsg && <p className="text-xs text-[#A85B0A] dark:text-[#FFD19A] font-medium">{unsubMsg}</p>}
          </div>
        </section>

        {/* Offline Personal Deadline Reminders */}
        <section className="rounded-2xl bg-white border border-[#F2DCC1] p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A]" />
            <div>
              <h2 className="text-lg font-bold text-[#26364B]">
                {tr(
                  language,
                  'আমার ব্যক্তিগত রিমাইন্ডার (অফলাইন)',
                  'व्यक्तिगत रिमाइंडर (ऑफलाइन)',
                  'Personal Deadline Reminders (Offline)'
                )}
              </h2>
              <p className="text-xs text-[#454545]">
                {tr(
                  language,
                  'এগুলি কেবল আপনার নিজের ফোনেই সেভ থাকে — সার্ভার বা অন্য কারো কাছে যায় না।',
                  'ये केवल आपके अपने डिवाइस/ब्राउज़र में निजी रूप से सेव रहते हैं — ऑफलाइन भी काम करते हैं।',
                  'Stored privately on your browser/phone — works offline with zero server tracking.'
                )}
              </p>
            </div>
          </div>

          <form onSubmit={addReminder} className="space-y-3 bg-[#FFF1DF] p-4 rounded-xl border border-[#F2DCC1]">
            <input
              type="text"
              required
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              placeholder={tr(
                language,
                'রিমাইন্ডার লিখুন (যেমন: BSK-তে অন্নপূর্ণা যোজনা ফর্ম জমা)',
                'रिमाइंडर लिखें (जैसे: छात्रवृत्ति नवीनीकरण के लिए BSK जाना)',
                'Reminder title (e.g. Visit BSK for scholarship renewal)'
              )}
              className="w-full rounded-lg border border-[#F2DCC1] bg-white px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="date"
                value={remDate}
                onChange={(e) => setRemDate(e.target.value)}
                className="rounded-lg border border-[#F2DCC1] bg-white px-3 py-2 text-xs sm:text-sm"
              />
              <input
                type="text"
                value={remNote}
                onChange={(e) => setRemNote(e.target.value)}
                placeholder={tr(language, 'ছোট নোট (ঐচ্ছিক)', 'संक्षिप्त नोट (वैकल्पिक)', 'Short note (optional)')}
                className="rounded-lg border border-[#F2DCC1] bg-white px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg jenova-saffron-btn text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {tr(language, 'রিমাইন্ডার যোগ করুন', 'व्यक्तिगत रिमाइंडर जोड़ें', 'Add Personal Reminder')}
            </button>
          </form>

          <div className="space-y-2.5">
            {reminders.length === 0 ? (
              <p className="text-xs text-[#454545] text-center py-6">
                {tr(language, 'কোনো ব্যক্তিগত রিমাইন্ডার নেই।', 'अभी तक कोई व्यक्तिगत रिमाइंडर नहीं जोड़ा गया है।', 'No personal reminders added yet.')}
              </p>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 ${
                    rem.done
                      ? 'bg-[#FFE5C2]/50 border-[#F4A340]/30 opacity-80'
                      : 'bg-white border-[#F2DCC1]'
                  }`}
                >
                  <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={rem.done}
                      onChange={() => toggleReminderDone(rem.id)}
                      className="mt-1 accent-[#F4A340]"
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          rem.done ? 'line-through text-[#454545]' : 'text-[#26364B]'
                        }`}
                      >
                        {renderReminderText(rem.title)}
                      </p>
                      {rem.dueDate && (
                        <p className="text-xs text-[#A85B0A] dark:text-[#FFD19A] font-medium mt-0.5">{rem.dueDate}</p>
                      )}
                      {rem.note && (
                        <p className="text-xs text-[#454545] mt-0.5">{renderReminderText(rem.note)}</p>
                      )}
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeReminder(rem.id)}
                    aria-label={tr(language, 'রিমাইন্ডার মুছুন', 'रिमाइंडर हटाएं', 'Delete reminder')}
                    className="p-1.5 text-[#454545] hover:text-red-700 cursor-pointer"
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
