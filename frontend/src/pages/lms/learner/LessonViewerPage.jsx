import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import SRLPerformancePhase from '@/components/lms/SRLPerformancePhase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Layouts & Components
import NavbarLesson from '@/layouts/partials-dashboard/NavbarLesson';
import LessonSidebar from '@/pages/lms/learner/lesson/LessonSidebar';
import LessonMaterial from './lesson/LessonMaterial';
import LessonQuiz from './lesson/LessonQuiz';

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

	// Handler Navigasi Sebelumnya
	const handlePrevious = () => {
		if (!isFirstLesson) {
			const prevIndex = currentIndex - 1;
			const prevLesson = MODULE_LESSONS_DATA[prevIndex];

			if (prevLesson?.id) {
				navigate(`../learner/lesson/${prevLesson.id}`);
			} else {
				setCurrentIndex(prevIndex);
			}
		}
	};

	// Handler Navigasi Selanjutnya
	const handleLessonComplete = (secondsSpent, extra) => {
		// You could send analytics here using secondsSpent and extra if needed
		if (isLastLesson) {
			// All lessons completed, proceed to Self‑Reflection (Quiz) phase
			navigate(`/learner/modules/${moduleId}/quiz`);
		} else {
			handleNext();
		}
	};

	const handleNext = () => {
		if (!isLastLesson) {
			const nextIndex = currentIndex + 1;
			const nextLesson = MODULE_LESSONS_DATA[nextIndex];

			if (nextLesson?.id) {
				navigate(`../learner/lesson/${nextLesson.id}`);
			} else {
				setCurrentIndex(nextIndex);
			}
		}
	};

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
					<LessonSidebar data={MODULE_LESSONS_DATA} currentLessonId={currentLesson?.id} />
				</aside>

				{/* MAIN CONTENT CANVAS */}
				<main ref={mainContentRef} className="flex-grow-1 overflow-y-auto p-4">
					<div className="container p-0" style={{ maxWidth: '960px' }}>
						{/* KONDISIONAL RENDER: Kuis vs Materi Pelajaran */}
						<div className="mb-4">
							{isQuiz ? (
								<LessonQuiz item={currentLesson} onNext={handleNext} />
							) : (
								<>
									<LessonMaterial item={currentLesson} />
									<SRLPerformancePhase
										lesson={currentLesson}
										lessonNumber={currentIndex + 1}
										totalLessons={MODULE_LESSONS_DATA.length}
										onComplete={handleLessonComplete}
									/>
									{isLastLesson && (
										<Button variant="success" className="mt-3" onClick={() => navigate(`/learner/modules/${moduleId}/quiz`)}>
											Selesaikan &amp; Kerjakan Kuis
										</Button>
									)}
								</>
							)}
						</div>
						{/* SRL Performance Phase Section */}
						<div className="mt-4">
							<h5 className="mb-3">Performance Phase</h5>
							<SRLPerformancePhase
								lesson={currentLesson}
								lessonNumber={currentIndex + 1}
								totalLessons={MODULE_LESSONS_DATA.length}
								onComplete={handleLessonComplete}
							/>
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
		</div>
	);
};

export default LessonViewerPage;
