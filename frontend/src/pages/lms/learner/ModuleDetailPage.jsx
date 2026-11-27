import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

import api from '@/api/axios';

import ModuleHeader from '@/pages/lms/learner/modules/detail-module/ModuleHeader';
import ModuleLesson from '@/pages/lms/learner/modules/detail-module/ModuleLesson';

/**
 * ModuleDetailPage
 * Mengambil detail modul dan daftar lesson dari PublicLearningPathController.
 */
const ModuleDetailPage = () => {
	const { slug, moduleId } = useParams();
	const navigate = useNavigate();

	const [moduleData, setModuleData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	const [isBookmarked, setIsBookmarked] = useState(false);
	const [lessonFilter, setLessonFilter] = useState('all');

	/**
	 * Mengambil daftar modul dari learning path,
	 * kemudian memilih modul berdasarkan moduleId.
	 */
	useEffect(() => {
		const fetchModuleData = async () => {
			if (!slug || !moduleId) {
				setError('Learning path atau module ID tidak ditemukan.');
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError('');

				const response = await api.get(
					`/lms/public/learning-paths/${encodeURIComponent(slug)}/content`,
				);

				const pathData = response.data?.data;

				if (!pathData) {
					throw new Error('Data learning path tidak ditemukan.');
				}

				// Cari modul berdasarkan ID dari URL
				const selectedModule = pathData.modules?.find(
					(module) => String(module.id) === String(moduleId),
				);

				if (!selectedModule) {
					throw new Error('Modul tidak ditemukan atau belum dipublikasikan.');
				}

				// Normalisasi data lesson untuk komponen frontend
				const lessons = (selectedModule.lessons || []).map((lesson, index) => ({
					id: lesson.id,
					rawId: lesson.id,
					title: lesson.title,
					type: lesson.type || 'article',
					order: index + 1,

					// Endpoint public content belum mengirim progress member.
					// Gunakan status awal sampai tersedia endpoint progress.
					status: lesson.status || 'not_started',
					isPreview: Boolean(lesson.is_preview),

					durationMinutes: lesson.duration_minutes || 0,
					durationLabel: lesson.duration_minutes
						? `${lesson.duration_minutes} Menit`
						: '-',
				}));

				setModuleData({
					id: selectedModule.id,
					rawId: selectedModule.id,

					title: selectedModule.title,
					description: selectedModule.description || '',

					learningPathId: pathData.id,
					learningPathSlug: pathData.slug,
					learningPathTitle: pathData.title,

					orderIndex: selectedModule.order_index,
					difficultyLevel: selectedModule.difficulty_level,
					difficulty: selectedModule.difficulty_level,

					learningOutcomes: selectedModule.learning_outcomes || [],
					learning_outcomes: selectedModule.learning_outcomes || [],

					totalLessons: selectedModule.total_lessons ?? lessons.length,
					lessons,

					currentLessonId: lessons[0]?.id || null,

					// Nilai default karena endpoint ini belum menyediakan progress.
					progress: 0,
					completionRate: 0,
					completedLessons: 0,
					durationMinutes: lessons.reduce(
						(total, lesson) => total + (lesson.durationMinutes || 0),
						0,
					),
				});
			} catch (err) {
				console.error('Failed to fetch module:', err);

				setError(
					err.response?.data?.message || err.message || 'Gagal mengambil data modul.',
				);

				setModuleData(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchModuleData();
	}, [slug, moduleId]);

	/**
	 * Navigasi ke lesson atau quiz.
	 */
	const handleNavigateToLesson = (lessonOrId) => {
		if (!moduleData) return;

		const isQuiz =
			typeof lessonOrId === 'object' && lessonOrId !== null && lessonOrId.type === 'quiz';

		if (isQuiz) {
			navigate(`/learner/learning-paths/${slug}/modules/${moduleId}/quiz`);
			return;
		}

		const resolvedId =
			typeof lessonOrId === 'object' && lessonOrId !== null ? lessonOrId.id : lessonOrId;

		const lessonDestination =
			resolvedId || moduleData.currentLessonId || moduleData.lessons?.[0]?.id;

		if (!lessonDestination) {
			setError('Belum ada lesson yang tersedia pada modul ini.');
			return;
		}

		navigate(
			`/learner/learning-paths/${slug}/modules/${moduleId}/lessons/${lessonDestination}`,
		);
	};

	/**
	 * Filter lesson.
	 */
	const filteredLessons = (moduleData?.lessons || []).filter((lesson) => {
		if (lessonFilter === 'uncompleted') {
			return lesson.status !== 'completed';
		}

		return true;
	});

	if (isLoading) {
		return (
			<Container
				className="d-flex flex-column align-items-center justify-content-center"
				style={{ minHeight: '60vh' }}
			>
				<Spinner animation="border" variant="primary" />
				<p className="text-muted mt-3 mb-0">Memuat materi modul...</p>
			</Container>
		);
	}

	if (error || !moduleData) {
		return (
			<Container className="py-5">
				<Alert variant="danger">{error || 'Data modul tidak tersedia.'}</Alert>
				<button
					type="button"
					className="btn btn-outline-primary"
					onClick={() => navigate(`/learner/learning-paths/${slug}`)}
				>
					Kembali ke Learning Path
				</button>
			</Container>
		);
	}

	return (
		<div
			style={{
				backgroundColor: '#F8FAFC',
				minHeight: '100vh',
				paddingBottom: '5rem',
			}}
		>
			{/* Header Modul */}
			<ModuleHeader
				moduleData={moduleData}
				handleNavigateToLesson={handleNavigateToLesson}
				isBookmarked={isBookmarked}
				setIsBookmarked={setIsBookmarked}
			/>

			{/* Konten Modul */}
			<Container style={{ marginTop: '1.5rem' }}>
				<Row className="g-4">
					<Col lg={12}>
						<ModuleLesson
							moduleData={moduleData}
							filteredLessons={filteredLessons}
							lessonFilter={lessonFilter}
							setLessonFilter={setLessonFilter}
							handleNavigateToLesson={handleNavigateToLesson}
						/>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default ModuleDetailPage;
