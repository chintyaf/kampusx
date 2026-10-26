import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Target, Clock, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import { mockWeeklyGoal } from '../../data/learningMockData';

const WeeklyGoalCard = ({ data = mockWeeklyGoal }) => {
	const {
		completedModules = 3,
		targetModules = 5,
		studyHours = 6.5,
		targetHours = 10,
		progressPercent = 60,
		dailyBreakdown = [],
		weeklyMessage = '',
	} = data;

	// Grouping metric item biar gak perlu copy-paste elemen JSX
	const metrics = [
		{
			icon: CheckCircle2,
			value: `${completedModules}/${targetModules}`,
			label: 'Modules Completed',
		},
		{ icon: Clock, value: `${studyHours}h`, label: `study hours (${targetHours}h goal)` },
		{ icon: ArrowUpRight, value: `${progressPercent}%`, label: 'overall progress' },
	];

	return (
		<Card
			className="border mb-4 p-4 shadow-sm"
			style={{
				background: 'var(--card, #ffffff)',
				borderColor: 'var(--neutral-border, #dae0eb)',
				borderRadius: 'var(--radius-lg, 16px)',
				fontFamily: 'var(--font, sans-serif)',
			}}
		>
			<Card.Body className="p-0">
				{/* Top Badges */}
				<div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
					<div className="d-flex align-items-center gap-2">
						<span
							className="d-inline-flex align-items-center gap-1 rounded-pill fw-semibold"
							style={{
								background: 'var(--bahama-blue-50, #f0f9ff)',
								color: 'var(--bahama-blue-700, #0369a1)',
								border: '1px solid var(--bahama-blue-200, #bae6fd)',
								fontSize: 'var(--font-xs, 12px)',
								padding: '4px 10px',
							}}
						>
							<Target size={14} /> Weekly Learning Target
						</span>

						<span
							className="badge rounded-pill fw-semibold"
							style={{
								background: 'var(--neutral-bg, #f1f5f9)',
								color: 'var(--text, #0f172a)',
								fontSize: 'var(--font-xs, 12px)',
								padding: '5px 10px',
								border: '1px solid var(--neutral-border, #dae0eb)',
							}}
						>
							Week 4
						</span>
					</div>

					<div
						className="d-inline-flex align-items-center gap-1 rounded-pill fw-semibold"
						style={{
							background: 'var(--warning-bg, #fef3c7)',
							color: 'var(--warning-text, #92400e)',
							fontSize: 'var(--font-xs, 12px)',
							padding: '4px 10px',
						}}
					>
						<Award size={14} /> Streak Bonus Active
					</div>
				</div>

				{/* Header & Percentage */}
				<Row className="align-items-end mb-3 g-3">
					<Col md={8}>
						<h3
							className="fw-bold mb-1"
							style={{
								color: 'var(--text, #0f172a)',
								fontSize: 'var(--font-lg, 20px)',
							}}
						>
							Keep Up The Great Pace!
						</h3>
						<p
							className="mb-0"
							style={{
								color: 'var(--muted, #64748b)',
								fontSize: 'var(--font-sm, 14px)',
							}}
						>
							{weeklyMessage ||
								'You are making steady progress toward your self-regulated learning goals.'}
						</p>
					</Col>

					<Col md={4} className="text-md-end">
						<div className="d-inline-flex align-items-baseline gap-1">
							<span
								className="fw-bold"
								style={{
									color: 'var(--primary, #00699e)',
									fontSize: '2.25rem',
									lineHeight: 1,
								}}
							>
								{progressPercent}%
							</span>
							<span
								className="fw-semibold"
								style={{
									color: 'var(--muted, #64748b)',
									fontSize: 'var(--font-xs, 12px)',
								}}
							>
								progress
							</span>
						</div>
					</Col>
				</Row>

				{/* Progress Bar */}
				<div
					className="progress rounded-pill mb-4"
					style={{ height: '8px', background: 'var(--bahama-blue-100, #e0f2fe)' }}
				>
					<div
						className="progress-bar rounded-pill"
						style={{
							width: `${progressPercent}%`,
							background: 'var(--primary, #00699e)',
							transition: 'width 0.6s ease-in-out',
						}}
					/>
				</div>

				{/* Metrics Grid */}
				<Row className="g-3 mb-3">
					{metrics.map(({ icon: Icon, value, label }, idx) => (
						<Col key={idx} sm={6} md={4}>
							<div
								className="d-flex align-items-center gap-3 p-3"
								style={{
									background: 'var(--bahama-blue-50, #f0f9ff)',
									border: '1px solid var(--bahama-blue-100, #e0f2fe)',
									borderRadius: 'var(--radius, 10px)',
								}}
							>
								<div
									className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
									style={{
										width: '38px',
										height: '38px',
										background: 'var(--primary-light, #dff3ff)',
										color: 'var(--primary, #00699e)',
									}}
								>
									<Icon size={20} />
								</div>
								<div>
									<div
										className="fw-bold"
										style={{
											color: 'var(--text, #0f172a)',
											fontSize: 'var(--font-md, 16px)',
											lineHeight: 1.2,
										}}
									>
										{value}
									</div>
									<div
										style={{
											fontSize: 'var(--font-xs, 12px)',
											color: 'var(--muted, #64748b)',
											fontWeight: 500,
										}}
									>
										{label}
									</div>
								</div>
							</div>
						</Col>
					))}
				</Row>

				{/* Daily Streak */}
				{dailyBreakdown.length > 0 && (
					<div
						className="pt-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2"
						style={{ borderColor: 'var(--neutral-border, #dae0eb)' }}
					>
						<span
							className="fw-medium"
							style={{
								fontSize: 'var(--font-xs, 12px)',
								color: 'var(--muted, #64748b)',
							}}
						>
							Daily Streak Tracking:
						</span>
						<div className="d-flex align-items-center gap-2">
							{dailyBreakdown.map((item, idx) => (
								<div
									key={idx}
									className="d-flex align-items-center justify-content-center rounded-circle"
									style={{
										width: '30px',
										height: '30px',
										fontSize: 'var(--font-xs, 12px)',
										fontWeight: 600,
										background: item.completed
											? 'var(--primary, #00699e)'
											: 'var(--neutral-bg, #f1f5f9)',
										color: item.completed ? '#ffffff' : 'var(--muted, #64748b)',
										border: item.completed
											? 'none'
											: '1px dashed var(--neutral-border, #dae0eb)',
									}}
									title={`${item.day}: ${item.completed ? `${item.hours}h studied` : 'Not yet'}`}
								>
									{item.day[0]}
								</div>
							))}
						</div>
					</div>
				)}
			</Card.Body>
		</Card>
	);
};

export default WeeklyGoalCard;
