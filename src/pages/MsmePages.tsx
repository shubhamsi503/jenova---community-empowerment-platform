import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Lightbulb,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pickText, tr } from '../i18n/translations';
import { apiFetch, trackAnalyticsEvent } from '../lib/api';
import type { BusinessIdea, BusinessProfile } from '../types/platform';
import {
  ActionToolbar,
  PageHeader,
  ResilientImage,
  SafetyNotice,
  VerificationLabel,
} from '../components/SharedUI';
import { VISUAL_ASSETS } from '../lib/visualAssets';

export function MsmeTabs({ active }: { active: 'hub' | 'planner' | 'ideas' | 'directory' }) {
  const { navigate, language } = useApp();
  const tabs = [
    {
      id: 'hub',
      path: '/msme',
      label: tr(
        language,
        'MSME সহায়তা ও লাভ হিসাব',
        'MSME सहायता और लाभ कैलकुलेटर',
        'MSME Hub & Profit Calculator'
      ),
    },
    {
      id: 'planner',
      path: '/msme/planner',
      label: tr(
        language,
        'ব্যবসা পরিকল্পনা বিল্ডার',
        'व्यवसाय योजना बिल्डर',
        'Business Plan Builder'
      ),
    },
    {
      id: 'ideas',
      path: '/msme/ideas',
      label: tr(language, 'ছোট ব্যবসার আইডিয়া', 'लघु व्यवसाय आइडिया', 'Business Ideas Library'),
    },
    {
      id: 'directory',
      path: '/msme/directory',
      label: tr(language, 'স্থানীয় ব্যবসা ডিরেক্টরি', 'स्थानीय व्यवसाय निर्देशिका', 'Local Business Directory'),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-white border border-[#F2DCC1] mb-8 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => navigate(tab.path)}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            active === tab.id
              ? 'jenova-saffron-btn'
              : 'text-[#454545] hover:text-[#26364B] hover:bg-[#FFF1DF]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function MsmeSupportHubPage() {
  const { language, navigate } = useApp();

  // Interactive Business Expense & Profit Calculator
  const [unitSellingPrice, setUnitSellingPrice] = useState(120);
  const [unitMaterialCost, setUnitMaterialCost] = useState(65);
  const [monthlyUnits, setMonthlyUnits] = useState(250);
  const [fixedRent, setFixedRent] = useState(2500);
  const [fixedUtilities, setFixedUtilities] = useState(1200);
  const [fixedOther, setFixedOther] = useState(1300);

  const calc = useMemo(() => {
    const revenue = unitSellingPrice * monthlyUnits;
    const variableCosts = unitMaterialCost * monthlyUnits;
    const fixedCosts = fixedRent + fixedUtilities + fixedOther;
    const totalExpenses = variableCosts + fixedCosts;
    const netProfit = revenue - totalExpenses;
    const marginPerUnit = unitSellingPrice - unitMaterialCost;
    const profitMarginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const breakEvenUnits = marginPerUnit > 0 ? Math.ceil(fixedCosts / marginPerUnit) : null;
    return { revenue, variableCosts, fixedCosts, totalExpenses, netProfit, profitMarginPct, breakEvenUnits };
  }, [unitSellingPrice, unitMaterialCost, monthlyUnits, fixedRent, fixedUtilities, fixedOther]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(
          language,
          'MSME ও স্ব-নিযুক্তি সহায়তা কেন্দ্র',
          'MSME और स्वरोजगार सहायता केंद्र',
          'MSME & Self-Employment Support Hub'
        )}
        subtitle={tr(
          language,
          'ক্ষুদ্র ব্যবসার পরিকল্পনা, সম্পূর্ণ ফ্রি সরকারি উদ্যম (Udyam) নিবন্ধন নির্দেশিকা, ব্যবসা ব্যয় ও লাভ ক্যালকুলেটর এবং যাচাইকৃত কমিউনিটি ব্যবসা ডিরেক্টরি।',
          'लघु व्यवसाय योजना, पूर्णतः निःशुल्क उद्यम (Udyam) पंजीकरण गाइड, व्यवसाय लाभ कैलकुलेटर और सत्यापित सामुदायिक व्यवसाय निर्देशिका।',
          'Practical entrepreneurship guidance, 100% free Udyam registration steps, business expense & profit calculators, and our verified community enterprise directory.'
        )}
      />

      <MsmeTabs active="hub" />

      {/* Quick Navigation Cards with Authentic MSME Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <button
          type="button"
          onClick={() => navigate('/msme/ideas')}
          className="text-left rounded-xl bg-white border border-[#F2DCC1] hover:border-[#F4A340] transition-colors overflow-hidden cursor-pointer group flex flex-col"
        >
          <ResilientImage
            src={VISUAL_ASSETS.msmeEntrepreneurs.src}
            alt={VISUAL_ASSETS.msmeEntrepreneurs.alt}
            containerClassName="aspect-[16/9] w-full border-b border-[#F2DCC1]"
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <Lightbulb className="w-5 h-5 text-[#A85B0A] mb-2.5" />
              <h2 className="text-lg font-bold text-[#26364B] group-hover:text-[#A85B0A] dark:group-hover:text-[#FFD19A]">
                {tr(
                  language,
                  'ছোট ও গৃহভিত্তিক ব্যবসার আইডিয়া লাইব্রেরি',
                  'छोटे और घरेलू व्यवसाय आइडिया लाइब्रेरी',
                  'Small & Home-Based Business Ideas'
                )}
              </h2>
              <p className="text-sm text-[#454545] mt-1.5">
                {tr(
                  language,
                  'ভারতের শহর, গ্রাম ও গৃহভিত্তিক উদ্যোক্তাদের জন্য কম পুঁজির বাস্তবসম্মত ক্ষুদ্র ব্যবসার ধারণা।',
                  'भारत के कस्बों, गांवों और घर से शुरू करने वाले उद्यमियों के लिए कम पूंजी वाले व्यावहारिक व्यवसाय विचार।',
                  'Practical, low-capital micro-enterprise ideas designed for Indian towns, rural communities, and home-based founders.'
                )}
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
              {tr(language, 'আইডিয়াগুলি দেখুন', 'आइडिया देखें', 'Explore Ideas')}{' '}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/msme/directory')}
          className="text-left rounded-xl bg-white border border-[#F2DCC1] hover:border-[#F4A340] transition-colors overflow-hidden cursor-pointer group flex flex-col"
        >
          <ResilientImage
            src={VISUAL_ASSETS.msmeBusinessGrowth.src}
            alt={VISUAL_ASSETS.msmeBusinessGrowth.alt}
            containerClassName="aspect-[16/9] w-full border-b border-[#F2DCC1]"
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <Store className="w-5 h-5 text-[#A85B0A] dark:text-[#FFD19A] mb-2.5" />
              <h2 className="text-lg font-bold text-[#26364B] group-hover:text-[#A85B0A] dark:group-hover:text-[#FFD19A]">
                {tr(language, 'স্থানীয় ক্ষুদ্র ব্যবসা ডিরেক্টরি', 'स्थानीय लघु व्यवसाय निर्देशिका', 'Local Business Directory')}
              </h2>
              <p className="text-sm text-[#454545] mt-1.5">
                {tr(
                  language,
                  'যাচাইকৃত স্থানীয় কারিগর ও পরিষেবা কেন্দ্র খুঁজুন অথবা বিনামূল্যে আপনার নিজের ব্যবসা তালিকাভুক্ত করুন।',
                  'सत्यापित स्थानीय कारीगरों व दुकानों को खोजें या निःशुल्क अपना व्यवसाय सूचीबद्ध करें।',
                  'Discover verified local artisans and service shops, or submit your own business for free listing.'
                )}
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
              {tr(
                language,
                'ব্যবসা খুঁজুন বা জমা দিন',
                'व्यवसाय देखें या जमा करें',
                'Browse or Submit Business'
              )}{' '}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>
      </div>

      {/* Guided Business Plan Builder Banner */}
      <div className="mb-10 p-6 rounded-xl bg-[#FFE5C2] border border-[#F4A340]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#A85B0A] dark:text-[#FFD19A]">
            {tr(language, 'স্ব-নিযুক্তি প্রস্তুতি টুলকিট', 'स्वरोजगार तैयारी टूलकिट', 'Self-Employment Preparation Toolkit')}
          </p>
          <h2 className="text-lg font-bold text-[#26364B] mt-1">
            {tr(
              language,
              '১-পৃষ্ঠার ক্ষুদ্র ব্যবসা পরিকল্পনা ও পুঁজি বিল্ডার',
              '1-पृष्ठ लघु व्यवसाय योजना और पूंजी बिल्डर',
              '1-Page Micro-Business Plan & Startup Capital Builder'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[#26364B] dark:text-[#FFD19A] mt-1">
            {tr(
              language,
              'প্রাথমিক মূলধন, দাম, ব্রেক-ইভেন, গ্রাহক যাচাই ও প্রস্তুতি চেকলিস্ট সেভ করুন এবং সরাসরি Action Passport-এ পাঠান।',
              'शुरुआती पूंजी, मूल्य निर्धारण, ब्रेक-ईवन, ग्राहक जांच और तैयारी चेकलिस्ट सहेजें और Action Passport में जोड़ें।',
              'Calculate startup costs, test pricing & break-even, complete customer checks, save plans, and send steps straight to your Action Passport.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/msme/planner')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold jenova-saffron-btn rounded-lg whitespace-nowrap cursor-pointer shrink-0"
        >
          <span>
            {tr(language, 'প্ল্যান বিল্ডার খুলুন', 'प्लान बिल्डर खोलें', 'Open Plan Builder')}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Business Expense & Profit Calculator */}
      <section className="p-6 sm:p-8 rounded-xl bg-white border border-[#F2DCC1] mb-10">
        <div className="pb-4 border-b border-[#F2DCC1] mb-6">
          <h2 className="text-xl font-bold text-[#26364B]">
            {tr(
              language,
              'ব্যবসা ব্যয়, লাভ ও ব্রেক-ইভেন ক্যালকুলেটর',
              'लघु व्यवसाय खर्च, लाभ और ब्रेक-ईवन कैलकुलेटर',
              'Small Business Expense, Profit & Break-Even Calculator'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[#454545] mt-1">
            {tr(
              language,
              'মাসিক বিক্রয় আয়, মোট পরিচালনা ব্যয়, নিট লাভ এবং খরচ তুলতে মাসে ন্যূনতম কতটি পণ্য/পরিষেবা বিক্রি করতে হবে তা হিসাব করুন।',
              'मासिक बिक्री आय, कुल परिचालन खर्च, शुद्ध लाभ और लागत निकालने के लिए न्यूनतम मासिक बिक्री की गणना करें।',
              'Estimate monthly revenue, total operating expenses, net profit, and how many items or services you must sell each month to cover costs.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(
                  language,
                  'প্রতি পণ্য / কাজের বিক্রয়মূল্য (₹)',
                  'प्रति वस्तु / सेवा विक्रय मूल्य (₹)',
                  'Selling Price per Item / Job (₹)'
                )}
              </label>
              <input
                type="number"
                min={1}
                value={unitSellingPrice}
                onChange={(e) => setUnitSellingPrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(
                  language,
                  'প্রতি পণ্যে কাঁচামাল / সরাসরি খরচ (₹)',
                  'प्रति वस्तु कच्चा माल / प्रत्यक्ष लागत (₹)',
                  'Raw Material / Direct Cost per Item (₹)'
                )}
              </label>
              <input
                type="number"
                min={0}
                value={unitMaterialCost}
                onChange={(e) => setUnitMaterialCost(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(
                  language,
                  'আনুমানিক মাসিক বিক্রি (ইউনিট)',
                  'अनुमानित मासिक बिक्री (यूनिट)',
                  'Estimated Monthly Sales (Units)'
                )}
              </label>
              <input
                type="number"
                min={0}
                value={monthlyUnits}
                onChange={(e) => setMonthlyUnits(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(
                  language,
                  'মাসিক দোকান ভাড়া / কর্মস্থল (₹)',
                  'मासिक दुकान किराया / कार्यस्थल (₹)',
                  'Monthly Shop Rent / Workspace (₹)'
                )}
              </label>
              <input
                type="number"
                min={0}
                value={fixedRent}
                onChange={(e) => setFixedRent(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(
                  language,
                  'বিদ্যুৎ / ফোন / যাতায়াত (₹)',
                  'बिजली / फोन / परिवहन (₹)',
                  'Electricity / Phone / Transport (₹)'
                )}
              </label>
              <input
                type="number"
                min={0}
                value={fixedUtilities}
                onChange={(e) => setFixedUtilities(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {tr(
                  language,
                  'সহকারী / প্যাকেজিং / অন্যান্য স্থায়ী খরচ (₹)',
                  'सहायक / पैकेजिंग / अन्य स्थायी खर्च (₹)',
                  'Helper / Packaging / Other Fixed (₹)'
                )}
              </label>
              <input
                type="number"
                min={0}
                value={fixedOther}
                onChange={(e) => setFixedOther(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">
                {tr(language, 'মাসিক মোট আয়', 'मासिक कुल आय', 'Monthly Revenue')}
              </p>
              <p className="mt-1 text-xl font-bold font-mono tabular-nums text-[#26364B]">
                ₹{calc.revenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">
                {tr(language, 'মাসিক মোট ব্যয়', 'मासिक कुल खर्च', 'Total Monthly Expenses')}
              </p>
              <p className="mt-1 text-xl font-bold font-mono tabular-nums text-[#26364B]">
                ₹{calc.totalExpenses.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#665B4F] mt-0.5">
                {tr(language, 'সরাসরি', 'प्रत्यक्ष', 'Direct')} ₹
                {calc.variableCosts.toLocaleString('en-IN')} +{' '}
                {tr(language, 'স্থায়ী', 'स्थायी', 'Fixed')} ₹{calc.fixedCosts.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">
                {tr(language, 'আনুমানিক মাসিক লাভ', 'अनुमानित मासिक लाभ', 'Estimated Monthly Profit')}
              </p>
              <p
                className={`mt-1 text-xl font-bold font-mono tabular-nums ${
                  calc.netProfit >= 0 ? 'text-[#A85B0A] dark:text-[#FFD19A]' : 'text-red-700'
                }`}
              >
                {calc.netProfit < 0 ? '-' : ''}₹{Math.abs(calc.netProfit).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#454545] mt-0.5">
                {tr(language, 'লাভের হার:', 'मार्जिन:', 'Margin:')} {calc.profitMarginPct.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF1DF] border border-[#F2DCC1]">
              <p className="text-xs text-[#454545]">
                {tr(language, 'ব্রেক-ইভেন বিক্রয় সংখ্যা', 'ब्रेक-ईवन बिक्री मात्रा', 'Break-Even Volume')}
              </p>
              <p className="mt-1 text-xl font-bold font-mono tabular-nums text-[#A85B0A]">
                {calc.breakEvenUnits !== null
                  ? `${calc.breakEvenUnits} ${tr(language, 'ইউনিট', 'यूनिट', 'units')}`
                  : tr(language, 'বিক্রয়মূল্য ≤ খরচ', 'मूल्य ≤ लागत', 'Price ≤ Cost')}
              </p>
              <p className="text-[11px] text-[#665B4F] mt-0.5">
                {tr(
                  language,
                  'খরচ তুলতে ন্যূনতম মাসিক বিক্রি',
                  'खर्च निकालने के लिए न्यूनतम मासिक बिक्री',
                  'Minimum monthly sales to cover costs'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Udyam Registration & Business Planning Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
          <div className="flex items-center gap-2 text-[#A85B0A] dark:text-[#FFD19A]">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-lg font-bold text-[#26364B]">
              {tr(
                language,
                'অফিসিয়াল উদ্যম (MSME) নিবন্ধন নির্দেশিকা — সম্পূর্ণ ফ্রি',
                'आधिकारिक उद्यम (MSME) पंजीकरण गाइड — पूर्णतः निःशुल्क',
                'Official Udyam (MSME) Registration Guide — Strictly Free'
              )}
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[#454545] leading-relaxed">
            <li>
              {tr(
                language,
                'শুধুমাত্র ভারত সরকারের অফিসিয়াল পোর্টালে যান:',
                'केवल भारत सरकार के आधिकारिक पोर्टल पर जाएं:',
                'Visit ONLY the official Government of India portal:'
              )}{' '}
              <strong>udyamregistration.gov.in</strong>.
            </li>
            <li>
              {tr(
                language,
                'আপনার আধার নম্বর, সংযুক্ত মোবাইল ফোন, প্যান (প্রযোজ্য হলে) ও ব্যবসার ব্যাংক বিবরণ হাতের কাছে রাখুন।',
                'अपना आधार नंबर, लिंक किया गया मोबाइल फोन, पैन (यदि लागू हो) और व्यवसाय बैंक विवरण तैयार रखें।',
                'Keep your Aadhaar number, linked mobile phone, PAN (if applicable), and business bank details ready.'
              )}
            </li>
            <li>
              {tr(
                language,
                'ব্যবসার নাম, জেলা/শহরের ঠিকানা এবং প্রধান কার্যকলাপের কোড লিখুন।',
                'व्यवसाय का नाम, जिला/शहर का पता और मुख्य कार्य श्रेणी कोड दर्ज करें।',
                'Enter business name, district/city address, and primary activity code.'
              )}
            </li>
            <li>
              {tr(
                language,
                'OTP যাচাইয়ের পর সম্পূর্ণ বিনামূল্যে স্থায়ী উদ্যম রেজিস্ট্রেশন সার্টিফিকেট ডাউনলোড করুন।',
                'OTP सत्यापन के बाद अपना निःशुल्क स्थायी उद्यम पंजीकरण प्रमाणपत्र डाउनलोड करें।',
                'Download your free permanent Udyam Registration Certificate upon OTP confirmation.'
              )}
            </li>
          </ol>
          <a
            href="https://udyamregistration.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAnalyticsEvent('scheme_referral', 'sch-udyam')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline"
          >
            <span>
              {tr(
                language,
                'udyamregistration.gov.in খুলুন',
                'udyamregistration.gov.in खोलें',
                'Open udyamregistration.gov.in'
              )}
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
          <h2 className="text-lg font-bold text-[#26364B]">
            {tr(
              language,
              'ক্ষুদ্র ব্যবসা পরিকল্পনার ৫-ধাপের চেকলিস্ট',
              'लघु व्यवसाय योजना की 5-चरणीय चेकलिस्ट',
              '5-Step Micro-Business Planning Checklist'
            )}
          </h2>
          <ul className="space-y-2.5 text-sm text-[#454545] leading-relaxed">
            <li>
              <strong>
                {tr(language, '০১. স্থানীয় চাহিদা যাচাই করুন:', '01. स्थानीय मांग जांचें:', '01. Validate Local Demand:')}
              </strong>{' '}
              {tr(
                language,
                'বড় মজুত কেনার আগে এলাকার ১৫–২০ জন প্রতিবেশী বা দোকানদারের সাথে কথা বলুন।',
                'थोक माल खरीदने से पहले अपने क्षेत्र के 15–20 पड़ोसियों या दुकानदारों से बात करें।',
                'Talk to 15–20 neighbours or shopkeepers in your area before buying bulk stock.'
              )}
            </li>
            <li>
              <strong>
                {tr(language, '০২. বড় ঋণ ছাড়াই ছোট করে শুরু করুন:', '02. भारी कर्ज के बिना छोटे स्तर से शुरू करें:', '02. Start Small Without Heavy Debt:')}
              </strong>{' '}
              {tr(
                language,
                'প্রথমে ছোট ব্যাচে পরীক্ষা করুন; কখনোই চড়া সুদের অপ্রাতিষ্ঠানিক ঋণের ওপর নির্ভর করবেন না।',
                'पहले छोटे बैच से परीक्षण करें; कभी भी उच्च ब्याज वाले अनौपचारिक कर्ज पर निर्भर न रहें।',
                'Test small batches first; never rely on high-interest informal loans.'
              )}
            </li>
            <li>
              <strong>
                {tr(language, '০৩. ব্যবসা ও সংসারের টাকা আলাদা রাখুন:', '03. व्यवसाय और घर के पैसे अलग रखें:', '03. Separate Business & Home Cash:')}
              </strong>{' '}
              {tr(
                language,
                'দোকানের টাকার জন্য আলাদা খাতা বা আলাদা ব্যাংক অ্যাকাউন্ট ব্যবহার করুন।',
                'दुकान के पैसे के लिए अलग नोटबुक या अलग बैंक खाता रखें।',
                'Maintain a simple notebook or separate bank account for shop money.'
              )}
            </li>
            <li>
              <strong>
                {tr(language, '০৪. আগে বিনামূল্যে দক্ষতা শিখুন:', '04. पहले निःशुल्क कौशल सीखें:', '04. Learn Free Skills First:')}
              </strong>{' '}
              {tr(
                language,
                'জাতীয় RSETI, PMKVY বা উৎকর্ষ বাংলা উদ্যোক্তা প্রশিক্ষণ কোর্স ব্যবহার করুন।',
                'राष्ट्रीय RSETI, PMKVY या उत्कर्ष बांग्ला उद्यमिता पाठ्यक्रमों का लाभ उठाएं।',
                'Use National RSETI, PMKVY, or Utkarsh Bangla entrepreneurship courses.'
              )}
            </li>
            <li>
              <strong>
                {tr(language, '০৫. অফিসিয়াল প্রকল্প যাচাই করুন:', '05. आधिकारिक योजनाएं सत्यापित करें:', '05. Verify Official Programmes:')}
              </strong>{' '}
              {tr(
                language,
                'উদ্যম, PMEGP, PM SVANidhi বা ব্যাংক প্রকল্পের জন্য অফিসিয়াল পোর্টাল দেখুন — এই প্ল্যাটফর্ম কখনোই নিশ্চিত ঋণের প্রতিশ্রুতি দেয় না।',
                'उद्यम, PMEGP, PM SVANidhi या बैंक योजनाओं के लिए आधिकारिक पोर्टल जांचें — यह मंच कभी गारंटीशुदा लोन का वादा नहीं करता।',
                'Check official portals for Udyam, PMEGP, PM SVANidhi, or bank schemes — this platform never promises guaranteed funding or loans.'
              )}
            </li>
          </ul>
        </div>
      </div>

      <SafetyNotice
        message={tr(
          language,
          'স্বচ্ছতা বার্তা: JENOVA কোনো ব্যবসায়িক ঋণ অনুমোদন বা নিশ্চিত তহবিলের গ্যারান্টি দেয় না। বিনামূল্যের উদ্যম নিবন্ধনের জন্য কখনোই কোনো এজেন্টকে টাকা দেবেন না।',
          'पारदर्शिता सूचना: JENOVA कोई व्यवसाय ऋण स्वीकृत नहीं करता और न ही फंडिंग की गारंटी देता है। निःशुल्क उद्यम पंजीकरण के लिए कभी किसी एजेंट को पैसे न दें।',
          'Transparency Notice: JENOVA does not sanction business loans or guarantee funding. Never pay third-party agents for free Udyam Registration.'
        )}
      />
    </div>
  );
}

export function BusinessIdeasPage() {
  const { language, navigate } = useApp();
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [homeOnly, setHomeOnly] = useState(false);

  useEffect(() => {
    apiFetch<{ ideas: BusinessIdea[] }>('/api/msme/ideas')
      .then((res) => setIdeas(res.ideas))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return ideas.filter((i) => (homeOnly ? i.isHomeBased : true));
  }, [ideas, homeOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(
          language,
          'ক্ষুদ্র ও গৃহভিত্তিক ব্যবসার আইডিয়া লাইব্রেরি',
          'छोटे और घरेलू व्यवसाय आइडिया लाइब्रेरी',
          'Small & Home-Based Business Ideas'
        )}
        subtitle={tr(
          language,
          'ভারতের নবীন উদ্যোক্তাদের জন্য বাস্তবসম্মত প্রাথমিক বাজেট ও স্পষ্ট শুরুর ধাপসহ ক্ষুদ্র ব্যবসার মডেল।',
          'भारत के उभरते उद्यमियों के लिए व्यावहारिक शुरुआती बजट और स्पष्ट चरणों वाले लघु व्यवसाय मॉडल।',
          'Practical micro-business models tailored for aspiring entrepreneurs across India with realistic startup budgets and clear launch steps.'
        )}
      />

      <MsmeTabs active="ideas" />

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setHomeOnly(false)}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            !homeOnly ? 'jenova-saffron-btn' : 'bg-white border border-[#F2DCC1] text-[#454545]'
          }`}
        >
          {tr(
            language,
            `সব ব্যবসার আইডিয়া (${ideas.length})`,
            `सभी व्यवसाय आइडिया (${ideas.length})`,
            `All Business Ideas (${ideas.length})`
          )}
        </button>
        <button
          type="button"
          onClick={() => setHomeOnly(true)}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            homeOnly ? 'jenova-saffron-btn' : 'bg-white border border-[#F2DCC1] text-[#454545]'
          }`}
        >
          {tr(language, 'শুধু গৃহভিত্তিক আইডিয়া', 'केवल घर से चलने वाले आइडिया', 'Home-Based Ideas Only')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((idea) => (
          <article key={idea.id} className="p-6 rounded-xl bg-white border border-[#F2DCC1] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#454545]">
              <span>
                {idea.category} ·{' '}
                {idea.isHomeBased
                  ? tr(language, 'বাড়ি থেকে শুরুযোগ্য', 'घर से शुरू करने योग्य', 'Home-Based Friendly')
                  : tr(language, 'ছোট কাউন্টার / দোকান', 'छोटा काउंटर / दुकान', 'Small Counter / Desk')}
              </span>
              <span className="font-mono font-semibold text-[#A85B0A] dark:text-[#FFD19A]">
                {idea.estimatedStartupRange}
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#26364B]">{pickText(idea.title, language)}</h2>
            <p className="text-sm text-[#454545] leading-relaxed">
              {pickText(idea.description, language)}
            </p>
            <p className="text-xs text-[#26364B] dark:text-[#FFD19A] bg-[#FFE5C2] rounded-lg px-3.5 py-2.5">
              <strong>{tr(language, 'স্থানীয় প্রাসঙ্গিকতা:', 'स्थानीय उपयोगिता:', 'Local Context:')}</strong>{' '}
              {pickText(idea.localRelevance, language)}
            </p>

            <div>
              <p className="text-xs font-semibold text-[#26364B] mb-2">
                {tr(language, 'শুরু করার বাস্তব ধাপ:', 'शुरुआती व्यावहारिक कदम:', 'Practical First Steps:')}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-[#454545]">
                {idea.firstSteps.map((st, idx) => (
                  <li key={idx}>{st}</li>
                ))}
              </ol>
            </div>

            <div className="pt-2 border-t border-[#F2DCC1] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate('/msme/planner')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A85B0A] dark:text-[#FFD19A] hover:underline cursor-pointer"
              >
                <span>
                  {tr(
                    language,
                    'এই আইডিয়ার ব্যবসা পরিকল্পনা তৈরি করুন',
                    'इस आइडिया की व्यवसाय योजना बनाएं',
                    'Build a Business Plan for This Idea'
                  )}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/udaan/udaan-business-plan')}
                className="text-xs font-medium text-[#454545] hover:text-[#A85B0A] dark:hover:text-[#FFD19A] cursor-pointer"
              >
                {tr(language, 'UDAAN প্রশিক্ষণ দেখুন →', 'UDAAN प्रशिक्षण देखें →', 'UDAAN Training →')}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function LocalBusinessDirectoryPage() {
  const { language, t, showToast } = useApp();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Submission state
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Tailoring & Garments');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [operatingHours, setOperatingHours] = useState('10:00 AM – 7:00 PM');
  const [websiteOrSocial, setWebsiteOrSocial] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    trackAnalyticsEvent('business_visit');
    apiFetch<{ businesses: BusinessProfile[] }>('/api/businesses')
      .then((res) => setBusinesses(res.businesses))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return businesses;
    const q = search.toLowerCase();
    return businesses.filter((b) =>
      `${b.businessName} ${b.category} ${b.location} ${b.services.join(' ')} ${b.description.en}`
        .toLowerCase()
        .includes(q)
    );
  }, [businesses, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ message: string }>('/api/businesses/submit', {
        method: 'POST',
        body: JSON.stringify({
          businessName,
          category,
          location,
          description,
          services,
          contactInfo,
          operatingHours,
          websiteOrSocial,
          consentToPublish: consent,
        }),
      });
      showToast(
        tr(
          language,
          'ব্যবসার প্রোফাইল যাচাইয়ের জন্য জমা হয়েছে। অনুমোদনের পর এটি প্রকাশিত হবে।',
          'व्यवसाय प्रोफ़ाइल सत्यापन के लिए जमा हो गई है। स्वीकृति के बाद यह प्रकाशित होगी।',
          res.message
        )
      );
      setShowModal(false);
      setBusinessName('');
      setDescription('');
      setServices('');
      setContactInfo('');
      setConsent(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : tr(language, 'জমা দেওয়া ব্যর্থ হয়েছে।', 'सबमिट करना विफल रहा।', 'Submission failed.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={tr(language, 'স্থানীয় ব্যবসা ডিরেক্টরি', 'स्थानीय व्यवसाय निर्देशिका', 'Local Business Directory')}
        subtitle={tr(
          language,
          'ভারতজুড়ে যাচাইকৃত ক্ষুদ্র ব্যবসা, স্বনির্ভর গোষ্ঠী (SHG), কারিগর ও স্থানীয় পরিষেবা প্রদানকারী। অ্যাডমিন যাচাইয়ের জন্য বিনামূল্যে আপনার ব্যবসা জমা দিন।',
          'भारत भर के सत्यापित लघु व्यवसाय, महिला स्व-सहायता समूह (SHG), कारीगर और स्थानीय सेवा प्रदाता। एडमिन समीक्षा के लिए अपना व्यवसाय निःशुल्क जमा करें।',
          'Verified small businesses, women-led SHGs, artisans, and community service providers across India. Submit your enterprise free of cost for Admin review.'
        )}
        action={
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold jenova-saffron-btn rounded-lg whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {tr(language, 'আপনার ব্যবসা জমা দিন', 'अपना व्यवसाय जमा करें', 'Submit Your Business')}
            </span>
          </button>
        }
      />

      <MsmeTabs active="directory" />

      <div className="relative max-w-xl mb-8">
        <Search className="w-4 h-4 text-[#665B4F] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tr(
            language,
            'স্থানীয় দোকান, দর্জি, মেরামতি পরিষেবা খুঁজুন...',
            'स्थानीय दुकानें, दर्जी, मरम्मत सेवाएं खोजें...',
            'Search local shops, tailors, repair services...'
          )}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#F2DCC1] bg-white text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((biz) => (
          <article
            key={biz.id}
            className="p-6 rounded-xl bg-white border border-[#F2DCC1] flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#454545] mb-2">
                <span>{biz.category}</span>
                <VerificationLabel status={biz.verificationStatus} isDemo={biz.isDemo} />
              </div>
              <h2 className="text-lg font-bold text-[#26364B]">{biz.businessName}</h2>
              <p className="text-sm text-[#454545] mt-2 leading-relaxed">
                {pickText(biz.description, language)}
              </p>

              <div className="mt-4 space-y-1.5 text-xs text-[#454545]">
                <p className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A85B0A] dark:text-[#FFD19A]" />
                  <span>{biz.location}</span>
                </p>
                <p className="inline-flex items-center gap-1.5 ml-4">
                  <Clock className="w-3.5 h-3.5 text-[#665B4F]" />
                  <span>{biz.operatingHours}</span>
                </p>
                <p className="pt-1 text-[#26364B]">
                  <span className="text-[#665B4F]">
                    {tr(language, 'পরিষেবা:', 'सेवाएं:', 'Services:')}{' '}
                  </span>
                  {biz.services.join(' · ')}
                </p>
                <p className="text-[#26364B]">
                  <span className="text-[#665B4F]">
                    {tr(language, 'যোগাযোগ:', 'संपर्क:', 'Contact:')}{' '}
                  </span>
                  {biz.contactInfo}
                </p>
              </div>
            </div>

            <ActionToolbar
              itemType="business"
              itemId={biz.id}
              title={biz.businessName}
              shareSummary={`${biz.category} | ${biz.location} | ${biz.services.join(', ')}`}
              sharePath="/msme/directory"
              externalUrl={biz.websiteOrSocial || undefined}
              externalLabel={tr(
                language,
                'ব্যবসার লিঙ্ক দেখুন',
                'व्यवसाय लिंक खोलें',
                'Visit Business Link'
              )}
              onExternalClick={() => trackAnalyticsEvent('business_visit', biz.id)}
            />
          </article>
        ))}
      </div>

      {/* Submit Local Business Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-[#F2DCC1] w-full max-w-xl p-6 my-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2DCC1]">
              <div>
                <h2 className="text-lg font-bold text-[#26364B]">
                  {tr(
                    language,
                    'স্থানীয় ব্যবসার প্রোফাইল জমা দিন',
                    'स्थानीय व्यवसाय प्रोफ़ाइल जमा करें',
                    'Submit Local Business Profile'
                  )}
                </h2>
                <p className="text-xs text-[#454545]">
                  {tr(
                    language,
                    'স্থানীয় উদ্যোক্তাদের জন্য বিনামূল্যে তালিকাভুক্তি। অ্যাডমিন যাচাইয়ের পর প্রকাশিত হয়।',
                    'स्थानीय उद्यमों के लिए निःशुल्क सूची। एडमिन सत्यापन के बाद ही प्रकाशित होती है।',
                    'Free listing for local enterprises. Published only after Administrator verification.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#454545] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'ব্যবসার নাম *', 'व्यवसाय का नाम *', 'Business Name *')}
                  </label>
                  <input
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'বিভাগ *', 'श्रेणी *', 'Category *')}
                  </label>
                  <input
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'স্থান *', 'स्थान *', 'Location *')}
                  </label>
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={tr(
                      language,
                      'যেমন: শহর, জেলা, রাজ্য',
                      'जैसे: शहर, जिला, राज्य',
                      'e.g. City, District, State'
                    )}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'খোলার সময়', 'कार्य समय', 'Operating Hours')}
                  </label>
                  <input
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {tr(
                    language,
                    'প্রদত্ত পরিষেবা (কমা দিয়ে আলাদা করুন)',
                    'प्रदान की जाने वाली सेवाएं (अल्पविराम से अलग करें)',
                    'Services Offered (comma-separated)'
                  )}
                </label>
                <input
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder={tr(
                    language,
                    'যেমন: ব্লাউজ সেলাই, ইউনিফর্ম, অল্টারেশন',
                    'जैसे: ब्लाउज़ सिलाई, यूनिफॉर्म, ऑल्टरेशन',
                    'e.g. Blouse Stitching, Uniforms, Alterations'
                  )}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {tr(language, 'ব্যবসার বিবরণ *', 'व्यवसाय विवरण *', 'Business Description *')}
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(language, 'পাবলিক ব্যবসায়িক যোগাযোগ', 'सार्वजनिक व्यवसाय संपर्क', 'Public Business Contact')}
                  </label>
                  <input
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder={tr(
                      language,
                      'দোকানের ঠিকানা বা ব্যবসায়িক যোগাযোগ',
                      'दुकान का पता या व्यावसायिक संपर्क',
                      'Shop address or business contact'
                    )}
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr(
                      language,
                      'ওয়েবসাইট / সোশ্যাল লিঙ্ক (ঐচ্ছিক)',
                      'वेबसाइट / सोशल लिंक (वैकल्पिक)',
                      'Website / Social Link (Optional)'
                    )}
                  </label>
                  <input
                    type="url"
                    value={websiteOrSocial}
                    onChange={(e) => setWebsiteOrSocial(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-[#F2DCC1] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-[#454545] pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="accent-[#F4A340] mt-0.5"
                />
                <span>
                  {tr(
                    language,
                    'আমি নিশ্চিত করছি যে এই ব্যবসা তালিকাভুক্ত করার অধিকার আমার আছে এবং অ্যাডমিন অনুমোদনের পর উপরের যোগাযোগের তথ্য প্রকাশে আমার সম্মতি আছে।',
                    'मैं पुष्टि करता/करती हूं कि मैं इस व्यवसाय को सूचीबद्ध करने के लिए अधिकृत हूं और एडमिन स्वीकृति के बाद उपरोक्त संपर्क जानकारी प्रकाशित करने की सहमति देता/देती हूं।',
                    'I confirm that I am authorized to list this business and consent to publishing the business contact information above after administrator approval.'
                  )}
                </span>
              </label>

              {error && <p className="text-xs text-red-700 font-medium">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#454545] cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold jenova-saffron-btn rounded-lg disabled:opacity-60 cursor-pointer"
                >
                  {submitting
                    ? t.common.loading
                    : tr(language, 'অনুমোদনের জন্য জমা দিন', 'स्वीकृति के लिए जमा करें', 'Submit for Approval')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
