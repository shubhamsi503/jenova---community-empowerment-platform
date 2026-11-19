import React, { useState } from 'react';
import { ArrowLeft, Download, Printer, Share2, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsAppShareUrl } from '../lib/api';
import { PageHeader, SafetyNotice } from '../components/SharedUI';

export function BiodataBuilderPage() {
  const { language, navigate, showToast } = useApp();
  const [form, setForm] = useState({
    fullName: '',
    area: 'Mecheda, Purba Medinipur, West Bengal',
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
      `BIODATA / RESUME`,
      `Name: ${form.fullName || '—'}`,
      `Location: ${form.area || '—'}`,
      `Phone: ${form.phone || '—'}${form.email ? ` | Email: ${form.email}` : ''}`,
      ``,
      `Job Role Looking For: ${form.targetRole || '—'}`,
      `Education: ${form.education || '—'}`,
      `Skills: ${form.skills || '—'}`,
      `Work Experience: ${form.experience || 'Fresher / Ready to learn'}`,
      `Languages Known: ${form.languages || '—'}`,
      ``,
      `Created with JENOVA Community Biodata Builder`,
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
    showToast(language === 'bn' ? 'বায়োডাটা ডাউনলোড হয়েছে!' : 'Biodata downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="print:hidden">
        <button
          type="button"
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#176B4D] hover:underline mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'bn' ? 'কর্মসংস্থান পোর্টালে ফিরে যান' : 'Back to Employment Portal'}
        </button>

        <PageHeader
          title={
            language === 'bn'
              ? '১-মিনিটে মোবাইল বায়োডাটা (CV) তৈরি করুন'
              : language === 'hi'
                ? '1-मिनट मोबाइल बायोडाटा (CV) निर्माता'
                : '1-Minute Mobile Biodata (CV) Builder'
          }
          subtitle={
            language === 'bn'
              ? 'দোকান, অফিস বা কারিগরি কাজের জন্য পরিষ্কার বায়োডাটা তৈরি করুন — সরাসরি প্রিন্ট/PDF সেভ করুন বা হোয়াটসঅ্যাপে পাঠান।'
              : 'Build a clean, practical biodata on your phone for local office, shop, retail, or technician roles. Print/Save as PDF or share via WhatsApp.'
          }
        />

        <SafetyNotice
          message={
            language === 'bn'
              ? 'সুরক্ষা পরামর্শ: বায়োডাটায় কখনোই আধার নম্বর, প্যান নম্বর বা ব্যাংক অ্যাকাউন্ট নম্বর দেবেন না। এই তথ্য আপনার ফোনের বাইরে কোথাও সেভ হয় না।'
              : 'Privacy Tip: Never put Aadhaar, PAN, or bank account numbers on a job biodata. Everything you type stays only in your browser.'
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Form */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-4 print:hidden">
          <h2 className="font-bold text-base text-[#252525] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#176B4D]" />
            {language === 'bn' ? 'আপনার সাধারণ তথ্য লিখুন' : 'Enter Basic Job Details'}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                {language === 'bn' ? 'সম্পূর্ণ নাম *' : 'Full Name *'}
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder={language === 'bn' ? 'যেমন: অরিজিৎ মাইতি' : 'e.g. Arijit Maity'}
                className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                  {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                {language === 'bn' ? 'এলাকা / গ্রাম / শহর' : 'Area / Town / Village'}
              </label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                {language === 'bn' ? 'কোন কাজের জন্য আবেদন করছেন?' : 'Target Job Role'}
              </label>
              <input
                type="text"
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: কম্পিউটার অপারেটর / রিটেইল স্টাফ / ইলেকট্রিশিয়ান'
                    : 'e.g. Computer Operator / Retail Associate / Electrician'
                }
                className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                {language === 'bn' ? 'শিক্ষাগত যোগ্যতা' : 'Highest Education'}
              </label>
              <input
                type="text"
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: উচ্চ মাধ্যমিক (HS) পাস, ২০২৪ / আইটিআই ইলেকট্রিশিয়ান'
                    : 'e.g. Higher Secondary (12th Pass, 2024) / ITI Electrician'
                }
                className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                {language === 'bn' ? 'আপনার দক্ষতা (Skills)' : 'Key Skills'}
              </label>
              <textarea
                rows={2}
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: MS Excel, বাংলা ও ইংরেজি টাইপিং, বিলিং, কাস্টমার সার্ভিস'
                    : 'e.g. MS Excel, Tally basics, Bengali & English typing, Customer billing'
                }
                className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                {language === 'bn' ? 'কাজের অভিজ্ঞতা (যদি থাকে)' : 'Work Experience (or Fresher)'}
              </label>
              <textarea
                rows={2}
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: ফ্রেশার — দ্রুত শেখার আগ্রহ আছে / স্থানীয় দোকানে ১ বছরের অভিজ্ঞতা'
                    : 'e.g. Fresher — eager to learn / 1 year experience at local retail counter'
                }
                className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5C58] mb-1">
                {language === 'bn' ? 'জানা ভাষা' : 'Languages Known'}
              </label>
              <input
                type="text"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                className="w-full rounded-xl border border-[#D8D5CC] bg-[#FAF9F5] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Clean Printable Live Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border-2 border-[#176B4D]/25 p-7 shadow-sm space-y-5 print:border-0 print:shadow-none">
            <div className="border-b-2 border-[#176B4D] pb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#176B4D]">
                CURRICULUM VITAE / BIODATA
              </p>
              <h2 className="text-2xl font-bold text-[#252525] mt-1">
                {form.fullName || (language === 'bn' ? 'আপনার নাম এখানে দেখাবে' : 'Your Full Name')}
              </h2>
              {form.targetRole && (
                <p className="text-sm font-semibold text-[#176B4D] mt-0.5">{form.targetRole}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5C5C58]">
                {form.area && <span>{form.area}</span>}
                {form.phone && <span>Phone: {form.phone}</span>}
                {form.email && <span>Email: {form.email}</span>}
              </div>
            </div>

            <div className="space-y-4 text-sm text-[#252525]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
                  Education
                </h3>
                <p>{form.education || '—'}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
                  Skills & Strengths
                </h3>
                <p className="whitespace-pre-line">{form.skills || '—'}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
                  Experience
                </h3>
                <p className="whitespace-pre-line">
                  {form.experience || 'Fresher — committed, punctual, and ready to learn on the job.'}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
                  Languages Known
                </h3>
                <p>{form.languages || '—'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#11533B] text-white text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              {language === 'bn' ? 'প্রিন্ট / PDF সেভ করুন' : 'Print / Save PDF'}
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#D8D5CC] hover:bg-[#EBF4F0] text-[#252525] text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4 text-[#176B4D]" />
              {language === 'bn' ? 'টেক্সট ডাউনলোড' : 'Download .txt'}
            </button>
            <a
              href={buildWhatsAppShareUrl(
                `${form.fullName || 'Biodata'} — ${form.targetRole || 'Job Application'}`,
                buildPlainText(),
                '/jobs/biodata'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#D8D5CC] hover:bg-[#EBF4F0] text-[#252525] text-xs sm:text-sm font-semibold min-h-[44px]"
            >
              <Share2 className="w-4 h-4 text-[#176B4D]" />
              {language === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান' : 'Share on WhatsApp'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
