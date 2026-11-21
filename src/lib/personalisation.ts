import type {
  BusinessIdea,
  CourseListing,
  JobListing,
  Language,
  LocalizedText,
  UdaanProgramme,
  UserLivelihoodProfile,
  WelfareScheme,
} from '../types/platform';
import { pickText, tr } from '../i18n/translations';

export const INDIA_STATES_DISTRICTS: Record<string, string[]> = {
  'West Bengal': [
    'Purba Medinipur',
    'Paschim Medinipur',
    'Kolkata',
    'Howrah',
    'Hooghly',
    'North 24 Parganas',
    'South 24 Parganas',
    'Nadia',
    'Purba Bardhaman',
    'Paschim Bardhaman',
    'Bankura',
    'Purulia',
    'Birbhum',
    'Murshidabad',
    'Malda',
    'Darjeeling',
    'Jalpaiguri',
    'Cooch Behar',
    'Alipurduar',
    'Dakshin Dinajpur',
    'Uttar Dinajpur',
    'Jhargram',
    'Kalimpong',
  ],
  Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Nalanda'],
  Odisha: ['Bhubaneswar (Khordha)', 'Cuttack', 'Balasore', 'Puri', 'Sambalpur', 'Rourkela (Sundargarh)'],
  Jharkhand: ['Ranchi', 'Jamshedpur (East Singhbhum)', 'Dhanbad', 'Bokaro', 'Hazaribagh'],
  Assam: ['Guwahati (Kamrup Metro)', 'Dibrugarh', 'Silchar (Cachar)', 'Jorhat', 'Tezpur (Sonitpur)'],
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Prayagraj', 'Kanpur', 'Noida (Gautam Buddha Nagar)', 'Agra'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
  Karnataka: ['Bengaluru Urban', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  Delhi: ['New Delhi', 'Central Delhi', 'South Delhi', 'East Delhi', 'North Delhi'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  Kerala: ['Thiruvananthapuram', 'Kochi (Ernakulam)', 'Kozhikode', 'Thrissur'],
};

export const PROFILE_STORAGE_KEY = 'jenova_livelihood_profile_v1';

export function createDefaultProfile(): UserLivelihoodProfile {
  return {
    education: '',
    skills: [],
    interests: [],
    careerGoals: [],
    employmentStatus: '',
    businessInterests: [],
    preferredOpportunityTypes: [],
    learningPreference: 'self_paced',
    location: {
      country: 'India',
      state: 'West Bengal',
      district: 'Purba Medinipur',
      city: '',
      locality: '',
      isGpsDerived: false,
    },
    updatedAt: '',
  };
}

export function loadLocalProfile(): UserLivelihoodProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as Partial<UserLivelihoodProfile>;
    const base = createDefaultProfile();
    return {
      ...base,
      ...parsed,
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      interests: Array.isArray(parsed.interests) ? parsed.interests : [],
      careerGoals: Array.isArray(parsed.careerGoals) ? parsed.careerGoals : [],
      businessInterests: Array.isArray(parsed.businessInterests) ? parsed.businessInterests : [],
      preferredOpportunityTypes: Array.isArray(parsed.preferredOpportunityTypes)
        ? parsed.preferredOpportunityTypes
        : [],
      location: {
        ...base.location,
        ...(parsed.location || {}),
      },
    };
  } catch {
    return createDefaultProfile();
  }
}

export function saveLocalProfile(profile: UserLivelihoodProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

export function hasCustomisedProfile(profile: UserLivelihoodProfile): boolean {
  return Boolean(
    profile.education ||
      profile.employmentStatus ||
      profile.skills.length > 0 ||
      profile.interests.length > 0 ||
      profile.careerGoals.length > 0 ||
      profile.businessInterests.length > 0 ||
      profile.preferredOpportunityTypes.length > 0 ||
      profile.location.city
  );
}

export interface PersonalisedRecommendation {
  id: string;
  type: 'udaan' | 'scheme' | 'job' | 'course' | 'business_idea';
  title: string;
  subtitle: string;
  path: string;
  reason: string;
  badge: string;
  score: number;
}

export function generatePersonalisedRecommendations(params: {
  profile: UserLivelihoodProfile;
  language: Language;
  udaanProgrammes: UdaanProgramme[];
  schemes: WelfareScheme[];
  jobs: JobListing[];
  courses: CourseListing[];
  businessIdeas: BusinessIdea[];
}): PersonalisedRecommendation[] {
  const { profile, language, udaanProgrammes, schemes, jobs, courses, businessIdeas } = params;
  const results: PersonalisedRecommendation[] = [];
  const stateLower = (profile.location.state || 'West Bengal').toLowerCase();
  const districtLabel = profile.location.district || profile.location.state || 'India';
  const isWB = stateLower.includes('west bengal');

  const userTokens = new Set(
    [
      ...profile.skills,
      ...profile.interests,
      ...profile.careerGoals,
      ...profile.businessInterests,
      ...profile.preferredOpportunityTypes,
      profile.employmentStatus,
      profile.education,
    ]
      .filter(Boolean)
      .map((s) => s.toLowerCase())
  );

  const wantsBusiness =
    profile.businessInterests.length > 0 ||
    profile.careerGoals.includes('start_business') ||
    profile.employmentStatus === 'self_employed' ||
    profile.preferredOpportunityTypes.includes('business');

  const wantsJob =
    profile.careerGoals.includes('find_job') ||
    profile.employmentStatus === 'seeking_job' ||
    profile.employmentStatus === 'student' ||
    profile.preferredOpportunityTypes.includes('jobs');

  const wantsSkills =
    profile.careerGoals.includes('learn_skills') ||
    profile.preferredOpportunityTypes.includes('training');

  // 1. Score UDAAN Programmes
  for (const prog of udaanProgrammes) {
    let score = 10;
    const reasons: LocalizedText[] = [];

    if (wantsBusiness && (prog.id === 'udaan-business-plan' || prog.id === 'udaan-msme-entrepreneur')) {
      score += 40;
      reasons.push({
        bn: 'আপনার ব্যবসা বা স্ব-নিযুক্তি লক্ষ্যের সাথে সরাসরি মানানসই',
        hi: 'आपके व्यवसाय और स्वरोजगार लक्ष्य से सीधे मेल खाता है',
        en: 'Matches your self-employment & business goal',
      });
    }
    if (wantsJob && (prog.id === 'udaan-interview-prep' || prog.id === 'udaan-soft-skills')) {
      score += 40;
      reasons.push({
        bn: 'আপনার চাকরি খোঁজা ও ইন্টারভিউ প্রস্তুতির লক্ষ্যের জন্য উপযোগী',
        hi: 'आपकी नौकरी खोज और इंटरव्यू तैयारी के लिए उपयुक्त',
        en: 'Tailored to your job search & interview readiness goal',
      });
    }
    if (
      (wantsSkills || profile.interests.includes('digital_skills')) &&
      prog.id === 'udaan-digital-pro'
    ) {
      score += 32;
      reasons.push({
        bn: 'আপনার ডিজিটাল ও পেশাদার দক্ষতা বৃদ্ধির আগ্রহের সাথে যুক্ত',
        hi: 'आपके डिजिटल और पेशेवर कौशल विकास की रुचि के अनुरूप',
        en: 'Aligns with your digital & professional growth interest',
      });
    }
    if (prog.skillTags.some((tag) => userTokens.has(tag))) {
      score += 18;
    }

    const reasonText =
      reasons.length > 0
        ? pickText(reasons[0], language)
        : tr(
            language,
            'JENOVA UDAAN-এর ব্যবহারিক স্ব-গতি প্রশিক্ষণ — বাস্তব কর্মদক্ষতার জন্য',
            'JENOVA UDAAN का व्यावहारिक प्रशिक्षण — वास्तविक कार्यक्षमता के लिए',
            'Practical JENOVA UDAAN self-paced module for career & livelihood readiness'
          );

    results.push({
      id: `rec-udaan-${prog.id}`,
      type: 'udaan',
      title: pickText(prog.title, language),
      subtitle: pickText(prog.tagline, language),
      path: `/udaan/${prog.id}`,
      reason: reasonText,
      badge: 'JENOVA UDAAN',
      score,
    });
  }

  // 2. Score Government Schemes (location + occupation + goals)
  for (const sch of schemes) {
    let score = 8;
    let reason = tr(
      language,
      `${districtLabel}-এ বসবাসকারী নাগরিকদের জন্য যাচাইকৃত সরকারি প্রকল্প`,
      `${districtLabel} के नागरिकों के लिए सत्यापित सरकारी योजना`,
      `Verified government scheme relevant for residents in ${districtLabel}`
    );

    if (isWB && sch.scope === 'West Bengal') {
      score += 24;
      reason = tr(
        language,
        `আপনার নির্বাচিত রাজ্য পশ্চিমবঙ্গ (${districtLabel})-এর বাসিন্দাদের জন্য প্রযোজ্য`,
        `आपके चयनित राज्य पश्चिम बंगाल (${districtLabel}) के निवासियों के लिए लागू`,
        `Applies to residents in your selected state: West Bengal (${districtLabel})`
      );
    } else if (!isWB && sch.scope === 'Central India') {
      score += 24;
      reason = tr(
        language,
        `${profile.location.state} সহ সারা ভারতের নাগরিকদের জন্য কেন্দ্রীয় প্রকল্প`,
        `${profile.location.state} सहित पूरे भारत के नागरिकों के लिए केंद्रीय योजना`,
        `Pan-India central scheme available in ${profile.location.state}`
      );
    } else if (!isWB && sch.scope === 'West Bengal') {
      score -= 12; // Lower priority for non-WB states
    }

    if (wantsBusiness && sch.category === 'MSME Support') {
      score += 34;
      reason = tr(
        language,
        'আপনার ক্ষুদ্র ব্যবসা ও স্ব-নিযুক্তি লক্ষ্যের সাথে প্রাসঙ্গিক সরকারি সহায়তা',
        'आपके लघु व्यवसाय और स्वरोजगार लक्ष्य से संबंधित सरकारी सहायता',
        'Matches your small business & entrepreneurship goal'
      );
    }
    if (profile.employmentStatus === 'student' && (sch.category === 'Education' || sch.category === 'Scholarships')) {
      score += 34;
      reason = tr(
        language,
        'আপনার ছাত্র/শিক্ষা প্রোফাইলের সাথে মানানসই সরকারি সহায়তা',
        'आपकी छात्र/शिक्षा प्रोफ़ाइल के अनुरूप सरकारी सहायता',
        'Matches your student education profile'
      );
    }
    if (
      (profile.employmentStatus === 'worker' || profile.employmentStatus === 'daily_wage') &&
      (sch.category === 'Social Security' || sch.category === 'Employment')
    ) {
      score += 26;
    }

    results.push({
      id: `rec-sch-${sch.id}`,
      type: 'scheme',
      title: pickText(sch.officialName, language),
      subtitle: pickText(sch.benefits, language),
      path: `/schemes/${sch.id}`,
      reason,
      badge: tr(language, 'সরকারি প্রকল্প', 'सरकारी योजना', 'Verified Scheme'),
      score,
    });
  }

  // 3. Score Jobs
  for (const job of jobs) {
    let score = 6;
    let reason = tr(
      language,
      `${districtLabel} ও ভারতের চাকরিপ্রার্থীদের জন্য যাচাইকৃত কর্মসংস্থান পোর্টাল`,
      `${districtLabel} और भारत के नौकरी खोजने वालों के लिए सत्यापित रोजगार अवसर`,
      `Verified employment pathway accessible from ${districtLabel}`
    );

    if (wantsJob) {
      score += 28;
      reason = tr(
        language,
        'আপনার চাকরি খোঁজার লক্ষ্যের সাথে প্রাসঙ্গিক যাচাইকৃত সুযোগ',
        'आपके रोजगार लक्ष्य के अनुरूप सत्यापित अवसर',
        'Matches your job-seeking goal with verified official source'
      );
    }
    if (isWB && job.location.toLowerCase().includes('west bengal')) {
      score += 22;
      reason = tr(
        language,
        `পশ্চিমবঙ্গ (${districtLabel})-এর বাসিন্দাদের জন্য অফিসিয়াল সরকারি কর্মসংস্থান পোর্টাল`,
        `पश्चिम बंगाल (${districtLabel}) के निवासियों के लिए आधिकारिक रोजगार पोर्टल`,
        `Official West Bengal employment opportunity for ${districtLabel}`
      );
    }
    if (
      profile.location.district &&
      job.location.toLowerCase().includes(profile.location.district.toLowerCase())
    ) {
      score += 20;
    }

    results.push({
      id: `rec-job-${job.id}`,
      type: 'job',
      title: pickText(job.title, language),
      subtitle: `${job.employerName} · ${job.location}`,
      path: `/jobs/${job.id}`,
      reason,
      badge: tr(language, 'কর্মসংস্থান', 'रोजगार', 'Employment'),
      score,
    });
  }

  // 4. Score Skill Courses
  for (const crs of courses) {
    let score = 5;
    let reason = tr(
      language,
      'বিনামূল্যে বা কম খরচে বাস্তব কর্মদক্ষতা অর্জনের যাচাইকৃত কোর্স',
      'निःशुल्क या कम लागत में व्यावहारिक कौशल सीखने का सत्यापित कोर्स',
      'Verified skill training course to strengthen employability'
    );
    if (wantsSkills || profile.employmentStatus === 'student') {
      score += 26;
      reason = tr(
        language,
        'আপনার দক্ষতা উন্নয়নের লক্ষ্যের সাথে সরাসরি মানানসই',
        'आपके कौशल विकास लक्ष्य से सीधे मेल खाता है',
        'Matches your skill development goal'
      );
    }
    if (
      profile.businessInterests.some((bi) =>
        crs.name.en.toLowerCase().includes(bi.toLowerCase()) ||
        crs.category.toLowerCase().includes(bi.toLowerCase())
      )
    ) {
      score += 28;
    }
    results.push({
      id: `rec-crs-${crs.id}`,
      type: 'course',
      title: pickText(crs.name, language),
      subtitle: `${crs.provider} · ${crs.fees}`,
      path: `/skills/${crs.id}`,
      reason,
      badge: tr(language, 'দক্ষতা কোর্স', 'कौशल कोर्स', 'Skill Course'),
      score,
    });
  }

  // 5. Score Business Ideas
  for (const idea of businessIdeas) {
    let score = 4;
    let reason = tr(
      language,
      `${districtLabel}-এর মতো শহর ও গ্রামাঞ্চলে কম পুঁজির স্ব-নিযুক্তি ধারণা`,
      `${districtLabel} जैसे कस्बों व ग्रामीण क्षेत्रों के लिए कम पूंजी का स्वरोजगार विचार`,
      `Practical low-capital self-employment idea suited to ${districtLabel}`
    );

    if (wantsBusiness) {
      score += 30;
      reason = tr(
        language,
        'আপনার স্ব-নিযুক্তি ও ক্ষুদ্র ব্যবসা গঠনের আগ্রহের ভিত্তিতে নির্বাচিত',
        'आपकी स्वरोजगार और लघु व्यवसाय रुचि के आधार पर चुना गया',
        'Selected based on your self-employment & small business interest'
      );
    }

    const ideaText = `${idea.title.en} ${idea.category} ${idea.skillsNeeded.join(' ')}`.toLowerCase();
    for (const bi of [...profile.businessInterests, ...profile.skills, ...profile.interests]) {
      if (bi && ideaText.includes(bi.toLowerCase().replace(/_/g, ' '))) {
        score += 26;
        reason = tr(
          language,
          `আপনার নির্বাচিত দক্ষতা/আগ্রহ (“${bi.replace(/_/g, ' ')}”)-এর সাথে সরাসরি যুক্ত`,
          `आपकी चुनी हुई रुचि/कौशल (“${bi.replace(/_/g, ' ')}”) से सीधे जुड़ा हुआ`,
          `Directly matches your selected skill/interest (“${bi.replace(/_/g, ' ')}”)`
        );
        break;
      }
    }

    results.push({
      id: `rec-idea-${idea.id}`,
      type: 'business_idea',
      title: pickText(idea.title, language),
      subtitle: `${idea.estimatedStartupRange} · ${idea.category}`,
      path: '/msme/planner',
      reason,
      badge: tr(language, 'স্ব-নিযুক্তি', 'स्वरोजगार', 'Self-Employment'),
      score,
    });
  }

  // Return balanced top recommendations across pillars (top 6, max 2 per category)
  const sorted = results.sort((a, b) => b.score - a.score);
  const picked: PersonalisedRecommendation[] = [];
  const typeCounts: Record<string, number> = {};

  for (const item of sorted) {
    if (picked.length >= 6) break;
    const count = typeCounts[item.type] || 0;
    if (count >= 2) continue;
    picked.push(item);
    typeCounts[item.type] = count + 1;
  }

  return picked;
}
