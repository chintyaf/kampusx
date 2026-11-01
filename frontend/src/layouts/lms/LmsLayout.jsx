import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavbarMember from '../partials-dashboard/NavbarMember.jsx';
import NavbarLesson from '../partials-dashboard/NavbarLesson.jsx';
import Footer from '../partials-dashboard/Footer';
import SRLModal from '@/components/lms/SRLModal';
import SRLTriggerButton from '@/components/lms/SRLTriggerButton';
import { SRLProvider } from '@/context/SRLContext';

// Segmen kedua di /learner/* yang BUKAN moduleId
const RESERVED_LEARNER_SEGMENTS = [
	'modules',
	'learning-paths',
	'explore',
	'dashboard',
	'analytics',
	'badges',
	'settings',
];

const checkIsLessonPage = (pathname) => {
	const seg = pathname.split('/').filter(Boolean);
	if (seg[0] !== 'learner' || seg.length !== 3) return false;

	// /learner/lessons/:lessonId
	if (seg[1] === 'lessons') return true;

	// /learner/:moduleId/:lessonId
	return !RESERVED_LEARNER_SEGMENTS.includes(seg[1]);
};

// Cek apakah URL mengarah ke halaman quiz (berakhiran /quiz)
const checkIsQuizPage = (pathname) => {
	return pathname.endsWith('/quiz');
};

const LMSContent = () => {
	const { pathname } = useLocation();
	const isLessonPage = checkIsLessonPage(pathname);
	const isQuizPage = checkIsQuizPage(pathname);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
				// Halaman Lesson & Quiz: Kunci setinggi viewport
				...(isLessonPage || isQuizPage
					? { height: '100vh', overflow: 'hidden' }
					: { minHeight: '80vh' }),
			}}
		>
			{/* Sembunyikan Navbar jika di halaman Quiz */}
			{!isQuizPage && (isLessonPage ? <NavbarLesson /> : <NavbarMember />)}

			<main
				style={{
					flex: 1,
					minHeight: 0,
					...((isLessonPage || isQuizPage) && {
						display: 'flex',
						flexDirection: 'column',
					}),
				}}
			>
				<Outlet />
			</main>

			{/* Sembunyikan Footer jika di halaman Lesson atau Quiz */}
			{!isLessonPage && !isQuizPage && <Footer />}

			<SRLTriggerButton />
			<SRLModal />
		</div>
	);
};

const LmsLayout = () => (
	<SRLProvider>
		<LMSContent />
	</SRLProvider>
);

export default LmsLayout;
