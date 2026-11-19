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
import { pickText } from '../i18n/translations';
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

function MsmeTabs({ active }: { active: 'hub' | 'ideas' | 'directory' }) {
  const { navigate, language } = useApp();
  const tabs = [
    { id: 'hub', path: '/msme', label: language === 'bn' ? 'MSME সহায়তা ও লাভ হিসাব' : 'MSME Hub & Profit Calculator' },
    { id: 'ideas', path: '/msme/ideas', label: language === 'bn' ? 'ছোট ব্যবসার আইডিয়া' : 'Business Ideas Library' },
    { id: 'directory', path: '/msme/directory', label: language === 'bn' ? 'স্থানীয় ব্যবসা ডিরেক্টরি' : 'Local Business Directory' },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-white border border-[#E5E3DC] mb-8 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => navigate(tab.path)}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            active === tab.id
              ? 'bg-[#176B4D] text-white'
              : 'text-[#5C5C58] hover:text-[#252525] hover:bg-[#FAF9F5]'
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
        title={
          language === 'bn'
            ? 'MSME ও স্ব-নিযুক্তি সহায়তা কেন্দ্র'
            : language === 'hi'
              ? 'MSME और स्वरोजगार सहायता केंद्र'
              : 'MSME & Self-Employment Support Hub'
        }
        subtitle={
          language === 'bn'
            ? 'ক্ষুদ্র ব্যবসার পরিকল্পনা, সম্পূর্ণ ফ্রি সরকারি উদ্যম (Udyam) নিবন্ধন নির্দেশিকা, ব্যবসা ব্যয় ও লাভ ক্যালকুলেটর এবং যাচাইকৃত কমিউনিটি ব্যবসা ডিরেক্টরি।'
            : language === 'hi'
              ? 'लघु व्यवसाय योजना, पूर्णतः निःशुल्क उद्यम (Udyam) पंजीकरण गाइड, व्यवसाय लाभ कैलकुलेटर और सत्यापित सामुदायिक व्यवसाय निर्देशिका।'
              : 'Practical entrepreneurship guidance, 100% free Udyam registration steps, business expense & profit calculators, and our verified community enterprise directory.'
        }
      />

      <MsmeTabs active="hub" />

      {/* Quick Navigation Cards with Authentic MSME Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <button
          type="button"
          onClick={() => navigate('/msme/ideas')}
          className="text-left rounded-xl bg-white border border-[#E5E3DC] hover:border-[#176B4D] transition-colors overflow-hidden cursor-pointer group flex flex-col"
        >
          <ResilientImage
            src={VISUAL_ASSETS.msmeEntrepreneurs.src}
            alt={VISUAL_ASSETS.msmeEntrepreneurs.alt}
            containerClassName="aspect-[16/9] w-full border-b border-[#E5E3DC]"
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <Lightbulb className="w-5 h-5 text-[#B56A10] mb-2.5" />
              <h2 className="text-lg font-bold text-[#252525] group-hover:text-[#176B4D]">
                {language === 'bn' ? 'ছোট ও গৃহভিত্তিক ব্যবসার আইডিয়া লাইব্রেরি' : 'Small & Home-Based Business Ideas'}
              </h2>
              <p className="text-sm text-[#5C5C58] mt-1.5">
                Practical, low-capital micro-enterprise ideas designed for Indian towns, rural communities, and home-based founders.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#176B4D]">
              Explore Ideas <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/msme/directory')}
          className="text-left rounded-xl bg-white border border-[#E5E3DC] hover:border-[#176B4D] transition-colors overflow-hidden cursor-pointer group flex flex-col"
        >
          <ResilientImage
            src={VISUAL_ASSETS.msmeBusinessGrowth.src}
            alt={VISUAL_ASSETS.msmeBusinessGrowth.alt}
            containerClassName="aspect-[16/9] w-full border-b border-[#E5E3DC]"
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <Store className="w-5 h-5 text-[#176B4D] mb-2.5" />
              <h2 className="text-lg font-bold text-[#252525] group-hover:text-[#176B4D]">
                {language === 'bn' ? 'স্থানীয় ক্ষুদ্র ব্যবসা ডিরেক্টরি' : 'Local Business Directory'}
              </h2>
              <p className="text-sm text-[#5C5C58] mt-1.5">
                Discover verified local artisans and service shops, or submit your own business for free listing.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#176B4D]">
              Browse or Submit Business <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>
      </div>

      {/* Business Expense & Profit Calculator */}
      <section className="p-6 sm:p-8 rounded-xl bg-white border border-[#E5E3DC] mb-10">
        <div className="pb-4 border-b border-[#E5E3DC] mb-6">
          <h2 className="text-xl font-bold text-[#252525]">
            {language === 'bn'
              ? 'ব্যবসা ব্যয়, লাভ ও ব্রেক-ইভেন ক্যালকুলেটর'
              : 'Small Business Expense, Profit & Break-Even Calculator'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5C58] mt-1">
            Estimate monthly revenue, total operating expenses, net profit, and how many items or services you must sell each month to cover costs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Selling Price per Item / Job (₹)</label>
              <input
                type="number"
                min={1}
                value={unitSellingPrice}
                onChange={(e) => setUnitSellingPrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Raw Material / Direct Cost per Item (₹)</label>
              <input
                type="number"
                min={0}
                value={unitMaterialCost}
                onChange={(e) => setUnitMaterialCost(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Estimated Monthly Sales (Units)</label>
              <input
                type="number"
                min={0}
                value={monthlyUnits}
                onChange={(e) => setMonthlyUnits(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Monthly Shop Rent / Workspace (₹)</label>
              <input
                type="number"
                min={0}
                value={fixedRent}
                onChange={(e) => setFixedRent(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Electricity / Phone / Transport (₹)</label>
              <input
                type="number"
                min={0}
                value={fixedUtilities}
                onChange={(e) => setFixedUtilities(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Helper / Packaging / Other Fixed (₹)</label>
              <input
                type="number"
                min={0}
                value={fixedOther}
                onChange={(e) => setFixedOther(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Monthly Revenue</p>
              <p className="mt-1 text-xl font-bold font-mono tabular-nums text-[#252525]">
                ₹{calc.revenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Total Monthly Expenses</p>
              <p className="mt-1 text-xl font-bold font-mono tabular-nums text-[#252525]">
                ₹{calc.totalExpenses.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#85847C] mt-0.5">
                Direct ₹{calc.variableCosts.toLocaleString('en-IN')} + Fixed ₹{calc.fixedCosts.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Estimated Monthly Profit</p>
              <p
                className={`mt-1 text-xl font-bold font-mono tabular-nums ${
                  calc.netProfit >= 0 ? 'text-[#176B4D]' : 'text-red-700'
                }`}
              >
                {calc.netProfit < 0 ? '-' : ''}₹{Math.abs(calc.netProfit).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#5C5C58] mt-0.5">
                Margin: {calc.profitMarginPct.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC]">
              <p className="text-xs text-[#5C5C58]">Break-Even Volume</p>
              <p className="mt-1 text-xl font-bold font-mono tabular-nums text-[#B56A10]">
                {calc.breakEvenUnits !== null ? `${calc.breakEvenUnits} units` : 'Price ≤ Cost'}
              </p>
              <p className="text-[11px] text-[#85847C] mt-0.5">Minimum monthly sales to cover costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Udyam Registration & Business Planning Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-4">
          <div className="flex items-center gap-2 text-[#176B4D]">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-lg font-bold text-[#252525]">
              Official Udyam (MSME) Registration Guide — Strictly Free
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[#5C5C58] leading-relaxed">
            <li>Visit ONLY the official Government of India portal: <strong>udyamregistration.gov.in</strong>.</li>
            <li>Keep your Aadhaar number, linked mobile phone, PAN (if applicable), and business bank details ready.</li>
            <li>Enter business name, district/city address, and primary activity code.</li>
            <li>Download your free permanent Udyam Registration Certificate upon OTP confirmation.</li>
          </ol>
          <a
            href="https://udyamregistration.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAnalyticsEvent('scheme_referral', 'sch-udyam')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#176B4D] hover:underline"
          >
            <span>Open udyamregistration.gov.in</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-4">
          <h2 className="text-lg font-bold text-[#252525]">
            5-Step Micro-Business Planning Checklist
          </h2>
          <ul className="space-y-2.5 text-sm text-[#5C5C58] leading-relaxed">
            <li><strong>01. Validate Local Demand:</strong> Talk to 15–20 neighbours or shopkeepers in your area before buying bulk stock.</li>
            <li><strong>02. Start Small Without Heavy Debt:</strong> Test small batches first; never rely on high-interest informal loans.</li>
            <li><strong>03. Separate Business & Home Cash:</strong> Maintain a simple notebook or separate bank account for shop money.</li>
            <li><strong>04. Learn Free Skills First:</strong> Use National RSETI, PMKVY, or Utkarsh Bangla entrepreneurship courses.</li>
            <li><strong>05. Verify Official Programmes:</strong> Check official portals for Udyam, PMEGP, PM SVANidhi, or bank schemes — this platform never promises guaranteed funding or loans.</li>
          </ul>
        </div>
      </div>

      <SafetyNotice message="Transparency Notice: JENOVA does not sanction business loans or guarantee funding. Never pay third-party agents for free Udyam Registration." />
    </div>
  );
}

export function BusinessIdeasPage() {
  const { language } = useApp();
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
        title={language === 'bn' ? 'ক্ষুদ্র ও গৃহভিত্তিক ব্যবসার আইডিয়া লাইব্রেরি' : 'Small & Home-Based Business Ideas'}
        subtitle="Practical micro-business models tailored for aspiring entrepreneurs across India with realistic startup budgets and clear launch steps."
      />

      <MsmeTabs active="ideas" />

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setHomeOnly(false)}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            !homeOnly ? 'bg-[#176B4D] text-white' : 'bg-white border border-[#E5E3DC] text-[#5C5C58]'
          }`}
        >
          All Business Ideas ({ideas.length})
        </button>
        <button
          type="button"
          onClick={() => setHomeOnly(true)}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            homeOnly ? 'bg-[#176B4D] text-white' : 'bg-white border border-[#E5E3DC] text-[#5C5C58]'
          }`}
        >
          Home-Based Ideas Only
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((idea) => (
          <article key={idea.id} className="p-6 rounded-xl bg-white border border-[#E5E3DC] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5C58]">
              <span>
                {idea.category} · {idea.isHomeBased ? 'Home-Based Friendly' : 'Small Counter / Desk'}
              </span>
              <span className="font-mono font-semibold text-[#176B4D]">
                {idea.estimatedStartupRange}
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#252525]">{pickText(idea.title, language)}</h2>
            <p className="text-sm text-[#5C5C58] leading-relaxed">
              {pickText(idea.description, language)}
            </p>
            <p className="text-xs text-[#11533B] bg-[#EBF4F0] rounded-lg px-3.5 py-2.5">
              <strong>Local Context:</strong> {pickText(idea.localRelevance, language)}
            </p>

            <div>
              <p className="text-xs font-semibold text-[#252525] mb-2">Practical First Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-[#5C5C58]">
                {idea.firstSteps.map((st, idx) => (
                  <li key={idx}>{st}</li>
                ))}
              </ol>
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
      showToast(res.message);
      setShowModal(false);
      setBusinessName('');
      setDescription('');
      setServices('');
      setContactInfo('');
      setConsent(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title={language === 'bn' ? 'স্থানীয় ব্যবসা ডিরেক্টরি' : 'Local Business Directory'}
        subtitle="Verified small businesses, women-led SHGs, artisans, and community service providers across India. Submit your enterprise free of cost for Admin review."
        action={
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Your Business</span>
          </button>
        }
      />

      <MsmeTabs active="directory" />

      <div className="relative max-w-xl mb-8">
        <Search className="w-4 h-4 text-[#85847C] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search local shops, tailors, repair services..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E3DC] bg-white text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((biz) => (
          <article
            key={biz.id}
            className="p-6 rounded-xl bg-white border border-[#E5E3DC] flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5C58] mb-2">
                <span>{biz.category}</span>
                <VerificationLabel status={biz.verificationStatus} isDemo={biz.isDemo} />
              </div>
              <h2 className="text-lg font-bold text-[#252525]">{biz.businessName}</h2>
              <p className="text-sm text-[#5C5C58] mt-2 leading-relaxed">
                {pickText(biz.description, language)}
              </p>

              <div className="mt-4 space-y-1.5 text-xs text-[#5C5C58]">
                <p className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#176B4D]" />
                  <span>{biz.location}</span>
                </p>
                <p className="inline-flex items-center gap-1.5 ml-4">
                  <Clock className="w-3.5 h-3.5 text-[#85847C]" />
                  <span>{biz.operatingHours}</span>
                </p>
                <p className="pt-1 text-[#252525]">
                  <span className="text-[#85847C]">Services: </span>
                  {biz.services.join(' · ')}
                </p>
                <p className="text-[#252525]">
                  <span className="text-[#85847C]">Contact: </span>
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
              externalLabel="Visit Business Link"
              onExternalClick={() => trackAnalyticsEvent('business_visit', biz.id)}
            />
          </article>
        ))}
      </div>

      {/* Submit Local Business Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-[#E5E3DC] w-full max-w-xl p-6 my-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E3DC]">
              <div>
                <h2 className="text-lg font-bold text-[#252525]">Submit Local Business Profile</h2>
                <p className="text-xs text-[#5C5C58]">
                  Free listing for local enterprises. Published only after Administrator verification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#5C5C58] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Business Name *</label>
                  <input
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category *</label>
                  <input
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Location *</label>
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. City, District, State"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Operating Hours</label>
                  <input
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Services Offered (comma-separated)</label>
                <input
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="e.g. Blouse Stitching, Uniforms, Alterations"
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Business Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Public Business Contact</label>
                  <input
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Shop address or business contact"
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Website / Social Link (Optional)</label>
                  <input
                    type="url"
                    value={websiteOrSocial}
                    onChange={(e) => setWebsiteOrSocial(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-[#E5E3DC] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-[#5C5C58] pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="accent-[#176B4D] mt-0.5"
                />
                <span>
                  I confirm that I am authorized to list this business and consent to publishing the
                  business contact information above after administrator approval.
                </span>
              </label>

              {error && <p className="text-xs text-red-700 font-medium">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5C5C58] cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#176B4D] hover:bg-[#11533B] rounded-lg disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? t.common.loading : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
