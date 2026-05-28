import React from 'react';
import { Activity, Check, Clock, Flame, Flag } from 'lucide-react';

/**
 * EventTimeline — redesigned with a horizontal stepper style.
 * Props:
 *   steps {Array<{label, date, status: 'done'|'active'|'pending'}>}
 */

const defaultSteps = [
	{ label: 'Draft', date: 'Dibuat', status: 'done' },
	{ label: 'Published', date: '1 Jun 2025', status: 'done' },
	{ label: 'Registrasi', date: 'Berlangsung', status: 'active' },
	{ label: 'Hari-H', date: '20 Jul 2025', status: 'pending' },
	{ label: 'Selesai', date: '21 Jul 2025', status: 'pending' },
];

const DOT_SIZE = 28;

function StepIcon({ status, isLast }) {
	if (status === 'done') {
		return (
			<div style={{
				width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
				background: 'var(--primary)', border: '2.5px solid var(--primary)',
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				flexShrink: 0, zIndex: 1, position: 'relative',
				boxShadow: '0 0 0 3px rgba(0,105,158,0.12)',
			}}>
				<Check size={13} color="#fff" strokeWidth={3} />
			</div>
		);
	}
	if (status === 'active') {
		return (
			<>
				<style>{`@keyframes tlPulse { 0%,100%{transform:scale(1);opacity:0.35} 50%{transform:scale(1.8);opacity:0} }`}</style>
				<div style={{ position: 'relative', zIndex: 1 }}>
					{/* outer pulse ring */}
					<div style={{
						position: 'absolute', inset: -4, borderRadius: '50%',
						background: 'var(--primary)', opacity: 0.35,
						animation: 'tlPulse 2s ease-in-out infinite',
					}} />
					<div style={{
						width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
						background: '#fff', border: '2.5px solid var(--primary)',
						display: 'flex', alignItems: 'center', justifyContent: 'center',
						position: 'relative',
					}}>
						<div style={{
							width: 10, height: 10, borderRadius: '50%',
							background: 'var(--primary)',
						}} />
					</div>
				</div>
			</>
		);
	}
	// pending
	return (
		<div style={{
			width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
			background: '#f1f5f9', border: '2px solid #e2e8f0',
			display: 'flex', alignItems: 'center', justifyContent: 'center',
			flexShrink: 0, zIndex: 1, position: 'relative',
		}}>
			<div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />
		</div>
	);
}

export default function EventTimeline({ steps = defaultSteps }) {
	return (
		<div className="card mb-4" style={{ padding: 0, overflow: 'hidden' }}>
			{/* Card Header */}
			<div style={{
				display: 'flex', alignItems: 'center', gap: 7,
				padding: '14px 20px', borderBottom: '1px solid var(--border)',
				fontSize: 13, fontWeight: 600, color: 'var(--text)',
			}}>
				<Activity size={15} color="var(--primary)" />
				Timeline Event
			</div>

			{/* Stepper */}
			<div style={{ padding: '24px 28px 20px', overflowX: 'auto' }}>
				<div style={{ display: 'flex', alignItems: 'flex-start', minWidth: `${steps.length * 100}px` }}>
					{steps.map((step, i) => {
						const isLast = i === steps.length - 1;
						const isDone = step.status === 'done';
						const isActive = step.status === 'active';

						return (
							<div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
								{/* Connector line (except last step) */}
								{!isLast && (
									<div style={{
										position: 'absolute',
										top: DOT_SIZE / 2,
										left: '50%',
										right: '-50%',
										height: 2,
										zIndex: 0,
										background: isDone
											? 'linear-gradient(90deg, var(--primary), var(--primary))'
											: '#e2e8f0',
									}} />
								)}

								<StepIcon status={step.status} isLast={isLast} />

								{/* Label */}
								<div style={{
									marginTop: 10, textAlign: 'center',
									fontSize: 12, fontWeight: isActive ? 700 : 600,
									color: step.status === 'pending' ? '#94a3b8' : 'var(--text)',
								}}>
									{step.label}
								</div>

								{/* Date */}
								<div style={{
									marginTop: 2, textAlign: 'center',
									fontSize: 11, fontWeight: isActive ? 600 : 400,
									color: isActive ? 'var(--primary)' : '#94a3b8',
								}}>
									{step.date}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
