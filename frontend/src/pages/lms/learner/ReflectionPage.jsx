import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { ChevronLeft } from 'lucide-react';
import api from '@/api/axios';
import ResultCard from './modules/reflection/ResultCard';
import LessonReview from './modules/reflection/LessonReview';
import Rekomendasi from './modules/reflection/Rekomendasi';

const ReflectionPage = () => {
	const { slug, moduleId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const attemptId =
		location.state?.attemptId ||
		location.state?.result?.id ||
		searchParams.get('attempt_id') ||
		null;

	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const baseModulePath = `/learner/learning-paths/${slug}/modules/${moduleId}`;

	const fetchReflection = useCallback(async () => {
		if (!moduleId) return;
		setLoading(true);
		setError(null);

		try {
			const response = await api.get(`/lms/member/modules/${moduleId}/reflection`, {
				params: attemptId ? { attempt_id: attemptId } : {},
			});
			setData(response.data?.data || null);
		} catch (err) {
			const message =
				err?.response?.data?.message ||
				'Belum ada hasil kuis yang tersedia untuk modul ini.';
			setError(message);
		} finally {
			setLoading(false);
		}
	}, [moduleId, attemptId]);

	useEffect(() => {
		fetchReflection();
	}, [fetchReflection]);

	const handleBack = () => {
		if (slug && moduleId) {
			navigate(baseModulePath);
		} else {
			navigate(-1);
		}
	};

	const handlePrimaryAction = () => {
		const outcome = data?.outcome;
		if (!outcome) return;

		if (outcome.score >= outcome.passingScore) {
			navigate(`${baseModulePath}/completed`, {
				state: {
					score: outcome.score,
					readiness: outcome.badgeText,
					duration: outcome.duration,
				},
			});
		} else {
			navigate(baseModulePath);
		}
	};

	const handleSelectLesson = (lesson) => {
		const targetLessonId = lesson.lessonId || lesson.id;
		if (!targetLessonId) return;
		navigate(`${baseModulePath}/lessons/${targetLessonId}`);
	};

	const moduleTitle =
		data?.moduleTitle || location.state?.moduleTitle || 'Evaluasi & Refleksi Modul';
	const currentOutcome = data?.outcome || null;
	const remedialLessons = data?.remedialLessons || [];
	const recommendations = data?.recommendations || [];

	return (
		<div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 80 }}>
			{/* Top Bar Navigation */}
			<div className="bg-white border-bottom py-3 mb-4 shadow-sm">
				<Container>
					<div className="d-flex align-items-center gap-3">
						<Button
							variant="light"
							className="rounded-circle p-2 border"
							onClick={handleBack}
						>
							<ChevronLeft size={20} />
						</Button>
						<div>
							<span className="text-muted small d-block">
								Hasil Refleksi & Evaluasi
							</span>
							<h1 className="h5 fw-bold mb-0 text-dark">{moduleTitle}</h1>
						</div>
					</div>
				</Container>
			</div>

			{/* Main Content Area */}
			<Container style={{ paddingTop: 16 }}>
				<Row className="justify-content-center">
					<Col lg={10} className="gap-3">
						{loading ? (
							<Card
								className="text-center p-5 border-0 shadow-sm"
								style={{ borderRadius: 20 }}
							>
								<div className="d-flex flex-column align-items-center gap-3">
									<Spinner animation="border" variant="primary" />
									<span className="text-muted small">
										Memuat hasil evaluasi & refleksi kuis...
									</span>
								</div>
							</Card>
						) : error || !currentOutcome ? (
							<Card
								className="text-center p-5 border-0 shadow-sm"
								style={{ borderRadius: 20 }}
							>
								<h5 className="fw-bold text-dark mb-2">
									Data Evaluasi Belum Tersedia
								</h5>
								<p className="text-muted small mb-4">
									{error ||
										'Selesaikan kuis pada modul ini terlebih dahulu untuk melihat hasil refleksi dan rekomendasi belajarmu.'}
								</p>
								<div className="d-flex justify-content-center gap-2">
									<Button
										variant="primary"
										onClick={() => navigate(`${baseModulePath}/quiz`)}
									>
										Mulai Kuis Modul
									</Button>
								</div>
							</Card>
						) : (
							<>
								{/* 1. Hasil Evaluasi Quiz Card */}
								<ResultCard
									currentOutcome={currentOutcome}
									onAction={handlePrimaryAction}
								/>

								{/* 2. Review Lesson Terkait */}
								<LessonReview
									currentOutcome={currentOutcome}
									remedialLessons={remedialLessons}
									onSelectLesson={handleSelectLesson}
								/>

								{/* 3. Rekomendasi Section */}
								<Rekomendasi recommendations={recommendations} />
							</>
						)}
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default ReflectionPage;
