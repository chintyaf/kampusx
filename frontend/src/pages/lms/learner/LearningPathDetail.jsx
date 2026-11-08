import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_LEARNING_PATH, getLearningPath } from './learning-path/mockData';
import LearningHeader from '@/pages/lms/learner/learning-path/LearningHeader';
import LearningSRLGoal from '@/pages/lms/learner/learning-path/LearningSRLGoal';
import LearningModule from '@/pages/lms/learner/learning-path/LearningModule';
import LearningCert from '@/pages/lms/learner/learning-path/LearningCert';
import LearningBadges from '@/pages/lms/learner/learning-path/LearningBadges';
import LearningAnalytics from '@/pages/lms/learner/learning-path/LearningAnalytics';
import OrganizerCard from '@/pages/lms/learner/learning-path/OrganizerCard';
import {
	CheckCircle2,
	Clock,
	BookOpen,
	ShieldCheck,
	Award,
	Sparkles,
	Lock,
	Flame,
	Calendar,
	ArrowRight,
	ChevronRight,
	ChevronDown,
	ChevronUp,
	Bookmark,
	Share2,
	Play,
	RotateCcw,
	Video,
	FileText,
	HelpCircle,
	Brain,
	Layers,
	Star,
	UserCheck,
	Check,
	ExternalLink,
} from 'lucide-react';

import '@/pages/lms/lms.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const LearningPathDetail = () => {
	const { pathId = 'lp-1' } = useParams();
	const navigate = useNavigate();
	const currentPath = getLearningPath(pathId);

	// --- SRL Forethought State ---
	const [selectedHours, setSelectedHours] = useState('3');
	const [selectedWeeks, setSelectedWeeks] = useState('6');
	const [goalSaved, setGoalSaved] = useState(false);

	// --- Module Accordion State (Modul 3 is expanded by default) ---
	const [expandedModules, setExpandedModules] = useState({ 3: true });

	// --- Bookmark State ---
	const [isBookmarked, setIsBookmarked] = useState(false);

	const toggleModuleExpand = (moduleNum) => {
		setExpandedModules((prev) => ({
			...prev,
			[moduleNum]: !prev[moduleNum],
		}));
	};

	const handleSaveGoal = () => {
		setGoalSaved(true);
		setTimeout(() => setGoalSaved(false), 3500);
	};

	// Helper date projection based on selected hours and weeks
	const getProjectedDate = (weeks) => {
		const targetDate = new Date();
		targetDate.setDate(targetDate.getDate() + parseInt(weeks, 10) * 7);
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}).format(targetDate);
	};

	return (
		<div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
			{/* Render komponen header */}
			<LearningHeader
				isBookmarked={isBookmarked}
				onToggleBookmark={() => setIsBookmarked(!isBookmarked)}
			/>

			{/* ====================================================================
            2. MAIN CONTENT & SIDEBAR SECTION (col-lg-8 & col-lg-4)
            ==================================================================== */}
			<Container className="mt-4">
				<Row className="g-4">
					{/* ================================================================
                    A. KOLOM UTAMA (col-lg-8)
                    ================================================================ */}
					<Col lg={8}>
						{/* 2. WIDGET ROADMAP: "Module Roadmap" (Timeline Interactive) */}
						<LearningModule
							modules={currentPath.modules}
							expandedModules={expandedModules}
							onToggleModule={toggleModuleExpand}
						/>
					</Col>

					{/* ================================================================
                    B. KOLOM SIDEBAR (col-lg-4)
                    ================================================================ */}
					<Col lg={4}>
						{/* 1. KAMPUSX CERTIFICATE PREVIEW CARD (FITUR KLAIM SERTIFIKAT KELULUSAN) */}
						<LearningCert
							pathId={pathId}
							progressPercent={currentPath.metrics.progressPercent}
							totalModules={currentPath.metrics.moduleCount}
							completedModules={currentPath.metrics.completedModules}
						/>

						{/* 2. EARNABLE BADGES GRID */}
						<LearningBadges badges={currentPath.badges} />

						{/* 3. LEARNING ANALYTICS & PROGRESS WIDGET */}
						<LearningAnalytics metrics={currentPath.metrics} />

						{/* 4. INSTRUCTOR CARD */}
						<OrganizerCard instructor={currentPath.instructor} />
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default LearningPathDetail;
