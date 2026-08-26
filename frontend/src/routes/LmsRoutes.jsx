import React from 'react';
import { Route } from 'react-router-dom';

// Learner Pages
import OnboardingPage from '@/pages/lms/learner/onboarding/OnboardingPage';
import CatalogPage from '@/pages/lms/learner/catalog/CatalogPage';
import ModuleDetailPage from '@/pages/lms/learner/modules/ModuleDetailPage';
import GoalSettingPage from '@/pages/lms/learner/modules/goals/GoalSettingPage';
import QuizPage from '@/pages/lms/learner/modules/quiz/QuizPage';
import SelfAssessmentPage from '@/pages/lms/learner/modules/assessment/SelfAssessmentPage';
import AnalyticsPage from '@/pages/lms/learner/analytics/AnalyticsPage';
import AchievementsPage from '@/pages/lms/learner/achievements/AchievementsPage';
import SettingsPage from '@/pages/lms/learner/settings/SettingsPage';

// Organizer Pages
import DashboardPage from '@/pages/lms/organizer/dashboard/DashboardPage';
import ContentPage from '@/pages/lms/organizer/content/ContentPage';
import UploadPage from '@/pages/lms/organizer/ai-studio/upload/UploadPage';
import ReviewPage from '@/pages/lms/organizer/ai-studio/review/ReviewPage';
import LearningPathsPage from '@/pages/lms/organizer/learning-paths/LearningPathsPage';
import OrganizerBadgesPage from '@/pages/lms/organizer/badges/BadgesPage';
import ActivityLogsPage from '@/pages/lms/organizer/activity-logs/ActivityLogsPage';

export const LearnerLmsRoutes = (
  <Route path="/learner">
    <Route path="onboarding" element={<OnboardingPage />} />
    <Route path="catalog" element={<CatalogPage />} />
    <Route path="analytics" element={<AnalyticsPage />} />
    <Route path="achievements" element={<AchievementsPage />} />
    <Route path="settings" element={<SettingsPage />} />
    
    {/* Module Nested Routing */}
    <Route path="modules/:moduleId">
      <Route index element={<ModuleDetailPage />} />
      <Route path="goals" element={<GoalSettingPage />} />
      <Route path="quiz" element={<QuizPage />} />
      <Route path="assessment" element={<SelfAssessmentPage />} />
    </Route>
  </Route>
);

export const OrganizerLmsRoutes = (
  <Route path="/organizer">
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="content" element={<ContentPage />} />
    <Route path="learning-paths" element={<LearningPathsPage />} />
    <Route path="badges" element={<OrganizerBadgesPage />} />
    <Route path="activity-logs" element={<ActivityLogsPage />} />
    
    {/* AI Studio Nested Routing */}
    <Route path="ai-studio">
      <Route path="upload" element={<UploadPage />} />
      <Route path="review" element={<ReviewPage />} />
    </Route>
  </Route>
);

