export const T = {
	card: 'var(--card, #fff)',
	text: 'var(--color-text, #0f172a)',
	muted: 'var(--neutral-text, #64748b)',
	border: 'var(--neutral-border, #dae0eb)',
	primary: 'var(--color-primary, #00699e)',
	tint: 'var(--primary-light, #dff3ff)',
	purple: 'var(--purple-text, #7c3aed)',
	fsm: 'var(--font-sm, 14px)',
	rMd: 'var(--radius-md, 8px)',
	rLg: 'var(--radius-lg, 16px)',
};

export const cardStyle = {
	background: T.card,
	border: `1px solid ${T.border}`,
	borderRadius: T.rLg,
};

export const fieldStyle = { fontSize: T.fsm, borderRadius: T.rMd };

export const NETWORKS = {
	polygon: { label: 'Polygon Mainnet (ERC-1155)', option: 'Blockchain Token (Polygon ERC-1155)' },
	internal: { label: 'Internal Signed Credential', option: 'KampusX Verified Digital Signature' },
};

export const CATEGORIES = [
	'Software Engineering',
	'Artificial Intelligence',
	'Data Science',
	'Metacognitive Skills',
];

export const ICONS = ['🏆', '🎯', '⚡', '🎖️', '🧠', '🛡️'];

export const INITIAL_BADGES = [
	{ id: 1, title: 'REST API Architect', category: 'Software Engineering', minScore: 80, issued: 342, icon: '🏆', network: 'polygon' },
	{ id: 2, title: 'SRL Self-Regulated Master', category: 'Metacognitive Skills', minScore: 75, issued: 512, icon: '🎯', network: 'internal' },
	{ id: 3, title: 'Machine Learning Practitioner', category: 'Artificial Intelligence', minScore: 85, issued: 189, icon: '⚡', network: 'polygon' },
];
