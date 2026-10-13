import React from 'react';
import { Link } from 'react-router-dom';

// Layouts & Components
import NavbarLesson from '@/layouts/partials-dashboard/NavbarLesson';
import Footer from '@/layouts/partials-dashboard/Footer';
import LessonSidebar from '@/pages/lms/learner/lesson/LessonSidebar';
import LessonFooter from './lesson/LessonFooter';

// Styles
import '@/pages/lms/lessonViewer.css';
import { MODULE_LESSONS_DATA } from './lesson/mockData';

/**
 * LessonViewerPage (Fixed Viewport & Independent Scroll Layout)
 */
const LessonViewerPage = () => {
	return (
		/* Lock layout to exact viewport height and hide window-level scrollbar */
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

				{/* MAIN CONTENT CANVAS: Independent scroll with bottom padding */}
				<main className="flex-grow-1 overflow-y-auto p-4">
					<div className="container-fluid p-0">
						{/* Floating Real-time XP Toast */}

						{/* Celebration Alert Toast */}

						{/* BLOCK 1: LESSON HEADER */}

						{/* BLOCK 2: RESPONSIVE 16x9 MEDIA PLAYER */}

						{/* BLOCK 3: MATERIAL TABS */}

						{/* BLOCK 4: END OF MATERIAL TRIGGER CTA */}

						{/* MODAL POP-UP MICRO-QUIZ */}
					</div>
					{/* <LessonFooter /> */}
				</main>
			</div>

			{/* TABLET & MOBILE OFFCANVAS DRAWER (< 992px) */}

			{/* STICKY BOTTOM NAVIGATION BAR */}
		</div>
	);
};

export default LessonViewerPage;
