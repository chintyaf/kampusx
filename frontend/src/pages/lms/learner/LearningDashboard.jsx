import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';

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
	const { user: authUser } = useAuth();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState(null);

	// Fetch data agregasi dari backend LMS API
	useEffect(() => {
		let isMounted = true;

		const fetchDashboardData = async () => {
			try {
				const response = await api.get('/lms/learner/dashboard');
				if (isMounted && response?.data?.success && response?.data?.data) {
					setDashboardData(response.data.data);
				}
			} catch (err) {
				console.warn('Gagal memuat data dari API LMS dashboard, menggunakan fallback data:', err);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchDashboardData();

		return () => {
			isMounted = false;
		};
	}, []);

	// Data gabungan (prioritaskan data dari API, fallback ke mock)
	const userProfile = dashboardData?.userLearningProfile || mockUserLearningProfile;
	const activeModule = dashboardData?.activeModule || mockActiveModule;
	const recommendedModules = dashboardData?.recommendedModules || mockRecommendedModules;
	const enrolledModules = dashboardData?.enrolledModules || mockEnrolledModules;
	const srlHistory = dashboardData?.srlHistory || mockSRLHistory;
	const skillProfile = dashboardData?.skillProfile || mockSkillProfile;
	const achievements = dashboardData?.achievements || mockAchievements;
	const learningReadiness = dashboardData?.learningReadiness || mockLearningReadiness;
	const currentUser = dashboardData?.user || authUser;

	// Handlers navigasi untuk kartu dan tombol
	const handleOpenModule = (m) => {
		const targetId = m?.targetModuleId || m?.moduleId || (m?.id === 'rec-1' || m?.id === 'rec-2' ? 'mod-arch-101' : m?.id);
		navigate(`/learner/modules/${targetId || 'mod-arch-101'}`);
	};

	const handleContinueActive = () => {
		const targetId = activeModule?.targetModuleId || activeModule?.id || 'mod-arch-101';
		navigate(`/learner/modules/${targetId}`);
	};

	const handleExploreAll = () => {
		navigate('/explore-microlearning');
	};

	const handleViewCertificate = (c) => {
		navigate('/learner/learning-paths/lp-1/certificate');
	};

	// Ringkasan learning analytics di header (diturunkan dari data enrollment atau API stats).
	const stats = useMemo(() => {
		if (dashboardData?.stats && Array.isArray(dashboardData.stats) && dashboardData.stats.length > 0) {
			return dashboardData.stats;
		}

		const quizScores = enrolledModules.map((m) => m.lastQuizScore).filter(Boolean);
		const avgQuiz = quizScores.length
			? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
			: 0;
		return [
			{
				icon: 'book-open',
				label: 'Modul berjalan',
				value: enrolledModules.filter((m) => m.status === 'in_progress').length,
				tone: 'primary',
			},
			{
				icon: 'check-circle',
				label: 'Lesson selesai',
				value: enrolledModules.reduce((t, m) => t + (m.lessonsDone || 0), 0),
				tone: 'success',
			},
			{ icon: 'trending-up', label: 'Rata-rata skor kuis', value: avgQuiz, tone: 'purple' },
			{
				icon: 'award',
				label: 'Sertifikat',
				value: enrolledModules.filter((m) => m.status === 'completed').length,
				tone: 'warning',
			},
		];
	}, [dashboardData?.stats, enrolledModules]);

	if (loading && !dashboardData) {
		return (
			<div className="learning-dashboard-wrapper">
				<Container className="py-5 text-center">
					<Spinner animation="border" variant="primary" role="status" />
					<p className="mt-3 text-muted">Memuat pusat microlearning...</p>
				</Container>
			</div>
		);
	}

	return (
		<div className="learning-dashboard-wrapper">
			<Container className="py-4">
				<LearningHeader
					user={currentUser}
					streak={userProfile.currentStreak}
					stats={stats}
				/>

				<Row className="g-4">
					<Col lg={9}>
						<div className="ld-stack">
							<ContinueLearningCard
								module={activeModule}
								onContinue={handleContinueActive}
								onViewAll={handleExploreAll}
							/>
							<RecommendedModules
								modules={recommendedModules}
								onOpen={handleOpenModule}
								onExploreAll={handleExploreAll}
							/>
							<EnrolledModules
								modules={enrolledModules}
								onContinue={handleOpenModule}
								onViewCertificate={handleViewCertificate}
							/>
							<SRLHistory sessions={srlHistory} />
						</div>
					</Col>

					<Col lg={3}>
						<div className="ld-stack">
							{/* <LearningReadinessWidget readiness={learningReadiness} /> */}
							<StudyInsightsWidget sessions={srlHistory} />
							<SkillMatrixWidget data={skillProfile} />
							<BadgesWidget
								data={achievements}
								onViewCertificate={handleViewCertificate}
							/>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default LearningDashboard;
