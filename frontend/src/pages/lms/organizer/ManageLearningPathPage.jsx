import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
	ChevronLeft,
	Calendar,
	Layers,
	Users,
	Eye,
	Award,
	Link as LinkIcon,
	BarChart2,
	Save,
	CheckCircle,
	AlertCircle,
} from 'lucide-react';

import CurriculumTab from './manage-learning-path/CurriculumTab';
import CertificateTab from './manage-learning-path/CertificateTab';
import LinkedEventTab from './manage-learning-path/LinkedEventsTab';
import AnalyticTab from './manage-learning-path/AnalyticTab';

// ==========================================
// ROUTES — disamakan dengan LmsRoutes.jsx (dipakai oleh semua tab lewat props)
// ==========================================
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

// ==========================================
// TOKENS
// ==========================================
const T = {
	font: 'var(--font, system-ui, -apple-system, "Segoe UI", sans-serif)',
	bg: 'var(--color-bg, #f3f4f6)',
	card: 'var(--card, #ffffff)',
	text: 'var(--color-text, #1e293b)',
	textMuted: 'var(--color-text-muted, #334155)',
	neutral: 'var(--neutral-text, #64748b)',
	neutralBg: 'var(--neutral-bg, #f1f5f9)',
	border: 'var(--neutral-border, #e2e8f0)',
	primary: 'var(--color-primary, #006699)',
	white: 'var(--color-white, #ffffff)',
	successBg: 'var(--success-bg, #dcfce7)',
	successText: 'var(--success-text, #166534)',
	fxs: 'var(--font-xs, 12px)',
	fsm: 'var(--font-sm, 14px)',
	fxl: 'var(--font-xl, 28px)',
	rMd: 'var(--radius-md, 10px)',
	rFull: 'var(--radius-full, 999px)',
};

const LEARNING_PATH = {
	title: 'Intro to Machine Learning',
	collectionName: 'Intro to Machine Learning (Collection)',
	status: 'Published',
	linkedEvent: 'AI Summit 2026',
	enrolledStudents: 847,
};

const TABS = [
	{ id: 'curriculum', label: 'Curriculum Builder', icon: Layers },
	{ id: 'certificates', label: 'Certificate & Badges', icon: Award },
	{ id: 'linked-event', label: 'Linked Event & Rules', icon: LinkIcon },
	{ id: 'analytics', label: 'Analytics & Students', icon: BarChart2 },
];

// type: 'lesson' | 'quiz'; format (lesson): 'article' | 'micro'
// TODO: ganti dengan data dari API berdasarkan learningId
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
			{ id: 'l3', type: 'lesson', format: 'article', title: 'Regression Basics', minutes: 6 },
			{
				id: 'l4',
				type: 'lesson',
				format: 'micro',
				title: 'Classification Overview',
				minutes: 7,
			},
			{ id: 'l5', type: 'lesson', format: 'article', title: 'Decision Trees', minutes: 9 },
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

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Tombol dengan efek hover (inline CSS tidak punya :hover)
const Btn = ({ style, hoverStyle, disabled, children, ...rest }) => {
	const [hover, setHover] = useState(false);
	return (
		<button
			type="button"
			disabled={disabled}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 8,
				fontFamily: 'inherit',
				cursor: disabled ? 'not-allowed' : 'pointer',
				opacity: disabled ? 0.55 : 1,
				transition: 'background-color .15s, border-color .15s, color .15s',
				...style,
				...(hover && !disabled ? hoverStyle : {}),
			}}
			{...rest}
		>
			{children}
		</button>
	);
};

// ==========================================
// HALAMAN UTAMA — header, tab navigation, state bersama (modules/dirty/save/toast)
// ==========================================
const ManageLearningPathPage = () => {
	const navigate = useNavigate();
	const { learningId } = useParams();
	const id = learningId || '1';

	const [activeTab, setActiveTab] = useState('curriculum');
	const [modules, setModules] = useState(INITIAL_MODULES);
	const [dirty, setDirty] = useState(false);
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState(null);

	// Toast otomatis hilang
	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 3000);
		return () => clearTimeout(t);
	}, [toast]);

	// Peringatan jika menutup tab browser dengan perubahan belum disimpan
	useEffect(() => {
		if (!dirty) return;
		const handler = (e) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [dirty]);

	const showToast = (message, type = 'success') => setToast({ message, type });

	// Diteruskan ke CurriculumTab: setiap perubahan struktur menandai dirty
	const handleModulesChange = (updater) => {
		setModules(updater);
		setDirty(true);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			// TODO: kirim `modules` (urutan, nama, item) ke backend, mis.
			// await api.put(`/organizer/learning-paths/${id}/curriculum`, { modules });
			await new Promise((r) => setTimeout(r, 600));
			setModules((prev) => prev.map((m) => ({ ...m, unsaved: false })));
			setDirty(false);
			showToast('Perubahan Learning Path berhasil disimpan.');
		} catch {
			showToast('Perubahan gagal disimpan. Coba lagi.', 'error');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div
			style={{
				fontFamily: T.font,
				backgroundColor: T.bg,
				color: T.text,
				minHeight: '100vh',
				padding: '24px 32px',
				boxSizing: 'border-box',
			}}
		>
			{/* Breadcrumb */}
			<nav
				aria-label="Breadcrumb"
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 6,
					marginBottom: 8,
					fontSize: T.fsm,
					color: T.neutral,
					flexWrap: 'wrap',
				}}
			>
				<Btn
					aria-label="Kembali"
					onClick={() => navigate(-1)}
					style={{ background: 'none', border: 'none', padding: 0, color: T.neutral }}
				>
					<ChevronLeft size={16} />
				</Btn>
				<RouterLink to={ROUTES.list} style={{ color: T.neutral, textDecoration: 'none' }}>
					Learning Paths
				</RouterLink>
				<span aria-hidden="true">/</span>
				<span aria-current="page" style={{ fontWeight: 500, color: T.text }}>
					{LEARNING_PATH.collectionName}
				</span>
			</nav>

			{/* Header */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: 16,
					marginBottom: 8,
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
					<h1 style={{ margin: 0, fontSize: T.fxl, fontWeight: 700 }}>
						{LEARNING_PATH.title}
					</h1>
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 8,
							padding: '4px 14px',
							backgroundColor: T.successBg,
							color: T.successText,
							borderRadius: T.rFull,
							fontSize: T.fxs,
							fontWeight: 600,
						}}
					>
						<span
							style={{
								width: 7,
								height: 7,
								borderRadius: '50%',
								backgroundColor: T.successText,
							}}
						/>
						{LEARNING_PATH.status}
					</span>
					{dirty && (
						<span style={{ fontSize: T.fxs, color: T.neutral }}>
							Ada perubahan yang belum disimpan
						</span>
					)}
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<Btn
						onClick={() => window.open(ROUTES.preview(id), '_blank', 'noopener')}
						style={{
							padding: '8px 14px',
							backgroundColor: T.card,
							border: `1px solid ${T.border}`,
							borderRadius: T.rMd,
							color: T.text,
							fontSize: T.fsm,
							fontWeight: 600,
						}}
						hoverStyle={{ backgroundColor: T.neutralBg }}
					>
						<Eye size={16} /> Preview as Student
					</Btn>
					<Btn
						onClick={handleSave}
						disabled={!dirty || saving}
						style={{
							padding: '8px 16px',
							backgroundColor: T.primary,
							color: T.white,
							borderRadius: T.rMd,
							fontSize: T.fsm,
							fontWeight: 600,
							border: 'none',
						}}
						hoverStyle={{ filter: 'brightness(0.92)' }}
					>
						<Save size={16} /> {saving ? 'Menyimpan…' : 'Save Changes'}
					</Btn>
				</div>
			</div>

			{/* Metadata */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 24,
					marginBottom: 24,
					flexWrap: 'wrap',
					fontSize: T.fsm,
					color: T.neutral,
				}}
			>
				<Btn
					onClick={() => setActiveTab('linked-event')}
					style={{
						background: 'none',
						border: 'none',
						padding: 0,
						color: T.neutral,
						fontSize: T.fsm,
					}}
					hoverStyle={{ color: T.primary }}
				>
					<Calendar size={16} />
					<span>
						Linked Event:{' '}
						<strong style={{ color: T.textMuted }}>{LEARNING_PATH.linkedEvent}</strong>
					</span>
				</Btn>
				<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
					<Layers size={16} /> {plural(modules.length, 'Module', 'Modules')}
				</span>
				<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
					<Users size={16} /> {LEARNING_PATH.enrolledStudents} Enrolled Students
				</span>
			</div>

			{/* Tab navigation */}
			<div
				role="tablist"
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 28,
					marginBottom: 24,
					borderBottom: `1px solid ${T.border}`,
				}}
			>
				{TABS.map((tab) => {
					const Icon = tab.icon;
					const active = activeTab === tab.id;
					return (
						<Btn
							key={tab.id}
							role="tab"
							aria-selected={active}
							onClick={() => setActiveTab(tab.id)}
							style={{
								padding: '0 4px 12px',
								background: 'none',
								border: 'none',
								borderBottom: `2px solid ${active ? T.primary : 'transparent'}`,
								marginBottom: -1,
								borderRadius: 0,
								fontSize: T.fsm,
								fontWeight: active ? 600 : 500,
								color: active ? T.primary : T.neutral,
								whiteSpace: 'nowrap',
							}}
							hoverStyle={{ color: T.primary }}
						>
							<Icon size={18} /> {tab.label}
						</Btn>
					);
				})}
			</div>

			{/* Isi tab.
			    Curriculum tetap ter-mount (hanya disembunyikan) supaya pencarian dan
			    status expand/collapse tidak hilang saat pindah tab. */}
			<div role="tabpanel" hidden={activeTab !== 'curriculum'}>
				<CurriculumTab
					id={id}
					routes={ROUTES}
					modules={modules}
					onModulesChange={handleModulesChange}
					showToast={showToast}
				/>
			</div>
			{activeTab === 'certificates' && (
				<div role="tabpanel">
					<CertificateTab id={id} routes={ROUTES} />
				</div>
			)}
			{activeTab === 'linked-event' && (
				<div role="tabpanel">
					<LinkedEventTab id={id} routes={ROUTES} />
				</div>
			)}
			{activeTab === 'analytics' && (
				<div role="tabpanel">
					<AnalyticTab id={id} routes={ROUTES} />
				</div>
			)}

			{/* Toast */}
			{toast && (
				<div
					role="status"
					style={{
						position: 'fixed',
						right: 24,
						bottom: 24,
						zIndex: 1100,
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						maxWidth: 380,
						padding: '12px 16px',
						fontSize: T.fsm,
						borderRadius: T.rMd,
						background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
						color: toast.type === 'error' ? '#b91c1c' : '#166534',
						border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
						boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
					}}
				>
					{toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
					<span style={{ flex: 1 }}>{toast.message}</span>
				</div>
			)}
		</div>
	);
};

export default ManageLearningPathPage;
