import React from 'react';
import { Outlet, useLocation, matchPath } from 'react-router-dom';
import NavbarMember from '../partials-dashboard/NavbarMember.jsx';
import NavbarLesson from '../partials-dashboard/NavbarLesson.jsx';
import Footer from '../partials-dashboard/Footer';
import SRLModal from '@/components/lms/srl-modal/SRLModal';
import SRLTriggerButton from '@/components/lms/srl-modal/SRLTriggerButton';
import { SRLProvider } from '@/context/SRLContext';

// Cek apakah URL mengarah ke LessonViewerPage (/learner/learning-paths/:slug/modules/:moduleId/lessons/:lessonId?)
const checkIsLessonPage = (pathname) =>
	Boolean(
		matchPath('/learner/learning-paths/:slug/modules/:moduleId/lessons', pathname) ||
		matchPath('/learner/learning-paths/:slug/modules/:moduleId/lessons/:lessonId', pathname),
	);

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
