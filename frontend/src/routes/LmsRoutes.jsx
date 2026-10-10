import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Layouts
import MemberLayout from '@/layouts/MemberLayout';

// Learner Pages
import LearningDashboard from '@/pages/lms/learner/LearningDashboard';
import OnboardingPage from '@/pages/lms/learner/onboarding/OnboardingPage';
import CatalogPage from '@/pages/lms/learner/catalog/CatalogPage';
import ModuleDetailPage from '@/pages/lms/learner/ModuleDetailPage';
import LessonViewerPage from '@/pages/lms/learner/LessonViewerPage';
import ForethoughtPage from '@/pages/lms/learner/modules/forethought/ForethoughtPage';
import QuizPage from '@/pages/lms/learner/modules/quiz/QuizPage';
import ReflectionPage from '@/pages/lms/learner/modules/reflection/ReflectionPage';
import AnalyticsPage from '@/pages/lms/learner/analytics/AnalyticsPage';
import BadgesPage from '@/pages/lms/learner/badges/BadgesPage';
import SettingsPage from '@/pages/lms/learner/settings/SettingsPage';
import ExploreMicrolearningPage from '@/pages/lms/learner/ExploreMicrolearningPage';
import LearningPathDetail from '@/pages/lms/learner/LearningPathDetail';

// Organizer Pages
import DashboardPage from '@/pages/lms/organizer/dashboard/DashboardPage';
import ContentPage from '@/pages/lms/organizer/content/ContentPage';
import UploadPage from '@/pages/lms/organizer/ai-studio/upload/UploadPage';
import ReviewPage from '@/pages/lms/organizer/ai-studio/review/ReviewPage';
import LearningPathsPage from '@/pages/lms/organizer/learning-paths/LearningPathsPage';
import OrganizerBadgesPage from '@/pages/lms/organizer/badges/BadgesPage';
import LogsPage from '@/pages/lms/organizer/logs/LogsPage';

export const LmsRoutes = () => {
	return (
		<Routes>
			{/* 1. LEARNER DOMAIN */}
			<Route element={<MemberLayout />}>
				{/* Top-Level Shortcuts */}
				<Route path="/explore-microlearning" element={<ExploreMicrolearningPage />} />
				<Route path="/learning" element={<LearningDashboard />} />

				{/* Group Prefix: /learner */}
				<Route path="/learner">
					<Route path="explore" element={<ExploreMicrolearningPage />} />
					<Route path="dashboard" element={<Navigate to="/learning" replace />} />
					<Route path="onboarding" element={<OnboardingPage />} />
					<Route path="catalog" element={<CatalogPage />} />

					{/* Group Prefix: /learner/learning-paths */}
					<Route path="learning-paths">
						<Route index element={<LearningPathDetail />} />
						<Route path=":pathId" element={<LearningPathDetail />} />
					</Route>

					{/* Group Prefix: /learner/modules/:moduleId */}
					<Route path="modules/:moduleId">
						<Route index element={<ModuleDetailPage />} />
						<Route path="forethought" element={<ForethoughtPage />} />
						<Route path="quiz" element={<QuizPage />} />
						<Route path="reflection" element={<ReflectionPage />} />
						<Route path="lessons/:lessonId" element={<LessonViewerPage />} />
					</Route>

					{/* Direct Lesson Shortcut */}
					<Route path="lessons/:lessonId" element={<LessonViewerPage />} />

					{/* Learner Profile & Settings */}
					<Route path="analytics" element={<AnalyticsPage />} />
					<Route path="badges" element={<BadgesPage />} />
					<Route path="settings" element={<SettingsPage />} />
				</Route>
			</Route>

			{/* 2. ORGANIZER DOMAIN */}
			<Route path="/organizer">
				<Route path="dashboard" element={<DashboardPage />} />
				<Route path="content" element={<ContentPage />} />
				<Route path="learning-paths" element={<LearningPathsPage />} />
				<Route path="badges" element={<OrganizerBadgesPage />} />
				<Route path="logs" element={<LogsPage />} />

				{/* Group Prefix: /organizer/ai-studio */}
				<Route path="ai-studio">
					<Route path="upload" element={<UploadPage />} />
					<Route path="review" element={<ReviewPage />} />
				</Route>
			</Route>
		</Routes>
	);
};

export default LmsRoutes;
