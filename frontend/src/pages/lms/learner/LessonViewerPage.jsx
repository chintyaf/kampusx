import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

// Layouts & Components
import NavbarLesson from '@/layouts/partials-dashboard/NavbarLesson';
import LessonSidebar from '@/pages/lms/learner/lesson/LessonSidebar';
import LessonMaterial from './lesson/LessonMaterial';
import LessonQuiz from './lesson/LessonQuiz';
import { showLessonCompleteToast } from '@/components/lms/LessonCompleteToast';

// Styles & Data
import '@/pages/lms/lessonViewer.css';
import { MODULE_LESSONS_DATA } from './lesson/mockData';

const LessonViewerPage = () => {
	const { lessonId, moduleId } = useParams();
	const navigate = useNavigate();

	// Ref untuk scroll container (<main>)
	const mainContentRef = useRef(null);

	// State index lesson aktif
	const [currentIndex, setCurrentIndex] = useState(0);

	// State himpunan lesson yang telah selesai
	const [completedLessonIds, setCompletedLessonIds] = useState(() => new Set(['les-1', 'les-2']));

	// Helper smooth scroll ke paling atas
	const scrollToTop = () => {
		if (mainContentRef.current) {
			mainContentRef.current.scrollTo({
				top: 0,
				behavior: 'smooth',
			});
		}
	};

	// Sinkronisasi index berdasarkan URL params (lessonId)
	useEffect(() => {
		if (lessonId && MODULE_LESSONS_DATA.length > 0) {
			const foundIndex = MODULE_LESSONS_DATA.findIndex(
				(item) => String(item.id) === String(lessonId),
			);
			if (foundIndex !== -1) {
				setCurrentIndex(foundIndex);
			}
		}
	}, [lessonId]);

	// Scroll ke atas saat materi berpindah
	useEffect(() => {
		scrollToTop();
	}, [currentIndex]);

	const currentLesson = MODULE_LESSONS_DATA[currentIndex] || {};

	// Cek jenis modul aktif (Kuis vs Materi Text/Video)
	const isQuiz =
		currentLesson?.type?.toLowerCase() === 'quiz' ||
		currentLesson?.type?.toLowerCase() === 'assessment';

	// Cek batas navigasi
	const isFirstLesson = currentIndex === 0;
	const isLastLesson = currentIndex === MODULE_LESSONS_DATA.length - 1;

	// Helper navigasi ke id lesson tertentu
	const goToLesson = useCallback(
		(targetId) => {
			const targetModule = moduleId || currentLesson?.moduleId || 'mod-arch-101';
			navigate(`/learner/${targetModule}/${targetId}`);
		},
		[moduleId, currentLesson?.moduleId, navigate],
	);

	// Handler Navigasi Sebelumnya
	const handlePrevious = () => {
		if (!isFirstLesson) {
			const prevIndex = currentIndex - 1;
			const prevLesson = MODULE_LESSONS_DATA[prevIndex];

			if (prevLesson?.id) {
				goToLesson(prevLesson.id);
			} else {
				setCurrentIndex(prevIndex);
			}
		}
	};

	// Handler Navigasi Selanjutnya (pindah materi tanpa toast complete jika belum selesai)
	const handleNext = useCallback(() => {
		if (!isLastLesson) {
			const nextIndex = currentIndex + 1;
			const nextLesson = MODULE_LESSONS_DATA[nextIndex];

			if (nextLesson?.id) {
				goToLesson(nextLesson.id);
			} else {
				setCurrentIndex(nextIndex);
			}
		}
	}, [currentIndex, isLastLesson, goToLesson]);

	// Handler Penyelesaian Lesson dengan Toast Feedback
	const handleLessonComplete = useCallback(
		(metadata = {}) => {
			const completedId = currentLesson?.id;

			// Update completed set
			const updatedSet = new Set(completedLessonIds);
			if (completedId) {
				updatedSet.add(completedId);
				setCompletedLessonIds(updatedSet);
			}

			const total = MODULE_LESSONS_DATA.length;
			const completedCount = updatedSet.size;
			const percent = Math.round((completedCount / total) * 100);

			const targetModule = moduleId || currentLesson?.moduleId || 'mod-arch-101';
			const quizUrl = `/learner/modules/${targetModule}/quiz`;

			// Tampilkan Toast Notifikasi Lesson Complete
			showLessonCompleteToast({
				lesson: currentLesson,
				durationSeconds: metadata.durationSeconds || 0,
				progress: {
					completed: completedCount,
					total,
					percent,
				},
				isLast: isLastLesson,
				onNext: !isLastLesson ? handleNext : null,
				onGoToQuiz: isLastLesson ? () => navigate(quizUrl) : null,
			});

			// Arahkan ke langkah berikutnya
			if (isLastLesson) {
				// Beri jeda sejenak agar learner bisa menikmati feedback reward
				setTimeout(() => {
					navigate(quizUrl);
				}, 1600);
			} else {
				handleNext();
			}
		},
		[completedLessonIds, currentLesson, isLastLesson, moduleId, handleNext, navigate],
	);

	return (
		<div className="d-flex flex-column vh-100 overflow-hidden bg-light">
			<NavbarLesson />

			{/* MAIN CONTAINER (Sidebar + Content Canvas) */}
			<div
				className="d-flex flex-grow-1 position-relative w-100 overflow-hidden"
				style={{ minHeight: 0 }}
			>
				{/* SIDEBAR CONTAINER */}
				<aside
					className="d-none d-lg-flex flex-column flex-shrink-0 border-end h-100 lesson-sidebar-scroll"
					style={{
						width: '300px',
						fontFamily: 'var(--font)',
						backgroundColor: 'var(--card)',
						borderColor: 'var(--neutral-border)',
					}}
				>
					<LessonSidebar
						data={MODULE_LESSONS_DATA}
						currentLessonId={currentLesson?.id}
						completedLessonIds={completedLessonIds}
						onSelectLesson={goToLesson}
					/>
				</aside>

				{/* MAIN CONTENT CANVAS */}
				<main ref={mainContentRef} className="flex-grow-1 overflow-y-auto p-4">
					<div className="container p-0" style={{ maxWidth: '960px' }}>
						{/* KONDISIONAL RENDER: Kuis vs Materi Pelajaran */}
						<div className="mb-4">
							{isQuiz ? (
								<LessonQuiz item={currentLesson} onNext={handleLessonComplete} />
							) : (
								<LessonMaterial
									item={currentLesson}
									onCompleteLesson={handleLessonComplete}
								/>
							)}
						</div>

						{/* TOMBOL NAVIGASI SEBELUMNYA & SELANJUTNYA */}
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

							<div className="d-flex align-items-center gap-2">
								{/* <Button
									variant="success"
									onClick={() => handleLessonComplete()}
									className="d-flex align-items-center gap-2 px-3 py-2 fw-medium shadow-sm"
								>
									{isLastLesson ? 'Selesaikan Modul' : 'Tandai Selesai'}
								</Button> */}

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
					</div>
				</main>
			</div>
		</div>
	);
};

export default LessonViewerPage;
