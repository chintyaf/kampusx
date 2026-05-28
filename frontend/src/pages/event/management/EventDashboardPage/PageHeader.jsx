import React from 'react';
import { Row, Col } from 'react-bootstrap';
import {
	PenLine,
	Globe,
	Zap,
	CheckCircle2,
	XCircle,
	ExternalLink,
} from 'lucide-react';

const STATUS_CONFIG = {
	draft: {
		label: 'Draft',
		desc: 'Belum dipublikasikan',
		Icon: PenLine,
		color: '#64748b',
		bg: '#f1f5f9',
		border: '#cbd5e1',
		dotColor: '#94a3b8',
		pulse: false,
	},
	published: {
		label: 'Published',
		desc: 'Pendaftaran terbuka',
		Icon: Globe,
		color: '#0369a1',
		bg: '#eff8ff',
		border: '#93c5fd',
		dotColor: '#3b82f6',
		pulse: false,
	},
	ongoing: {
		label: 'On Going',
		desc: 'Sedang berlangsung',
		Icon: Zap,
		color: '#065f46',
		bg: '#ecfdf5',
		border: '#6ee7b7',
		dotColor: '#10b981',
		pulse: true,
	},
	completed: {
		label: 'Finished',
		desc: 'Acara selesai',
		Icon: CheckCircle2,
		color: '#1e293b',
		bg: '#f8fafc',
		border: '#94a3b8',
		dotColor: '#475569',
		pulse: false,
	},
	cancelled: {
		label: 'Cancelled',
		desc: 'Dibatalkan',
		Icon: XCircle,
		color: '#991b1b',
		bg: '#fff1f2',
		border: '#fca5a5',
		dotColor: '#ef4444',
		pulse: false,
	},
};

function StatusPill({ status }) {
	const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
	const { label, desc, Icon, color, bg, border, dotColor, pulse } = cfg;

	return (
		<div style={{
			display: 'inline-flex', alignItems: 'center', gap: 8,
			padding: '5px 13px 5px 8px', borderRadius: 999,
			border: `1.5px solid ${border}`, background: bg,
		}}>
			<span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10 }}>
				{pulse && (
					<span style={{
						position: 'absolute', inset: 0, borderRadius: '50%',
						backgroundColor: dotColor, opacity: 0.4,
						animation: 'phPulse 2s ease-in-out infinite',
					}} />
				)}
				<span style={{
					width: 8, height: 8, borderRadius: '50%',
					backgroundColor: dotColor, flexShrink: 0, position: 'relative', zIndex: 1,
				}} />
			</span>
			<Icon size={13} color={color} strokeWidth={2.2} style={{ flexShrink: 0 }} />
			<span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
				<span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '-0.2px' }}>{label}</span>
				<span style={{ fontSize: 10, color, opacity: 0.65, fontWeight: 500 }}>{desc}</span>
			</span>
		</div>
	);
}

export default function PageHeader({
	title = 'Event Dashboard',
	subtitle = 'Pusat kendali untuk monitoring dan manajemen event',
	status,
	eventSlug,
	onPreview,
}) {
	return (
		<>
			<style>{`@keyframes phPulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(2.2);opacity:0} }`}</style>

			<div style={{
				display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
				flexWrap: 'wrap', gap: 12, marginBottom: 24,
			}}>
				{/* Left: Title + Status + Subtitle */}
				<div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
						<h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.4px' }}>
							{title}
						</h1>
						{status && <StatusPill status={status} />}
					</div>
					<p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>
				</div>

				{/* Right: Preview button */}
				{onPreview && (
					<button
						onClick={onPreview}
						style={{
							display: 'inline-flex', alignItems: 'center', gap: 6,
							fontSize: 12, fontWeight: 600, padding: '8px 16px',
							border: '1.5px solid #cbd5e1', borderRadius: 8,
							background: 'white', color: '#475569', cursor: 'pointer',
							transition: 'all 0.15s',
							flexShrink: 0,
						}}
						onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
						onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'white'; }}
					>
						<ExternalLink size={13} />
						Preview Event
					</button>
				)}
			</div>
		</>
	);
}
