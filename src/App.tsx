/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { JenovaMark } from './components/JenovaLogo';
import { HomePage } from './pages/HomePage';
import { FindJobsPage, JobDetailsPage } from './pages/JobsPages';
import { CourseDetailsPage, SkillDevelopmentPage } from './pages/SkillsPages';
import { SchemeDetailsPage, SchemesDirectoryPage } from './pages/SchemesPages';
import {
  BusinessIdeasPage,
  LocalBusinessDirectoryPage,
  MsmeSupportHubPage,
} from './pages/MsmePages';
import { AssistantPage } from './pages/AssistantPage';
import {
  AboutPage,
  AuthPage,
  ContactSupportPage,
  UserDashboardPage,
} from './pages/CommunityPages';

// Lazy-load heavier chart, admin & P0/P1 tool bundles for fast initial mobile paint
const FinancialLiteracyHubPage = lazy(() =>
  import('./pages/FinancePages').then((m) => ({ default: m.FinancialLiteracyHubPage }))
);
const BudgetCalculatorPage = lazy(() =>
  import('./pages/FinancePages').then((m) => ({ default: m.BudgetCalculatorPage }))
);
const SavingsCalculatorPage = lazy(() =>
  import('./pages/FinancePages').then((m) => ({ default: m.SavingsCalculatorPage }))
);
const EmiCalculatorPage = lazy(() =>
  import('./pages/FinancePages').then((m) => ({ default: m.EmiCalculatorPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const ScamCheckerPage = lazy(() =>
  import('./pages/ScamCheckerPage').then((m) => ({ default: m.ScamCheckerPage }))
);
const FolderCheckPage = lazy(() =>
  import('./pages/FolderCheckPage').then((m) => ({ default: m.FolderCheckPage }))
);
const LocalHelpPage = lazy(() =>
  import('./pages/LocalHelpPage').then((m) => ({ default: m.LocalHelpPage }))
);
const UpdatesRemindersPage = lazy(() =>
  import('./pages/UpdatesRemindersPage').then((m) => ({ default: m.UpdatesRemindersPage }))
);
const BiodataBuilderPage = lazy(() =>
  import('./pages/BiodataBuilderPage').then((m) => ({ default: m.BiodataBuilderPage }))
);
const UdaanHubPage = lazy(() =>
  import('./pages/UdaanPage').then((m) => ({ default: m.UdaanHubPage }))
);
const UdaanProgrammeDetailPage = lazy(() =>
  import('./pages/UdaanPage').then((m) => ({ default: m.UdaanProgrammeDetailPage }))
);
const ActionPassportPage = lazy(() =>
  import('./pages/ActionPassportPage').then((m) => ({ default: m.ActionPassportPage }))
);
const BusinessPlannerPage = lazy(() =>
  import('./pages/BusinessPlannerPage').then((m) => ({ default: m.BusinessPlannerPage }))
);

function RouteFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center gap-3 text-sm text-[#454545] dark:text-[#DDD2C5]">
      <JenovaMark size={40} className="animate-pulse" />
      <span className="font-semibold tracking-wide text-[#26364B] dark:text-[#FFF5E8]">JENOVA</span>
      <span className="text-xs text-[#665B4F] dark:text-[#B6A695]">Loading section...</span>
    </div>
  );
}

function PlatformRouter() {
  const { route } = useApp();
  const cleanRoute = route.replace(/\/+$/, '') || '/';

  // 1. Home
  if (cleanRoute === '/') return <HomePage />;

  // P0 Signature Features: JENOVA Voice, JENOVA Protect, JENOVA Checklist, JENOVA Local, Updates
  if (cleanRoute === '/assistant') return <AssistantPage />;
  if (cleanRoute === '/scam-check') return <ScamCheckerPage />;
  if (cleanRoute === '/checklist') return <FolderCheckPage />;
  if (cleanRoute.startsWith('/checklist/')) {
    return <FolderCheckPage initialSchemeId={cleanRoute.slice('/checklist/'.length)} />;
  }
  if (cleanRoute === '/local-help') return <LocalHelpPage />;
  if (cleanRoute === '/updates') return <UpdatesRemindersPage />;

  // 2 & 3. Find Jobs, 1-Minute Biodata Builder & Job Details
  if (cleanRoute === '/jobs') return <FindJobsPage />;
  if (cleanRoute === '/jobs/biodata') return <BiodataBuilderPage />;
  if (cleanRoute.startsWith('/jobs/')) {
    return <JobDetailsPage jobId={cleanRoute.slice('/jobs/'.length)} />;
  }

  // 4 & 5. Skill Development & Course Details
  if (cleanRoute === '/skills') return <SkillDevelopmentPage />;
  if (cleanRoute.startsWith('/skills/')) {
    return <CourseDetailsPage courseId={cleanRoute.slice('/skills/'.length)} />;
  }

  // 6, 7, 8, 9. Financial Literacy & Calculators
  if (cleanRoute === '/finance' || cleanRoute === '/finance/fraud-awareness') {
    return <FinancialLiteracyHubPage />;
  }
  if (cleanRoute === '/finance/budget') return <BudgetCalculatorPage />;
  if (cleanRoute === '/finance/savings') return <SavingsCalculatorPage />;
  if (cleanRoute === '/finance/emi') return <EmiCalculatorPage />;

  // 10 & 11. Government Schemes & Scheme Details
  if (cleanRoute === '/schemes') return <SchemesDirectoryPage />;
  if (cleanRoute.startsWith('/schemes/')) {
    return <SchemeDetailsPage schemeId={cleanRoute.slice('/schemes/'.length)} />;
  }

  // JENOVA UDAAN Training & Action Passport
  if (cleanRoute === '/udaan') return <UdaanHubPage />;
  if (cleanRoute.startsWith('/udaan/')) {
    return <UdaanProgrammeDetailPage programmeId={cleanRoute.slice('/udaan/'.length)} />;
  }
  if (cleanRoute === '/passport') return <ActionPassportPage />;

  // 12, 13, 14. MSME Support, Business Plan Builder, Business Ideas, Local Business Directory
  if (cleanRoute === '/msme') return <MsmeSupportHubPage />;
  if (cleanRoute === '/msme/planner') return <BusinessPlannerPage />;
  if (cleanRoute === '/msme/ideas') return <BusinessIdeasPage />;
  if (cleanRoute === '/msme/directory') return <LocalBusinessDirectoryPage />;

  // 16 & 17. About & Contact
  if (cleanRoute === '/about') return <AboutPage />;
  if (cleanRoute === '/contact') return <ContactSupportPage />;

  // 18, 19, 20. User Dashboard, Auth, Admin Dashboard
  if (cleanRoute === '/dashboard') return <UserDashboardPage />;
  if (cleanRoute === '/auth' || cleanRoute === '/login' || cleanRoute === '/register') {
    return <AuthPage />;
  }
  if (cleanRoute === '/admin') return <AdminDashboardPage />;

  return <HomePage />;
}

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Suspense fallback={<RouteFallback />}>
          <PlatformRouter />
        </Suspense>
      </Layout>
    </AppProvider>
  );
}
