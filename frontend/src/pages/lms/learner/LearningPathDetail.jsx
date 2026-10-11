import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MOCK_LEARNING_PATH } from './learning-path/mockData';
import LearningHeader from '@/pages/lms/learner/learning-path/LearningHeader';
import LearningSRLGoal from '@/pages/lms/learner/learning-path/LearningSRLGoal';
import LearningModule from '@/pages/lms/learner/learning-path/LearningModule';
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
	const navigate = useNavigate();

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

	// SVG Radial Gauge Calculations
	const radius = 46;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset =
		circumference - (MOCK_LEARNING_PATH.metrics.progressPercent / 100) * circumference;

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
			<Container className="mt-5" >
				<Row>
					{/* ================================================================
                    A. KOLOM UTAMA (col-lg-8)
                    ================================================================ */}
					<Col lg={12}>
						{/* 1. WIDGET SRL: "Set Your Learning Goals" (Forethought Phase) */}
						<LearningSRLGoal
							selectedHours={selectedHours}
							setSelectedHours={setSelectedHours}
							selectedWeeks={selectedWeeks}
							setSelectedWeeks={setSelectedWeeks}
							goalSaved={goalSaved}
							handleSaveGoal={handleSaveGoal}
							getProjectedDate={getProjectedDate}
						/>

						{/* 2. WIDGET ROADMAP: "Module Roadmap" (Timeline Interactive) */}
						<LearningModule
							modules={MOCK_LEARNING_PATH.modules}
							expandedModules={expandedModules}
							onToggleModule={toggleModuleExpand}
						/>
					</Col>

					{/* ================================================================
                    B. KOLOM SIDEBAR (col-lg-4)
                    ================================================================ */}
					<Col lg={4}>
						{/* 1. LEARNING ANALYTICS & PROGRESS WIDGET */}

						{/* 2. INSTRUCTOR CARD */}

						{/* 3. EARNABLE BADGES GRID */}

						{/* 4. KAMPUSX CERTIFICATE PREVIEW CARD */}

						{/* 5. "WHAT YOU'LL LEARN" CHECKLIST */}
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default LearningPathDetail;
