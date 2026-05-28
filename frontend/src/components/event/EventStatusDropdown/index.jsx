import React, { useState, useEffect } from 'react';
import {
	PenLine, Globe, Zap, CheckCircle2, XCircle,
} from 'lucide-react';
import StatusConfirmationModal from './StatusConfirmationModal';
import api from '../../../api/axios';

// ─── Status Config (read-only display) ─────────────────────────────────────────

const STATUS_CONFIG = {
	loading: {
		label: 'Memuat...',
		Icon: PenLine,
		color: '#94a3b8', bg: '#f1f5f9', border: '#e2e8f0', dot: '#94a3b8',
	},
	draft: {
		label: 'Draft',
		Icon: PenLine,
		color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', dot: '#94a3b8',
	},
	published: {
		label: 'Published',
		Icon: Globe,
		color: '#0369a1', bg: '#eff8ff', border: '#93c5fd', dot: '#3b82f6',
	},
	ongoing: {
		label: 'On Going',
		Icon: Zap,
		color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', dot: '#10b981',
	},
	completed: {
		label: 'Finished',
		Icon: CheckCircle2,
		color: '#1e293b', bg: '#f8fafc', border: '#94a3b8', dot: '#475569',
	},
	cancelled: {
		label: 'Cancelled',
		Icon: XCircle,
		color: '#991b1b', bg: '#fff1f2', border: '#fca5a5', dot: '#ef4444',
	},
};

// ─── EventStatusBadge (replaces dropdown) ─────────────────────────────────────

const EventStatusDropdown = ({ eventId, isInsideEvent }) => {
	const [status, setStatus] = useState('loading');
	const [showPublishModal, setShowPublishModal] = useState(false);

	useEffect(() => {
		if (!eventId) return;
		setStatus('loading');
		api.get(`/events/${eventId}/status`)
			.then(res => {
				if (res.data?.status === 'success') {
					setStatus(res.data.data.status);
				}
			})
			.catch(() => setStatus('draft'));
	}, [eventId]);

	if (!eventId || !isInsideEvent) return null;

	const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
	const isDraft = status === 'draft';
	const pulse = status === 'ongoing';

	return (
		<>
			<style>{`@keyframes sdPulse{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.9);opacity:0}}`}</style>

			{/* Status badge — read-only pill */}
			<div style={{
				display: 'inline-flex', alignItems: 'center', gap: 8,
				padding: '6px 13px 6px 9px',
				borderRadius: 999,
				border: `1.5px solid ${cfg.border}`,
				background: cfg.bg,
				userSelect: 'none',
				cursor: 'default',
			}}>
				{/* dot */}
				<span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10 }}>
					{pulse && (
						<span style={{
							position: 'absolute', inset: 0, borderRadius: '50%',
							background: cfg.dot, opacity: 0.35,
							animation: 'sdPulse 2s ease-in-out infinite',
						}} />
					)}
					<span style={{
						width: 8, height: 8, borderRadius: '50%',
						background: cfg.dot, position: 'relative', zIndex: 1,
					}} />
				</span>

				<cfg.Icon size={13} color={cfg.color} strokeWidth={2.2} />

				<span style={{
					fontSize: 12, fontWeight: 700, color: cfg.color, letterSpacing: '-0.2px',
				}}>
					{cfg.label}
				</span>

				{/* Publish CTA — only in draft */}
				{isDraft && (
					<>
						<div style={{ width: 1, height: 14, background: cfg.border, margin: '0 2px' }} />
						<button
							onClick={() => setShowPublishModal(true)}
							style={{
								display: 'inline-flex', alignItems: 'center', gap: 4,
								fontSize: 11, fontWeight: 700,
								color: 'white', background: 'var(--primary)',
								border: 'none', borderRadius: 6,
								padding: '3px 9px', cursor: 'pointer',
								transition: 'all 0.15s',
							}}
							onMouseEnter={e => e.currentTarget.style.background = '#005580'}
							onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
						>
							Publish →
						</button>
					</>
				)}
			</div>

			{/* Publish Modal — reuses existing flow */}
			<StatusConfirmationModal
				eventId={eventId}
				show={showPublishModal}
				onHide={() => setShowPublishModal(false)}
				pendingStatus="published"
				onConfirm={() => {
					setStatus('published');
					setShowPublishModal(false);
				}}
			/>
		</>
	);
};

export default EventStatusDropdown;
