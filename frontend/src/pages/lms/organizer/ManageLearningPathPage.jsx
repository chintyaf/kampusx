import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Container, Nav } from 'react-bootstrap';

import { notify } from '@/utils/notify';

import ManageLearningHeader from './manage-learning-path/ManageLearningHeader';

import CurriculumTab from './manage-learning-path/CurriculumTab';
import CertificateTab from './manage-learning-path/CertificateTab';
import LinkedEventTab from './manage-learning-path/LinkedEventsTab';
import AnalyticTab from './manage-learning-path/AnalyticTab';

const ORG = '/organizer';

const lp = (id) => `${ORG}/learning-path/${id}`;

const ROUTES = {
	list: `${ORG}/learning-paths`,

	preview: (id) => `/learner/learning-paths/${id}`,

	editModule: (id, moduleId) => `${lp(id)}/edit-module/${moduleId}`,

	newLessonManual: (id, moduleId) => `${lp(id)}/edit-module/${moduleId}/new?method=manual`,

	editLesson: (id, moduleId, lessonId) => `${ORG}/modules/${moduleId}?lesson=${lessonId}`,

	newQuiz: (id, moduleId) => `${lp(id)}/edit-module/${moduleId}/new?tab=quiz`,

	editQuiz: (id, moduleId, quizId) => `${lp(id)}/edit-module/${moduleId}/${quizId}?tab=quiz`,

	newLessonAI: (id, moduleId) => `${ORG}/ai-studio/upload?learningId=${id}&moduleId=${moduleId}`,

	aiGenerate: (id) => `${ORG}/ai-studio/upload?learningId=${id}`,

	badges: (id) => `${ORG}/badges?learningId=${id}`,

	events: (id) => `${ORG}/content?learningId=${id}`,

	analytics: (id) => `${ORG}/logs?learningId=${id}`,
};

// ==================================
// LEARNING PATH DATA
// ==================================

const LEARNING_PATH = {
	title: 'Intro to Machine Learning',
	collectionName: 'Intro to Machine Learning (Collection)',
	status: 'Published',
	linkedEvent: 'AI Summit 2026',
	enrolledStudents: 847,
};

// ==================================
// TAB CONFIGURATION
// ==================================

const TABS = [
	{
		key: 'curriculum',
		label: 'Curriculum Builder',
	},
	{
		key: 'certificate',
		label: 'Certificate & Badges',
	},
	{
		key: 'linked-event',
		label: 'Linked Event & Rules',
	},
	{
		key: 'analytics',
		label: 'Analytics & Students',
	},
];

// ==================================
// INITIAL MODULE DATA
// ==================================

const INITIAL_MODULES = [
	{
		id: 1,
		name: 'Fundamentals of Python',
		items: [
			{
				id: 'l1',
				type: 'lesson',
				format: 'article',
				title: 'Introduction to Variables',
				minutes: 5,
			},
			{
				id: 'l2',
				type: 'lesson',
				format: 'micro',
				title: 'Data Structures Overview',
				minutes: 8,
			},
			{
				id: 'q1',
				type: 'quiz',
				title: 'Reflection Quiz: Python Basics',
				questions: 5,
				passScore: 80,
			},
		],
	},
	{
		id: 2,
		name: 'Supervised Learning Techniques',
		items: [
			{
				id: 'l3',
				type: 'lesson',
				format: 'article',
				title: 'Regression Basics',
				minutes: 6,
			},
			{
				id: 'l4',
				type: 'lesson',
				format: 'micro',
				title: 'Classification Overview',
				minutes: 7,
			},
			{
				id: 'l5',
				type: 'lesson',
				format: 'article',
				title: 'Decision Trees',
				minutes: 9,
			},
			{
				id: 'l6',
				type: 'lesson',
				format: 'micro',
				title: 'Model Evaluation Metrics',
				minutes: 8,
			},
			{
				id: 'q2',
				type: 'quiz',
				title: 'Reflection Quiz: Supervised Learning',
				questions: 6,
				passScore: 75,
			},
		],
	},
];

// ==================================
// MAIN COMPONENT
// ==================================

const ManageLearningPathPage = () => {
	const { id } = useParams();

	const [activeTab, setActiveTab] = useState('curriculum');
	const [modules, setModules] = useState(INITIAL_MODULES);

	// Update modules from CurriculumTab.
	const handleModulesChange = (updater) => {
		setModules((previousModules) =>
			typeof updater === 'function' ? updater(previousModules) : updater,
		);
	};

	// Show notification from CurriculumTab.
	const showToast = (message, type = 'success') => {
		notify(type, type === 'error' ? 'Terjadi Kesalahan' : 'Berhasil', message);
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: 'var(--color-bg, #f3f4f6)',
				color: 'var(--color-text, #1e293b)',
			}}
		>
			<Container fluid className="px-5 py-4 my-2">
				{/* PAGE HEADER */}
				<ManageLearningHeader
					id={id}
					learningPath={LEARNING_PATH}
					modules={modules}
					onLinkedEventClick={() => setActiveTab('linked-event')}
				/>

				{/* TAB NAVIGATION */}
				<div
					className="mb-4"
					style={{
						borderBottom: '1px solid var(--neutral-border, #e2e8f0)',
					}}
				>
					<Nav
						variant="underline"
						activeKey={activeTab}
						onSelect={(selectedKey) => {
							if (selectedKey) {
								setActiveTab(selectedKey);
							}
						}}
						className="flex-nowrap overflow-auto"
					>
						{TABS.map((tab) => (
							<Nav.Item key={tab.key}>
								<Nav.Link
									eventKey={tab.key}
									className="text-nowrap fw-semibold px-3"
									style={{
										color:
											activeTab === tab.key
												? 'var(--color-primary, #00699e)'
												: 'var(--neutral-text, #64748b)',
									}}
								>
									{tab.label}
								</Nav.Link>
							</Nav.Item>
						))}
					</Nav>
				</div>

				{/* TAB CONTENT */}

				{/* Curriculum remains mounted to preserve its local state. */}
				<div role="tabpanel" hidden={activeTab !== 'curriculum'}>
					<CurriculumTab
						id={id}
						routes={ROUTES}
						modules={modules}
						onModulesChange={handleModulesChange}
						showToast={showToast}
					/>
				</div>

				{activeTab === 'certificate' && <CertificateTab id={id} routes={ROUTES} />}

				{activeTab === 'linked-event' && <LinkedEventTab id={id} routes={ROUTES} />}

				{activeTab === 'analytics' && <AnalyticTab id={id} routes={ROUTES} />}
			</Container>
		</div>
	);
};

export default ManageLearningPathPage;
