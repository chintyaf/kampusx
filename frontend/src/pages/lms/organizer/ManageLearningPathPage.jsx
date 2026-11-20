import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '@/api/axios';
import { Container, Nav, Spinner, Alert } from 'react-bootstrap';
import { notify } from '@/utils/notify';

import ManageLearningHeader from './manage-learning-path/ManageLearningHeader';
import CurriculumTab from './manage-learning-path/CurriculumTab';
import CertificateTab from './manage-learning-path/CertificateTab';
import LinkedEventTab from './manage-learning-path/LinkedEventsTab';
import AnalyticTab from './manage-learning-path/AnalyticTab';

// ==================================
// ROUTES
// ==================================

const ORG = '/organizer';

const lp = (learningId) => `${ORG}/learning-path/${learningId}`;

const ROUTES = {
	list: `${ORG}/learning-paths`,

	preview: (learningId) => `/learner	/learning-paths/${learningId}`,

	editModule: (learningId, moduleId) => `${lp(learningId)}/edit-module/${moduleId}`,

	newLessonManual: (learningId, moduleId) =>
		`${lp(learningId)}/edit-module/${moduleId}/new?method=manual`,

	editLesson: (learningId, moduleId, lessonId) => `${ORG}/modules/${moduleId}?lesson=${lessonId}`,

	newQuiz: (learningId, moduleId) => `${lp(learningId)}/edit-module/${moduleId}/new?tab=quiz`,

	editQuiz: (learningId, moduleId, quizId) =>
		`${lp(learningId)}/edit-module/${moduleId}/${quizId}?tab=quiz`,

	newLessonAI: (learningId, moduleId) =>
		`${ORG}/ai-studio/upload?learningId=${learningId}&moduleId=${moduleId}`,

	aiGenerate: (learningId) => `${ORG}/ai-studio/upload?learningId=${learningId}`,

	badges: (learningId) => `${ORG}/badges?learningId=${learningId}`,

	events: (learningId) => `${ORG}/content?learningId=${learningId}`,

	analytics: (learningId) => `${ORG}/logs?learningId=${learningId}`,
};

// ==================================
// DATA MAPPING
// ==================================

// Convert API lesson to CurriculumTab structure
const mapLesson = (lesson) => ({
	...lesson,

	id: lesson.id,
	type: 'lesson',

	// API: microlearning
	// UI: micro
	format: lesson.type === 'microlearning' ? 'micro' : lesson.type,

	title: lesson.title,
	minutes: lesson.duration_minutes ?? 0,
});

// Convert API module to CurriculumTab structure
const mapModule = (module) => ({
	...module,

	id: module.id,
	name: module.title,

	items: (module.lessons || []).map(mapLesson),
});

// Convert API learning path response
const mapLearningPath = (data) => ({
	...data,

	title: data.title,
	collectionName: data.title,
	status: data.status,

	linkedEvent: data.event?.title ?? null,

	enrolledStudents: data.enrollments_count ?? 0,

	modules: (data.modules || []).map(mapModule),
});

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
// MAIN COMPONENT
// ==================================

const ManageLearningPathPage = () => {
	const { learningId } = useParams();

	// ----------------------------------
	// STATE
	// ----------------------------------

	const [activeTab, setActiveTab] = useState('curriculum');

	const [learningPath, setLearningPath] = useState(null);
	const [modules, setModules] = useState([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// ----------------------------------
	// FETCH LEARNING PATH
	// ----------------------------------

	useEffect(() => {
		let isMounted = true;

		const fetchLearningPathData = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await api.get(`organizer/lms/learning-paths/${learningId}`);
				const result = response.data;

				if (!result.success || !result.data) {
					throw new Error(result.message || 'Learning path tidak ditemukan.');
				}

				const mappedData = mapLearningPath(result.data);

				if (isMounted) {
					setLearningPath(mappedData);
					setModules(mappedData.modules);
				}
			} catch (err) {
				console.error('Gagal mengambil data learning path:', err);

				if (isMounted) {
					const message =
						err.response?.data?.message ||
						err.message ||
						'Gagal mengambil data learning path.';

					setError(message);

					notify('error', 'Terjadi Kesalahan', message);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		if (learningId) {
			fetchLearningPathData();
		} else {
			setError('Learning ID tidak ditemukan.');
			setLoading(false);
		}

		return () => {
			isMounted = false;
		};
	}, [learningId]);

	// ----------------------------------
	// UPDATE MODULES
	// ----------------------------------

	const handleModulesChange = (updater) => {
		setModules((previousModules) =>
			typeof updater === 'function' ? updater(previousModules) : updater,
		);
	};

	// ----------------------------------
	// NOTIFICATION
	// ----------------------------------

	const showToast = (message, type = 'success') => {
		notify(type, type === 'error' ? 'Terjadi Kesalahan' : 'Berhasil', message);
	};

	// ==================================
	// LOADING STATE
	// ==================================

	if (loading) {
		return (
			<div
				className="d-flex flex-column justify-content-center align-items-center"
				style={{
					minHeight: '70vh',
					gap: '12px',
				}}
			>
				<Spinner animation="border" variant="primary" />

				<span className="text-muted">Memuat learning path...</span>
			</div>
		);
	}

	// ==================================
	// ERROR STATE
	// ==================================

	if (error || !learningPath) {
		return (
			<Container fluid className="px-5 py-4">
				<Alert variant="danger">
					<Alert.Heading>Gagal Memuat Learning Path</Alert.Heading>

					{error || 'Data learning path tidak tersedia.'}
				</Alert>
			</Container>
		);
	}

	// ==================================
	// MAIN RENDER
	// ==================================

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
					id={learningId}
					learningPath={learningPath}
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

				{/* CURRICULUM TAB */}

				<div role="tabpanel" hidden={activeTab !== 'curriculum'}>
					<CurriculumTab
						id={learningId}
						routes={ROUTES}
						modules={modules}
						onModulesChange={handleModulesChange}
						showToast={showToast}
					/>
				</div>

				{/* CERTIFICATE TAB */}

				{activeTab === 'certificate' && <CertificateTab id={learningId} routes={ROUTES} />}

				{/* LINKED EVENT TAB */}

				{activeTab === 'linked-event' && <LinkedEventTab id={learningId} routes={ROUTES} />}

				{/* ANALYTICS TAB */}

				{activeTab === 'analytics' && <AnalyticTab id={learningId} routes={ROUTES} />}
			</Container>
		</div>
	);
};

export default ManageLearningPathPage;
