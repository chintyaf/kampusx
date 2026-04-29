export function StatusBadge({ status }) {
	return <span className={`badge badge-${status}`}>{status}</span>;
}

export function RolePill({ role }) {
	return <span className={`role-pill role-${role}`}>{role}</span>;
}
