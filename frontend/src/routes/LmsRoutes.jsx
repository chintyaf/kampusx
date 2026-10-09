import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Layouts
import MemberLayout from '@/layouts/MemberLayout'; // Sesuaikan path layout Anda

// Learner Pages
import LearningDashboard from '@/pages/lms/learner/LearningDashboard'; // Sesuaikan path jika berbeda
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
			{/* 1. LEARNER DOMAIN (Menggunakan MemberLayout) */}
			<Route element={<MemberLayout />}>
				<Route path="/learning" element={<LearningDashboard />} />
				<Route path="/learner/dashboard" element={<Navigate to="/learning" replace />} />

				<Route path="/learner/onboarding" element={<OnboardingPage />} />
				<Route path="/learner/catalog" element={<CatalogPage />} />
				<Route path="/learner/explore" element={<ExploreMicrolearningPage />} />

				{/* Learning Paths */}
				<Route path="/learner/learning-paths" element={<LearningPathDetail />} />
				<Route path="/learner/learning-paths/:pathId" element={<LearningPathDetail />} />

				{/* Modules & Lessons */}
				<Route path="/learner/modules/:moduleId" element={<ModuleDetailPage />} />
				<Route
					path="/learner/modules/:moduleId/forethought"
					element={<ForethoughtPage />}
				/>
				<Route path="/learner/modules/:moduleId/quiz" element={<QuizPage />} />
				<Route path="/learner/modules/:moduleId/reflection" element={<ReflectionPage />} />
				<Route
					path="/learner/modules/:moduleId/lessons/:lessonId"
					element={<LessonViewerPage />}
				/>

				{/* Shortcut Direct Lesson Access */}
				<Route path="/learner/lessons/:lessonId" element={<LessonViewerPage />} />

				{/* User Profile & Settings */}
				<Route path="/learner/analytics" element={<AnalyticsPage />} />
				<Route path="/learner/badges" element={<BadgesPage />} />
				<Route path="/learner/settings" element={<SettingsPage />} />
			</Route>

			{/* 2. ORGANIZER DOMAIN */}
			<Route path="/organizer">
				<Route path="dashboard" element={<DashboardPage />} />
				<Route path="content" element={<ContentPage />} />
				<Route path="learning-paths" element={<LearningPathsPage />} />
				<Route path="badges" element={<OrganizerBadgesPage />} />
				<Route path="logs" element={<LogsPage />} />

				{/* AI Studio Sub-routes */}
				<Route path="ai-studio/upload" element={<UploadPage />} />
				<Route path="ai-studio/review" element={<ReviewPage />} />
			</Route>
		</Routes>
	);
};

export default LmsRoutes;
