export interface VisualAsset {
  src: string;
  alt: string;
}

export const VISUAL_ASSETS = {
  heroCommunityEmpowerment: {
    src: '/src/assets/images/hero_community_empowerment_1795068308541.jpg',
    alt: '3D illustration symbolizing community empowerment, financial independence, education, and opportunity across India',
  },
  aboutPathwaysOpportunity: {
    src: '/assets/aistudio/Pathways_to_Opportunity_and_Community_69a65adf.png',
    alt: 'Pathways to Opportunity and Community — illustration showing a student with a friendly robot along a glowing golden pathway surrounded by government schemes, job search, digital safety, and education icons',
  },
  employmentProfessionals: {
    src: '/src/assets/images/employment_indian_professionals_1795068308120.jpg',
    alt: 'Young Indian office professionals collaborating over a laptop in a modern local workplace',
  },
  employmentTechnicians: {
    src: '/src/assets/images/employment_skilled_technicians_1795068309027.jpg',
    alt: 'Skilled Indian electrical technician carefully inspecting equipment in a local technical workshop',
  },
  educationDigitalSkills: {
    src: '/src/assets/images/education_digital_skills_1795068307922.jpg',
    alt: 'Students and young adults learning computer and digital skills together in a local training centre',
  },
  educationVocationalTailoring: {
    src: '/src/assets/images/education_vocational_tailoring_1795068309472.jpg',
    alt: 'Women participating in practical vocational tailoring and garment stitching training',
  },
  financeSavingsGrowth: {
    src: '/src/assets/images/finance_3d_savings_growth_1795068307700.jpg',
    alt: '3D financial literacy illustration featuring a piggy bank, savings jar, calculator, coins, and growth chart',
  },
  financeUpiSecurity: {
    src: '/src/assets/images/finance_3d_upi_security_1795068307539.jpg',
    alt: '3D digital payment safety illustration showing a security shield, smartphone wallet, and protected coins',
  },
  schemesCommunityWelfare: {
    src: '/src/assets/images/schemes_community_welfare_1795068307537.jpg',
    alt: 'Neutral 3D illustration representing education, healthcare, housing, agriculture, and family welfare support',
  },
  msmeEntrepreneurs: {
    src: '/src/assets/images/msme_indian_entrepreneurs_1795068308975.jpg',
    alt: 'Small business woman entrepreneur managing her local retail shop and textiles counter',
  },
  msmeBusinessGrowth: {
    src: '/src/assets/images/msme_3d_business_growth_1795068307836.jpg',
    alt: '3D MSME growth illustration depicting a modern local storefront with rising business progress indicators',
  },
  aiAssistantMascot: {
    src: '/src/assets/images/ai_assistant_mascot_1795068305759.jpg',
    alt: 'Friendly 3D green and white AI Community Assistant mascot for financial and opportunity guidance',
  },
  bgCreamAbstract: {
    src: '/src/assets/images/bg_cream_organic_abstract_1795068307917.jpg',
    alt: 'Soft cream, deep green, and warm orange organic abstract background texture',
  },
  udaanHeroLearner: {
    src: '/src/assets/images/udaan_hero_learner_1795204110657.jpg',
    alt: 'Confident young Indian learner holding notebooks in a bright sunlit skill development studio',
  },
  udaanInterviewPrep: {
    src: '/src/assets/images/udaan_interview_prep_1795204110403.jpg',
    alt: 'Young Indian professional smiling confidently during a one-on-one job interview in a sunlit office',
  },
  udaanBusinessPlan: {
    src: '/src/assets/images/udaan_business_plan_1795204112946.jpg',
    alt: 'Indian entrepreneur mapping out a practical startup plan and budget ledger with calculator and notebook',
  },
  udaanSoftSkills: {
    src: '/src/assets/images/udaan_soft_skills_1795204110533.jpg',
    alt: 'Facilitator leading an interactive communication and personality development workshop for young Indian learners',
  },
  udaanDigitalSkills: {
    src: '/src/assets/images/udaan_digital_skills_1795204109900.jpg',
    alt: 'Modern laptop showing structured spreadsheets and presentation layouts on a warm wooden workspace desk',
  },
  udaanMsmeEntrepreneur: {
    src: '/src/assets/images/udaan_msme_entrepreneur_1795204111572.jpg',
    alt: 'Smiling Indian micro-entrepreneur standing proudly behind the counter of an organized local retail store',
  },
  udaanPracticalExec: {
    src: '/src/assets/images/udaan_practical_exec_1795204110940.jpg',
    alt: 'Two focused Indian vocational trainees collaborating hands-on at a practical workshop workbench',
  },
} as const satisfies Record<string, VisualAsset>;
