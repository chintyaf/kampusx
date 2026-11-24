import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Layouts & Protection
import LmsLayout from '@/layouts/lms/LmsLayout';
import OrgLmsLayout from '@/layouts/OrgLmsLayout';
// import ProtectedRoute from './ProtectedRoute';

// 1. Learner Domain Pages
import ExploreMicrolearningPage from '@/pages/lms/learner/ExploreMicrolearningPage';
import LearningDashboard from '@/pages/lms/learner/LearningDashboard';
import ModuleDetailPage from '@/pages/lms/learner/ModuleDetailPage';
import LessonViewerPage from '@/pages/lms/learner/LessonViewerPage';
import LearningPathDetailPage from '@/pages/lms/learner/LearningPathDetailPage';
import ForethoughtPage from '@/pages/lms/learner/modules/forethought/ForethoughtPage';
import QuizPage from '@/pages/lms/learner/QuizPage';
import ReflectionPage from '@/pages/lms/learner/ReflectionPage';
import ModuleCompletionPage from '@/pages/lms/learner/modules/completion/ModuleCompletionPage';
import LearningPathCertificatePage from '@/pages/lms/learner/certificate/LearningPathCertificatePage';
import AnalyticsPage from '@/pages/lms/learner/analytics/AnalyticsPage';
import BadgeCertificatePage from '@/pages/lms/learner/badges/BadgeCertificatePage';
import SettingsPage from '@/pages/lms/learner/settings/SettingsPage';

// 2. Organizer Domain Pages
import OrgMicrolearning from '@/pages/lms/organizer/OrgMicrolearning';
// import ManageLearningPathPage from '@/pages/lms/organizer/ManageLearningPathPage';
import EditLearningPathPage from '@/pages/lms/organizer/EditLearningPathPage';
import DashboardPage from '@/pages/lms/organizer/dashboard/DashboardPage';
// import LearningPathsPage from '@/pages/lms/organizer/learning-paths/LearningPathsPage';
// import CreateLearningPage from '@/pages/lms/organizer/CreateLearningPage';

import LmsEditorLayout from '@/pages/lms/organizer/lms-editor/layout/LmsEditorLayout';
// import EditModulePage from '@/pages/lms/organizer/lms-editor/EditModulePage';
import ModuleInfoPage from '@/pages/lms/organizer/lms-editor/ModuleInfoPage';
import LessonEditorPage from '@/pages/lms/organizer/lms-editor/LessonEditorPage';
import QuizEditorPage from '@/pages/lms/organizer/lms-editor/QuizEditorPage';

// import EditLessonPage from '@/pages/lms/organizer/EditLessonPage';

import UploadPage from '@/pages/lms/organizer/ai-studio/upload/UploadPage';
import ReviewPage from '@/pages/lms/organizer/ai-studio/review/ReviewPage';
import LearningPathsPage from '@/pages/lms/organizer/learning-paths/LearningPathsPage';
import ManageLearningPathPage from '../pages/lms/organizer/ManageLearningPathPage';
// import OrganizerBadgesPage from '@/pages/lms/organizer/badges/BadgesPage';
// import LogsPage from '@/pages/lms/organizer/LogsPage';
import CreateLearningPage from '../pages/lms/organizer/CreateLearningPage';

import DashboardLayout from '@/layouts/DashboardLayout';
// import OrgLearningLayout from '@/layouts/OrgLearningLayout';
import ProtectedRoute from './ProtectedRoute';
import EditModulePage from '../pages/lms/organizer/lms-editor/EditModulePage';
import EditLessonPage from '../pages/lms/organizer/EditLessonPage';

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

					<Route path="learning-paths/:slug">
						<Route index element={<LearningPathDetailPage />} />
						<Route path="certificate" element={<LearningPathCertificatePage />} />

						{/* /learner/learning-paths/:slug/modules/:moduleId */}
						<Route path="modules/:moduleId">
							<Route index element={<ModuleDetailPage />} />
							<Route path="forethought" element={<ForethoughtPage />} />
							<Route path="lessons/:lessonId?" element={<LessonViewerPage />} />
							<Route path="quiz" element={<QuizPage />} />
							<Route path="reflection" element={<ReflectionPage />} />
							<Route path="completed" element={<ModuleCompletionPage />} />
						</Route>
					</Route>

					<Route path="certificate/:pathId" element={<LearningPathCertificatePage />} />

					{/* Learner Profile & Settings */}
					<Route path="analytics" element={<AnalyticsPage />} />
					<Route path="badges" element={<BadgeCertificatePage />} />
					<Route path="settings" element={<SettingsPage />} />
				</Route>

				{/* 3 rute "Direct Lesson Shortcuts" lama dihapus */}
			</Route>

			{/* 2. ORGANIZER DOMAIN */}
			<Route element={<OrgLmsLayout />}>
				<Route element={<ProtectedRoute allowedRole={['admin', 'organizer']} />}>
					<Route path="/organizer">
						{/* GENERAL / OVERVIEW */}
						<Route path="dashboard" element={<DashboardPage />} />
						<Route path="microlearning" element={<OrgMicrolearning />} />

						{/* LEARNING PATH */}
						<Route path="learning-paths" element={<LearningPathsPage />} />
						<Route path="learning-path/add" element={<CreateLearningPage />} />

						{/* LEARNING PATH EDIT */}
						<Route path="learning-path/:learningId" element={<ManageLearningPathPage />} />
						<Route path="learning-path/:learningId/edit" element={<EditLearningPathPage />} />
						{/* ==== */}

						{/* AI STUDIO */}
						<Route path="ai-studio">
							<Route path="upload" element={<UploadPage />} />
							<Route path="review" element={<ReviewPage />} />
						</Route>
					</Route>
				</Route>
			</Route>

			<Route element={<ProtectedRoute allowedRole={['admin', 'organizer']} />}>
				{/* LMS EDITOR */}
				<Route path="/organizer/learning-path/:learningId/modules/:moduleId" element={<LmsEditorLayout />}>
					<Route index element={<Navigate to="info" replace />} />
					<Route path="info" element={<ModuleInfoPage />} />
					<Route path="lessons/:lessonId" element={<LessonEditorPage />} />
					<Route path="quiz" element={<QuizEditorPage />} />
				</Route>

				<Route path="/organizer">
					{/* MODULE */}
					{/* <Route path="learning-path/:learningId/module/:moduleId" element={<EditModulePage />} /> */}

					{/* ==== */}

					{/* LESSON */}
					{/* <Route path="learning-path/:learningId/edit-module/:moduleId/:lessonId" element={<EditLessonPage />} /> */}
					{/* <Route path="modules/:moduleId" element={<EditLessonPage />} /> */}
					{/* ==== */}
				</Route>
			</Route>
		</Routes>
	);
};

export default LmsRoutes;
