import React, { useState } from 'react';
import { Menu, ShieldCheck, Building2, CalendarDays, LogOut } from 'lucide-react';

/* ─── Context chip config ─────────────────────────────── */
const CONTEXT_CONFIG = {
	admin: {
		label: 'Admin',
		icon: ShieldCheck,
		color: '#92400e',
		bg: '#fef3c7',
		border: '#fde68a',
		dot: '#d97706',
	},
	organizer: {
		label: 'Organizer',
		icon: Building2,
		color: 'var(--bahama-blue-700, #00699e)',
		bg: 'var(--bahama-blue-50, #f0f9ff)',
		border: 'var(--bahama-blue-200, #b9e7fe)',
		dot: 'var(--bahama-blue-500, #0aabed)',
	},
	event: {
		label: 'Event Dashboard',
		icon: CalendarDays,
		color: '#5b21b6',
		bg: '#f5f3ff',
		border: '#ddd6fe',
		dot: '#7c3aed',
	},
};

const ContextChip = ({ configKey }) => {
	const cfg = CONTEXT_CONFIG[configKey];
	if (!cfg) return null;
	const Icon = cfg.icon;
	return (
		<div
			className="ctx-chip"
			style={{
				'--chip-bg': cfg.bg,
				'--chip-border': cfg.border,
				'--chip-color': cfg.color,
				'--chip-dot': cfg.dot,
			}}>
			<span className="ctx-chip-dot" />
			<span className="ctx-chip-icon-wrap">
				<Icon size={11} strokeWidth={2.5} color={cfg.color} />
			</span>
			{cfg.label}
		</div>
	);
};

export default ContextChip;