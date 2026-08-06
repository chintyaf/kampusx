import React from 'react';
import { Route } from 'react-router-dom';

// Learner Pages
import OnboardingPage from '@/pages/lms/learner/onboarding/OnboardingPage';
import CatalogPage from '@/pages/lms/learner/catalog/CatalogPage';
import ModuleDetailPage from '@/pages/lms/learner/modules/ModuleDetailPage';
import ForethoughtPage from '@/pages/lms/learner/modules/forethought/ForethoughtPage';
import QuizPage from '@/pages/lms/learner/modules/quiz/QuizPage';
import ReflectionPage from '@/pages/lms/learner/modules/reflection/ReflectionPage';
import AnalyticsPage from '@/pages/lms/learner/analytics/AnalyticsPage';
import BadgesPage from '@/pages/lms/learner/badges/BadgesPage';
import SettingsPage from '@/pages/lms/learner/settings/SettingsPage';

// Organizer Pages
import DashboardPage from '@/pages/lms/organizer/dashboard/DashboardPage';
import ContentPage from '@/pages/lms/organizer/content/ContentPage';
import UploadPage from '@/pages/lms/organizer/ai-studio/upload/UploadPage';
import ReviewPage from '@/pages/lms/organizer/ai-studio/review/ReviewPage';
import LearningPathsPage from '@/pages/lms/organizer/learning-paths/LearningPathsPage';
import OrganizerBadgesPage from '@/pages/lms/organizer/badges/BadgesPage';
import LogsPage from '@/pages/lms/organizer/logs/LogsPage';

export const LmsRoutes = [
  // Learner Domain Routes
  <Route key="lms-learner-onboarding" path="/learner/onboarding" element={<OnboardingPage />} />,
  <Route key="lms-learner-catalog" path="/learner/catalog" element={<CatalogPage />} />,
  <Route key="lms-learner-module-detail" path="/learner/modules/:moduleId" element={<ModuleDetailPage />} />,
  <Route key="lms-learner-forethought" path="/learner/modules/:moduleId/forethought" element={<ForethoughtPage />} />,
  <Route key="lms-learner-quiz" path="/learner/modules/:moduleId/quiz" element={<QuizPage />} />,
  <Route key="lms-learner-reflection" path="/learner/modules/:moduleId/reflection" element={<ReflectionPage />} />,
  <Route key="lms-learner-analytics" path="/learner/analytics" element={<AnalyticsPage />} />,
  <Route key="lms-learner-badges" path="/learner/badges" element={<BadgesPage />} />,
  <Route key="lms-learner-settings" path="/learner/settings" element={<SettingsPage />} />,

  // Organizer Domain Routes
  // Map `/organizer/dashboard` to LMS Dashboard as well as other organizer pages
  <Route key="lms-organizer-dashboard" path="/organizer/dashboard" element={<DashboardPage />} />,
  <Route key="lms-organizer-content" path="/organizer/content" element={<ContentPage />} />,
  <Route key="lms-organizer-upload" path="/organizer/ai-studio/upload" element={<UploadPage />} />,
  <Route key="lms-organizer-review" path="/organizer/ai-studio/review" element={<ReviewPage />} />,
  <Route key="lms-organizer-learning-paths" path="/organizer/learning-paths" element={<LearningPathsPage />} />,
  <Route key="lms-organizer-badges" path="/organizer/badges" element={<OrganizerBadgesPage />} />,
  <Route key="lms-organizer-logs" path="/organizer/logs" element={<LogsPage />} />,
];

export default LmsRoutes;
