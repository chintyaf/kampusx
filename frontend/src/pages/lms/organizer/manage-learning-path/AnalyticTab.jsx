import React, { useState } from 'react';
import { Card, Nav, Table, Button, Form, Modal, Row, Col } from 'react-bootstrap';
import {
	Users,
	GraduationCap,
	Target,
	Clock,
	Gauge,
	Award,
	AlertTriangle,
	FileCode,
	Copy,
	Check,
	Eye,
} from 'lucide-react';

/* ==========================================================================
 * DUMMY DATA — nama tabel & kolom mengikuti migration:
 *   modules, quizzes, quiz_attempts, enrollments, learning_activities,
 *   srl_forethoughts, srl_reflections, readiness_predictions, recommendations
 * Nanti tinggal ganti BUILD_DUMMY() dengan response API (shape-nya sama).
 * ========================================================================== */

const MODULES = [
	{ id: 1, title: 'Python Basics & Syntax', difficulty_level: 'beginner', order_index: 1 },
	{ id: 2, title: 'Control Flow & Loops', difficulty_level: 'beginner', order_index: 2 },
	{ id: 3, title: 'Functions & Modules', difficulty_level: 'intermediate', order_index: 3 },
	{ id: 4, title: 'Data Structures', difficulty_level: 'intermediate', order_index: 4 },
	{ id: 5, title: 'Object-Oriented Programming', difficulty_level: 'advanced', order_index: 5 },
	{ id: 6, title: 'File Handling & Exceptions', difficulty_level: 'advanced', order_index: 6 },
];

const QUIZZES = MODULES.map((m, i) => ({
	id: m.id,
	module_id: m.id,
	title: `Quiz: ${m.title}`,
	bloom_level: ['Remember', 'Understand', 'Apply', 'Apply', 'Analyze', 'Evaluate'][i],
	passing_score: 70,
}));

// [user_id, name, email, ability, modules reached, enrollment status]
const STUDENT_SEED = [
	[1, 'Ahmad Faiz', 'faiz@kampusx.id', 0.88, 6, 'completed'],
	[2, 'Siti Rahma', 'siti@kampusx.id', 0.82, 6, 'completed'],
	[3, 'Dewi Lestari', 'dewi@kampusx.id', 0.92, 6, 'completed'],
	[4, 'Rian Prasetya', 'rian@kampusx.id', 0.78, 5, 'active'],
	[5, 'Budi Santoso', 'budi@kampusx.id', 0.55, 3, 'active'],
	[6, 'Agus Wijaya', 'agus@kampusx.id', 0.7, 4, 'active'],
	[7, 'Nadia Putri', 'nadia@kampusx.id', 0.85, 4, 'active'],
	[8, 'Fajar Nugroho', 'fajar@kampusx.id', 0.45, 2, 'dropped'],
	[9, 'Maya Anggraini', 'maya@kampusx.id', 0.74, 5, 'active'],
	[10, 'Reza Pratama', 'reza@kampusx.id', 0.6, 3, 'active'],
	[11, 'Intan Permata', 'intan@kampusx.id', 0.5, 1, 'dropped'],
	[12, 'Kevin Hartono', 'kevin@kampusx.id', 0.8, 2, 'active'],
];

const GOALS = [
	'Menyelesaikan 1 modul per hari',
	'Lulus quiz dengan skor di atas 80',
	'Paham OOP sebelum akhir bulan',
];
const PLANS = [
	'Belajar 45 menit dengan teknik Pomodoro',
	'Latihan soal setiap selesai materi',
	'Belajar malam hari, 2 sesi per hari',
];
const MOTIVATIONS = ['Ingin lanjut ke Data Science', 'Persiapan magang', 'Menambah portofolio'];
const REFLECTIONS = [
	'Saya masih sering keliru di bagian loop bersarang, perlu latihan lagi.',
	'Strategi Pomodoro membantu, tapi saya kurang review materi sebelum quiz.',
	'Target tercapai. Selanjutnya fokus ke studi kasus nyata.',
];

const rng = (seed) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pad = (n) => String(n).padStart(2, '0');
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const levelOf = (s) => (s < 0.5 ? 'belum_siap' : s < 0.75 ? 'cukup_siap' : 'siap');

const BUILD_DUMMY = () => {
	const rand = rng(2372018);
	const D = {
		users: {},
		enrollments: [],
		attempts: [],
		activities: [],
		predictions: [],
		forethoughts: [],
		reflections: [],
	};
	let attId = 1;
	let actId = 1;

	STUDENT_SEED.forEach(([uid, name, email, ability, reached, status]) => {
		D.users[uid] = { id: uid, name, email };
		const lastDay =
			status === 'dropped'
				? `2026-10-${pad(8 + uid)}`
				: `2026-11-${pad(21 - ((uid * 5) % 17))}`;
		D.enrollments.push({
			id: uid,
			user_id: uid,
			learning_path_id: 1,
			status,
			enrolled_at: `2026-10-${pad(1 + ((uid * 2) % 20))} 09:00:00`,
			completed_at: status === 'completed' ? `2026-11-${pad(10 + uid)} 16:30:00` : null,
			last_accessed_at: `${lastDay} ${pad(8 + (uid % 10))}:${pad((uid * 7) % 60)}:00`,
		});

		for (let mi = 0; mi < reached; mi++) {
			const quiz = QUIZZES[mi];
			const diff = { beginner: 0, intermediate: -6, advanced: -12 }[
				MODULES[mi].difficulty_level
			];
			let passed = false;
			for (let n = 1; n <= 3 && !passed; n++) {
				let score = ability * 100 + diff + (n - 1) * 9 + (rand() * 16 - 8);
				if (status === 'completed' && n === 3 && score < quiz.passing_score) {
					score = quiz.passing_score + rand() * 8;
				}
				score = Math.round(clamp(score, 20, 100) * 100) / 100;
				passed = score >= quiz.passing_score;
				D.attempts.push({
					id: attId++,
					user_id: uid,
					quiz_id: quiz.id,
					attempt_number: n,
					score,
					status: 'completed',
				});
			}
			D.activities.push({
				id: actId++,
				enrollment_id: uid,
				module_id: quiz.module_id,
				activity_type: passed ? 'complete_lesson' : 'view_lesson',
				duration_seconds: Math.round((1200 + rand() * 1800) * (1 + mi * 0.1)),
				progress: passed ? 100 : 60,
			});
		}

		const mine = D.attempts.filter((a) => a.user_id === uid);
		if (mine.length) {
			const score = clamp(
				(mean(mine.map((a) => a.score)) / 100) * 0.92 + rand() * 0.08,
				0,
				0.99999,
			);
			const rounded = Math.round(score * 100000) / 100000;
			D.predictions.push({
				id: uid,
				user_id: uid,
				model_version: 'rf-v1.2.0',
				readiness_score: rounded,
				readiness_level: levelOf(rounded),
				predicted_at: '2026-11-20 08:00:00',
			});
		}
		if (reached >= 1) {
			D.forethoughts.push({
				enrollment_id: uid,
				goal: GOALS[uid % GOALS.length],
				plan: PLANS[uid % PLANS.length],
				motivation: MOTIVATIONS[uid % MOTIVATIONS.length],
			});
		}
		if (reached >= 2) {
			D.reflections.push({
				enrollment_id: uid,
				reflection_type: status === 'completed' ? 'final' : 'general',
				content: REFLECTIONS[uid % REFLECTIONS.length],
			});
		}
	});
	return D;
};

const DATA = BUILD_DUMMY();

// recommendations (hybrid CBF + CF), sudah diagregasi per konten
const LEARNING_PATH_TITLES = { 7: 'Data Science Foundations', 9: 'Web Development with Flask' };
const RECOMMENDATIONS = [
	{
		content_type: 'module',
		content_id: 4,
		cbf_score: 0.8123,
		cf_score: 0.741,
		score: 0.784,
		rank_position: 1,
		users: 5,
	},
	{
		content_type: 'learning_path',
		content_id: 7,
		cbf_score: 0.7611,
		cf_score: 0.7902,
		score: 0.7757,
		rank_position: 2,
		users: 4,
	},
	{
		content_type: 'module',
		content_id: 3,
		cbf_score: 0.7204,
		cf_score: 0.6858,
		score: 0.7021,
		rank_position: 3,
		users: 3,
	},
	{
		content_type: 'learning_path',
		content_id: 9,
		cbf_score: 0.6432,
		cf_score: 0.7015,
		score: 0.6733,
		rank_position: 4,
		users: 2,
	},
];

const SRL_LOGS = [
	{
		id: 'srl-001',
		user_id: 1,
		module_id: 1,
		phase: 'Forethought',
		action: 'Set 45m study goal & Pomodoro strategy',
		status: 'Completed',
		time: '2026-11-21 14:22:10',
	},
	{
		id: 'srl-002',
		user_id: 7,
		module_id: 4,
		phase: 'Performance',
		action: 'Watched lesson & answered checkpoint #2',
		status: 'Completed',
		time: '2026-11-21 14:18:45',
	},
	{
		id: 'srl-003',
		user_id: 5,
		module_id: 3,
		phase: 'Self-Reflection',
		action: 'Scored 62/100 (Below passing 70) - Recommended Remedial',
		status: 'Needs Remedial',
		time: '2026-11-21 14:05:30',
	},
	{
		id: 'srl-004',
		user_id: 3,
		module_id: 6,
		phase: 'Self-Reflection',
		action: 'Scored 91/100 - Readiness Level: SIAP',
		status: 'Passed & Certified',
		time: '2026-11-21 13:50:12',
	},
];

const BLOCKCHAIN_LOGS = [
	{
		id: 'tx-001',
		user_id: 3,
		cert: 'Python Fundamentals Credential',
		txHash: '0x9a8f43b712c9842a1941d4019ff88b6a12b7a0d4c9f138e64c',
		block: 4892104,
		api: '200 OK',
		time: '2026-11-21 13:52:00',
		payload: {
			recipient: '0x321f8a709B0e38612f0198E298B312e09B2C4B18',
			tokenId: 104,
			courseId: 'lp-01',
			credentialType: 'ERC-1155',
			score: 91,
			readinessLevel: 'Siap',
			srlVerified: true,
			timestamp: 1763718720,
			issuer: 'KampusX Decentralized LMS Authority',
			signature: '0x7b58c8942b0...e421',
		},
	},
	{
		id: 'tx-002',
		user_id: 1,
		cert: 'Python Fundamentals Credential',
		txHash: '0x43b72c9182a419401988b6a12b7a0d4c9f138e64ce91a82f34',
		block: 4891950,
		api: '200 OK',
		time: '2026-11-20 11:20:15',
		payload: {
			recipient: '0x9482F84b39174092b2A34A8109F32187b409AC81',
			tokenId: 103,
			courseId: 'lp-01',
			credentialType: 'ERC-1155',
			score: 85,
			readinessLevel: 'Siap',
			srlVerified: true,
			timestamp: 1763637615,
			issuer: 'KampusX Decentralized LMS Authority',
			signature: '0x12a9e8841b0...d841',
		},
	},
	{
		id: 'tx-003',
		user_id: 2,
		cert: 'Python Fundamentals Credential',
		txHash: '0x1128fa7419b489a203498b7120a48b71a938c019284ba71928',
		block: 4891200,
		api: '429 RateLimit',
		time: '2026-11-19 17:40:02',
		payload: {
			recipient: '0x629a84B709b18361280918B2189a4B7120a48C19',
			tokenId: 102,
			courseId: 'lp-01',
			credentialType: 'ERC-1155',
			score: 80,
			readinessLevel: 'Cukup',
			srlVerified: true,
			timestamp: 1763574002,
			issuer: 'KampusX Decentralized LMS Authority',
			signature: '0x539bf429b10...f910',
		},
	},
];

/* ==========================================================================
 * DERIVED STATS (nanti dihitung backend; di sini dihitung dari DUMMY di atas)
 * ========================================================================== */

const computeStats = () => {
	const { users, enrollments, attempts, activities, predictions, forethoughts, reflections } =
		DATA;
	const total = enrollments.length;
	const countStatus = (s) => enrollments.filter((e) => e.status === s).length;

	const students = enrollments.map((e) => {
		const myAttempts = attempts.filter((a) => a.user_id === e.user_id);
		const modules = MODULES.map((m) => {
			const quiz = QUIZZES.find((q) => q.module_id === m.id);
			const att = myAttempts.filter((a) => a.quiz_id === quiz.id);
			const act = activities.find((a) => a.enrollment_id === e.id && a.module_id === m.id);
			const best = att.length ? Math.max(...att.map((a) => a.score)) : null;
			return {
				module: m,
				attempts: att.length,
				best,
				passed: best !== null && best >= quiz.passing_score,
				duration: act ? act.duration_seconds : 0,
			};
		});
		const passedCount = modules.filter((x) => x.passed).length;
		return {
			...e,
			user: users[e.user_id],
			modules,
			progress: Math.round((passedCount / MODULES.length) * 100),
			avgScore: myAttempts.length ? mean(myAttempts.map((a) => a.score)) : null,
			totalDuration: modules.reduce((s, x) => s + x.duration, 0),
			pred: predictions.find((p) => p.user_id === e.user_id) || null,
			forethought: forethoughts.find((f) => f.enrollment_id === e.id) || null,
			reflection: reflections.find((r) => r.enrollment_id === e.id) || null,
		};
	});

	const moduleRows = MODULES.map((m) => {
		const quiz = QUIZZES.find((q) => q.module_id === m.id);
		const att = attempts.filter((a) => a.quiz_id === quiz.id);
		const uids = [...new Set(att.map((a) => a.user_id))];
		const passedUsers = uids.filter((u) =>
			att.some((a) => a.user_id === u && a.score >= quiz.passing_score),
		);
		const durs = activities.filter((a) => a.module_id === m.id).map((a) => a.duration_seconds);
		return {
			module: m,
			quiz,
			learners: uids.length,
			reachRate: (uids.length / total) * 100,
			passRate: uids.length ? (passedUsers.length / uids.length) * 100 : 0,
			avgScore: mean(att.map((a) => a.score)),
			avgAttempts: uids.length ? att.length / uids.length : 0,
			avgDuration: mean(durs),
		};
	});

	const bloom = {};
	QUIZZES.forEach((q) => {
		const sc = attempts.filter((a) => a.quiz_id === q.id).map((a) => a.score);
		bloom[q.bloom_level] = [...(bloom[q.bloom_level] || []), ...sc];
	});
	const bloomRows = Object.entries(bloom).map(([level, sc]) => ({
		level,
		avg: mean(sc),
		n: sc.length,
	}));

	const readiness = { belum_siap: 0, cukup_siap: 0, siap: 0 };
	predictions.forEach((p) => (readiness[p.readiness_level] += 1));

	const srl = [
		{
			label: 'Forethought',
			hint: 'Menyusun target & rencana',
			n: new Set(forethoughts.map((f) => f.enrollment_id)).size,
			variant: 'primary',
		},
		{
			label: 'Performance',
			hint: 'Mencatat aktivitas belajar',
			n: new Set(activities.map((a) => a.enrollment_id)).size,
			variant: 'info',
		},
		{
			label: 'Self-Reflection',
			hint: 'Menulis refleksi',
			n: new Set(reflections.map((r) => r.enrollment_id)).size,
			variant: 'secondary',
		},
	];

	const attention = students
		.filter((s) => s.status !== 'completed')
		.map((s) => {
			if (s.status === 'dropped')
				return {
					s,
					reason:
						'Berhenti di modul ' + (s.modules.filter((m) => m.attempts).length || 0),
				};
			if (s.pred && s.pred.readiness_level === 'belum_siap')
				return { s, reason: 'Readiness rendah' };
			return null;
		})
		.filter(Boolean);

	return {
		total,
		active: countStatus('active'),
		completed: countStatus('completed'),
		dropped: countStatus('dropped'),
		completionRate: (countStatus('completed') / total) * 100,
		avgScore: mean(attempts.map((a) => a.score)),
		avgDuration: mean(students.map((s) => s.totalDuration)),
		avgReadiness: mean(predictions.map((p) => p.readiness_score)),
		students,
		moduleRows,
		bloomRows,
		readiness,
		srl,
		attention,
	};
};

const STATS = computeStats();

/* ==========================================================================
 * HELPERS / STYLING — semua warna, radius, & font diambil dari token index.css
 * ========================================================================== */

const fmtDur = (s) => {
	const h = Math.floor(s / 3600);
	const m = Math.round((s % 3600) / 60);
	return h ? `${h}j ${m}m` : `${m}m`;
};
const fmtDate = (s) => (s ? s.slice(0, 16) : '-');

// tone -> token semantic state (success / danger / warning / info / neutral / purple)
const TONES = {
	primary: {
		bg: 'var(--info-bg)',
		fg: 'var(--info-text)',
		border: 'var(--info-border-color)',
		solid: 'var(--primary)',
	},
	success: {
		bg: 'var(--success-bg)',
		fg: 'var(--success-text)',
		border: 'var(--success-border-color)',
		solid: 'var(--success-text)',
	},
	danger: {
		bg: 'var(--danger-bg)',
		fg: 'var(--danger-text)',
		border: 'var(--danger-border-color)',
		solid: 'var(--error-text)',
	},
	warning: {
		bg: 'var(--warning-bg)',
		fg: 'var(--warning-heading)',
		border: 'var(--warning-border)',
		solid: 'var(--warning-text)',
	},
	neutral: {
		bg: 'var(--neutral-bg)',
		fg: 'var(--neutral-text)',
		border: 'var(--neutral-border)',
		solid: 'var(--color-secondary)',
	},
	purple: {
		bg: 'var(--purple-bg)',
		fg: 'var(--purple-text)',
		border: 'var(--purple-border-color)',
		solid: 'var(--purple-text)',
	},
};

const PHASE_TONE = { Forethought: 'primary', Performance: 'purple', 'Self-Reflection': 'neutral' };
const STATUS_TONE = { active: 'primary', completed: 'success', dropped: 'danger' };
const STATUS_LABEL = { active: 'Aktif', completed: 'Selesai', dropped: 'Berhenti' };
const LEVEL_TONE = { belum_siap: 'danger', cukup_siap: 'warning', siap: 'success' };
const LEVEL_LABEL = { belum_siap: 'Belum Siap', cukup_siap: 'Cukup Siap', siap: 'Siap' };
const DIFF_TONE = { beginner: 'success', intermediate: 'warning', advanced: 'danger' };

const cardStyle = {
	background: 'var(--card)',
	border: 'var(--border-w-xs) solid var(--neutral-border)',
	borderRadius: 'var(--radius-lg)',
};
const inputStyle = {
	fontSize: 'var(--font-sm)',
	color: 'var(--text)',
	borderColor: 'var(--neutral-border)',
	borderRadius: 'var(--radius-md)',
};
const tableStyle = {
	'--bs-table-color': 'var(--text)',
	'--bs-table-border-color': 'var(--neutral-border)',
	'--bs-table-hover-bg': 'var(--neutral-bg)',
	'--bs-table-hover-color': 'var(--text)',
};

const Sub = ({ children, className = '' }) => (
	<span className={`fs-5 ${className}`} style={{ color: 'var(--text-muted)' }}>
		{children}
	</span>
);

const Th = ({ children, className = '', style }) => (
	<th
		className={`fs-5 fw-semibold text-nowrap ${className}`}
		style={{ color: 'var(--neutral-text)', ...style }}
	>
		{children}
	</th>
);

const Pill = ({ tone = 'neutral', dot = true, children, className = '' }) => {
	const t = TONES[tone];
	return (
		<span
			className={`d-inline-flex align-items-center gap-1 fs-5 fw-semibold text-nowrap ${className}`}
			style={{
				background: t.bg,
				color: t.fg,
				border: `var(--border-w-xs) solid ${t.border}`,
				borderRadius: 'var(--radius-full)',
				padding: '2px 10px',
			}}
		>
			{dot && (
				<span
					style={{
						width: 6,
						height: 6,
						borderRadius: '50%',
						background: 'currentColor',
						flexShrink: 0,
					}}
				/>
			)}
			{children}
		</span>
	);
};

const Bar = ({ value, tone = 'primary', height = 8 }) => (
	<div
		style={{
			flex: 1,
			height,
			background: 'var(--neutral-bg)',
			borderRadius: 'var(--radius-full)',
			overflow: 'hidden',
		}}
	>
		<div
			style={{
				width: `${Math.min(100, Math.max(0, value))}%`,
				height: '100%',
				background: TONES[tone].solid,
				borderRadius: 'var(--radius-full)',
			}}
		/>
	</div>
);

const Section = ({ title, subtitle, children }) => (
	<Card style={cardStyle} className="h-100">
		<Card.Body>
			<h3 className="fw-bold fs-3 mb-1" style={{ color: 'var(--text)' }}>
				{title}
			</h3>
			{subtitle && (
				<p className="fs-4 mb-3" style={{ color: 'var(--neutral-text)' }}>
					{subtitle}
				</p>
			)}
			{children}
		</Card.Body>
	</Card>
);

const StatCard = ({ icon: Icon, label, value, sub }) => (
	<Card style={cardStyle} className="h-100">
		<Card.Body className="d-flex align-items-start gap-3">
			<div
				className="d-flex align-items-center justify-content-center flex-shrink-0"
				style={{
					width: 40,
					height: 40,
					background: 'var(--primary-light)',
					color: 'var(--primary)',
					borderRadius: 'var(--radius-md)',
				}}
			>
				<Icon size={20} />
			</div>
			<div>
				<div className="fs-4" style={{ color: 'var(--neutral-text)' }}>
					{label}
				</div>
				<div className="fw-bold fs-1" style={{ color: 'var(--text)' }}>
					{value}
				</div>
				{sub && <Sub>{sub}</Sub>}
			</div>
		</Card.Body>
	</Card>
);

const BarRow = ({ label, hint, value, max = 100, display, tone = 'primary' }) => (
	<div className="mb-3">
		<div className="d-flex justify-content-between align-items-baseline mb-1">
			<span className="fs-4 fw-semibold" style={{ color: 'var(--text)' }}>
				{label}
				{hint && <Sub className="ms-2">{hint}</Sub>}
			</span>
			<span className="fs-4 fw-semibold" style={{ color: 'var(--text)' }}>
				{display ?? `${Math.round(value)}%`}
			</span>
		</div>
		<div className="d-flex">
			<Bar value={(value / max) * 100} tone={tone} />
		</div>
	</div>
);

// segmented control untuk sub-section
const SegTabs = ({ value, onChange, items }) => (
	<div
		className="d-inline-flex gap-1 align-self-start"
		style={{ background: 'var(--neutral-bg)', padding: 4, borderRadius: 'var(--radius-md)' }}
		role="tablist"
	>
		{items.map(([key, label]) => {
			const active = value === key;
			return (
				<button
					key={key}
					type="button"
					role="tab"
					aria-selected={active}
					onClick={() => onChange(key)}
					className="fs-4 fw-semibold"
					style={{
						padding: '6px 16px',
						borderRadius: 'var(--radius-sm)',
						border: `var(--border-w-xs) solid ${active ? 'var(--primary-border)' : 'transparent'}`,
						background: active ? 'var(--card)' : 'transparent',
						color: active ? 'var(--primary)' : 'var(--text-muted)',
					}}
				>
					{label}
				</button>
			);
		})}
	</div>
);

/* ==========================================================================
 * MAIN
 * props:
 *   id     : learningId
 *   routes : objek ROUTES dari ManageLearningPathPage
 * ========================================================================== */

const AnalyticTab = ({ id, routes }) => {
	const [section, setSection] = useState('overview');

	// siswa
	const [studentSearch, setStudentSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [selectedStudent, setSelectedStudent] = useState(null);

	// logs
	const [logTab, setLogTab] = useState('srl');
	const [logSearch, setLogSearch] = useState('');
	const [selectedTx, setSelectedTx] = useState(null);
	const [copied, setCopied] = useState(false);

	const S = STATS;
	const userOf = (uid) => DATA.users[uid];
	const moduleOf = (mid) => MODULES.find((m) => m.id === mid);

	const sq = studentSearch.toLowerCase();
	const studentRows = S.students.filter(
		(s) =>
			(statusFilter === 'all' || s.status === statusFilter) &&
			`${s.user.name} ${s.user.email}`.toLowerCase().includes(sq),
	);

	const lq = logSearch.toLowerCase();
	const srlRows = SRL_LOGS.filter((l) =>
		`${userOf(l.user_id).name} ${moduleOf(l.module_id).title}`.toLowerCase().includes(lq),
	);
	const txRows = BLOCKCHAIN_LOGS.filter((t) =>
		`${userOf(t.user_id).name} ${t.cert} ${t.txHash}`.toLowerCase().includes(lq),
	);

	const handleCopy = () => {
		navigator.clipboard.writeText(JSON.stringify(selectedTx.payload, null, 2));
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const recTitle = (r) =>
		r.content_type === 'module'
			? moduleOf(r.content_id)?.title
			: LEARNING_PATH_TITLES[r.content_id] || `Learning Path #${r.content_id}`;

	const passTone = (p) => (p >= 75 ? 'success' : p >= 50 ? 'warning' : 'danger');

	/* ------------------------------ OVERVIEW ------------------------------ */
	const overview = (
		<div className="d-flex flex-column gap-3">
			<Row xs={1} sm={2} xl={3} className="g-3">
				<Col>
					<StatCard
						icon={Users}
						label="Total Peserta"
						value={S.total}
						sub={`${S.active} aktif · ${S.completed} selesai · ${S.dropped} berhenti`}
					/>
				</Col>
				<Col>
					<StatCard
						icon={GraduationCap}
						label="Completion Rate"
						value={`${Math.round(S.completionRate)}%`}
						sub={`${S.completed} dari ${S.total} peserta menyelesaikan`}
					/>
				</Col>
				<Col>
					<StatCard
						icon={Target}
						label="Rata-rata Skor Quiz"
						value={S.avgScore.toFixed(1)}
						sub="Passing score 70"
					/>
				</Col>
				<Col>
					<StatCard
						icon={Clock}
						label="Rata-rata Waktu Belajar"
						value={fmtDur(S.avgDuration)}
						sub="Per peserta, seluruh modul"
					/>
				</Col>
				<Col>
					<StatCard
						icon={Gauge}
						label="Rata-rata Readiness Score"
						value={S.avgReadiness.toFixed(2)}
						sub="Prediksi Random Forest (rf-v1.2.0)"
					/>
				</Col>
				<Col>
					<StatCard
						icon={Award}
						label="Sertifikat Terbit"
						value={BLOCKCHAIN_LOGS.filter((t) => t.api === '200 OK').length}
						sub={`${BLOCKCHAIN_LOGS.filter((t) => t.api !== '200 OK').length} transaksi gagal / tertunda`}
					/>
				</Col>
			</Row>

			<Section
				title="Performa per Modul"
				subtitle="Berapa peserta yang sampai ke tiap modul, dan seberapa banyak yang lulus quiz-nya."
			>
				<Table
					responsive
					hover
					size="sm"
					className="align-middle fs-4 mb-0"
					style={tableStyle}
				>
					<thead>
						<tr>
							<Th>Modul</Th>
							<Th style={{ minWidth: 160 }}>Peserta yang sampai</Th>
							<Th className="text-end">Pass Rate</Th>
							<Th className="text-end">Rata-rata Skor</Th>
							<Th className="text-end">Percobaan</Th>
							<Th className="text-end">Durasi</Th>
						</tr>
					</thead>
					<tbody>
						{S.moduleRows.map((r) => (
							<tr key={r.module.id}>
								<td className='py-3'>
									<div className="fw-semibold">
										{r.module.order_index}. {r.module.title}
									</div>
									<Pill tone={DIFF_TONE[r.module.difficulty_level]} dot={false}>
										{r.module.difficulty_level}
									</Pill>
								</td>
								<td>
									<div className="d-flex align-items-center gap-2">
										<Bar value={r.reachRate} height={6} />
										<Sub className="text-nowrap">
											{r.learners}/{S.total}
										</Sub>
									</div>
								</td>
								<td className="text-end">
									<Pill tone={passTone(r.passRate)} dot={false}>
										{Math.round(r.passRate)}%
									</Pill>
								</td>
								<td className="text-end">{r.avgScore.toFixed(1)}</td>
								<td className="text-end">{r.avgAttempts.toFixed(1)}x</td>
								<td className="text-end text-nowrap">{fmtDur(r.avgDuration)}</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Section>

			<Row className="g-3">
				<Col lg={6}>
					<Section
						title="Distribusi Kesiapan Peserta"
						subtitle="Hasil prediksi readiness terbaru tiap peserta."
					>
						<div
							className="d-flex overflow-hidden mb-3"
							style={{
								height: 14,
								borderRadius: 'var(--radius-full)',
								background: 'var(--neutral-bg)',
							}}
						>
							{Object.entries(S.readiness).map(([lvl, n]) => (
								<div
									key={lvl}
									title={`${LEVEL_LABEL[lvl]}: ${n}`}
									style={{
										width: `${(n / Math.max(1, S.total)) * 100}%`,
										background: TONES[LEVEL_TONE[lvl]].solid,
									}}
								/>
							))}
						</div>
						{Object.entries(S.readiness).map(([lvl, n]) => (
							<div
								key={lvl}
								className="d-flex justify-content-between align-items-center py-1"
							>
								<Pill tone={LEVEL_TONE[lvl]}>{LEVEL_LABEL[lvl]}</Pill>
								<span className="fs-4 fw-semibold">
									{n} peserta
									<Sub className="ms-2">{Math.round((n / S.total) * 100)}%</Sub>
								</span>
							</div>
						))}
					</Section>
				</Col>
			</Row>

			<Row className="g-3">
				<Col lg={6}>
					<Section
						title="Skor Berdasarkan Level Bloom"
						subtitle="Rata-rata skor quiz dikelompokkan per level taksonomi Bloom."
					>
						{S.bloomRows.map((b) => (
							<BarRow
								key={b.level}
								label={b.level}
								hint={`${b.n} percobaan`}
								value={b.avg}
								display={b.avg.toFixed(1)}
								tone={b.avg >= 70 ? 'success' : 'warning'}
							/>
						))}
					</Section>
				</Col>
				<Col lg={6}>
					<Section
						title="Peserta Perlu Perhatian"
						subtitle="Berhenti di tengah jalan atau readiness masih rendah."
					>
						{S.attention.length === 0 ? (
							<p className="fs-4 mb-0" style={{ color: 'var(--text-muted)' }}>
								Semua peserta berjalan sesuai rencana.
							</p>
						) : (
							S.attention.map(({ s, reason }, i) => (
								<div
									key={s.id}
									className="d-flex align-items-center justify-content-between py-2"
									style={{
										borderBottom:
											i === S.attention.length - 1
												? 'none'
												: 'var(--border-w-xs) solid var(--neutral-border)',
									}}
								>
									<div className="d-flex align-items-center gap-2">
										<AlertTriangle size={16} className="text-warning" />
										<div>
											<div className="fs-4 fw-semibold">{s.user.name}</div>
											<Sub>{reason}</Sub>
										</div>
									</div>
									<Button
										size="sm"
										variant="outline-primary"
										onClick={() => setSelectedStudent(s)}
									>
										Detail
									</Button>
								</div>
							))
						)}
					</Section>
				</Col>
			</Row>

			<Section
				title="Rekomendasi Hybrid (CBF + CF)"
				subtitle="Konten yang paling sering direkomendasikan ke peserta path ini."
			>
				<Table
					responsive
					hover
					size="sm"
					className="align-middle fs-4 mb-0"
					style={tableStyle}
				>
					<thead>
						<tr>
							<Th>Rank</Th>
							<Th>Konten</Th>
							<Th>Tipe</Th>
							<Th className="text-end">CBF</Th>
							<Th className="text-end">CF</Th>
							<Th className="text-end">Skor Akhir</Th>
							<Th className="text-end">Peserta</Th>
						</tr>
					</thead>
					<tbody>
						{RECOMMENDATIONS.map((r) => (
							<tr key={`${r.content_type}-${r.content_id}`}>
								<td className="fw-semibold">#{r.rank_position}</td>
								<td>{recTitle(r)}</td>
								<td>
									<Pill tone="neutral" dot={false}>
										{r.content_type === 'module' ? 'Modul' : 'Learning Path'}
									</Pill>
								</td>
								<td className="text-end font-monospace">
									{r.cbf_score.toFixed(4)}
								</td>
								<td className="text-end font-monospace">{r.cf_score.toFixed(4)}</td>
								<td className="text-end font-monospace fw-semibold">
									{r.score.toFixed(4)}
								</td>
								<td className="text-end">{r.users}</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Section>
		</div>
	);

	/* ------------------------------ STUDENTS ------------------------------ */
	const students = (
		<Section
			title="Daftar Peserta"
			subtitle="Progres, skor, dan kesiapan tiap peserta di learning path ini."
		>
			<Row className="g-2 mb-3">
				<Col md={8}>
					<Form.Control
						style={inputStyle}
						placeholder="Cari berdasarkan nama atau email peserta..."
						value={studentSearch}
						onChange={(e) => setStudentSearch(e.target.value)}
					/>
				</Col>
				<Col md={4}>
					<Form.Select
						style={inputStyle}
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
					>
						<option value="all">Semua status</option>
						<option value="active">Aktif</option>
						<option value="completed">Selesai</option>
						<option value="dropped">Berhenti</option>
					</Form.Select>
				</Col>
			</Row>
			<Table responsive hover size="sm" className="align-middle fs-4 mb-0" style={tableStyle}>
				<thead>
					<tr>
						<Th>Siswa</Th>
						<Th>Status</Th>
						<Th style={{ minWidth: 150 }}>Progres</Th>
						<Th className="text-end">Rata-rata Skor</Th>
						<Th>Readiness</Th>
						<Th className="text-end">Waktu Belajar</Th>
						<Th className="text-end">Terakhir Aktif</Th>
						<Th />
					</tr>
				</thead>
				<tbody>
					{studentRows.map((s) => (
						<tr key={s.id}>
							<td>
								<div className="fw-semibold">{s.user.name}</div>
								<Sub>{s.user.email}</Sub>
							</td>
							<td>
								<Pill tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Pill>
							</td>
							<td>
								<div className="d-flex align-items-center gap-2">
									<Bar
										value={s.progress}
										height={6}
										tone={s.status === 'dropped' ? 'danger' : 'primary'}
									/>
									<Sub>{s.progress}%</Sub>
								</div>
							</td>
							<td className="text-end">
								{s.avgScore === null ? '-' : s.avgScore.toFixed(1)}
							</td>
							<td>
								{s.pred ? (
									<span className="d-inline-flex align-items-center gap-2">
										<Pill tone={LEVEL_TONE[s.pred.readiness_level]}>
											{LEVEL_LABEL[s.pred.readiness_level]}
										</Pill>
										<Sub>{s.pred.readiness_score.toFixed(2)}</Sub>
									</span>
								) : (
									'-'
								)}
							</td>
							<td className="text-end text-nowrap">{fmtDur(s.totalDuration)}</td>
							<td className="text-end text-nowrap">
								<Sub>{fmtDate(s.last_accessed_at)}</Sub>
							</td>
							<td className="text-end">
								<Button
									size="sm"
									variant="outline-primary"
									onClick={() => setSelectedStudent(s)}
								>
									<Eye size={14} className="me-1" /> Detail
								</Button>
							</td>
						</tr>
					))}
					{studentRows.length === 0 && (
						<tr>
							<td colSpan={8} className="text-center py-4">
								<Sub>Tidak ada peserta yang cocok dengan filter ini.</Sub>
							</td>
						</tr>
					)}
				</tbody>
			</Table>
		</Section>
	);

	/* -------------------------------- LOGS -------------------------------- */
	const logs = (
		<Section
			title="System & Activity Logs"
			subtitle="Pelacakan aktivitas metakognitif SRL siswa dan telemetri transaksi smart contract blockchain."
		>
			<Nav variant="tabs" activeKey={logTab} onSelect={setLogTab} className="mb-3">
				<Nav.Item>
					<Nav.Link eventKey="srl">Student SRL Logs ({srlRows.length})</Nav.Link>
				</Nav.Item>
				<Nav.Item>
					<Nav.Link eventKey="blockchain">Smart Contract Logs ({txRows.length})</Nav.Link>
				</Nav.Item>
			</Nav>

			<Form.Control
				className="mb-3"
				style={inputStyle}
				placeholder="Cari berdasarkan nama peserta, modul, atau tx hash..."
				value={logSearch}
				onChange={(e) => setLogSearch(e.target.value)}
			/>

			{logTab === 'srl' ? (
				<Table responsive hover size="sm" className="align-middle fs-4" style={tableStyle}>
					<thead>
						<tr>
							<Th>Siswa</Th>
							<Th>Modul</Th>
							<Th>Fase SRL</Th>
							<Th>Detail Aktivitas</Th>
							<Th>Status</Th>
							<Th className="text-end">Waktu</Th>
						</tr>
					</thead>
					<tbody>
						{srlRows.map((l) => (
							<tr key={l.id}>
								<td>
									<div className="fw-semibold">{userOf(l.user_id).name}</div>
									<Sub>{userOf(l.user_id).email}</Sub>
								</td>
								<td>{moduleOf(l.module_id).title}</td>
								<td>
									<Pill tone={PHASE_TONE[l.phase]}>{l.phase}</Pill>
								</td>
								<td>{l.action}</td>
								<td>
									<Pill
										tone={
											l.status === 'Completed' || l.status.includes('Passed')
												? 'success'
												: 'danger'
										}
									>
										{l.status}
									</Pill>
								</td>
								<td className="text-end text-nowrap">
									<Sub>{l.time}</Sub>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			) : (
				<Table responsive hover size="sm" className="align-middle fs-4" style={tableStyle}>
					<thead>
						<tr>
							<Th>Penerima & Sertifikat</Th>
							<Th>Transaction Hash</Th>
							<Th>Block #</Th>
							<Th>API Status</Th>
							<Th>Waktu</Th>
							<Th className="text-end">Payload</Th>
						</tr>
					</thead>
					<tbody>
						{txRows.map((t) => (
							<tr key={t.id}>
								<td>
									<div className="fw-semibold">{userOf(t.user_id).name}</div>
									<Sub>{t.cert}</Sub>
								</td>
								<td
									className="font-monospace text-primary text-truncate"
									style={{ maxWidth: 200 }}
								>
									{t.txHash}
								</td>
								<td className="font-monospace">#{t.block}</td>
								<td>
									<Pill tone={t.api === '200 OK' ? 'success' : 'warning'}>
										{t.api}
									</Pill>
								</td>
								<td className="text-nowrap">
									<Sub>{t.time}</Sub>
								</td>
								<td className="text-end">
									<Button
										size="sm"
										variant="outline-primary"
										onClick={() => setSelectedTx(t)}
									>
										<FileCode size={14} className="me-1" /> Lihat JSON
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			)}
		</Section>
	);

	return (
		<div className="d-flex flex-column gap-3">
			<SegTabs
				value={section}
				onChange={setSection}
				items={[
					['overview', 'Ringkasan'],
					['students', `Peserta (${S.total})`],
					['logs', 'Logs'],
				]}
			/>

			{section === 'overview' && overview}
			{section === 'students' && students}
			{section === 'logs' && logs}

			{/* Student detail modal */}
			<Modal
				show={!!selectedStudent}
				onHide={() => setSelectedStudent(null)}
				size="lg"
				centered
				scrollable
			>
				{selectedStudent && (
					<>
						<Modal.Header closeButton>
							<Modal.Title className="fs-3 fw-bold">
								{selectedStudent.user.name}
								<Sub className="ms-2">{selectedStudent.user.email}</Sub>
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<div className="d-flex flex-wrap align-items-center gap-2 mb-3">
								<Pill tone={STATUS_TONE[selectedStudent.status]}>
									{STATUS_LABEL[selectedStudent.status]}
								</Pill>
								{selectedStudent.pred && (
									<Pill tone={LEVEL_TONE[selectedStudent.pred.readiness_level]}>
										{LEVEL_LABEL[selectedStudent.pred.readiness_level]} ·{' '}
										{selectedStudent.pred.readiness_score.toFixed(2)}
									</Pill>
								)}
								<Sub>
									Enrolled {fmtDate(selectedStudent.enrolled_at)} · Terakhir aktif{' '}
									{fmtDate(selectedStudent.last_accessed_at)}
								</Sub>
							</div>

							<Table
								responsive
								size="sm"
								className="align-middle fs-4"
								style={tableStyle}
							>
								<thead>
									<tr>
										<Th>Modul</Th>
										<Th className="text-end">Percobaan</Th>
										<Th className="text-end">Skor Terbaik</Th>
										<Th className="text-end">Durasi</Th>
										<Th className="text-end">Status</Th>
									</tr>
								</thead>
								<tbody>
									{selectedStudent.modules.map((m) => (
										<tr key={m.module.id}>
											<td>
												{m.module.order_index}. {m.module.title}
											</td>
											<td className="text-end">{m.attempts || '-'}</td>
											<td className="text-end">
												{m.best === null ? '-' : m.best.toFixed(1)}
											</td>
											<td className="text-end">
												{m.duration ? fmtDur(m.duration) : '-'}
											</td>
											<td className="text-end">
												{m.passed ? (
													<Pill tone="success">Lulus</Pill>
												) : m.attempts ? (
													<Pill tone="danger">Remedial</Pill>
												) : (
													<Pill tone="neutral" dot={false}>
														Belum mulai
													</Pill>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</Table>

							<h4 className="fw-bold fs-4 mt-3 mb-2">Catatan SRL</h4>
							{selectedStudent.forethought ? (
								<div className="fs-4 mb-3">
									<Pill tone="primary">Forethought</Pill>
									<div className="mt-2">
										<strong>Target:</strong> {selectedStudent.forethought.goal}
									</div>
									<div>
										<strong>Rencana:</strong> {selectedStudent.forethought.plan}
									</div>
									<div>
										<strong>Motivasi:</strong>{' '}
										{selectedStudent.forethought.motivation}
									</div>
								</div>
							) : (
								<p className="fs-4 mb-3" style={{ color: 'var(--text-muted)' }}>
									Belum mengisi fase Forethought.
								</p>
							)}
							{selectedStudent.reflection ? (
								<div className="fs-4">
									<Pill tone="neutral">
										Self-Reflection ·{' '}
										{selectedStudent.reflection.reflection_type}
									</Pill>
									<div className="mt-2">{selectedStudent.reflection.content}</div>
								</div>
							) : (
								<p className="fs-4 mb-0" style={{ color: 'var(--text-muted)' }}>
									Belum menulis refleksi.
								</p>
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => setSelectedStudent(null)}
							>
								Tutup
							</Button>
						</Modal.Footer>
					</>
				)}
			</Modal>

			{/* JSON Modal */}
			<Modal show={!!selectedTx} onHide={() => setSelectedTx(null)} size="lg" centered>
				<Modal.Header closeButton>
					<Modal.Title className="fs-3 fw-bold">Smart Contract Payload</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Sub className="d-block mb-2 text-break">Tx: {selectedTx?.txHash}</Sub>
					<pre
						className="p-3 mb-0"
						style={{
							maxHeight: 320,
							overflow: 'auto',
							fontSize: 'var(--font-xs)',
							background: 'var(--bahama-blue-950)',
							color: 'var(--bahama-blue-300)',
							borderRadius: 'var(--radius-md)',
						}}
					>
						{selectedTx && JSON.stringify(selectedTx.payload, null, 2)}
					</pre>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" size="sm" onClick={handleCopy}>
						{copied ? (
							<Check size={14} className="me-1" />
						) : (
							<Copy size={14} className="me-1" />
						)}
						{copied ? 'Tersalin' : 'Salin'}
					</Button>
					<Button variant="secondary" size="sm" onClick={() => setSelectedTx(null)}>
						Tutup
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default AnalyticTab;
