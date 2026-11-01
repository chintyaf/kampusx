import React, { useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';

import LearningHeader from '@/pages/lms/learner/learn-dashboard/LearningHeader';
import ContinueLearningCard from '@/pages/lms/learner/learn-dashboard/ContinueLearningCard';
import RecommendedModules from '@/pages/lms/learner/learn-dashboard/RecommendedModules';
import EnrolledModules from '@/pages/lms/learner/learn-dashboard/EnrolledModules';
import SRLHistory from '@/pages/lms/learner/learn-dashboard/SRLHistory';
import LearningReadinessWidget from '@/pages/lms/learner/learn-dashboard/LearningReadinessWidget';
import StudyInsightsWidget from '@/pages/lms/learner/learn-dashboard/StudyInsightsWidget';
import SkillMatrixWidget from '@/pages/lms/learner/learn-dashboard/SkillMatrixWidget';
import BadgesWidget from '@/pages/lms/learner/learn-dashboard/BadgesWidget';

import {
	mockUserLearningProfile,
	mockActiveModule,
	mockLearningReadiness,
	mockRecommendedModules,
	mockEnrolledModules,
	mockSkillProfile,
	mockAchievements,
	mockSRLHistory,
} from '@/pages/lms/learner/learn-dashboard/learningDashboardData';

import '@/pages/lms/learningDashboard.css';

/**
 * LearningDashboard
 * Pusat microlearning untuk Member (Student Hub Space / KampusX).
 *
 * Alur halaman mengikuti rancangan sistem pada laporan:
 *  Main    : modul aktif + fase SRL → rekomendasi (hybrid CBF+CF) → learning path → riwayat SRL
 *  Sidebar : Learning Readiness → profil kompetensi & skill gap → badge & kredensial digital
 */
const LearningDashboard = () => {
	const { user } = useAuth();

	// Ringkasan learning analytics di header (diturunkan dari data enrollment).
	const stats = useMemo(() => {
		const quizScores = mockEnrolledModules.map((m) => m.lastQuizScore).filter(Boolean);
		const avgQuiz = quizScores.length
			? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
			: 0;
		return [
			{
				icon: 'book-open',
				label: 'Modul berjalan',
				value: mockEnrolledModules.filter((m) => m.status === 'in_progress').length,
				tone: 'primary',
			},
			{
				icon: 'check-circle',
				label: 'Lesson selesai',
				value: mockEnrolledModules.reduce((t, m) => t + m.lessonsDone, 0),
				tone: 'success',
			},
			{ icon: 'trending-up', label: 'Rata-rata skor kuis', value: avgQuiz, tone: 'purple' },
			{
				icon: 'award',
				label: 'Sertifikat',
				value: mockEnrolledModules.filter((m) => m.status === 'completed').length,
				tone: 'warning',
			},
		];
	}, []);

	return (
		<div className="learning-dashboard-wrapper">
			<Container className="py-4">
				<LearningHeader
					user={user}
					streak={mockUserLearningProfile.currentStreak}
					stats={stats}
				/>

				<Row className="g-4">
					<Col lg={9}>
						<div className="ld-stack">
							<ContinueLearningCard module={mockActiveModule} />
							<RecommendedModules modules={mockRecommendedModules} />
							<EnrolledModules modules={mockEnrolledModules} />
							<SRLHistory sessions={mockSRLHistory} />
						</div>
					</Col>

					<Col lg={3}>
						<div className="ld-stack">
							<LearningReadinessWidget readiness={mockLearningReadiness} />
							<StudyInsightsWidget sessions={mockSRLHistory} />
							<SkillMatrixWidget data={mockSkillProfile} />
							<BadgesWidget data={mockAchievements} />
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default LearningDashboard;
