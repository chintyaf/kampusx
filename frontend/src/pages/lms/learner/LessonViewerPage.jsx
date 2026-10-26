import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Custom Styles for Clean, Refactored Layout
// import '@/styles/lessonViewer.css';

import '@/pages/lms/lessonViewer.css';

// Layouts & Components
import NavbarLesson from '@/layouts/partials-dashboard/NavbarLesson';
import LessonSidebar from '@/pages/lms/learner/lesson/LessonSidebar';
import LessonFooter from './lesson/LessonFooter';
import LessonMaterial from './lesson/LessonMaterial';
import LessonQuiz from './lesson/LessonQuiz'; // <-- Import Komponen Kuis
import LessonHeader from './lesson/LessonHeader';

// Styles & Data
import '@/pages/lms/lessonViewer.css';
import { MODULE_LESSONS_DATA } from './lesson/mockData';

const LessonViewerPage = () => {
	const { lessonId } = useParams();
	const navigate = useNavigate();

	// Ref untuk mengakses elemen scroll container (<main>)
	const mainContentRef = useRef(null);

	// State untuk menyimpan index lesson aktif
	const [currentIndex, setCurrentIndex] = useState(0);

	// Helper function untuk smooth scroll ke paling atas
	const scrollToTop = () => {
		if (mainContentRef.current) {
			mainContentRef.current.scrollTo({
				top: 0,
				behavior: 'smooth',
			});
		}
	};

	// Sinkronisasi index berdasarkan lessonId di URL jika ada
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

	// Triggers smooth scroll ke atas setiap kali index lesson / materi berpindah
	useEffect(() => {
		scrollToTop();
	}, [currentIndex]);

	const currentLesson = MODULE_LESSONS_DATA[currentIndex] || {};

	// Cek apakah item aktif adalah kuis / assessment
	const isQuiz =
		currentLesson?.type?.toLowerCase() === 'quiz' ||
		currentLesson?.type?.toLowerCase() === 'assessment';

	// Check batas materi
	const isFirstLesson = currentIndex === 0;
	const isLastLesson = currentIndex === MODULE_LESSONS_DATA.length - 1;

	// Handler Navigasi Sebelumnya
	const handlePrevious = () => {
		if (!isFirstLesson) {
			const prevIndex = currentIndex - 1;
			const prevLesson = MODULE_LESSONS_DATA[prevIndex];
			setCurrentIndex(prevIndex);

			if (prevLesson?.id && lessonId) {
				navigate(`../learner/lesson/${prevLesson.id}`);
			}
		}
	};

	// Handler Navigasi Selanjutnya
	const handleNext = () => {
		if (!isLastLesson) {
			const nextIndex = currentIndex + 1;
			const nextLesson = MODULE_LESSONS_DATA[nextIndex];
			setCurrentIndex(nextIndex);

			if (nextLesson?.id && lessonId) {
				navigate(`../learner/lesson/${nextLesson.id}`);
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
					<LessonSidebar data={MODULE_LESSONS_DATA} />
				</aside>

				{/* MAIN CONTENT CANVAS */}
				<main ref={mainContentRef} className="flex-grow-1 overflow-y-auto p-4">
					<div className="container p-0" style={{ maxWidth: '960px' }}>
						{/* KONDISIONAL RENDER: Kuis vs Materi Pelajaran biasa */}
						<div className="mb-4">
							{isQuiz ? (
								<LessonQuiz item={currentLesson} onNext={handleNext} />
							) : (
								<LessonMaterial data={MODULE_LESSONS_DATA} />
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
