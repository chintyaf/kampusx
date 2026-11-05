// ==========================================
// TOKENS (CSS variable proyek, dengan fallback)
// ==========================================
export const T = {
	font: 'var(--font, system-ui, -apple-system, "Segoe UI", sans-serif)',
	bg: 'var(--color-bg, #f8f9fa)',
	card: 'var(--card, #ffffff)',
	text: 'var(--color-text, #1e293b)',
	muted: 'var(--neutral-text, #64748b)',
	neutralBg: 'var(--neutral-bg, #f1f5f9)',
	border: 'var(--neutral-border, #e2e8f0)',
	field: '#f8fafc',
	primary: 'var(--color-primary, #006699)',
	primarySoft: 'var(--bahama-blue-50, #f0f8fc)',
	primaryTint: 'var(--bahama-blue-100, #d9edf7)',
	white: 'var(--color-white, #ffffff)',
	success: '#16a34a',
	successBg: '#dcfce7',
	successText: '#166534',
	warn: '#d97706',
	warnBg: '#fef3c7',
	warnText: '#92400e',
	danger: '#dc2626',
	dangerBg: '#fef2f2',
	fxs: 'var(--font-xs, 12px)',
	fsm: 'var(--font-sm, 14px)',
	fmd: 'var(--font-md, 16px)',
	rSm: 'var(--radius-sm, 6px)',
	rMd: 'var(--radius-md, 10px)',
	rLg: 'var(--radius-lg, 14px)',
	rFull: 'var(--radius-full, 999px)',
};

export const LETTERS = ['A', 'B', 'C', 'D', 'E'];
export const MAX_OPTIONS = LETTERS.length;
export const SKILL_SUGGESTIONS = [
	'Python',
	'Variables',
	'Data Types',
	'Control Flow',
	'Functions',
	'OOP',
];

export const TAB_ALIASES = {
	materi: 'materi',
	kuis: 'kuis',
	quiz: 'kuis',
	pengaturan: 'pengaturan',
};

// UI Button & Input Styles
export const outlineBtn = {
	padding: '8px 14px',
	backgroundColor: T.card,
	border: `1px solid ${T.border}`,
	borderRadius: T.rMd,
	color: T.text,
	fontSize: T.fsm,
	fontWeight: 600,
};

export const primaryBtn = {
	padding: '8px 16px',
	backgroundColor: T.primary,
	border: 'none',
	borderRadius: T.rMd,
	color: T.white,
	fontSize: T.fsm,
	fontWeight: 600,
};

export const ghostIconBtn = {
	background: 'none',
	border: 'none',
	padding: 6,
	borderRadius: T.rSm,
	color: T.muted,
};

export const ghostHover = { backgroundColor: T.neutralBg, color: T.text };

export const inputBase = {
	width: '100%',
	boxSizing: 'border-box',
	background: T.field,
	border: `1px solid ${T.border}`,
	borderRadius: T.rMd,
	fontSize: T.fsm,
	padding: '10px 14px',
	color: T.text,
	fontFamily: 'inherit',
	outline: 'none',
	transition: 'border-color .15s, box-shadow .15s',
};

export const inputFocus = { borderColor: T.primary, boxShadow: `0 0 0 3px ${T.primaryTint}` };

// Struktur module contoh (untuk navigasi antar lesson)
export const MODULES_DB = {
	1: {
		number: 1,
		name: 'Fundamentals of Python',
		items: [
			{
				id: 'l1',
				type: 'lesson',
				title: 'Introduction to Variables',
				minutes: 10,
				status: 'published',
			},
			{
				id: 'l2',
				type: 'lesson',
				title: 'Data Structures Overview',
				minutes: 8,
				status: 'draft',
			},
			{ id: 'q1', type: 'quiz', title: 'Reflection Quiz: Python Basics', status: 'draft' },
		],
	},
	2: {
		number: 2,
		name: 'Supervised Learning Techniques',
		items: [
			{ id: 'l3', type: 'lesson', title: 'Regression Basics', minutes: 6, status: 'draft' },
			{
				id: 'l4',
				type: 'lesson',
				title: 'Classification Overview',
				minutes: 7,
				status: 'draft',
			},
			{ id: 'l5', type: 'lesson', title: 'Decision Trees', minutes: 9, status: 'draft' },
			{
				id: 'l6',
				type: 'lesson',
				title: 'Model Evaluation Metrics',
				minutes: 8,
				status: 'draft',
			},
			{
				id: 'q2',
				type: 'quiz',
				title: 'Reflection Quiz: Supervised Learning',
				status: 'draft',
			},
		],
	},
};

export const LESSONS_DB = {
	l1: {
		title: 'Introduction to Variables',
		summary:
			'Materi pengenalan dasar konsep variabel, tipe data dasar, dan memori pada Python.',
		body: [
			'### Pengenalan Variabel',
			'',
			'Variabel adalah lokasi penyimpanan **bernama** di memori komputer yang digunakan untuk menyimpan nilai data. Di Python, variabel dibuat saat pertama kali diberi nilai, tanpa perlu deklarasi tipe.',
			'',
			'**Aturan penamaan:**',
			'',
			'- Diawali huruf atau garis bawah (_)',
			'- Tidak boleh mengandung spasi atau tanda hubung',
			'- Bersifat *case-sensitive*',
			'',
			'```python',
			'nama = "Chintya"',
			'umur = 20',
			'```',
			'',
			'> Gunakan nama variabel yang deskriptif agar kode mudah dibaca.',
		].join('\n'),
		attachments: [{ id: 'a1', name: 'Cheatsheet_Python_Variables.pdf', size: '1.2 MB' }],
		format: 'article',
		duration: 10,
		xp: 25,
		prerequisite: false,
		tags: ['Python', 'Variables', 'Data Types'],
		status: 'published',
		quiz: {
			passingScore: 80,
			maxAttempts: 3,
			graded: true,
			questions: [
				{
					id: 'qq1',
					text: 'Manakah penulisan nama variabel yang VALID di Python?',
					options: [
						{ id: 'o1', text: '123_variable' },
						{ id: 'o2', text: '_user_name' },
						{ id: 'o3', text: 'user-name' },
						{ id: 'o4', text: 'class' },
					],
					correct: 'o2',
					explanation:
						'Nama variabel di Python dapat diawali dengan garis bawah (_) atau huruf.',
				},
			],
		},
	},
};

export default {
	T,
	LETTERS,
	MAX_OPTIONS,
	SKILL_SUGGESTIONS,
	TAB_ALIASES,
	MODULES_DB,
	LESSONS_DB,
};
