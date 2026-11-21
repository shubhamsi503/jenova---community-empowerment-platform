import React, { useState } from 'react';
import { ArrowLeft, Download, Printer, Share2, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../i18n/translations';
import { buildWhatsAppShareUrl } from '../lib/api';
import { PageHeader, SafetyNotice } from '../components/SharedUI';

export function BiodataBuilderPage() {
  const { language, navigate, showToast } = useApp();
  const [form, setForm] = useState({
    fullName: '',
    area: '',
    phone: '',
    email: '',
    targetRole: '',
    education: '',
    skills: '',
    experience: '',
    languages: 'Bengali, Hindi, Basic English',
  });

  const buildPlainText = () => {
    return [
      tr(language, 'বায়োডাটা / জীবনবৃত্তান্ত', 'बायोडाटा / रिज्यूमे', 'BIODATA / RESUME'),
      `${tr(language, 'নাম', 'नाम', 'Name')}: ${form.fullName || '—'}`,
      `${tr(language, 'ঠিকানা', 'स्थान', 'Location')}: ${form.area || '—'}`,
      `${tr(language, 'ফোন', 'फोन', 'Phone')}: ${form.phone || '—'}${
        form.email ? ` | ${tr(language, 'ইমেইল', 'ईमेल', 'Email')}: ${form.email}` : ''
      }`,
      ``,
      `${tr(language, 'পছন্দের কাজ', 'लक्षित पद', 'Job Role Looking For')}: ${form.targetRole || '—'}`,
      `${tr(language, 'শিক্ষাগত যোগ্যতা', 'शिक्षा', 'Education')}: ${form.education || '—'}`,
      `${tr(language, 'দক্ষতা', 'कौशल', 'Skills')}: ${form.skills || '—'}`,
      `${tr(language, 'কাজের অভিজ্ঞতা', 'कार्य अनुभव', 'Work Experience')}: ${
        form.experience ||
        tr(
          language,
          'ফ্রেশার — নতুন কাজ শিখতে আগ্রহী',
          'फ्रेशर — सीखने के लिए तैयार',
          'Fresher / Ready to learn'
        )
      }`,
      `${tr(language, 'জানা ভাষা', 'ज्ञात भाषाएं', 'Languages Known')}: ${form.languages || '—'}`,
      ``,
      tr(
        language,
        'JENOVA কমিউনিটি বায়োডাটা বিল্ডার দিয়ে তৈরি',
        'JENOVA सामुदायिक बायोडाटा बिल्डर से निर्मित',
        'Created with JENOVA Community Biodata Builder'
      ),
    ].join('\n');
  };

  const downloadTxt = () => {
    const blob = new Blob([buildPlainText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biodata-${(form.fullName || 'applicant').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      tr(language, 'বায়োডাটা ডাউনলোড হয়েছে!', 'बायोडाटा डाउनलोड हो गया!', 'Biodata downloaded!')
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="print:hidden">
        <button
          type="button"
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A85B0A] dark:text-[#FFD19A] hover:underline mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {tr(
            language,
            'কর্মসংস্থান পোর্টালে ফিরে যান',
            'रोजगार पोर्टल पर वापस जाएं',
            'Back to Employment Portal'
          )}
        </button>

        <PageHeader
          title={tr(
            language,
            '১-মিনিটে মোবাইল বায়োডাটা (CV) তৈরি করুন',
            '1-मिनट मोबाइल बायोडाटा (CV) निर्माता',
            '1-Minute Mobile Biodata (CV) Builder'
          )}
          subtitle={tr(
            language,
            'দোকান, অফিস বা কারিগরি কাজের জন্য পরিষ্কার বায়োডাটা তৈরি করুন — সরাসরি প্রিন্ট/PDF সেভ করুন বা হোয়াটসঅ্যাপে পাঠান।',
            'दुकान, ऑफिस, रिटेल या तकनीकी नौकरी के लिए अपने फोन पर साफ-सुथरा बायोडाटा बनाएं — प्रिंट/PDF सहेजें या व्हाट्सएप पर भेजें।',
            'Build a clean, practical biodata on your phone for local office, shop, retail, or technician roles. Print/Save as PDF or share via WhatsApp.'
          )}
        />

        <SafetyNotice
          message={tr(
            language,
            'সুরক্ষা পরামর্শ: বায়োডাটায় কখনোই আধার নম্বর, প্যান নম্বর বা ব্যাংক অ্যাকাউন্ট নম্বর দেবেন না। এই তথ্য আপনার ফোনের বাইরে কোথাও সেভ হয় না।',
            'गोपनीयता सलाह: नौकरी के बायोडाटा में कभी भी आधार, पैन या बैंक खाता संख्या न लिखें। आपका विवरण केवल आपके ब्राउज़र में रहता है।',
            'Privacy Tip: Never put Aadhaar, PAN, or bank account numbers on a job biodata. Everything you type stays only in your browser.'
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Form */}
        <div className="rounded-2xl bg-white border border-[#F2DCC1] p-6 space-y-4 print:hidden">
          <h2 className="font-bold text-base text-[#26364B] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A]" />
            {tr(
              language,
              'আপনার সাধারণ তথ্য লিখুন',
              'अपना बुनियादी विवरण दर्ज करें',
              'Enter Basic Job Details'
            )}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(language, 'সম্পূর্ণ নাম *', 'पूरा नाम *', 'Full Name *')}
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder={tr(
                  language,
                  'যেমন: অরিজিৎ মাইতি',
                  'जैसे: अरिजीत माइती',
                  'e.g. Arijit Maity'
                )}
                className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'মোবাইল নম্বর', 'मोबाइल नंबर', 'Phone Number')}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454545] mb-1">
                  {tr(language, 'ইমেইল (ঐচ্ছিক)', 'ईमेल (वैकल्पिक)', 'Email (Optional)')}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(language, 'এলাকা / গ্রাম / শহর', 'क्षेत्र / कस्बा / गांव', 'Area / Town / Village')}
              </label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder={tr(
                  language,
                  'যেমন: শহর, জেলা, রাজ্য',
                  'जैसे: शहर, जिला, राज्य',
                  'e.g. City, District, State'
                )}
                className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(
                  language,
                  'কোন কাজের জন্য আবেদন করছেন?',
                  'किस पद के लिए आवेदन कर रहे हैं?',
                  'Target Job Role'
                )}
              </label>
              <input
                type="text"
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                placeholder={tr(
                  language,
                  'যেমন: কম্পিউটার অপারেটর / রিটেইল স্টাফ / ইলেকট্রিশিয়ান',
                  'जैसे: कंप्यूटर ऑपरेटर / रिटेल स्टाफ / इलेक्ट्रिशियन',
                  'e.g. Computer Operator / Retail Associate / Electrician'
                )}
                className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(language, 'শিক্ষাগত যোগ্যতা', 'उच्चतम शिक्षा', 'Highest Education')}
              </label>
              <input
                type="text"
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                placeholder={tr(
                  language,
                  'যেমন: উচ্চ মাধ্যমিক (HS) পাস, ২০২৪ / আইটিআই ইলেকট্রিশিয়ান',
                  'जैसे: 12वीं पास (2024) / आईटीआई इलेक्ट्रिशियन',
                  'e.g. Higher Secondary (12th Pass, 2024) / ITI Electrician'
                )}
                className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(language, 'আপনার দক্ষতা (Skills)', 'मुख्य कौशल (Skills)', 'Key Skills')}
              </label>
              <textarea
                rows={2}
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder={tr(
                  language,
                  'যেমন: MS Excel, বাংলা ও ইংরেজি টাইপিং, বিলিং, কাস্টমার সার্ভিস',
                  'जैसे: MS Excel, टैली बेसिक्स, हिंदी व अंग्रेजी टाइपिंग, बिलिंग',
                  'e.g. MS Excel, Tally basics, Bengali & English typing, Customer billing'
                )}
                className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(
                  language,
                  'কাজের অভিজ্ঞতা (যদি থাকে)',
                  'कार्य अनुभव (या फ्रेशर)',
                  'Work Experience (or Fresher)'
                )}
              </label>
              <textarea
                rows={2}
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder={tr(
                  language,
                  'যেমন: ফ্রেশার — দ্রুত শেখার আগ্রহ আছে / স্থানীয় দোকানে ১ বছরের অভিজ্ঞতা',
                  'जैसे: फ्रेशर — सीखने को उत्सुक / स्थानीय दुकान पर 1 वर्ष का अनुभव',
                  'e.g. Fresher — eager to learn / 1 year experience at local retail counter'
                )}
                className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454545] mb-1">
                {tr(language, 'জানা ভাষা', 'ज्ञात भाषाएं', 'Languages Known')}
              </label>
              <input
                type="text"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                className="w-full rounded-xl border border-[#F2DCC1] bg-[#FFF1DF] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Clean Printable Live Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border-2 border-[#F4A340]/25 p-7 shadow-sm space-y-5 print:border-0 print:shadow-none">
            <div className="border-b-2 border-[#F4A340] pb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#A85B0A] dark:text-[#FFD19A]">
                {tr(
                  language,
                  'জীবনবৃত্তান্ত / বায়োডাটা',
                  'बायोडाटा / रिज्यूमे',
                  'CURRICULUM VITAE / BIODATA'
                )}
              </p>
              <h2 className="text-2xl font-bold text-[#26364B] mt-1">
                {form.fullName ||
                  tr(language, 'আপনার নাম এখানে দেখাবে', 'आपका पूरा नाम', 'Your Full Name')}
              </h2>
              {form.targetRole && (
                <p className="text-sm font-semibold text-[#A85B0A] dark:text-[#FFD19A] mt-0.5">{form.targetRole}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#454545]">
                {form.area && <span>{form.area}</span>}
                {form.phone && (
                  <span>
                    {tr(language, 'ফোন:', 'फोन:', 'Phone:')} {form.phone}
                  </span>
                )}
                {form.email && (
                  <span>
                    {tr(language, 'ইমেইল:', 'ईमेल:', 'Email:')} {form.email}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 text-sm text-[#26364B]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A85B0A] dark:text-[#FFD19A] mb-1">
                  {tr(language, 'শিক্ষাগত যোগ্যতা', 'शिक्षा', 'Education')}
                </h3>
                <p>{form.education || '—'}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A85B0A] dark:text-[#FFD19A] mb-1">
                  {tr(language, 'দক্ষতা ও যোগ্যতা', 'कौशल और क्षमताएं', 'Skills & Strengths')}
                </h3>
                <p className="whitespace-pre-line">{form.skills || '—'}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A85B0A] dark:text-[#FFD19A] mb-1">
                  {tr(language, 'কাজের অভিজ্ঞতা', 'कार्य अनुभव', 'Experience')}
                </h3>
                <p className="whitespace-pre-line">
                  {form.experience ||
                    tr(
                      language,
                      'ফ্রেশার — নিষ্ঠাবান, সময়নিষ্ঠ এবং নতুন কাজ শেখার জন্য প্রস্তুত।',
                      'फ्रेशर — समर्पित, समयनिष्ठ और काम सीखने के लिए तैयार।',
                      'Fresher — committed, punctual, and ready to learn on the job.'
                    )}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A85B0A] dark:text-[#FFD19A] mb-1">
                  {tr(language, 'জানা ভাষা', 'ज्ञात भाषाएं', 'Languages Known')}
                </h3>
                <p>{form.languages || '—'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl jenova-saffron-btn text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              {tr(language, 'প্রিন্ট / PDF সেভ করুন', 'प्रिंट / PDF सहेजें', 'Print / Save PDF')}
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#F2DCC1] hover:bg-[#FFE5C2] text-[#26364B] text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
              {tr(language, 'টেক্সট ডাউনলোড (.txt)', 'टेक्स्ट डाउनलोड (.txt)', 'Download .txt')}
            </button>
            <a
              href={buildWhatsAppShareUrl(
                `${form.fullName || tr(language, 'বায়োডাটা', 'बायोडाटा', 'Biodata')} — ${
                  form.targetRole || tr(language, 'চাকরির আবেদন', 'नौकरी आवेदन', 'Job Application')
                }`,
                buildPlainText(),
                '/jobs/biodata'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#F2DCC1] hover:bg-[#FFE5C2] text-[#26364B] text-xs sm:text-sm font-semibold min-h-[44px]"
            >
              <Share2 className="w-4 h-4 text-[#A85B0A] dark:text-[#FFD19A]" />
              {tr(language, 'হোয়াটসঅ্যাপে পাঠান', 'व्हाट्सएप पर भेजें', 'Share on WhatsApp')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
