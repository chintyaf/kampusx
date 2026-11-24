import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Layouts & Components
import LessonSidebar from '@/pages/lms/learner/lesson/LessonSidebar';
import LessonMaterial from './lesson/LessonMaterial';
import LessonQuiz from './lesson/LessonQuiz';
import { showLessonCompleteToast } from '@/components/lms/LessonCompleteToast';

// API
import { getModuleLessons, getLessonDetail, completeLesson } from './lesson/lessonViewerService';

// Styles
import '@/pages/lms/lessonViewer.css';

import useSRLMaterialTracker from '@/hooks/useSRLMaterialTracker';

// Ubah response API ke bentuk yang dipakai komponen (snake_case + alias camelCase)
const normalizeLesson = (lesson, moduleId) => ({
	...lesson,
	moduleId,
	durationMinutes: lesson.duration_minutes,
	videoUrl: lesson.video_url,
});

const getErrorMessage = (err) => {
	const status = err?.response?.status;
	if (status === 403) return 'Kamu belum terdaftar pada learning path ini.';
	if (status === 404) return 'Materi tidak ditemukan.';
	return err?.response?.data?.message || 'Terjadi kesalahan saat memuat materi.';
};

const LessonViewerPage = () => {
	const { slug, moduleId, lessonId } = useParams();
	// di dalam komponen, setelah lessonId didapat dari useParams()
	useSRLMaterialTracker('lesson', lessonId ? Number(lessonId) : null);
	const navigate = useNavigate();

	const mainContentRef = useRef(null);
	const redirectTimerRef = useRef(null);

	// Data modul & daftar lesson (sidebar)
	const [moduleInfo, setModuleInfo] = useState(null);
	const [lessons, setLessons] = useState([]);
	const [completedLessonIds, setCompletedLessonIds] = useState(() => new Set());
	const [quizInfo, setQuizInfo] = useState(null);
	const [isLoadingList, setIsLoadingList] = useState(true);

	// Detail lesson aktif
	const [lessonDetail, setLessonDetail] = useState(null);
	const [isLoadingLesson, setIsLoadingLesson] = useState(false);

	const [error, setError] = useState(null);
	const [actionError, setActionError] = useState(null);
	const [isCompleting, setIsCompleting] = useState(false);

	const baseModuleUrl = `/learner/learning-paths/${slug}/modules/${moduleId}`;
	const quizUrl = `${baseModuleUrl}/quiz`;

	// ------------------------------------------------
	// Fetch daftar lesson (sekali per modul)
	// ------------------------------------------------
	useEffect(() => {
		const controller = new AbortController();

		const load = async () => {
			setIsLoadingList(true);
			setError(null);
			try {
				const data = await getModuleLessons(moduleId, { signal: controller.signal });

				setModuleInfo(data.module);
				setLessons(data.lessons.map((l) => normalizeLesson(l, data.module.id)));
				setCompletedLessonIds(new Set(data.completed_lesson_ids));
				setQuizInfo(data.quiz);
			} catch (err) {
				if (err.code === 'ERR_CANCELED') return;
				setError(getErrorMessage(err));
			} finally {
				if (!controller.signal.aborted) setIsLoadingList(false);
			}
		};

		load();
		return () => controller.abort();
	}, [moduleId]);

	// Index lesson aktif diturunkan dari URL, tidak perlu state terpisah
	const currentIndex = useMemo(
		() => lessons.findIndex((l) => String(l.id) === String(lessonId)),
		[lessons, lessonId],
	);

	// Kalau URL tanpa lessonId / id tidak valid, arahkan ke lesson pertama yang belum selesai
	useEffect(() => {
		if (isLoadingList || lessons.length === 0 || currentIndex !== -1) return;

		const target = lessons.find((l) => !completedLessonIds.has(l.id)) || lessons[0];
		navigate(`${baseModuleUrl}/lessons/${target.id}`, { replace: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoadingList, lessons, currentIndex, baseModuleUrl, navigate]);

	// ------------------------------------------------
	// Fetch konten lesson aktif (setiap lessonId berubah)
	// ------------------------------------------------
	useEffect(() => {
		if (!lessonId || isLoadingList || currentIndex === -1) return;

		const controller = new AbortController();

		const load = async () => {
			setIsLoadingLesson(true);
			setActionError(null);
			try {
				const data = await getLessonDetail(moduleId, lessonId, {
					signal: controller.signal,
				});
				setLessonDetail(normalizeLesson(data, moduleInfo?.id ?? moduleId));
			} catch (err) {
				if (err.code === 'ERR_CANCELED') return;
				setError(getErrorMessage(err));
			} finally {
				if (!controller.signal.aborted) setIsLoadingLesson(false);
			}
		};

		load();
		return () => controller.abort();
	}, [moduleId, lessonId, isLoadingList, currentIndex, moduleInfo?.id]);

	// Scroll ke atas saat materi berpindah
	useEffect(() => {
		mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
	}, [lessonId]);

	// Bersihkan timer redirect saat unmount
	useEffect(() => () => clearTimeout(redirectTimerRef.current), []);

	// ------------------------------------------------
	// Derived state
	// ------------------------------------------------
	// Gabungkan item sidebar + detail (hanya jika detail milik lesson aktif)
	const currentLesson = useMemo(() => {
		const base = lessons[currentIndex] || {};
		const detail =
			lessonDetail && String(lessonDetail.id) === String(lessonId) ? lessonDetail : {};
		return { ...base, ...detail };
	}, [lessons, currentIndex, lessonDetail, lessonId]);

	const isQuiz =
		currentLesson?.type?.toLowerCase() === 'quiz' ||
		currentLesson?.type?.toLowerCase() === 'assessment';

	const isFirstLesson = currentIndex <= 0;
	const isLastLesson = currentIndex === lessons.length - 1;

	// ------------------------------------------------
	// Navigasi
	// ------------------------------------------------
	const goToLesson = useCallback(
		(targetId) => navigate(`${baseModuleUrl}/lessons/${targetId}`),
		[baseModuleUrl, navigate],
	);

	const handlePrevious = () => {
		if (!isFirstLesson) goToLesson(lessons[currentIndex - 1].id);
	};

	const handleNext = useCallback(() => {
		if (!isLastLesson && currentIndex !== -1) goToLesson(lessons[currentIndex + 1].id);
	}, [currentIndex, isLastLesson, lessons, goToLesson]);

	// ------------------------------------------------
	// Selesaikan lesson (simpan ke backend, lalu toast)
	// ------------------------------------------------
	const handleLessonComplete = useCallback(
		async (metadata = {}) => {
			if (!currentLesson?.id || isCompleting) return;

			setIsCompleting(true);
			setActionError(null);

			try {
				const result = await completeLesson(
					moduleId,
					currentLesson.id,
					metadata.durationSeconds || 0,
				);

				setCompletedLessonIds(new Set(result.completed_lesson_ids));

				showLessonCompleteToast({
					lesson: currentLesson,
					durationSeconds: result.duration_seconds,
					xpEarned: result.xp_earned,
					progress: result.progress,
					isLast: result.is_last,
					onNext: !result.is_last ? () => goToLesson(result.next_lesson_id) : null,
					onGoToQuiz: result.is_last ? () => navigate(quizUrl) : null,
				});

				if (result.is_last) {
					// Beri jeda agar learner bisa menikmati feedback reward
					redirectTimerRef.current = setTimeout(() => navigate(quizUrl), 1600);
				} else {
					goToLesson(result.next_lesson_id);
				}
			} catch (err) {
				setActionError(
					err?.response?.data?.message || 'Gagal menyimpan progres. Coba lagi.',
				);
			} finally {
				setIsCompleting(false);
			}
		},
		[currentLesson, isCompleting, moduleId, goToLesson, navigate, quizUrl],
	);

	// ------------------------------------------------
	// Render
	// ------------------------------------------------
	if (isLoadingList) {
		return (
			<div className="d-flex flex-grow-1 align-items-center justify-content-center">
				<Spinner animation="border" variant="primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="d-flex flex-grow-1 align-items-center justify-content-center p-4">
				<div className="text-center" style={{ maxWidth: 420 }}>
					<Alert variant="danger">{error}</Alert>
					<Button variant="outline-secondary" onClick={() => navigate(-1)}>
						Kembali
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div
			className="d-flex flex-grow-1 position-relative w-100 overflow-hidden"
			style={{ minHeight: 0 }}
		>
			{/* SIDEBAR CONTAINER */}
			<aside
				className="d-none d-lg-flex flex-column flex-shrink-0 border-end lesson-sidebar-scroll"
				style={{
					width: '300px',
					fontFamily: 'var(--font)',
					backgroundColor: 'var(--card)',
					borderColor: 'var(--neutral-border)',
				}}
			>
				<LessonSidebar
					data={lessons}
					module={moduleInfo}
					quiz={quizInfo}
					currentLessonId={currentLesson?.id}
					completedLessonIds={completedLessonIds}
					onSelectLesson={goToLesson}
				/>
			</aside>

			{/* MAIN CONTENT CANVAS */}
			<main ref={mainContentRef} className="flex-grow-1 overflow-y-auto p-4">
				<div className="container p-0" style={{ maxWidth: '960px' }}>
					{actionError && (
						<Alert variant="danger" dismissible onClose={() => setActionError(null)}>
							{actionError}
						</Alert>
					)}

					<div className="mb-4">
						{isLoadingLesson && !currentLesson?.content ? (
							<div className="d-flex justify-content-center py-5">
								<Spinner animation="border" variant="primary" />
							</div>
						) : isQuiz ? (
							<LessonQuiz item={currentLesson} onNext={handleLessonComplete} />
						) : (
							<LessonMaterial
								// key memaksa timer "Waktu Belajar" reset tiap lesson berganti
								key={currentLesson?.id}
								item={currentLesson}
								onCompleteLesson={handleLessonComplete}
							/>
						)}
					</div>

					{/* TOMBOL NAVIGASI */}
					<div className="d-flex justify-content-between align-items-center mb-4">
						<Button
							variant="outline-secondary"
							onClick={handlePrevious}
							disabled={isFirstLesson}
							className="d-flex align-items-center gap-2 px-3 py-2 fw-medium"
							style={{
								color: isFirstLesson ? 'var(--text-muted)' : '',
								opacity: isFirstLesson ? 0.5 : 1,
								cursor: isFirstLesson ? 'not-allowed' : 'pointer',
							}}
						>
							<ChevronLeft size={18} />
							Sebelumnya
						</Button>

						<Button
							onClick={handleNext}
							disabled={isLastLesson}
							className="d-flex align-items-center gap-2 px-3 py-2 fw-medium border-0"
							style={{
								backgroundColor: isLastLesson
									? 'var(--neutral-border)'
									: 'var(--primary)',
								opacity: isLastLesson ? 0.6 : 1,
								cursor: isLastLesson ? 'not-allowed' : 'pointer',
							}}
						>
							Selanjutnya
							<ChevronRight size={18} />
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default LessonViewerPage;
