import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

// Import Data Mock & Komponen
import { getModuleData } from '@/pages/lms/mock-data/mockData';
import ModuleHeader from '@/pages/lms/learner/modules/detail-module/ModuleHeader';
import ModuleLesson from '@/pages/lms/learner/modules/detail-module/ModuleLesson';

/**
 * ModuleDetailPage
 * Halaman Akses & Overview Modul Microlearning
 */
const ModuleDetailPage = () => {
	const { slug, moduleId = 'mod-arch-101' } = useParams();
	const navigate = useNavigate();

	const moduleData = getModuleData(moduleId);

	const [isBookmarked, setIsBookmarked] = useState(false);
	const [lessonFilter, setLessonFilter] = useState('all'); // 'all' | 'uncompleted'

	/**
	 * Navigasi langsung ke halaman lesson atau quiz sesuai LmsRoutes
	 */
	const handleNavigateToLesson = (lessonOrId) => {
		const resolvedId =
			typeof lessonOrId === 'object' && lessonOrId !== null ? lessonOrId.id : lessonOrId;

		const lessonDestination =
			resolvedId || moduleData?.currentLessonId || moduleData?.lessons?.[0]?.id || 'les-01';

		if (typeof lessonOrId === 'object' && lessonOrId?.type === 'quiz') {
			const quizPath = slug
				? `/learner/learning-paths/${slug}/modules/${moduleId}/quiz`
				: 'quiz';
			navigate(quizPath);
			return;
		}

		const lessonPath = slug
			? `/learner/learning-paths/${slug}/modules/${moduleId}/lessons/${lessonDestination}`
			: `lessons/${lessonDestination}`;
		navigate(lessonPath);
	};

	const filteredLessons = moduleData.lessons.filter((les) => {
		if (lessonFilter === 'uncompleted') {
			return les.status !== 'completed';
		}
		return true;
	});

	return (
		<div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
			{/* 1. HERO BANNER / HEADER MODUL */}
			<ModuleHeader
				moduleData={moduleData}
				handleNavigateToLesson={handleNavigateToLesson}
				isBookmarked={isBookmarked}
				setIsBookmarked={setIsBookmarked}
			/>

			{/* 2. MAIN CONTENT & SIDEBAR SECTION */}
			<Container style={{ marginTop: '1.5rem' }}>
				<Row className="g-4">
					<Col lg={12}>
						{/* DAFTAR UNIT PEMBELAJARAN (LESSON ROADMAP) */}
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
