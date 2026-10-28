import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

// Import Data Mock & Komponen
import { getModuleData } from '@/pages/lms/mock-data/mockData';
import ModuleHeader from '@/pages/lms/learner/modules/detail-module/ModuleHeader';
import ModuleLesson from '@/pages/lms/learner/modules/detail-module/ModuleLesson';
import SRLForethoughtModal from '@/components/lms/SRLForethoughtModal';

/**
 * ModuleDetailPage
 * Halaman Akses & Overview Modul Microlearning dengan SRL Forethought Interceptor
 */
const ModuleDetailPage = () => {
	const { moduleId = 'mod-arch-101' } = useParams();
	const navigate = useNavigate();

	const moduleData = getModuleData(moduleId);

	const [isBookmarked, setIsBookmarked] = useState(false);
	const [lessonFilter, setLessonFilter] = useState('all'); // 'all' | 'uncompleted'

	// --- STATE INTERSEPTOR SRL FORETHOUGHT ---
	const [isForethoughtOpen, setIsForethoughtOpen] = useState(false);
	const [targetLessonId, setTargetLessonId] = useState(null);

	/**
	 * 1. Pemicu Akses Modul (Action Trigger)
	 * Menahan navigasi langsung dan menampilkan modal SRL Forethought
	 */
	const handleInitiateLearning = (lessonId) => {
		const target = lessonId || moduleData?.currentLessonId || moduleData?.lessons?.[0]?.id;
		setTargetLessonId(target);
		setIsForethoughtOpen(true);
	};

	/**
	 * 4. Transisi ke Fase Performance (Navigation Unlock)
	 * Menutup modal perencanaan dan mengalihkan pengguna ke Halaman Materi/Lesson
	 */
	const handleForethoughtComplete = (payload) => {
		setIsForethoughtOpen(false);

		// Redirect ke halaman lesson materi aktif (Fase Performance)
		const lessonDestination = targetLessonId || moduleData?.currentLessonId || 'les-01';
		navigate(`/learner/lessons/${lessonDestination}`);
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
				handleNavigateToLesson={handleInitiateLearning}
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
							handleNavigateToLesson={handleInitiateLearning}
						/>
					</Col>
				</Row>
			</Container>

			{/* 3. MODAL POP-UP FORM FORETHOUGHT (Interseptor Pre-Learning) */}
			<SRLForethoughtModal
				isOpen={isForethoughtOpen}
				onClose={() => setIsForethoughtOpen(false)}
				onComplete={handleForethoughtComplete}
				enrollmentId={moduleData?.enrollmentId || 1}
				recommendedTime={15}
				moduleTitle={moduleData?.title}
			/>
		</div>
	);
};

export default ModuleDetailPage;
