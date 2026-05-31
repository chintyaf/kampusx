const colors = {
	green: 'var(--success-text)',
	greenLight: 'var(--success-bg)',
	accent: 'var(--color-primary)',
	amber: 'var(--warning-text)',
	amberLight: 'var(--warning-bg)',
	red: 'var(--danger-text)',
	redLight: 'var(--danger-bg)',
	purple: 'var(--purple-text)',
	purpleLight: 'var(--purple-bg)',
	ongoing: 'var(--bahama-blue-600)',
	ongoingBg: 'var(--bahama-blue-50)',
	draft: 'var(--warning-text)',
	draftBg: 'var(--warning-bg)',
	completed: 'var(--color-text)',
	completedBg: 'var(--color-bg)',
};

const statusConfig = {
	draft: { bg: colors.draftBg, text: colors.draft, label: 'Draft' },
	published: { bg: colors.greenLight, text: colors.green, label: 'Published' },
	ongoing: { bg: colors.ongoingBg, text: colors.ongoing, label: 'Ongoing' },
	completed: { bg: colors.completedBg, text: colors.completed, label: 'Selesai' },
};

export const StatusBadge = ({ status }) => {
	const label = statusConfig[status]?.label || 'Draft';
	return (
		<span className={`org-status-badge py-1 px-2 fw-semibold text-nowrap status-${status}`}>
			{label.toUpperCase()}
		</span>
	);
};

export default StatusBadge;
