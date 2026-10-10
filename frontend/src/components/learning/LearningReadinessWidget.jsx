import React from 'react';
import { Card } from 'react-bootstrap';
import { Sparkles, Target, Zap, RotateCcw, Clock } from 'lucide-react';
import { mockLearningReadiness } from '../../data/learningMockData';

/**
 * LearningReadinessWidget
 * Fully synchronized with custom :root design tokens
 */
const LearningReadinessWidget = ({ readiness = mockLearningReadiness }) => {
	const {
		score = 78,
		statusLabel = 'Ready to Advance',
		badgeText = 'High SRL Readiness',
		description = 'You demonstrate strong self-regulation habits and consistent focus during microlearning intervals.',
		subDimensions = [],
	} = readiness;

	// SVG Radial Gauge Calculations
	const radius = 54;
	const circumference = 2 * Math.PI * radius; // ≈ 339.29
	const strokeDashoffset = circumference - (score / 100) * circumference;

	const getDimensionIcon = (iconName) => {
		const iconProps = { size: 14 };
		switch (iconName) {
			case 'Target':
				return <Target {...iconProps} style={{ color: 'var(--primary)' }} />;
			case 'Zap':
				return <Zap {...iconProps} style={{ color: 'var(--bahama-blue-600)' }} />;
			case 'RotateCcw':
				return <RotateCcw {...iconProps} style={{ color: 'var(--success-text)' }} />;
			case 'Clock':
				return <Clock {...iconProps} style={{ color: 'var(--warning-text)' }} />;
			default:
				return <Sparkles {...iconProps} style={{ color: 'var(--primary)' }} />;
		}
	};

	return (
		<Card
			className="border-0 shadow-sm p-3 p-md-4 mb-4"
			style={{
				borderRadius: 'var(--radius-lg)',
				backgroundColor: 'var(--card)',
				border: '1px solid var(--neutral-border)',
				fontFamily: 'var(--font)',
			}}
		>
			{/* 1. Header Widget */}
			<div className="d-flex align-items-center justify-content-between mb-3">
				<div className="d-flex align-items-center gap-2">
					<div
						className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
						style={{
							width: '34px',
							height: '34px',
							backgroundColor: 'var(--primary-light)',
							color: 'var(--primary)',
						}}
					>
						<Sparkles size={16} />
					</div>
					<div>
						<h6
							className="fw-bold mb-0"
							style={{
								fontSize: 'var(--font-md)',
								color: 'var(--text)',
								lineHeight: 1.2,
							}}
						>
							Learning Readiness
						</h6>
						<span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
							SRL Diagnostic Index
						</span>
					</div>
				</div>

				<span
					className="badge fw-semibold px-2.5 py-1"
					style={{
						fontSize: 'var(--font-xs)',
						backgroundColor: 'var(--success-bg)',
						color: 'var(--success-text)',
						border: '1px solid var(--success-border-color)',
						borderRadius: 'var(--radius-full)',
					}}
				>
					• {badgeText}
				</span>
			</div>

			{/* 2. SVG Circular Radial Gauge */}
			<div className="text-center my-3">
				<div
					className="position-relative mx-auto"
					style={{ width: '150px', height: '150px' }}
				>
					<svg
						viewBox="0 0 140 140"
						style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
					>
						<defs>
							<linearGradient
								id="readinessGradient"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="100%"
							>
								<stop offset="0%" stopColor="var(--bahama-blue-300)" />
								<stop offset="50%" stopColor="var(--primary)" />
								<stop offset="100%" stopColor="var(--success-text)" />
							</linearGradient>
						</defs>

						{/* Background Track */}
						<circle
							cx="70"
							cy="70"
							r={radius}
							fill="none"
							stroke="var(--neutral-bg)"
							strokeWidth="10"
						/>

						{/* Gradient Progress Arc */}
						<circle
							cx="70"
							cy="70"
							r={radius}
							fill="none"
							stroke="url(#readinessGradient)"
							strokeWidth="10"
							strokeDasharray={circumference}
							strokeDashoffset={strokeDashoffset}
							strokeLinecap="round"
							style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
						/>
					</svg>

					{/* Center Score Display */}
					<div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center">
						<span
							style={{
								fontSize: 'var(--font-xl)',
								fontWeight: '800',
								lineHeight: 1,
								color: 'var(--text)',
							}}
						>
							{score}
						</span>
						<span
							style={{
								fontSize: '10px',
								fontWeight: '700',
								color: 'var(--success-text)',
								letterSpacing: '0.04em',
								marginTop: '4px',
								textAlign: 'center',
								maxWidth: '85px',
								lineHeight: 1.1,
							}}
						>
							{statusLabel.toUpperCase()}
						</span>
					</div>
				</div>
			</div>

			{/* 3. Description text */}
			<p
				className="text-center px-2 mb-4"
				style={{
					fontSize: 'var(--font-xs)',
					lineHeight: '1.45',
					color: 'var(--text-muted)',
				}}
			>
				{description}
			</p>

			{/* 4. Sub-Skill Competency Breakdown */}
			{subDimensions.length > 0 && (
				<div className="pt-3" style={{ borderTop: '1px solid var(--neutral-border)' }}>
					<div
						className="fw-bold mb-3 text-uppercase"
						style={{
							fontSize: '11px',
							letterSpacing: '0.06em',
							color: 'var(--text-muted)',
						}}
					>
						Sub-Skill Competency Breakdown
					</div>

					<div className="d-flex flex-column gap-3">
						{subDimensions.map((item, index) => (
							<div key={index}>
								<div className="d-flex align-items-center justify-content-between mb-1">
									<span
										className="d-flex align-items-center gap-2 fw-medium"
										style={{ fontSize: 'var(--font-xs)', color: 'var(--text)' }}
									>
										{getDimensionIcon(item.icon)}
										<span>{item.name}</span>
									</span>
									<span
										className="fw-bold"
										style={{ fontSize: 'var(--font-xs)', color: 'var(--text)' }}
									>
										{item.score}%
									</span>
								</div>

								{/* Progress bar track */}
								<div
									className="w-100 overflow-hidden"
									style={{
										height: '6px',
										backgroundColor: 'var(--neutral-bg)',
										borderRadius: 'var(--radius-full)',
									}}
								>
									<div
										className="h-100"
										style={{
											width: `${item.score}%`,
											backgroundColor: item.color || 'var(--primary)',
											borderRadius: 'var(--radius-full)',
											transition: 'width 0.5s ease-in-out',
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</Card>
	);
};

export default LearningReadinessWidget;
