import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

// Import Data Mock & Komponen
import { getModuleData } from '@/pages/lms/learner/modules/detail/mockData';
import ModuleHeader from '@/pages/lms/learner/modules/detail/ModuleHeader';
import ModuleLesson from '@/pages/lms/learner/modules/detail/ModuleLesson';
import ModuleSRL from '@/pages/lms/learner/modules/detail/ModuleSRL';

/**
 * ModuleDetailPage
 * Halaman Akses & Overview Modul Microlearning
 */
const ModuleDetailPage = () => {
	const { moduleId = 'mod-arch-101' } = useParams();
	const navigate = useNavigate();

	const moduleData = getModuleData(moduleId);

	const [isBookmarked, setIsBookmarked] = useState(false);

	// Filter lessons
	const [lessonFilter, setLessonFilter] = useState('all'); // 'all' | 'uncompleted'

	const handleNavigateToLesson = (lessonId) => {
		navigate(`/learner/lesson/${lessonId}`);
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
			<Container className="" style={{ marginTop: '1.5rem' }}>
				<Row className="g-4">
					{/* A. MAIN CONTENT AREA (col-lg-8) */}
					<Col lg={12}>
						{/* 2. DAFTAR UNIT PEMBELAJARAN (LESSON ROADMAP) */}
						<ModuleLesson
							moduleData={moduleData}
							filteredLessons={filteredLessons}
							lessonFilter={lessonFilter}
							setLessonFilter={setLessonFilter}
							handleNavigateToLesson={handleNavigateToLesson}
						/>

						{/* 3. CAPAIAN PEMBELAJARAN (LEARNING OUTCOMES) */}
					</Col>

					{/* B. SIDEBAR AREA (col-lg-4) */}
					<Col lg={4}>
						{/* 1. WIDGET SRL: FASE 1 - FORETHOUGHT & PLANNING */}
						{/* <ModuleSRL /> */}
						{/* 1. INSTRUKTUR KELAS */}

						{/* 2. DIGITAL BADGE & SERTIFIKASI CHECKPOINT */}

						{/* 3. SRL TIPS & HABIT BOOSTER */}
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default ModuleDetailPage;
