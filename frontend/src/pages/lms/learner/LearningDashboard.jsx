import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';

import LearningHeader from '@/pages/lms/learner/learn-dashboard/LearningHeader';
import ContinueLearningCard from '@/pages/lms/learner/learn-dashboard/ContinueLearningCard';
import RecommendedModules from '@/pages/lms/learner/learn-dashboard/RecommendedModules';
import EnrolledModules from '@/pages/lms/learner/learn-dashboard/EnrolledModules';
import SRLHistory from '@/pages/lms/learner/learn-dashboard/SRLHistory';
// import LearningReadinessWidget from '@/pages/lms/learner/learn-dashboard/LearningReadinessWidget';
import StudyInsightsWidget from '@/pages/lms/learner/learn-dashboard/StudyInsightsWidget';
import SkillMatrixWidget from '@/pages/lms/learner/learn-dashboard/SkillMatrixWidget';
import BadgesWidget from '@/pages/lms/learner/learn-dashboard/BadgesWidget';

import '@/pages/lms/learningDashboard.css';

/**
 * LearningDashboard
 * Pusat microlearning untuk Member (Student Hub Space / KampusX).
 * Data diambil dari GET /api/lms/member/dashboard (enrollment → learning path → module → lesson).
 *
 * Main    : modul aktif + fase SRL → rekomendasi (hybrid CBF+CF) → modul yang di-enroll → riwayat SRL
 * Sidebar : Study insights → profil kompetensi → badge & kredensial digital
 */

const DASHBOARD_ENDPOINT = '/lms/member/dashboard';

const EMPTY_DATA = {
	userLearningProfile: { currentStreak: 0 },
	activeModule: null,
	recommendedModules: [],
	enrolledModules: [],
	srlHistory: [],
	skillProfile: { skills: [], careerFit: [] },
	achievements: { badges: [], credentials: [] },
	learningReadiness: null,
};

const LearningDashboard = () => {
	const { user: authUser } = useAuth();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [dashboardData, setDashboardData] = useState(null);

	const fetchDashboardData = useCallback(async (signal) => {
		setLoading(true);
		setError(null);

		try {
			const response = await api.get(DASHBOARD_ENDPOINT, { signal });
			const payload = response?.data;

			if (!payload?.success || !payload?.data) {
				throw new Error(payload?.message || 'Respons dashboard tidak valid.');
			}

			setDashboardData(payload.data);
		} catch (err) {
			if (err?.code === 'ERR_CANCELED') return; // request dibatalkan saat unmount

			const message =
				err?.response?.data?.message ||
				err?.message ||
				'Gagal memuat data pusat microlearning.';
			console.error('Gagal memuat dashboard LMS:', err);
			setError(message);
		} finally {
			if (!signal?.aborted) setLoading(false);
		}
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		fetchDashboardData(controller.signal);
		return () => controller.abort();
	}, [fetchDashboardData]);

	// Sumber data: API, atau struktur kosong sebelum data tiba
	const source = dashboardData ?? EMPTY_DATA;

	const userProfile = source.userLearningProfile ?? EMPTY_DATA.userLearningProfile;
	const activeModule = source.activeModule ?? null;
	const recommendedModules = source.recommendedModules ?? [];
	const enrolledModules = source.enrolledModules ?? [];
	const srlHistory = source.srlHistory ?? [];
	const skillProfile = source.skillProfile ?? EMPTY_DATA.skillProfile;
	const achievements = source.achievements ?? EMPTY_DATA.achievements;
	// const learningReadiness = source.learningReadiness; // dipakai bila widget readiness diaktifkan lagi
	const currentUser = dashboardData?.user ?? authUser;

	// Navigasi: kirim ke halaman modul di dalam learning path-nya.
	const handleOpenModule = (m) => {
		const moduleId = m?.targetModuleId ?? m?.moduleId;
		const pathKey = m?.learningPathSlug ?? m?.learningPathId;
		if (!moduleId || !pathKey) return;
		navigate(`/learner/learning-paths/${pathKey}/modules/${moduleId}`);
	};

	const handleContinueActive = () => handleOpenModule(activeModule);

	const handleExploreAll = () => navigate('/explore-microlearning');

	const handleViewCertificate = (item) => {
		const pathKey = item?.learningPathSlug ?? item?.learningPathId;
		if (!pathKey) return;
		navigate(`/learner/learning-paths/${pathKey}/certificate`);
	};

	// Ringkasan KPI header: pakai stats dari API, hitung lokal hanya jika tidak tersedia.
	const stats = useMemo(() => {
		if (Array.isArray(source.stats) && source.stats.length > 0) {
			return source.stats;
		}

		const quizScores = enrolledModules.map((m) => m.lastQuizScore).filter((s) => s != null);
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
	}, [source.stats, enrolledModules]);

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

	// Gagal memuat: tampilkan error + tombol coba lagi
	if (error && !dashboardData) {
		return (
			<div className="learning-dashboard-wrapper">
				<Container className="py-5">
					<Alert
						variant="danger"
						className="d-flex justify-content-between align-items-center"
					>
						<span>{error}</span>
						<Button
							variant="outline-danger"
							size="sm"
							onClick={() => fetchDashboardData()}
						>
							Coba lagi
						</Button>
					</Alert>
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
							{activeModule && (
								<ContinueLearningCard
									module={activeModule}
									onContinue={handleContinueActive}
									onViewAll={handleExploreAll}
								/>
							)}
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
