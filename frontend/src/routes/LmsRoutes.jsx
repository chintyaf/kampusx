import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Layouts & Protection
import LmsLayout from '@/layouts/lms/LmsLayout';
import OrgLmsLayout from '@/layouts/OrgLmsLayout';
import ProtectedRoute from './ProtectedRoute';

// 1. Learner Domain Pages
import ExploreMicrolearningPage from '@/pages/lms/learner/ExploreMicrolearningPage';
import LearningDashboard from '@/pages/lms/learner/LearningDashboard';
import ModuleDetailPage from '@/pages/lms/learner/ModuleDetailPage';
import LessonViewerPage from '@/pages/lms/learner/LessonViewerPage';
import LearningPathDetail from '@/pages/lms/learner/LearningPathDetail';
import ForethoughtPage from '@/pages/lms/learner/modules/forethought/ForethoughtPage';
import QuizPage from '@/pages/lms/learner/modules/quiz/QuizPage';
import ReflectionPage from '@/pages/lms/learner/modules/reflection/ReflectionPage';
import ModuleCompletionPage from '@/pages/lms/learner/modules/completion/ModuleCompletionPage';
import LearningPathCertificatePage from '@/pages/lms/learner/certificate/LearningPathCertificatePage';
import AnalyticsPage from '@/pages/lms/learner/analytics/AnalyticsPage';
import BadgeCertificatePage from '@/pages/lms/learner/badges/BadgeCertificatePage';
import SettingsPage from '@/pages/lms/learner/settings/SettingsPage';

// 2. Organizer Domain Pages
import OrgMicrolearning from '@/pages/lms/organizer/OrgMicrolearning';
import ManageLearningPathPage from '@/pages/lms/organizer/ManageLearningPathPage';
import DashboardPage from '@/pages/lms/organizer/dashboard/DashboardPage';
import LearningPathsPage from '@/pages/lms/organizer/learning-paths/LearningPathsPage';
import CreateLearningPage from '@/pages/lms/organizer/CreateLearningPage';
import EditModulePage from '@/pages/lms/organizer/EditModulePage';
import EditLessonPage from '@/pages/lms/organizer/EditLessonPage';
import ContentPage from '@/pages/lms/organizer/content/ContentPage';
import OrganizerBadgesPage from '@/pages/lms/organizer/badges/BadgesPage';
import LogsPage from '@/pages/lms/organizer/logs/LogsPage';
import UploadPage from '@/pages/lms/organizer/ai-studio/upload/UploadPage';
import ReviewPage from '@/pages/lms/organizer/ai-studio/review/ReviewPage';

export const LmsRoutes = () => {
	return (
		<Routes>
			{/* 1. LEARNER DOMAIN */}
			<Route element={<LmsLayout />}>
				{/* Top-Level Shortcuts */}
				<Route path="/explore-microlearning" element={<ExploreMicrolearningPage />} />
				<Route path="/learning" element={<LearningDashboard />} />

				{/* Group Prefix: /learner */}
				<Route path="/learner">
					<Route path="explore" element={<ExploreMicrolearningPage />} />
					<Route path="dashboard" element={<Navigate to="/learning" replace />} />

					{/* Group Prefix: /learner/learning-paths */}
					<Route path="learning-paths">
						<Route index element={<LearningPathDetail />} />
						<Route path=":pathId" element={<LearningPathDetail />} />
						<Route path=":pathId/certificate" element={<LearningPathCertificatePage />} />
					</Route>

					{/* Group Prefix: /learner/modules/:moduleId */}
					<Route path="modules/:moduleId">
						<Route index element={<ModuleDetailPage />} />
						<Route path="forethought" element={<ForethoughtPage />} />
						<Route path="quiz" element={<QuizPage />} />
						<Route path="reflection" element={<ReflectionPage />} />
						<Route path="completed" element={<ModuleCompletionPage />} />
					</Route>

					<Route path="certificate/:pathId" element={<LearningPathCertificatePage />} />

					{/* Learner Profile & Settings */}
					<Route path="analytics" element={<AnalyticsPage />} />
					<Route path="badges" element={<BadgeCertificatePage />} />
					<Route path="settings" element={<SettingsPage />} />
				</Route>

				{/* Direct Lesson Shortcuts */}
				<Route path="learner/:moduleId/:lessonId" element={<LessonViewerPage />} />
				<Route path="learner/lessons/:lessonId" element={<LessonViewerPage />} />
			</Route>

			{/* 2. ORGANIZER DOMAIN */}
			<Route element={<OrgLmsLayout />}>
				<Route element={<ProtectedRoute allowedRole={['admin', 'organizer']} />}>
					<Route path="/organizer">
						<Route path="microlearning" element={<OrgMicrolearning />} />
						<Route path="dashboard" element={<DashboardPage />} />

						<Route path="learning-path/add" element={<CreateLearningPage />} />
						<Route
							path="learning-path/:learningId"
							element={<ManageLearningPathPage />}
						/>
						<Route
							path="learning-path/:learningId/edit-module/:moduleId"
							element={<EditModulePage />}
						/>
						<Route
							path="learning-path/:learningId/edit-module/:moduleId/:lessonId"
							element={<EditLessonPage />}
						/>
						<Route path="modules/:moduleId" element={<EditLessonPage />} />

						<Route path="learning-paths" element={<LearningPathsPage />} />

						<Route path="content" element={<ContentPage />} />
						<Route path="badges" element={<OrganizerBadgesPage />} />
						<Route path="logs" element={<LogsPage />} />

						{/* Group Prefix: /organizer/ai-studio */}
						<Route path="ai-studio">
							<Route path="upload" element={<UploadPage />} />
							<Route path="review" element={<ReviewPage />} />
						</Route>
					</Route>
				</Route>
			</Route>
		</Routes>
	);
};

export default LmsRoutes;
