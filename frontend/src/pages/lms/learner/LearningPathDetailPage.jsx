import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Award } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext'; // sesuaikan: yang penting bisa tahu user sudah login atau belum
import LearningHeader from '@/pages/lms/learner/learning-path/LearningHeader';
import LearningModule from '@/pages/lms/learner/learning-path/LearningModule';
import LearningCert from '@/pages/lms/learner/learning-path/LearningCert';
import LearningBadges from '@/pages/lms/learner/learning-path/LearningBadges';
import LearningAnalytics from '@/pages/lms/learner/learning-path/LearningAnalytics';
import OrganizerCard from '@/pages/lms/learner/learning-path/OrganizerCard';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@/pages/lms/lms.css';

const PAGE_STYLE = { backgroundColor: '#F8FAFC', minHeight: '100vh' };

const EMPTY_MEMBER = { progress: null, achievements: { badges: [], certificate: null } };

/** Gabungkan silabus publik dengan progress member (jika ada). */
const mergeModules = (publicModules = [], progress) => {
	const moduleProgress = new Map((progress?.modules ?? []).map((m) => [m.id, m]));
	const lessonProgress = new Map(
		(progress?.modules ?? []).flatMap((m) => m.lessons.map((l) => [l.id, l])),
	);

	return publicModules.map((module) => {
		const mp = moduleProgress.get(module.id);

		return {
			...module,
			completed_lessons: mp?.completed_lessons ?? 0,
			progress_percent: mp?.progress_percent ?? 0,
			status: mp?.status ?? 'not_started',
			lessons: module.lessons.map((lesson) => ({
				...lesson,
				is_completed: lessonProgress.get(lesson.id)?.is_completed ?? false,
				completed_at: lessonProgress.get(lesson.id)?.completed_at ?? null,
			})),
		};
	});
};

const LearningPathDetailPage = () => {
	// 1. Sesuaikan dengan parameter :slug di React Router
	const { slug } = useParams();
	const { isAuthenticated, loading: authLoading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	// --- Data publik ---
	const [path, setPath] = useState(null);
	const [content, setContent] = useState({ modules: [], metrics: {} });

	// --- Data member (hanya jika login) ---
	const [member, setMember] = useState(EMPTY_MEMBER);

	// --- Status halaman ---
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [reloadKey, setReloadKey] = useState(0);

	// --- UI state ---
	const [expandedModules, setExpandedModules] = useState({});
	const [isBookmarked, setIsBookmarked] = useState(false);

	useEffect(() => {
		if (!slug || authLoading) return;

		let isCancelled = false;

		const fetchData = async () => {
			setIsLoading(true);
			setErrorMessage('');

			try {
				// 2. Gunakan leading slash '/' & parameter slug
				const publicBase = `/lms/public/learning-paths/${slug}`;
				const memberBase = `/lms/member/learning-paths/${slug}`;

				const [pathRes, contentRes, progressRes, achievementsRes] = await Promise.all([
					api.get(publicBase),
					api.get(`${publicBase}/content`),
					isAuthenticated ? api.get(`${memberBase}/progress`).catch(() => null) : null,
					isAuthenticated
						? api.get(`${memberBase}/achievements`).catch(() => null)
						: null,
				]);

				if (isCancelled) return;

				const contentData = contentRes.data?.data ?? { modules: [], metrics: {} };
				const progressData = progressRes?.data?.data ?? null;

				setPath(pathRes.data?.data);
				setContent(contentData);
				setMember({
					progress: progressData,
					achievements: achievementsRes?.data?.data ?? EMPTY_MEMBER.achievements,
				});

				const merged = mergeModules(contentData.modules, progressData);
				const active = merged.find((m) => m.status === 'in_progress') ?? merged[0];
				setExpandedModules(active ? { [active.id]: true } : {});
			} catch (error) {
				if (isCancelled) return;

				console.error('Gagal mengambil data learning path:', error);
				setErrorMessage(
					error.response?.status === 404
						? 'Learning path tidak ditemukan.'
						: 'Gagal memuat learning path. Silakan coba lagi.',
				);
			} finally {
				if (!isCancelled) setIsLoading(false);
			}
		};

		fetchData();

		return () => {
			isCancelled = true;
		};
	}, [slug, isAuthenticated, authLoading, reloadKey]);

	const modules = useMemo(
		() => mergeModules(content.modules, member.progress),
		[content.modules, member.progress],
	);

	const metrics = useMemo(
		() => ({
			moduleCount: content.metrics?.moduleCount ?? 0,
			lessonCount: content.metrics?.lessonCount ?? 0,
			completedModules: 0,
			completedLessons: 0,
			progressPercent: 0,
			...member.progress?.metrics,
		}),
		[content.metrics, member.progress],
	);

	// 3. Sisipkan moduleId ke setiap lesson agar bisa dipakai untuk navigasi
	const nextLesson = useMemo(() => {
		const lessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id })));
		return lessons.find((l) => !l.is_completed) ?? lessons[0] ?? null;
	}, [modules]);

	const isAllCompleted = useMemo(() => {
		const total = metrics.moduleCount || modules.length;
		const done =
			metrics.completedModules || modules.filter((m) => m.status === 'completed').length;
		return total > 0 && done >= total;
	}, [metrics, modules]);

	const handleStart = () => {
		if (!isAuthenticated) {
			navigate('/login', { state: { from: location } });
			return;
		}
		if (nextLesson) {
			// 4. Sesuaikan dengan nested route: learning-paths/:slug/modules/:moduleId/lessons/:lessonId
			navigate(
				`/learner/learning-paths/${slug}/modules/${nextLesson.moduleId}/lessons/${nextLesson.id}`,
			);
		}
	};

	const toggleModuleExpand = (moduleId) => {
		setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
	};

	if (isLoading || authLoading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={PAGE_STYLE}>
				<Spinner animation="border" role="status" variant="primary">
					<span className="visually-hidden">Loading...</span>
				</Spinner>
			</div>
		);
	}

	if (errorMessage || !path) {
		return (
			<Container className="py-5" style={{ minHeight: '100vh' }}>
				<Alert variant="danger">{errorMessage || 'Data tidak tersedia.'}</Alert>
				<Button variant="outline-primary" onClick={() => setReloadKey((k) => k + 1)}>
					Coba lagi
				</Button>
			</Container>
		);
	}

	return (
		<div style={{ ...PAGE_STYLE, paddingBottom: '5rem' }}>
			<LearningHeader
				path={path}
				metrics={metrics}
				isAuthenticated={isAuthenticated}
				isBookmarked={isBookmarked}
				onToggleBookmark={() => setIsBookmarked((prev) => !prev)}
				onStart={handleStart}
			/>

			<Container className="mt-4">
				<Row className="g-4">
					<Col lg={8}>
						{/* Banner Klaim Sertifikat jika semua modul sudah selesai */}
						{/* {isAllCompleted && (
							<div
								className="card border-0 shadow-sm rounded-4 p-4 mb-4"
								style={{
									background:
										'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F2A4A 100%)',
									color: '#FFFFFF',
									border: '2px solid #F59E0B',
									boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.25)',
								}}
							>
								<div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
									<div className="d-flex align-items-center gap-3">
										<div
											className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
											style={{
												width: 52,
												height: 52,
												background:
													'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
												color: '#0F172A',
												boxShadow: '0 0 20px rgba(245, 158, 11, 0.45)',
											}}
										>
											<Award size={28} />
										</div>
										<div>
											<div className="d-flex align-items-center gap-2 mb-1">
												<span className="badge bg-warning text-dark px-2.5 py-1 rounded-pill small fw-bold">
													🎓 100% KURIKULUM SELESAI
												</span>
											</div>
											<h5 className="fw-bold mb-1 text-white">
												Selamat! Seluruh Modul Telah Selesai
											</h5>
											<p
												className="mb-0 text-slate-300 small"
												style={{ maxWidth: 480 }}
											>
												Kamu telah menuntaskan seluruh materi pembelajaran.
												Sertifikat kelulusan resmimu siap untuk diklaim
												sekarang.
											</p>
										</div>
									</div>
									<Button
										variant="warning"
										className="rounded-pill px-4 py-2.5 fw-bold text-nowrap d-inline-flex align-items-center gap-2 shadow text-slate-950 align-self-start align-self-md-center"
										onClick={() =>
											navigate(`/learner/learning-paths/${slug}/certificate`)
										}
									>
										<Award size={18} />
										Klaim Sertifikat Kelulusan
									</Button>
								</div>
							</div>
						)} */}

						{/* Kirim slug sebagai pathId agar link di dalam LearningModule otomatis memakai slug */}
						<LearningModule
							modules={modules}
							pathId={slug}
							slug={slug}
							expandedModules={expandedModules}
							onToggleModule={toggleModuleExpand}
							isAuthenticated={isAuthenticated}
						/>
					</Col>

					<Col lg={4}>
						{isAuthenticated && (
							<>
								<LearningCert
									pathId={slug}
									slug={slug}
									certificate={member.achievements.certificate}
									progressPercent={metrics.progressPercent}
									totalModules={metrics.moduleCount}
									completedModules={metrics.completedModules}
								/>
								{/* <LearningBadges badges={member.achievements.badges} /> */}
								<LearningAnalytics metrics={metrics} />
							</>
						)}
						<OrganizerCard instructor={path.instructor} />
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default LearningPathDetailPage;
