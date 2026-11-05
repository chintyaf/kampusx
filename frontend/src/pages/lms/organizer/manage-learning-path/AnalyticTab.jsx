import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ArrowRight } from 'lucide-react';

const T = {
	card: 'var(--card, #ffffff)',
	neutral: 'var(--neutral-text, #64748b)',
	border: 'var(--neutral-border, #e2e8f0)',
	primary: 'var(--color-primary, #006699)',
	primaryTint: 'var(--bahama-blue-100, #d9edf7)',
	white: 'var(--color-white, #ffffff)',
	fsm: 'var(--font-sm, 14px)',
	fmd: 'var(--font-md, 16px)',
	rMd: 'var(--radius-md, 10px)',
	rLg: 'var(--radius-lg, 14px)',
};

// props:
//   id     : learningId
//   routes : objek ROUTES dari ManageLearningPathPage
const AnalyticTab = ({ id, routes }) => {
	const navigate = useNavigate();
	const [hover, setHover] = useState(false);

	return (
		<div
			style={{
				background: T.card,
				border: `1px solid ${T.border}`,
				borderRadius: T.rLg,
				padding: '48px 24px',
				textAlign: 'center',
			}}
		>
			<div
				style={{
					width: 48,
					height: 48,
					margin: '0 auto 16px',
					borderRadius: T.rMd,
					background: T.primaryTint,
					color: T.primary,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<BarChart2 size={24} />
			</div>
			<h2 style={{ margin: '0 0 6px', fontSize: T.fmd, fontWeight: 700 }}>
				Analytics & Students
			</h2>
			<p
				style={{
					margin: '0 auto 20px',
					maxWidth: 460,
					fontSize: T.fsm,
					color: T.neutral,
					lineHeight: 1.5,
				}}
			>
				Pantau aktivitas belajar, kemajuan, dan hasil evaluasi peserta.
			</p>
			<button
				type="button"
				onClick={() => navigate(routes.analytics(id))}
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 8,
					padding: '9px 18px',
					backgroundColor: T.primary,
					color: T.white,
					border: 'none',
					borderRadius: T.rMd,
					fontSize: T.fsm,
					fontWeight: 600,
					fontFamily: 'inherit',
					cursor: 'pointer',
					filter: hover ? 'brightness(0.92)' : 'none',
					transition: 'filter .15s',
				}}
			>
				Buka Analitik Peserta <ArrowRight size={16} />
			</button>
		</div>
	);
};

export default AnalyticTab;
