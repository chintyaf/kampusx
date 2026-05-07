import React from 'react';

const StatusPill = ({ status }) => {
	const map = {
		active: ['AKTIF', '#10B981'],
		used: ['SELESAI', '#64748b'],
		cancelled: ['BATAL', '#ef4444'],
	};
	const [label, bg] = map[status] ?? [status.toUpperCase(), '#64748b'];
	return (
		<span
			style={{
				background: bg,
				color: '#fff',
				fontSize: 10,
				fontWeight: 700,
				borderRadius: 99,
				padding: '3px 8px',
				letterSpacing: '0.4px',
			}}>
			{label}
		</span>
	);
};

export default StatusPill;
